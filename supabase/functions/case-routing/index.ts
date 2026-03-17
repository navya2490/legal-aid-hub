import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LawyerCandidate {
  lawyer_id: string;
  user_id: string;
  specializations: string[];
  years_of_experience: number;
  current_caseload: number;
  max_caseload: number;
  is_available: boolean;
  score: number;
}

function scoreLawyer(
  lawyer: Omit<LawyerCandidate, "score">,
  urgencyLevel: string
): number {
  // Base: workload balance (0-50 points). Lower caseload ratio = higher score
  const loadRatio = lawyer.current_caseload / lawyer.max_caseload;
  let score = (1 - loadRatio) * 50;

  // Experience bonus (0-30 points)
  score += Math.min(lawyer.years_of_experience, 30);

  // Urgency bonus: for High/Critical, heavily weight lower caseload
  if (urgencyLevel === "High" || urgencyLevel === "Critical") {
    score += (1 - loadRatio) * 20;
  }

  return Math.round(score * 100) / 100;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const body = await req.json().catch(() => ({}));
    const { action, case_id, lawyer_id, admin_id, reason } = body;

    // Admin manual assignment
    if (action === "admin_assign") {
      return await handleAdminAssign(
        supabase,
        case_id,
        lawyer_id,
        admin_id,
        reason
      );
    }

    // Lawyer decline
    if (action === "decline") {
      return await handleDecline(supabase, case_id, lawyer_id);
    }

    // Auto-route: process all unassigned submitted cases
    return await handleAutoRoute(supabase, case_id);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Routing error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleAutoRoute(supabase: any, specificCaseId?: string) {
  // Get unassigned cases
  let query = supabase
    .from("cases")
    .select("*")
    .is("assigned_lawyer_id", null)
    .in("status", ["Submitted", "Under Review"]);

  if (specificCaseId) {
    query = query.eq("case_id", specificCaseId);
  }

  const { data: cases, error: casesError } = await query;
  if (casesError) throw casesError;
  if (!cases || cases.length === 0) {
    return new Response(
      JSON.stringify({ message: "No cases to route", routed: 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const results: any[] = [];

  for (const caseItem of cases) {
    // Check if already escalated (3+ declines)
    if (caseItem.decline_count >= 3) {
      await logRouting(supabase, caseItem.case_id, "escalated", null, null, null, "3+ declines, escalated to admin");
      results.push({ case_id: caseItem.case_id, status: "escalated" });
      continue;
    }

    // Find eligible lawyers
    const { data: lawyers, error: lawyersError } = await supabase
      .from("lawyer_profiles")
      .select("lawyer_id, user_id, specializations, years_of_experience, current_caseload, max_caseload, is_available")
      .eq("is_available", true)
      .contains("specializations", [caseItem.issue_category]);

    if (lawyersError) throw lawyersError;

    // Filter: caseload < max, active user, not declined
    const declinedIds = caseItem.declined_lawyer_ids || [];
    const eligible = (lawyers || []).filter(
      (l: any) =>
        l.current_caseload < l.max_caseload &&
        !declinedIds.includes(l.lawyer_id)
    );

    // Check active status for each lawyer
    const activeEligible: LawyerCandidate[] = [];
    for (const lawyer of eligible) {
      const { data: userRec } = await supabase
        .from("users")
        .select("is_active")
        .eq("user_id", lawyer.user_id)
        .maybeSingle();

      if (userRec?.is_active) {
        activeEligible.push({
          ...lawyer,
          score: scoreLawyer(lawyer, caseItem.urgency_level),
        });
      }
    }

    if (activeEligible.length === 0) {
      // No eligible lawyers
      await logRouting(supabase, caseItem.case_id, "no_match", null, null, null, "No eligible lawyers found");
      results.push({ case_id: caseItem.case_id, status: "no_match" });
      continue;
    }

    // Sort by score descending
    activeEligible.sort((a, b) => b.score - a.score);
    const topLawyer = activeEligible[0];

    // Assign case
    const { error: updateError } = await supabase
      .from("cases")
      .update({
        assigned_lawyer_id: topLawyer.lawyer_id,
        assigned_at: new Date().toISOString(),
        status: "Assigned",
        routing_attempts: (caseItem.routing_attempts || 0) + 1,
      })
      .eq("case_id", caseItem.case_id);

    if (updateError) throw updateError;

    // Increment lawyer caseload
    await supabase
      .from("lawyer_profiles")
      .update({ current_caseload: topLawyer.current_caseload + 1 })
      .eq("lawyer_id", topLawyer.lawyer_id);

    await logRouting(
      supabase,
      caseItem.case_id,
      "auto_assigned",
      topLawyer.lawyer_id,
      null,
      topLawyer.score,
      `Matched: ${caseItem.issue_category}, score: ${topLawyer.score}`
    );

    results.push({
      case_id: caseItem.case_id,
      status: "assigned",
      lawyer_id: topLawyer.lawyer_id,
      score: topLawyer.score,
    });
  }

  return new Response(
    JSON.stringify({ message: "Routing complete", results }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleDecline(
  supabase: any,
  caseId: string,
  lawyerId: string
) {
  // Get case and lawyer info
  const { data: caseItem, error: caseErr } = await supabase
    .from("cases")
    .select("*")
    .eq("case_id", caseId)
    .single();
  if (caseErr) throw caseErr;

  // Get lawyer profile
  const { data: lawyer, error: lawyerErr } = await supabase
    .from("lawyer_profiles")
    .select("*")
    .eq("lawyer_id", lawyerId)
    .single();
  if (lawyerErr) throw lawyerErr;

  // Decrement caseload
  await supabase
    .from("lawyer_profiles")
    .update({
      current_caseload: Math.max(0, lawyer.current_caseload - 1),
    })
    .eq("lawyer_id", lawyerId);

  // Update case: remove assignment, add to declined list
  const declinedIds = [...(caseItem.declined_lawyer_ids || []), lawyerId];
  const newDeclineCount = (caseItem.decline_count || 0) + 1;

  const updateData: any = {
    assigned_lawyer_id: null,
    assigned_at: null,
    declined_lawyer_ids: declinedIds,
    decline_count: newDeclineCount,
    status: newDeclineCount >= 3 ? "Under Review" : "Submitted",
  };

  await supabase.from("cases").update(updateData).eq("case_id", caseId);

  await logRouting(supabase, caseId, "declined", lawyerId, null, null, "Lawyer declined assignment");

  if (newDeclineCount >= 3) {
    await logRouting(supabase, caseId, "escalated", null, null, null, "3 declines reached, escalated to admin");
    return new Response(
      JSON.stringify({ status: "escalated", decline_count: newDeclineCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Re-run routing for this case
  return await handleAutoRoute(supabase, caseId);
}

async function handleAdminAssign(
  supabase: any,
  caseId: string,
  lawyerId: string,
  adminId: string,
  reason: string
) {
  // Get current assignment to handle caseload
  const { data: caseItem, error: caseErr } = await supabase
    .from("cases")
    .select("assigned_lawyer_id")
    .eq("case_id", caseId)
    .single();
  if (caseErr) throw caseErr;

  // Decrement old lawyer caseload if reassigning
  if (caseItem.assigned_lawyer_id) {
    const { data: oldLawyer } = await supabase
      .from("lawyer_profiles")
      .select("current_caseload")
      .eq("lawyer_id", caseItem.assigned_lawyer_id)
      .single();

    if (oldLawyer) {
      await supabase
        .from("lawyer_profiles")
        .update({
          current_caseload: Math.max(0, oldLawyer.current_caseload - 1),
        })
        .eq("lawyer_id", caseItem.assigned_lawyer_id);
    }
  }

  // Increment new lawyer caseload
  const { data: newLawyer } = await supabase
    .from("lawyer_profiles")
    .select("current_caseload")
    .eq("lawyer_id", lawyerId)
    .single();

  if (newLawyer) {
    await supabase
      .from("lawyer_profiles")
      .update({ current_caseload: newLawyer.current_caseload + 1 })
      .eq("lawyer_id", lawyerId);
  }

  // Update case
  await supabase
    .from("cases")
    .update({
      assigned_lawyer_id: lawyerId,
      assigned_at: new Date().toISOString(),
      status: "Assigned",
    })
    .eq("case_id", caseId);

  const actionType = caseItem.assigned_lawyer_id
    ? "admin_reassigned"
    : "admin_assigned";
  await logRouting(supabase, caseId, actionType, lawyerId, adminId, null, reason || "Admin manual assignment");

  return new Response(
    JSON.stringify({ status: "assigned", action: actionType }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function logRouting(
  supabase: any,
  caseId: string,
  action: string,
  lawyerId: string | null,
  adminId: string | null,
  score: number | null,
  reason: string | null
) {
  await supabase.from("case_routing_log").insert({
    case_id: caseId,
    action,
    lawyer_id: lawyerId,
    admin_id: adminId,
    score,
    reason,
  });
}

import { supabase } from "@/integrations/supabase/client";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/case-routing`;

async function callRouting(body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Routing request failed");
  }

  return response.json();
}

export async function adminAssignCase(
  caseId: string,
  lawyerId: string,
  adminId: string,
  reason: string
) {
  return callRouting({
    action: "admin_assign",
    case_id: caseId,
    lawyer_id: lawyerId,
    admin_id: adminId,
    reason,
  });
}

export async function lawyerDeclineCase(caseId: string, lawyerId: string) {
  return callRouting({
    action: "decline",
    case_id: caseId,
    lawyer_id: lawyerId,
  });
}

export async function triggerAutoRoute(caseId?: string) {
  return callRouting({ case_id: caseId });
}

export async function fetchRoutingLog(caseId: string) {
  const { data, error } = await supabase
    .from("case_routing_log" as any)
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

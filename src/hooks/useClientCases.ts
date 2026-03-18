import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { CaseItem } from "@/components/dashboard/CaseCard";

export function useClientCases() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-cases", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CaseItem[]> => {
      // Fetch cases
      const { data: cases, error } = await supabase
        .from("cases")
        .select("case_id, case_reference_number, issue_category, status, urgency_level, submitted_at, updated_at, assigned_lawyer_id")
        .eq("user_id", user!.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      if (!cases || cases.length === 0) return [];

      // Gather assigned lawyer IDs
      const lawyerIds = [...new Set(cases.map((c) => c.assigned_lawyer_id).filter(Boolean))] as string[];

      let lawyerNameMap: Record<string, string> = {};

      if (lawyerIds.length > 0) {
        // Get user_ids from lawyer_profiles
        const { data: lawyerProfiles } = await supabase
          .from("lawyer_profiles")
          .select("lawyer_id, user_id")
          .in("lawyer_id", lawyerIds);

        if (lawyerProfiles && lawyerProfiles.length > 0) {
          const userIds = lawyerProfiles.map((lp) => lp.user_id);
          const { data: users } = await supabase
            .from("users")
            .select("user_id, full_name")
            .in("user_id", userIds);

          if (users) {
            const userIdToName = Object.fromEntries(users.map((u) => [u.user_id, u.full_name]));
            lawyerProfiles.forEach((lp) => {
              lawyerNameMap[lp.lawyer_id] = userIdToName[lp.user_id] || "Unknown";
            });
          }
        }
      }

      return cases.map((c) => ({
        case_id: c.case_id,
        case_reference_number: c.case_reference_number,
        issue_category: c.issue_category,
        status: c.status,
        urgency_level: c.urgency_level,
        submitted_at: c.submitted_at,
        updated_at: c.updated_at,
        assigned_lawyer_name: c.assigned_lawyer_id ? (lawyerNameMap[c.assigned_lawyer_id] || null) : null,
      }));
    },
  });
}

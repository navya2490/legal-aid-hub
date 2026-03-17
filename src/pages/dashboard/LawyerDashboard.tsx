import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, Briefcase, MessageSquare, LogOut, Users, XCircle, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lawyerDeclineCase } from "@/lib/caseRouting";
import { toast } from "sonner";

interface AssignedCase {
  case_id: string;
  case_reference_number: string;
  issue_category: string;
  urgency_level: string;
  status: string;
  submitted_at: string;
  issue_description: string;
}

const LawyerDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [cases, setCases] = useState<AssignedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [lawyerId, setLawyerId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Get lawyer profile
    const { data: profile } = await supabase
      .from("lawyer_profiles")
      .select("lawyer_id, current_caseload, max_caseload")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      setLawyerId(profile.lawyer_id);

      // Get assigned cases
      const { data: assignedCases } = await supabase
        .from("cases")
        .select("case_id, case_reference_number, issue_category, urgency_level, status, submitted_at, issue_description")
        .eq("assigned_lawyer_id", profile.lawyer_id)
        .order("submitted_at", { ascending: false });

      setCases((assignedCases || []) as AssignedCase[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDecline = async (caseId: string) => {
    if (!lawyerId) return;
    setDecliningId(caseId);
    try {
      await lawyerDeclineCase(caseId, lawyerId);
      toast.success("Case declined. It will be reassigned to another lawyer.");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to decline");
    } finally {
      setDecliningId(null);
    }
  };

  const urgencyColor: Record<string, string> = {
    Low: "secondary",
    Medium: "default",
    High: "destructive",
    Critical: "destructive",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">LegalConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-accent px-3 py-1">
              <Briefcase className="h-3 w-3 text-accent-foreground" />
              <span className="text-xs font-medium text-accent-foreground">Lawyer</span>
            </div>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assigned Cases</h1>
            <p className="text-muted-foreground text-sm">Review and manage your assigned cases.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium text-foreground mb-1">No assigned cases</p>
            <p className="text-sm text-muted-foreground">Cases will appear here once they're assigned to you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map(c => (
              <div key={c.case_id} className="rounded-xl border border-border bg-card p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-mono text-sm font-medium text-foreground">{c.case_reference_number}</span>
                      <Badge variant={urgencyColor[c.urgency_level] as any}>{c.urgency_level}</Badge>
                      <Badge variant="secondary">{c.status}</Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{c.issue_category}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{c.issue_description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted {new Date(c.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  {c.status === "Assigned" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/5"
                      disabled={decliningId === c.case_id}
                      onClick={() => handleDecline(c.case_id)}
                    >
                      {decliningId === c.case_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" /> Decline
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LawyerDashboard;

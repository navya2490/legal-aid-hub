import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, Shield, Users, BarChart3, LogOut, Gavel, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminCaseAssignDialog from "@/components/admin/AdminCaseAssignDialog";
import RoutingLogDialog from "@/components/admin/RoutingLogDialog";

interface CaseRow {
  case_id: string;
  case_reference_number: string;
  issue_category: string;
  urgency_level: string;
  status: string;
  submitted_at: string;
  assigned_lawyer_id: string | null;
  decline_count: number;
}

const statusBadge: Record<string, string> = {
  Submitted: "secondary",
  "Under Review": "default",
  Assigned: "default",
  "In Progress": "default",
  "Awaiting Client": "secondary",
  Resolved: "outline",
  Closed: "outline",
};

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogCase, setAssignDialogCase] = useState<CaseRow | null>(null);
  const [routingLogCase, setRoutingLogCase] = useState<string | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cases")
      .select("case_id, case_reference_number, issue_category, urgency_level, status, submitted_at, assigned_lawyer_id, decline_count")
      .order("submitted_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error("Failed to load cases");
    } else {
      setCases((data || []) as CaseRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

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
            <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1">
              <Shield className="h-3 w-3 text-destructive" />
              <span className="text-xs font-medium text-destructive">Admin</span>
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
            <h1 className="text-2xl font-bold text-foreground">Case Management</h1>
            <p className="text-muted-foreground text-sm">Review, route, and manage all cases.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCases} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Cases", value: cases.length, icon: BarChart3 },
            { label: "Unassigned", value: cases.filter(c => !c.assigned_lawyer_id).length, icon: Gavel },
            { label: "Escalated", value: cases.filter(c => c.decline_count >= 3).length, icon: Shield },
            { label: "Assigned", value: cases.filter(c => c.assigned_lawyer_id).length, icon: Users },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Cases table */}
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Reference</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Urgency</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Declines</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No cases yet</td>
                </tr>
              ) : (
                cases.map(c => (
                  <tr key={c.case_id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="p-3 font-mono text-xs text-foreground">{c.case_reference_number}</td>
                    <td className="p-3 text-foreground hidden md:table-cell">{c.issue_category}</td>
                    <td className="p-3">
                      <Badge variant={statusBadge[c.status] as any || "secondary"}>{c.status}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={urgencyColor[c.urgency_level] as any || "secondary"}>{c.urgency_level}</Badge>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      {c.decline_count > 0 && (
                        <Badge variant="destructive" className="text-xs">{c.decline_count}</Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setRoutingLogCase(c.case_id)}>
                          Log
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setAssignDialogCase(c)}>
                          <Gavel className="h-3 w-3 mr-1" /> Assign
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {assignDialogCase && (
        <AdminCaseAssignDialog
          caseItem={assignDialogCase}
          adminId={user?.id || ""}
          onClose={() => setAssignDialogCase(null)}
          onAssigned={fetchCases}
        />
      )}

      {routingLogCase && (
        <RoutingLogDialog
          caseId={routingLogCase}
          onClose={() => setRoutingLogCase(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Shield, LogOut, RefreshCw, Briefcase, Users, BarChart3, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminCaseManagement from "@/components/admin/AdminCaseManagement";
import AdminLawyerManagement from "@/components/admin/AdminLawyerManagement";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminReviewQueue from "@/components/admin/AdminReviewQueue";

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

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cases")
      .select("case_id, case_reference_number, issue_category, urgency_level, status, submitted_at, assigned_lawyer_id, decline_count")
      .order("submitted_at", { ascending: false });

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

  const reviewCount = cases.filter((c) => !c.assigned_lawyer_id || c.decline_count >= 3).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">LegalConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5">
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

      <main className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage cases, lawyers, and monitor performance.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCases} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="cases" className="gap-1.5 text-xs sm:text-sm">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cases</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="gap-1.5 text-xs sm:text-sm relative">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Review</span>
              {reviewCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {reviewCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="lawyers" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lawyers</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases">
            <AdminCaseManagement
              cases={cases}
              loading={loading}
              adminId={user?.id || ""}
              onRefresh={fetchCases}
            />
          </TabsContent>

          <TabsContent value="review">
            <AdminReviewQueue
              cases={cases}
              loading={loading}
              adminId={user?.id || ""}
              onRefresh={fetchCases}
            />
          </TabsContent>

          <TabsContent value="lawyers">
            <AdminLawyerManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics cases={cases} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;

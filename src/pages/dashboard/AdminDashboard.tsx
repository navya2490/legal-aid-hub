import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminSidebar, { type AdminView } from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AdminDashboardHome from "@/components/admin/AdminDashboardHome";
import AdminCaseManagement from "@/components/admin/AdminCaseManagement";
import AdminLawyerManagement from "@/components/admin/AdminLawyerManagement";
import AdminUsersManagement from "@/components/admin/AdminUsersManagement";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminReviewQueue from "@/components/admin/AdminReviewQueue";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";
import AdminSystemSettings from "@/components/admin/AdminSystemSettings";
import AdminReports from "@/components/admin/AdminReports";

interface CaseRow {
  case_id: string;
  case_reference_number: string;
  issue_category: string;
  urgency_level: string;
  status: string;
  submitted_at: string;
  assigned_lawyer_id: string | null;
  decline_count: number;
  updated_at: string;
  resolved_at: string | null;
}

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [employeeId] = useState("EMP-00001");

  const fetchCases = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cases")
      .select("case_id, case_reference_number, issue_category, urgency_level, status, submitted_at, assigned_lawyer_id, decline_count, updated_at, resolved_at")
      .order("submitted_at", { ascending: false });

    if (error) {
      toast.error("Failed to load cases");
    } else {
      setCases((data || []) as CaseRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCases();

    // Fetch admin name
    if (user?.id) {
      supabase
        .from("users")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.full_name) setUserName(data.full_name);
        });
    }

    const channel = supabase
      .channel("admin-cases-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "cases" }, () => fetchCases())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchCases, user?.id]);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <AdminDashboardHome
            userName={userName}
            employeeId={employeeId}
            cases={cases}
            onNavigate={setActiveView}
          />
        );
      case "cases":
        return (
          <AdminCaseManagement
            cases={cases}
            loading={loading}
            adminId={user?.id || ""}
            onRefresh={fetchCases}
          />
        );
      case "users":
        return <AdminUsersManagement />;
      case "advocates":
        return <AdminLawyerManagement />;
      case "audit":
        return <AdminAuditLogs />;
      case "settings":
        return <AdminSystemSettings />;
      case "analytics":
        return <AdminAnalytics cases={cases} />;
      case "reports":
        return <AdminReports />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar
          activeView={activeView}
          userName={userName}
          userEmail={user?.email || ""}
          employeeId={employeeId}
          onSignOut={signOut}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

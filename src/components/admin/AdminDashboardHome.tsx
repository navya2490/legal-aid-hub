import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Briefcase, Users, Scale, Clock, TrendingUp, CheckCircle2, 
  AlertTriangle, Calendar, ArrowRight, Loader2 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { INDIAN_STATES } from "@/lib/indiaData";
import type { AdminView } from "./AdminSidebar";

const CHART_COLORS = [
  "hsl(var(--primary))", "hsl(var(--portal-purple))", "hsl(var(--portal-green))",
  "hsl(var(--destructive))", "hsl(var(--warning))", "#6366f1", "#f59e0b",
  "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

interface Props {
  userName: string;
  employeeId: string;
  cases: CaseRow[];
  onNavigate: (view: AdminView) => void;
}

interface CaseRow {
  case_id: string;
  issue_category: string;
  urgency_level: string;
  status: string;
  submitted_at: string;
  assigned_lawyer_id: string | null;
  decline_count: number;
  updated_at?: string;
  resolved_at?: string | null;
}

const AdminDashboardHome: React.FC<Props> = ({ userName, employeeId, cases, onNavigate }) => {
  const [lawyerCount, setLawyerCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const [lawyers, clients] = await Promise.all([
        supabase.from("lawyer_profiles").select("lawyer_id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "client"),
      ]);
      setLawyerCount(lawyers.count ?? 0);
      setClientCount(clients.count ?? 0);
      setLoading(false);
    };
    fetchCounts();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = cases.filter((c) => {
      const d = new Date(c.submitted_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const active = cases.filter((c) => ["In Progress", "Assigned", "Under Review"].includes(c.status));
    const pending = cases.filter((c) => !c.assigned_lawyer_id && c.status === "Submitted");
    const resolved = cases.filter((c) => c.status === "Resolved" || c.status === "Closed");
    const resolutionRate = cases.length > 0 ? Math.round((resolved.length / cases.length) * 100) : 0;

    // Average resolution time
    let avgDays = 0;
    const resolvedWithDates = cases.filter((c) => c.resolved_at);
    if (resolvedWithDates.length > 0) {
      const totalDays = resolvedWithDates.reduce((sum, c) => {
        const diff = new Date(c.resolved_at!).getTime() - new Date(c.submitted_at).getTime();
        return sum + diff / (1000 * 60 * 60 * 24);
      }, 0);
      avgDays = Math.round(totalDays / resolvedWithDates.length);
    }

    return {
      total: cases.length,
      active: active.length,
      pending: pending.length,
      thisMonth: thisMonth.length,
      resolutionRate,
      avgDays,
    };
  }, [cases]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach((c) => { counts[c.issue_category] = (counts[c.issue_category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + "…" : name, value })).sort((a, b) => b.value - a.value);
  }, [cases]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      months[key] = 0;
    }
    cases.forEach((c) => {
      const d = new Date(c.submitted_at);
      const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      if (key in months) months[key]++;
    });
    return Object.entries(months).map(([name, value]) => ({ name, value }));
  }, [cases]);

  const recentCases = useMemo(() => cases.slice(0, 10), [cases]);

  const statCards = [
    { label: "Total Cases", value: stats.total, icon: Briefcase, color: "text-primary" },
    { label: "Active Cases", value: stats.active, icon: TrendingUp, color: "text-portal-green" },
    { label: "Pending Assignment", value: stats.pending, icon: AlertTriangle, color: "text-warning" },
    { label: "Total Advocates", value: lawyerCount, icon: Scale, color: "text-portal-purple" },
    { label: "Total Clients", value: clientCount, icon: Users, color: "text-primary" },
    { label: "Cases This Month", value: stats.thisMonth, icon: Calendar, color: "text-portal-green" },
    { label: "Resolution Rate", value: `${stats.resolutionRate}%`, icon: CheckCircle2, color: "text-success" },
    { label: "Avg Resolution (days)", value: stats.avgDays, icon: Clock, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {userName}</h1>
        <p className="text-sm text-muted-foreground">Employee ID: <span className="font-mono text-portal-purple">{employeeId}</span></p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold mt-1">{loading && typeof s.value === "number" && s.label.includes("Total") ? "…" : s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Trends (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} name="Cases" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cases by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Pending Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
              {recentCases.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                recentCases.map((c) => (
                  <div key={c.case_id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {c.status === "Submitted" ? "New case submitted" : `Case ${c.status.toLowerCase()}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">{c.case_id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <Badge variant="secondary" className="text-[10px]">{c.status}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(c.submitted_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Cases awaiting assignment", count: stats.pending, view: "cases" as AdminView },
              { label: "Escalated cases (3+ declines)", count: cases.filter((c) => c.decline_count >= 3).length, view: "cases" as AdminView },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.count} pending</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigate(item.view)}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardHome;

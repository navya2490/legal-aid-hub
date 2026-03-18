import React from "react";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import type { CaseItem } from "./CaseCard";

interface DashboardStatsProps {
  cases: CaseItem[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ cases }) => {
  const total = cases.length;
  const active = cases.filter((c) => ["Submitted", "Under Review", "Assigned", "In Progress", "Awaiting Client"].includes(c.status)).length;
  const resolved = cases.filter((c) => c.status === "Resolved" || c.status === "Closed").length;
  const urgent = cases.filter((c) => (c.urgency_level === "High" || c.urgency_level === "Critical") && !["Resolved", "Closed"].includes(c.status)).length;

  const stats = [
    { label: "Total Cases", value: total, icon: FileText, color: "text-primary bg-primary/10" },
    { label: "Active", value: active, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Resolved", value: resolved, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
    { label: "Urgent", value: urgent, icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <div className={`rounded-lg p-2.5 ${s.color}`}>
            <s.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;

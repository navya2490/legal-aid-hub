import React from "react";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type CaseStatus = Database["public"]["Enums"]["case_status"];

const statusConfig: Record<CaseStatus, { className: string }> = {
  "Submitted": { className: "bg-blue-100 text-blue-700 border-blue-200" },
  "Under Review": { className: "bg-amber-100 text-amber-700 border-amber-200" },
  "Assigned": { className: "bg-purple-100 text-purple-700 border-purple-200" },
  "In Progress": { className: "bg-sky-100 text-sky-700 border-sky-200" },
  "Awaiting Client": { className: "bg-orange-100 text-orange-700 border-orange-200" },
  "Resolved": { className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "Closed": { className: "bg-gray-100 text-gray-500 border-gray-200" },
};

interface CaseStatusBadgeProps {
  status: CaseStatus;
}

const CaseStatusBadge: React.FC<CaseStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {status}
    </Badge>
  );
};

export default CaseStatusBadge;

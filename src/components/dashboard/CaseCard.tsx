import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronRight, User, Scale } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type CaseStatus = Database["public"]["Enums"]["case_status"];
type UrgencyLevel = Database["public"]["Enums"]["urgency_level"];

export interface CaseItem {
  case_id: string;
  case_reference_number: string;
  issue_category: string;
  status: CaseStatus;
  urgency_level: UrgencyLevel;
  submitted_at: string;
  updated_at?: string;
  assigned_lawyer_name?: string | null;
}

const statusColors: Record<CaseStatus, string> = {
  "Submitted": "bg-blue-100 text-blue-700 border-blue-200",
  "Under Review": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Assigned": "bg-purple-100 text-purple-700 border-purple-200",
  "In Progress": "bg-orange-100 text-orange-700 border-orange-200",
  "Awaiting Client": "bg-pink-100 text-pink-700 border-pink-200",
  "Resolved": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Closed": "bg-gray-100 text-gray-500 border-gray-200",
};

const urgencyColors: Record<UrgencyLevel, string> = {
  Low: "bg-gray-400",
  Medium: "bg-blue-500",
  High: "bg-orange-500",
  Critical: "bg-destructive",
};

const CaseCard: React.FC<{ caseData: CaseItem }> = ({ caseData }) => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const detailPath =
    role === "admin"
      ? `/dashboard/admin/case/${caseData.case_id}`
      : role === "lawyer"
      ? `/dashboard/lawyer/case/${caseData.case_id}`
      : `/dashboard/client/case/${caseData.case_id}`;

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
      onClick={() => navigate(detailPath)}
    >
      <CardContent className="p-5">
        {/* Header: reference + status */}
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{caseData.case_reference_number}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="outline" className={`text-xs font-medium ${statusColors[caseData.status]}`}>
              {caseData.status}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 mb-3">
          <Scale className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-foreground font-medium">{caseData.issue_category}</span>
        </div>

        {/* Urgency */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-2 w-2 rounded-full ${urgencyColors[caseData.urgency_level]}`} />
          <span className="text-xs text-muted-foreground">{caseData.urgency_level} Urgency</span>
        </div>

        {/* Footer: lawyer + date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3" />
            <span>{caseData.assigned_lawyer_name || "Awaiting Assignment"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(caseData.submitted_at), "MMM d, yyyy")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseCard;

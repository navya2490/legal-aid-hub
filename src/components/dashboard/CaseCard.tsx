import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ChevronRight, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CaseStatusBadge from "./CaseStatusBadge";
import type { Database } from "@/integrations/supabase/types";

type CaseStatus = Database["public"]["Enums"]["case_status"];
type Specialization = Database["public"]["Enums"]["specialization"];
type UrgencyLevel = Database["public"]["Enums"]["urgency_level"];

export interface CaseItem {
  case_id: string;
  case_reference_number: string;
  issue_category: Specialization;
  status: CaseStatus;
  urgency_level: UrgencyLevel;
  submitted_at: string;
  updated_at: string;
  assigned_lawyer_name?: string | null;
}

const urgencyColors: Record<UrgencyLevel, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-orange-500",
  Critical: "bg-destructive",
};

const CaseCard: React.FC<{ caseData: CaseItem }> = ({ caseData }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
      onClick={() => navigate(`/dashboard/client/case/${caseData.case_id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1">
            <p className="text-xs font-mono text-muted-foreground">{caseData.case_reference_number}</p>
            <h3 className="font-semibold text-foreground">{caseData.issue_category}</h3>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <CaseStatusBadge status={caseData.status} />
          <div className={`h-2 w-2 rounded-full ${urgencyColors[caseData.urgency_level]}`} title={`${caseData.urgency_level} urgency`} />
          <span className="text-xs text-muted-foreground">{caseData.urgency_level}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {caseData.assigned_lawyer_name ? (
              <>
                <User className="h-3 w-3" />
                <span>{caseData.assigned_lawyer_name}</span>
              </>
            ) : (
              <span className="italic">Unassigned</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(caseData.updated_at), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseCard;

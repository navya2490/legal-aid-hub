import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { fetchRoutingLog } from "@/lib/caseRouting";

interface Props {
  caseId: string;
  onClose: () => void;
}

const actionLabels: Record<string, { label: string; variant: string }> = {
  auto_assigned: { label: "Auto Assigned", variant: "default" },
  declined: { label: "Declined", variant: "destructive" },
  admin_assigned: { label: "Admin Assigned", variant: "default" },
  admin_reassigned: { label: "Admin Reassigned", variant: "secondary" },
  escalated: { label: "Escalated", variant: "destructive" },
  no_match: { label: "No Match", variant: "secondary" },
};

const RoutingLogDialog: React.FC<Props> = ({ caseId, onClose }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutingLog(caseId)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [caseId]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Routing History</DialogTitle>
          <DialogDescription>Timeline of routing events for this case.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No routing history yet.</p>
        ) : (
          <div className="space-y-3 mt-2">
            {logs.map((log: any) => {
              const config = actionLabels[log.action] || { label: log.action, variant: "secondary" };
              return (
                <div key={log.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={config.variant as any}>{config.label}</Badge>
                      {log.score && (
                        <span className="text-xs text-muted-foreground">Score: {log.score}</span>
                      )}
                    </div>
                    {log.reason && (
                      <p className="text-sm text-muted-foreground">{log.reason}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoutingLogDialog;

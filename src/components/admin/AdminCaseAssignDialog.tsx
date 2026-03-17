import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminAssignCase } from "@/lib/caseRouting";
import { toast } from "sonner";

interface Props {
  caseItem: { case_id: string; case_reference_number: string; issue_category: string };
  adminId: string;
  onClose: () => void;
  onAssigned: () => void;
}

interface LawyerOption {
  lawyer_id: string;
  user_id: string;
  specializations: string[];
  current_caseload: number;
  max_caseload: number;
  years_of_experience: number;
  user_name?: string;
}

const AdminCaseAssignDialog: React.FC<Props> = ({ caseItem, adminId, onClose, onAssigned }) => {
  const [lawyers, setLawyers] = useState<LawyerOption[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchLawyers = async () => {
      const { data, error } = await supabase
        .from("lawyer_profiles")
        .select("lawyer_id, user_id, specializations, current_caseload, max_caseload, years_of_experience");

      if (error) {
        toast.error("Failed to load lawyers");
        return;
      }

      // Fetch user names
      const lawyersWithNames: LawyerOption[] = [];
      for (const l of data || []) {
        const { data: userRec } = await supabase
          .from("users")
          .select("full_name")
          .eq("user_id", l.user_id)
          .maybeSingle();
        lawyersWithNames.push({ ...l, user_name: userRec?.full_name || "Unknown" });
      }
      setLawyers(lawyersWithNames);
      setFetching(false);
    };
    fetchLawyers();
  }, []);

  const handleAssign = async () => {
    if (!selectedLawyer) {
      toast.error("Please select a lawyer");
      return;
    }
    setLoading(true);
    try {
      await adminAssignCase(caseItem.case_id, selectedLawyer, adminId, reason);
      toast.success("Case assigned successfully");
      onAssigned();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Case</DialogTitle>
          <DialogDescription>
            Assign {caseItem.case_reference_number} ({caseItem.issue_category}) to a lawyer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Select Lawyer</Label>
            {fetching ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading lawyers...
              </div>
            ) : (
              <Select value={selectedLawyer} onValueChange={setSelectedLawyer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lawyer" />
                </SelectTrigger>
                <SelectContent>
                  {lawyers.map(l => (
                    <SelectItem key={l.lawyer_id} value={l.lawyer_id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{l.user_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {l.current_caseload}/{l.max_caseload} cases • {l.years_of_experience}yr
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="Reason for manual assignment..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleAssign} disabled={loading || !selectedLawyer}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCaseAssignDialog;

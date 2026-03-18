import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Gavel, Loader2 } from "lucide-react";
import AdminCaseAssignDialog from "./AdminCaseAssignDialog";
import RoutingLogDialog from "./RoutingLogDialog";

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

interface Props {
  cases: CaseRow[];
  loading: boolean;
  adminId: string;
  onRefresh: () => void;
}

const AdminReviewQueue: React.FC<Props> = ({ cases, loading, adminId, onRefresh }) => {
  const [assignCase, setAssignCase] = useState<CaseRow | null>(null);
  const [logCaseId, setLogCaseId] = useState<string | null>(null);

  // Unassigned or escalated (3+ declines)
  const reviewCases = cases.filter(
    (c) => !c.assigned_lawyer_id || c.decline_count >= 3
  );

  const escalated = reviewCases.filter((c) => c.decline_count >= 3);
  const unassigned = reviewCases.filter((c) => !c.assigned_lawyer_id && c.decline_count < 3);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Needs Review</p>
            <p className="text-2xl font-bold mt-1">{reviewCases.length}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <p className="text-xs text-destructive font-medium">Escalated (3+ declines)</p>
            </div>
            <p className="text-2xl font-bold mt-1 text-destructive">{escalated.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Unassigned</p>
            <p className="text-2xl font-bold mt-1">{unassigned.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Escalated section */}
      {escalated.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Escalated Cases — Requires Manual Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Declines</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escalated.map((c) => (
                  <TableRow key={c.case_id}>
                    <TableCell className="font-mono text-xs">{c.case_reference_number}</TableCell>
                    <TableCell>{c.issue_category}</TableCell>
                    <TableCell>
                      <Badge variant={c.urgency_level === "Critical" || c.urgency_level === "High" ? "destructive" : "secondary"}>
                        {c.urgency_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{c.decline_count}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setLogCaseId(c.case_id)}>Log</Button>
                        <Button variant="default" size="sm" onClick={() => setAssignCase(c)}>
                          <Gavel className="h-3 w-3 mr-1" /> Assign Now
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Unassigned section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Unassigned Cases</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : unassigned.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">All cases are assigned 🎉</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassigned.map((c) => (
                  <TableRow key={c.case_id}>
                    <TableCell className="font-mono text-xs">{c.case_reference_number}</TableCell>
                    <TableCell className="hidden md:table-cell">{c.issue_category}</TableCell>
                    <TableCell>
                      <Badge variant={c.urgency_level === "Critical" || c.urgency_level === "High" ? "destructive" : "secondary"}>
                        {c.urgency_level}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {new Date(c.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setAssignCase(c)}>
                        <Gavel className="h-3 w-3 mr-1" /> Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {assignCase && (
        <AdminCaseAssignDialog
          caseItem={assignCase}
          adminId={adminId}
          onClose={() => setAssignCase(null)}
          onAssigned={onRefresh}
        />
      )}
      {logCaseId && <RoutingLogDialog caseId={logCaseId} onClose={() => setLogCaseId(null)} />}
    </div>
  );
};

export default AdminReviewQueue;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gavel, Search, Loader2, Eye } from "lucide-react";
import { Constants } from "@/integrations/supabase/types";
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

const urgencyVariant: Record<string, string> = {
  Low: "secondary",
  Medium: "default",
  High: "destructive",
  Critical: "destructive",
};

const statusVariant: Record<string, string> = {
  Submitted: "secondary",
  "Under Review": "default",
  Assigned: "default",
  "In Progress": "default",
  "Awaiting Client": "secondary",
  Resolved: "outline",
  Closed: "outline",
};

const AdminCaseManagement: React.FC<Props> = ({ cases, loading, adminId, onRefresh }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [assignCase, setAssignCase] = useState<CaseRow | null>(null);
  const [logCaseId, setLogCaseId] = useState<string | null>(null);

  const filtered = cases.filter((c) => {
    const matchesSearch =
      !search ||
      c.case_reference_number.toLowerCase().includes(search.toLowerCase()) ||
      c.issue_category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesUrgency = urgencyFilter === "all" || c.urgency_level === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by reference or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Constants.public.Enums.case_status.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            {Constants.public.Enums.urgency_level.map((u) => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead className="hidden sm:table-cell">Declines</TableHead>
              <TableHead className="hidden lg:table-cell">Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No cases match your filters
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.case_id}>
                  <TableCell className="font-mono text-xs">{c.case_reference_number}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.issue_category}</TableCell>
                  <TableCell>
                    <Badge variant={(statusVariant[c.status] as any) || "secondary"}>{c.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={(urgencyVariant[c.urgency_level] as any) || "secondary"}>{c.urgency_level}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {c.decline_count > 0 && <Badge variant="destructive">{c.decline_count}</Badge>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {new Date(c.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setLogCaseId(c.case_id)}>Log</Button>
                      <Button variant="outline" size="sm" onClick={() => setAssignCase(c)}>
                        <Gavel className="h-3 w-3 mr-1" /> Assign
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">Showing {filtered.length} of {cases.length} cases</p>

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

export default AdminCaseManagement;

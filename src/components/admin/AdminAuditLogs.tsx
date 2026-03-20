import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Loader2, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface LogEntry {
  id: string;
  case_id: string;
  action: string;
  lawyer_id: string | null;
  admin_id: string | null;
  reason: string | null;
  score: number | null;
  created_at: string;
}

const PAGE_OPTIONS = [50, 100, 200];

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [perPage, setPerPage] = useState(50);
  const [page, setPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("case_routing_log")
        .select("*")
        .order("created_at", { ascending: false })
        .range(0, 999);

      if (!error && data) setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const actions = useMemo(() => {
    const set = new Set(logs.map((l) => l.action));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch = !search ||
        l.case_id.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        (l.reason || "").toLowerCase().includes(search.toLowerCase());
      const matchesAction = actionFilter === "all" || l.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [logs, search, actionFilter]);

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const actionColor = (action: string) => {
    if (action.includes("assign")) return "default";
    if (action.includes("decline")) return "destructive";
    if (action.includes("escalat")) return "secondary";
    return "outline";
  };

  const exportCSV = () => {
    const header = "Timestamp,Action,Case ID,Lawyer ID,Admin ID,Score,Reason\n";
    const rows = filtered.map((l) =>
      `"${l.created_at}","${l.action}","${l.case_id}","${l.lawyer_id || ""}","${l.admin_id || ""}","${l.score ?? ""}","${(l.reason || "").replace(/"/g, '""')}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Audit Logs</h2>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="All Actions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(0); }}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAGE_OPTIONS.map((n) => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="hidden md:table-cell">Case ID</TableHead>
              <TableHead className="hidden lg:table-cell">Lawyer</TableHead>
              <TableHead className="hidden lg:table-cell">Admin</TableHead>
              <TableHead className="hidden md:table-cell">Score</TableHead>
              <TableHead className="hidden xl:table-cell">Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
            ) : paged.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No logs found</TableCell></TableRow>
            ) : (
              paged.map((l) => (
                <TableRow key={l.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLog(l)}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionColor(l.action) as any} className="text-xs">{l.action}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs">{l.case_id.slice(0, 8)}…</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">{l.lawyer_id ? l.lawyer_id.slice(0, 8) + "…" : "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">{l.admin_id ? l.admin_id.slice(0, 8) + "…" : "—"}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs">{l.score ?? "—"}</TableCell>
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground truncate max-w-[200px]">{l.reason || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} total entries · Page {page + 1} of {totalPages || 1}
        </p>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Audit Log Detail</DialogTitle></DialogHeader>
          {selectedLog && (
            <div className="space-y-3 text-sm">
              {[
                ["Timestamp", new Date(selectedLog.created_at).toLocaleString("en-IN")],
                ["Action", selectedLog.action],
                ["Case ID", selectedLog.case_id],
                ["Lawyer ID", selectedLog.lawyer_id || "N/A"],
                ["Admin ID", selectedLog.admin_id || "N/A"],
                ["Score", selectedLog.score?.toString() ?? "N/A"],
                ["Reason", selectedLog.reason || "N/A"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right max-w-[60%] break-all">{value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAuditLogs;

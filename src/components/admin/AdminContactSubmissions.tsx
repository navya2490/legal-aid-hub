import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Mail, MailOpen, Trash2, RefreshCw, Loader2 } from "lucide-react";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminContactSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load contact submissions");
    } else {
      setSubmissions((data || []) as ContactSubmission[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchesSearch = !search || 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.subject.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || (filter === "unread" && !s.is_read) || (filter === "read" && s.is_read);
      return matchesSearch && matchesFilter;
    });
  }, [submissions, search, filter]);

  const unreadCount = submissions.filter((s) => !s.is_read).length;

  const handleMarkRead = async (id: string, read: boolean) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ is_read: read })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update");
    } else {
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, is_read: read } : s));
      if (selected?.id === id) setSelected({ ...selected!, is_read: read });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Submission deleted");
    }
  };

  const openDetail = async (sub: ContactSubmission) => {
    setSelected(sub);
    if (!sub.is_read) {
      handleMarkRead(sub.id, true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Contact Submissions</h2>
          <p className="text-sm text-muted-foreground">{unreadCount} unread message{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, subject..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              {(["all", "unread", "read"] as const).map((f) => (
                <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
                  {f} {f === "unread" && unreadCount > 0 && <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No submissions found</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sub) => (
                    <TableRow key={sub.id} className={`cursor-pointer ${!sub.is_read ? "bg-primary/5 font-medium" : ""}`} onClick={() => openDetail(sub)}>
                      <TableCell>{sub.is_read ? <MailOpen className="h-4 w-4 text-muted-foreground" /> : <Mail className="h-4 w-4 text-primary" />}</TableCell>
                      <TableCell className="font-medium">{sub.name}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.email}</TableCell>
                      <TableCell>{sub.subject}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(sub.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkRead(sub.id, !sub.is_read)} title={sub.is_read ? "Mark unread" : "Mark read"}>
                            {sub.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(sub.id)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">From:</span> <span className="font-medium">{selected.name}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{selected.email}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Date:</span> <span className="font-medium">{new Date(selected.created_at).toLocaleString("en-IN")}</span></div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleMarkRead(selected.id, !selected.is_read)}>
                  {selected.is_read ? "Mark Unread" : "Mark Read"}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { handleDelete(selected.id); setSelected(null); }}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContactSubmissions;

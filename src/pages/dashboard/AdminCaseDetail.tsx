import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Download, FileText, Clock, Scale, Shield, LogOut,
  User, Gavel, AlertTriangle, MessageSquare, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import CaseStatusBadge from "@/components/dashboard/CaseStatusBadge";
import CaseMessageThread from "@/components/messaging/CaseMessageThread";
import AdminCaseAssignDialog from "@/components/admin/AdminCaseAssignDialog";
import RoutingLogDialog from "@/components/admin/RoutingLogDialog";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type CaseStatus = Database["public"]["Enums"]["case_status"];

const AdminCaseDetail: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showAssign, setShowAssign] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { data: caseData, isLoading, refetch } = useQuery({
    queryKey: ["admin-case-detail", caseId],
    enabled: !!caseId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("case_id", caseId!)
        .single();
      if (error) throw error;

      // Get client name
      const { data: clientUser } = await supabase
        .from("users")
        .select("full_name, email, phone")
        .eq("user_id", data.user_id)
        .single();

      // Get lawyer name
      let lawyerName: string | null = null;
      let lawyerUserId: string | null = null;
      if (data.assigned_lawyer_id) {
        const { data: lp } = await supabase
          .from("lawyer_profiles")
          .select("user_id")
          .eq("lawyer_id", data.assigned_lawyer_id)
          .single();
        if (lp) {
          lawyerUserId = lp.user_id;
          const { data: lu } = await supabase
            .from("users")
            .select("full_name")
            .eq("user_id", lp.user_id)
            .single();
          lawyerName = lu?.full_name || null;
        }
      }

      return {
        ...data,
        clientName: clientUser?.full_name || "Unknown",
        clientEmail: clientUser?.email || "",
        clientPhone: clientUser?.phone || null,
        lawyerName,
        lawyerUserId,
      };
    },
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["admin-case-documents", caseId],
    enabled: !!caseId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", caseId!)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: routingLogs = [] } = useQuery({
    queryKey: ["admin-routing-logs", caseId],
    enabled: !!caseId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_routing_log")
        .select("*")
        .eq("case_id", caseId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("case-documents").download(filePath);
    if (error || !data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!caseId) return;
    setUpdatingStatus(true);
    const updates: Record<string, any> = { status: newStatus };
    if (newStatus === "Resolved" || newStatus === "Closed") {
      updates.resolved_at = new Date().toISOString();
    }
    const { error } = await supabase.from("cases").update(updates).eq("case_id", caseId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Status updated to ${newStatus}`);
      refetch();
    }
    setUpdatingStatus(false);
  };

  const actionLabels: Record<string, { label: string; variant: string }> = {
    auto_assigned: { label: "Auto Assigned", variant: "default" },
    declined: { label: "Declined", variant: "destructive" },
    admin_assigned: { label: "Admin Assigned", variant: "default" },
    admin_reassigned: { label: "Admin Reassigned", variant: "secondary" },
    escalated: { label: "Escalated", variant: "destructive" },
    no_match: { label: "No Match", variant: "secondary" },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader user={user} signOut={signOut} />
        <main className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[400px] rounded-xl" />
        </main>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader user={user} signOut={signOut} />
        <main className="container mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-muted-foreground">Case not found.</p>
          <Button className="mt-4" onClick={() => navigate("/dashboard/admin")}>Back to Dashboard</Button>
        </main>
      </div>
    );
  }

  // For admin messaging, we need to pick a participant. Admin can message the client.
  const messageRecipientId = caseData.user_id;
  const messageRecipientName = caseData.clientName;

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} signOut={signOut} />
      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back + Title */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-mono text-muted-foreground">{caseData.case_reference_number}</p>
            <h1 className="text-xl font-bold text-foreground">{caseData.issue_category}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <CaseStatusBadge status={caseData.status as CaseStatus} />
            {caseData.decline_count > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {caseData.decline_count} decline{caseData.decline_count > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {/* Admin Actions Bar */}
        <Card>
          <CardContent className="py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm text-muted-foreground shrink-0">Status:</span>
              <Select
                value={caseData.status}
                onValueChange={handleStatusChange}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-[180px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.case_status.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {updatingStatus && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowLog(true)}>
                <Clock className="h-3.5 w-3.5 mr-1" /> Routing Log
              </Button>
              <Button variant="default" size="sm" onClick={() => setShowAssign(true)}>
                <Gavel className="h-3.5 w-3.5 mr-1" />
                {caseData.assigned_lawyer_id ? "Reassign" : "Assign"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Case Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Urgency</p>
                    <Badge
                      variant={
                        caseData.urgency_level === "Critical" || caseData.urgency_level === "High"
                          ? "destructive"
                          : "secondary"
                      }
                      className="mt-1"
                    >
                      {caseData.urgency_level}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium text-foreground">{format(new Date(caseData.submitted_at), "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium text-foreground">{format(new Date(caseData.updated_at), "PPP p")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assigned Lawyer</p>
                    <p className="font-medium text-foreground">{caseData.lawyerName || "Unassigned"}</p>
                  </div>
                  {caseData.assigned_at && (
                    <div>
                      <p className="text-muted-foreground">Assigned At</p>
                      <p className="font-medium text-foreground">{format(new Date(caseData.assigned_at), "PPP p")}</p>
                    </div>
                  )}
                  {caseData.resolved_at && (
                    <div>
                      <p className="text-muted-foreground">Resolved At</p>
                      <p className="font-medium text-foreground">{format(new Date(caseData.resolved_at), "PPP p")}</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{caseData.issue_description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Specific Questions</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{caseData.specific_questions}</p>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{caseData.clientName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{caseData.clientEmail}</p>
                  </div>
                  {caseData.clientPhone && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{caseData.clientPhone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-4 pb-4">
                  <CaseMessageThread
                    caseId={caseId!}
                    recipientId={messageRecipientId}
                    recipientName={messageRecipientName}
                    caseStatus={caseData.status}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded.</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.document_id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {(doc.file_size / 1024).toFixed(0)} KB · {doc.file_type}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => handleDownload(doc.file_path, doc.file_name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Case lifecycle events */}
                  <TimelineItem
                    icon={<div className="h-2 w-2 rounded-full bg-primary" />}
                    label="Case Submitted"
                    date={caseData.submitted_at}
                  />
                  {caseData.assigned_at && (
                    <TimelineItem
                      icon={<Gavel className="h-3 w-3 text-primary" />}
                      label={`Assigned to ${caseData.lawyerName || "lawyer"}`}
                      date={caseData.assigned_at}
                    />
                  )}
                  {caseData.resolved_at && (
                    <TimelineItem
                      icon={<div className="h-2 w-2 rounded-full bg-green-500" />}
                      label="Case Resolved"
                      date={caseData.resolved_at}
                    />
                  )}

                  {/* Routing log events */}
                  {routingLogs.length > 0 && (
                    <>
                      <Separator />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Routing History</p>
                      {routingLogs.map((log) => {
                        const config = actionLabels[log.action] || { label: log.action, variant: "secondary" };
                        return (
                          <div key={log.id} className="flex items-start gap-3">
                            <div className="mt-1.5 shrink-0">
                              <div className={`h-2 w-2 rounded-full ${
                                log.action === "declined" || log.action === "escalated"
                                  ? "bg-destructive"
                                  : "bg-muted-foreground/50"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant={config.variant as any} className="text-[10px] px-1.5 py-0">
                                  {config.label}
                                </Badge>
                                {log.score != null && (
                                  <span className="text-[10px] text-muted-foreground">Score: {log.score}</span>
                                )}
                              </div>
                              {log.reason && (
                                <p className="text-xs text-muted-foreground mt-0.5">{log.reason}</p>
                              )}
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      {showAssign && (
        <AdminCaseAssignDialog
          caseItem={{
            case_id: caseData.case_id,
            case_reference_number: caseData.case_reference_number,
            issue_category: caseData.issue_category,
          }}
          adminId={user?.id || ""}
          onClose={() => setShowAssign(false)}
          onAssigned={() => { setShowAssign(false); refetch(); }}
        />
      )}
      {showLog && <RoutingLogDialog caseId={caseId!} onClose={() => setShowLog(false)} />}
    </div>
  );
};

const AdminHeader: React.FC<{ user: any; signOut: () => void }> = ({ user, signOut }) => (
  <header className="border-b border-border bg-card sticky top-0 z-30">
    <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold text-foreground">LegalConnect</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5">
          <Shield className="h-3 w-3 text-destructive" />
          <span className="text-xs font-medium text-destructive">Admin</span>
        </div>
        <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </header>
);

const TimelineItem: React.FC<{ icon: React.ReactNode; label: string; date: string }> = ({ icon, label, date }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1.5 shrink-0">{icon}</div>
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{format(new Date(date), "PPP p")}</p>
    </div>
  </div>
);

export default AdminCaseDetail;

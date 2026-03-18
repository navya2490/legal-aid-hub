import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import ClientHeader from "@/components/dashboard/ClientHeader";
import CaseStatusBadge from "@/components/dashboard/CaseStatusBadge";
import CaseMessageThread from "@/components/messaging/CaseMessageThread";
import type { Database } from "@/integrations/supabase/types";

type CaseStatus = Database["public"]["Enums"]["case_status"];

const ClientCaseDetail: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["case-detail", caseId],
    enabled: !!caseId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("case_id", caseId!)
        .single();
      if (error) throw error;

      let lawyerName: string | null = null;
      if (data.assigned_lawyer_id) {
        const { data: lp } = await supabase
          .from("lawyer_profiles")
          .select("user_id")
          .eq("lawyer_id", data.assigned_lawyer_id)
          .single();
        if (lp) {
          const { data: u } = await supabase
            .from("users")
            .select("full_name")
            .eq("user_id", lp.user_id)
            .single();
          lawyerName = u?.full_name || null;
        }
      }

      return { ...data, lawyerName };
    },
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["case-documents", caseId],
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

  const { data: messages = [] } = useQuery({
    queryKey: ["case-messages", caseId],
    enabled: !!caseId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("case_id", caseId!)
        .order("sent_at", { ascending: true });
      if (error) throw error;

      // Fetch sender names
      const senderIds = [...new Set(data?.map((m) => m.sender_id) || [])];
      let nameMap: Record<string, string> = {};
      if (senderIds.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("user_id, full_name")
          .in("user_id", senderIds);
        if (users) {
          nameMap = Object.fromEntries(users.map((u) => [u.user_id, u.full_name]));
        }
      }

      return (data || []).map((m) => ({
        ...m,
        sender_name: nameMap[m.sender_id] || "Unknown",
        is_own: m.sender_id === user!.id,
      }));
    },
  });

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from("case-documents")
      .download(filePath);
    if (error || !data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (caseLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ClientHeader />
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
        <ClientHeader />
        <main className="container mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-muted-foreground">Case not found.</p>
          <Button className="mt-4" onClick={() => navigate("/dashboard/client")}>Back to Dashboard</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back + Title */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/client")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-xs font-mono text-muted-foreground">{caseData.case_reference_number}</p>
            <h1 className="text-xl font-bold text-foreground">{caseData.issue_category}</h1>
          </div>
          <div className="ml-auto">
            <CaseStatusBadge status={caseData.status as CaseStatus} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Case Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Urgency</p>
                    <p className="font-medium text-foreground">{caseData.urgency_level}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium text-foreground">{format(new Date(caseData.submitted_at), "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assigned Lawyer</p>
                    <p className="font-medium text-foreground">{caseData.lawyerName || "Not yet assigned"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium text-foreground">{format(new Date(caseData.updated_at), "PPP p")}</p>
                  </div>
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

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages ({messages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No messages yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {messages.map((m) => (
                      <div
                        key={m.message_id}
                        className={`flex flex-col ${m.is_own ? "items-end" : "items-start"}`}
                      >
                        <div className={`rounded-lg px-4 py-2.5 max-w-[80%] ${m.is_own ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                          <p className="text-xs font-medium mb-1 opacity-75">{m.sender_name}</p>
                          <p className="text-sm">{m.message_text}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(new Date(m.sent_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Documents */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No documents.</p>
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

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <TimelineItem label="Submitted" date={caseData.submitted_at} />
                  {caseData.assigned_at && <TimelineItem label="Assigned" date={caseData.assigned_at} />}
                  {caseData.resolved_at && <TimelineItem label="Resolved" date={caseData.resolved_at} />}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const TimelineItem: React.FC<{ label: string; date: string }> = ({ label, date }) => (
  <div className="flex items-center gap-3">
    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{format(new Date(date), "PPP p")}</p>
    </div>
  </div>
);

export default ClientCaseDetail;

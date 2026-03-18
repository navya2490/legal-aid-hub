import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Scale, Briefcase, LogOut, XCircle, Loader2, RefreshCw,
  CheckCircle2, Clock, AlertTriangle, Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lawyerDeclineCase } from "@/lib/caseRouting";
import { toast } from "sonner";
import CaseMessageThread from "@/components/messaging/CaseMessageThread";
import type { Database } from "@/integrations/supabase/types";

type CaseStatus = Database["public"]["Enums"]["case_status"];

interface LawyerProfile {
  lawyer_id: string;
  current_caseload: number;
  max_caseload: number;
  is_available: boolean;
  specializations: string[];
  years_of_experience: number;
}

interface AssignedCase {
  case_id: string;
  case_reference_number: string;
  issue_category: string;
  urgency_level: string;
  status: CaseStatus;
  submitted_at: string;
  updated_at: string;
  issue_description: string;
  user_id: string;
  client_name?: string;
}

interface Message {
  message_id: string;
  message_text: string;
  sender_id: string;
  sent_at: string;
  is_read: boolean;
}

const urgencyConfig: Record<string, { class: string; icon: typeof AlertTriangle | null }> = {
  Low: { class: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: null },
  Medium: { class: "bg-amber-100 text-amber-700 border-amber-200", icon: null },
  High: { class: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle },
  Critical: { class: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
};

const statusOptions: CaseStatus[] = ["Assigned", "In Progress", "Awaiting Client", "Resolved", "Closed"];

const LawyerDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [cases, setCases] = useState<AssignedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: prof } = await supabase
      .from("lawyer_profiles")
      .select("lawyer_id, current_caseload, max_caseload, is_available, specializations, years_of_experience")
      .eq("user_id", user.id)
      .maybeSingle();

    if (prof) {
      setProfile(prof as LawyerProfile);

      const { data: caseData } = await supabase
        .from("cases")
        .select("case_id, case_reference_number, issue_category, urgency_level, status, submitted_at, updated_at, issue_description, user_id")
        .eq("assigned_lawyer_id", prof.lawyer_id)
        .order("submitted_at", { ascending: false });

      if (caseData) {
        // Fetch client names
        const userIds = [...new Set(caseData.map(c => c.user_id))];
        const { data: users } = await supabase
          .from("users")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const nameMap = new Map(users?.map(u => [u.user_id, u.full_name]) || []);
        setCases(caseData.map(c => ({
          ...c,
          client_name: nameMap.get(c.user_id) || "Unknown Client",
        })) as AssignedCase[]);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime: cases assigned to this lawyer
  useEffect(() => {
    if (!profile?.lawyer_id) return;

    const caseChannel = supabase
      .channel("lawyer-cases")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cases", filter: `assigned_lawyer_id=eq.${profile.lawyer_id}` },
        () => { fetchData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(caseChannel); };
  }, [profile?.lawyer_id, fetchData]);

  const loadMessages = useCallback(async (caseId: string) => {
    setLoadingMessages(true);
    const { data } = await supabase
      .from("messages")
      .select("message_id, message_text, sender_id, recipient_id, sent_at, is_read")
      .eq("case_id", caseId)
      .order("sent_at", { ascending: true });
    setMessages((data || []) as Message[]);
    setLoadingMessages(false);

    if (data && user) {
      const unread = data.filter(m => m.recipient_id === user.id && !m.is_read);
      if (unread.length > 0) {
        await supabase
          .from("messages")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in("message_id", unread.map(m => m.message_id));
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedCaseId) loadMessages(selectedCaseId);
  }, [selectedCaseId, loadMessages]);

  // Realtime: messages for the selected case
  useEffect(() => {
    if (!selectedCaseId) return;

    const msgChannel = supabase
      .channel(`case-messages-${selectedCaseId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `case_id=eq.${selectedCaseId}` },
        () => { loadMessages(selectedCaseId); }
      )
      .subscribe();

    return () => { supabase.removeChannel(msgChannel); };
  }, [selectedCaseId, loadMessages]);

  const handleDecline = async (caseId: string) => {
    if (!profile) return;
    setDecliningId(caseId);
    try {
      await lawyerDeclineCase(caseId, profile.lawyer_id);
      toast.success("Case declined and will be reassigned.");
      if (selectedCaseId === caseId) setSelectedCaseId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to decline");
    } finally {
      setDecliningId(null);
    }
  };

  const handleAccept = async (caseId: string) => {
    setUpdatingStatus(caseId);
    try {
      const { error } = await supabase
        .from("cases")
        .update({ status: "In Progress" as CaseStatus })
        .eq("case_id", caseId);
      if (error) throw error;
      toast.success("Case accepted and moved to In Progress.");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleStatusChange = async (caseId: string, newStatus: CaseStatus) => {
    setUpdatingStatus(caseId);
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === "Resolved") updateData.resolved_at = new Date().toISOString();
      const { error } = await supabase.from("cases").update(updateData).eq("case_id", caseId);
      if (error) throw error;
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setTogglingAvailability(true);
    try {
      const { error } = await supabase
        .from("lawyer_profiles")
        .update({ is_available: !profile.is_available })
        .eq("lawyer_id", profile.lawyer_id);
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, is_available: !prev.is_available } : null);
      toast.success(profile.is_available ? "Paused new assignments" : "Resumed accepting assignments");
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle");
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCaseId || !user) return;
    const selectedCase = cases.find(c => c.case_id === selectedCaseId);
    if (!selectedCase) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from("messages").insert({
        case_id: selectedCaseId,
        sender_id: user.id,
        recipient_id: selectedCase.user_id,
        message_text: newMessage.trim(),
      });
      if (error) throw error;
      setNewMessage("");
      loadMessages(selectedCaseId);
      toast.success("Message sent");
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const newAssignments = cases.filter(c => c.status === "Assigned");
  const activeCases = cases.filter(c => ["In Progress", "Awaiting Client"].includes(c.status));
  const closedCases = cases.filter(c => ["Resolved", "Closed"].includes(c.status));
  const caseloadPct = profile ? (profile.current_caseload / profile.max_caseload) * 100 : 0;

  const selectedCase = cases.find(c => c.case_id === selectedCaseId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">LegalConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-accent px-3 py-1">
              <Briefcase className="h-3 w-3 text-accent-foreground" />
              <span className="text-xs font-medium text-accent-foreground">Lawyer</span>
            </div>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Stats & Cases */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{cases.length}</p>
                    <p className="text-xs text-muted-foreground">Total Cases</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{newAssignments.length}</p>
                    <p className="text-xs text-muted-foreground">New</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-accent-foreground">{activeCases.length}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-muted-foreground">{closedCases.length}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </CardContent>
                </Card>
              </div>

              {/* New Assignments */}
              {newAssignments.length > 0 && (
                <Card className="border-primary/30 bg-primary/[0.03]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      New Assignments ({newAssignments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {newAssignments.map(c => (
                      <div key={c.case_id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-xs text-muted-foreground">{c.case_reference_number}</span>
                              <Badge variant="outline" className={urgencyConfig[c.urgency_level]?.class}>
                                {c.urgency_level}
                              </Badge>
                            </div>
                            <p className="text-sm font-semibold text-foreground">{c.issue_category}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.issue_description}</p>
                            <p className="text-xs text-muted-foreground mt-1">Client: {c.client_name}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleAccept(c.case_id)}
                              disabled={updatingStatus === c.case_id || decliningId === c.case_id}
                            >
                              {updatingStatus === c.case_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <><CheckCircle2 className="h-4 w-4 mr-1" /> Accept</>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive/30 hover:bg-destructive/5"
                              disabled={decliningId === c.case_id || updatingStatus === c.case_id}
                              onClick={() => handleDecline(c.case_id)}
                            >
                              {decliningId === c.case_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <><XCircle className="h-4 w-4 mr-1" /> Decline</>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Case Tabs */}
              <Tabs defaultValue="active">
                <div className="flex items-center justify-between mb-2">
                  <TabsList>
                    <TabsTrigger value="active">Active ({activeCases.length})</TabsTrigger>
                    <TabsTrigger value="closed">Closed ({closedCases.length})</TabsTrigger>
                    <TabsTrigger value="all">All ({cases.length})</TabsTrigger>
                  </TabsList>
                  <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                    <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                  </Button>
                </div>

                {[
                  { value: "active", list: activeCases },
                  { value: "closed", list: closedCases },
                  { value: "all", list: cases },
                ].map(({ value, list }) => (
                  <TabsContent key={value} value={value} className="space-y-3 mt-3">
                    {list.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No cases here.</p>
                      </div>
                    ) : (
                      list.map(c => (
                        <Card
                          key={c.case_id}
                          className={`cursor-pointer transition-all hover:shadow-md ${selectedCaseId === c.case_id ? "ring-2 ring-primary" : ""}`}
                          onClick={() => setSelectedCaseId(c.case_id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-mono text-xs text-muted-foreground">{c.case_reference_number}</span>
                                  <Badge variant="outline" className={urgencyConfig[c.urgency_level]?.class}>
                                    {c.urgency_level}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">{c.status}</Badge>
                                </div>
                                <p className="text-sm font-semibold text-foreground">{c.issue_category}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span>Client: {c.client_name}</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(c.updated_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              {!["Resolved", "Closed", "Assigned"].includes(c.status) && (
                                <div onClick={e => e.stopPropagation()}>
                                  <Select
                                    value={c.status}
                                    onValueChange={(val) => handleStatusChange(c.case_id, val as CaseStatus)}
                                    disabled={updatingStatus === c.case_id}
                                  >
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {statusOptions.filter(s => s !== "Assigned").map(s => (
                                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Availability & Caseload */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">My Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Available for cases</p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.is_available ? "Accepting new assignments" : "Paused"}
                      </p>
                    </div>
                    <Switch
                      checked={profile?.is_available ?? false}
                      onCheckedChange={handleToggleAvailability}
                      disabled={togglingAvailability}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Caseload</span>
                      <span className="font-medium text-foreground">
                        {profile?.current_caseload ?? 0} / {profile?.max_caseload ?? 20}
                      </span>
                    </div>
                    <Progress
                      value={caseloadPct}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {caseloadPct >= 90 ? "Near capacity" : caseloadPct >= 60 ? "Moderate load" : "Light load"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Messages Panel */}
              <Card className="flex flex-col" style={{ minHeight: "360px" }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {selectedCase ? `Chat — ${selectedCase.case_reference_number}` : "Select a case to chat"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {!selectedCaseId ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                      <p>Click a case to view messages</p>
                    </div>
                  ) : loadingMessages ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[240px] pr-1">
                        {messages.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">No messages yet.</p>
                        ) : (
                          messages.map(m => {
                            const isMe = m.sender_id === user?.id;
                            return (
                              <div key={m.message_id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${
                                  isMe
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground"
                                }`}>
                                  <p>{m.message_text}</p>
                                  <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                    {new Date(m.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Textarea
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="text-xs min-h-[36px] h-9 resize-none"
                          onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          className="shrink-0 h-9 w-9"
                          onClick={handleSendMessage}
                          disabled={sendingMessage || !newMessage.trim()}
                        >
                          {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Case Details */}
              {selectedCase && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Case Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Reference</p>
                      <p className="font-mono font-medium text-foreground">{selectedCase.case_reference_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium text-foreground">{selectedCase.issue_category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Client</p>
                      <p className="font-medium text-foreground">{selectedCase.client_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Description</p>
                      <p className="text-foreground">{selectedCase.issue_description}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="text-foreground">{new Date(selectedCase.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LawyerDashboard;

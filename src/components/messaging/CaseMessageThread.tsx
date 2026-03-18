import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare, Send, Loader2, Paperclip, Download, Search,
  CheckCheck, Check, X, FileText
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface MessageItem {
  message_id: string;
  message_text: string;
  sender_id: string;
  recipient_id: string;
  sent_at: string;
  is_read: boolean;
  read_at: string | null;
  sender_name: string;
  is_own: boolean;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_size: number | null;
  attachment_type: string | null;
}

interface CaseMessageThreadProps {
  caseId: string;
  recipientId: string;
  recipientName: string;
  caseStatus: string;
}

const ALLOWED_TYPES = ["application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const CaseMessageThread: React.FC<CaseMessageThreadProps> = ({
  caseId, recipientId, recipientName, caseStatus,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("case_id", caseId)
      .order("sent_at", { ascending: true });

    if (error) { console.error(error); return; }

    const senderIds = [...new Set(data?.map(m => m.sender_id) || [])];
    let nameMap: Record<string, string> = {};
    if (senderIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("user_id, full_name")
        .in("user_id", senderIds);
      if (users) nameMap = Object.fromEntries(users.map(u => [u.user_id, u.full_name]));
    }

    const mapped = (data || []).map(m => ({
      ...m,
      sender_name: nameMap[m.sender_id] || "Unknown",
      is_own: m.sender_id === user.id,
    })) as MessageItem[];

    setMessages(mapped);
    setLoading(false);

    // Mark unread messages as read
    const unread = data?.filter(m => m.recipient_id === user.id && !m.is_read) || [];
    if (unread.length > 0) {
      await supabase
        .from("messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in("message_id", unread.map(m => m.message_id));
    }
  }, [caseId, user]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${caseId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `case_id=eq.${caseId}`,
      }, () => { fetchMessages(); })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `case_id=eq.${caseId}`,
      }, () => { fetchMessages(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [caseId, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only PDF, DOC, DOCX, JPG, and PNG files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be under 10MB.");
      return;
    }
    setAttachment(file);
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !attachment) || !user) return;
    setSending(true);

    try {
      let attachmentPath: string | null = null;
      let attachmentName: string | null = null;
      let attachmentSize: number | null = null;
      let attachmentType: string | null = null;

      if (attachment) {
        const ext = attachment.name.split(".").pop();
        const path = `${caseId}/messages/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("case-documents")
          .upload(path, attachment);
        if (uploadError) throw uploadError;
        attachmentPath = path;
        attachmentName = attachment.name;
        attachmentSize = attachment.size;
        attachmentType = attachment.type;
      }

      const { error } = await supabase.from("messages").insert({
        case_id: caseId,
        sender_id: user.id,
        recipient_id: recipientId,
        message_text: newMessage.trim() || (attachment ? `Sent a file: ${attachment.name}` : ""),
        attachment_path: attachmentPath,
        attachment_name: attachmentName,
        attachment_size: attachmentSize,
        attachment_type: attachmentType,
      });
      if (error) throw error;

      setNewMessage("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Trigger email notification (fire and forget)
      supabase.functions.invoke("message-notification", {
        body: { case_id: caseId, recipient_id: recipientId },
      }).catch(() => {}); // silent fail
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDownloadAttachment = async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from("case-documents").download(path);
    if (error || !data) { toast.error("Download failed"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMessages = searchQuery
    ? messages.filter(m =>
        m.message_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sender_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const isClosed = ["Resolved", "Closed"].includes(caseStatus);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages ({messages.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {showSearch && (
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="mt-2 h-8 text-sm"
            autoFocus
          />
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-[400px] pr-1"
            >
              {filteredMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {searchQuery ? "No messages match your search." : "No messages yet. Start the conversation."}
                </p>
              ) : (
                filteredMessages.map(m => (
                  <div
                    key={m.message_id}
                    className={`flex flex-col ${m.is_own ? "items-end" : "items-start"}`}
                  >
                    <div className={`rounded-lg px-4 py-2.5 max-w-[80%] ${
                      m.is_own
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}>
                      <p className={`text-xs font-medium mb-1 ${
                        m.is_own ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {m.sender_name}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{m.message_text}</p>
                      {m.attachment_name && m.attachment_path && (
                        <button
                          onClick={() => handleDownloadAttachment(m.attachment_path!, m.attachment_name!)}
                          className={`mt-2 flex items-center gap-1.5 text-xs rounded-md px-2 py-1 ${
                            m.is_own
                              ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
                              : "bg-background hover:bg-accent text-foreground"
                          } transition-colors`}
                        >
                          <FileText className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{m.attachment_name}</span>
                          <Download className="h-3 w-3 shrink-0" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(m.sent_at), "MMM d, h:mm a")}
                      </p>
                      {m.is_own && (
                        m.is_read
                          ? <CheckCheck className="h-3 w-3 text-primary" />
                          : <Check className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Compose */}
            {!isClosed ? (
              <div className="space-y-2">
                {attachment && (
                  <div className="flex items-center gap-2 text-xs bg-muted rounded-md px-3 py-1.5">
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate flex-1 text-foreground">{attachment.name}</span>
                    <span className="text-muted-foreground">{(attachment.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-9 w-9"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={`Message ${recipientName}...`}
                    className="text-sm min-h-[36px] h-9 resize-none flex-1"
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="shrink-0 h-9 w-9"
                    onClick={handleSend}
                    disabled={sending || (!newMessage.trim() && !attachment)}
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                This case is {caseStatus.toLowerCase()}. Messaging is disabled.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CaseMessageThread;

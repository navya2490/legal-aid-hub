import React, { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadedFile } from "@/lib/caseValidation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const scanStatusConfig = {
  Pending: { icon: Clock, color: "text-warning", label: "Scanning..." },
  Clean: { icon: CheckCircle, color: "text-success", label: "Clean" },
  Infected: { icon: AlertTriangle, color: "text-destructive", label: "Infected" },
};

const StepDocuments: React.FC<Props> = ({ files, onFilesChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const uploadFile = useCallback(async (file: File): Promise<UploadedFile | null> => {
    if (!user) return null;
    const id = crypto.randomUUID();
    const storagePath = `${user.id}/${id}-${file.name}`;

    const uploadedFile: UploadedFile = {
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      scanStatus: "Pending",
    };

    // Add file immediately with 0 progress
    onFilesChange([...files, uploadedFile]);

    const { error } = await supabase.storage
      .from("case-documents")
      .upload(storagePath, file);

    if (error) {
      toast.error(`Failed to upload ${file.name}: ${error.message}`);
      return null;
    }

    const completedFile: UploadedFile = {
      ...uploadedFile,
      progress: 100,
      storagePath,
      scanStatus: "Clean", // Simulated - would be async in production
    };

    return completedFile;
  }, [user, files, onFilesChange]);

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);

    if (files.length + fileArray.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 10MB limit`);
        continue;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        continue;
      }

      const uploaded = await uploadFile(file);
      if (uploaded) {
        onFilesChange((prev: UploadedFile[]) => 
          prev.map((f: UploadedFile) => f.id === uploaded.id ? uploaded : f)
        );
      }
    }
  }, [files.length, uploadFile, onFilesChange]);

  const removeFile = useCallback(async (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file?.storagePath) {
      await supabase.storage.from("case-documents").remove([file.storagePath]);
    }
    onFilesChange(files.filter((f) => f.id !== fileId));
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Supporting Documents</h3>
        <p className="text-sm text-muted-foreground">Upload any relevant documents. This step is optional but recommended.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-accent/50" : "border-border hover:border-primary/40"
        }`}
      >
        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Drag & drop files here, or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, DOC, DOCX, JPG, PNG • Max 10MB per file • Up to {MAX_FILES} files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">{files.length} file{files.length !== 1 ? "s" : ""} uploaded</p>
          {files.map((file) => {
            const StatusConfig = scanStatusConfig[file.scanStatus];
            const StatusIcon = StatusConfig.icon;
            return (
              <div key={file.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className={`flex items-center gap-1 ${StatusConfig.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      <span className="text-xs">{StatusConfig.label}</span>
                    </div>
                  </div>
                  {file.progress < 100 && (
                    <Progress value={file.progress} className="mt-2 h-1" />
                  )}
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeFile(file.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StepDocuments;

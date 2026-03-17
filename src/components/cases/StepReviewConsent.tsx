import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit2, FileText } from "lucide-react";
import { PersonalInfoData, IssueDetailsData, QuestionsUrgencyData, UploadedFile } from "@/lib/caseValidation";

interface Props {
  personalInfo: PersonalInfoData;
  issueDetails: IssueDetailsData;
  questionsUrgency: QuestionsUrgencyData;
  documents: UploadedFile[];
  termsAccepted: boolean;
  privacyAccepted: boolean;
  onTermsChange: (checked: boolean) => void;
  onPrivacyChange: (checked: boolean) => void;
  onEditStep: (step: number) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const urgencyBadgeVariant = {
  Low: "secondary" as const,
  Medium: "default" as const,
  High: "destructive" as const,
  Critical: "destructive" as const,
};

const ReviewSection: React.FC<{
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}> = ({ title, step, onEdit, children }) => (
  <div className="rounded-lg border border-border bg-card p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <Button variant="ghost" size="sm" onClick={() => onEdit(step)} className="text-primary">
        <Edit2 className="h-3 w-3 mr-1" /> Edit
      </Button>
    </div>
    {children}
  </div>
);

const Field: React.FC<{ label: string; value?: string | null }> = ({ label, value }) =>
  value ? (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  ) : null;

const StepReviewConsent: React.FC<Props> = ({
  personalInfo,
  issueDetails,
  questionsUrgency,
  documents,
  termsAccepted,
  privacyAccepted,
  onTermsChange,
  onPrivacyChange,
  onEditStep,
}) => {
  const address = [
    personalInfo.addressLine1,
    personalInfo.addressLine2,
    personalInfo.city,
    personalInfo.state,
    personalInfo.postalCode,
    personalInfo.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">Please review your information before submitting.</p>
      </div>

      <ReviewSection title="Personal Information" step={1} onEdit={onEditStep}>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Full Name" value={personalInfo.fullName} />
          <Field label="National ID" value={personalInfo.nationalId} />
          <Field label="Email" value={personalInfo.email} />
          <Field label="Phone" value={personalInfo.phone ? `${personalInfo.phoneCountryCode} ${personalInfo.phone}` : undefined} />
          {address && <div className="sm:col-span-2"><Field label="Address" value={address} /></div>}
        </div>
      </ReviewSection>

      <ReviewSection title="Issue Details" step={2} onEdit={onEditStep}>
        <Field label="Category" value={issueDetails.issueCategory} />
        <div>
          <span className="text-xs text-muted-foreground">Description</span>
          <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">{issueDetails.issueDescription}</p>
        </div>
      </ReviewSection>

      <ReviewSection title="Questions & Urgency" step={3} onEdit={onEditStep}>
        <div>
          <span className="text-xs text-muted-foreground">Questions</span>
          <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{questionsUrgency.specificQuestions}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Urgency:</span>
          <Badge variant={urgencyBadgeVariant[questionsUrgency.urgencyLevel]}>
            {questionsUrgency.urgencyLevel}
          </Badge>
        </div>
      </ReviewSection>

      <ReviewSection title="Documents" step={4} onEdit={onEditStep}>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No documents uploaded</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-foreground truncate">{doc.name}</span>
                <span className="text-muted-foreground text-xs">({formatFileSize(doc.size)})</span>
              </div>
            ))}
          </div>
        )}
      </ReviewSection>

      <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="text-sm font-semibold text-foreground">Legal Agreements</h4>
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => onTermsChange(checked === true)}
          />
          <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground cursor-pointer leading-relaxed">
            I agree to the{" "}
            <a href="/terms" target="_blank" className="text-primary hover:underline font-medium">
              Terms of Service
            </a>
            . *
          </Label>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="privacy"
            checked={privacyAccepted}
            onCheckedChange={(checked) => onPrivacyChange(checked === true)}
          />
          <Label htmlFor="privacy" className="text-sm font-normal text-muted-foreground cursor-pointer leading-relaxed">
            I agree to the{" "}
            <a href="/privacy" target="_blank" className="text-primary hover:underline font-medium">
              Privacy Policy
            </a>
            . *
          </Label>
        </div>
      </div>
    </div>
  );
};

export default StepReviewConsent;

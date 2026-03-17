import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Save, Loader2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import StepProgressIndicator from "@/components/cases/StepProgressIndicator";
import StepPersonalInfo from "@/components/cases/StepPersonalInfo";
import StepIssueDetails from "@/components/cases/StepIssueDetails";
import StepQuestionsUrgency from "@/components/cases/StepQuestionsUrgency";
import StepDocuments from "@/components/cases/StepDocuments";
import StepReviewConsent from "@/components/cases/StepReviewConsent";

import {
  personalInfoSchema,
  issueDetailsSchema,
  questionsUrgencySchema,
  UploadedFile,
  type PersonalInfoData,
  type IssueDetailsData,
  type QuestionsUrgencyData,
} from "@/lib/caseValidation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const STEP_LABELS = ["Personal Info", "Issue Details", "Questions", "Documents", "Review"];
const AUTO_SAVE_INTERVAL = 30000;

const CaseSubmission: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const autoSaveRef = useRef<ReturnType<typeof setInterval>>();

  const personalInfoForm = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: { phoneCountryCode: "+1" },
  });

  const issueDetailsForm = useForm<IssueDetailsData>({
    resolver: zodResolver(issueDetailsSchema),
    mode: "onChange",
  });

  const questionsUrgencyForm = useForm<QuestionsUrgencyData>({
    resolver: zodResolver(questionsUrgencySchema),
    mode: "onChange",
  });

  // Pre-populate from user profile
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        personalInfoForm.reset({
          fullName: data.full_name || "",
          nationalId: data.national_id || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          phoneCountryCode: "+1",
          addressLine1: data.address_line1 || "",
          addressLine2: data.address_line2 || "",
          city: data.city || "",
          state: data.state || "",
          postalCode: data.postal_code || "",
          country: data.country || "",
        });
      }
    };
    fetchProfile();
  }, [user]);

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem(`case-draft-${user?.id}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.personalInfo) personalInfoForm.reset(parsed.personalInfo);
        if (parsed.issueDetails) issueDetailsForm.reset(parsed.issueDetails);
        if (parsed.questionsUrgency) questionsUrgencyForm.reset(parsed.questionsUrgency);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        toast.info("Draft restored from your last session.");
      } catch {}
    }
  }, [user?.id]);

  // Auto-save draft
  const saveDraft = useCallback(() => {
    if (!user) return;
    const draft = {
      personalInfo: personalInfoForm.getValues(),
      issueDetails: issueDetailsForm.getValues(),
      questionsUrgency: questionsUrgencyForm.getValues(),
      currentStep,
    };
    localStorage.setItem(`case-draft-${user.id}`, JSON.stringify(draft));
    setLastSaved(new Date());
  }, [user, currentStep, personalInfoForm, issueDetailsForm, questionsUrgencyForm]);

  useEffect(() => {
    autoSaveRef.current = setInterval(saveDraft, AUTO_SAVE_INTERVAL);
    return () => clearInterval(autoSaveRef.current);
  }, [saveDraft]);

  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 1:
        return personalInfoForm.trigger();
      case 2:
        return issueDetailsForm.trigger();
      case 3:
        return questionsUrgencyForm.trigger();
      case 4:
        return true; // Documents are optional
      case 5:
        return termsAccepted && privacyAccepted;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      if (currentStep === 5) toast.error("Please accept the Terms of Service and Privacy Policy.");
      return;
    }
    saveDraft();
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const handleEditStep = (step: number) => setCurrentStep(step);

  // Update files with functional updater support
  const handleFilesChange = useCallback((newFiles: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => {
    setFiles(newFiles);
  }, []);

  const handleSubmit = async () => {
    if (!termsAccepted || !privacyAccepted) {
      toast.error("Please accept the Terms of Service and Privacy Policy.");
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Generate case reference
      const { data: refData, error: refError } = await supabase.rpc("generate_case_reference");
      if (refError) throw refError;
      const caseRef = refData as string;

      const personalInfo = personalInfoForm.getValues();
      const issueDetails = issueDetailsForm.getValues();
      const questionsUrgency = questionsUrgencyForm.getValues();

      // Update user profile with latest info
      await supabase.from("users").update({
        full_name: personalInfo.fullName,
        national_id: personalInfo.nationalId || null,
        phone: personalInfo.phone || null,
        address_line1: personalInfo.addressLine1 || null,
        address_line2: personalInfo.addressLine2 || null,
        city: personalInfo.city || null,
        state: personalInfo.state || null,
        postal_code: personalInfo.postalCode || null,
        country: personalInfo.country || null,
      }).eq("user_id", user.id);

      // Insert case
      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .insert({
          user_id: user.id,
          case_reference_number: caseRef,
          issue_category: issueDetails.issueCategory as any,
          issue_description: issueDetails.issueDescription,
          specific_questions: questionsUrgency.specificQuestions,
          urgency_level: questionsUrgency.urgencyLevel as any,
          terms_accepted: termsAccepted,
          privacy_accepted: privacyAccepted,
        })
        .select("case_id")
        .single();

      if (caseError) throw caseError;

      // Link uploaded documents
      for (const file of files) {
        if (file.storagePath) {
          const fileExt = file.name.split(".").pop()?.toUpperCase() || "PDF";
          await supabase.from("documents").insert({
            case_id: caseData.case_id,
            uploaded_by: user.id,
            file_name: file.name,
            file_path: file.storagePath,
            file_size: file.size,
            file_type: fileExt as any,
            virus_scan_status: file.scanStatus as any,
          });
        }
      }

      // Clear draft
      localStorage.removeItem(`case-draft-${user.id}`);

      // Navigate to success page
      navigate(`/case-submitted?ref=${caseRef}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit case. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground hidden sm:inline">LegalConnect</span>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={saveDraft}>
              <Save className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Submit a New Case</h1>
          <p className="text-muted-foreground">Complete the form below to submit your legal case for review.</p>
        </div>

        <div className="mb-8">
          <StepProgressIndicator currentStep={currentStep} totalSteps={5} stepLabels={STEP_LABELS} />
        </div>

        <div className="bg-card rounded-xl border border-border p-4 sm:p-6 mb-6">
          {currentStep === 1 && <StepPersonalInfo form={personalInfoForm} />}
          {currentStep === 2 && <StepIssueDetails form={issueDetailsForm} />}
          {currentStep === 3 && <StepQuestionsUrgency form={questionsUrgencyForm} />}
          {currentStep === 4 && <StepDocuments files={files} onFilesChange={handleFilesChange} />}
          {currentStep === 5 && (
            <StepReviewConsent
              personalInfo={personalInfoForm.getValues()}
              issueDetails={issueDetailsForm.getValues()}
              questionsUrgency={questionsUrgencyForm.getValues()}
              documents={files}
              termsAccepted={termsAccepted}
              privacyAccepted={privacyAccepted}
              onTermsChange={setTermsAccepted}
              onPrivacyChange={setPrivacyAccepted}
              onEditStep={handleEditStep}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={currentStep === 1 ? () => navigate(-1) : handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          {currentStep < 5 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !termsAccepted || !privacyAccepted}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Submitting...
                </>
              ) : (
                "Submit Case"
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default CaseSubmission;

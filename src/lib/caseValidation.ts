import { z } from "zod";
import { INDIAN_LEGAL_CATEGORIES, INDIAN_STATES, PHONE_CODE } from "@/lib/indiaData";

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be under 100 characters"),
  nationalId: z.string().optional(),
  aadhaar: z.string().optional().refine(
    (v) => !v || v.replace(/\D/g, "").length === 12,
    "Aadhaar must be 12 digits"
  ),
  pan: z.string().optional().refine(
    (v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v),
    "PAN must be in format XXXXX0000X"
  ),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional().refine(
    (v) => !v || v.replace(/\D/g, "").length === 0 || v.replace(/\D/g, "").length === 10,
    "Phone must be 10 digits"
  ),
  phoneCountryCode: z.string().default(PHONE_CODE),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional().refine(
    (v) => !v || /^\d{6}$/.test(v),
    "PIN code must be 6 digits"
  ),
  country: z.string().default("India"),
});

export const issueDetailsSchema = z.object({
  issueCategory: z.string().min(1, "Please select a legal category"),
  issueDescription: z.string().min(50, "Description must be at least 50 characters").max(5000, "Description must be under 5000 characters"),
});

export const questionsUrgencySchema = z.object({
  specificQuestions: z.string().min(20, "Questions must be at least 20 characters").max(2000, "Questions must be under 2000 characters"),
  urgencyLevel: z.enum(["Low", "Medium", "High", "Critical"], { required_error: "Please select an urgency level" }),
});

export const consentSchema = z.object({
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms of Service" }) }),
  privacyAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the Privacy Policy" }) }),
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type IssueDetailsData = z.infer<typeof issueDetailsSchema>;
export type QuestionsUrgencyData = z.infer<typeof questionsUrgencySchema>;
export type ConsentData = z.infer<typeof consentSchema>;

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  storagePath?: string;
  scanStatus: "Pending" | "Clean" | "Infected";
}

export interface CaseFormData {
  personalInfo: PersonalInfoData;
  issueDetails: IssueDetailsData;
  questionsUrgency: QuestionsUrgencyData;
  documents: UploadedFile[];
  consent: ConsentData;
}

// Re-export from indiaData for backward compatibility
export { INDIAN_LEGAL_CATEGORIES as SPECIALIZATIONS } from "@/lib/indiaData";

export const COUNTRY_CODES = [
  { code: "+91", country: "India" },
] as const;

export const COUNTRIES = ["India"] as const;

export const URGENCY_OPTIONS = [
  { value: "Low" as const, label: "Low", description: "No specific deadline" },
  { value: "Medium" as const, label: "Medium", description: "Within 1-2 weeks" },
  { value: "High" as const, label: "High", description: "Within 2-3 days" },
  { value: "Critical" as const, label: "Critical", description: "Within 24 hours" },
] as const;

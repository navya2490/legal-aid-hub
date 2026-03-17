import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be under 100 characters"),
  nationalId: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  phoneCountryCode: z.string().default("+1"),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const issueDetailsSchema = z.object({
  issueCategory: z.string().min(1, "Please select an issue category"),
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

export const SPECIALIZATIONS = [
  "Family Law", "Criminal Law", "Civil Litigation", "Employment Law",
  "Real Estate Law", "Business & Corporate Law", "Immigration Law",
  "Intellectual Property", "Tax Law", "Estate Planning",
  "Personal Injury", "Consumer Protection",
] as const;

export const URGENCY_OPTIONS = [
  { value: "Low" as const, label: "Low", description: "No specific deadline" },
  { value: "Medium" as const, label: "Medium", description: "Within 1-2 weeks" },
  { value: "High" as const, label: "High", description: "Within 2-3 days" },
  { value: "Critical" as const, label: "Critical", description: "Within 24 hours" },
] as const;

export const COUNTRY_CODES = [
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+61", country: "AU" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+81", country: "JP" },
  { code: "+86", country: "CN" },
  { code: "+55", country: "BR" },
  { code: "+234", country: "NG" },
  { code: "+27", country: "ZA" },
  { code: "+971", country: "UAE" },
] as const;

export const COUNTRIES = [
  "United States", "United Kingdom", "India", "Australia", "Germany",
  "France", "Japan", "China", "Brazil", "Nigeria", "South Africa",
  "United Arab Emirates", "Canada", "Mexico", "Italy", "Spain",
] as const;

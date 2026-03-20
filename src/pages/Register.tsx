import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordStrengthBar from "@/components/auth/PasswordStrengthBar";
import IndianPhoneInput from "@/components/indian/IndianPhoneInput";
import AadhaarInput from "@/components/indian/AadhaarInput";
import PANInput from "@/components/indian/PANInput";
import IndianStateSelect from "@/components/indian/IndianStateSelect";
import IndianCitySelect from "@/components/indian/IndianCitySelect";
import { passwordSchema } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

const registerFormSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional().refine(
      (v) => !v || v.replace(/\D/g, "").length === 0 || v.replace(/\D/g, "").length === 10,
      "Phone must be 10 digits"
    ),
    aadhaar: z.string().optional().refine(
      (v) => !v || v.replace(/\D/g, "").length === 12,
      "Aadhaar must be 12 digits"
    ),
    pan: z.string().optional().refine(
      (v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v),
      "PAN must be in format XXXXX0000X"
    ),
    state: z.string().optional(),
    city: z.string().optional(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role") === "lawyer" ? "lawyer" : "client";
  const isLawyer = role === "lawyer";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
  });

  const password = watch("password", "");
  const phone = watch("phone", "");
  const aadhaar = watch("aadhaar", "");
  const pan = watch("pan", "");
  const state = watch("state", "");
  const city = watch("city", "");

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password, data.fullName, role);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully! Welcome to Legal Aid Hub.");
      navigate(isLawyer ? "/dashboard/lawyer" : "/dashboard/client");
    }
  };

  return (
    <AuthLayout
      title={`Create ${isLawyer ? "an Advocate" : "a Client"} account`}
      subtitle={isLawyer ? "Register to provide legal services on Legal Aid Hub" : "Join Legal Aid Hub to get started with your legal needs"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Rajesh Kumar"
            {...register("fullName")}
            className={errors.fullName ? "border-destructive" : ""}
          />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder={isLawyer ? "advocate@lawfirm.in" : "rajesh@example.com"}
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label>Phone (+91) <span className="text-muted-foreground text-xs">(Optional)</span></Label>
          <IndianPhoneInput
            value={phone}
            onChange={(v) => setValue("phone", v, { shouldValidate: true })}
            error={!!errors.phone}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        {/* Aadhaar & PAN */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Aadhaar <span className="text-muted-foreground text-xs">(Optional)</span></Label>
            <AadhaarInput
              value={aadhaar}
              onChange={(v) => setValue("aadhaar", v, { shouldValidate: true })}
              error={!!errors.aadhaar}
            />
            {errors.aadhaar && <p className="text-xs text-destructive">{errors.aadhaar.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>PAN <span className="text-muted-foreground text-xs">(Optional)</span></Label>
            <PANInput
              value={pan}
              onChange={(v) => setValue("pan", v, { shouldValidate: true })}
              error={!!errors.pan}
            />
            {errors.pan && <p className="text-xs text-destructive">{errors.pan.message}</p>}
          </div>
        </div>

        {/* Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>State <span className="text-muted-foreground text-xs">(Optional)</span></Label>
            <IndianStateSelect
              value={state}
              onValueChange={(v) => {
                setValue("state", v);
                setValue("city", "");
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>City <span className="text-muted-foreground text-xs">(Optional)</span></Label>
            <IndianCitySelect
              state={state}
              value={city}
              onValueChange={(v) => setValue("city", v)}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              {...register("password")}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrengthBar password={password} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to={isLawyer ? "/lawyer-login" : "/client-login"} className="font-medium text-primary hover:underline">Sign in</Link>
        </p>

        <div className="border-t border-border pt-4">
          <p className="text-center text-xs text-muted-foreground">
            {isLawyer ? "Are you a client?" : "Are you an advocate?"}{" "}
            <Link to={isLawyer ? "/register?role=client" : "/register?role=lawyer"} className="font-medium text-primary hover:underline">Register here</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;

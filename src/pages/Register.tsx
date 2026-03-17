import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserCircle, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordStrengthBar from "@/components/auth/PasswordStrengthBar";
import { registrationSchema, type RegistrationFormData } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
  });

  const password = watch("password", "");
  const selectedRole = watch("role");

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password, data.fullName, data.role);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registration successful! Please check your email to verify your account.");
      navigate("/login");
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Join LegalConnect to get started with your legal needs">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            {...register("fullName")}
            className={errors.fullName ? "border-destructive" : ""}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              {...register("password")}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrengthBar password={password} />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <Label>I am a</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("role", "client", { shouldValidate: true })}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                selectedRole === "client"
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <UserCircle className={`h-5 w-5 ${selectedRole === "client" ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-left">
                <div className={`text-sm font-medium ${selectedRole === "client" ? "text-foreground" : "text-foreground"}`}>Client</div>
                <div className="text-xs text-muted-foreground">Seeking legal help</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setValue("role", "lawyer", { shouldValidate: true })}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                selectedRole === "lawyer"
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <Briefcase className={`h-5 w-5 ${selectedRole === "lawyer" ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-left">
                <div className={`text-sm font-medium ${selectedRole === "lawyer" ? "text-foreground" : "text-foreground"}`}>Lawyer</div>
                <div className="text-xs text-muted-foreground">Providing legal services</div>
              </div>
            </button>
          </div>
          {errors.role && (
            <p className="text-xs text-destructive">{errors.role.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;

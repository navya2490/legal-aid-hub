import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordStrengthBar from "@/components/auth/PasswordStrengthBar";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ResetPassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  // Check for recovery token in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      // No recovery token — redirect to login
      toast.error("Invalid or expired reset link.");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    const { error } = await updatePassword(data.password);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      setIsReset(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    }
  };

  if (isReset) {
    return (
      <AuthLayout title="Password reset" subtitle="Your password has been updated">
        <div className="flex flex-col items-center text-center space-y-4 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Redirecting you to sign in...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your new password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;

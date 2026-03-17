import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/auth/AuthLayout";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    // Always show success regardless of whether email exists (security)
    await resetPassword(data.email);
    setIsSubmitting(false);
    setEmailSent(true);
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link">
      {emailSent ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                If an account exists with that email, we've sent a password reset link. The link expires in 1 hour.
              </p>
            </div>
          </div>
          <Link to="/login">
            <Button variant="outline" className="w-full" size="lg">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;

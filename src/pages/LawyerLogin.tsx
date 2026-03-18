import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const LawyerLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState("");
  const { signIn, user, role } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (user && role) {
      if (role === "lawyer") {
        navigate("/dashboard/lawyer", { replace: true });
      } else if (role === "client") {
        toast.error("This is a client account. Please use the client login.");
        navigate("/client-login", { replace: true });
      } else if (role === "admin") {
        navigate("/dashboard/admin", { replace: true });
      }
    }
  }, [user, role, navigate]);

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setLockCountdown("");
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setLockCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  const onSubmit = async (data: LoginFormData) => {
    if (isLocked) return;
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);
        toast.error("Too many failed attempts. Account locked for 15 minutes.");
      } else {
        toast.error(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-[400px] border border-border">
        <CardContent className="p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center space-y-3">
            <div className="h-16 w-16 rounded-2xl bg-portal-green/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-portal-green" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Lawyer Portal</h1>
            <p className="text-sm text-muted-foreground">Professional case management</p>
          </div>

          {isLocked && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive font-medium">
                Account temporarily locked. Try again in {lockCountdown}.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-bold">Professional Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="lawyer@lawfirm.com"
                {...register("email")}
                className={`focus-visible:ring-portal-green ${errors.email ? "border-destructive" : ""}`}
                disabled={!!isLocked}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px] font-bold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className={`pr-10 focus-visible:ring-portal-green ${errors.password ? "border-destructive" : ""}`}
                  disabled={!!isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link to="/forgot-password" className="text-[13px] text-portal-green hover:underline">
                Forgot?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-portal-green hover:bg-portal-green/90 text-portal-green-foreground font-bold"
              disabled={isSubmitting || !!isLocked}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-[13px] text-center text-muted-foreground">
              New lawyer?{" "}
              <Link to="/register?role=lawyer" className="font-medium text-portal-green hover:underline">
                Register here
              </Link>
            </p>

            <div className="border-t border-border pt-4">
              <p className="text-xs text-center text-muted-foreground">
                Are you a client?{" "}
                <Link to="/client-login" className="underline hover:text-foreground">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LawyerLogin;

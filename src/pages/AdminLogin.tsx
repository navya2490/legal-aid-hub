import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Loader2, Scale, Lock, Fingerprint } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";

const EMP_ID_REGEX = /^EMP-\d{5}$/;

const AdminLogin = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && role) {
      if (role === "admin") {
        navigate("/dashboard/admin", { replace: true });
      } else {
        toast({ title: "Access Denied", description: "This portal is for administrators only.", variant: "destructive" });
        const dashboardMap: Record<string, string> = { client: "/dashboard/client", lawyer: "/dashboard/lawyer" };
        navigate(dashboardMap[role] || "/", { replace: true });
      }
    }
  }, [user, role, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!EMP_ID_REGEX.test(employeeId)) {
      toast({ title: "Invalid Employee ID", description: "Employee ID must follow format EMP-XXXXX (e.g., EMP-00001).", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Authentication Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-background to-background dark:from-purple-950 dark:via-background dark:to-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Legal Aid Hub</span>
          </Link>
          <DarkModeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border border-border shadow-xl">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-portal-purple to-indigo-600 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>Platform Administration</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="employeeId">Employee ID</Label>
                <div className="relative">
                  <Input
                    id="employeeId"
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                    placeholder="EMP-XXXXX"
                    className="pl-10"
                  />
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@legalaidhub.in"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <Lock className="h-4 w-4 shrink-0" />
                <span>This portal is protected with multi-factor authentication. A verification code will be sent to your registered device after sign-in.</span>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-portal-purple to-indigo-600 hover:from-portal-purple/90 hover:to-indigo-600/90 text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                Sign In as Admin
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <p className="text-xs text-muted-foreground">
                Admin accounts are provisioned by the organization.{" "}
                <button className="text-portal-purple hover:underline font-medium" onClick={() => toast({ title: "IT Support", description: "Please contact your IT administrator for access issues at inguva2490@gmail.com" })}>
                  Contact IT Support
                </button>
              </p>
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;

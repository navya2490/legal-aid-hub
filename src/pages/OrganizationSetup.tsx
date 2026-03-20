import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Scale, Building2, UserPlus, Settings, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Link } from "react-router-dom";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const UNION_TERRITORIES = [
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const STEPS = [
  { icon: Building2, label: "Organization Details" },
  { icon: UserPlus, label: "First Admin User" },
  { icon: Settings, label: "Platform Configuration" },
  { icon: CheckCircle, label: "Review & Submit" },
];

const OrganizationSetup = () => {
  const [searchParams] = useSearchParams();
  const setupToken = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [org, setOrg] = useState({
    name: "", registrationNumber: "", gstNumber: "", panNumber: "",
    addressLine1: "", addressLine2: "", city: "", state: "", pin: "",
    contactEmail: "", contactPhone: "",
  });

  const [admin, setAdmin] = useState({
    fullName: "", employeeId: "EMP-00001", email: "", phone: "",
    password: "", confirmPassword: "",
  });

  const [config, setConfig] = useState({
    platformName: "Legal Aid Hub",
    primaryLanguage: "English",
    timeZone: "IST (UTC+5:30)",
    operatingStates: [] as string[],
  });

  if (!setupToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-border text-center">
          <CardContent className="p-8 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <Scale className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              Organization setup requires a valid setup token. Please contact your IT department for the setup link.
            </p>
            <Link to="/">
              <Button variant="outline" className="mt-2">← Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleState = (state: string) => {
    setConfig((prev) => ({
      ...prev,
      operatingStates: prev.operatingStates.includes(state)
        ? prev.operatingStates.filter((s) => s !== state)
        : [...prev.operatingStates, state],
    }));
  };

  const selectAllStates = () => {
    setConfig((prev) => ({
      ...prev,
      operatingStates: [...INDIAN_STATES, ...UNION_TERRITORIES],
    }));
  };

  const validateStep = (): boolean => {
    if (currentStep === 0) {
      if (!org.name || !org.registrationNumber || !org.panNumber || !org.addressLine1 || !org.city || !org.state || !org.pin || !org.contactEmail || !org.contactPhone) {
        toast({ title: "Missing Fields", description: "Please fill all required organization fields.", variant: "destructive" });
        return false;
      }
    }
    if (currentStep === 1) {
      if (!admin.fullName || !admin.email || !admin.phone || !admin.password || !admin.confirmPassword) {
        toast({ title: "Missing Fields", description: "Please fill all required admin fields.", variant: "destructive" });
        return false;
      }
      if (admin.password.length < 8) {
        toast({ title: "Weak Password", description: "Password must be at least 8 characters.", variant: "destructive" });
        return false;
      }
      if (admin.password !== admin.confirmPassword) {
        toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
        return false;
      }
    }
    if (currentStep === 2) {
      if (config.operatingStates.length === 0) {
        toast({ title: "No States Selected", description: "Select at least one operating state.", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setCurrentStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate setup process
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    toast({ title: "Organization Setup Complete", description: "Please login with your admin credentials." });
    navigate("/admin-login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-background dark:from-purple-950 dark:via-background dark:to-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Legal Aid Hub</span>
          </Link>
          <DarkModeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                i <= currentStep
                  ? "bg-gradient-to-br from-portal-purple to-indigo-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {i < currentStep ? <CheckCircle className="h-5 w-5" /> : i + 1}
              </div>
              <span className="hidden md:inline text-sm font-medium text-muted-foreground">{step.label}</span>
              {i < STEPS.length - 1 && <div className="w-8 md:w-12 h-px bg-border" />}
            </div>
          ))}
        </div>

        <Card className="border border-border shadow-lg">
          {/* Step 1: Organization Details */}
          {currentStep === 0 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-portal-purple" /> Organization Details</CardTitle>
                <CardDescription>Register your organization under Companies Act, 2013</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Organization Name *</Label>
                    <Input value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} placeholder="Legal Aid Hub Pvt. Ltd." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Registration Number *</Label>
                    <Input value={org.registrationNumber} onChange={(e) => setOrg({ ...org, registrationNumber: e.target.value })} placeholder="U74999DL2024PTC123456" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>GST Number</Label>
                    <Input value={org.gstNumber} onChange={(e) => setOrg({ ...org, gstNumber: e.target.value })} placeholder="07AABCU9603R1ZM" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>PAN Number *</Label>
                    <Input value={org.panNumber} onChange={(e) => setOrg({ ...org, panNumber: e.target.value.toUpperCase() })} placeholder="AABCU9603R" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Contact Phone *</Label>
                    <Input value={org.contactPhone} onChange={(e) => setOrg({ ...org, contactPhone: e.target.value })} placeholder="+91 9876543210" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Contact Email *</Label>
                    <Input type="email" value={org.contactEmail} onChange={(e) => setOrg({ ...org, contactEmail: e.target.value })} placeholder="admin@legalaidhub.in" />
                  </div>
                </div>
                <div className="border-t border-border pt-4 space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Registered Address</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Address Line 1 *</Label>
                      <Input value={org.addressLine1} onChange={(e) => setOrg({ ...org, addressLine1: e.target.value })} placeholder="123, Main Street" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Address Line 2</Label>
                      <Input value={org.addressLine2} onChange={(e) => setOrg({ ...org, addressLine2: e.target.value })} placeholder="Near Landmark" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>City *</Label>
                      <Input value={org.city} onChange={(e) => setOrg({ ...org, city: e.target.value })} placeholder="New Delhi" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>State *</Label>
                      <Input value={org.state} onChange={(e) => setOrg({ ...org, state: e.target.value })} placeholder="Delhi" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>PIN Code *</Label>
                      <Input value={org.pin} onChange={(e) => setOrg({ ...org, pin: e.target.value })} placeholder="110001" maxLength={6} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: First Admin User */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-portal-purple" /> First Admin User</CardTitle>
                <CardDescription>Create the Super Admin account for the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Full Name *</Label>
                    <Input value={admin.fullName} onChange={(e) => setAdmin({ ...admin, fullName: e.target.value })} placeholder="Dr. Rajesh Kumar" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employee ID</Label>
                    <Input value={admin.employeeId} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Input value="Super Admin" disabled className="bg-muted" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Email *</Label>
                    <Input type="email" value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} placeholder="admin@legalaidhub.in" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Phone *</Label>
                    <Input value={admin.phone} onChange={(e) => setAdmin({ ...admin, phone: e.target.value })} placeholder="+91 9876543210" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Password *</Label>
                    <Input type="password" value={admin.password} onChange={(e) => setAdmin({ ...admin, password: e.target.value })} placeholder="Min 8 characters" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirm Password *</Label>
                    <Input type="password" value={admin.confirmPassword} onChange={(e) => setAdmin({ ...admin, confirmPassword: e.target.value })} placeholder="Re-enter password" />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Platform Configuration */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-portal-purple" /> Platform Configuration</CardTitle>
                <CardDescription>Configure platform settings for your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Platform Name</Label>
                    <Input value={config.platformName} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Time Zone</Label>
                    <Input value={config.timeZone} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Primary Language</Label>
                    <div className="flex gap-3">
                      {["English", "Hindi", "Both"].map((lang) => (
                        <Button
                          key={lang}
                          type="button"
                          variant={config.primaryLanguage === lang ? "default" : "outline"}
                          size="sm"
                          onClick={() => setConfig({ ...config, primaryLanguage: lang })}
                        >
                          {lang}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Operating States & Union Territories *</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={selectAllStates} className="text-portal-purple">
                      Select All
                    </Button>
                  </div>
                  <div className="border border-border rounded-lg p-4 max-h-60 overflow-y-auto">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">States ({INDIAN_STATES.length})</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {INDIAN_STATES.map((state) => (
                        <label key={state} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={config.operatingStates.includes(state)}
                            onCheckedChange={() => toggleState(state)}
                          />
                          {state}
                        </label>
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Union Territories ({UNION_TERRITORIES.length})</p>
                    <div className="grid grid-cols-2 gap-2">
                      {UNION_TERRITORIES.map((ut) => (
                        <label key={ut} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={config.operatingStates.includes(ut)}
                            onCheckedChange={() => toggleState(ut)}
                          />
                          {ut}
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{config.operatingStates.length} selected</p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-portal-purple" /> Review & Submit</CardTitle>
                <CardDescription>Verify all details before completing setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Building2 className="h-4 w-4 text-portal-purple" /> Organization</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Name:</span><span className="text-foreground">{org.name || "—"}</span>
                      <span className="text-muted-foreground">Registration:</span><span className="text-foreground">{org.registrationNumber || "—"}</span>
                      <span className="text-muted-foreground">GST:</span><span className="text-foreground">{org.gstNumber || "—"}</span>
                      <span className="text-muted-foreground">PAN:</span><span className="text-foreground">{org.panNumber || "—"}</span>
                      <span className="text-muted-foreground">Email:</span><span className="text-foreground">{org.contactEmail || "—"}</span>
                      <span className="text-muted-foreground">Phone:</span><span className="text-foreground">{org.contactPhone || "—"}</span>
                      <span className="text-muted-foreground">Address:</span>
                      <span className="text-foreground">{[org.addressLine1, org.city, org.state, org.pin].filter(Boolean).join(", ") || "—"}</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><UserPlus className="h-4 w-4 text-portal-purple" /> Admin User</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Name:</span><span className="text-foreground">{admin.fullName || "—"}</span>
                      <span className="text-muted-foreground">Employee ID:</span><span className="text-foreground">{admin.employeeId}</span>
                      <span className="text-muted-foreground">Email:</span><span className="text-foreground">{admin.email || "—"}</span>
                      <span className="text-muted-foreground">Phone:</span><span className="text-foreground">{admin.phone || "—"}</span>
                      <span className="text-muted-foreground">Role:</span><span className="text-foreground">Super Admin</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Settings className="h-4 w-4 text-portal-purple" /> Configuration</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Platform:</span><span className="text-foreground">{config.platformName}</span>
                      <span className="text-muted-foreground">Language:</span><span className="text-foreground">{config.primaryLanguage}</span>
                      <span className="text-muted-foreground">Time Zone:</span><span className="text-foreground">{config.timeZone}</span>
                      <span className="text-muted-foreground">States:</span><span className="text-foreground">{config.operatingStates.length} selected</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 pt-2">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {currentStep < 3 ? (
              <Button onClick={nextStep} className="bg-gradient-to-r from-portal-purple to-indigo-600 text-white">
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-portal-purple to-indigo-600 text-white">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Complete Setup
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationSetup;

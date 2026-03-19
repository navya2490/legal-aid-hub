import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, ArrowRight, Shield, Users, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DarkModeToggle from "@/components/DarkModeToggle";

const features = [
  { icon: Scale, title: "Expert Matching", desc: "Get matched with specialized lawyers based on your case type." },
  { icon: Users, title: "Case Management", desc: "Track your cases and communicate with your legal team." },
  { icon: FileText, title: "Document Sharing", desc: "Securely upload and share documents with your lawyer." },
  { icon: Shield, title: "Secure & Private", desc: "End-to-end encryption keeps your data confidential." },
];

const Index = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && role) {
      const dashboardMap: Record<string, string> = {
        client: "/dashboard/client",
        lawyer: "/dashboard/lawyer",
        admin: "/dashboard/admin",
      };
      if (dashboardMap[role]) navigate(dashboardMap[role], { replace: true });
    }
  }, [user, role, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Legal Aid Hub</span>
        </div>
        <DarkModeToggle />
      </header>

      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Legal Aid Hub</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
          Connect with expert lawyers for your legal needs
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/login">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline">Sign Up</Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="border border-border bg-card">
              <CardContent className="p-6 text-center space-y-3">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;

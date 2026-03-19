import { useNavigate, Link } from "react-router-dom";
import { Briefcase, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import DarkModeToggle from "@/components/DarkModeToggle";

const PortalSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Legal Aid Hub</h1>
          <p className="text-muted-foreground">Select your portal to continue</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="border-2 border-portal-blue/40 bg-card hover:border-portal-blue hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            onClick={() => navigate("/client-login")}
          >
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-portal-blue/10 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-portal-blue" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Client Portal</h2>
              <p className="text-sm text-muted-foreground">Access your legal cases</p>
            </CardContent>
          </Card>

          <Card
            className="border-2 border-portal-green/40 bg-card hover:border-portal-green hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            onClick={() => navigate("/lawyer-login")}
          >
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-portal-green/10 flex items-center justify-center">
                <Scale className="h-8 w-8 text-portal-green" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Lawyer Portal</h2>
              <p className="text-sm text-muted-foreground">Professional case management</p>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PortalSelection;

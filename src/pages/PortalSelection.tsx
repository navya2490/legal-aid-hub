import { useNavigate, Link } from "react-router-dom";
import { Briefcase, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PortalSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-[28px] font-bold text-foreground">
            Legal Consultation Platform
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Please select how you want to access the platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Client Card */}
          <Card className="border-2 border-portal-blue bg-secondary hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-portal-blue/10 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-portal-blue" />
              </div>
              <h2 className="text-[20px] font-bold text-foreground">Client Portal</h2>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                Submit cases, track progress, and communicate with your assigned lawyer
              </p>
              <Button
                className="w-full bg-portal-blue hover:bg-portal-blue/90 text-portal-blue-foreground"
                size="lg"
                onClick={() => navigate("/client-login")}
              >
                Login as Client
              </Button>
              <Link
                to="/register?role=client"
                className="text-sm text-portal-blue hover:underline"
              >
                Register as Client
              </Link>
            </CardContent>
          </Card>

          {/* Lawyer Card */}
          <Card className="border-2 border-portal-green bg-secondary hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-portal-green/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-portal-green" />
              </div>
              <h2 className="text-[20px] font-bold text-foreground">Lawyer Portal</h2>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                Manage cases, communicate with clients, and update case status
              </p>
              <Button
                className="w-full bg-portal-green hover:bg-portal-green/90 text-portal-green-foreground"
                size="lg"
                onClick={() => navigate("/lawyer-login")}
              >
                Login as Lawyer
              </Button>
              <Link
                to="/register?role=lawyer"
                className="text-sm text-portal-green hover:underline"
              >
                Register as Lawyer
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;

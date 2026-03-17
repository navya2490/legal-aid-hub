import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, FileText, ArrowRight, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const CaseSubmitted: React.FC = () => {
  const [searchParams] = useSearchParams();
  const caseRef = searchParams.get("ref") || "N/A";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center px-6 py-4">
          <Scale className="h-5 w-5 text-primary mr-2" />
          <span className="text-lg font-bold text-foreground">LegalConnect</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Case Submitted Successfully!</h1>
          <p className="text-muted-foreground mb-6">
            Your case has been submitted and is now under review. You will be notified once a lawyer has been assigned.
          </p>

          <div className="rounded-lg border border-border bg-card p-4 mb-8">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Case Reference Number</p>
            <div className="flex items-center justify-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-foreground font-mono tracking-wider">{caseRef}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Please save this number for your records.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/dashboard/client">
                Go to Dashboard <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/submit-case">Submit Another Case</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseSubmitted;

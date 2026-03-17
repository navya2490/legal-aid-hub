import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Scale, Briefcase, MessageSquare, LogOut, Users } from "lucide-react";

const LawyerDashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">LegalConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-accent px-3 py-1">
              <Briefcase className="h-3 w-3 text-accent-foreground" />
              <span className="text-xs font-medium text-accent-foreground">Lawyer</span>
            </div>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Lawyer Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage your assigned cases and client communications.</p>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Briefcase className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">Assigned Cases</h3>
            <p className="text-sm text-muted-foreground">Review and work on cases assigned to you.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">Messages</h3>
            <p className="text-sm text-muted-foreground">Communicate with your clients securely.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Users className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">My Clients</h3>
            <p className="text-sm text-muted-foreground">View all clients you're currently advising.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LawyerDashboard;

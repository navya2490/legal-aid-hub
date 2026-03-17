import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Scale, FileText, MessageSquare, LogOut, User, Plus } from "lucide-react";

const ClientDashboard: React.FC = () => {
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
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Client Dashboard</h1>
        <p className="text-muted-foreground mb-8">Welcome back! Manage your legal cases and consultations.</p>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <FileText className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">My Cases</h3>
            <p className="text-sm text-muted-foreground">View and manage your submitted legal cases.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">Messages</h3>
            <p className="text-sm text-muted-foreground">Communicate with your assigned lawyer.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <User className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">Profile</h3>
            <p className="text-sm text-muted-foreground">Update your personal information.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;

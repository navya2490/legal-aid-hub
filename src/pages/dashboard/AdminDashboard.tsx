import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Scale, Shield, Users, BarChart3, LogOut } from "lucide-react";

const AdminDashboard: React.FC = () => {
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
            <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1">
              <Shield className="h-3 w-3 text-destructive" />
              <span className="text-xs font-medium text-destructive">Admin</span>
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Platform management and oversight.</p>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Users className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">User Management</h3>
            <p className="text-sm text-muted-foreground">Manage all users, lawyers, and their roles.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">Analytics</h3>
            <p className="text-sm text-muted-foreground">Monitor platform metrics and performance.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Shield className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">Security</h3>
            <p className="text-sm text-muted-foreground">Review security logs and access controls.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

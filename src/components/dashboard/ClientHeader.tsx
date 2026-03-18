import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Scale, LogOut, User, Bell } from "lucide-react";

const ClientHeader: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground tracking-tight">LegalConnect</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;

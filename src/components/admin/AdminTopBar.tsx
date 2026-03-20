import React from "react";
import { Bell, LogOut, Search, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DarkModeToggle from "@/components/DarkModeToggle";
import type { AdminView } from "./AdminSidebar";

const VIEW_LABELS: Record<AdminView, string> = {
  dashboard: "Dashboard",
  cases: "Cases Management",
  users: "Users Management",
  advocates: "Advocates Management",
  audit: "Audit Logs",
  settings: "System Settings",
  analytics: "Analytics",
  reports: "Reports",
};

interface Props {
  activeView: AdminView;
  userName: string;
  userEmail: string;
  employeeId: string;
  onSignOut: () => void;
}

const AdminTopBar: React.FC<Props> = ({ activeView, userName, userEmail, employeeId, onSignOut }) => {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4 sticky top-0 z-30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="text-muted-foreground">Admin</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground truncate">{VIEW_LABELS[activeView]}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <DarkModeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center">3</span>
        </Button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="h-7 w-7 rounded-full bg-portal-purple/10 flex items-center justify-center">
                <Shield className="h-3.5 w-3.5 text-portal-purple" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium leading-none">{userName}</p>
                <p className="text-[10px] text-muted-foreground">{employeeId}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
              <p className="text-xs text-portal-purple font-mono mt-0.5">{employeeId}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-3.5 w-3.5 mr-2" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="text-destructive">
              <LogOut className="h-3.5 w-3.5 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminTopBar;

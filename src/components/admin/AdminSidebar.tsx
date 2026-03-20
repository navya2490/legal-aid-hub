import React from "react";
import { 
  LayoutDashboard, FolderOpen, Users, Scale, ClipboardList, 
  Settings, BarChart3, FileText, LogOut, ChevronLeft, ChevronRight, Shield, Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type AdminView = 
  | "dashboard" | "cases" | "users" | "advocates" 
  | "audit" | "settings" | "analytics" | "reports" | "contacts";

const NAV_ITEMS: { id: AdminView; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "cases", label: "Cases Management", icon: FolderOpen },
  { id: "users", label: "Users Management", icon: Users },
  { id: "advocates", label: "Advocates Management", icon: Scale },
  { id: "audit", label: "Audit Logs", icon: ClipboardList },
  { id: "settings", label: "System Settings", icon: Settings },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "contacts", label: "Contact Submissions", icon: Inbox },
];

interface Props {
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<Props> = ({ activeView, onViewChange, collapsed, onToggle }) => {
  return (
    <aside
      className={cn(
        "h-screen sticky top-0 border-r border-border bg-card flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-2 p-4 border-b border-border", collapsed && "justify-center")}>
        <div className="h-8 w-8 rounded-lg bg-portal-purple flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-foreground truncate">Legal Aid Hub</p>
            <p className="text-[10px] text-muted-foreground">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          const btn = (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-portal-purple/10 text-portal-purple"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5 shrink-0", isActive && "text-portal-purple")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return btn;
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full" onClick={onToggle}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <><ChevronLeft className="h-4 w-4 mr-2" /><span>Collapse</span></>
          )}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

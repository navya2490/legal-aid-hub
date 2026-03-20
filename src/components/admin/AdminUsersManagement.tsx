import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, UserPlus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface UserRow {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  created_at: string;
  role: string;
}

const AdminUsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("client");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const { data: usersData } = await supabase
        .from("users")
        .select("user_id, full_name, email, phone, city, state, is_active, created_at");

      if (usersData && roles) {
        const roleMap = new Map<string, string>();
        roles.forEach((r) => roleMap.set(r.user_id, r.role));
        setUsers(
          usersData.map((u) => ({ ...u, role: roleMap.get(u.user_id) || "client" }))
        );
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = users.filter((u) => {
    const matchesTab = u.role === tab;
    const matchesSearch = !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleActive = async (userId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("users")
      .update({ is_active: !currentActive })
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to update user status");
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, is_active: !currentActive } : u))
      );
      toast.success(`User ${!currentActive ? "activated" : "deactivated"}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Users Management</h2>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="client">Clients</TabsTrigger>
          <TabsTrigger value="lawyer">Advocates</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium text-sm">{u.full_name}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{u.phone || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {[u.city, u.state].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.is_active ? "default" : "secondary"}>
                      {u.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleActive(u.user_id, u.is_active)}>
                          {u.is_active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">Showing {filtered.length} {tab}s</p>
    </div>
  );
};

export default AdminUsersManagement;

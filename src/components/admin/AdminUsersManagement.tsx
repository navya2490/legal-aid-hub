import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, MoreHorizontal, ShieldCheck, UserX, UserPlus } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

  // Add Employee dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ full_name: "", email: "", password: "", employee_id: "" });
  const [addingEmployee, setAddingEmployee] = useState(false);

  // Make Admin confirmation
  const [makeAdminUser, setMakeAdminUser] = useState<UserRow | null>(null);
  const [promotingAdmin, setPromotingAdmin] = useState(false);

  const fetchUsers = async () => {
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

  useEffect(() => {
    fetchUsers();
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

  const handleMakeAdmin = async () => {
    if (!makeAdminUser) return;
    setPromotingAdmin(true);

    // Update user_roles: insert admin role
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: makeAdminUser.user_id, role: "admin" as const }, { onConflict: "user_id,role" });

    if (error) {
      toast.error("Failed to promote user to admin");
    } else {
      toast.success(`${makeAdminUser.full_name} has been promoted to Admin`);
      setMakeAdminUser(null);
      fetchUsers();
    }
    setPromotingAdmin(false);
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.email || !newEmployee.password || !newEmployee.full_name || !newEmployee.employee_id) {
      toast.error("All fields are required");
      return;
    }
    if (!/^EMP-\d{5}$/.test(newEmployee.employee_id)) {
      toast.error("Employee ID must follow format EMP-XXXXX (e.g. EMP-00002)");
      return;
    }

    setAddingEmployee(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-admin", {
        body: {
          email: newEmployee.email,
          password: newEmployee.password,
          full_name: newEmployee.full_name,
          employee_id: newEmployee.employee_id,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to create employee");
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success(`Admin employee ${newEmployee.email} created successfully`);
        setAddDialogOpen(false);
        setNewEmployee({ full_name: "", email: "", password: "", employee_id: "" });
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create employee");
    }
    setAddingEmployee(false);
  };

  const generateEmployeeId = () => {
    const adminCount = users.filter((u) => u.role === "admin").length;
    const nextId = `EMP-${String(adminCount + 1).padStart(5, "0")}`;
    setNewEmployee((prev) => ({ ...prev, employee_id: nextId }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Users Management</h2>
        <Button size="sm" onClick={() => { setAddDialogOpen(true); generateEmployeeId(); }}>
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add Employee
        </Button>
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
                        {u.role !== "admin" && (
                          <DropdownMenuItem onClick={() => setMakeAdminUser(u)}>
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        {u.role !== "admin" && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          onClick={() => toggleActive(u.user_id, u.is_active)}
                          className={u.is_active ? "text-destructive focus:text-destructive" : ""}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          {u.is_active ? "Deactivate Account" : "Activate Account"}
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

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee (Admin)</DialogTitle>
            <DialogDescription>Create a new admin account with an Employee ID. Share credentials securely with the new employee.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={newEmployee.full_name} onChange={(e) => setNewEmployee((p) => ({ ...p, full_name: e.target.value }))} placeholder="Enter full name" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee((p) => ({ ...p, email: e.target.value }))} placeholder="employee@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" value={newEmployee.password} onChange={(e) => setNewEmployee((p) => ({ ...p, password: e.target.value }))} placeholder="Minimum 8 characters" />
            </div>
            <div className="space-y-1.5">
              <Label>Employee ID</Label>
              <Input value={newEmployee.employee_id} onChange={(e) => setNewEmployee((p) => ({ ...p, employee_id: e.target.value }))} placeholder="EMP-00002" />
              <p className="text-xs text-muted-foreground">Format: EMP-XXXXX</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee} disabled={addingEmployee}>
              {addingEmployee && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Create Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Make Admin Confirmation Dialog */}
      <Dialog open={!!makeAdminUser} onOpenChange={(open) => !open && setMakeAdminUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to give <strong>{makeAdminUser?.full_name}</strong> ({makeAdminUser?.email}) admin privileges? This grants full system access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMakeAdminUser(null)}>Cancel</Button>
            <Button onClick={handleMakeAdmin} disabled={promotingAdmin} variant="destructive">
              {promotingAdmin && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Confirm Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersManagement;

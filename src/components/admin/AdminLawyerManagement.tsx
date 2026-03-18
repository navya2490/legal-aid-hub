import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Loader2, Search, Save } from "lucide-react";
import { toast } from "sonner";

interface LawyerRow {
  lawyer_id: string;
  user_id: string;
  specializations: string[];
  current_caseload: number;
  max_caseload: number;
  years_of_experience: number;
  is_available: boolean;
  bar_license_number: string;
  user_name: string;
  email: string;
}

const AdminLawyerManagement: React.FC = () => {
  const [lawyers, setLawyers] = useState<LawyerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState<Record<string, { max_caseload?: number; is_available?: boolean }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchLawyers = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from("lawyer_profiles")
      .select("lawyer_id, user_id, specializations, current_caseload, max_caseload, years_of_experience, is_available, bar_license_number");

    if (error) {
      toast.error("Failed to load lawyers");
      setLoading(false);
      return;
    }

    const enriched: LawyerRow[] = [];
    for (const p of profiles || []) {
      const { data: u } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("user_id", p.user_id)
        .maybeSingle();
      enriched.push({
        ...p,
        user_name: u?.full_name || "Unknown",
        email: u?.email || "",
      });
    }
    setLawyers(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  const handleEdit = (lawyerId: string, field: "max_caseload" | "is_available", value: number | boolean) => {
    setEdits((prev) => ({
      ...prev,
      [lawyerId]: { ...prev[lawyerId], [field]: value },
    }));
  };

  const handleSave = async (lawyer: LawyerRow) => {
    const edit = edits[lawyer.lawyer_id];
    if (!edit) return;

    setSaving(lawyer.lawyer_id);
    const { error } = await supabase
      .from("lawyer_profiles")
      .update({
        max_caseload: edit.max_caseload ?? lawyer.max_caseload,
        is_available: edit.is_available ?? lawyer.is_available,
      })
      .eq("lawyer_id", lawyer.lawyer_id);

    if (error) {
      toast.error("Failed to update lawyer profile");
    } else {
      toast.success(`Updated ${lawyer.user_name}'s profile`);
      setEdits((prev) => {
        const next = { ...prev };
        delete next[lawyer.lawyer_id];
        return next;
      });
      fetchLawyers();
    }
    setSaving(null);
  };

  const filtered = lawyers.filter(
    (l) =>
      !search ||
      l.user_name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.specializations.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search lawyers by name, email, or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Specializations</TableHead>
              <TableHead>Caseload</TableHead>
              <TableHead>Max</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="hidden sm:table-cell">Experience</TableHead>
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
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No lawyers found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((l) => {
                const edit = edits[l.lawyer_id];
                const maxCl = edit?.max_caseload ?? l.max_caseload;
                const avail = edit?.is_available ?? l.is_available;
                const loadPct = maxCl > 0 ? (l.current_caseload / maxCl) * 100 : 0;
                const hasChanges = !!edit;

                return (
                  <TableRow key={l.lawyer_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{l.user_name}</p>
                        <p className="text-xs text-muted-foreground">{l.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {l.specializations.slice(0, 2).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                        {l.specializations.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{l.specializations.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[80px]">
                        <span className="text-xs">{l.current_caseload}/{maxCl}</span>
                        <Progress value={loadPct} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={maxCl}
                        onChange={(e) => handleEdit(l.lawyer_id, "max_caseload", parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={avail}
                        onCheckedChange={(v) => handleEdit(l.lawyer_id, "is_available", v)}
                      />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {l.years_of_experience} yrs
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasChanges || saving === l.lawyer_id}
                        onClick={() => handleSave(l)}
                      >
                        {saving === l.lawyer_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminLawyerManagement;

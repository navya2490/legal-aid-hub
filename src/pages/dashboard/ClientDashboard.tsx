import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ClientHeader from "@/components/dashboard/ClientHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import CaseFilters from "@/components/dashboard/CaseFilters";
import CaseCard from "@/components/dashboard/CaseCard";
import { useClientCases } from "@/hooks/useClientCases";

const ClientDashboard: React.FC = () => {
  const { data: cases = [], isLoading, error } = useClientCases();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredCases = useMemo(() => {
    let result = [...cases];

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.case_reference_number.toLowerCase().includes(q) ||
          c.issue_category.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      if (sortBy === "oldest") return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return result;
  }, [cases, statusFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Cases</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your legal cases and track progress.</p>
          </div>
          <Button asChild>
            <Link to="/submit-case">
              <Plus className="h-4 w-4 mr-1.5" /> Submit New Case
            </Link>
          </Button>
        </div>

        {/* Stats */}
        {!isLoading && <DashboardStats cases={cases} />}

        {/* Filters */}
        <CaseFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Cases list */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[160px] rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive">Failed to load cases. Please try again.</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {cases.length === 0 ? "No cases yet" : "No matching cases"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {cases.length === 0
                  ? "Submit your first case to get started with legal assistance."
                  : "Try adjusting your filters or search query."}
              </p>
            </div>
            {cases.length === 0 && (
              <Button asChild>
                <Link to="/submit-case">
                  <Plus className="h-4 w-4 mr-1.5" /> Submit a Case
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCases.map((c) => (
              <CaseCard key={c.case_id} caseData={c} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;

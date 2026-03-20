import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

const REPORTS = [
  { id: "monthly", title: "Monthly Cases Report", desc: "Summary of all cases filed this month", icon: Calendar },
  { id: "advocate", title: "Advocate Performance Report", desc: "Performance metrics for all registered advocates", icon: FileText },
  { id: "satisfaction", title: "Client Satisfaction Report", desc: "Client feedback and satisfaction scores", icon: FileText },
  { id: "revenue", title: "Revenue Report", desc: "Platform revenue breakdown by category", icon: FileText },
  { id: "state", title: "State-wise Analysis", desc: "Case distribution across Indian states", icon: FileText },
  { id: "category", title: "Category-wise Analysis", desc: "Breakdown by legal category", icon: FileText },
];

const AdminReports: React.FC = () => {
  const [generating, setGenerating] = useState<string | null>(null);

  const generateReport = (id: string) => {
    setGenerating(id);
    setTimeout(() => {
      setGenerating(null);
      toast.success("Report generated successfully");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Reports</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <r.icon className="h-4 w-4 text-portal-purple" />
                <CardTitle className="text-sm">{r.title}</CardTitle>
              </div>
              <CardDescription className="text-xs">{r.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateReport(r.id)}
                disabled={generating === r.id}
              >
                {generating === r.id ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <FileText className="h-3 w-3 mr-1" />
                )}
                Generate
              </Button>
              <Button size="sm" variant="ghost">
                <Download className="h-3 w-3 mr-1" /> PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Report History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No reports generated yet. Generate a report above to see it here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;

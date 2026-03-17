import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IssueDetailsData, SPECIALIZATIONS } from "@/lib/caseValidation";

interface Props {
  form: UseFormReturn<IssueDetailsData>;
}

const StepIssueDetails: React.FC<Props> = ({ form }) => {
  const { register, formState: { errors }, setValue, watch } = form;
  const issueCategory = watch("issueCategory");
  const issueDescription = watch("issueDescription") || "";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Issue Details</h3>
        <p className="text-sm text-muted-foreground">Tell us about your legal issue.</p>
      </div>

      <div className="space-y-2">
        <Label>Issue Category *</Label>
        <Select value={issueCategory || ""} onValueChange={(v) => setValue("issueCategory", v, { shouldValidate: true })}>
          <SelectTrigger className={errors.issueCategory ? "border-destructive" : ""}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALIZATIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.issueCategory && <p className="text-xs text-destructive">{errors.issueCategory.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="issueDescription">Issue Description *</Label>
        <Textarea
          id="issueDescription"
          placeholder="Describe your legal issue in detail..."
          rows={8}
          {...register("issueDescription")}
          className={errors.issueDescription ? "border-destructive" : ""}
        />
        <div className="flex justify-between">
          {errors.issueDescription ? (
            <p className="text-xs text-destructive">{errors.issueDescription.message}</p>
          ) : (
            <span />
          )}
          <span className={`text-xs ${issueDescription.length > 5000 ? "text-destructive" : "text-muted-foreground"}`}>
            {issueDescription.length} / 5000
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepIssueDetails;

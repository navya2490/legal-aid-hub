import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuestionsUrgencyData, URGENCY_OPTIONS } from "@/lib/caseValidation";
import { AlertTriangle, Clock, Zap, AlertCircle } from "lucide-react";

const urgencyIcons = {
  Low: Clock,
  Medium: AlertCircle,
  High: AlertTriangle,
  Critical: Zap,
};

const urgencyColors = {
  Low: "border-primary/30 bg-primary/5 text-primary",
  Medium: "border-warning/30 bg-warning/5 text-warning",
  High: "border-destructive/30 bg-destructive/5 text-destructive",
  Critical: "border-destructive bg-destructive/10 text-destructive",
};

interface Props {
  form: UseFormReturn<QuestionsUrgencyData>;
}

const StepQuestionsUrgency: React.FC<Props> = ({ form }) => {
  const { register, formState: { errors }, setValue, watch } = form;
  const specificQuestions = watch("specificQuestions") || "";
  const urgencyLevel = watch("urgencyLevel");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Questions & Urgency</h3>
        <p className="text-sm text-muted-foreground">What specific questions do you have and how urgent is this matter?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specificQuestions">Specific Questions *</Label>
        <Textarea
          id="specificQuestions"
          placeholder="What specific legal questions do you need answered?"
          rows={6}
          {...register("specificQuestions")}
          className={errors.specificQuestions ? "border-destructive" : ""}
        />
        <div className="flex justify-between">
          {errors.specificQuestions ? (
            <p className="text-xs text-destructive">{errors.specificQuestions.message}</p>
          ) : (
            <span />
          )}
          <span className={`text-xs ${specificQuestions.length > 2000 ? "text-destructive" : "text-muted-foreground"}`}>
            {specificQuestions.length} / 2000
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Urgency Level *</Label>
        {errors.urgencyLevel && <p className="text-xs text-destructive">{errors.urgencyLevel.message}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {URGENCY_OPTIONS.map((option) => {
            const Icon = urgencyIcons[option.value];
            const isSelected = urgencyLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue("urgencyLevel", option.value, { shouldValidate: true })}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                  isSelected
                    ? urgencyColors[option.value] + " border-current"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isSelected ? "" : "text-muted-foreground"}`} />
                <div>
                  <div className={`text-sm font-medium ${isSelected ? "" : "text-foreground"}`}>{option.label}</div>
                  <div className={`text-xs ${isSelected ? "opacity-80" : "text-muted-foreground"}`}>{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepQuestionsUrgency;

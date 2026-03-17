import React from "react";
import { Check } from "lucide-react";

interface StepProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">{stepLabels[currentStep - 1]}</span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <div key={step} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-2 w-full rounded-full transition-colors ${
                  isCompleted
                    ? "bg-primary"
                    : isCurrent
                    ? "bg-primary/60"
                    : "bg-muted"
                }`}
              />
              <div className="hidden sm:flex items-center gap-1">
                {isCompleted && <Check className="h-3 w-3 text-primary" />}
                <span
                  className={`text-xs ${
                    isCompleted || isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {stepLabels[i]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgressIndicator;

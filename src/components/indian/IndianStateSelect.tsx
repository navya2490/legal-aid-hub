import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDIAN_STATES } from "@/lib/indiaData";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  error?: boolean;
  placeholder?: string;
  className?: string;
}

const IndianStateSelect: React.FC<Props> = ({
  value,
  onValueChange,
  error,
  placeholder = "Select State / UT",
  className,
}) => (
  <Select value={value || ""} onValueChange={onValueChange}>
    <SelectTrigger className={cn(error && "border-destructive", className)}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="max-h-[280px]">
      {INDIAN_STATES.map((state) => (
        <SelectItem key={state} value={state}>{state}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default IndianStateSelect;

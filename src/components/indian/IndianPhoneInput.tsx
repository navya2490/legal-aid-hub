import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
}

const IndianPhoneInput: React.FC<Props> = ({ value, onChange, error, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digits, limit to 10
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(digits);
  };

  const formatted = value
    ? value.replace(/(\d{5})(\d{0,5})/, "$1 $2").trim()
    : "";

  return (
    <div className={cn("flex gap-2", className)}>
      <div className="flex items-center justify-center px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground shrink-0 w-[72px]">
        +91
      </div>
      <Input
        type="tel"
        inputMode="numeric"
        placeholder="98765 43210"
        value={formatted}
        onChange={handleChange}
        className={cn("flex-1", error && "border-destructive")}
        maxLength={11} // 10 digits + 1 space
      />
    </div>
  );
};

export default IndianPhoneInput;

export const validateIndianPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 0 || digits.length === 10;
};

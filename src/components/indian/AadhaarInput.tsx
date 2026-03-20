import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
}

const AadhaarInput: React.FC<Props> = ({ value, onChange, error, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
    onChange(digits);
  };

  // Format as XXXX-XXXX-XXXX
  const formatted = value
    ? value.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join("-")
      )
    : "";

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder="1234-5678-9012"
      value={formatted}
      onChange={handleChange}
      className={cn(error && "border-destructive", className)}
      maxLength={14} // 12 digits + 2 dashes
    />
  );
};

export default AadhaarInput;

export const validateAadhaar = (aadhaar: string): boolean => {
  if (!aadhaar) return true; // optional
  const digits = aadhaar.replace(/\D/g, "");
  return digits.length === 12;
};

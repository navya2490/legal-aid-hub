import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
}

// PAN format: XXXXX0000X (5 letters, 4 digits, 1 letter)
const PANInput: React.FC<Props> = ({ value, onChange, error, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().slice(0, 10);
    // Only allow valid PAN characters
    const cleaned = val.replace(/[^A-Z0-9]/g, "");
    onChange(cleaned);
  };

  return (
    <Input
      type="text"
      placeholder="ABCDE1234F"
      value={value || ""}
      onChange={handleChange}
      className={cn("uppercase", error && "border-destructive", className)}
      maxLength={10}
    />
  );
};

export default PANInput;

export const validatePAN = (pan: string): boolean => {
  if (!pan) return true; // optional
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
};

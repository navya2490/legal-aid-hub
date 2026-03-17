import React from "react";
import { getPasswordStrength } from "@/lib/validation";

interface PasswordStrengthBarProps {
  password: string;
}

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  if (!password) return null;

  const { score, label, className } = getPasswordStrength(password);

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? className : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium">{label}</span>
      </p>
    </div>
  );
};

export default PasswordStrengthBar;

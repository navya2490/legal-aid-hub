import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCitiesByState } from "@/lib/indiaData";
import { cn } from "@/lib/utils";

interface Props {
  state: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: boolean;
  placeholder?: string;
  className?: string;
}

const IndianCitySelect: React.FC<Props> = ({
  state,
  value,
  onValueChange,
  error,
  placeholder = "Select City",
  className,
}) => {
  const cities = getCitiesByState(state);

  return (
    <Select value={value || ""} onValueChange={onValueChange} disabled={!state || cities.length === 0}>
      <SelectTrigger className={cn(error && "border-destructive", className)}>
        <SelectValue placeholder={!state ? "Select state first" : placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[280px]">
        {cities.map((city) => (
          <SelectItem key={city} value={city}>{city}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default IndianCitySelect;

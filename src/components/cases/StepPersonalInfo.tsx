import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersonalInfoData, COUNTRY_CODES, COUNTRIES } from "@/lib/caseValidation";

interface Props {
  form: UseFormReturn<PersonalInfoData>;
}

const StepPersonalInfo: React.FC<Props> = ({ form }) => {
  const { register, formState: { errors }, setValue, watch } = form;
  const phoneCountryCode = watch("phoneCountryCode") || "+1";
  const country = watch("country");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Personal Information</h3>
        <p className="text-sm text-muted-foreground">Please provide your contact details.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input id="fullName" placeholder="John Doe" {...register("fullName")} className={errors.fullName ? "border-destructive" : ""} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationalId">National ID / Passport</Label>
          <Input id="nationalId" placeholder="ID number" {...register("nationalId")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" placeholder="john@example.com" {...register("email")} className={errors.email ? "border-destructive" : ""} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Phone</Label>
          <div className="flex gap-2">
            <Select value={phoneCountryCode} onValueChange={(v) => setValue("phoneCountryCode", v)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.code} {c.country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Phone number" {...register("phone")} className="flex-1" />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Address</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input id="addressLine1" placeholder="Street address" {...register("addressLine1")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input id="addressLine2" placeholder="Apartment, suite, etc." {...register("addressLine2")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="City" {...register("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State / Province</Label>
            <Input id="state" placeholder="State" {...register("state")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input id="postalCode" placeholder="Postal code" {...register("postalCode")} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={country || ""} onValueChange={(v) => setValue("country", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPersonalInfo;

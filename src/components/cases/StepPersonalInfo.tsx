import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonalInfoData } from "@/lib/caseValidation";
import IndianStateSelect from "@/components/indian/IndianStateSelect";
import IndianCitySelect from "@/components/indian/IndianCitySelect";
import IndianPhoneInput from "@/components/indian/IndianPhoneInput";
import AadhaarInput from "@/components/indian/AadhaarInput";
import PANInput from "@/components/indian/PANInput";

interface Props {
  form: UseFormReturn<PersonalInfoData>;
}

const StepPersonalInfo: React.FC<Props> = ({ form }) => {
  const { register, formState: { errors }, setValue, watch } = form;
  const state = watch("state") || "";
  const city = watch("city") || "";
  const phone = watch("phone") || "";
  const aadhaar = watch("aadhaar") || "";
  const pan = watch("pan") || "";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Personal Information</h3>
        <p className="text-sm text-muted-foreground">Please provide your contact details.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input id="fullName" placeholder="Rajesh Kumar" {...register("fullName")} className={errors.fullName ? "border-destructive" : ""} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" placeholder="rajesh@example.com" {...register("email")} className={errors.email ? "border-destructive" : ""} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Phone (+91)</Label>
          <IndianPhoneInput
            value={phone}
            onChange={(v) => setValue("phone", v, { shouldValidate: true })}
            error={!!errors.phone}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Aadhaar Number <span className="text-muted-foreground text-xs">(Optional)</span></Label>
          <AadhaarInput
            value={aadhaar}
            onChange={(v) => setValue("aadhaar", v, { shouldValidate: true })}
            error={!!errors.aadhaar}
          />
          {errors.aadhaar && <p className="text-xs text-destructive">{errors.aadhaar.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>PAN Number <span className="text-muted-foreground text-xs">(Optional)</span></Label>
          <PANInput
            value={pan}
            onChange={(v) => setValue("pan", v, { shouldValidate: true })}
            error={!!errors.pan}
          />
          {errors.pan && <p className="text-xs text-destructive">{errors.pan.message}</p>}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Address in India</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input id="addressLine1" placeholder="Street address" {...register("addressLine1")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input id="addressLine2" placeholder="Apartment, floor, landmark" {...register("addressLine2")} />
          </div>
          <div className="space-y-2">
            <Label>State / Union Territory</Label>
            <IndianStateSelect
              value={state}
              onValueChange={(v) => {
                setValue("state", v, { shouldValidate: true });
                setValue("city", "", { shouldValidate: true }); // Reset city when state changes
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <IndianCitySelect
              state={state}
              value={city}
              onValueChange={(v) => setValue("city", v, { shouldValidate: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">PIN Code</Label>
            <Input
              id="postalCode"
              placeholder="110001"
              inputMode="numeric"
              maxLength={6}
              {...register("postalCode")}
              className={errors.postalCode ? "border-destructive" : ""}
            />
            {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPersonalInfo;

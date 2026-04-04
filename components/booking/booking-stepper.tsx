"use client";

import { Check } from "lucide-react";

const STEPS = [
  { label: "Service" },
  { label: "Stylist" },
  { label: "Date & Time" },
  { label: "Confirm" },
];

interface BookingStepperProps {
  currentStep: number;
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < currentStep
                  ? "bg-gold text-background"
                  : i === currentStep
                    ? "border-2 border-gold text-gold"
                    : "border border-white/10 text-cream/30"
              }`}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                i <= currentStep ? "text-cream" : "text-cream/30"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-8 sm:w-12 ${
                i < currentStep ? "bg-gold" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

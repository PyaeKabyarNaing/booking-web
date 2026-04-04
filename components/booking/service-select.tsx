"use client";

import { Clock, DollarSign, Check } from "lucide-react";
import type { Service } from "@/lib/types/database";

interface ServiceSelectProps {
  services: Service[];
  selectedId: string | null;
  onSelect: (service: Service) => void;
}

export function ServiceSelect({
  services,
  selectedId,
  onSelect,
}: ServiceSelectProps) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-cream">
        Choose a Service
      </h2>
      <p className="mt-2 text-sm text-cream/50">
        Select the service you&apos;d like to book.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const isSelected = selectedId === service.id;
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={`group relative rounded-2xl border p-5 text-left transition-all ${
                isSelected
                  ? "border-gold bg-gold/10 shadow-lg shadow-gold/10"
                  : "border-white/5 bg-charcoal-light hover:border-gold/20"
              }`}
            >
              {isSelected && (
                <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-gold">
                  <Check className="h-3.5 w-3.5 text-background" />
                </div>
              )}
              <h3
                className={`font-serif text-lg font-semibold ${
                  isSelected ? "text-gold" : "text-cream"
                }`}
              >
                {service.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/50">
                {service.description}
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm text-cream/40">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {service.duration_minutes} min
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  {service.price}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

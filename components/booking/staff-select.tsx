"use client";

import { Check, User } from "lucide-react";
import type { StaffWithServices } from "@/lib/types/database";

interface StaffSelectProps {
  staff: StaffWithServices[];
  selectedServiceId: string;
  selectedStaffId: string | null;
  onSelect: (staff: StaffWithServices) => void;
}

export function StaffSelect({
  staff,
  selectedServiceId,
  selectedStaffId,
  onSelect,
}: StaffSelectProps) {
  const filteredStaff = staff.filter((s) =>
    s.staff_services.some((ss) => ss.service_id === selectedServiceId)
  );

  if (filteredStaff.length === 0) {
    return (
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-cream">
          Choose a Stylist
        </h2>
        <p className="mt-4 text-cream/50">
          No stylists are available for this service right now. Please try
          another service.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-cream">
        Choose Your Stylist
      </h2>
      <p className="mt-2 text-sm text-cream/50">
        Select your preferred stylist for this service.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStaff.map((member) => {
          const isSelected = selectedStaffId === member.id;
          return (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              className={`group relative rounded-2xl border p-6 text-left transition-all ${
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
              <div className="flex items-center gap-4">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    className="h-14 w-14 rounded-full border border-gold/20 object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-charcoal">
                    <User className="h-6 w-6 text-gold/60" />
                  </div>
                )}
                <div>
                  <h3
                    className={`font-serif text-lg font-semibold ${
                      isSelected ? "text-gold" : "text-cream"
                    }`}
                  >
                    {member.name}
                  </h3>
                </div>
              </div>
              {member.bio && (
                <p className="mt-3 text-sm leading-relaxed text-cream/50">
                  {member.bio}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

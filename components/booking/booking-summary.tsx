"use client";

import { Calendar, Clock, DollarSign, User, Scissors, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import type { Service, StaffWithServices } from "@/lib/types/database";
import type { TimeSlot } from "@/lib/utils/time-slots";

interface BookingSummaryProps {
  service: Service;
  staff: StaffWithServices;
  date: string;
  timeSlot: TimeSlot;
  loading: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export function BookingSummary({
  service,
  staff,
  date,
  timeSlot,
  loading,
  onConfirm,
  onBack,
}: BookingSummaryProps) {
  const { user, signInWithGoogle } = useAuth();

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-cream">
        Review & Confirm
      </h2>
      <p className="mt-2 text-sm text-cream/50">
        Please review your booking details below.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-charcoal-light p-6">
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <Scissors className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-wider text-cream/40">
                Service
              </p>
              <p className="mt-1 font-serif text-lg font-semibold text-cream">
                {service.name}
              </p>
            </div>
          </div>

          <div className="border-t border-white/5" />

          <div className="flex items-start gap-4">
            <User className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-wider text-cream/40">
                Stylist
              </p>
              <p className="mt-1 font-semibold text-cream">{staff.name}</p>
            </div>
          </div>

          <div className="border-t border-white/5" />

          <div className="flex items-start gap-4">
            <Calendar className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-wider text-cream/40">
                Date
              </p>
              <p className="mt-1 font-semibold text-cream">{formattedDate}</p>
            </div>
          </div>

          <div className="border-t border-white/5" />

          <div className="flex items-start gap-4">
            <Clock className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-wider text-cream/40">
                Time
              </p>
              <p className="mt-1 font-semibold text-cream">
                {timeSlot.start} &ndash; {timeSlot.end} ({service.duration_minutes} min)
              </p>
            </div>
          </div>

          <div className="border-t border-white/5" />

          <div className="flex items-start gap-4">
            <DollarSign className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-wider text-cream/40">
                Price
              </p>
              <p className="mt-1 text-xl font-bold text-gold">
                ${service.price}
              </p>
              <p className="text-xs text-cream/40">Pay at the salon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          onClick={onBack}
          className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-cream transition-colors hover:border-gold/30 hover:text-gold"
        >
          Go Back
        </button>

        {user ? (
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full bg-gold px-8 py-3 text-sm font-semibold text-background transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        ) : (
          <button
            onClick={() => signInWithGoogle("/booking")}
            className="flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-background transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
          >
            <LogIn className="h-4 w-4" />
            Sign in to Confirm
          </button>
        )}
      </div>
    </div>
  );
}

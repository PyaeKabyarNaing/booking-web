"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingStepper } from "./booking-stepper";
import { ServiceSelect } from "./service-select";
import { StaffSelect } from "./staff-select";
import { DateTimeSelect } from "./datetime-select";
import { BookingSummary } from "./booking-summary";
import { useAuth } from "@/components/auth/auth-provider";
import { ArrowRight } from "lucide-react";
import type { Service, StaffWithServices } from "@/lib/types/database";
import type { TimeSlot } from "@/lib/utils/time-slots";

interface BookingFlowProps {
  services: Service[];
  staff: StaffWithServices[];
}

export function BookingFlow({ services, staff }: BookingFlowProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffWithServices | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    if (selectedStaff) {
      const staffStillValid = selectedStaff.staff_services.some(
        (ss) => ss.service_id === service.id
      );
      if (!staffStillValid) {
        setSelectedStaff(null);
        setSelectedDate(null);
        setSelectedTimeSlot(null);
      }
    }
  };

  const handleStaffSelect = (member: StaffWithServices) => {
    setSelectedStaff(member);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };

  const handleDateTimeSelect = (date: string, slot: TimeSlot) => {
    setSelectedDate(date);
    setSelectedTimeSlot(slot);
  };

  const handleConfirm = async () => {
    if (
      !user ||
      !selectedService ||
      !selectedStaff ||
      !selectedDate ||
      !selectedTimeSlot
    )
      return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService.id,
          staff_id: selectedStaff.id,
          booking_date: selectedDate,
          start_time: selectedTimeSlot.start,
          end_time: selectedTimeSlot.end,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create booking");
      }

      const { booking } = await res.json();
      router.push(`/booking/confirmation/${booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!selectedService;
      case 1:
        return !!selectedStaff;
      case 2:
        return !!selectedDate && !!selectedTimeSlot;
      default:
        return false;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <BookingStepper currentStep={step} />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-white/5 bg-charcoal p-6 sm:p-8">
        {step === 0 && (
          <ServiceSelect
            services={services}
            selectedId={selectedService?.id ?? null}
            onSelect={handleServiceSelect}
          />
        )}

        {step === 1 && selectedService && (
          <StaffSelect
            staff={staff}
            selectedServiceId={selectedService.id}
            selectedStaffId={selectedStaff?.id ?? null}
            onSelect={handleStaffSelect}
          />
        )}

        {step === 2 && selectedStaff && selectedService && (
          <DateTimeSelect
            staffId={selectedStaff.id}
            serviceDuration={selectedService.duration_minutes}
            selectedDate={selectedDate}
            selectedTime={selectedTimeSlot?.start ?? null}
            onSelect={handleDateTimeSelect}
          />
        )}

        {step === 3 &&
          selectedService &&
          selectedStaff &&
          selectedDate &&
          selectedTimeSlot && (
            <BookingSummary
              service={selectedService}
              staff={selectedStaff}
              date={selectedDate}
              timeSlot={selectedTimeSlot}
              loading={loading}
              onConfirm={handleConfirm}
              onBack={() => setStep(2)}
            />
          )}
      </div>

      {/* Navigation buttons (for steps 0-2) */}
      {step < 3 && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-cream transition-colors hover:border-gold/30 hover:text-gold disabled:opacity-0"
          >
            Back
          </button>
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="group flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-background transition-all hover:bg-gold-light disabled:opacity-30"
          >
            Continue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  );
}

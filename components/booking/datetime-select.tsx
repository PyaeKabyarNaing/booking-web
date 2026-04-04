"use client";

import { useState, useEffect } from "react";
import {
  format,
  addDays,
  startOfDay,
  isSameDay,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateTimeSlots, type TimeSlot } from "@/lib/utils/time-slots";
import type { StaffSchedule } from "@/lib/types/database";

interface DateTimeSelectProps {
  staffId: string;
  serviceDuration: number;
  selectedDate: string | null;
  selectedTime: string | null;
  onSelect: (date: string, timeSlot: TimeSlot) => void;
}

export function DateTimeSelect({
  staffId,
  serviceDuration,
  selectedDate,
  selectedTime,
  onSelect,
}: DateTimeSelectProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [activeDate, setActiveDate] = useState<Date | null>(null);

  const today = startOfDay(new Date());
  const startDay = addDays(today, weekOffset * 7);
  const dateRange = Array.from({ length: 7 }, (_, i) => addDays(startDay, i));

  useEffect(() => {
    if (!activeDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      const supabase = createClient();
      const dayOfWeek = getDay(activeDate);
      const dateStr = format(activeDate, "yyyy-MM-dd");

      const [scheduleRes, bookingsRes] = await Promise.all([
        supabase
          .from("staff_schedules")
          .select("*")
          .eq("staff_id", staffId)
          .eq("day_of_week", dayOfWeek)
          .single(),
        supabase
          .from("bookings")
          .select("start_time, end_time")
          .eq("staff_id", staffId)
          .eq("booking_date", dateStr)
          .in("status", ["pending", "confirmed"]),
      ]);

      const schedule: StaffSchedule | null = scheduleRes.data;
      const bookings = bookingsRes.data ?? [];

      const generated = generateTimeSlots(schedule, bookings, serviceDuration);
      setSlots(generated);
      setLoadingSlots(false);
    };

    fetchSlots();
  }, [activeDate, staffId, serviceDuration]);

  const handleDateClick = (date: Date) => {
    setActiveDate(date);
    setSlots([]);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available || !activeDate) return;
    onSelect(format(activeDate, "yyyy-MM-dd"), slot);
  };

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-cream">
        Pick a Date & Time
      </h2>
      <p className="mt-2 text-sm text-cream/50">
        Select your preferred date and available time slot.
      </p>

      {/* Date picker */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
            disabled={weekOffset === 0}
            className="rounded-full p-2 text-cream/50 transition-colors hover:bg-white/5 hover:text-cream disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-cream/70">
            {format(dateRange[0], "MMM d")} &ndash;{" "}
            {format(dateRange[6], "MMM d, yyyy")}
          </span>
          <button
            onClick={() => setWeekOffset(Math.min(1, weekOffset + 1))}
            disabled={weekOffset >= 1}
            className="rounded-full p-2 text-cream/50 transition-colors hover:bg-white/5 hover:text-cream disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2">
          {dateRange.map((date) => {
            const isActive = activeDate && isSameDay(date, activeDate);
            const isSelected = selectedDate === format(date, "yyyy-MM-dd");
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`flex flex-col items-center rounded-xl py-3 text-center transition-all ${
                  isSelected
                    ? "border border-gold bg-gold/10 text-gold"
                    : isActive
                      ? "border border-gold/30 bg-charcoal-light text-cream"
                      : "border border-transparent text-cream/50 hover:bg-charcoal-light hover:text-cream"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider">
                  {format(date, "EEE")}
                </span>
                <span className="mt-1 text-lg font-semibold">
                  {format(date, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {activeDate && (
        <div className="mt-8">
          <h3 className="flex items-center gap-2 text-sm font-medium text-cream/70">
            <Clock className="h-4 w-4" />
            Available Times for {format(activeDate, "EEEE, MMMM d")}
          </h3>

          {loadingSlots ? (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-lg bg-white/5"
                />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="mt-4 text-sm text-cream/40">
              No available time slots for this date. The stylist may not work on
              this day.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {slots.map((slot) => {
                const isSelected =
                  selectedDate === format(activeDate, "yyyy-MM-dd") &&
                  selectedTime === slot.start;
                return (
                  <button
                    key={slot.start}
                    onClick={() => handleSlotClick(slot)}
                    disabled={!slot.available}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-gold text-background shadow-lg shadow-gold/20"
                        : slot.available
                          ? "border border-white/10 text-cream hover:border-gold/30 hover:text-gold"
                          : "border border-white/5 text-cream/20 line-through"
                    }`}
                  >
                    {slot.start}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

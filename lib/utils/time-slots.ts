import { format, addMinutes, parse, isBefore, isEqual } from "date-fns";
import type { StaffSchedule, Booking } from "@/lib/types/database";

export interface TimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
  available: boolean;
}

/**
 * Generate available time slots for a given staff member on a specific date.
 * Takes the staff's schedule for that day of week and subtracts existing bookings.
 */
export function generateTimeSlots(
  schedule: StaffSchedule | null,
  existingBookings: Pick<Booking, "start_time" | "end_time">[],
  serviceDurationMinutes: number
): TimeSlot[] {
  if (!schedule || !schedule.is_available) return [];

  const slots: TimeSlot[] = [];
  const scheduleStart = parseTime(schedule.start_time);
  const scheduleEnd = parseTime(schedule.end_time);

  let current = scheduleStart;

  while (true) {
    const slotEnd = addMinutes(current, serviceDurationMinutes);
    if (isBefore(scheduleEnd, slotEnd) || isEqual(slotEnd, addMinutes(scheduleEnd, 1))) {
      if (isBefore(scheduleEnd, slotEnd)) break;
    }

    const startStr = format(current, "HH:mm");
    const endStr = format(slotEnd, "HH:mm");

    const isBooked = existingBookings.some((booking) => {
      const bookingStart = parseTime(booking.start_time);
      const bookingEnd = parseTime(booking.end_time);
      // Overlap check: slot overlaps with booking if slot starts before booking ends
      // AND slot ends after booking starts
      return isBefore(current, bookingEnd) && isBefore(bookingStart, slotEnd);
    });

    slots.push({
      start: startStr,
      end: endStr,
      available: !isBooked,
    });

    current = addMinutes(current, 30); // 30-minute step intervals

    if (!isBefore(current, scheduleEnd) && !isEqual(current, scheduleEnd)) break;
    if (isBefore(scheduleEnd, addMinutes(current, serviceDurationMinutes))) break;
  }

  return slots;
}

function parseTime(timeStr: string): Date {
  // Handle HH:mm:ss or HH:mm format
  const clean = timeStr.substring(0, 5);
  return parse(clean, "HH:mm", new Date(2000, 0, 1));
}

import { describe, it, expect } from "vitest";
import { generateTimeSlots, type TimeSlot } from "@/lib/utils/time-slots";
import type { StaffSchedule } from "@/lib/types/database";

function makeSchedule(
  overrides: Partial<StaffSchedule> = {}
): StaffSchedule {
  return {
    id: "sched-1",
    staff_id: "staff-1",
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
    is_available: true,
    ...overrides,
  };
}

describe("generateTimeSlots", () => {
  it("returns empty array when schedule is null", () => {
    expect(generateTimeSlots(null, [], 60)).toEqual([]);
  });

  it("returns empty array when staff is unavailable", () => {
    const schedule = makeSchedule({ is_available: false });
    expect(generateTimeSlots(schedule, [], 60)).toEqual([]);
  });

  it("generates correct 30-min-step slots for a 60-min service", () => {
    const schedule = makeSchedule({ start_time: "09:00", end_time: "11:00" });
    const slots = generateTimeSlots(schedule, [], 60);

    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toEqual({ start: "09:00", end: "10:00", available: true });
    expect(slots[1]).toEqual({ start: "09:30", end: "10:30", available: true });
    expect(slots[2]).toEqual({ start: "10:00", end: "11:00", available: true });

    // 10:30 would end at 11:30 which is past schedule end
    const overflowing = slots.find((s) => s.start === "10:30");
    expect(overflowing).toBeUndefined();
  });

  it("generates correct slots for a 30-min service", () => {
    const schedule = makeSchedule({ start_time: "09:00", end_time: "10:30" });
    const slots = generateTimeSlots(schedule, [], 30);

    const starts = slots.map((s) => s.start);
    expect(starts).toEqual(["09:00", "09:30", "10:00"]);
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it("marks overlapping slots as unavailable", () => {
    const schedule = makeSchedule({ start_time: "09:00", end_time: "12:00" });
    const bookings = [{ start_time: "10:00:00", end_time: "11:00:00" }];

    const slots = generateTimeSlots(schedule, bookings, 60);

    const at0900 = slots.find((s) => s.start === "09:00")!;
    expect(at0900.available).toBe(true);

    // 09:30–10:30 overlaps with 10:00–11:00
    const at0930 = slots.find((s) => s.start === "09:30")!;
    expect(at0930.available).toBe(false);

    // 10:00–11:00 fully overlaps
    const at1000 = slots.find((s) => s.start === "10:00")!;
    expect(at1000.available).toBe(false);

    // 11:00–12:00 starts right when booking ends — no overlap
    const at1100 = slots.find((s) => s.start === "11:00")!;
    expect(at1100.available).toBe(true);
  });

  it("handles multiple bookings", () => {
    const schedule = makeSchedule({ start_time: "09:00", end_time: "13:00" });
    const bookings = [
      { start_time: "09:00:00", end_time: "09:30:00" },
      { start_time: "11:00:00", end_time: "12:00:00" },
    ];

    const slots = generateTimeSlots(schedule, bookings, 30);

    const at0900 = slots.find((s) => s.start === "09:00")!;
    expect(at0900.available).toBe(false);

    const at0930 = slots.find((s) => s.start === "09:30")!;
    expect(at0930.available).toBe(true);

    const at1100 = slots.find((s) => s.start === "11:00")!;
    expect(at1100.available).toBe(false);

    const at1200 = slots.find((s) => s.start === "12:00")!;
    expect(at1200.available).toBe(true);
  });

  it("handles HH:mm:ss time format in schedule", () => {
    const schedule = makeSchedule({
      start_time: "09:00:00",
      end_time: "10:00:00",
    });
    const slots = generateTimeSlots(schedule, [], 30);
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].start).toBe("09:00");
  });

  it("returns empty when service is longer than the schedule window", () => {
    const schedule = makeSchedule({ start_time: "09:00", end_time: "09:30" });
    const slots = generateTimeSlots(schedule, [], 60);
    expect(slots).toEqual([]);
  });
});

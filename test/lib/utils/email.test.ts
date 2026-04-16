import { describe, it, expect, vi } from "vitest";
import { sendBookingConfirmation } from "@/lib/utils/email";
import type { BookingWithDetails } from "@/lib/types/database";

const mockBooking: BookingWithDetails = {
  id: "booking-1",
  customer_id: "cust-1",
  staff_id: "staff-1",
  service_id: "svc-1",
  booking_date: "2025-06-15",
  start_time: "10:00:00",
  end_time: "11:00:00",
  status: "confirmed",
  notes: null,
  created_at: "2025-06-01T00:00:00Z",
  service: {
    id: "svc-1",
    name: "Haircut",
    description: null,
    duration_minutes: 60,
    price: 30,
    image_url: null,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  staff: {
    id: "staff-1",
    name: "Jane Doe",
    bio: null,
    avatar_url: null,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  customer: {
    id: "cust-1",
    full_name: "John Smith",
    email: "john@example.com",
    phone: null,
    avatar_url: null,
    role: "customer",
    created_at: "2025-01-01T00:00:00Z",
  },
};

describe("sendBookingConfirmation", () => {
  it("logs the booking details (stub)", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await sendBookingConfirmation(mockBooking);

    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("booking-1"),
      expect.stringContaining("john@example.com"),
      expect.stringContaining("Haircut"),
      expect.stringContaining("Jane Doe"),
      expect.stringContaining("2025-06-15")
    );

    consoleSpy.mockRestore();
  });

  it("resolves without throwing", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    await expect(sendBookingConfirmation(mockBooking)).resolves.toBeUndefined();
    vi.restoreAllMocks();
  });
});

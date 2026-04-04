import type { BookingWithDetails } from "@/lib/types/database";

/**
 * Send booking confirmation email.
 * This is a stub -- integrate with Resend, SendGrid, or Supabase Edge Functions
 * when ready for production email delivery.
 */
export async function sendBookingConfirmation(
  booking: BookingWithDetails
): Promise<void> {
  console.log(
    `[Email Stub] Confirmation for booking ${booking.id}`,
    `Customer: ${booking.customer.email}`,
    `Service: ${booking.service.name}`,
    `Staff: ${booking.staff.name}`,
    `Date: ${booking.booking_date} at ${booking.start_time}`
  );
}

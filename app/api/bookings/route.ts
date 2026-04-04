import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateBookingSchema = z.object({
  service_id: z.string().uuid(),
  staff_id: z.string().uuid(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = CreateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { service_id, staff_id, booking_date, start_time, end_time, notes } =
      parsed.data;

    // Verify service exists and is active
    const { data: service } = await supabase
      .from("services")
      .select("id")
      .eq("id", service_id)
      .eq("is_active", true)
      .single();

    if (!service) {
      return NextResponse.json(
        { error: "Service not found or inactive" },
        { status: 404 }
      );
    }

    // Verify staff exists and is active
    const { data: staff } = await supabase
      .from("staff")
      .select("id")
      .eq("id", staff_id)
      .eq("is_active", true)
      .single();

    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found or inactive" },
        { status: 404 }
      );
    }

    // Check for conflicting bookings
    const { data: conflicts } = await supabase
      .from("bookings")
      .select("id")
      .eq("staff_id", staff_id)
      .eq("booking_date", booking_date)
      .in("status", ["pending", "confirmed"])
      .lt("start_time", end_time + ":00")
      .gt("end_time", start_time + ":00");

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Create the booking
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        service_id,
        staff_id,
        booking_date,
        start_time: start_time + ":00",
        end_time: end_time + ":00",
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Booking insert error:", error);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

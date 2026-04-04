import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const [serviceRes, staffRes, customerRes] = await Promise.all([
      supabase.from("services").select("*").eq("id", data.service_id).single(),
      supabase.from("staff").select("*").eq("id", data.staff_id).single(),
      supabase
        .from("profiles")
        .select("*")
        .eq("id", data.customer_id)
        .single(),
    ]);

    return NextResponse.json({
      booking: {
        ...data,
        service: serviceRes.data,
        staff: staffRes.data,
        customer: customerRes.data,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

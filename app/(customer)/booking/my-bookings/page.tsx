import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  MyBookingsList,
  type CustomerBookingRow,
} from "@/components/booking/my-bookings-list";
import type { Service, Staff } from "@/lib/types/database";

export const metadata = {
  title: "My Bookings | Luxe Salon",
  description: "View your upcoming and past appointments and their status.",
};

function unwrapJoined<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function MyBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      booking_date,
      start_time,
      end_time,
      status,
      service:services(*),
      staff:staff(*)
    `
    )
    .eq("customer_id", user.id)
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    console.error("My bookings fetch error:", error);
  }

  const bookings: CustomerBookingRow[] = (data ?? []).map((row) => ({
    id: row.id,
    booking_date: row.booking_date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    service: unwrapJoined<Service>(row.service as Service | Service[] | null),
    staff: unwrapJoined<Staff>(row.staff as Staff | Staff[] | null),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/booking"
        className="mb-8 inline-flex items-center gap-2 text-sm text-cream/60 transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to booking
      </Link>

      <header className="mb-10">
        <h1 className="font-serif text-3xl font-bold text-cream sm:text-4xl">
          My bookings
        </h1>
        <p className="mt-2 text-cream/50">
          All of your appointments in one place, with the latest status for each.
        </p>
      </header>

      <MyBookingsList bookings={bookings} />
    </div>
  );
}

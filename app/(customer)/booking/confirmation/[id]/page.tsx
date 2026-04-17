import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Scissors,
  DollarSign,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Booking Confirmed | Luxe Salon",
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data } = await supabase
    .from("bookings")
    .select(
      `
      *,
      service:services(*),
      staff:staff(*),
      customer:profiles(*)
    `
    )
    .eq("id", id)
    .single();

  if (!data) {
    redirect("/booking");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booking = data as any;

  const service = Array.isArray(booking.service)
    ? booking.service[0]
    : booking.service;
  const staff = Array.isArray(booking.staff) ? booking.staff[0] : booking.staff;

  const formattedDate = new Date(
    booking.booking_date + "T00:00:00"
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
        <h1 className="mt-4 font-serif text-3xl font-bold text-cream">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-cream/50">
          Your appointment has been successfully booked. We look forward to
          seeing you!
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-charcoal p-6 sm:p-8">
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <Scissors className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-wider text-cream/40">
                Service
              </p>
              <p className="mt-1 font-serif text-lg font-semibold text-cream">
                {service?.name}
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
              <p className="mt-1 font-semibold text-cream">{staff?.name}</p>
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
                {booking.start_time.substring(0, 5)} &ndash;{" "}
                {booking.end_time.substring(0, 5)}
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
                ${service?.price}
              </p>
              <p className="text-xs text-cream/40">Pay at the salon</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-gold/5 p-4">
          <p className="text-xs text-cream/50">
            <span className="font-semibold text-gold">Booking ID:</span>{" "}
            {booking.id}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/booking"
          className="group flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-background transition-all hover:bg-gold-light"
        >
          Book Another Appointment
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center rounded-full border border-white/10 px-8 py-3 text-sm font-medium text-cream transition-colors hover:border-gold/30 hover:text-gold"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

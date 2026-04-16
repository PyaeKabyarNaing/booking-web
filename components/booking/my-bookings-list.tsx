import Link from "next/link";
import { Calendar, Clock, Scissors, User, ArrowRight } from "lucide-react";
import type { BookingStatus, Service, Staff } from "@/lib/types/database";

export interface CustomerBookingRow {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  service: Service | null;
  staff: Staff | null;
}

const statusStyles: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-200 ring-amber-500/20",
  },
  confirmed: {
    label: "Confirmed",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-200 ring-emerald-500/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-red-500/25 bg-red-500/10 text-red-200 ring-red-500/20",
  },
  completed: {
    label: "Completed",
    className:
      "border-sky-500/25 bg-sky-500/10 text-sky-200 ring-sky-500/20",
  },
};

export function MyBookingsList({ bookings }: { bookings: CustomerBookingRow[] }) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-3xl border border-white/5 bg-charcoal px-6 py-16 text-center sm:px-10">
        <p className="font-serif text-xl text-cream">No appointments yet</p>
        <p className="mt-2 text-sm text-cream/50">
          When you book a service, your appointments will appear here with their
          current status.
        </p>
        <Link
          href="/booking"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-background transition-all hover:bg-gold-light"
        >
          Book an appointment
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {bookings.map((b) => {
        const formattedDate = new Date(
          `${b.booking_date}T12:00:00`
        ).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const timeLabel = `${b.start_time.substring(0, 5)} – ${b.end_time.substring(0, 5)}`;
        const badge = statusStyles[b.status];

        return (
          <li key={b.id}>
            <div className="rounded-2xl border border-white/5 bg-charcoal p-5 transition-colors hover:border-white/10 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <Scissors className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-cream/40">
                        Service
                      </p>
                      <p className="font-serif text-lg font-semibold text-cream">
                        {b.service?.name ?? "Service"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 border-t border-white/5 pt-3 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-cream/40">
                          Stylist
                        </p>
                        <p className="text-sm font-medium text-cream">
                          {b.staff?.name ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-cream/40">
                          Date
                        </p>
                        <p className="text-sm font-medium text-cream">
                          {formattedDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 sm:col-span-2">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-cream/40">
                          Time
                        </p>
                        <p className="text-sm font-medium text-cream">{timeLabel}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                  <Link
                    href={`/booking/confirmation/${b.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:border-gold/40 hover:text-gold"
                  >
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

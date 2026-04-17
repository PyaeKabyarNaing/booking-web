import { createClient } from "@/lib/supabase/server";
import { BookingsTable } from "@/components/admin/bookings-table";

export const metadata = {
  title: "Bookings | Admin | Luxe Salon",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select(
      "*, service:services(name), staff:staff(name), customer:profiles(full_name, email)"
    )
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });

  const bookings = (data ?? []).map((b: Record<string, unknown>) => {
    const service = Array.isArray(b.service) ? b.service[0] : b.service;
    const staff = Array.isArray(b.staff) ? b.staff[0] : b.staff;
    const customer = Array.isArray(b.customer) ? b.customer[0] : b.customer;
    return {
      id: b.id as string,
      booking_date: b.booking_date as string,
      start_time: b.start_time as string,
      end_time: b.end_time as string,
      status: b.status as string,
      notes: b.notes as string | null,
      service_name: (service as Record<string, unknown>)?.name as string || "—",
      staff_name: (staff as Record<string, unknown>)?.name as string || "—",
      customer_name: (customer as Record<string, unknown>)?.full_name as string || "",
      customer_email: (customer as Record<string, unknown>)?.email as string || "",
    };
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all customer bookings
        </p>
      </div>
      <BookingsTable bookings={bookings} initialStatus={status} />
    </div>
  );
}

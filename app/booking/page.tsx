import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking/booking-flow";
import type { StaffWithServices } from "@/lib/types/database";

export const metadata = {
  title: "Book an Appointment | Luxe Salon",
  description: "Choose your service, stylist, and preferred time slot.",
};

export default async function BookingPage() {
  const supabase = await createClient();

  const [servicesRes, staffRes] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("price"),
    supabase
      .from("staff")
      .select("*, staff_services(service_id)")
      .eq("is_active", true)
      .order("name"),
  ]);

  if (servicesRes.error) {
    console.error("Services fetch error:", servicesRes.error);
  }
  if (staffRes.error) {
    console.error("Staff fetch error:", staffRes.error);
  }

  const services = servicesRes.data ?? [];
  const staff = (staffRes.data ?? []) as StaffWithServices[];

  return <BookingFlow services={services} staff={staff} />;
}

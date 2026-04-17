import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StaffServicesForm } from "@/components/admin/staff-services-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Staff Services | Admin | Luxe Salon",
};

export default async function StaffServicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [staffRes, servicesRes, assignedRes] = await Promise.all([
    supabase.from("staff").select("id, name").eq("id", id).single(),
    supabase.from("services").select("*").order("name"),
    supabase
      .from("staff_services")
      .select("service_id")
      .eq("staff_id", id),
  ]);

  if (!staffRes.data) notFound();

  const assignedIds = (assignedRes.data ?? []).map((r) => r.service_id);

  return (
    <div>
      <Link
        href="/admin/staff"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Staff
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Assign Services
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Choose which services {staffRes.data.name} can perform
        </p>
      </div>
      <StaffServicesForm
        staffId={id}
        staffName={staffRes.data.name}
        allServices={servicesRes.data ?? []}
        assignedIds={assignedIds}
      />
    </div>
  );
}

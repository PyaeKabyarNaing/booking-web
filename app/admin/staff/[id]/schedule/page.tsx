import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StaffScheduleForm } from "@/components/admin/staff-schedule-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Staff Schedule | Admin | Luxe Salon",
};

export default async function StaffSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [staffRes, schedRes] = await Promise.all([
    supabase.from("staff").select("id, name").eq("id", id).single(),
    supabase
      .from("staff_schedules")
      .select("*")
      .eq("staff_id", id)
      .order("day_of_week"),
  ]);

  if (!staffRes.data) notFound();

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
          Weekly Schedule
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Set availability for {staffRes.data.name}
        </p>
      </div>
      <StaffScheduleForm
        staffId={id}
        staffName={staffRes.data.name}
        schedules={(schedRes.data ?? []).map((s) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          is_available: s.is_available,
        }))}
      />
    </div>
  );
}

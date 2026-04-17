import { createClient } from "@/lib/supabase/server";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [bookingsRes, pendingRes, servicesRes, staffRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, service:services(name, price), staff:staff(name), customer:profiles(full_name, email)")
      .eq("booking_date", today)
      .order("start_time"),
    supabase
      .from("bookings")
      .select("id", { count: "exact" })
      .eq("status", "pending"),
    supabase.from("services").select("id", { count: "exact" }),
    supabase.from("staff").select("id", { count: "exact" }),
  ]);

  const todayBookings = bookingsRes.data ?? [];
  const pendingCount = pendingRes.count ?? 0;
  const servicesCount = servicesRes.count ?? 0;
  const staffCount = staffRes.count ?? 0;

  const stats = [
    {
      label: "Today's Bookings",
      value: todayBookings.length,
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending Approval",
      value: pendingCount,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      href: "/admin/bookings?status=pending",
    },
    {
      label: "Total Services",
      value: servicesCount,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600",
      href: "/admin/services",
    },
    {
      label: "Staff Members",
      value: staffCount,
      icon: DollarSign,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/staff",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your salon today
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-lg p-2.5 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Today&apos;s Schedule
          </h2>
          <Link
            href="/admin/bookings"
            className="text-sm font-medium text-amber-700 hover:text-amber-800"
          >
            View all bookings
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          {todayBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                No bookings scheduled for today
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Time</th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Service
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Staff
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {todayBookings.map((b: Record<string, unknown>) => {
                  const service = Array.isArray(b.service)
                    ? b.service[0]
                    : b.service;
                  const staff = Array.isArray(b.staff)
                    ? b.staff[0]
                    : b.staff;
                  const customer = Array.isArray(b.customer)
                    ? b.customer[0]
                    : b.customer;
                  return (
                    <tr key={b.id as string} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                        {(b.start_time as string)?.substring(0, 5)} –{" "}
                        {(b.end_time as string)?.substring(0, 5)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {(customer as Record<string, unknown>)?.full_name as string ||
                          ((customer as Record<string, unknown>)?.email as string) ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {(service as Record<string, unknown>)?.name as string || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {(staff as Record<string, unknown>)?.name as string || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status as string} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${styles[status] || "bg-gray-50 text-gray-700 ring-gray-200"}`}
    >
      {status}
    </span>
  );
}

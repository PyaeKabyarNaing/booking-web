import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata = {
  title: "Staff | Admin | Luxe Salon",
};

export default async function AdminStaffPage() {
  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("staff")
    .select("*, staff_services(service_id, service:services(name))")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your salon&apos;s team members
          </p>
        </div>
        <Link
          href="/admin/staff/new"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-800"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        {!staff || staff.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No staff members yet. Add your first team member.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 font-medium text-gray-500">Services</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((s: Record<string, unknown>) => {
                const staffServices = (s.staff_services as Record<string, unknown>[]) ?? [];
                return (
                  <tr key={s.id as string} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.avatar_url ? (
                          <img
                            src={s.avatar_url as string}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                            {(s.name as string)?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {s.name as string}
                          </div>
                          {(s.bio as string) && (
                            <div className="mt-0.5 truncate text-xs text-gray-400 max-w-xs">
                              {s.bio as string}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {staffServices.length === 0 ? (
                          <span className="text-xs text-gray-400">None assigned</span>
                        ) : (
                          staffServices.slice(0, 3).map((ss: Record<string, unknown>, i: number) => {
                            const svc = ss.service as Record<string, unknown>;
                            return (
                              <span
                                key={i}
                                className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                              >
                                {svc?.name as string}
                              </span>
                            );
                          })
                        )}
                        {staffServices.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{staffServices.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                          s.is_active
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-gray-50 text-gray-500 ring-gray-200"
                        }`}
                      >
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/staff/${s.id}/edit`}
                          className="text-xs font-medium text-amber-700 hover:text-amber-800"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/staff/${s.id}/services`}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          Services
                        </Link>
                        <Link
                          href={`/admin/staff/${s.id}/schedule`}
                          className="text-xs font-medium text-purple-600 hover:text-purple-700"
                        >
                          Schedule
                        </Link>
                        <DeleteButton
                          endpoint={`/api/admin/staff/${s.id}`}
                          label="staff member"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

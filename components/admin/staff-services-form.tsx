"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@/lib/types/database";

interface StaffServicesFormProps {
  staffId: string;
  staffName: string;
  allServices: Service[];
  assignedIds: string[];
}

export function StaffServicesForm({
  staffId,
  staffName,
  allServices,
  assignedIds,
}: StaffServicesFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedIds));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/services`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_ids: Array.from(selected) }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        setLoading(false);
        return;
      }
      router.push("/admin/staff");
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <p className="mb-4 text-sm text-gray-500">
        Select the services that <strong>{staffName}</strong> can perform.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
        {allServices.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">
            No services available. Create services first.
          </p>
        ) : (
          allServices.map((s) => (
            <label
              key={s.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selected.has(s.id)}
                onChange={() => toggle(s.id)}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  {s.name}
                </span>
                <span className="ml-2 text-xs text-gray-400">
                  {s.duration_minutes}min · ${s.price}
                </span>
              </div>
              {!s.is_active && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                  Inactive
                </span>
              )}
            </label>
          ))
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Assignments"}
        </button>
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

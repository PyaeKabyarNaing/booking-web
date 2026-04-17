"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface ScheduleEntry {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface StaffScheduleFormProps {
  staffId: string;
  staffName: string;
  schedules: ScheduleEntry[];
}

function defaultSchedules(): ScheduleEntry[] {
  return DAYS.map((_, i) => ({
    day_of_week: i,
    start_time: "09:00",
    end_time: "17:00",
    is_available: i >= 1 && i <= 5,
  }));
}

export function StaffScheduleForm({
  staffId,
  staffName,
  schedules: initial,
}: StaffScheduleFormProps) {
  const router = useRouter();

  const merged = defaultSchedules().map((def) => {
    const existing = initial.find((s) => s.day_of_week === def.day_of_week);
    return existing
      ? {
          ...existing,
          start_time: existing.start_time.substring(0, 5),
          end_time: existing.end_time.substring(0, 5),
        }
      : def;
  });

  const [schedules, setSchedules] = useState<ScheduleEntry[]>(merged);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(dayIndex: number, field: keyof ScheduleEntry, value: string | boolean) {
    setSchedules((prev) =>
      prev.map((s) =>
        s.day_of_week === dayIndex ? { ...s, [field]: value } : s
      )
    );
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules }),
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
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-gray-500">
        Set weekly availability for <strong>{staffName}</strong>.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {schedules.map((s) => (
          <div
            key={s.day_of_week}
            className={`flex items-center gap-4 rounded-xl p-4 ring-1 transition-colors ${
              s.is_available
                ? "bg-white ring-gray-200"
                : "bg-gray-50 ring-gray-100"
            }`}
          >
            <label className="flex w-28 shrink-0 items-center gap-2">
              <input
                type="checkbox"
                checked={s.is_available}
                onChange={(e) =>
                  update(s.day_of_week, "is_available", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span
                className={`text-sm font-medium ${s.is_available ? "text-gray-900" : "text-gray-400"}`}
              >
                {DAYS[s.day_of_week]}
              </span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={s.start_time}
                onChange={(e) =>
                  update(s.day_of_week, "start_time", e.target.value)
                }
                disabled={!s.is_available}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-400">to</span>
              <input
                type="time"
                value={s.end_time}
                onChange={(e) =>
                  update(s.day_of_week, "end_time", e.target.value)
                }
                disabled={!s.is_available}
                className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Schedule"}
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

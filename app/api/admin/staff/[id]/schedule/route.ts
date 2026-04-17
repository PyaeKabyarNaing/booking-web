import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { z } from "zod";

const ScheduleEntrySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  is_available: z.boolean(),
});

const UpdateScheduleSchema = z.object({
  schedules: z.array(ScheduleEntrySchema),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: staffId } = await params;
    const result = await requireAdmin();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = UpdateScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { admin } = result;

    await admin.from("staff_schedules").delete().eq("staff_id", staffId);

    if (parsed.data.schedules.length > 0) {
      const rows = parsed.data.schedules.map((s) => ({
        staff_id: staffId,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        is_available: s.is_available,
      }));
      const { error } = await admin.from("staff_schedules").insert(rows);
      if (error) {
        return NextResponse.json(
          { error: "Failed to update schedule" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

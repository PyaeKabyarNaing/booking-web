import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { z } from "zod";

const UpdateStaffServicesSchema = z.object({
  service_ids: z.array(z.string().uuid()),
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
    const parsed = UpdateStaffServicesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { admin } = result;

    await admin.from("staff_services").delete().eq("staff_id", staffId);

    if (parsed.data.service_ids.length > 0) {
      const rows = parsed.data.service_ids.map((service_id) => ({
        staff_id: staffId,
        service_id,
      }));
      const { error } = await admin.from("staff_services").insert(rows);
      if (error) {
        return NextResponse.json(
          { error: "Failed to update staff services" },
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

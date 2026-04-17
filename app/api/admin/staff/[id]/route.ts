import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { z } from "zod";

const UpdateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requireAdmin();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = UpdateStaffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updateData = { ...parsed.data };
    if (updateData.avatar_url === "") updateData.avatar_url = undefined;

    const { admin } = result;
    const { data: staff, error } = await admin
      .from("staff")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update staff member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ staff });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await requireAdmin();
    if ("error" in result) return result.error;

    const { admin } = result;
    const { error } = await admin.from("staff").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete staff member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

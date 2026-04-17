import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { z } from "zod";

const CreateServiceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  duration_minutes: z.number().int().min(5),
  price: z.number().min(0),
  image_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const result = await requireAdmin();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = CreateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { admin } = result;
    const { data: service, error } = await admin
      .from("services")
      .insert({
        ...parsed.data,
        image_url: parsed.data.image_url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create service" },
        { status: 500 }
      );
    }

    return NextResponse.json({ service }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

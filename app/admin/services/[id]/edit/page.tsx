import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/admin/service-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Edit Service | Admin | Luxe Salon",
};

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (!service) notFound();

  return (
    <div>
      <Link
        href="/admin/services"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Services
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update details for &ldquo;{service.name}&rdquo;
        </p>
      </div>
      <ServiceForm service={service} />
    </div>
  );
}

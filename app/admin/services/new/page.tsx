import { ServiceForm } from "@/components/admin/service-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "New Service | Admin | Luxe Salon",
};

export default function NewServicePage() {
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
        <h1 className="text-2xl font-bold text-gray-900">New Service</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new service to your salon
        </p>
      </div>
      <ServiceForm />
    </div>
  );
}

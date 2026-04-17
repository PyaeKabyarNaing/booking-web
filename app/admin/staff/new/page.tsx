import { StaffForm } from "@/components/admin/staff-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "New Staff | Admin | Luxe Salon",
};

export default function NewStaffPage() {
  return (
    <div>
      <Link
        href="/admin/staff"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Staff
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Staff Member</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new team member to your salon
        </p>
      </div>
      <StaffForm />
    </div>
  );
}

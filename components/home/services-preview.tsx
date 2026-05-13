import { Clock, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Service } from "@/lib/types/database";

const PLACEHOLDER_SERVICES: Service[] = [
  {
    id: "1",
    name: "Signature Haircut",
    description:
      "A personalized cut crafted by our master stylists, including consultation, wash, cut, and style.",
    duration_minutes: 60,
    price: 85,
    image_url: null,
    is_active: true,
    created_at: "",
  },
  {
    id: "2",
    name: "Luxury Color",
    description:
      "Full color service using premium products for vibrant, long-lasting results with a luminous finish.",
    duration_minutes: 120,
    price: 180,
    image_url: null,
    is_active: true,
    created_at: "",
  },
  {
    id: "3",
    name: "Balayage & Highlights",
    description:
      "Hand-painted highlights for a natural, sun-kissed look that grows out beautifully.",
    duration_minutes: 150,
    price: 250,
    image_url: null,
    is_active: true,
    created_at: "",
  },
  {
    id: "4",
    name: "Keratin Treatment",
    description:
      "Smooth, frizz-free hair for up to 3 months with our premium keratin treatment.",
    duration_minutes: 180,
    price: 300,
    image_url: null,
    is_active: true,
    created_at: "",
  },
  {
    id: "5",
    name: "Bridal Styling",
    description:
      "Complete bridal hair styling including trial, day-of styling, and touch-ups for your perfect day.",
    duration_minutes: 120,
    price: 350,
    image_url: null,
    is_active: true,
    created_at: "",
  },
  {
    id: "6",
    name: "Scalp Therapy",
    description:
      "Rejuvenating scalp treatment with essential oils, massage, and deep conditioning.",
    duration_minutes: 45,
    price: 65,
    image_url: null,
    is_active: true,
    created_at: "",
  },
];

interface ServicesPreviewProps {
  services?: Service[];
}

export function ServicesPreview({ services }: ServicesPreviewProps) {
  const displayServices =
    services && services.length > 0 ? services : PLACEHOLDER_SERVICES;

  return (
    <section id="services" className="bg-charcoal py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
            What We Offer
          </span>
          <h2 className="mt-3 font-serif text-4xl font-bold text-cream">
            Our Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-cream/50">
            Each service is delivered with meticulous attention to detail,
            premium products, and a dedication to making you feel extraordinary.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayServices.map((service) => (
            <div
              key={service.id}
              className="group rounded-2xl border bg-charcoal-light p-6 transition-all border-gold/20 shadow-md shadow-gold/5"
            >
              <h3 className="font-serif text-xl font-semibold transition-colors text-gold">
                {service.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/50">
                {service.description}
              </p>
              <div className="mt-5 flex items-center gap-4 text-sm text-cream/40">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {service.duration_minutes} min
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  {service.price}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/booking"
            className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-background transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
          >
            Book an Appointment
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

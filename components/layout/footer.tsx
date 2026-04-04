import { Scissors } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-charcoal">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-gold" />
              <span className="font-serif text-lg font-bold tracking-wide text-cream">
                Luxe Salon
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-cream/50">
              Where elegance meets artistry. Experience premium hair and beauty
              services in a refined atmosphere.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gold">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/#services"
                  className="text-sm text-cream/50 transition-colors hover:text-gold"
                >
                  Our Services
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="text-sm text-cream/50 transition-colors hover:text-gold"
                >
                  Book Appointment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gold">
              Contact
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-cream/50">
              <li>123 Elegance Avenue, Suite 100</li>
              <li>New York, NY 10001</li>
              <li className="pt-1">info@luxesalon.com</li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-cream/30">
          &copy; {new Date().getFullYear()} Luxe Salon. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

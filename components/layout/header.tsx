"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Scissors } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-gold" />
          <span className="font-serif text-xl font-bold tracking-wide text-cream">
            Luxe Salon
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/#services"
            className="text-sm tracking-wide text-cream/70 transition-colors hover:text-gold"
          >
            Services
          </Link>
          <Link
            href="/#testimonials"
            className="text-sm tracking-wide text-cream/70 transition-colors hover:text-gold"
          >
            Testimonials
          </Link>
          <Link
            href="/booking"
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-background transition-colors hover:bg-gold-light"
          >
            Book Now
          </Link>
          <AuthButton />
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-cream md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-background/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-4 px-4 py-6">
            <Link
              href="/#services"
              onClick={() => setMobileOpen(false)}
              className="text-sm tracking-wide text-cream/70 transition-colors hover:text-gold"
            >
              Services
            </Link>
            <Link
              href="/#testimonials"
              onClick={() => setMobileOpen(false)}
              className="text-sm tracking-wide text-cream/70 transition-colors hover:text-gold"
            >
              Testimonials
            </Link>
            <Link
              href="/booking"
              onClick={() => setMobileOpen(false)}
              className="rounded-full bg-gold px-5 py-2 text-center text-sm font-semibold text-background transition-colors hover:bg-gold-light"
            >
              Book Now
            </Link>
            <div className="pt-2">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

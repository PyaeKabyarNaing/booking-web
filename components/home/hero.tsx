import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-charcoal to-background" />
      {/* Decorative circles */}
      <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-gold/3 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
              Premium Beauty Experience
            </span>
          </div>

          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-cream sm:text-6xl lg:text-7xl">
            Where Elegance
            <br />
            <span className="text-gradient-gold">Meets Artistry</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/60">
            Indulge in a world of refined beauty. Our master stylists craft
            personalized experiences that reveal your most radiant self.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="group flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-background transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
            >
              Book Your Experience
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/#services"
              className="flex items-center justify-center rounded-full border border-gold/30 px-8 py-3.5 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
            >
              Explore Services
            </Link>
          </div>

          <div className="mt-16 flex gap-12">
            <div>
              <p className="font-serif text-3xl font-bold text-gold">15+</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-cream/40">
                Years Experience
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-gold">50+</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-cream/40">
                Expert Stylists
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-gold">10k+</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-cream/40">
                Happy Clients
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Mitchell",
    text: "An absolutely transformative experience. The attention to detail and the welcoming atmosphere made me feel like royalty. My hair has never looked better.",
    rating: 5,
  },
  {
    id: 2,
    name: "James Chen",
    text: "I've been to many salons, but Luxe is in a league of its own. The stylists truly listen and deliver beyond expectations every single time.",
    rating: 5,
  },
  {
    id: 3,
    name: "Olivia Thompson",
    text: "From the moment you walk in, you can feel the luxury. My balayage turned out absolutely stunning. I've found my forever salon.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
            Client Love
          </span>
          <h2 className="mt-3 font-serif text-4xl font-bold text-cream">
            What Our Clients Say
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-white/5 bg-charcoal p-8"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-gold text-gold"
                  />
                ))}
              </div>
              <p className="mt-5 text-sm leading-relaxed text-cream/60">
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="mt-5 text-sm font-medium text-gold">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

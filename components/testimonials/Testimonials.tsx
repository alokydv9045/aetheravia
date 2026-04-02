"use client";

import Autoplay from "embla-carousel-autoplay";
import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Carousel as SCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Testimonial = {
  id: string;
  name: string;
  role?: string;
  rating?: number; // 1..5
  quote: string;
};

const DEFAULTS: Testimonial[] = [
  {
    id: "in-1",
    name: "Aarav Sharma",
    role: "Verified Buyer · New Delhi",
    rating: 5,
    quote:
      "Impressive quality and premium finish. Delivery was quick and packaging felt luxurious. Value for money!",
  },
  {
    id: "in-2",
    name: "Ananya Iyer",
    role: "Fashion Blogger · Bengaluru",
    rating: 5,
    quote:
      "The silhouettes and fabrics are stunning. Pairing was effortless — got compliments at a wedding!",
  },
  {
    id: "in-3",
    name: "Rohan Mehta",
    role: "Verified Buyer · Mumbai",
    rating: 4,
    quote:
      "Fits true to size and feels premium. Exchange process was smooth — customer care was helpful.",
  },
  {
    id: "in-4",
    name: "Ishita Gupta",
    role: "Stylist · Kolkata",
    rating: 5,
    quote:
      "Minimal, chic, and well-constructed. Great for festive layering and everyday elegance alike.",
  },
];

function Stars({ value = 5 }: { value?: number }) {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="flex items-center gap-1" aria-label={`${v} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < v ? "fill-yellow-400 text-yellow-400" : "text-base-content/30"}`}
        />
      ))}
    </div>
  );
}

export default function Testimonials({
  items,
  title = "What our customers say",
}: {
  items?: Testimonial[];
  title?: string;
}) {
  const [remote, setRemote] = useState<Testimonial[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items && items.length) return; // external data provided
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch('/api/testimonials', { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!cancelled) setRemote(Array.isArray(data?.items) ? data.items : []);
      })
      .catch((e) => !cancelled && setError(e?.message || 'Failed to load'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [items]);

  const data = useMemo(() => {
    if (items && items.length) return items;
    if (remote && remote.length) return remote;
    return DEFAULTS;
  }, [items, remote]);

  return (
    <section aria-label="Testimonials" className="mt-4 md:mt-10">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-xl font-semibold md:text-2xl">{title}</h2>
        {loading && <span className="text-xs opacity-60">Loading…</span>}
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
      <SCarousel
        opts={{ loop: true, align: "start", skipSnaps: false }}
        plugins={[Autoplay({ delay: 2800, stopOnMouseEnter: true, stopOnInteraction: false })]}
        className="relative"
      >
        <CarouselContent>
          {data.map((t) => (
            <CarouselItem key={t.id} className="md:basis-1/2 lg:basis-1/3">
              <article className="card bg-base-200 shadow-sm transition hover:shadow-md h-full">
                <div className="card-body gap-3">
                  {typeof t.rating === "number" && <Stars value={t.rating} />}
                  <p className="text-sm md:text-base leading-relaxed opacity-90">“{t.quote}”</p>
                  <div className="mt-2">
                    <p className="font-medium">{t.name}</p>
                    {t.role && <p className="text-xs opacity-70">{t.role}</p>}
                  </div>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-3 md:-left-4" />
        <CarouselNext className="-right-3 md:-right-4" />
      </SCarousel>
    </section>
  );
}

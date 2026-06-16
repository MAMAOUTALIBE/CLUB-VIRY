"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type HomeHeroSlide = {
  src: string;
  objectPosition?: string;
};

type HomeHeroCarouselProps = {
  slides: HomeHeroSlide[];
  intervalMs?: number;
};

export function HomeHeroCarousel({ slides, intervalMs = 5500 }: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = slides.length;

  const goTo = useCallback(
    (nextIndex: number) => {
      if (total === 0) return;
      setActiveIndex(((nextIndex % total) + total) % total);
    },
    [total]
  );

  const previous = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    if (total <= 1) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, total]);

  if (total === 0) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={`${slide.src}-${index}`}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={slide.src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: slide.objectPosition ?? "center" }}
          />
        </div>
      ))}

      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#001c10]/35 via-[#001c10]/10 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 z-[1] h-2/5 bg-gradient-to-t from-[#001c10]/30 to-transparent" aria-hidden="true" />

      {total > 1 ? (
        <div className="absolute bottom-28 right-4 z-[3] hidden items-center gap-3 sm:right-6 lg:flex lg:right-8">
          <button
            type="button"
            onClick={previous}
            aria-label="Photo précédente"
            className="focus-ring flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#001c10]/55 text-white shadow-lg transition hover:border-[#f7c600] hover:bg-[#001c10]/75 hover:text-[#f7c600]"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-[#001c10]/50 px-3 py-2 shadow-lg" aria-label="Photos du club">
            {slides.map((slide, index) => (
              <button
                key={`dot-${slide.src}-${index}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Afficher la photo ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? "w-8 bg-[#f7c600]" : "w-2.5 bg-white/65 hover:bg-white"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Photo suivante"
            className="focus-ring flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#001c10]/55 text-white shadow-lg transition hover:border-[#f7c600] hover:bg-[#001c10]/75 hover:text-[#f7c600]"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

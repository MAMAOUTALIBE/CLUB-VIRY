"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type HomeHeroSlide = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonLabel: string;
  buttonHref: string;
  objectPosition?: string;
};

type HomeHeroCarouselProps = {
  slides: HomeHeroSlide[];
  intervalMs?: number;
  variant?: "desktop" | "mobile";
};

export function HomeHeroCarousel({ slides, intervalMs = 5500, variant = "desktop" }: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const total = slides.length;
  const isMobile = variant === "mobile";

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

  const activeSlide = slides[activeIndex];

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (startX == null || endX == null || Math.abs(endX - startX) < 45) return;
        if (endX < startX) next();
        else previous();
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={slide.imageUrl}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover ${isMobile ? "scale-[1.04] sm:scale-100" : ""}`}
            style={{ objectPosition: isMobile ? "center 78%" : (slide.objectPosition ?? "center") }}
          />
        </div>
      ))}

      <div className={`absolute inset-0 z-[1] ${isMobile ? "bg-gradient-to-b from-[#001c10]/10 via-[#001c10]/25 to-[#001c10]/95" : "bg-gradient-to-r from-[#001c10]/35 via-[#001c10]/10 to-transparent"}`} aria-hidden="true" />
      <div className={`absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-[#001c10] to-transparent ${isMobile ? "h-3/5" : "h-2/5 from-[#001c10]/30"}`} aria-hidden="true" />

      <div className={`absolute inset-0 z-[2] mx-auto flex w-full max-w-[1720px] px-4 sm:px-6 lg:px-8 3xl:max-w-[1920px] 3xl:px-10 ${isMobile ? "items-end pb-7 pt-8" : "items-center py-8"}`}>
        <div className={`w-full ${isMobile ? "mx-auto max-w-3xl" : "max-w-4xl 3xl:max-w-5xl"}`} aria-live="polite">
          {isMobile ? <p className="mb-3 inline-flex rounded-full bg-[#f7c600] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#001c10] shadow-lg sm:text-xs">Bienvenue au club</p> : null}
          <h1 className={isMobile ? "max-w-3xl text-[clamp(2rem,8vw,4.5rem)] font-black uppercase leading-[0.94] tracking-[-0.035em] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.6)]" : "sr-only"}>{activeSlide?.title}</h1>
          {activeSlide?.description ? <p className={`${isMobile ? "mt-4 max-w-xl text-sm font-bold leading-6 sm:text-base" : "mt-5 max-w-2xl text-base font-medium leading-7 sm:text-lg"} text-white/90`}>{activeSlide.description}</p> : null}
          <div className="mt-4 h-1 w-24 rounded-full bg-[#f7c600]" />
          {isMobile && total > 1 ? <div className="mt-5 flex items-center gap-2" aria-label="Diapositives du club">{slides.map((slide, index) => <button key={`mobile-dot-${slide.id}`} type="button" onClick={() => goTo(index)} aria-label={`Afficher la diapositive ${index + 1} sur ${total}`} aria-current={index === activeIndex ? "true" : undefined} className={`focus-ring h-2.5 rounded-full border border-white/80 transition-all ${index === activeIndex ? "w-10 bg-[#f7c600]" : "w-2.5 bg-transparent hover:bg-white"}`} />)}</div> : null}
          <div className={isMobile ? "mt-6 grid grid-cols-2 gap-3" : ""}>
            {activeSlide?.buttonLabel && activeSlide?.buttonHref ? <Link className={`focus-ring inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[#f7c600] px-4 py-3 text-center text-xs font-black uppercase text-[#001c10] shadow-[0_18px_34px_rgba(247,198,0,0.25)] transition hover:-translate-y-0.5 hover:bg-white ${isMobile ? "w-full sm:text-sm" : "mt-7 px-6 text-sm"}`} href={activeSlide.buttonHref}>{activeSlide.buttonLabel}<ArrowRight size={isMobile ? 18 : 22} aria-hidden="true" /></Link> : null}
            {isMobile ? <Link className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-white/80 bg-[#001c10]/30 px-4 py-3 text-center text-xs font-black uppercase text-white shadow-lg backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#f7c600] hover:text-[#f7c600] sm:text-sm" href="/equipes">Nos équipes<ArrowRight size={18} aria-hidden="true" /></Link> : null}
          </div>
        </div>
      </div>

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
                key={`dot-${slide.id}`}
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

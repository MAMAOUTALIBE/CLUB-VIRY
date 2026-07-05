"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { PersonProfileCard } from "@/components/PersonProfileCard";
import { images } from "@/lib/images";
import type { DisplayOfficial } from "@/lib/public-content";

function officialHref(official: DisplayOfficial): string {
  return `/le-club/organigramme/${official.slug}`;
}

function OfficialProfileCard({ official }: { official: DisplayOfficial }) {
  return (
    <PersonProfileCard
      actionHref={officialHref(official)}
      avatarPhoto={official.photo}
      badge={official.category === "BUREAU" ? "Bureau" : "Direction"}
      category={official.department}
      coverImage={images.stadiumAerial}
      name={official.name}
      pole={official.department}
      role={official.position}
      stats={[
        { icon: "users", label: "Pôle", value: 1 },
        { icon: "calendar", label: "Missions", value: Math.max(1, official.missions.length) },
        { icon: "trophy", label: "Contact", value: "Club" }
      ]}
      tags={official.missions}
    />
  );
}

const CARDS_PER_VIEW = 4;

export function OfficialsCarousel({ officials }: { officials: DisplayOfficial[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = officials.length;
  const visibleCount = Math.min(CARDS_PER_VIEW, total);
  const pageCount = Math.ceil(total / CARDS_PER_VIEW);
  const visibleOfficials = Array.from({ length: visibleCount }, (_, offset) => officials[(activeIndex + offset) % total]).filter((official): official is DisplayOfficial => Boolean(official));

  if (visibleOfficials.length === 0) return null;

  const hasSeveralPages = total > visibleCount;
  const showNext = () => {
    setActiveIndex((current) => (current + CARDS_PER_VIEW) % total);
  };
  const showPage = (pageIndex: number) => {
    setActiveIndex(pageIndex * CARDS_PER_VIEW);
  };

  return (
    <div className="mx-auto max-w-7xl" data-officials-carousel="">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full border border-[#07542f]/15 bg-white px-3 py-1 text-xs font-black tabular-nums text-[#07542f] shadow-sm" aria-live="polite">
          {visibleCount} / {total}
        </span>
        {hasSeveralPages ? (
          <button
            type="button"
            onClick={showNext}
            className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f7c600] text-[#001c10] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ffd83d] sm:hidden"
            aria-label="Afficher le responsable suivant"
            title="Responsable suivant"
          >
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="relative">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6">
          {visibleOfficials.map((official) => (
            <OfficialProfileCard key={official.id} official={official} />
          ))}
        </div>
        {hasSeveralPages ? (
          <button
            type="button"
            onClick={showNext}
            className="focus-ring absolute -right-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#f7c600] text-[#001c10] shadow-lg transition hover:-translate-y-[55%] hover:bg-[#ffd83d] xl:inline-flex"
            aria-label="Afficher le responsable suivant"
            title="Responsable suivant"
          >
            <ArrowRight size={22} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {hasSeveralPages ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Sélection des responsables">
          {Array.from({ length: pageCount }, (_, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              onClick={() => showPage(pageIndex)}
              className={`focus-ring h-2.5 rounded-full transition ${pageIndex * CARDS_PER_VIEW === activeIndex ? "w-7 bg-[#07542f]" : "w-2.5 bg-[#07542f]/25 hover:bg-[#07542f]/55"}`}
              aria-label={`Afficher le groupe ${pageIndex + 1}`}
              aria-current={pageIndex * CARDS_PER_VIEW === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

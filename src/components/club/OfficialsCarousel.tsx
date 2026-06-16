"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera } from "lucide-react";
import { useState } from "react";

import type { DisplayOfficial } from "@/lib/public-content";

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const value = (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  return value.toUpperCase() || "?";
}

function officialHref(official: DisplayOfficial): string {
  return `/le-club/organigramme/${official.slug}`;
}

function Avatar({ official, size = "h-16 w-16" }: { official: DisplayOfficial; size?: string }) {
  if (official.photo) {
    return <img src={official.photo} alt={official.name} className={`${size} rounded-full object-cover ring-2 ring-[#f7c600]`} />;
  }

  return (
    <span className={`${size} flex items-center justify-center rounded-full bg-[#07542f] text-xl font-black uppercase text-[#f7c600] ring-2 ring-[#f7c600]`} aria-hidden="true">
      {monogram(official.name)}
    </span>
  );
}

function OfficialPortrait({ official, featured = false }: { official: DisplayOfficial; featured?: boolean }) {
  const height = featured ? "h-64" : "h-52";

  return (
    <div className={`relative overflow-hidden rounded-lg border border-[#07542f]/15 bg-[#002f1d] ${height}`}>
      {official.photo ? (
        <img src={official.photo} alt={official.name} className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.03]" />
      ) : (
        <div className="stadium-grid flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(247,198,0,0.18),transparent_38%),linear-gradient(145deg,#001c10,#07542f)] px-5 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#001c10]/75 text-3xl font-black uppercase text-[#f7c600] ring-2 ring-[#f7c600]">
            {monogram(official.name)}
          </span>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#f7c600]/45 bg-[#001c10]/55 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#f7c600]">
            <Camera size={13} aria-hidden="true" />
            Photo à ajouter
          </span>
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-[#f7c600] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#001c10] shadow">
        {official.department}
      </span>
    </div>
  );
}

function OfficialProfileCard({ official, featured = false }: { official: DisplayOfficial; featured?: boolean }) {
  return (
    <Link
      href={officialHref(official)}
      data-official-card=""
      className={`focus-ring official-card group flex h-full flex-col overflow-hidden rounded-lg bg-white text-[#002f1d] transition duration-200 hover:-translate-y-1 hover:border-[#f7c600] hover:shadow-2xl ${featured ? "ring-2 ring-[#f7c600]/70" : ""}`}
    >
      <OfficialPortrait official={official} featured={featured} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <Avatar official={official} size="h-12 w-12" />
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black uppercase leading-tight">{official.name}</h3>
            <p className="mt-1 text-sm font-bold uppercase tracking-wide text-[#07542f]">{official.position}</p>
          </div>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-700">{official.bio}</p>
        <ul className="mt-4 space-y-2">
          {official.missions.slice(0, 3).map((mission) => (
            <li key={mission} className="flex gap-2 text-sm font-semibold text-slate-700">
              <BadgeCheck size={16} className="mt-0.5 shrink-0 text-[#07542f]" aria-hidden="true" />
              <span>{mission}</span>
            </li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-black uppercase text-[#07542f] group-hover:text-[#002f1d]">
          Voir le profil <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
    </Link>
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
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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

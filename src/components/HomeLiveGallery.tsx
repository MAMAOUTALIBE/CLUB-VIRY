import Link from "next/link";
import { ArrowRight, CalendarDays, Camera, Clapperboard, Dumbbell, Radio } from "lucide-react";

import { HomeMediaPlayer } from "@/components/HomeMediaPlayer";
import type { HomeMediaCard } from "@/lib/home-media-card";
import type { DisplayGalleryPhoto } from "@/lib/public-content";

function TeamLogo({ isClub, name, src }: { isClub: boolean; name: string; src: string | null }) {
  const logoSrc = src ?? (isClub ? "/club-logo.svg" : null);

  return logoSrc ? (
    <img src={logoSrc} alt={`Logo ${name}`} className="h-16 w-16 object-contain sm:h-20 sm:w-20" loading="lazy" />
  ) : (
    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-white/25 px-2 text-center text-[9px] font-bold uppercase leading-tight text-white/55 sm:h-20 sm:w-20">
      Logo non renseigné
    </span>
  );
}

function LiveMatchCard({ media }: { media: Extract<HomeMediaCard, { kind: "LIVE_MATCH" }> }) {
  const match = media.match;
  const href = match.followUrl ?? `/matchs/${match.id}`;
  const external = href.startsWith("https://");
  return (
    <article className="stadium-grid relative flex min-h-[25rem] flex-col overflow-hidden rounded-3xl border border-[#f7c600]/55 bg-[#002f1d] p-5 text-white shadow-[0_20px_45px_rgba(0,31,22,0.22)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(0,77,47,.55),rgba(0,31,22,.92))]" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3">
        <h2 className="text-2xl font-black leading-tight sm:text-3xl">Match en direct</h2>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-2 text-xs font-black uppercase text-white sm:text-sm">
            <Radio size={15} aria-hidden="true" /> En direct
          </span>
          <span className="text-xl font-black text-white">{match.minute}’</span>
        </div>
      </div>

      <div className="relative mt-7 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-center sm:gap-4">
        <div className="flex min-w-0 flex-col items-center">
          <TeamLogo isClub={match.home === match.category} name={match.home} src={match.homeLogoUrl} />
          <p className="mt-3 w-full text-sm font-black uppercase leading-tight sm:text-base">{match.home}</p>
        </div>
        <p className="whitespace-nowrap text-4xl font-black sm:text-5xl">{match.homeScore} – {match.awayScore}</p>
        <div className="flex min-w-0 flex-col items-center">
          <TeamLogo isClub={match.away === match.category} name={match.away} src={match.awayLogoUrl} />
          <p className="mt-3 w-full text-sm font-black uppercase leading-tight sm:text-base">{match.away}</p>
        </div>
      </div>
      <p className="relative mt-6 text-center text-sm font-bold text-white/70">
        {[match.competition, match.category].filter(Boolean).join(" · ")}
      </p>
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="focus-ring relative mt-auto flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#f7c600] px-5 pt-0.5 text-sm font-black uppercase text-[#002f1d] transition hover:bg-[#ffd84d] sm:text-base"
      >
        Voir le match en direct <ArrowRight size={19} aria-hidden="true" />
      </Link>
    </article>
  );
}

function VideoMediaCard({ media }: { media: Extract<HomeMediaCard, { kind: "VIDEO" }> }) {
  const isReplay = media.contentKind === "MATCH";
  const heading = isReplay ? "Replay du dernier match" : "Dans les coulisses de l’entraînement";
  const badge = isReplay ? "Replay" : "Entraînement";
  const action = isReplay ? "Regarder le replay" : "Voir l’entraînement";
  const BadgeIcon = isReplay ? Clapperboard : Dumbbell;
  const publishedLabel = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(media.publishedAt));

  return (
    <article className="stadium-grid relative overflow-hidden rounded-3xl border border-[#f7c600]/55 bg-[#002f1d] p-5 text-white shadow-[0_20px_45px_rgba(0,31,22,0.22)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(0,77,47,.55),rgba(0,31,22,.92))]" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-black leading-tight sm:text-3xl">{heading}</h2>
          <p className="mt-1 line-clamp-2 text-sm font-bold text-white/70">{media.title}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f7c600] px-3 py-2 text-xs font-black uppercase text-[#002f1d]">
          <BadgeIcon size={15} aria-hidden="true" /> {badge}
        </span>
      </div>
      <div className="relative mt-5">
        <HomeMediaPlayer coverImageUrl={media.coverImageUrl} playbackKind={media.playbackKind} title={media.title} videoUrl={media.videoUrl} />
      </div>
      <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-white/70">
        {media.teamName ? <span>{media.teamName}</span> : null}
        <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} aria-hidden="true" /> {publishedLabel}</span>
      </div>
      <a
        href={media.videoUrl}
        target="_blank"
        rel="noreferrer"
        className="focus-ring relative mt-5 flex min-h-14 items-center justify-center gap-3 rounded-xl border-2 border-[#f7c600] px-5 pt-0.5 text-sm font-black uppercase text-[#f7c600] transition hover:bg-[#f7c600] hover:text-[#002f1d] sm:text-base"
      >
        {action} <ArrowRight size={19} aria-hidden="true" />
      </a>
    </article>
  );
}

function DynamicMediaCard({ media }: { media: HomeMediaCard }) {
  return media.kind === "LIVE_MATCH" ? <LiveMatchCard media={media} /> : <VideoMediaCard media={media} />;
}

function LatestPhotosCard({ photos }: { photos: DisplayGalleryPhoto[] }) {
  return (
    <article className="stadium-grid relative flex flex-col overflow-hidden rounded-3xl border border-[#f7c600]/55 bg-[#002f1d] p-5 text-white shadow-[0_20px_45px_rgba(0,31,22,0.22)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(0,77,47,.48),rgba(0,31,22,.94))]" aria-hidden="true" />
      <h2 className="relative text-2xl font-black leading-tight sm:text-3xl">Dernières images des matchs</h2>

      {photos.length > 0 ? (
        <div className={`relative mt-6 grid gap-2.5 ${photos.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-4"}`}>
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href="/medias"
              aria-label={`${photo.title} : ouvrir la galerie`}
              className={`focus-ring group relative overflow-hidden rounded-xl border border-[#f7c600]/55 bg-[#001f16] ${photos.length === 1 ? "aspect-video" : "aspect-square"}`}
            >
              <img src={photo.image} alt={photo.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" loading="lazy" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col items-center justify-center py-10 text-center">
          <Camera size={38} className="text-[#f7c600]" aria-hidden="true" />
          <p className="mt-4 text-lg font-black">Aucune photo publiée</p>
        </div>
      )}

      <Link
        href="/medias"
        className="focus-ring relative mt-6 flex min-h-14 items-center justify-center gap-3 rounded-xl border-2 border-[#f7c600] px-5 pt-0.5 text-sm font-black uppercase text-[#f7c600] transition hover:bg-[#f7c600] hover:text-[#002f1d] sm:text-base"
      >
        Voir toutes les photos <ArrowRight size={19} aria-hidden="true" />
      </Link>
    </article>
  );
}

export function HomeLiveGallery({ media, photos }: { media: HomeMediaCard | null; photos: DisplayGalleryPhoto[] }) {
  return (
    <>
      <section aria-label="Match en direct, replay, entraînement ou photos" className="mx-auto max-w-7xl px-4 pb-10 pt-10 md:hidden">
        <div className="grid gap-5">
          {media ? <DynamicMediaCard media={media} /> : <LatestPhotosCard photos={photos} />}
        </div>
      </section>

      {media?.kind === "LIVE_MATCH" ? (
        <section aria-label="Match en direct sur ordinateur" className="hidden px-6 py-14 xl:block 3xl:py-16">
          <div className="mx-auto max-w-5xl">
            <LiveMatchCard media={media} />
          </div>
        </section>
      ) : null}
    </>
  );
}

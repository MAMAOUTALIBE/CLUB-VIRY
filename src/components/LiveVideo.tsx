"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CircleDot, Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";

type MatchMedia =
  | { label: string; src: string; type: "video" }
  | { label: string; src: string; type: "image"; alt: string };

const MATCH_MEDIA: readonly MatchMedia[] = [
  { label: "Séquence 1", src: "/matches/match-direct-sequence-1.mp4", type: "video" },
  { label: "Séquence 2", src: "/matches/match-direct-sequence-2.mp4", type: "video" },
  { label: "Séquence 3", src: "/matches/match-direct-sequence-3.mp4", type: "video" },
  { label: "Séquence 4", src: "/matches/match-direct-sequence-4.jpg", type: "image", alt: "Photo du match — Séquence 4" },
  { label: "Séquence 5", src: "/matches/match-direct-sequence-5.jpg", type: "image", alt: "Photo du match — Séquence 5" },
  { label: "Séquence 6", src: "/matches/match-direct-sequence-6.mp4", type: "video" },
  { label: "Séquence 7", src: "/matches/match-direct-sequence-7.mp4", type: "video" },
  { label: "Séquence 8", src: "/matches/match-direct-sequence-8.mp4", type: "video" },
  { label: "Séquence 9", src: "/matches/match-direct-sequence-9.mp4", type: "video" },
  { label: "Séquence 10", src: "/matches/match-direct-sequence-10.mp4", type: "video" },
  { label: "Séquence 11", src: "/matches/match-direct-sequence-11.mp4", type: "video" },
  { label: "Séquence 12", src: "/matches/match-direct-sequence-12.mp4", type: "video" }
] as const;

export function LiveVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeClip, setActiveClip] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const activeMedia = MATCH_MEDIA[activeClip];

  const selectClip = (index: number) => {
    setActiveClip(index);
    setPlaying(MATCH_MEDIA[index].type === "video");
    setMuted(true);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const goFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  return (
    <div className="club-shell relative shrink-0 overflow-hidden rounded-2xl border border-[#f7c600]/25 text-white shadow-[0_30px_70px_rgba(0,18,11,0.4)]">
      <div className="relative h-[20rem] w-full shrink-0 bg-black sm:h-[28rem] xl:h-auto xl:aspect-video">
        {activeMedia.type === "video" ? (
          <video
            key={activeMedia.src}
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-contain xl:object-cover"
            src={activeMedia.src}
            poster="/matches/match-direct-poster.jpg"
            autoPlay
            muted
            playsInline
            preload="metadata"
            onEnded={() => setPlaying(false)}
            aria-label={`Match en direct — ${activeMedia.label}`}
          />
        ) : (
          <Image
            key={activeMedia.src}
            src={activeMedia.src}
            alt={activeMedia.alt}
            fill
            sizes="(max-width: 1279px) 100vw, 1200px"
            className="object-contain xl:object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35" />

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between sm:inset-x-4 sm:top-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-wider shadow-lg">
              <CircleDot size={13} aria-hidden="true" />
              Match en direct
            </span>
          </div>
          <span className="rounded-md bg-black/45 px-2 py-1 text-[11px] font-black uppercase tracking-wide backdrop-blur">HD</span>
        </div>

        {/* Bouton lecture central (quand en pause) */}
        {activeMedia.type === "video" && !playing ? (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Lire le direct"
            className="focus-ring group absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f7c600]/90 text-[#002f1d] shadow-[0_10px_40px_rgba(247,198,0,0.5)] transition group-hover:scale-110 group-hover:bg-[#f7c600]">
              <Play size={34} className="ml-1" fill="currentColor" aria-hidden="true" />
            </span>
          </button>
        ) : null}

        <div className="pointer-events-none absolute bottom-12 left-3 right-3 sm:bottom-14 sm:left-5 sm:right-5">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f7c600]">Images du match · {activeMedia.label}</p>
          <p className="mt-1 text-lg font-black uppercase leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-2xl">
            ES Viry-Châtillon Football
          </p>
        </div>

        {/* Barre de contrôle */}
        {activeMedia.type === "video" ? (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 sm:px-5">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Lecture"}
              className="focus-ring text-white/90 transition hover:text-[#f7c600]"
            >
              {playing ? <Pause size={20} aria-hidden="true" /> : <Play size={20} fill="currentColor" aria-hidden="true" />}
            </button>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-white/85">{activeMedia.label}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-full bg-gradient-to-r from-[#e11d48] to-[#fb7185]" />
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Activer le son" : "Couper le son"}
                className="focus-ring transition hover:text-[#f7c600]"
              >
                {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
              </button>
              <button type="button" onClick={goFullscreen} aria-label="Plein écran" className="focus-ring transition hover:text-[#f7c600]">
                <Maximize size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-3 px-4 py-3 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <p className="text-xs font-bold text-white/70">
          <span className="font-black uppercase text-[#f7c600]">Match en direct</span> · vivez les temps forts avec les Jaune et Vert
        </p>
        <div className="flex w-full max-w-full snap-x gap-2 overflow-x-auto pb-1 xl:w-auto" role="group" aria-label="Choisir une séquence du match">
          {MATCH_MEDIA.map((clip, index) => (
            <button
              key={clip.src}
              type="button"
              onClick={() => selectClip(index)}
              aria-pressed={activeClip === index}
              className={`focus-ring shrink-0 snap-start whitespace-nowrap rounded-md px-3 py-2 text-[11px] font-black uppercase transition ${activeClip === index ? "bg-[#f7c600] text-[#002f1d]" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              {clip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { CircleDot, Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";

const MATCH_CLIPS = [
  { label: "Séquence 1", src: "/matches/match-direct-sequence-1.mp4" },
  { label: "Séquence 2", src: "/matches/match-direct-sequence-2.mp4" }
] as const;

export function LiveVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeClip, setActiveClip] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const selectClip = (index: number) => {
    setActiveClip(index);
    setPlaying(true);
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
        <video
          key={MATCH_CLIPS[activeClip].src}
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain xl:object-cover"
          src={MATCH_CLIPS[activeClip].src}
          poster="/matches/match-direct-poster.jpg"
          autoPlay
          muted
          playsInline
          preload="metadata"
          onEnded={() => setPlaying(false)}
          aria-label={`Match en direct — ${MATCH_CLIPS[activeClip].label}`}
        />
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
        {!playing ? (
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
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f7c600]">Images du match · {MATCH_CLIPS[activeClip].label}</p>
          <p className="mt-1 text-lg font-black uppercase leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-2xl">
            ES Viry-Châtillon Football
          </p>
        </div>

        {/* Barre de contrôle */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 sm:px-5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Lecture"}
            className="focus-ring text-white/90 transition hover:text-[#f7c600]"
          >
            {playing ? <Pause size={20} aria-hidden="true" /> : <Play size={20} fill="currentColor" aria-hidden="true" />}
          </button>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-white/85">{MATCH_CLIPS[activeClip].label}</span>
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
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <p className="text-xs font-bold text-white/70">
          <span className="font-black uppercase text-[#f7c600]">Match en direct</span> · vivez les temps forts avec les Jaune et Vert
        </p>
        <div className="flex gap-2" role="group" aria-label="Choisir une séquence vidéo">
          {MATCH_CLIPS.map((clip, index) => (
            <button
              key={clip.src}
              type="button"
              onClick={() => selectClip(index)}
              aria-pressed={activeClip === index}
              className={`focus-ring rounded-md px-3 py-2 text-[11px] font-black uppercase transition ${activeClip === index ? "bg-[#f7c600] text-[#002f1d]" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              {clip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

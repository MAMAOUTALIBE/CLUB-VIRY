"use client";

import { useRef, useState } from "react";
import { Eye, Maximize, Pause, Play, Settings, Volume2, VolumeX } from "lucide-react";
import { images } from "@/lib/images";

// Lecteur "direct vidéo".
// DEMO : joue un clip libre en boucle (public/live-demo.mp4) pour simuler un flux.
// Pour un vrai direct : remplacer la source du <video> par une URL HLS (.m3u8 via
// hls.js) OU remplacer la zone par un <iframe> YouTube Live / Twitch — et autoriser
// le domaine du lecteur dans la CSP (frame-src / media-src de next.config.ts).
const DEMO_SRC = "/live-demo.mp4";

export function LiveVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

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
    <div className="club-shell relative overflow-hidden rounded-2xl border border-[#f7c600]/25 text-white shadow-[0_30px_70px_rgba(0,18,11,0.4)]">
      <div className="relative aspect-video w-full bg-black">
        {/* Flux vidéo (démo en boucle) */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={DEMO_SRC}
          poster={images.teamHuddle}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Aperçu vidéo (démonstration)"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35" />

        {/* Haut : badge direct + spectateurs + qualité */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between sm:inset-x-4 sm:top-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur">
              <Eye size={13} aria-hidden="true" />
              Aperçu vidéo
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

        {/* Titre du match (bas) */}
        <div className="pointer-events-none absolute bottom-12 left-3 right-3 sm:bottom-14 sm:left-5 sm:right-5">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f7c600]">Championnat D1 · Journée 3</p>
          <p className="mt-1 text-lg font-black uppercase leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-2xl">
            ES Viry-Châtillon <span className="text-[#f7c600]">vs</span> Étampes FC
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
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-white/85">
            Démo
          </span>
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
            <Settings size={18} aria-hidden="true" className="hidden sm:block" />
            <button type="button" onClick={goFullscreen} aria-label="Plein écran" className="focus-ring transition hover:text-[#f7c600]">
              <Maximize size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Légende sous le lecteur */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
        <p className="text-xs font-bold text-white/60">
          <span className="font-black uppercase text-[#f7c600]">Aperçu vidéo</span> · démonstration du futur direct depuis le Stade Henri Longuet
        </p>
        <span className="text-[11px] font-bold uppercase tracking-wide text-white/45">Démo · clip de test en boucle</span>
      </div>
    </div>
  );
}

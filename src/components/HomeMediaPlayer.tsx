import { ExternalLink, Play } from "lucide-react";

export function HomeMediaPlayer({ coverImageUrl, playbackKind, title, videoUrl }: { coverImageUrl: string | null; playbackKind: "VIDEO" | "BROADCAST_LINK"; title: string; videoUrl: string }) {
  if (playbackKind === "BROADCAST_LINK") {
    return (
      <a
        href={videoUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${title} : ouvrir la diffusion`}
        className="focus-ring group relative block aspect-video overflow-hidden rounded-xl border border-[#f7c600]/45 bg-black"
      >
        {coverImageUrl ? <img src={coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <span className="absolute inset-0 bg-black/35 transition group-hover:bg-black/25" aria-hidden="true" />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7c600] text-[#002f1d] shadow-lg"><Play size={24} fill="currentColor" aria-hidden="true" /></span>
          <span className="inline-flex items-center gap-2 text-sm font-black uppercase">Ouvrir la diffusion <ExternalLink size={16} aria-hidden="true" /></span>
        </span>
      </a>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-[#f7c600]/45 bg-black">
      <video
        aria-label={title}
        className="h-full w-full object-contain"
        controls
        playsInline
        preload="metadata"
        poster={coverImageUrl ?? undefined}
        src={videoUrl}
      />
    </div>
  );
}

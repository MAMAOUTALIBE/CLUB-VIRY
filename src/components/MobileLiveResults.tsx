import Link from "next/link";
import { ArrowRight, Radio, Trophy } from "lucide-react";
import type { MobileMatchCard } from "@/lib/mobile-match-feed";

function TeamLogo({ src, name }: { src: string | null; name: string }) {
  return src ? <img src={src} alt={`Logo ${name}`} className="h-14 w-14 object-contain" loading="lazy" /> : null;
}

function ResultRow({ match }: { match: MobileMatchCard }) {
  return (
    <Link
      href={`/matchs/${match.id}`}
      aria-label={`${match.home} ${match.homeScore} – ${match.awayScore} ${match.away} : voir le détail`}
      className="focus-ring grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-2xl border border-[#f7c600]/40 bg-[#002b1d]/60 px-3 py-4 backdrop-blur-md transition hover:border-[#f7c600] hover:bg-[#003b28]/70"
    >
      <span className="min-w-0 text-left"><TeamLogo src={match.homeLogoUrl} name={match.home} /><span className="block text-[10px] font-black uppercase text-[#f7c600]">{match.category}</span><span className="mt-1 block truncate text-xs font-bold text-white">{match.home}</span></span>
      <span className="whitespace-nowrap text-2xl font-black text-white">{match.homeScore} – {match.awayScore}</span>
      <span className="flex min-w-0 flex-col items-end text-right"><TeamLogo src={match.awayLogoUrl} name={match.away} /><span className="block truncate text-xs font-bold text-white">{match.away}</span></span>
    </Link>
  );
}

export function MobileLiveResults({ live, results }: { live: MobileMatchCard | null; results: MobileMatchCard[] }) {
  if (!live && results.length === 0) return null;
  const liveHref = live ? live.followUrl ?? `/matchs/${live.id}` : null;
  const liveExternal = liveHref?.startsWith("https://") ?? false;

  return (
    <section aria-labelledby="mobile-live-title" className="relative overflow-hidden bg-[#001f16] px-4 py-10 text-white xl:hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,198,0,.13),transparent_38%),linear-gradient(180deg,rgba(0,47,29,.78),rgba(0,22,15,.96))]" aria-hidden="true" />
      <div className="relative mx-auto max-w-2xl rounded-[2rem] border border-[#f7c600]/35 bg-[#002f1d]/65 p-4 shadow-[0_0_35px_rgba(247,198,0,.09)] backdrop-blur-xl sm:p-6">
        {live ? <>
          <h2 id="mobile-live-title" className="whitespace-nowrap text-[clamp(1.1rem,6vw,1.5rem)] font-black uppercase text-red-500">Match en direct</h2>
          <article className="mt-5 rounded-3xl border border-[#f7c600] bg-[#001f16]/80 p-5 shadow-[inset_0_1px_0_rgba(255,216,77,.28)]">
            <div className="flex items-center justify-center gap-3"><span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-2 text-xs font-black uppercase"><Radio size={14} aria-hidden="true" /> En direct</span><span className="text-xl font-black text-[#f7c600]">{live.minute}’</span></div>
            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 text-center">
              <div className="flex min-w-0 flex-col items-center"><TeamLogo src={live.homeLogoUrl} name={live.home} /><p className="mt-2 text-sm font-black uppercase leading-tight">{live.home}</p></div>
              <p className="whitespace-nowrap text-5xl font-black">{live.homeScore} – {live.awayScore}</p>
              <div className="flex min-w-0 flex-col items-center"><TeamLogo src={live.awayLogoUrl} name={live.away} /><p className="mt-2 text-sm font-black uppercase leading-tight">{live.away}</p></div>
            </div>
            <p className="mt-5 text-center text-xs font-bold uppercase tracking-wider text-white/60">{[live.competition, live.category].filter(Boolean).join(" · ")}</p>
            <Link href={liveHref ?? `/matchs/${live.id}`} target={liveExternal ? "_blank" : undefined} rel={liveExternal ? "noreferrer" : undefined} className="mt-5 flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#f7c600] px-4 text-sm font-black uppercase text-[#002f1d] transition hover:bg-[#ffd84d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Voir le match en direct <ArrowRight size={19} aria-hidden="true" /></Link>
          </article>
        </> : <h2 id="mobile-live-title" className="sr-only">Matchs et résultats</h2>}

        {results.length > 0 ? <div className={live ? "mt-8" : ""}>
          <div className="mb-4 flex items-center justify-center gap-3 text-[#f7c600]"><span className="h-px flex-1 bg-[#f7c600]/45" /><Trophy size={18} aria-hidden="true" /><h3 className="text-sm font-black uppercase tracking-[.16em]">Derniers résultats</h3><span className="h-px flex-1 bg-[#f7c600]/45" /></div>
          <div className="grid gap-3">{results.map((match) => <ResultRow key={match.id} match={match} />)}</div>
        </div> : null}
        <Link href="/calendrier" className="mt-6 flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-[#f7c600] px-4 text-sm font-black uppercase text-[#f7c600] transition hover:bg-[#f7c600] hover:text-[#002f1d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7c600]">Voir tous les matchs <ArrowRight size={19} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, ExternalLink, MapPin, Radio } from "lucide-react";
import { ProtectedLiveButton } from "@/components/ProtectedLiveButton";
import { getPublicMatchDetail } from "@/lib/public-match";

type MatchPageProps = { params: Promise<{ id: string }> };

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "full" });
const timeFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });

function Logo({ src, name }: { src: string | null; name: string }) {
  return src ? <img src={src} alt={`Logo ${name}`} className="h-20 w-20 object-contain sm:h-24 sm:w-24" /> : null;
}

export async function generateMetadata({ params }: MatchPageProps) {
  const { id } = await params;
  const detail = await getPublicMatchDetail(id);
  return detail ? { title: `${detail.identity.home} – ${detail.identity.away}`, alternates: { canonical: `/matchs/${id}` } } : { title: "Match" };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const detail = await getPublicMatchDetail(id);
  if (!detail) notFound();
  const { row, identity } = detail;
  const date = new Date(row.starts_at);
  const completeScore = row.home_score !== null && row.away_score !== null;
  const liveMinute = row.status === "LIVE" ? row.live_minute : null;

  return (
    <section className="relative min-h-[70svh] overflow-hidden bg-[#001f16] px-4 py-10 text-white sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,198,0,.14),transparent_42%),linear-gradient(180deg,rgba(0,47,29,.72),rgba(0,18,12,.98))]" aria-hidden="true" />
      <article className="relative mx-auto max-w-4xl rounded-[2rem] border border-[#f7c600]/45 bg-[#002f1d]/65 p-5 shadow-[0_0_45px_rgba(247,198,0,.1)] backdrop-blur-xl sm:p-10">
        <Link href="/calendrier" className="inline-flex items-center gap-2 text-xs font-black uppercase text-[#f7c600] hover:text-white"><ArrowLeft size={17} aria-hidden="true" /> Calendrier</Link>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#f7c600]">{identity.category}</p><h1 className="mt-2 text-3xl font-black uppercase leading-tight sm:text-5xl">{identity.home} <span className="text-[#f7c600]">–</span> {identity.away}</h1></div>
          {row.status === "LIVE" && liveMinute !== null ? <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-black uppercase"><Radio size={16} aria-hidden="true" /> En direct · {liveMinute}’</span> : <span className="rounded-full border border-[#f7c600]/45 px-4 py-2 text-xs font-black uppercase text-[#f7c600]">{row.status === "FINISHED" ? "Terminé" : row.status === "CANCELLED" ? "Annulé" : row.status === "POSTPONED" ? "Reporté" : "Programmé"}</span>}
        </div>
        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-3xl border border-[#f7c600]/40 bg-[#001f16]/65 p-5 text-center sm:p-8">
          <div className="flex min-w-0 flex-col items-center"><Logo src={identity.homeLogoUrl} name={identity.home} /><p className="mt-3 text-sm font-black uppercase sm:text-xl">{identity.home}</p></div>
          <p className="whitespace-nowrap text-4xl font-black sm:text-6xl">{completeScore ? `${row.home_score} – ${row.away_score}` : "–"}</p>
          <div className="flex min-w-0 flex-col items-center"><Logo src={identity.awayLogoUrl} name={identity.away} /><p className="mt-3 text-sm font-black uppercase sm:text-xl">{identity.away}</p></div>
        </div>
        <dl className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-white/[.06] p-4"><CalendarDays className="text-[#f7c600]" aria-hidden="true" /><div><dt className="sr-only">Date</dt><dd>{dateFormatter.format(date)}</dd></div></div>
          <div className="flex items-center gap-3 rounded-xl bg-white/[.06] p-4"><Clock className="text-[#f7c600]" aria-hidden="true" /><div><dt className="sr-only">Heure</dt><dd>{timeFormatter.format(date)}</dd></div></div>
          {row.venue ? <div className="flex items-center gap-3 rounded-xl bg-white/[.06] p-4 sm:col-span-2"><MapPin className="text-[#f7c600]" aria-hidden="true" /><div><dt className="sr-only">Lieu</dt><dd>{row.venue}</dd></div></div> : null}
        </dl>
        {row.competition ? <p className="mt-6 text-center text-sm font-bold uppercase tracking-wider text-white/65">{row.competition}</p> : null}
        {row.status === "LIVE" && row.follow_url ? row.access_level === "FAMILY_PASS" ? <ProtectedLiveButton matchId={row.id} /> : <div className="mt-7 text-center"><a href={row.follow_url} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f7c600] px-5 text-sm font-black uppercase text-[#002f1d]">Voir le match en direct <ExternalLink size={17} /></a></div> : null}
      </article>
    </section>
  );
}

"use client";

import { Bell, CalendarDays, Camera, CheckCheck, Clapperboard, Download, ExternalLink, Library, Loader2, LockKeyhole, LogIn, LogOut, Megaphone, Radio, RotateCcw, Trophy, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { familyMediaDateKey, isFamilyMediaPassCurrent } from "@/lib/family-media-entitlement";
import {
  countFamilyMediaLibrary,
  filterFamilyMediaLibrary,
  type FamilyMediaLibraryCategory
} from "@/lib/family-media-library";

type Player = { id: string; first_name: string; last_name: string };
type Notif = {
  id: string;
  subject: string | null;
  category: string | null;
  template: string;
  link: string | null;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};
type Pref = { category: string; email: boolean; push: boolean };
type MediaPass = {
  id: string;
  status: "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED" | "CANCELLED" | "EXPIRED";
  startsOn: string;
  endsOn: string;
  allowPhotos: boolean;
  allowTrainingVideos: boolean;
  allowLiveMatches: boolean;
  teamNames: string[];
};
type ProtectedMedia = {
  id: string;
  team_id: string;
  team_name: string;
  type: "PHOTO" | "VIDEO";
  content_kind: "MATCH" | "TRAINING" | null;
  playback_kind: "VIDEO" | "BROADCAST_LINK";
  title: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  is_live: boolean;
  published_at: string | null;
  access_path: string;
};

const MEDIA_CATEGORIES: Array<{ value: FamilyMediaLibraryCategory; label: string; icon: LucideIcon }> = [
  { value: "ALL", label: "Tout", icon: Library },
  { value: "PHOTOS", label: "Photos", icon: Camera },
  { value: "MATCH_VIDEOS", label: "Vidéos de match", icon: Clapperboard },
  { value: "TRAINING", label: "Entraînements", icon: CalendarDays }
];
type LiveMatch = {
  id: string;
  teamId: string;
  teamName: string;
  opponentName: string;
  opponentLogoUrl: string | null;
  location: "HOME" | "AWAY" | "NEUTRAL";
  startsAt: string;
  competition: string | null;
  homeScore: number | null;
  awayScore: number | null;
  liveMinute: number | null;
  accessPath: string;
};

const CATEGORIES: Record<string, { label: string; icon: LucideIcon }> = {
  convocation: { label: "Convocations", icon: Trophy },
  session: { label: "Entraînements", icon: CalendarDays },
  media: { label: "Photos & médias", icon: Camera },
  news: { label: "Actualités", icon: Megaphone },
  event: { label: "Événements", icon: Bell },
  club: { label: "Vie du club", icon: Megaphone }
};

function relativeFr(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.round((then - Date.now()) / 1000);
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });
  if (abs < 60) return rtf.format(Math.round(diff / 1), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}

function formatMediaDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function notifLine(notif: Notif): string {
  const child = typeof notif.payload?.childFirstName === "string" ? notif.payload.childFirstName : null;
  const opponent = typeof notif.payload?.opponentName === "string" ? notif.payload.opponentName : null;
  const location = typeof notif.payload?.location === "string" ? notif.payload.location : null;
  const parts: string[] = [];
  if (child) parts.push(`Pour ${child}`);
  if (opponent) parts.push(`contre ${opponent}`);
  if (location) parts.push(`Lieu : ${location}`);
  return parts.join(" · ");
}

function payloadText(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function convocationRows(notif: Notif): Array<{ label: string; value: string }> {
  return [
    ["Joueur", payloadText(notif.payload, "childFirstName")],
    ["Type", payloadText(notif.payload, "eventTypeName")],
    ["Match", payloadText(notif.payload, "dateLabel")],
    ["Adversaire", payloadText(notif.payload, "opponentName")],
    ["Rendez-vous", payloadText(notif.payload, "meetingLabel")],
    ["Lieu RDV", payloadText(notif.payload, "meetingLocation")],
    ["Lieu", payloadText(notif.payload, "location")],
    ["Retour estimé", payloadText(notif.payload, "returnLabel")],
    ["Tenue", payloadText(notif.payload, "outfit")],
    ["Transport", payloadText(notif.payload, "transport")],
    ["Consignes", payloadText(notif.payload, "instructions")],
    ["Message éducateur", payloadText(notif.payload, "coachComment")],
    ["Empêchement", payloadText(notif.payload, "impedimentContact")]
  ]
    .filter((row): row is [string, string] => Boolean(row[1]))
    .map(([label, value]) => ({ label, value }));
}

export function MemberSpace() {
  const mediaTeamFilterId = useId();
  const [status, setStatus] = useState<"loading" | "unauth" | "ready">("loading");
  const [players, setPlayers] = useState<Player[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [prefs, setPrefs] = useState<Pref[]>([]);
  const [mediaPasses, setMediaPasses] = useState<MediaPass[]>([]);
  const [protectedMedia, setProtectedMedia] = useState<ProtectedMedia[]>([]);
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [mediaMessage, setMediaMessage] = useState("");
  const [mediaCategory, setMediaCategory] = useState<FamilyMediaLibraryCategory>("ALL");
  const [mediaTeamId, setMediaTeamId] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const mediaTeams = useMemo(() => {
    const byId = new Map<string, string>();
    for (const media of protectedMedia) {
      if (media.team_id && media.team_name) byId.set(media.team_id, media.team_name);
    }
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((left, right) => left.name.localeCompare(right.name, "fr"));
  }, [protectedMedia]);
  const effectiveMediaTeamId = mediaTeamId && mediaTeams.some((team) => team.id === mediaTeamId) ? mediaTeamId : null;
  const mediaCounts = useMemo(
    () => countFamilyMediaLibrary(protectedMedia, effectiveMediaTeamId),
    [effectiveMediaTeamId, protectedMedia]
  );
  const visibleProtectedMedia = useMemo(
    () => filterFamilyMediaLibrary(protectedMedia, { category: mediaCategory, teamId: effectiveMediaTeamId }),
    [effectiveMediaTeamId, mediaCategory, protectedMedia]
  );

  const loadNotifs = useCallback(async () => {
    const res = await fetch("/api/family/notifications", { credentials: "same-origin" });
    if (!res.ok) return;
    const json = await res.json().catch(() => null);
    if (json?.ok) {
      setNotifs(json.data.notifications ?? []);
      setUnread(json.data.unread ?? 0);
    }
  }, []);

  const loadPrefs = useCallback(async () => {
    const res = await fetch("/api/family/notifications/preferences", { credentials: "same-origin" });
    if (!res.ok) return;
    const json = await res.json().catch(() => null);
    if (json?.ok) setPrefs(json.data.preferences ?? []);
  }, []);

  const loadMedia = useCallback(async () => {
    const [passResponse, mediaResponse, liveResponse] = await Promise.all([
      fetch("/api/family/media-pass", { credentials: "same-origin" }),
      fetch("/api/family/media?limit=100", { credentials: "same-origin" }),
      fetch("/api/family/matches/live", { credentials: "same-origin" })
    ]);
    const [passJson, mediaJson, liveJson] = await Promise.all([
      passResponse.json().catch(() => null),
      mediaResponse.json().catch(() => null),
      liveResponse.json().catch(() => null)
    ]);
    if (passResponse.ok && passJson?.ok) setMediaPasses(passJson.data.passes ?? []);
    setProtectedMedia(mediaResponse.ok && mediaJson?.ok ? mediaJson.data.assets ?? [] : []);
    setLiveMatches(liveResponse.ok && liveJson?.ok ? liveJson.data.matches ?? [] : []);
  }, []);

  const load = useCallback(async () => {
    setStatus("loading");
    const res = await fetch("/api/family", { credentials: "same-origin" });
    if (res.status === 401) {
      setStatus("unauth");
      return;
    }
    const json = await res.json().catch(() => null);
    if (json?.ok) {
      setPlayers(json.data.players ?? []);
      await Promise.all([loadNotifs(), loadPrefs(), loadMedia()]);
      setStatus("ready");
    } else {
      setStatus("unauth");
    }
  }, [loadMedia, loadNotifs, loadPrefs]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setLoginError("Email et mot de passe requis.");
      return;
    }
    setLoginBusy(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setLoginError(json?.error?.message ?? "Connexion impossible.");
        return;
      }
      setPassword("");
      await load();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Erreur réseau.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    setResetMessage("");
    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      await res.json().catch(() => null);
      // Réponse volontairement générique (anti-énumération de comptes).
      setResetMessage("Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.");
    } catch {
      setResetMessage("Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
    setPlayers([]);
    setNotifs([]);
    setPrefs([]);
    setMediaPasses([]);
    setProtectedMedia([]);
    setLiveMatches([]);
    setMediaCategory("ALL");
    setMediaTeamId(null);
    setStatus("unauth");
  }

  async function markAllRead() {
    await fetch("/api/family/notifications", { method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => null);
    await loadNotifs();
  }

  async function togglePref(category: string, channel: "email" | "push", value: boolean) {
    setPrefs((current) => current.map((p) => (p.category === category ? { ...p, [channel]: value } : p)));
    const res = await fetch("/api/family/notifications/preferences", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, [channel]: value })
    }).catch(() => null);
    const json = res ? await res.json().catch(() => null) : null;
    if (json?.ok) setPrefs(json.data.preferences ?? []);
  }

  async function openProtectedBroadcast(media: ProtectedMedia) {
    await openAuthorizedLink(media.access_path, "Cette diffusion n’est pas accessible.");
  }

  async function openAuthorizedLink(accessPath: string, unavailableMessage: string) {
    setMediaBusy(true);
    setMediaMessage("");
    try {
      const response = await fetch(accessPath, { credentials: "same-origin" });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.ok || typeof json.data?.url !== "string") {
        setMediaMessage(json?.error?.message ?? unavailableMessage);
        return;
      }
      window.location.assign(json.data.url);
    } catch {
      setMediaMessage("La diffusion ne peut pas être ouverte actuellement.");
    } finally {
      setMediaBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <p className="flex items-center gap-2 text-sm font-bold text-slate-600">
        <Loader2 className="animate-spin" size={18} aria-hidden="true" /> Chargement de votre espace…
      </p>
    );
  }

  if (status === "unauth") {
    return (
      <div className="official-card mx-auto max-w-md rounded-2xl bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-black uppercase text-[#002f1d]">{resetMode ? "Mot de passe oublié" : "Connexion famille"}</h2>
        <div className="gold-divider mt-3" aria-hidden="true" />
        {resetMode ? (
          <form className="mt-5 grid gap-3" onSubmit={handleReset}>
            <label className="grid gap-1 text-sm font-bold text-slate-800">
              <span>Votre email</span>
              <input className="focus-ring min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-bold" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@email.fr" required />
            </label>
            <button className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-[#002f1d] px-4 text-sm font-black uppercase text-white hover:bg-[#07542f]" type="submit">
              Envoyer le lien
            </button>
            {resetMessage ? <p className="text-sm font-semibold text-emerald-700">{resetMessage}</p> : null}
            <button className="focus-ring text-sm font-bold text-[#07542f] underline" type="button" onClick={() => { setResetMode(false); setResetMessage(""); }}>
              ← Retour à la connexion
            </button>
          </form>
        ) : (
          <form className="mt-5 grid gap-3" onSubmit={handleLogin}>
            <label className="grid gap-1 text-sm font-bold text-slate-800">
              <span>Email</span>
              <input className="focus-ring min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-bold" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@email.fr" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-slate-800">
              <span>Mot de passe</span>
              <input className="focus-ring min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-bold" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f7c600] px-4 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white disabled:opacity-70" type="submit" disabled={loginBusy}>
              {loginBusy ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />} Se connecter
            </button>
            {loginError ? <p className="text-sm font-bold text-red-700">{loginError}</p> : null}
            <div className="grid gap-2 text-sm sm:flex sm:items-center sm:justify-between">
              <button className="focus-ring justify-self-center font-bold text-[#07542f] underline sm:justify-self-auto" type="button" onClick={() => setResetMode(true)}>Mot de passe oublié ?</button>
              <Link className="focus-ring justify-self-center font-bold text-[#07542f] underline sm:justify-self-auto" href="/inscriptions">Demander une inscription</Link>
            </div>
          </form>
        )}
      </div>
    );
  }

  const convocations = notifs.filter((notif) => notif.category === "convocation" || notif.template === "match_callup");
  const today = familyMediaDateKey();
  const currentMediaPass = mediaPasses.find((pass) => isFamilyMediaPassCurrent(pass, today)) ?? mediaPasses.find((pass) => pass.status === "ACTIVE") ?? mediaPasses[0] ?? null;
  const currentMediaPassIsActive = currentMediaPass ? isFamilyMediaPassCurrent(currentMediaPass, today) : false;
  const passStatusLabel = currentMediaPassIsActive ? "Actif" : currentMediaPass?.status === "ACTIVE" && currentMediaPass.startsOn > today ? "Programmé" : currentMediaPass?.status === "ACTIVE" && currentMediaPass.endsOn < today ? "Expiré" : currentMediaPass?.status === "PENDING_REVIEW" ? "En attente de validation" : currentMediaPass?.status === "SUSPENDED" ? "Suspendu" : currentMediaPass?.status === "REJECTED" ? "Refusé" : currentMediaPass?.status === "CANCELLED" ? "Annulé" : currentMediaPass?.status === "EXPIRED" ? "Expiré" : "Non attribué";
  const selectedMediaCategoryLabel = MEDIA_CATEGORIES.find((category) => category.value === mediaCategory)?.label ?? "ressource";
  const selectedMediaTeamName = mediaTeams.find((team) => team.id === effectiveMediaTeamId)?.name ?? null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black uppercase text-[#002f1d]">Mon espace famille</h2>
        <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-[#002f1d]/20 px-4 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white" type="button" onClick={() => void logout()}>
          <LogOut size={16} aria-hidden="true" /> Déconnexion
        </button>
      </div>

      <section className="official-card rounded-2xl bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h3 className="inline-flex items-center gap-2 text-lg font-black uppercase text-[#002f1d]"><LockKeyhole size={18} aria-hidden="true" /> Pass Famille Média</h3>{currentMediaPass ? <p className="mt-1 text-sm font-semibold text-slate-600">{currentMediaPass.startsOn} au {currentMediaPass.endsOn} · {currentMediaPass.teamNames.join(", ")}</p> : null}</div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-black uppercase ${currentMediaPassIsActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{passStatusLabel}</span>
        </div>
        {currentMediaPass ? <div className="mt-4 flex flex-wrap gap-2">{[[currentMediaPass.allowPhotos, "Photos"], [currentMediaPass.allowTrainingVideos, "Vidéos d’entraînement"], [currentMediaPass.allowLiveMatches, "Matchs en direct"]].filter(([allowed]) => allowed).map(([, label]) => <span key={String(label)} className="rounded-md border border-[#07542f]/20 bg-emerald-50 px-2.5 py-1 text-xs font-black uppercase text-[#07542f]">{label}</span>)}</div> : <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-5 text-center text-sm font-semibold text-slate-500">Aucun accès média annuel n’est actif pour cette famille.</p>}
      </section>

      {currentMediaPassIsActive && liveMatches.length > 0 ? (
        <section aria-labelledby="family-live-matches-title">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="inline-flex items-center gap-2 text-lg font-black uppercase text-[#002f1d]" id="family-live-matches-title"><Radio size={18} className="text-red-600" aria-hidden="true" /> Matchs en direct</h3>
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-black text-white">{liveMatches.length}</span>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {liveMatches.map((match) => {
              const homeName = match.location === "AWAY" ? match.opponentName : match.teamName;
              const awayName = match.location === "AWAY" ? match.teamName : match.opponentName;
              const hasScore = match.homeScore !== null && match.awayScore !== null;
              return (
                <article className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm" key={match.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-black uppercase text-white"><Radio size={14} aria-hidden="true" /> En direct{match.liveMinute !== null ? ` · ${match.liveMinute}’` : ""}</p>
                      <h4 className="mt-3 break-words text-base font-black uppercase text-[#002f1d]">{homeName} - {awayName}</h4>
                      <p className="mt-1 break-words text-sm font-bold text-slate-700">{hasScore ? `${match.homeScore} - ${match.awayScore}` : "Score en attente"}{match.competition ? ` · ${match.competition}` : ""}</p>
                    </div>
                    <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#f7c600] px-4 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white disabled:opacity-60" disabled={mediaBusy} type="button" onClick={() => void openAuthorizedLink(match.accessPath, "Le lien du match n’est pas accessible.")}><ExternalLink size={17} aria-hidden="true" /> Voir le match</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {currentMediaPassIsActive ? (
        <section aria-labelledby="family-media-library-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="inline-flex items-center gap-2 text-lg font-black uppercase text-[#002f1d]" id="family-media-library-title"><Library size={18} aria-hidden="true" /> Mes ressources</h3>
              <p className="mt-1 text-sm font-semibold text-slate-600">{protectedMedia.length} ressource{protectedMedia.length > 1 ? "s" : ""} accessible{protectedMedia.length > 1 ? "s" : ""}</p>
            </div>
            {(mediaCategory !== "ALL" || effectiveMediaTeamId) ? <button className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600]" type="button" onClick={() => { setMediaCategory("ALL"); setMediaTeamId(null); }}><RotateCcw size={15} aria-hidden="true" /> Réinitialiser</button> : null}
          </div>

          {protectedMedia.length > 0 ? (
            <>
              <div className="mt-4 grid gap-3 border-y border-slate-200 py-4 lg:flex lg:flex-wrap lg:items-end lg:justify-between" aria-label="Filtres des ressources">
                <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap" role="group" aria-label="Type de ressource">
                  {MEDIA_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const selected = mediaCategory === category.value;
                    return <button key={category.value} type="button" aria-pressed={selected} onClick={() => setMediaCategory(category.value)} className={`focus-ring inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-md border px-3 text-center text-xs font-black uppercase ${selected ? "border-[#002f1d] bg-[#002f1d] text-white" : "border-slate-300 bg-white text-[#002f1d] hover:border-[#f7c600]"}`}><Icon className="shrink-0" size={15} aria-hidden="true" /><span className="min-w-0 break-words">{category.label} <span aria-label={`${mediaCounts[category.value]} ressource${mediaCounts[category.value] > 1 ? "s" : ""}`}>({mediaCounts[category.value]})</span></span></button>;
                  })}
                </div>
                {mediaTeams.length > 1 ? <label className="grid gap-1 text-xs font-black uppercase text-slate-600" htmlFor={mediaTeamFilterId}><span>Équipe</span><select id={mediaTeamFilterId} className="focus-ring min-h-11 max-w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold normal-case text-slate-900" value={effectiveMediaTeamId ?? ""} onChange={(event) => setMediaTeamId(event.target.value || null)}><option value="">Toutes les équipes</option>{mediaTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label> : null}
              </div>

              {visibleProtectedMedia.length > 0 ? <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProtectedMedia.map((media) => <article key={media.id} className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  {media.type === "PHOTO" ? <img src={`/api/family/media/${media.id}/file`} alt={media.alt_text ?? media.title} className="aspect-video w-full object-cover" loading="lazy" /> : media.playback_kind === "VIDEO" ? <video controls playsInline preload="metadata" poster={media.thumbnail_url ?? undefined} src={`/api/family/media/${media.id}/file`} className="aspect-video w-full bg-black object-contain" aria-label={media.title} /> : <button type="button" disabled={mediaBusy} onClick={() => void openProtectedBroadcast(media)} className="focus-ring group relative block aspect-video w-full overflow-hidden bg-[#002f1d] text-white disabled:opacity-60">{media.thumbnail_url ? <img src={media.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" /> : null}<span className="absolute inset-0 flex items-center justify-center p-3"><span className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#f7c600] px-4 py-3 text-sm font-black uppercase text-[#002f1d]"><ExternalLink size={17} aria-hidden="true" /> Ouvrir le direct</span></span></button>}
                  <div className="p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-2 text-[11px] font-black uppercase text-[#07542f]">{media.is_live ? <Radio size={14} className="text-red-600" aria-hidden="true" /> : media.type === "PHOTO" ? <Camera size={14} aria-hidden="true" /> : <Clapperboard size={14} aria-hidden="true" />}{media.is_live ? "En direct" : media.content_kind === "TRAINING" ? "Entraînement" : media.type === "PHOTO" ? "Photo" : "Match"}</p><span className="max-w-full break-words rounded bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">{media.team_name}</span></div><h4 className="mt-2 break-words text-sm font-black text-[#002f1d]">{media.title}</h4>{formatMediaDate(media.published_at) ? <p className="mt-1 text-xs font-semibold text-slate-500">Publié le {formatMediaDate(media.published_at)}</p> : null}{media.type === "PHOTO" || media.playback_kind === "VIDEO" ? <a className="focus-ring mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-md border border-[#002f1d]/20 px-3 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600]" download href={`/api/family/media/${media.id}/file?download=1`}><Download size={15} aria-hidden="true" /> Télécharger</a> : null}</div>
                </article>)}
              </div> : <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center text-sm font-semibold text-slate-600">Aucune ressource « {selectedMediaCategoryLabel} »{selectedMediaTeamName ? ` pour ${selectedMediaTeamName}` : ""} ne correspond à ces filtres.</p>}
            </>
          ) : <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center text-sm font-semibold text-slate-600">Aucune ressource réservée n’est publiée pour vos équipes.</p>}
        </section>
      ) : null}

      {mediaMessage ? <p role="alert" className="text-sm font-bold text-red-700">{mediaMessage}</p> : null}

      {/* Convocations */}
      <section className="official-card rounded-2xl bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="inline-flex items-center gap-2 text-lg font-black uppercase text-[#002f1d]">
            <Trophy size={18} aria-hidden="true" /> Mes convocations
          </h3>
          {convocations.length > 0 ? <span className="rounded-full bg-[#f7c600] px-2.5 py-1 text-xs font-black uppercase text-[#002f1d]">{convocations.length}</span> : null}
        </div>
        <div className="mt-4 grid gap-3">
          {convocations.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-5 text-center text-sm font-semibold text-slate-500">Aucune convocation reçue pour le moment.</p>
          ) : (
            convocations.map((notif) => {
              const rows = convocationRows(notif);
              return (
                <article key={notif.id} className="rounded-lg border border-[#f7c600]/40 bg-[#fffdf3] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase text-[#07542f]">{payloadText(notif.payload, "eventTypeName") ?? "Convocation"}</p>
                      <h4 className="mt-1 text-base font-black uppercase text-[#002f1d]">{notif.subject ?? "Convocation match"}</h4>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black uppercase text-slate-500 ring-1 ring-slate-200">{relativeFr(notif.created_at)}</span>
                  </div>
                  <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                    {rows.map((row) => (
                      <div key={`${notif.id}-${row.label}`} className={row.label === "Consignes" || row.label === "Message éducateur" ? "sm:col-span-2" : undefined}>
                        <dt className="text-[11px] font-black uppercase text-slate-500">{row.label}</dt>
                        <dd className="mt-0.5 text-sm font-bold leading-5 text-slate-800">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 rounded-md bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                    Merci de prévenir l'éducateur rapidement en cas d'empêchement.
                  </p>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* Notifications */}
      <section className="official-card rounded-2xl bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="inline-flex items-center gap-2 text-lg font-black uppercase text-[#002f1d]">
            <Bell size={18} aria-hidden="true" /> Notifications
            {unread > 0 ? <span className="rounded-full bg-[#f7c600] px-2 py-0.5 text-xs font-black text-[#002f1d]">{unread}</span> : null}
          </h3>
          {unread > 0 ? (
            <button className="focus-ring inline-flex items-center gap-1.5 text-sm font-bold text-[#07542f] hover:underline" type="button" onClick={() => void markAllRead()}>
              <CheckCheck size={16} aria-hidden="true" /> Tout marquer comme lu
            </button>
          ) : null}
        </div>
        <div className="mt-4 grid gap-2">
          {notifs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-5 text-center text-sm font-semibold text-slate-500">Aucune notification pour le moment.</p>
          ) : (
            notifs.map((notif) => {
              const cat = CATEGORIES[notif.category ?? ""] ?? { label: "Information", icon: Bell };
              const Icon = cat.icon;
              const isUnread = !notif.read_at;
              const line = notifLine(notif);
              // Message libre d'une campagne du club : il EST le contenu de la notification.
              const body = payloadText(notif.payload, "body");
              return (
                <div key={notif.id} className={`flex items-start gap-3 rounded-lg border p-3 ${isUnread ? "border-[#f7c600]/60 bg-[#fffdf3]" : "border-slate-200 bg-white"}`}>
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#07542f]/10 text-[#07542f]" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[#002f1d]">{notif.subject ?? cat.label}</p>
                    {body ? <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{body}</p> : null}
                    {line ? <p className="text-xs font-semibold text-slate-600">{line}</p> : null}
                    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">{cat.label} · {relativeFr(notif.created_at)}</p>
                  </div>
                  {isUnread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#f7c600]" aria-label="Non lu" /> : null}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Mes enfants */}
      <section className="official-card rounded-2xl bg-white p-5 sm:p-6">
        <h3 className="inline-flex items-center gap-2 text-lg font-black uppercase text-[#002f1d]"><Users size={18} aria-hidden="true" /> Mes licenciés</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {players.length === 0 ? (
            <p className="text-sm font-semibold text-slate-500">Aucun licencié rattaché. Rendez-vous sur la page Inscriptions.</p>
          ) : (
            players.map((player) => (
              <div key={player.id} className="rounded-lg border border-slate-200 bg-[#fbfcf8] px-4 py-3 font-black uppercase text-[#002f1d]">
                {player.first_name} {player.last_name}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Préférences de notifications */}
      <section className="official-card rounded-2xl bg-white p-5 sm:p-6">
        <h3 className="text-lg font-black uppercase text-[#002f1d]">Préférences de notifications</h3>
        <p className="mt-1 text-sm text-slate-600">Choisissez comment vous souhaitez être prévenu. Les notifications restent toujours visibles ici dans votre espace.</p>
        <div className="mt-4 grid gap-2">
          <div className="hidden grid-cols-[1fr_auto_auto] gap-4 px-3 text-[11px] font-black uppercase text-slate-400 sm:grid">
            <span>Catégorie</span><span>Email</span><span>Push</span>
          </div>
          {prefs.map((pref) => {
            const cat = CATEGORIES[pref.category] ?? { label: pref.category, icon: Bell };
            return (
              <div key={pref.category} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg border border-slate-200 px-3 py-2.5">
                <span className="text-sm font-black uppercase text-[#002f1d]">{cat.label}</span>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="sm:hidden">Email</span>
                  <input className="focus-ring h-5 w-5 accent-[#07542f]" type="checkbox" checked={pref.email} onChange={(e) => void togglePref(pref.category, "email", e.target.checked)} aria-label={`Email pour ${cat.label}`} />
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="sm:hidden">Push</span>
                  <input className="focus-ring h-5 w-5 accent-[#07542f]" type="checkbox" checked={pref.push} onChange={(e) => void togglePref(pref.category, "push", e.target.checked)} aria-label={`Push pour ${cat.label}`} />
                </label>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

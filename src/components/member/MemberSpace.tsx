"use client";

import { Bell, CalendarDays, Camera, CheckCheck, Loader2, LogIn, LogOut, Megaphone, Trophy, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Player = { id: string; first_name: string; last_name: string };
type Notif = {
  id: string;
  subject: string | null;
  category: string | null;
  link: string | null;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};
type Pref = { category: string; email: boolean; push: boolean };

const CATEGORIES: Record<string, { label: string; icon: LucideIcon }> = {
  convocation: { label: "Convocations", icon: Trophy },
  session: { label: "Entraînements", icon: CalendarDays },
  media: { label: "Photos & médias", icon: Camera },
  news: { label: "Actualités", icon: Megaphone },
  event: { label: "Événements", icon: Bell }
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

export function MemberSpace() {
  const [status, setStatus] = useState<"loading" | "unauth" | "ready">("loading");
  const [players, setPlayers] = useState<Player[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [prefs, setPrefs] = useState<Pref[]>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

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
      await Promise.all([loadNotifs(), loadPrefs()]);
      setStatus("ready");
    } else {
      setStatus("unauth");
    }
  }, [loadNotifs, loadPrefs]);

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
            <div className="flex items-center justify-between text-sm">
              <button className="focus-ring font-bold text-[#07542f] underline" type="button" onClick={() => setResetMode(true)}>Mot de passe oublié ?</button>
              <Link className="focus-ring font-bold text-[#07542f] underline" href="/inscriptions">Créer un compte</Link>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black uppercase text-[#002f1d]">Mon espace famille</h2>
        <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-[#002f1d]/20 px-4 text-sm font-black uppercase text-[#002f1d] hover:bg-[#002f1d] hover:text-white" type="button" onClick={() => void logout()}>
          <LogOut size={16} aria-hidden="true" /> Déconnexion
        </button>
      </div>

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
              return (
                <div key={notif.id} className={`flex items-start gap-3 rounded-lg border p-3 ${isUnread ? "border-[#f7c600]/60 bg-[#fffdf3]" : "border-slate-200 bg-white"}`}>
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#07542f]/10 text-[#07542f]" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[#002f1d]">{notif.subject ?? cat.label}</p>
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

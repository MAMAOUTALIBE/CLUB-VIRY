"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  Mail,
  Quote,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Star,
  Trophy,
  User,
  Users,
  X
} from "lucide-react";

import type { DisplayEducator } from "@/lib/public-content";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase() || "?";
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

// Normalisation pour une recherche insensible casse + accents.
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function DiplomaBadge({ diploma, className }: { diploma: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#07542f] px-3 py-1 text-xs font-black uppercase text-white shadow-lg ring-1 ring-[#f7c600]/40 ${className ?? ""}`}
    >
      <ShieldCheck size={13} className="text-[#f7c600]" aria-hidden="true" />
      {diploma}
    </span>
  );
}

// Bannière : photo de l'éducateur, ou stade Henri Longuet + monogramme doré.
export function EducatorBanner({ educator, className, showBadge = true }: { educator: DisplayEducator; className: string; showBadge?: boolean }) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {educator.avatar ? (
        <img src={educator.avatar} alt={educator.name} className="h-full w-full object-cover" />
      ) : (
        <div className="relative flex h-full w-full items-center justify-center">
          <img src="/stade/imagepelouse.webp" alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#001c10]/82 text-3xl font-black uppercase text-[#f7c600] ring-2 ring-[#f7c600]/80 shadow-lg">
            {initials(educator.name)}
          </span>
        </div>
      )}
      {showBadge && educator.diploma ? <DiplomaBadge diploma={educator.diploma} className="absolute right-3 top-3" /> : null}
    </div>
  );
}

export function StatBlock({ icon: Icon, value, label, compact }: { icon: LucideIcon; value: number; label: string; compact?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon size={compact ? 16 : 20} className="text-[#07542f]" aria-hidden="true" />
      <span className={`${compact ? "text-lg" : "text-2xl"} font-black leading-none`}>{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-black/45">{label}</span>
    </div>
  );
}

export function TeamChip({ team }: { team: DisplayEducator["teams"][number] }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-[#07542f]/[0.08] px-2.5 py-1 text-[11px] font-black uppercase text-[#07542f]"
      title={team.roleTitle}
    >
      {team.isHeadCoach ? <Star size={12} className="text-[#f7c600]" aria-hidden="true" /> : <Shield size={12} aria-hidden="true" />}
      <span className="max-w-[8rem] truncate">{team.name}</span>
      <span className="font-bold text-black/40">· {team.category}</span>
    </span>
  );
}

function StatsRow({ educator, compact }: { educator: DisplayEducator; compact?: boolean }) {
  return (
    <>
      <StatBlock icon={Users} value={educator.stats.teams} label={educator.stats.teams > 1 ? "Équipes" : "Équipe"} compact={compact} />
      <StatBlock icon={CalendarDays} value={educator.stats.sessions} label="Séances" compact={compact} />
      <StatBlock icon={Trophy} value={educator.stats.matches} label="Matchs" compact={compact} />
    </>
  );
}

function TeamChips({ educator }: { educator: DisplayEducator }) {
  const visible = educator.teams.slice(0, 2);
  const extra = educator.teams.length - visible.length;
  if (educator.teams.length === 0) {
    return <span className="text-[11px] font-semibold uppercase tracking-wide text-black/35">Encadrement</span>;
  }
  return (
    <>
      {visible.map((team) => (
        <TeamChip key={`${team.slug}-${team.roleTitle}`} team={team} />
      ))}
      {extra > 0 ? (
        <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-1 text-[11px] font-black uppercase text-black/50">+{extra}</span>
      ) : null}
    </>
  );
}

// ---- Carte (carrousel) : bannière photo + badge diplôme + CTA or ----
function EducatorCardLarge({ educator, onOpen }: { educator: DisplayEducator; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Voir la fiche de ${educator.name} et le contacter`}
      className="official-card focus-ring group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left text-[#002f1d] shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <EducatorBanner educator={educator} className="h-40" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-black uppercase leading-tight">{educator.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-black/55">{educator.title}</p>
        <span className="mt-2 h-1 w-12 rounded-full bg-[#f7c600]" aria-hidden="true" />

        {educator.specialties.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {educator.specialties.slice(0, 2).map((s) => (
              <span key={s} className="rounded-full bg-[#002f1d]/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#002f1d]/70">
                {s}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex min-h-[1.75rem] flex-wrap content-start gap-1.5">
          <TeamChips educator={educator} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/5 pt-4 text-center">
          <StatsRow educator={educator} compact />
        </div>

        <span className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#f7c600] py-3 text-sm font-black uppercase tracking-wide text-[#001c10] shadow-[0_10px_22px_-12px_rgba(247,198,0,0.8)] transition group-hover:bg-[#ffd84d]">
          <User size={15} aria-hidden="true" />
          Voir la fiche &amp; contacter
          <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

// ---- Formulaire de contact (dans la fiche) ----
export function ContactForm({ educator }: { educator: DisplayEducator }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = fullName.trim().length >= 2 && emailValid && message.trim().length >= 10 && status !== "sending";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject: `Éducateur ${educator.name} — ${educator.title}`,
          message: `Message destiné à l'éducateur ${educator.name} (${educator.title}), à relayer par le club.\n\n${message.trim()}`
        })
      });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(json?.error?.message ?? json?.message ?? "L'envoi a échoué. Réessayez ou contactez le club.");
      }
    } catch {
      setStatus("error");
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-[#07542f]/20 bg-[#07542f]/[0.06] p-6 text-center">
        <CheckCircle2 size={36} className="mx-auto text-[#07542f]" aria-hidden="true" />
        <p className="mt-3 text-sm font-bold text-[#002f1d]">Message envoyé !</p>
        <p className="mt-1 text-sm text-black/60">
          Le club a bien reçu votre message pour {firstName(educator.name)} et le lui transmettra.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setFullName("");
            setEmail("");
            setPhone("");
            setMessage("");
          }}
          className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full bg-[#07542f] px-4 py-2 text-xs font-black uppercase text-white transition hover:bg-[#002f1d]"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  const inputCls =
    "focus-ring w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[#002f1d] outline-none placeholder:text-black/35";

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <p className="text-sm text-black/60">
        Écrivez à <span className="font-bold text-[#002f1d]">{firstName(educator.name)}</span> : votre message est transmis au club, qui le relaie. Son adresse e-mail reste privée.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputCls} placeholder="Votre nom *" aria-label="Votre nom" aria-required="true" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
        <input className={inputCls} type="email" placeholder="Votre e-mail *" aria-label="Votre e-mail" aria-required="true" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      <input className={inputCls} placeholder="Téléphone (optionnel)" aria-label="Téléphone (optionnel)" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
      <textarea
        className={`${inputCls} min-h-[110px] resize-y`}
        placeholder="Votre message *"
        aria-label="Votre message"
        aria-required="true"
        value={message}
        maxLength={1500}
        onChange={(e) => setMessage(e.target.value)}
      />
      {error ? <p role="alert" className="text-sm font-semibold text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={!canSubmit}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f7c600] px-5 py-3 text-sm font-black uppercase text-[#001c10] shadow-[0_12px_24px_-10px_rgba(247,198,0,0.6)] transition hover:-translate-y-0.5 hover:bg-[#ffd84d] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {status === "sending" ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
        {status === "sending" ? "Envoi…" : "Envoyer le message"}
      </button>
    </form>
  );
}

// ---- Fiche détaillée (modale) ----
function EducatorModal({ educator, onClose }: { educator: DisplayEducator; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mémorise l'élément déclencheur (la carte) pour lui rendre le focus à la fermeture.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus trap : garde la tabulation à l'intérieur de la modale.
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Fiche de ${educator.name}`}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white text-[#002f1d] shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer la fiche"
          className="focus-ring absolute right-3 top-3 z-20 rounded-full bg-black/35 p-2 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-black/55"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* Bannière (figée) */}
        <div className="relative shrink-0">
          <EducatorBanner educator={educator} className="h-48 sm:h-56" showBadge={false} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            {educator.diploma ? <DiplomaBadge diploma={educator.diploma} className="mb-2" /> : null}
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f7c600]">Éducateur du club</p>
            <h2 className="mt-1 text-2xl font-black uppercase leading-tight text-white">{educator.name}</h2>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-[#f7c600]">
              <GraduationCap size={15} aria-hidden="true" />
              {educator.title}
            </p>
          </div>
        </div>
        <div aria-hidden="true" className="h-1 w-full shrink-0 bg-gradient-to-r from-[#f7c600] via-[#ffd84d] to-[#f7c600]" />

        {/* Corps (défilant) */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, value: educator.stats.teams, label: educator.stats.teams > 1 ? "Équipes" : "Équipe" },
              { icon: CalendarDays, value: educator.stats.sessions, label: "Séances" },
              { icon: Trophy, value: educator.stats.matches, label: "Matchs" }
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-black/5 bg-[#f7f7f5] p-4 transition hover:border-[#f7c600]/40 hover:bg-[#f7c600]/[0.06]"
              >
                <StatBlock icon={stat.icon} value={stat.value} label={stat.label} />
              </div>
            ))}
          </div>

          {educator.quote ? (
            <figure className="rounded-2xl border-l-4 border-[#f7c600] bg-[#f7f7f5] p-4">
              <Quote size={18} className="text-[#f7c600]" aria-hidden="true" />
              <blockquote className="mt-1 text-sm italic leading-6 text-[#002f1d]">« {educator.quote} »</blockquote>
            </figure>
          ) : null}

          {educator.joinedYear || educator.diplomas.length > 0 ? (
            <div>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-black/45">
                <span className="h-3 w-1 rounded-full bg-[#f7c600]" aria-hidden="true" />
                Diplômes &amp; parcours
              </h3>
              {educator.joinedYear ? (
                <p className="mt-2 text-sm text-black/60">
                  Au club depuis <span className="font-bold text-[#002f1d]">{educator.joinedYear}</span>
                </p>
              ) : null}
              {educator.diplomas.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {educator.diplomas.map((d) => (
                    <li key={d}>
                      <DiplomaBadge diploma={d} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {educator.specialties.length > 0 ? (
            <div>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-black/45">
                <span className="h-3 w-1 rounded-full bg-[#f7c600]" aria-hidden="true" />
                Spécialités
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {educator.specialties.map((s) => (
                  <span key={s} className="rounded-full bg-[#07542f]/[0.08] px-3 py-1 text-xs font-black uppercase text-[#07542f]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {educator.bio ? (
            <div>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-black/45">
                <span className="h-3 w-1 rounded-full bg-[#f7c600]" aria-hidden="true" />
                À propos
              </h3>
              <p className="mt-2 text-sm leading-6 text-black/70">{educator.bio}</p>
            </div>
          ) : null}

          {educator.teams.length > 0 ? (
            <div>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-black/45">
                <span className="h-3 w-1 rounded-full bg-[#f7c600]" aria-hidden="true" />
                Équipes encadrées
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {educator.teams.map((team) => (
                  <TeamChip key={`${team.slug}-${team.roleTitle}`} team={team} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-black/5 bg-[#f7f7f5] p-5">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase text-[#002f1d]">
              <Mail size={16} className="text-[#07542f]" aria-hidden="true" />
              Écrire à {firstName(educator.name)}
            </h3>
            <div className="mt-3">
              <ContactForm educator={educator} />
            </div>
          </div>

          <Link
            href={`/le-club/encadrement/${educator.slug}`}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#07542f]/25 bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-[#07542f] transition hover:-translate-y-0.5 hover:border-[#07542f] hover:bg-[#07542f] hover:text-white"
          >
            Voir toute la page
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---- Annuaire : recherche + filtre + carrousel 3 cartes ----
export function EducatorsDirectory({ educators }: { educators: DisplayEducator[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<DisplayEducator | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    educators.forEach((educator) => educator.teams.forEach((team) => team.category && set.add(team.category)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [educators]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return educators.filter((educator) => {
      if (category && !educator.teams.some((team) => team.category === category)) {
        return false;
      }
      if (!q) {
        return true;
      }
      const haystack = normalize(
        [educator.name, educator.title, educator.diploma ?? "", ...educator.teams.flatMap((team) => [team.name, team.category, team.roleTitle])].join(" ")
      );
      return haystack.includes(q);
    });
  }, [educators, query, category]);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (el) {
      el.scrollLeft = 0;
    }
    updateArrows();
    const raf = requestAnimationFrame(updateArrows);
    return () => cancelAnimationFrame(raf);
  }, [filtered]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    // rAF + ResizeObserver : recalcule l'état des flèches après le layout et au
    // moindre changement de taille (viewport, chargement des bannières).
    const raf = requestAnimationFrame(updateArrows);
    const observer = new ResizeObserver(() => updateArrows());
    observer.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const scrollByPage = (direction: number) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  const hasFilters = query.trim() !== "" || category !== "";

  return (
    <div className="mt-8">
      {/* Recherche + filtre */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#07542f]/60" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un éducateur (nom, équipe, catégorie…)"
            aria-label="Rechercher un éducateur"
            className="focus-ring w-full rounded-full border border-black/10 bg-white py-3 pl-11 pr-10 text-sm font-medium text-[#002f1d] shadow-sm outline-none placeholder:text-black/40"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
              className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-black/45 transition hover:bg-black/5 hover:text-black/70"
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filtrer par catégorie d'équipe"
          className="focus-ring rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#07542f] shadow-sm outline-none sm:w-56"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-black/55">
        <Users size={15} className="text-[#07542f]" aria-hidden="true" />
        {filtered.length} éducateur{filtered.length > 1 ? "s" : ""}
        {hasFilters ? <span className="text-black/40">— filtré{filtered.length > 1 ? "s" : ""}</span> : null}
      </p>

      {filtered.length > 0 ? (
        <div className="relative mt-5">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canLeft}
            aria-label="Voir les éducateurs précédents"
            className="focus-ring absolute -left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#07542f] text-white shadow-lg ring-1 ring-[#f7c600]/40 transition hover:bg-[#002f1d] disabled:pointer-events-none disabled:opacity-0 sm:flex"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canRight}
            aria-label="Voir les éducateurs suivants"
            className="focus-ring absolute -right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#07542f] text-white shadow-lg ring-1 ring-[#f7c600]/40 transition hover:bg-[#002f1d] disabled:pointer-events-none disabled:opacity-0 sm:flex"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>

          {canLeft ? <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" aria-hidden="true" /> : null}
          {canRight ? <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" aria-hidden="true" /> : null}

          <div
            ref={trackRef}
            onScroll={updateArrows}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filtered.map((educator) => (
              <div key={educator.id} className="educators-carousel-item snap-start">
                <EducatorCardLarge educator={educator} onOpen={() => setSelected(educator)} />
              </div>
            ))}
          </div>

          <p className="mt-1 text-center text-xs text-black/35 sm:hidden">Faites glisser pour voir tous les éducateurs →</p>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-black/15 bg-white/60 p-10 text-center">
          <p className="text-sm font-semibold text-black/60">
            Aucun éducateur ne correspond
            {query.trim() ? (
              <>
                {" "}à « <span className="font-black text-[#002f1d]">{query.trim()}</span> »
              </>
            ) : null}
            {category ? (
              <>
                {" "}dans <span className="font-black text-[#002f1d]">{category}</span>
              </>
            ) : null}
            .
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("");
            }}
            className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full bg-[#07542f] px-4 py-2 text-xs font-black uppercase text-white transition hover:bg-[#002f1d]"
          >
            <X size={14} aria-hidden="true" />
            Réinitialiser
          </button>
        </div>
      )}

      {selected ? <EducatorModal educator={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

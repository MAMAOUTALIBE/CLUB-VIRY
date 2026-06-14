"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  Mail,
  Search,
  Send,
  Shield,
  Star,
  Trophy,
  Users,
  X
} from "lucide-react";

import type { DisplayEducator } from "@/lib/public-content";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase() || "?";
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

// Normalisation pour une recherche insensible casse + accents.
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function Avatar({ educator, size }: { educator: DisplayEducator; size: "md" | "xl" }) {
  const cls = size === "xl" ? "h-24 w-24 text-2xl ring-4" : "h-16 w-16 text-lg ring-2";
  if (educator.avatar) {
    return <img src={educator.avatar} alt={educator.name} className={`${cls} shrink-0 rounded-full object-cover ring-[#f7c600]`} />;
  }
  return (
    <span
      className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-[#07542f] font-black uppercase text-[#f7c600] ring-[#f7c600]`}
      aria-hidden="true"
    >
      {initials(educator.name)}
    </span>
  );
}

function StatBlock({ icon: Icon, value, label, compact }: { icon: LucideIcon; value: number; label: string; compact?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon size={compact ? 16 : 20} className="text-[#07542f]" aria-hidden="true" />
      <span className={`${compact ? "text-lg" : "text-2xl"} font-black leading-none`}>{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-black/45">{label}</span>
    </div>
  );
}

function TeamChip({ team }: { team: DisplayEducator["teams"][number] }) {
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

// ---- Carte (carrousel) : agrandie, cliquable ----
function EducatorCardLarge({ educator, onOpen }: { educator: DisplayEducator; onOpen: () => void }) {
  const visibleTeams = educator.teams.slice(0, 2);
  const extra = educator.teams.length - visibleTeams.length;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Voir la fiche de ${educator.name} et le contacter`}
      className="official-card focus-ring group flex h-full w-[18rem] flex-col rounded-2xl bg-white p-5 text-left text-[#002f1d] shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-center gap-3.5">
        <Avatar educator={educator} size="md" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-black uppercase leading-tight">{educator.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-bold text-[#07542f]">
            <GraduationCap size={13} aria-hidden="true" />
            <span className="truncate">{educator.title}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex min-h-[1.75rem] flex-wrap content-start gap-1.5">
        {visibleTeams.map((team) => (
          <TeamChip key={`${team.slug}-${team.roleTitle}`} team={team} />
        ))}
        {extra > 0 ? (
          <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-1 text-[11px] font-black uppercase text-black/50">+{extra}</span>
        ) : null}
        {educator.teams.length === 0 ? (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-black/35">Encadrement</span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/5 pt-4 text-center">
        <StatBlock icon={Users} value={educator.stats.teams} label={educator.stats.teams > 1 ? "Équipes" : "Équipe"} compact />
        <StatBlock icon={CalendarDays} value={educator.stats.sessions} label="Séances" compact />
        <StatBlock icon={Trophy} value={educator.stats.matches} label="Matchs" compact />
      </div>

      <span className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#07542f]/[0.06] py-2 text-xs font-black uppercase tracking-wide text-[#07542f] transition group-hover:bg-[#f7c600] group-hover:text-[#001c10]">
        <Mail size={14} aria-hidden="true" />
        Voir la fiche & contacter
      </span>
    </button>
  );
}

// ---- Formulaire de contact (dans la fiche) ----
function ContactForm({ educator }: { educator: DisplayEducator }) {
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
      <div className="rounded-2xl border border-[#07542f]/20 bg-[#07542f]/[0.06] p-6 text-center">
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
        <input className={inputCls} placeholder="Votre nom *" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
        <input className={inputCls} type="email" placeholder="Votre e-mail *" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      <input className={inputCls} placeholder="Téléphone (optionnel)" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
      <textarea
        className={`${inputCls} min-h-[110px] resize-y`}
        placeholder="Votre message *"
        value={message}
        maxLength={1500}
        onChange={(e) => setMessage(e.target.value)}
      />
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
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

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
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
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white text-[#002f1d] shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer la fiche"
          className="focus-ring absolute right-3 top-3 z-20 rounded-full bg-white/15 p-2 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/30"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* En-tête premium (figé) */}
        <div className="club-shell relative shrink-0 overflow-hidden px-6 py-7 sm:px-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#f7c600]/12 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-10 h-44 w-44 rounded-full bg-[#07542f]/40 blur-3xl" />
          <div className="relative flex items-center gap-5 pr-10">
            <div className="relative shrink-0">
              <span aria-hidden="true" className="absolute -inset-2 rounded-full bg-[#f7c600]/25 blur-xl" />
              <span className="relative inline-flex">
                <Avatar educator={educator} size="xl" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#f7c600]/90">Éducateur du club</p>
              <h2 className="mt-1 truncate text-xl font-black uppercase leading-tight text-white sm:text-2xl">{educator.name}</h2>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-[#f7c600]">
                <GraduationCap size={15} aria-hidden="true" />
                {educator.title}
              </p>
            </div>
          </div>
        </div>
        {/* Filet or */}
        <div aria-hidden="true" className="h-1 w-full shrink-0 bg-gradient-to-r from-[#f7c600] via-[#ffd84d] to-[#f7c600]" />

        {/* Corps (défilant) */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
          {/* Stats */}
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

          {/* Bio */}
          {educator.bio ? (
            <div>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-black/45">
                <span className="h-3 w-1 rounded-full bg-[#f7c600]" aria-hidden="true" />
                À propos
              </h3>
              <p className="mt-2 text-sm leading-6 text-black/70">{educator.bio}</p>
            </div>
          ) : null}

          {/* Équipes */}
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

          {/* Contact */}
          <div className="rounded-2xl border border-black/5 bg-[#f7f7f5] p-5">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase text-[#002f1d]">
              <Mail size={16} className="text-[#07542f]" aria-hidden="true" />
              Écrire à {firstName(educator.name)}
            </h3>
            <div className="mt-3">
              <ContactForm educator={educator} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Annuaire : recherche + filtre + carrousel 2 lignes ----
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
        [educator.name, educator.title, ...educator.teams.flatMap((team) => [team.name, team.category, team.roleTitle])].join(" ")
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
  }, [filtered]);

  useEffect(() => {
    updateArrows();
    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollByPage = (direction: number) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
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
            className="grid snap-x snap-mandatory grid-flow-col grid-rows-2 gap-4 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filtered.map((educator) => (
              <div key={educator.id} className="snap-start">
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

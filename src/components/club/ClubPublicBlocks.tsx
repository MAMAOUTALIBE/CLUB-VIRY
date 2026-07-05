"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ClipboardCheck, Clock, GraduationCap, MapPin, Megaphone, Search, ShieldCheck, Trophy, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { PersonProfileCard } from "@/components/PersonProfileCard";
import type { ConductBlock, Installation, OrgNode, RegulationItem, StaffPerson, Stage } from "@/lib/club-pages-data";

const iconMap = {
  ClipboardCheck,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  Trophy,
  Users
};

function unique(values: string[]) {
  return Array.from(new Set(values)).filter(Boolean);
}

export function StaffDirectory({ people, intro }: { people: StaffPerson[]; intro?: string }) {
  const categories = useMemo(() => ["Tous", ...unique(people.map((person) => person.category))], [people]);
  const [category, setCategory] = useState("Tous");
  const [query, setQuery] = useState("");

  const filtered = people.filter((person) => {
    const matchesCategory = category === "Tous" || person.category === category;
    const haystack = `${person.name} ${person.role} ${person.category} ${person.pole} ${person.tags?.join(" ") ?? ""}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {intro ? <p className="max-w-3xl text-base leading-7 text-slate-700">{intro}</p> : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px] lg:items-center">
        <div className="flex flex-wrap gap-2" role="list" aria-label="Filtrer par catégorie">
          {categories.map((item) => (
            <button
              className={`focus-ring rounded-md px-4 py-2 text-xs font-black uppercase transition ${
                category === item ? "bg-[#07542f] text-white shadow" : "border border-[#07542f]/15 bg-white text-[#07542f] hover:border-[#f7c600]"
              }`}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <label className="focus-within:ring-focus flex h-12 items-center gap-2 rounded-md border border-[#07542f]/15 bg-white px-4 text-sm font-bold text-slate-600">
          <Search size={18} className="shrink-0 text-[#07542f]" aria-hidden="true" />
          <span className="sr-only">Rechercher un éducateur ou dirigeant</span>
          <input
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher..."
            type="search"
            value={query}
          />
        </label>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4 3xl:grid-cols-5">
        {filtered.map((person) => {
          const missionCount = Math.max(1, person.tags?.length ?? 0);
          const scopeCount = unique([person.category, person.pole]).length;

          return (
            <PersonProfileCard
              actionHref={person.href ?? "/contact"}
              actionLabel={person.href ? "Voir la fiche & contacter" : "Contacter le club"}
              avatarPhoto={person.avatarPhoto}
              badge={person.badge ?? person.category}
              category={person.category}
              coverImage={person.coverPhoto ?? person.photo}
              key={`${person.name}-${person.role}`}
              name={person.name}
              pole={person.pole}
              role={person.role}
              stats={[
                { icon: "users", label: "Pôles", value: scopeCount },
                { icon: "calendar", label: "Missions", value: missionCount },
                { icon: "trophy", label: "Contact", value: "Club" }
              ]}
              tags={person.tags}
            />
          );
        })}
      </div>
    </section>
  );
}

export function TrainingSlots({ slots }: { slots: Array<{ category: string; time: string; place: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {slots.map((slot) => (
        <article className="rounded-lg border border-[#07542f]/12 bg-white p-5 shadow-sm" key={slot.category}>
          <p className="text-xs font-black uppercase text-[#664d00]">Créneau indicatif</p>
          <h3 className="mt-2 text-2xl font-black uppercase text-[#002f1d]">{slot.category}</h3>
          <p className="mt-3 flex items-start gap-2 text-sm font-bold text-slate-700">
            <Clock className="mt-0.5 shrink-0 text-[#07542f]" size={17} aria-hidden="true" />
            {slot.time}
          </p>
          <p className="mt-2 flex items-start gap-2 text-sm font-bold text-slate-700">
            <MapPin className="mt-0.5 shrink-0 text-[#07542f]" size={17} aria-hidden="true" />
            {slot.place}
          </p>
        </article>
      ))}
    </div>
  );
}

export function InstallationCards({ installations }: { installations: Installation[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {installations.map((installation) => (
        <article className="premium-card overflow-hidden rounded-lg bg-white" key={installation.name}>
          <div className="relative h-64">
            <Image alt="" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 600px" src={installation.image} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001c10]/86 via-[#001c10]/14 to-transparent" aria-hidden="true" />
            <span className="absolute left-4 top-4 rounded-md bg-[#f7c600] px-3 py-1 text-xs font-black uppercase text-[#001c10]">{installation.type}</span>
            <h2 className="absolute bottom-4 left-4 right-4 text-3xl font-black uppercase text-white">{installation.name}</h2>
          </div>
          <div className="p-6">
            <p className="flex items-start gap-2 text-sm font-bold text-slate-700">
              <MapPin className="mt-0.5 shrink-0 text-[#07542f]" size={18} aria-hidden="true" />
              {installation.address}
            </p>
            <p className="mt-4 leading-7 text-slate-700">{installation.usage}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {installation.teams.map((team) => (
                <span className="rounded-md bg-[#07542f]/8 px-2.5 py-1 text-[11px] font-black uppercase text-[#07542f]" key={team}>
                  {team}
                </span>
              ))}
            </div>
            <a className="focus-ring mt-5 inline-flex items-center gap-2 rounded-md bg-[#002f1d] px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-[#07542f]" href={installation.mapsUrl} rel="noopener noreferrer" target="_blank">
              Ouvrir l'itinéraire
              <MapPin size={16} aria-hidden="true" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ConductGrid({ blocks }: { blocks: ConductBlock[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
      {blocks.map((block) => {
        const Icon = iconMap[block.icon as keyof typeof iconMap] ?? ShieldCheck;
        return (
          <article className="rounded-lg border border-[#07542f]/12 bg-white p-6 shadow-sm" key={block.title}>
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#07542f]/10 text-[#07542f]">
                <Icon size={27} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-black uppercase text-[#664d00]">{block.audience}</p>
                <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">{block.title}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">{block.intro}</p>
            <ul className="mt-5 space-y-3">
              {block.essentials.map((rule) => (
                <li className="flex gap-2 text-sm font-semibold leading-6 text-slate-700" key={rule}>
                  <CheckCircle2 className="mt-0.5 shrink-0 text-[#07542f]" size={17} aria-hidden="true" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            {block.rules.length ? (
              <details className="mt-5 rounded-md border border-[#07542f]/12 bg-[#07542f]/[0.03] p-4">
                <summary className="cursor-pointer text-sm font-black uppercase text-[#07542f]">Voir toutes les règles</summary>
                <ul className="mt-4 space-y-3">
                  {block.rules.map((rule) => (
                    <li className="flex gap-2 text-sm font-semibold leading-6 text-slate-700" key={rule}>
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#07542f]" size={17} aria-hidden="true" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

export function ConductRegulation({ items }: { items: RegulationItem[] }) {
  return (
    <div className="rounded-lg border border-[#07542f]/12 bg-white p-5 shadow-sm sm:p-6">
      <ol className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {items.map((item, index) => (
          <li className="flex gap-4 rounded-md bg-slate-50 p-4" key={item.title}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#f7c600] text-xs font-black text-[#001c10]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-sm font-black uppercase text-[#002f1d]">{item.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SchoolProjectTimeline({ items }: { items: Array<{ year: string; title: string; text: string }> }) {
  return (
    <ol className="grid gap-4 lg:grid-cols-5">
      {items.map((item) => (
        <li className="rounded-lg border border-[#07542f]/12 bg-white p-5 shadow-sm" key={item.year}>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#f7c600] text-sm font-black uppercase text-[#001c10]">{item.year}</span>
          <h2 className="mt-4 text-xl font-black uppercase text-[#002f1d]">{item.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{item.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function StageCards({ stages }: { stages: Stage[] }) {
  const styles = {
    Bientot: "bg-slate-100 text-slate-700",
    Complet: "bg-red-50 text-red-700",
    Ouvert: "bg-[#07542f]/10 text-[#07542f]"
  };

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
      {stages.map((stage) => (
        <article className="premium-card flex min-h-72 flex-col rounded-lg bg-white p-6" key={stage.title}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#664d00]">{stage.audience}</p>
              <h2 className="mt-2 text-2xl font-black uppercase text-[#002f1d]">{stage.title}</h2>
            </div>
            <span className={`rounded-md px-3 py-1 text-xs font-black uppercase ${styles[stage.status]}`}>{stage.status}</span>
          </div>
          <p className="mt-4 leading-7 text-slate-700">{stage.description}</p>
          <div className="mt-auto grid gap-3 pt-6 text-sm font-bold text-slate-700">
            <p className="flex items-center gap-2">
              <CalendarDays size={17} className="text-[#07542f]" aria-hidden="true" />
              {stage.dates}
            </p>
            <p className="flex items-center gap-2">
              <Users size={17} className="text-[#07542f]" aria-hidden="true" />
              {stage.places}
            </p>
          </div>
          <Link className="focus-ring mt-5 inline-flex items-center justify-center rounded-md bg-[#f7c600] px-4 py-3 text-sm font-black uppercase text-[#001c10] transition hover:bg-[#002f1d] hover:text-white" href="/contact">
            Demander des informations
          </Link>
        </article>
      ))}
    </div>
  );
}

function OrganizationNodeButton({ compact = false, node, onSelect, selected }: { compact?: boolean; node: OrgNode; onSelect: (title: string) => void; selected: boolean }) {
  return (
    <button
      className={`focus-ring rounded-lg border text-left transition ${
        selected ? "border-[#f7c600] bg-[#002f1d] text-white shadow-lg" : "border-[#07542f]/12 bg-white text-[#002f1d] shadow-sm hover:border-[#f7c600] hover:shadow-md"
      } ${compact ? "p-4" : "p-5"}`}
      onClick={() => onSelect(node.title)}
      type="button"
    >
      <span className={`block font-black uppercase ${selected ? "text-[#f7c600]" : "text-[#664d00]"} ${compact ? "text-[11px]" : "text-xs"}`}>
        {node.lead}
      </span>
      <span className={`mt-2 block font-black uppercase leading-tight ${compact ? "text-lg" : "text-2xl"}`}>{node.title}</span>
      {node.children?.length ? (
        <span className={`mt-3 block text-xs font-bold leading-5 ${selected ? "text-white/70" : "text-slate-600"}`}>
          {node.children.length} rattachement{node.children.length > 1 ? "s" : ""}
        </span>
      ) : null}
    </button>
  );
}

export function OrganizationMap({ nodes }: { nodes: OrgNode[] }) {
  const [selected, setSelected] = useState(nodes[0]?.title ?? "");
  const current = nodes.find((node) => node.title === selected) ?? nodes[0];
  const president = nodes.find((node) => node.title === "President") ?? nodes[0];
  const governance = nodes.filter((node) => ["Bureau"].includes(node.title));
  const sport = nodes.filter((node) => ["Direction sportive", "Ecole de foot", "Football a 11"].includes(node.title));
  const support = nodes.filter((node) => ["Communication", "Logistique", "Evenementiel", "Partenariats"].includes(node.title));
  const groups = [
    { title: "Gouvernance", text: "Pilotage associatif, administration et décisions du club.", nodes: governance },
    { title: "Sportif", text: "Projet terrain, catégories, éducateurs et progression des joueurs.", nodes: sport },
    { title: "Support club", text: "Communication, matériel, événements et relations partenaires.", nodes: support }
  ].filter((group) => group.nodes.length > 0);

  return (
    <div className="space-y-5">
      {president ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-stretch">
          <OrganizationNodeButton node={president} onSelect={setSelected} selected={selected === president.title} />
          <div className="rounded-lg border border-[#07542f]/12 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase text-[#664d00]">Niveau 1</p>
            <h3 className="mt-2 text-2xl font-black uppercase text-[#002f1d]">Présidence du club</h3>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-700">{president.mission}</p>
            {president.children?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {president.children.map((child) => (
                  <span className="rounded-md bg-[#07542f]/8 px-3 py-1.5 text-[11px] font-black uppercase text-[#07542f]" key={child}>
                    {child}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        {groups.map((group) => (
          <section className="rounded-lg border border-[#07542f]/12 bg-white p-5 shadow-sm" key={group.title}>
            <p className="text-xs font-black uppercase text-[#664d00]">Pôle</p>
            <h3 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">{group.title}</h3>
            <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-slate-600">{group.text}</p>
            <div className="mt-5 grid gap-3">
              {group.nodes.map((node) => (
                <OrganizationNodeButton compact key={node.title} node={node} onSelect={setSelected} selected={selected === node.title} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {current ? (
        <article className="rounded-lg bg-[#002f1d] p-6 text-white shadow-xl lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-[#f7c600]">Fiche du pôle sélectionné</p>
              <h2 className="mt-2 text-3xl font-black uppercase sm:text-4xl">{current.title}</h2>
              <p className="mt-2 text-lg font-bold text-white/78">{current.lead}</p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-black uppercase text-white/80">
              {current.children?.length ? `${current.children.length} rattachements` : "Pôle opérationnel"}
            </span>
          </div>
          <p className="mt-5 max-w-4xl leading-8 text-white/80">{current.mission}</p>
          {current.children?.length ? (
            <div className="mt-6">
              <p className="text-xs font-black uppercase text-[#f7c600]">Rattachements</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {current.children.map((child) => (
                  <span className="rounded-md border border-white/15 bg-white/8 px-3 py-2 text-xs font-black uppercase text-white" key={child}>
                    {child}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}

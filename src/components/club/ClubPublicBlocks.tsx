"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ClipboardCheck, Clock, GraduationCap, MapPin, Megaphone, Search, ShieldCheck, Trophy, Users } from "lucide-react";
import { useMemo, useState } from "react";

import type { ConductBlock, Installation, OrgNode, StaffPerson, Stage } from "@/lib/club-pages-data";

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

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((person) => (
          <article className="premium-card overflow-hidden rounded-lg bg-white" key={`${person.name}-${person.role}`}>
            <div className="relative h-56">
              <Image alt="" className="object-cover" fill sizes="(max-width: 768px) 100vw, 320px" src={person.photo} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001c10]/82 via-transparent to-transparent" aria-hidden="true" />
              <span className="absolute left-4 top-4 rounded-md bg-[#f7c600] px-3 py-1 text-[11px] font-black uppercase text-[#001c10]">{person.category}</span>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-black uppercase leading-tight text-white">{person.name}</h2>
                <p className="mt-1 text-sm font-black uppercase text-[#f7c600]">{person.role}</p>
              </div>
            </div>
            <div className="p-5">
              <div className="grid gap-3 text-sm font-semibold text-slate-700">
                <p>
                  <span className="font-black uppercase text-[#07542f]">Pôle : </span>
                  {person.pole}
                </p>
                <p>
                  <span className="font-black uppercase text-[#07542f]">Contact : </span>
                  {person.contact}
                </p>
              </div>
              {person.tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {person.tags.map((tag) => (
                    <span className="rounded-md bg-[#07542f]/8 px-2.5 py-1 text-[11px] font-black uppercase text-[#07542f]" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TrainingSlots({ slots }: { slots: Array<{ category: string; time: string; place: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {slots.map((slot) => (
        <article className="rounded-lg border border-[#07542f]/12 bg-white p-5 shadow-sm" key={slot.category}>
          <p className="text-xs font-black uppercase text-[#8a6d00]">Créneau indicatif</p>
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
    <div className="grid gap-5 md:grid-cols-2">
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
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {blocks.map((block) => {
        const Icon = iconMap[block.icon as keyof typeof iconMap] ?? ShieldCheck;
        return (
          <article className="rounded-lg border border-[#07542f]/12 bg-white p-6 shadow-sm" key={block.title}>
            <Icon className="text-[#07542f]" size={34} aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-black uppercase text-[#002f1d]">{block.title}</h2>
            <ul className="mt-4 space-y-3">
              {block.rules.map((rule) => (
                <li className="flex gap-2 text-sm font-semibold leading-6 text-slate-700" key={rule}>
                  <CheckCircle2 className="mt-0.5 shrink-0 text-[#07542f]" size={17} aria-hidden="true" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
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
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {stages.map((stage) => (
        <article className="premium-card flex min-h-72 flex-col rounded-lg bg-white p-6" key={stage.title}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#8a6d00]">{stage.audience}</p>
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

export function OrganizationMap({ nodes }: { nodes: OrgNode[] }) {
  const [selected, setSelected] = useState(nodes[0]?.title ?? "");
  const current = nodes.find((node) => node.title === selected) ?? nodes[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div className="grid gap-2">
        {nodes.map((node) => (
          <button
            className={`focus-ring rounded-lg border px-4 py-4 text-left transition ${
              selected === node.title ? "border-[#f7c600] bg-[#002f1d] text-white shadow-lg" : "border-[#07542f]/12 bg-white text-[#002f1d] hover:border-[#f7c600]"
            }`}
            key={node.title}
            onClick={() => setSelected(node.title)}
            type="button"
          >
            <span className="block text-xs font-black uppercase text-[#8a6d00]">{node.lead}</span>
            <span className="mt-1 block text-lg font-black uppercase">{node.title}</span>
          </button>
        ))}
      </div>
      {current ? (
        <article className="rounded-lg bg-[#002f1d] p-6 text-white shadow-xl">
          <p className="text-sm font-black uppercase text-[#f7c600]">Vue interactive</p>
          <h2 className="mt-2 text-4xl font-black uppercase">{current.title}</h2>
          <p className="mt-2 text-lg font-bold text-white/78">{current.lead}</p>
          <p className="mt-5 max-w-3xl leading-8 text-white/80">{current.mission}</p>
          {current.children?.length ? (
            <div className="mt-8">
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

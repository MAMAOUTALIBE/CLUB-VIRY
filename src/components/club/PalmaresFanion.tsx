"use client";

import { useState } from "react";
import { ChevronDown, Trophy, TrendingDown } from "lucide-react";
import {
  palmaresFanion,
  palmaresNote,
  palmaresCredit,
  palmaresHighlights,
  type SaisonPalmares
} from "@/lib/club-pages-data";

const num = (v: number | null) => (v === null ? "—" : String(v));
const place = (v: number | null) => (v === null ? "—" : v === 1 ? "1er" : `${v}e`);
const diff = (v: number | null) => (v === null ? "—" : v > 0 ? `+${v}` : String(v));

function rowTone(s: SaisonPalmares) {
  if (s.highlight === "champion") return "bg-[#f7c600]/15";
  if (s.highlight === "relegation") return "bg-red-50";
  return "";
}

// Colonnes du detail (masquees sur la carte mobile repliee, visibles au tap).
const DETAILS: { key: keyof SaisonPalmares; label: string }[] = [
  { key: "joue", label: "Joués" },
  { key: "gagne", label: "Gagnés" },
  { key: "nul", label: "Nuls" },
  { key: "perdu", label: "Perdus" },
  { key: "bp", label: "Buts pour" },
  { key: "bc", label: "Buts contre" },
  { key: "diff", label: "Différence" }
];

export function PalmaresFanion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-10">
      {/* Resume : les chiffres-cles d'abord */}
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {palmaresHighlights.map((item) => (
          <div key={item.label} className="premium-card rounded-2xl p-4 sm:p-5">
            <dt className="text-xs font-black uppercase tracking-wide text-[#664d00]">{item.label}</dt>
            <dd className="mt-1 text-lg font-black leading-tight text-[#002f1d] sm:text-xl">{item.value}</dd>
          </div>
        ))}
      </dl>

      {/* Legende */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Trophy size={15} className="text-[#b8860b]" aria-hidden="true" /> Titre de champion
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TrendingDown size={15} className="text-red-600" aria-hidden="true" /> Relégation (Division 2, 1983)
        </span>
      </div>

      {/* --- MOBILE : cartes depliables dans une zone a defilement interne --- */}
      <ul className="mt-6 max-h-[26rem] space-y-2 overflow-y-auto pr-1 md:hidden">
        {palmaresFanion.map((s) => {
          const isOpen = open === s.annee;
          return (
            <li key={s.annee} className={`overflow-hidden rounded-xl border border-slate-200 ${rowTone(s)}`}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : s.annee)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
              >
                <span className="inline-flex min-w-[3rem] shrink-0 items-center justify-center rounded-lg bg-[#002f1d] px-2 py-1 text-sm font-black text-[#f7c600]">
                  {s.annee}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 truncate text-sm font-bold text-[#002f1d]">
                    {s.highlight === "champion" ? <Trophy size={14} className="shrink-0 text-[#b8860b]" aria-hidden="true" /> : null}
                    {s.division}
                  </span>
                  <span className="text-xs text-slate-500">
                    {place(s.place)} · {num(s.points)} pts
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-200/70 px-3 py-3 text-sm">
                  {DETAILS.map(({ key, label }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="font-semibold text-[#002f1d]">
                        {key === "diff" ? diff(s.diff) : num(s[key] as number | null)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </li>
          );
        })}
      </ul>

      {/* --- TABLETTE / DESKTOP : tableau complet --- */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
        <div className="max-h-[40rem] overflow-auto 3xl:max-h-[48rem]">
          <table className="w-full min-w-[58rem] border-collapse text-sm 3xl:text-base">
            <thead className="sticky top-0 z-10 bg-[#002f1d] text-[#f7c600]">
              <tr className="text-left">
                <th scope="col" className="px-3 py-2.5 font-black uppercase">Année</th>
                <th scope="col" className="px-3 py-2.5 font-black uppercase">Division</th>
                <th scope="col" className="px-3 py-2.5 text-center font-black uppercase">Place</th>
                <th scope="col" className="px-3 py-2.5 text-center font-black uppercase">Pts</th>
                <th scope="col" className="px-3 py-2.5 text-center font-black uppercase">J</th>
                <th scope="col" className="px-3 py-2.5 text-center font-black uppercase">G</th>
                <th scope="col" className="px-3 py-2.5 text-center font-black uppercase">N</th>
                <th scope="col" className="px-3 py-2.5 text-center font-black uppercase">P</th>
                <th scope="col" className="px-3 py-2.5 text-center font-black uppercase">BP</th>
                <th scope="col" className="px-3 py-2.5 text-center font-black uppercase">BC</th>
                <th scope="col" className="px-3 py-2.5 text-center font-black uppercase">Diff.</th>
              </tr>
            </thead>
            <tbody>
              {palmaresFanion.map((s) => (
                <tr key={s.annee} className={`border-t border-slate-100 ${rowTone(s)}`}>
                  <th scope="row" className="px-3 py-2 font-black text-[#002f1d]">{s.annee}</th>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                      {s.highlight === "champion" ? <Trophy size={14} className="text-[#b8860b]" aria-hidden="true" /> : null}
                      {s.division}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-semibold text-[#002f1d]">{place(s.place)}</td>
                  <td className="px-3 py-2 text-center font-semibold">{num(s.points)}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{num(s.joue)}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{num(s.gagne)}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{num(s.nul)}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{num(s.perdu)}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{num(s.bp)}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{num(s.bc)}</td>
                  <td className="px-3 py-2 text-center font-semibold text-slate-700">{diff(s.diff)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note historique + credit */}
      <p className="mt-6 text-sm leading-6 text-slate-600">{palmaresNote}</p>
      <p className="mt-2 text-xs italic text-slate-400">{palmaresCredit}</p>
    </div>
  );
}

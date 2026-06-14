"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAccessControl } from "@/components/admin/AdminAccessControl";

type ResourceKind = "families" | "players" | "registrations";

type ExplorerProps = {
  kind: ResourceKind;
  endpoint: string;
  title: string;
  description: string;
};

type FamilyRecord = {
  id: string;
  name: string;
  primary_contact_id: string | null;
  created_at: string;
};

type FamilyMemberRecord = {
  family_id: string;
  profile_id: string;
};

type PlayerRecord = {
  id: string;
  family_id: string | null;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  license_number: string | null;
  created_at: string;
};

type RegistrationRecord = {
  id: string;
  family_id: string;
  player_id: string;
  season_id: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
};

type CardRecord = {
  id: string;
  href: string;
  title: string;
  status: string;
  meta: string;
  detail: string;
  stats: string[];
};

type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function isFamily(value: unknown): value is FamilyRecord {
  if (!isObject(value)) {
    return false;
  }

  return typeof value.id === "string" && typeof value.name === "string" && typeof value.created_at === "string";
}

function isFamilyMember(value: unknown): value is FamilyMemberRecord {
  if (!isObject(value)) {
    return false;
  }

  return typeof value.family_id === "string" && typeof value.profile_id === "string";
}

function isPlayer(value: unknown): value is PlayerRecord {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    (typeof value.family_id === "string" || value.family_id === null) &&
    typeof value.first_name === "string" &&
    typeof value.last_name === "string" &&
    typeof value.birth_date === "string" &&
    typeof value.gender === "string" &&
    typeof value.created_at === "string"
  );
}

function isRegistration(value: unknown): value is RegistrationRecord {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.family_id === "string" &&
    typeof value.player_id === "string" &&
    typeof value.season_id === "string" &&
    typeof value.status === "string" &&
    (typeof value.submitted_at === "string" || value.submitted_at === null) &&
    typeof value.created_at === "string"
  );
}

function parseFailure(value: unknown): ApiFailure | null {
  if (!isObject(value) || value.ok !== false || !isObject(value.error)) {
    return null;
  }

  return {
    ok: false,
    error: {
      code: typeof value.error.code === "string" ? value.error.code : "API_ERROR",
      message: typeof value.error.message === "string" ? value.error.message : "Erreur API."
    }
  };
}

function formatDate(value: string | null) {
  if (!value) {
    return "Non renseigné";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Non renseigné";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function buildCards(kind: ResourceKind, payload: unknown): CardRecord[] {
  if (!isObject(payload) || payload.ok !== true || !isObject(payload.data)) {
    throw new Error("Structure API invalide.");
  }

  if (kind === "families") {
    const families = Array.isArray(payload.data.families) ? payload.data.families.filter(isFamily) : [];
    const members = Array.isArray(payload.data.members) ? payload.data.members.filter(isFamilyMember) : [];
    const players = Array.isArray(payload.data.players) ? payload.data.players.filter(isPlayer) : [];

    return families.map((family) => {
      const familyMembers = members.filter((member) => member.family_id === family.id);
      const familyPlayers = players.filter((player) => player.family_id === family.id);

      return {
        id: family.id,
        href: `/admin/familles/${family.id}`,
        title: family.name,
        status: "Famille",
        meta: `Créée le ${formatDate(family.created_at)}`,
        detail: family.primary_contact_id ? `Contact principal : ${family.primary_contact_id.slice(0, 8)}` : "Contact principal non renseigné",
        stats: [`${familyPlayers.length} joueur(s)`, `${familyMembers.length} membre(s)`, "Documents", "Paiements"]
      };
    });
  }

  if (kind === "players") {
    const players = Array.isArray(payload.data.players) ? payload.data.players.filter(isPlayer) : [];

    return players.map((player) => ({
      id: player.id,
      href: `/admin/joueurs/${player.id}`,
      title: `${player.first_name} ${player.last_name}`,
      status: player.license_number ? `Licence ${player.license_number}` : "Sans licence",
      meta: `Naissance : ${formatDate(player.birth_date)} · ${player.gender}`,
      detail: player.family_id ? `Famille : ${player.family_id.slice(0, 8)}` : "Aucune famille rattachee",
      stats: ["Équipe", "Documents", "Paiements", "Présences"]
    }));
  }

  const registrations = Array.isArray(payload.data.registrations) ? payload.data.registrations.filter(isRegistration) : [];

  return registrations.map((registration) => ({
    id: registration.id,
    href: `/admin/inscriptions/${registration.id}`,
    title: `Dossier ${registration.id.slice(0, 8)}`,
    status: registration.status,
    meta: `Soumis : ${formatDate(registration.submitted_at ?? registration.created_at)}`,
    detail: `Joueur ${registration.player_id.slice(0, 8)} · Famille ${registration.family_id.slice(0, 8)}`,
    stats: ["Documents", "Paiement", "Validation", "Équipe"]
  }));
}

export function Admin360Explorer({ kind, endpoint, title, description }: ExplorerProps) {
  const [records, setRecords] = useState<CardRecord[]>([]);
  const [status, setStatus] = useState<"demo" | "loading" | "loaded" | "error">("demo");
  const [message, setMessage] = useState("Connectez-vous pour charger les données réelles.");
  const [query, setQuery] = useState("");

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return records;
    }

    return records.filter((record) => `${record.title} ${record.status} ${record.meta} ${record.detail}`.toLowerCase().includes(normalizedQuery));
  }, [query, records]);

  const loadRecords = useCallback(async () => {
    setStatus("loading");
    setMessage("Chargement via la session admin...");

    try {
      // Auth par cookie HttpOnly `admin_session` (envoyé automatiquement, même origine).
      const response = await fetch(endpoint, { credentials: "same-origin" });
      const payload: unknown = await response.json();
      const failure = parseFailure(payload);

      if (failure) {
        setRecords([]);
        setStatus("error");
        setMessage(`${failure.error.code} : ${failure.error.message}`);
        return;
      }

      const nextRecords = buildCards(kind, payload);
      setRecords(nextRecords);
      setStatus("loaded");
      setMessage(`${nextRecords.length} fiche(s) chargée(s).`);
    } catch (error) {
      setRecords([]);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Erreur de chargement CRM.");
    }
  }, [endpoint, kind]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadRecords(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadRecords]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-start">
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">Fiches 360</p>
          <h2 className="mt-1 text-3xl font-black uppercase text-[#002f1d]">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <AdminAccessControl loading={status === "loading"} onAuthenticated={() => void loadRecords()} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-[#fbfcf8] p-3">
          <ShieldCheck className="mt-0.5 text-[#07542f]" size={18} aria-hidden="true" />
          <p className="text-sm font-bold leading-6 text-slate-700">{message}</p>
        </div>
        <label className="block">
          <span className="sr-only">Recherche dans les fiches</span>
          <input
            className="focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 md:w-80"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrer les fiches..."
            type="search"
            value={query}
          />
        </label>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredRecords.map((record) => (
          <Link className="focus-ring rounded-lg border border-slate-200 bg-[#fbfcf8] p-5 hover:border-[#f7c600]" href={record.href} key={record.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-[#fff8d6] px-2 py-1 text-xs font-black uppercase text-[#735f00] ring-1 ring-[#f7c600]/30">{record.status}</span>
                <h3 className="mt-3 text-xl font-black uppercase text-[#002f1d]">{record.title}</h3>
              </div>
              <span className="text-xs font-black uppercase text-slate-400">{record.id.slice(0, 8)}</span>
            </div>
            <p className="mt-3 text-sm font-bold text-slate-700">{record.meta}</p>
            <p className="mt-1 text-sm text-slate-600">{record.detail}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {record.stats.map((stat) => (
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase text-slate-600" key={`${record.id}-${stat}`}>
                  {stat}
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {status !== "loading" && filteredRecords.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-8 text-center">
          <p className="text-sm font-black uppercase text-[#002f1d]">Aucune fiche a afficher</p>
          <p className="mt-2 text-sm text-slate-600">Chargez les données backend ou ajustez le filtre de recherche.</p>
        </div>
      ) : null}
    </section>
  );
}

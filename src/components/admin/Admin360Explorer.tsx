"use client";

import { Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminSessionRedirect } from "@/components/admin/AdminSessionRedirect";
import { showToast } from "@/components/admin/Toast";

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

type CreateField = {
  name: string;
  label: string;
  type: "text" | "date" | "select";
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  fullWidth?: boolean;
};

type CreateConfig = { label: string; endpoint: string; fields: CreateField[]; needsFamilies?: boolean };

/**
 * Création depuis la vue 360. Seuls les adhérents sont concernés : un dossier
 * d'inscription naît du formulaire public, jamais d'une saisie administrative — il
 * peut en revanche être archivé (doublon, dossier ouvert par erreur).
 */
const CREATE_CONFIG: Partial<Record<ResourceKind, CreateConfig>> = {
  players: {
    label: "Nouveau joueur",
    endpoint: "/api/admin/players",
    needsFamilies: true,
    fields: [
      { name: "firstName", label: "Prénom", type: "text", required: true },
      { name: "lastName", label: "Nom", type: "text", required: true },
      { name: "birthDate", label: "Date de naissance", type: "date", required: true },
      {
        name: "gender",
        label: "Genre",
        type: "select",
        options: [
          { value: "NON_RENSEIGNE", label: "Non renseigné" },
          { value: "MASCULIN", label: "Masculin" },
          { value: "FEMININ", label: "Féminin" }
        ]
      },
      { name: "familyId", label: "Famille (facultatif)", type: "select", fullWidth: true },
      { name: "licenseNumber", label: "Numéro de licence (facultatif)", type: "text", fullWidth: true }
    ]
  },
  families: {
    label: "Nouvelle famille",
    endpoint: "/api/admin/families",
    fields: [{ name: "name", label: "Nom de la famille", type: "text", required: true, fullWidth: true }]
  }
};

const ARCHIVE_ENDPOINTS: Partial<Record<ResourceKind, string>> = {
  players: "/api/admin/players",
  families: "/api/admin/families",
  registrations: "/api/admin/registrations"
};

const PAGE_SIZE = 100;

/** Force le paramètre `limit` d'un endpoint (en préservant les autres query params). */
function withLimit(endpoint: string, limit: number): string {
  const [path, queryString = ""] = endpoint.split("?");
  const params = new URLSearchParams(queryString);
  params.set("limit", String(limit));
  return `${path}?${params.toString()}`;
}

export function Admin360Explorer({ kind, endpoint, title, description }: ExplorerProps) {
  const [records, setRecords] = useState<CardRecord[]>([]);
  const [status, setStatus] = useState<"demo" | "loading" | "loaded" | "auth" | "error">("demo");
  const [message, setMessage] = useState("Connectez-vous pour charger les données réelles.");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [familyOptions, setFamilyOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const createConfig = CREATE_CONFIG[kind];
  const archiveEndpoint = ARCHIVE_ENDPOINTS[kind];

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
      const response = await fetch(withLimit(endpoint, limit), { credentials: "same-origin" });
      const payload: unknown = await response.json();

      if (response.status === 401) {
        setRecords([]);
        setStatus("auth");
        setHasMore(false);
        return;
      }

      const failure = parseFailure(payload);

      if (failure) {
        setRecords([]);
        setStatus("error");
        setHasMore(false);
        setMessage(`${failure.error.code} : ${failure.error.message}`);
        return;
      }

      const nextRecords = buildCards(kind, payload);
      setRecords(nextRecords);
      setStatus("loaded");
      // Heuristique : si on reçoit exactement la limite, il y a probablement plus à charger.
      setHasMore(nextRecords.length >= limit);
      setMessage(`${nextRecords.length} fiche(s) chargée(s).`);
    } catch (error) {
      setRecords([]);
      setStatus("error");
      setHasMore(false);
      setMessage(error instanceof Error ? error.message : "Erreur de chargement CRM.");
    }
  }, [endpoint, kind, limit]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadRecords(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadRecords]);

  /** Ouvre le formulaire et charge à la demande la liste des familles rattachables. */
  async function openCreateForm() {
    if (!createConfig) return;
    const blank: Record<string, string> = {};
    for (const field of createConfig.fields) {
      blank[field.name] = field.type === "select" && field.options?.[0] ? field.options[0].value : "";
    }
    setForm(blank);
    setFormError("");
    setCreating(true);

    if (createConfig.needsFamilies && familyOptions.length === 0) {
      try {
        const response = await fetch("/api/admin/families?limit=500", { credentials: "same-origin" });
        const payload: unknown = await response.json();
        if (isObject(payload) && payload.ok === true && isObject(payload.data)) {
          const families = Array.isArray(payload.data.families) ? payload.data.families.filter(isFamily) : [];
          setFamilyOptions(families.map((family) => ({ value: family.id, label: family.name })));
        }
      } catch {
        // Sans la liste, la famille reste simplement non renseignée : on ne bloque pas la création.
      }
    }
  }

  async function submitCreate() {
    if (!createConfig) return;
    const missing = createConfig.fields.find((field) => field.required && !form[field.name]?.trim());
    if (missing) {
      setFormError(`${missing.label} est obligatoire.`);
      return;
    }

    // Les champs laissés vides ne sont pas envoyés : le validateur les traite en « non renseigné ».
    const body: Record<string, string> = {};
    for (const field of createConfig.fields) {
      const value = form[field.name]?.trim();
      if (value) body[field.name] = value;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch(createConfig.endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        setFormError(payload?.error?.message ?? `Création impossible (HTTP ${response.status}).`);
        return;
      }
      setCreating(false);
      showToast("Fiche créée.");
      await loadRecords();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  }

  async function archiveRecord(record: CardRecord) {
    if (!archiveEndpoint || !window.confirm(`Archiver « ${record.title} » ? La fiche part à la corbeille et reste restaurable.`)) {
      return;
    }
    setArchivingId(record.id);
    try {
      const response = await fetch(`${archiveEndpoint}/${record.id}`, { method: "DELETE", credentials: "same-origin" });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        showToast(payload?.error?.message ?? `Archivage impossible (HTTP ${response.status}).`, "error");
        return;
      }
      setRecords((current) => current.filter((item) => item.id !== record.id));
      showToast("Fiche archivée : restaurable depuis la corbeille.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erreur réseau.", "error");
    } finally {
      setArchivingId(null);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">Fiches 360</p>
          <h2 className="mt-1 text-3xl font-black uppercase text-[#002f1d]">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>

      {status === "auth" ? <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4"><AdminSessionRedirect /></div> : null}

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-[#fbfcf8] p-3">
          <ShieldCheck className="mt-0.5 text-[#07542f]" size={18} aria-hidden="true" />
          <p className="text-sm font-bold leading-6 text-slate-700">{message}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          {createConfig ? (
            <button
              type="button"
              onClick={() => void openCreateForm()}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-4 text-sm font-black uppercase text-white hover:bg-[#07542f]"
            >
              <Plus size={16} aria-hidden="true" /> {createConfig.label}
            </button>
          ) : null}
        </div>
      </div>

      {createConfig && creating ? (
        <div className="mt-4 rounded-lg border border-[#002f1d]/20 bg-white p-4">
          <h3 className="text-sm font-black uppercase text-[#002f1d]">{createConfig.label}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {createConfig.fields.map((field) => {
              const options = field.name === "familyId" ? [{ value: "", label: "Aucune famille" }, ...familyOptions] : field.options ?? [];
              return (
                <label className={`block ${field.fullWidth ? "sm:col-span-2" : ""}`} key={field.name}>
                  <span className="text-xs font-black uppercase text-slate-500">
                    {field.label}
                    {field.required ? " *" : ""}
                  </span>
                  {field.type === "select" ? (
                    <select
                      className="focus-ring mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900"
                      value={form[field.name] ?? ""}
                      onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                    >
                      {options.map((option) => (
                        <option key={option.value || "none"} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="focus-ring mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900"
                      type={field.type === "date" ? "date" : "text"}
                      value={form[field.name] ?? ""}
                      onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                    />
                  )}
                </label>
              );
            })}
          </div>
          {formError ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{formError}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void submitCreate()}
              disabled={submitting}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-5 text-sm font-black uppercase text-white hover:bg-[#07542f] disabled:opacity-70"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : null} Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="focus-ring inline-flex min-h-11 items-center rounded-md border border-slate-300 px-5 text-sm font-black uppercase text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredRecords.map((record) => (
          <div className="rounded-lg border border-slate-200 bg-[#fbfcf8] p-5" key={record.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-[#fff8d6] px-2 py-1 text-xs font-black uppercase text-[#735f00] ring-1 ring-[#f7c600]/30">{record.status}</span>
                <Link className="focus-ring mt-3 block hover:underline" href={record.href}>
                  <h3 className="text-xl font-black uppercase text-[#002f1d]">{record.title}</h3>
                </Link>
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
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                className="focus-ring inline-flex min-h-10 items-center rounded-md border border-[#002f1d]/20 px-4 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600]"
                href={record.href}
              >
                Ouvrir la fiche
              </Link>
              {archiveEndpoint ? (
                <button
                  type="button"
                  onClick={() => void archiveRecord(record)}
                  disabled={archivingId === record.id}
                  className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-md border border-slate-300 px-4 text-xs font-black uppercase text-slate-600 hover:border-red-300 hover:text-red-700 disabled:opacity-60"
                >
                  {archivingId === record.id ? <Loader2 className="animate-spin" size={14} aria-hidden="true" /> : <Trash2 size={14} aria-hidden="true" />} Archiver
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {status !== "loading" && filteredRecords.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-8 text-center">
          <p className="text-sm font-black uppercase text-[#002f1d]">Aucune fiche a afficher</p>
          <p className="mt-2 text-sm text-slate-600">Chargez les données backend ou ajustez le filtre de recherche.</p>
        </div>
      ) : null}

      {status === "loaded" && hasMore ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-xs font-bold text-slate-500">{records.length} chargées</span>
          <button
            type="button"
            onClick={() => setLimit((value) => value + PAGE_SIZE)}
            className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-[#002f1d]/20 px-4 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600]"
          >
            Charger plus
          </button>
        </div>
      ) : null}
    </section>
  );
}

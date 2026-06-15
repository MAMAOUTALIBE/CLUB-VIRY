"use client";

import { Download, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminAccessControl } from "@/components/admin/AdminAccessControl";
import { showToast } from "@/components/admin/Toast";
import { ProgressBar } from "@/components/admin/charts/ProgressBar";
import { StatusBarChart } from "@/components/admin/charts/StatusBarChart";

type Row = Record<string, unknown>;

export type ModuleStatus = { status: string; label: string };
export type ModuleColumn = { label: string; field: string; format?: "text" | "euro" | "date" };
export type ModuleKpi = {
  label: string;
  numeratorStatuses: string[];
  amountField?: string;
  tone?: "green" | "yellow";
};

// Props 100% sérialisables → la page peut rester un server component (avec metadata).
type AdminModuleBoardProps = {
  title: string;
  description: string;
  endpoint: string;
  dataKey: string;
  statuses: ModuleStatus[];
  columns: ModuleColumn[];
  titleFields: string[];
  statusField?: string;
  createdAtField?: string;
  demo: Row[];
  kpis?: ModuleKpi[];
  /** Si défini, affiche un bouton « Exporter CSV » pointant vers cet endpoint d'export. */
  exportHref?: string;
};

function euro(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

/** Force le paramètre `limit` d'un endpoint (en préservant les autres query params). */
function withLimit(endpoint: string, limit: number): string {
  const [path, query = ""] = endpoint.split("?");
  const params = new URLSearchParams(query);
  params.set("limit", String(limit));
  return `${path}?${params.toString()}`;
}

const PAGE_SIZE = 100;

function formatDate(value: unknown): string {
  if (typeof value !== "string") {
    return "—";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function asText(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }
  return String(value);
}

function cellValue(row: Row, column: ModuleColumn): string {
  const raw = row[column.field];
  if (column.format === "euro") {
    return euro(typeof raw === "number" ? raw : Number(raw) || 0);
  }
  if (column.format === "date") {
    return formatDate(raw);
  }
  return asText(raw);
}

function statusBadgeClass(status: string): string {
  const positive = ["VALIDATED", "PAID", "SUCCEEDED", "ACCEPTED", "DELIVERED"];
  const progress = ["SUBMITTED", "IN_REVIEW", "PENDING", "PREPARING", "READY", "CONTACTED", "TRIAL_SCHEDULED"];
  const negative = ["REJECTED", "FAILED", "CANCELLED"];

  if (positive.includes(status)) {
    return "bg-emerald-50 text-emerald-800 ring-emerald-100";
  }
  if (status === "MISSING_DOCUMENTS") {
    return "bg-orange-50 text-orange-700 ring-orange-100";
  }
  if (progress.includes(status)) {
    return "bg-[#fff8d6] text-[#735f00] ring-[#f7c600]/30";
  }
  if (negative.includes(status)) {
    return "bg-red-50 text-red-700 ring-red-100";
  }
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function extractRows(json: unknown, dataKey: string): { ok: true; rows: Row[] } | { ok: false; message: string } {
  if (!json || typeof json !== "object") {
    return { ok: false, message: "Réponse API invalide." };
  }
  const response = json as Record<string, unknown>;
  if (response.ok === false) {
    const error = response.error as Record<string, unknown> | undefined;
    const code = error && typeof error.code === "string" ? error.code : "API_ERROR";
    const message = error && typeof error.message === "string" ? error.message : "Erreur API.";
    return { ok: false, message: `${code} : ${message}` };
  }
  const data = response.data as Record<string, unknown> | undefined;
  const list = data ? data[dataKey] : undefined;
  if (!Array.isArray(list)) {
    return { ok: false, message: "Structure de réponse inattendue." };
  }
  return { ok: true, rows: list.filter((item): item is Row => Boolean(item) && typeof item === "object") };
}

export function AdminModuleBoard(props: AdminModuleBoardProps) {
  const { title, description, endpoint, dataKey, statuses, columns, titleFields, kpis, exportHref } = props;
  const statusField = props.statusField ?? "status";
  const createdAtField = props.createdAtField ?? "created_at";

  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<"loading" | "connected" | "error">("loading");
  const [message, setMessage] = useState("Chargement via la session admin...");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);

  const rowStatus = (row: Row) => asText(row[statusField]);
  const rowTitle = (row: Row) => {
    const value = titleFields.map((fieldName) => asText(row[fieldName])).filter((part) => part !== "—").join(" ").trim();
    return value || "—";
  };

  async function load(targetLimit = limit) {
    setState("loading");
    setMessage("Chargement via la session admin...");

    try {
      // Auth par cookie HttpOnly `admin_session` (envoyé automatiquement, même origine).
      const response = await fetch(withLimit(endpoint, targetLimit), { credentials: "same-origin" });
      const parsed = extractRows(await response.json(), dataKey);

      if (!parsed.ok) {
        setRows([]);
        setState("error");
        setHasMore(false);
        setMessage(parsed.message);
        return;
      }

      setRows(parsed.rows);
      setState("connected");
      // Heuristique : si on reçoit exactement la limite demandée, il y a probablement plus à charger.
      setHasMore(parsed.rows.length >= targetLimit);
      setMessage(`${parsed.rows.length} enregistrement(s) chargé(s) depuis le backend.`);
    } catch (error) {
      setRows([]);
      setState("error");
      setHasMore(false);
      setMessage(error instanceof Error ? error.message : "Erreur de chargement.");
    }
  }

  function loadMore() {
    const next = limit + PAGE_SIZE;
    setLimit(next);
    void load(next);
  }

  // Met à jour le statut d'un enregistrement (PATCH endpoint/[id]) et reflète le changement localement.
  async function patchStatus(row: Row, newStatus: string) {
    const id = typeof row.id === "string" ? row.id : null;
    if (!id || newStatus === rowStatus(row)) {
      return;
    }
    const base = endpoint.split("?")[0];
    setSavingId(id);
    try {
      const response = await fetch(`${base}/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [statusField]: newStatus })
      });
      const json = await response.json().catch(() => null);
      if (response.ok && json?.ok) {
        setRows((current) => current.map((item) => (item.id === id ? { ...item, [statusField]: newStatus } : item)));
        setMessage("Statut mis à jour.");
        showToast("Statut mis à jour.");
      } else {
        const failMessage = `Échec de la mise à jour : ${json?.error?.message ?? `HTTP ${response.status}`}`;
        setMessage(failMessage);
        showToast(failMessage, "error");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur réseau lors de la mise à jour.");
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusCounts = useMemo(
    () => statuses.map((entry) => ({ status: entry.status, label: entry.label, count: rows.filter((row) => rowStatus(row) === entry.status).length })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, statuses, statusField]
  );

  const summary = useMemo(() => {
    if (!kpis || kpis.length === 0) {
      return [];
    }
    return kpis.map((kpi) => {
      if (kpi.amountField) {
        const field = kpi.amountField;
        const sum = (list: Row[]) => list.reduce((total, row) => total + (typeof row[field] === "number" ? (row[field] as number) : Number(row[field]) || 0), 0);
        const total = sum(rows);
        const numerator = sum(rows.filter((row) => kpi.numeratorStatuses.includes(rowStatus(row))));
        return { label: kpi.label, value: euro(numerator), percent: total > 0 ? (numerator / total) * 100 : 0, tone: kpi.tone };
      }
      const total = rows.length;
      const numerator = rows.filter((row) => kpi.numeratorStatuses.includes(rowStatus(row))).length;
      return { label: kpi.label, value: String(numerator), percent: total > 0 ? (numerator / total) * 100 : 0, tone: kpi.tone };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, kpis, statusField]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "ALL" && rowStatus(row) !== statusFilter) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const haystack = [rowTitle(row), rowStatus(row), ...columns.map((column) => cellValue(row, column))].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, statusFilter, columns, statusField, titleFields]);

  const statusLabel = (status: string) => statuses.find((entry) => entry.status === status)?.label ?? status;
  const rowKey = (row: Row, index: number) => (typeof row.id === "string" ? row.id : String(index));

  return (
    <section className="official-card rounded-lg bg-white p-5">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">Module CRM</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 xl:items-end">
          {exportHref ? (
            <a
              href={exportHref}
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#002f1d]/20 px-4 py-2 text-xs font-black uppercase text-[#002f1d] transition-colors hover:border-[#f7c600]"
            >
              <Download size={16} aria-hidden="true" /> Exporter CSV
            </a>
          ) : null}
          <AdminAccessControl loading={state === "loading"} onAuthenticated={() => void load()} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-md bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-700" role="status" aria-live="polite">
        <ShieldCheck className="text-[#07542f]" size={18} aria-hidden="true" />
        <span>{message}</span>
      </div>

      {summary.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map((item) => (
            <ProgressBar key={item.label} label={item.label} value={item.value} percent={item.percent} tone={item.tone} />
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="mb-3 text-xs font-black uppercase text-slate-500">Répartition par statut</p>
          <StatusBarChart data={statusCounts} />
        </div>
        <div className="flex flex-col gap-3">
          <label className="relative block">
            <span className="sr-only">Rechercher dans le module</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
            <input
              className="focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm font-bold text-slate-900"
              placeholder="Rechercher..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`focus-ring rounded-full px-3 py-1 text-xs font-black uppercase ${statusFilter === "ALL" ? "bg-[#002f1d] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              Tous
            </button>
            {statuses.map((entry) => (
              <button
                key={entry.status}
                type="button"
                onClick={() => setStatusFilter(entry.status)}
                className={`focus-ring rounded-full px-3 py-1 text-xs font-black uppercase ${statusFilter === entry.status ? "bg-[#002f1d] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {filteredRows.map((row, index) => (
          <article className="grid gap-3 rounded-lg border border-slate-200 bg-[#fbfcf8] p-4" key={rowKey(row, index)}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-black uppercase ring-1 ${statusBadgeClass(rowStatus(row))}`}>
                {statusLabel(rowStatus(row))}
              </span>
              <span className="text-xs font-black uppercase text-slate-500">{formatDate(row[createdAtField])}</span>
              {state === "connected" && typeof row.id === "string" && statuses.some((entry) => entry.status === rowStatus(row)) ? (
                <label className="ml-auto inline-flex items-center gap-1.5 text-xs font-black uppercase text-slate-500">
                  Statut
                  <select
                    aria-label="Changer le statut"
                    className="focus-ring rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-800 disabled:opacity-60"
                    value={rowStatus(row)}
                    disabled={savingId === row.id}
                    onChange={(event) => void patchStatus(row, event.target.value)}
                  >
                    {statuses.map((entry) => (
                      <option key={entry.status} value={entry.status}>{entry.label}</option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
            <h3 className="text-base font-black text-slate-950">{rowTitle(row)}</h3>
            <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
              {columns.map((column) => (
                <p className="text-sm text-slate-600" key={column.label}>
                  <span className="font-black uppercase text-slate-500">{column.label} : </span>
                  {cellValue(row, column)}
                </p>
              ))}
            </div>
          </article>
        ))}
        {filteredRows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-bold text-slate-500">
            Aucun enregistrement pour ce filtre.
          </p>
        ) : null}
      </div>

      {state === "connected" && hasMore ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-xs font-bold text-slate-500">{rows.length} chargés</span>
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={state !== "connected"}
            className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-[#002f1d]/20 px-4 text-xs font-black uppercase text-[#002f1d] hover:border-[#f7c600] disabled:opacity-70"
          >
            Charger plus
          </button>
        </div>
      ) : null}
    </section>
  );
}

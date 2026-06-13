"use client";

import { BadgeEuro, Bell, BarChart3, ClipboardCheck, Home, Shield, ShieldCheck, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminAccessControl } from "@/components/admin/AdminAccessControl";
import { BarChart } from "@/components/admin/charts/BarChart";
import { ProgressBar } from "@/components/admin/charts/ProgressBar";
import { StatusBarChart } from "@/components/admin/charts/StatusBarChart";
import type { LucideIcon } from "lucide-react";

type DashboardMetricKey =
  | "profiles"
  | "families"
  | "players"
  | "registrations"
  | "pendingRegistrations"
  | "teams"
  | "matches"
  | "orders"
  | "payments"
  | "contactMessages"
  | "recruitmentApplications";

type DashboardMetric = {
  key: DashboardMetricKey;
  label: string;
  count: number;
};

type ActivityLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
};

type StatusCount = {
  status: string;
  label: string;
  count: number;
};

type MonthlyPoint = {
  label: string;
  count: number;
};

type DashboardBreakdowns = {
  registrations: StatusCount[];
  orders: StatusCount[];
  payments: StatusCount[];
  recruitment: StatusCount[];
  monthlyRegistrations: MonthlyPoint[];
};

type AdminDashboard = {
  metrics: DashboardMetric[];
  breakdowns: DashboardBreakdowns;
  latestLogs: ActivityLog[];
  queuedNotifications: number;
  revenueCents: number;
};

type ApiSuccess = {
  ok: true;
  data: AdminDashboard;
};

type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

type MetricCard = {
  key: "players" | "pendingRegistrations" | "payments" | "actions" | "families" | "teams";
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  tone: "green" | "yellow" | "slate";
};

type WorkItem = {
  label: string;
  meta: string;
  owner: string;
  priority: "Urgent" | "Aujourd'hui" | "Cette semaine";
  href: string;
};

const fallbackMetrics: MetricCard[] = [
  { key: "players", label: "Licencies suivis", value: "600+", trend: "Saison 2025 / 2026", icon: Users, tone: "green" },
  { key: "pendingRegistrations", label: "Dossiers a traiter", value: "42", trend: "Inscriptions, documents, paiements", icon: ClipboardCheck, tone: "yellow" },
  { key: "payments", label: "Paiements suivis", value: "84 k€", trend: "Cotisations, boutique, partenaires", icon: BadgeEuro, tone: "slate" },
  { key: "actions", label: "Actions ouvertes", value: "18", trend: "Relances, messages, echeances", icon: Bell, tone: "green" },
  { key: "families", label: "Familles", value: "380", trend: "Familles enregistrees", icon: Home, tone: "slate" },
  { key: "teams", label: "Equipes", value: "30", trend: "Equipes actives au club", icon: Shield, tone: "green" }
];

const fallbackWorkItems: WorkItem[] = [
  {
    label: "Valider les dossiers avec documents complets",
    meta: "12 inscriptions pretes pour controle final",
    owner: "Secretariat",
    priority: "Urgent",
    href: "/admin/inscriptions"
  },
  {
    label: "Relancer les paiements de cotisation en attente",
    meta: "8 familles avec paiement incomplet",
    owner: "Tresorerie",
    priority: "Aujourd'hui",
    href: "/admin/familles"
  },
  {
    label: "Publier les resultats du week-end",
    meta: "5 matchs termines sans resume public",
    owner: "Communication",
    priority: "Aujourd'hui",
    href: "/admin#modules"
  },
  {
    label: "Preparer les convocations U15 et U18",
    meta: "2 rencontres dans les 72 prochaines heures",
    owner: "Sportif",
    priority: "Cette semaine",
    href: "/admin/joueurs"
  },
  {
    label: "Renouveler les partenaires en fin de contrat",
    meta: "3 echeances avant fin de mois",
    owner: "Partenariats",
    priority: "Cette semaine",
    href: "/admin#modules"
  }
];

const fallbackBreakdowns: DashboardBreakdowns = {
  registrations: [
    { status: "DRAFT", label: "Brouillon", count: 14 },
    { status: "SUBMITTED", label: "Soumis", count: 38 },
    { status: "IN_REVIEW", label: "En revue", count: 21 },
    { status: "MISSING_DOCUMENTS", label: "Documents manquants", count: 17 },
    { status: "VALIDATED", label: "Validé", count: 286 },
    { status: "REJECTED", label: "Rejeté", count: 6 },
    { status: "CANCELLED", label: "Annulé", count: 9 }
  ],
  orders: [
    { status: "PENDING", label: "En attente", count: 7 },
    { status: "PAID", label: "Payée", count: 23 },
    { status: "PREPARING", label: "En préparation", count: 11 },
    { status: "READY", label: "Prête", count: 5 },
    { status: "DELIVERED", label: "Livrée", count: 64 },
    { status: "CANCELLED", label: "Annulée", count: 3 },
    { status: "REFUNDED", label: "Remboursée", count: 2 }
  ],
  payments: [
    { status: "PENDING", label: "En attente", count: 19 },
    { status: "SUCCEEDED", label: "Encaissé", count: 248 },
    { status: "FAILED", label: "Échoué", count: 8 },
    { status: "CANCELLED", label: "Annulé", count: 4 },
    { status: "REFUNDED", label: "Remboursé", count: 3 }
  ],
  recruitment: [
    { status: "PENDING", label: "En attente", count: 12 },
    { status: "CONTACTED", label: "Contacté", count: 7 },
    { status: "TRIAL_SCHEDULED", label: "Essai planifié", count: 4 },
    { status: "ACCEPTED", label: "Accepté", count: 3 },
    { status: "REJECTED", label: "Refusé", count: 5 },
    { status: "ARCHIVED", label: "Archivé", count: 6 }
  ],
  monthlyRegistrations: [
    { label: "janv.", count: 18 },
    { label: "févr.", count: 24 },
    { label: "mars", count: 31 },
    { label: "avr.", count: 47 },
    { label: "mai", count: 62 },
    { label: "juin", count: 39 }
  ]
};

function isStatusCount(value: unknown): value is StatusCount {
  if (!value || typeof value !== "object") {
    return false;
  }
  const datum = value as Record<string, unknown>;
  return typeof datum.status === "string" && typeof datum.label === "string" && typeof datum.count === "number";
}

function isMonthlyPoint(value: unknown): value is MonthlyPoint {
  if (!value || typeof value !== "object") {
    return false;
  }
  const datum = value as Record<string, unknown>;
  return typeof datum.label === "string" && typeof datum.count === "number";
}

function parseBreakdowns(value: unknown): DashboardBreakdowns | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const raw = value as Record<string, unknown>;
  const arrays = [raw.registrations, raw.orders, raw.payments, raw.recruitment];
  if (!arrays.every(Array.isArray) || !Array.isArray(raw.monthlyRegistrations)) {
    return null;
  }

  return {
    registrations: (raw.registrations as unknown[]).filter(isStatusCount),
    orders: (raw.orders as unknown[]).filter(isStatusCount),
    payments: (raw.payments as unknown[]).filter(isStatusCount),
    recruitment: (raw.recruitment as unknown[]).filter(isStatusCount),
    monthlyRegistrations: (raw.monthlyRegistrations as unknown[]).filter(isMonthlyPoint)
  };
}

function isDashboardMetric(value: unknown): value is DashboardMetric {
  if (!value || typeof value !== "object") {
    return false;
  }

  const metric = value as Record<string, unknown>;
  return typeof metric.key === "string" && typeof metric.label === "string" && typeof metric.count === "number";
}

function isActivityLog(value: unknown): value is ActivityLog {
  if (!value || typeof value !== "object") {
    return false;
  }

  const log = value as Record<string, unknown>;
  return (
    typeof log.id === "string" &&
    typeof log.action === "string" &&
    typeof log.entity_type === "string" &&
    (typeof log.entity_id === "string" || log.entity_id === null) &&
    typeof log.created_at === "string"
  );
}

function parseDashboardResponse(value: unknown): ApiSuccess | ApiFailure {
  if (!value || typeof value !== "object") {
    return { ok: false, error: { code: "INVALID_RESPONSE", message: "Reponse API invalide." } };
  }

  const response = value as Record<string, unknown>;

  if (response.ok === false) {
    const error = response.error;

    if (error && typeof error === "object") {
      const payload = error as Record<string, unknown>;
      return {
        ok: false,
        error: {
          code: typeof payload.code === "string" ? payload.code : "API_ERROR",
          message: typeof payload.message === "string" ? payload.message : "Erreur API."
        }
      };
    }

    return { ok: false, error: { code: "API_ERROR", message: "Erreur API." } };
  }

  const data = response.data;

  if (!data || typeof data !== "object") {
    return { ok: false, error: { code: "INVALID_RESPONSE", message: "Payload dashboard invalide." } };
  }

  const dashboard = data as Record<string, unknown>;

  if (!Array.isArray(dashboard.metrics) || !Array.isArray(dashboard.latestLogs) || typeof dashboard.queuedNotifications !== "number") {
    return { ok: false, error: { code: "INVALID_RESPONSE", message: "Structure dashboard invalide." } };
  }

  return {
    ok: true,
    data: {
      metrics: dashboard.metrics.filter(isDashboardMetric),
      breakdowns: parseBreakdowns(dashboard.breakdowns) ?? fallbackBreakdowns,
      latestLogs: dashboard.latestLogs.filter(isActivityLog),
      queuedNotifications: dashboard.queuedNotifications,
      revenueCents: typeof dashboard.revenueCents === "number" ? dashboard.revenueCents : 0
    }
  };
}

function toneClass(tone: MetricCard["tone"]) {
  if (tone === "yellow") {
    return "border-[#f7c600]/70 bg-[#fff8d6] text-[#3a3100]";
  }

  if (tone === "green") {
    return "border-[#00351f]/20 bg-white text-[#002f1d]";
  }

  return "border-slate-200 bg-white text-slate-900";
}

function priorityClass(priority: WorkItem["priority"]) {
  if (priority === "Urgent") {
    return "bg-red-50 text-red-700 ring-red-100";
  }

  if (priority === "Aujourd'hui") {
    return "bg-[#fff8d6] text-[#735f00] ring-[#f7c600]/30";
  }

  return "bg-emerald-50 text-emerald-800 ring-emerald-100";
}

function formatCount(count: number) {
  return new Intl.NumberFormat("fr-FR").format(count);
}

function formatEuros(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format((cents ?? 0) / 100);
}

function getMetricCount(dashboard: AdminDashboard | null, key: DashboardMetricKey) {
  return dashboard?.metrics.find((metric) => metric.key === key)?.count;
}

function buildMetricCards(dashboard: AdminDashboard | null): MetricCard[] {
  if (!dashboard) {
    return fallbackMetrics;
  }

  const players = getMetricCount(dashboard, "players");
  const pendingRegistrations = getMetricCount(dashboard, "pendingRegistrations");
  const contactMessages = getMetricCount(dashboard, "contactMessages") ?? 0;
  const recruitmentApplications = getMetricCount(dashboard, "recruitmentApplications") ?? 0;
  const actions = contactMessages + recruitmentApplications + dashboard.queuedNotifications;
  const families = getMetricCount(dashboard, "families");
  const teams = getMetricCount(dashboard, "teams");

  return [
    {
      ...fallbackMetrics[0],
      value: players === undefined ? fallbackMetrics[0].value : formatCount(players),
      trend: "Joueurs en base club"
    },
    {
      ...fallbackMetrics[1],
      value: pendingRegistrations === undefined ? fallbackMetrics[1].value : formatCount(pendingRegistrations),
      trend: "Dossiers soumis, en revue ou incomplets"
    },
    {
      ...fallbackMetrics[2],
      value: formatEuros(dashboard.revenueCents),
      trend: "Encaisse (paiements reussis)"
    },
    {
      ...fallbackMetrics[3],
      value: formatCount(actions),
      trend: "Contacts, detections et notifications"
    },
    {
      ...fallbackMetrics[4],
      value: families === undefined ? fallbackMetrics[4].value : formatCount(families),
      trend: "Familles enregistrees"
    },
    {
      ...fallbackMetrics[5],
      value: teams === undefined ? fallbackMetrics[5].value : formatCount(teams),
      trend: "Equipes actives au club"
    }
  ];
}

function buildWorkItems(dashboard: AdminDashboard | null): WorkItem[] {
  if (!dashboard) {
    return fallbackWorkItems;
  }

  const pendingRegistrations = getMetricCount(dashboard, "pendingRegistrations") ?? 0;
  const contactMessages = getMetricCount(dashboard, "contactMessages") ?? 0;
  const recruitmentApplications = getMetricCount(dashboard, "recruitmentApplications") ?? 0;
  const payments = getMetricCount(dashboard, "payments") ?? 0;

  return [
    {
      label: "Traiter les dossiers d'inscription ouverts",
      meta: `${formatCount(pendingRegistrations)} dossiers soumis, en revue ou incomplets`,
      owner: "Secretariat",
      priority: pendingRegistrations > 0 ? "Urgent" : "Cette semaine",
      href: "/admin/inscriptions"
    },
    {
      label: "Verifier les notifications en file",
      meta: `${formatCount(dashboard.queuedNotifications)} notifications a envoyer ou reprendre`,
      owner: "Administration",
      priority: dashboard.queuedNotifications > 0 ? "Aujourd'hui" : "Cette semaine",
      href: "/admin#modules"
    },
    {
      label: "Repondre aux messages contact",
      meta: `${formatCount(contactMessages)} messages contact en attente`,
      owner: "Communication",
      priority: contactMessages > 0 ? "Aujourd'hui" : "Cette semaine",
      href: "/admin#modules"
    },
    {
      label: "Qualifier les candidatures detection",
      meta: `${formatCount(recruitmentApplications)} candidatures a traiter`,
      owner: "Sportif",
      priority: recruitmentApplications > 0 ? "Aujourd'hui" : "Cette semaine",
      href: "/admin/joueurs"
    },
    {
      label: "Controler les paiements recents",
      meta: `${formatCount(payments)} paiements enregistres dans le CRM`,
      owner: "Tresorerie",
      priority: "Cette semaine",
      href: "/admin/familles"
    }
  ];
}

function sumStatus(items: StatusCount[]): number {
  return items.reduce((total, item) => total + item.count, 0);
}

function findStatus(items: StatusCount[], status: string): number {
  return items.find((item) => item.status === status)?.count ?? 0;
}

function ratio(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

export function AdminDashboardLive() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [status, setStatus] = useState<"demo" | "loading" | "connected" | "error">("demo");
  const [message, setMessage] = useState("Mode demo : connectez-vous pour charger les compteurs backend.");

  const metricCards = useMemo(() => buildMetricCards(dashboard), [dashboard]);
  const workItems = useMemo(() => buildWorkItems(dashboard), [dashboard]);
  const breakdowns = useMemo(() => dashboard?.breakdowns ?? fallbackBreakdowns, [dashboard]);

  const kpiBars = useMemo(() => {
    const registrationsTotal = sumStatus(breakdowns.registrations);
    const paymentsTotal = sumStatus(breakdowns.payments);
    const ordersTotal = sumStatus(breakdowns.orders);
    const validated = findStatus(breakdowns.registrations, "VALIDATED");
    const succeeded = findStatus(breakdowns.payments, "SUCCEEDED");
    const delivered = findStatus(breakdowns.orders, "DELIVERED");

    return [
      {
        label: "Inscriptions validées",
        value: `${formatCount(validated)} / ${formatCount(registrationsTotal)}`,
        percent: ratio(validated, registrationsTotal),
        tone: "green" as const,
        hint: "Dossiers validés sur le total reçu"
      },
      {
        label: "Paiements encaissés",
        value: `${formatCount(succeeded)} / ${formatCount(paymentsTotal)}`,
        percent: ratio(succeeded, paymentsTotal),
        tone: "yellow" as const,
        hint: "Paiements aboutis sur le total enregistré"
      },
      {
        label: "Commandes livrées",
        value: `${formatCount(delivered)} / ${formatCount(ordersTotal)}`,
        percent: ratio(delivered, ordersTotal),
        tone: "green" as const,
        hint: "Commandes boutique livrées"
      }
    ];
  }, [breakdowns]);

  async function loadDashboard() {
    setStatus("loading");
    setMessage("Chargement via la session admin...");

    try {
      // Auth par cookie HttpOnly `admin_session` (envoyé automatiquement, même origine).
      const response = await fetch("/api/admin/dashboard", { credentials: "same-origin" });
      const parsed = parseDashboardResponse(await response.json());

      if (!parsed.ok) {
        setDashboard(null);
        setStatus("error");
        setMessage(`${parsed.error.code} : ${parsed.error.message}`);
        return;
      }

      setDashboard(parsed.data);
      setStatus("connected");
      setMessage("Donnees backend chargees depuis /api/admin/dashboard.");
    } catch (error) {
      setDashboard(null);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Erreur de chargement dashboard.");
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#002f1d] text-[#f7c600]">
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-[#07542f]">Connexion dashboard</p>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-700">{message}</p>
            </div>
          </div>

          <AdminAccessControl loading={status === "loading"} onAuthenticated={() => void loadDashboard()} />
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;

          return (
            <article className={`rounded-lg border p-5 shadow-sm ${toneClass(metric.tone)}`} key={metric.key}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-current/65">{metric.label}</p>
                  <p className="mt-2 text-3xl font-black">{metric.value}</p>
                </div>
                <Icon size={24} aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm font-bold text-current/70">{metric.trend}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-[#07542f]">Indicateurs clés</p>
          <h3 className="mt-1 text-xl font-black uppercase text-[#002f1d]">Taux de traitement</h3>
          <div className="mt-5 grid gap-5">
            {kpiBars.map((bar) => (
              <ProgressBar
                key={bar.label}
                label={bar.label}
                value={bar.value}
                percent={bar.percent}
                tone={bar.tone}
                hint={bar.hint}
              />
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#07542f]">Tendance</p>
              <h3 className="mt-1 text-xl font-black uppercase text-[#002f1d]">Inscriptions par mois</h3>
            </div>
            <TrendingUp className="text-[#07542f]" size={22} aria-hidden="true" />
          </div>
          <div className="mt-6">
            <BarChart data={breakdowns.monthlyRegistrations} />
          </div>
        </article>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-[#07542f]">Pilotage visuel</p>
            <h3 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Répartitions par statut</h3>
          </div>
          <BarChart3 className="text-[#07542f]" size={24} aria-hidden="true" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-black uppercase text-slate-500">Inscriptions</p>
            <StatusBarChart data={breakdowns.registrations} />
          </div>
          <div>
            <p className="mb-3 text-xs font-black uppercase text-slate-500">Commandes boutique</p>
            <StatusBarChart data={breakdowns.orders} />
          </div>
          <div>
            <p className="mb-3 text-xs font-black uppercase text-slate-500">Paiements</p>
            <StatusBarChart data={breakdowns.payments} />
          </div>
          <div>
            <p className="mb-3 text-xs font-black uppercase text-slate-500">Détections / recrutement</p>
            <StatusBarChart data={breakdowns.recruitment} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[#07542f]">File de travail</p>
            <h3 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Actions prioritaires</h3>
          </div>
          <a className="focus-ring inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-black text-[#07542f] hover:bg-emerald-50" href="#modules">
            Voir les modules
          </a>
        </div>

        <div className="mt-5 grid gap-3">
          {workItems.map((item) => (
            <article className="grid gap-4 rounded-lg border border-slate-200 bg-[#fbfcf8] p-4 md:grid-cols-[1fr_auto] md:items-center" key={item.label}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-black uppercase ring-1 ${priorityClass(item.priority)}`}>{item.priority}</span>
                  <span className="text-xs font-black uppercase text-slate-500">{item.owner}</span>
                </div>
                <h4 className="mt-2 text-base font-black text-slate-950">{item.label}</h4>
                <p className="mt-1 text-sm text-slate-600">{item.meta}</p>
              </div>
              <Link className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-black text-[#002f1d] hover:border-[#f7c600]" href={item.href}>
                Ouvrir
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

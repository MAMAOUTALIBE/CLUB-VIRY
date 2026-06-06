"use client";

import { BadgeEuro, Bell, ClipboardCheck, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminAccessControl, ADMIN_TOKEN_STORAGE_KEY } from "@/components/admin/AdminAccessControl";
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

type AdminDashboard = {
  metrics: DashboardMetric[];
  latestLogs: ActivityLog[];
  queuedNotifications: number;
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
  key: "players" | "pendingRegistrations" | "payments" | "actions";
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
  { key: "actions", label: "Actions ouvertes", value: "18", trend: "Relances, messages, echeances", icon: Bell, tone: "green" }
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
      latestLogs: dashboard.latestLogs.filter(isActivityLog),
      queuedNotifications: dashboard.queuedNotifications
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

function getMetricCount(dashboard: AdminDashboard | null, key: DashboardMetricKey) {
  return dashboard?.metrics.find((metric) => metric.key === key)?.count;
}

function buildMetricCards(dashboard: AdminDashboard | null): MetricCard[] {
  if (!dashboard) {
    return fallbackMetrics;
  }

  const players = getMetricCount(dashboard, "players");
  const pendingRegistrations = getMetricCount(dashboard, "pendingRegistrations");
  const payments = getMetricCount(dashboard, "payments");
  const contactMessages = getMetricCount(dashboard, "contactMessages") ?? 0;
  const recruitmentApplications = getMetricCount(dashboard, "recruitmentApplications") ?? 0;
  const actions = contactMessages + recruitmentApplications + dashboard.queuedNotifications;

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
      value: payments === undefined ? fallbackMetrics[2].value : formatCount(payments),
      trend: "Paiements enregistres"
    },
    {
      ...fallbackMetrics[3],
      value: formatCount(actions),
      trend: "Contacts, detections et notifications"
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

export function AdminDashboardLive() {
  const [token, setToken] = useState("");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [status, setStatus] = useState<"demo" | "loading" | "connected" | "error">("demo");
  const [message, setMessage] = useState("Mode demo : ajoutez un token admin pour charger les compteurs backend.");

  const metricCards = useMemo(() => buildMetricCards(dashboard), [dashboard]);
  const workItems = useMemo(() => buildWorkItems(dashboard), [dashboard]);

  async function loadDashboard(accessToken: string) {
    const normalizedToken = accessToken.trim();

    if (!normalizedToken) {
      setDashboard(null);
      setStatus("demo");
      setMessage("Mode demo : ajoutez un token admin pour charger les compteurs backend.");
      return;
    }

    setStatus("loading");
    setMessage("Chargement des donnees admin...");

    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${normalizedToken}`
        }
      });
      const parsed = parseDashboardResponse(await response.json());

      if (!parsed.ok) {
        setDashboard(null);
        setStatus("error");
        setMessage(`${parsed.error.code} : ${parsed.error.message}`);
        return;
      }

      window.sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, normalizedToken);
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
    const timeout = window.setTimeout(() => {
      const storedToken = window.sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);

      if (storedToken) {
        setToken(storedToken);
        void loadDashboard(storedToken);
      }
    }, 0);

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

          <AdminAccessControl
            loading={status === "loading"}
            onClear={() => {
                window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
                setToken("");
                setDashboard(null);
                setStatus("demo");
                setMessage("Mode demo : ajoutez un token admin pour charger les compteurs backend.");
            }}
            onTokenSubmit={(nextToken) => void loadDashboard(nextToken)}
            setToken={setToken}
            token={token}
          />
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

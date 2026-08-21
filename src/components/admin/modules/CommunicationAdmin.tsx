"use client";

import { Loader2, Send, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { showToast } from "@/components/admin/Toast";

type Summary = { providerConfigured: boolean; processed: number; sent: number; failed: number; skipped: number };
type Campaign = {
  id: string;
  subject: string;
  body: string;
  audience_type: string;
  audience_id: string | null;
  status: string;
  recipient_count: number;
  email_count: number;
  sent_at: string | null;
  created_at: string;
};
type Option = { value: string; label: string };

const AUDIENCE_TYPES: Option[] = [
  { value: "ALL_MEMBERS", label: "Tout le club" },
  { value: "ROLE", label: "Un rôle" },
  { value: "TEAM", label: "Une équipe" },
  { value: "CATEGORY", label: "Une catégorie" }
];

const ROLES: Option[] = [
  { value: "FAMILLE", label: "Familles" },
  { value: "JOUEUR", label: "Joueurs" },
  { value: "EDUCATEUR", label: "Éducateurs" },
  { value: "DIRIGEANT", label: "Dirigeants" },
  { value: "MEMBRE", label: "Membres" },
  { value: "PARTENAIRE", label: "Partenaires" }
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

/** Options { value, label } tirées d'une liste d'API (équipes, catégories). */
function toOptions(json: unknown, key: string): Option[] {
  const data = isRecord(json) && isRecord(json.data) ? json.data : null;
  const list = data && Array.isArray(data[key]) ? (data[key] as unknown[]) : [];

  return list
    .filter(isRecord)
    .filter((row): row is { id: string; name: string } => typeof row.id === "string" && typeof row.name === "string")
    .map((row) => ({ value: row.id, label: row.name }));
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "green" | "red" }) {
  const color = tone === "green" ? "text-emerald-700" : tone === "red" ? "text-red-700" : "text-[#002f1d]";
  return (
    <div className="rounded-lg border border-slate-200 bg-[#fbfcf8] p-3 text-center">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-[11px] font-black uppercase text-slate-500">{label}</p>
    </div>
  );
}

export function CommunicationAdmin() {
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] = useState("ALL_MEMBERS");
  const [audienceId, setAudienceId] = useState("");
  const [link, setLink] = useState("");
  const [teams, setTeams] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [preview, setPreview] = useState<{ recipients: number; emails: number } | null>(null);
  const [composeError, setComposeError] = useState("");
  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const targetOptions = audienceType === "ROLE" ? ROLES : audienceType === "TEAM" ? teams : audienceType === "CATEGORY" ? categories : [];
  const needsTarget = audienceType !== "ALL_MEMBERS";

  const loadCampaigns = useCallback(async () => {
    const res = await fetch("/api/admin/campaigns?limit=50", { credentials: "same-origin" });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok && Array.isArray(json.data?.campaigns)) {
      setCampaigns(json.data.campaigns as Campaign[]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCampaigns();
      void fetch("/api/admin/teams?limit=200", { credentials: "same-origin" })
        .then((res) => res.json())
        .then((json) => setTeams(toOptions(json, "teams")))
        .catch(() => undefined);
      void fetch("/api/admin/categories?limit=200", { credentials: "same-origin" })
        .then((res) => res.json())
        .then((json) => setCategories(toOptions(json, "categories")))
        .catch(() => undefined);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCampaigns]);

  async function countAudience() {
    setComposeError("");
    const params = new URLSearchParams({ audienceType });
    if (needsTarget) params.set("audienceId", audienceId);

    try {
      const res = await fetch(`/api/admin/campaigns/audience?${params.toString()}`, { credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setComposeError(json?.error?.message ?? "Comptage impossible.");
        return;
      }
      setPreview({ recipients: json.data.recipients ?? 0, emails: json.data.emails ?? 0 });
    } catch (networkError) {
      setComposeError(networkError instanceof Error ? networkError.message : "Erreur réseau.");
    }
  }

  async function sendCampaign() {
    if (!window.confirm(`Envoyer « ${subject} » ${preview ? `à ${preview.recipients} destinataire(s)` : "au public choisi"} ? L'envoi est définitif.`)) {
      return;
    }

    setSending(true);
    setComposeError("");

    try {
      const createRes = await fetch("/api/admin/campaigns", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body,
          audienceType,
          ...(needsTarget ? { audienceId } : {}),
          ...(link.trim() ? { link: link.trim() } : {})
        })
      });
      const created = await createRes.json().catch(() => null);

      if (!createRes.ok || !created?.ok) {
        const details = Array.isArray(created?.error?.details)
          ? created.error.details.map((issue: { field?: string; message?: string }) => `${issue.field} : ${issue.message}`).join(" · ")
          : "";
        setComposeError(`${created?.error?.message ?? "Enregistrement impossible."}${details ? " — " + details : ""}`);
        return;
      }

      const sendRes = await fetch(`/api/admin/campaigns/${created.data.campaign.id}/send`, {
        method: "POST",
        credentials: "same-origin"
      });
      const sent = await sendRes.json().catch(() => null);

      if (!sendRes.ok || !sent?.ok) {
        // Le brouillon existe : il reste dans l'historique, prêt à être renvoyé ou archivé.
        setComposeError(`${sent?.error?.message ?? "Envoi impossible."} Le brouillon est conservé dans l'historique.`);
        await loadCampaigns();
        return;
      }

      setSubject("");
      setBody("");
      setLink("");
      setPreview(null);
      await loadCampaigns();
      showToast(`Campagne envoyée à ${sent.data.campaign.recipient_count} destinataire(s).`);
    } catch (networkError) {
      setComposeError(networkError instanceof Error ? networkError.message : "Erreur réseau.");
    } finally {
      setSending(false);
    }
  }

  async function archiveCampaign(campaign: Campaign) {
    if (!window.confirm(`Archiver « ${campaign.subject} » ? La campagne part à la corbeille et reste restaurable.`)) {
      return;
    }

    const res = await fetch(`/api/admin/campaigns/${campaign.id}`, { method: "DELETE", credentials: "same-origin" });
    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.ok) {
      showToast(json?.error?.message ?? "Archivage impossible.", "error");
      return;
    }

    await loadCampaigns();
    showToast("Campagne archivée.");
  }

  async function processQueue() {
    setBusy(true);
    setError("");
    setSummary(null);
    try {
      const res = await fetch("/api/admin/notifications/process?limit=50", { method: "POST", credentials: "same-origin" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? `Échec (HTTP ${res.status}).`);
        return;
      }
      setSummary(json.data as Summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="official-card rounded-lg bg-white p-5">
        <p className="text-xs font-black uppercase text-[#07542f]">Module CRM</p>
        <h2 className="mt-1 text-2xl font-black uppercase text-[#002f1d]">Nouvelle campagne</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Écrivez un message et choisissez qui le reçoit. Chaque destinataire le retrouve dans son espace, et le reçoit par email s&apos;il
          a gardé les emails « Vie du club ». Comptez le public avant d&apos;envoyer : l&apos;envoi est définitif.
        </p>

        <form
          className="mt-5 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void sendCampaign();
          }}
        >
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase text-slate-600">Objet</span>
            <input
              className="focus-ring min-h-11 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
              maxLength={160}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Assemblée générale du club — samedi 12 juin"
              required
              value={subject}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black uppercase text-slate-600">Message</span>
            <textarea
              className="focus-ring min-h-32 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-medium leading-6 text-slate-900"
              maxLength={5000}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Bonjour à toutes et à tous,&#10;&#10;L'assemblée générale se tiendra…"
              required
              value={body}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase text-slate-600">Public</span>
              <select
                className="focus-ring min-h-11 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
                onChange={(event) => {
                  setAudienceType(event.target.value);
                  setAudienceId("");
                  // Le compteur décrivait l'ancien public : le garder ferait envoyer
                  // en croyant à un chiffre qui ne correspond plus à la cible.
                  setPreview(null);
                }}
                value={audienceType}
              >
                {AUDIENCE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            {needsTarget ? (
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase text-slate-600">Cible</span>
                <select
                  className="focus-ring min-h-11 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
                  onChange={(event) => {
                    setAudienceId(event.target.value);
                    setPreview(null);
                  }}
                  required
                  value={audienceId}
                >
                  <option value="">À choisir…</option>
                  {targetOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          <label className="grid gap-2">
            <span className="text-xs font-black uppercase text-slate-600">Lien interne (facultatif)</span>
            <input
              className="focus-ring min-h-11 rounded-md border border-slate-300 bg-[#fbfcf8] px-3 py-2 text-sm font-bold text-slate-900"
              onChange={(event) => setLink(event.target.value)}
              placeholder="/actualites"
              value={link}
            />
          </label>

          {composeError ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700" role="alert">{composeError}</p>
          ) : null}

          {preview ? (
            <p className="rounded-md bg-[#fff8d6] px-3 py-2 text-sm font-bold text-[#735f00]" role="status">
              {preview.recipients} destinataire(s) dans leur espace · {preview.emails} par email
              {preview.recipients > 0 && preview.emails === 0 ? " (aucune adresse joignable ou opt-out)" : ""}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-[#002f1d]/20 bg-white px-4 text-sm font-black uppercase text-[#002f1d] hover:border-[#f7c600]"
              disabled={needsTarget && !audienceId}
              onClick={() => void countAudience()}
              type="button"
            >
              <Users size={16} aria-hidden="true" /> Compter le public
            </button>
            <button
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-5 text-sm font-black uppercase text-white hover:bg-[#07542f] disabled:cursor-wait disabled:opacity-70"
              disabled={sending}
              type="submit"
            >
              {sending ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <Send size={16} aria-hidden="true" />} Envoyer
            </button>
          </div>
        </form>
      </section>

      <section className="official-card rounded-lg bg-white p-5">
        <h2 className="text-2xl font-black uppercase text-[#002f1d]">Campagnes envoyées</h2>
        <div className="mt-4 grid gap-2">
          {campaigns.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-5 text-center text-sm font-bold text-slate-500">
              Aucune campagne pour le moment.
            </p>
          ) : (
            campaigns.map((campaign) => (
              <article className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-[#fbfcf8] p-3" key={campaign.id}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-[#002f1d]">{campaign.subject}</p>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    {AUDIENCE_TYPES.find((option) => option.value === campaign.audience_type)?.label ?? campaign.audience_type}
                    {" · "}
                    {campaign.status === "SENT"
                      ? `${campaign.recipient_count} destinataire(s), ${campaign.email_count} email(s) · ${formatDate(campaign.sent_at)}`
                      : `Brouillon · ${formatDate(campaign.created_at)}`}
                  </p>
                </div>
                <button
                  className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-black uppercase text-slate-600 hover:border-red-300 hover:text-red-700"
                  onClick={() => void archiveCampaign(campaign)}
                  type="button"
                >
                  <Trash2 size={14} aria-hidden="true" /> Archiver
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="official-card rounded-lg bg-white p-5">
        <h2 className="text-2xl font-black uppercase text-[#002f1d]">File d&apos;envoi</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Les emails (campagnes, convocations, séances, médias, actualités) partent par lots via le provider
          (<code className="rounded bg-slate-100 px-1">BREVO_API_KEY</code>) ou le webhook. Traitez la file ici, ou planifiez un cron sur
          l&apos;endpoint.
        </p>
        <button
          onClick={() => void processQueue()}
          disabled={busy}
          className="focus-ring mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#002f1d] px-5 text-sm font-black uppercase text-white hover:bg-[#07542f] disabled:opacity-70"
          type="button"
        >
          {busy ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />} Traiter la file maintenant
        </button>

        {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}

        {summary ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <Stat label="Traitées" value={summary.processed} />
            <Stat label="Envoyées" value={summary.sent} tone="green" />
            <Stat label="Échecs" value={summary.failed} tone="red" />
            <Stat label="Ignorées" value={summary.skipped} />
            {!summary.providerConfigured ? (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 sm:col-span-4">
                ⚠️ Aucun provider email ni webhook configuré : définissez <strong>BREVO_API_KEY</strong> + <strong>EMAIL_FROM</strong> (ou un webhook) pour envoyer réellement les emails.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

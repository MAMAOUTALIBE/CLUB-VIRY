"use client";

import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAccessControl } from "@/components/admin/AdminAccessControl";

type DetailKind = "family" | "player" | "registration";

type DetailProps = {
  backHref: string;
  endpoint: string;
  kind: DetailKind;
};

type DetailItem = {
  id?: string;
  title: string;
  meta: string;
  note?: string;
  status?: string;
  type?: "registration" | "document" | "payment" | "player";
};

type DetailView = {
  adminNotes?: string;
  title: string;
  subtitle: string;
  status: string;
  stats: Array<{ label: string; value: string }>;
  sections: Array<{ title: string; items: DetailItem[] }>;
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

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
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

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) {
    return "Non renseigne";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Non renseigne";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function formatMoney(cents: unknown, currency: unknown) {
  if (typeof cents !== "number") {
    return "Montant non renseigne";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: typeof currency === "string" ? currency : "EUR"
  }).format(cents / 100);
}

function buildRegistrationItems(records: Record<string, unknown>[]): DetailItem[] {
  return records.map((registration) => ({
    id: optionalString(registration.id) ?? undefined,
    title: `Dossier ${optionalString(registration.id)?.slice(0, 8) ?? ""}`,
    meta: `Soumis : ${formatDate(registration.submitted_at ?? registration.created_at)}`,
    status: optionalString(registration.status) ?? "Statut inconnu",
    type: "registration"
  }));
}

function buildDocumentItems(records: Record<string, unknown>[]): DetailItem[] {
  return records.map((document) => ({
    id: optionalString(document.id) ?? undefined,
    title: optionalString(document.label) ?? optionalString(document.document_type) ?? "Document",
    meta: `Type : ${optionalString(document.document_type) ?? "Non renseigne"}`,
    note: optionalString(document.rejection_reason) ?? undefined,
    status: optionalString(document.status) ?? "Statut inconnu",
    type: "document"
  }));
}

function buildPaymentItems(records: Record<string, unknown>[]): DetailItem[] {
  return records.map((payment) => ({
    id: optionalString(payment.id) ?? undefined,
    title: formatMoney(payment.amount_cents, payment.currency),
    meta: `Provider : ${optionalString(payment.provider) ?? "Non renseigne"}`,
    status: optionalString(payment.status) ?? "Statut inconnu",
    type: "payment"
  }));
}

function buildDetail(kind: DetailKind, payload: unknown): DetailView {
  if (!isObject(payload) || payload.ok !== true || !isObject(payload.data)) {
    throw new Error("Structure API invalide.");
  }

  const data = payload.data;
  const registrations = asArray(data.registrations);
  const documents = asArray(data.documents);
  const payments = asArray(data.payments);

  if (kind === "family") {
    const family = isObject(data.family) ? data.family : {};
    const players = asArray(data.players);
    const members = asArray(data.members);

    return {
      title: optionalString(family.name) ?? "Famille",
      subtitle: `Contact principal : ${optionalString(family.primary_contact_id)?.slice(0, 8) ?? "non renseigne"}`,
      status: "Famille",
      stats: [
        { label: "Joueurs", value: String(players.length) },
        { label: "Membres", value: String(members.length) },
        { label: "Dossiers", value: String(registrations.length) },
        { label: "Paiements", value: String(payments.length) }
      ],
      sections: [
        {
          title: "Joueurs rattaches",
          items: players.map((player) => ({
            id: optionalString(player.id) ?? undefined,
            title: `${optionalString(player.first_name) ?? ""} ${optionalString(player.last_name) ?? ""}`.trim() || "Joueur",
            meta: `Naissance : ${formatDate(player.birth_date)}`,
            status: optionalString(player.license_number) ? "Licence active" : "Sans licence",
            type: "player"
          }))
        },
        { title: "Dossiers", items: buildRegistrationItems(registrations) },
        { title: "Documents", items: buildDocumentItems(documents) },
        { title: "Paiements", items: buildPaymentItems(payments) }
      ]
    };
  }

  if (kind === "player") {
    const player = isObject(data.player) ? data.player : {};
    const family = isObject(data.family) ? data.family : null;

    return {
      title: `${optionalString(player.first_name) ?? ""} ${optionalString(player.last_name) ?? ""}`.trim() || "Joueur",
      subtitle: family ? `Famille : ${optionalString(family.name) ?? "non renseignee"}` : "Famille non rattachee",
      status: optionalString(player.license_number) ? `Licence ${optionalString(player.license_number)}` : "Sans licence",
      stats: [
        { label: "Dossiers", value: String(registrations.length) },
        { label: "Documents", value: String(documents.length) },
        { label: "Paiements", value: String(payments.length) },
        { label: "Naissance", value: formatDate(player.birth_date) }
      ],
      sections: [
        { title: "Dossiers", items: buildRegistrationItems(registrations) },
        { title: "Documents", items: buildDocumentItems(documents) },
        { title: "Paiements", items: buildPaymentItems(payments) }
      ]
    };
  }

  const registration = isObject(data.registration) ? data.registration : {};
  const player = isObject(data.player) ? data.player : null;
  const family = isObject(data.family) ? data.family : null;

  return {
    adminNotes: optionalString(registration.admin_notes) ?? "",
    title: `Dossier ${optionalString(registration.id)?.slice(0, 8) ?? ""}`,
    subtitle: [
      player ? `Joueur : ${optionalString(player.first_name) ?? ""} ${optionalString(player.last_name) ?? ""}`.trim() : null,
      family ? `Famille : ${optionalString(family.name) ?? "non renseignee"}` : null
    ]
      .filter(Boolean)
      .join(" · "),
    status: optionalString(registration.status) ?? "Statut inconnu",
    stats: [
      { label: "Documents", value: String(documents.length) },
      { label: "Paiements", value: String(payments.length) },
      { label: "Soumission", value: formatDate(registration.submitted_at ?? registration.created_at) },
      { label: "Saison", value: optionalString(registration.season_id)?.slice(0, 8) ?? "Non renseignee" }
    ],
    sections: [
      { title: "Documents", items: buildDocumentItems(documents) },
      { title: "Paiements", items: buildPaymentItems(payments) }
    ]
  };
}

export function Admin360Detail({ backHref, endpoint, kind }: DetailProps) {
  const [detail, setDetail] = useState<DetailView | null>(null);
  const [status, setStatus] = useState<"demo" | "loading" | "loaded" | "error">("demo");
  const [message, setMessage] = useState("Connectez-vous pour charger la fiche 360.");
  const [actionStatus, setActionStatus] = useState<"idle" | "loading" | "error">("idle");
  const [actionMessage, setActionMessage] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [documentRejectionReason, setDocumentRejectionReason] = useState(
    "Document a corriger. Merci de deposer une version conforme."
  );

  const visibleSections = useMemo(() => detail?.sections.filter((section) => section.items.length > 0) ?? [], [detail]);

  const loadDetail = useCallback(async () => {
    setStatus("loading");
    setMessage("Chargement via la session admin...");

    try {
      // Auth par cookie HttpOnly `admin_session` (envoyé automatiquement, même origine).
      const response = await fetch(endpoint, { credentials: "same-origin" });
      const payload: unknown = await response.json();
      const failure = parseFailure(payload);

      if (failure) {
        setDetail(null);
        setStatus("error");
        setMessage(`${failure.error.code} : ${failure.error.message}`);
        setAdminNotes("");
        return;
      }

      const nextDetail = buildDetail(kind, payload);
      setDetail(nextDetail);
      setAdminNotes(nextDetail.adminNotes ?? "");
      setStatus("loaded");
      setMessage("Fiche 360 chargee depuis le backend.");
    } catch (error) {
      setDetail(null);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Erreur de chargement fiche 360.");
      setAdminNotes("");
    }
  }, [endpoint, kind]);

  const patchAdmin = useCallback(async (url: string, body: Record<string, unknown>) => {
    setActionStatus("loading");
    setActionMessage("");

    try {
      const response = await fetch(url, {
        body: JSON.stringify(body),
        // Auth par cookie HttpOnly `admin_session` (envoyé automatiquement, même origine).
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        method: "PATCH"
      });
      const payload: unknown = await response.json();
      const failure = parseFailure(payload);

      if (failure) {
        setActionStatus("error");
        setActionMessage(`${failure.error.code} : ${failure.error.message}`);
        return;
      }

      setActionStatus("idle");
      setActionMessage("Action enregistree.");
      await loadDetail();
    } catch (error) {
      setActionStatus("error");
      setActionMessage(error instanceof Error ? error.message : "Erreur action inconnue.");
    }
  }, [loadDetail]);

  const reviewRegistration = useCallback((nextStatus: "IN_REVIEW" | "MISSING_DOCUMENTS" | "VALIDATED" | "REJECTED" | "CANCELLED") => {
    const trimmedNotes = adminNotes.trim();
    void patchAdmin(endpoint, {
      status: nextStatus,
      ...(trimmedNotes ? { adminNotes: trimmedNotes } : {})
    });
  }, [adminNotes, endpoint, patchAdmin]);

  const reviewDocument = useCallback((documentId: string, nextStatus: "VALIDATED" | "REJECTED") => {
    const trimmedReason = documentRejectionReason.trim();

    if (nextStatus === "REJECTED" && !trimmedReason) {
      setActionStatus("error");
      setActionMessage("Motif obligatoire pour refuser un document.");
      return;
    }

    const body =
      nextStatus === "REJECTED"
        ? { status: nextStatus, rejectionReason: trimmedReason }
        : { status: nextStatus };

    void patchAdmin(`/api/admin/registration-documents/${documentId}`, body);
  }, [documentRejectionReason, patchAdmin]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadDetail(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadDetail]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <Link className="focus-ring inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-black text-[#07542f] hover:bg-emerald-50" href={backHref}>
        <ArrowLeft size={16} aria-hidden="true" />
        Retour
      </Link>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_auto] xl:items-start">
        <div>
          <p className="text-xs font-black uppercase text-[#07542f]">Fiche 360</p>
          <h2 className="mt-1 text-3xl font-black uppercase text-[#002f1d]">{detail?.title ?? "Detail CRM"}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{detail?.subtitle ?? message}</p>
        </div>

        <AdminAccessControl loading={status === "loading"} onAuthenticated={() => void loadDetail()} />
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-[#fbfcf8] p-3">
        <ShieldCheck className="mt-0.5 text-[#07542f]" size={18} aria-hidden="true" />
        <p className="text-sm font-bold leading-6 text-slate-700">{message}</p>
      </div>

      {kind === "registration" ? (
        <section className="mt-5 rounded-lg border border-slate-200 bg-[#fbfcf8] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-[#07542f]">Actions dossier</p>
              <h3 className="mt-1 text-xl font-black uppercase text-[#002f1d]">Revue administrative</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "En revue", status: "IN_REVIEW" as const },
                { label: "Documents manquants", status: "MISSING_DOCUMENTS" as const },
                { label: "Valider", status: "VALIDATED" as const },
                { label: "Refuser", status: "REJECTED" as const },
                { label: "Annuler", status: "CANCELLED" as const }
              ].map((action) => (
                <button
                  className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-black text-[#002f1d] hover:border-[#f7c600] disabled:cursor-wait disabled:opacity-70"
                  disabled={actionStatus === "loading"}
                  key={action.status}
                  onClick={() => reviewRegistration(action.status)}
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
          <label className="mt-4 block">
            <span className="text-xs font-black uppercase text-slate-500">Note admin transmise au dossier</span>
            <textarea
              className="focus-ring mt-2 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold leading-6 text-slate-900"
              maxLength={2000}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Ex. Dossier complet, licence a verifier, pieces manquantes..."
              value={adminNotes}
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-black uppercase text-slate-500">Motif utilise pour refuser un document</span>
            <textarea
              className="focus-ring mt-2 min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold leading-6 text-slate-900"
              maxLength={1000}
              onChange={(event) => setDocumentRejectionReason(event.target.value)}
              placeholder="Motif obligatoire pour un refus document."
              value={documentRejectionReason}
            />
          </label>
          {actionMessage ? (
            <p className={`mt-3 text-sm font-bold ${actionStatus === "error" ? "text-red-700" : "text-[#07542f]"}`}>{actionMessage}</p>
          ) : null}
        </section>
      ) : null}

      {detail ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {detail.stats.map((stat) => (
              <article className="rounded-lg border border-slate-200 bg-[#fbfcf8] p-4" key={stat.label}>
                <p className="text-xs font-black uppercase text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-black text-[#002f1d]">{stat.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {visibleSections.map((section) => (
              <section className="rounded-lg border border-slate-200 bg-[#fbfcf8] p-5" key={section.title}>
                <h3 className="text-xl font-black uppercase text-[#002f1d]">{section.title}</h3>
                <div className="mt-4 grid gap-3">
                  {section.items.map((item, index) => (
                    <article className="rounded-lg border border-slate-200 bg-white p-4" key={`${section.title}-${item.title}-${index}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h4 className="font-black text-slate-950">{item.title}</h4>
	                          <p className="mt-1 text-sm text-slate-600">{item.meta}</p>
	                          {item.note ? <p className="mt-2 text-sm font-bold text-red-700">Motif : {item.note}</p> : null}
                        </div>
                        {item.status ? <span className="rounded-full bg-[#fff8d6] px-2 py-1 text-xs font-black uppercase text-[#735f00]">{item.status}</span> : null}
                      </div>
                      {kind === "registration" && item.type === "document" && item.id ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            className="focus-ring inline-flex min-h-9 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-black uppercase text-emerald-800 hover:border-emerald-500 disabled:cursor-wait disabled:opacity-70"
                            disabled={actionStatus === "loading"}
                            onClick={() => reviewDocument(item.id as string, "VALIDATED")}
                            type="button"
                          >
                            Valider document
                          </button>
                          <button
                            className="focus-ring inline-flex min-h-9 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-black uppercase text-red-700 hover:border-red-500 disabled:cursor-wait disabled:opacity-70"
                            disabled={actionStatus === "loading"}
                            onClick={() => reviewDocument(item.id as string, "REJECTED")}
                            type="button"
                          >
                            Refuser document
                          </button>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-[#fbfcf8] p-8 text-center">
          <FileText className="mx-auto text-[#07542f]" size={30} aria-hidden="true" />
          <p className="mt-3 text-sm font-black uppercase text-[#002f1d]">Fiche non chargee</p>
          <p className="mt-2 text-sm text-slate-600">Connectez-vous avec un compte admin autorise pour charger la fiche.</p>
        </div>
      )}
    </section>
  );
}

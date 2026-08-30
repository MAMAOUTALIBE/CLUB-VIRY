"use client";

import { AlertTriangle, CheckCircle2, Loader2, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AdminCrud, imageUploadField } from "@/components/admin/AdminCrud";
import type { CrudField } from "@/components/admin/AdminCrud";

type TeamOption = { id: string; name: string };
type FormValues = Readonly<Record<string, string>>;
type AudienceRight = "PHOTOS" | "TRAINING_VIDEOS" | "LIVE_MATCHES";

const TYPES = [
  { value: "PHOTO", label: "Photo" },
  { value: "VIDEO", label: "Vidéo" }
];

const CONTENT_KINDS = [
  { value: "", label: "Galerie standard" },
  { value: "MATCH", label: "Match" },
  { value: "TRAINING", label: "Entraînement" }
];

const STATUS = [
  { value: "DRAFT", label: "Brouillon / dépublié" },
  { value: "PUBLISHED", label: "Publié" },
  { value: "ARCHIVED", label: "Archivé" }
];

const PLAYBACK_KINDS = [
  { value: "VIDEO", label: "Fichier ou flux vidéo" },
  { value: "BROADCAST_LINK", label: "Lien vers une plateforme de diffusion" }
];

const ACCESS_LEVELS = [
  { value: "PUBLIC", label: "Public" },
  { value: "FAMILY_PASS", label: "Pass Famille Média" }
];

function fmtDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function audienceRight(form: FormValues): AudienceRight | null {
  if (form.type === "PHOTO") return "PHOTOS";
  if (form.type === "VIDEO" && form.contentKind === "TRAINING") return "TRAINING_VIDEOS";
  if (form.type === "VIDEO" && form.contentKind === "MATCH") return "LIVE_MATCHES";
  return null;
}

function missingMediaFields(form: FormValues): string[] {
  const missing: string[] = [];
  const isPremium = form.accessLevel === "FAMILY_PASS";
  const isBroadcast = form.type === "VIDEO" && form.playbackKind === "BROADCAST_LINK";
  if (!form.title?.trim()) missing.push("titre");
  if (isPremium && !form.teamId) missing.push("équipe");
  if (form.type === "VIDEO" && isPremium && !form.contentKind) missing.push("contexte vidéo");
  if (!isPremium && !form.url?.trim()) missing.push("URL publique");
  if (isPremium && isBroadcast && !form.url?.trim()) missing.push("lien de diffusion");
  if (isPremium && !isBroadcast && !form.storagePath?.trim()) missing.push("fichier privé");
  return missing;
}

function MediaAudiencePreview({ form }: { form: FormValues }) {
  const [result, setResult] = useState<{ key: string; state: "loading" | "ready" | "error"; count: number }>({ key: "", state: "loading", count: 0 });
  const requestId = useRef(0);
  const right = audienceRight(form);
  const eligible = form.accessLevel === "FAMILY_PASS" && Boolean(form.teamId) && Boolean(right);
  const queryKey = eligible ? `${form.teamId}:${right}` : "";

  useEffect(() => {
    requestId.current += 1;
    const currentRequest = requestId.current;
    if (!eligible || !right) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setResult({ key: queryKey, state: "loading", count: 0 });
      const params = new URLSearchParams({ teamId: form.teamId, right });
      try {
        const response = await fetch(`/api/admin/media/audience-preview?${params.toString()}`, {
          credentials: "same-origin",
          signal: controller.signal
        });
        const json = await response.json().catch(() => null);
        if (currentRequest !== requestId.current) return;
        if (!response.ok || !json?.ok || typeof json.data?.count !== "number") throw new Error("Aperçu indisponible.");
        setResult({ key: queryKey, state: "ready", count: json.data.count });
      } catch (cause) {
        if (controller.signal.aborted || currentRequest !== requestId.current) return;
        setResult({ key: queryKey, state: "error", count: 0 });
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [eligible, form.teamId, queryKey, right]);

  if (!eligible) return <p className="mt-2 text-sm font-semibold text-slate-500">Choisissez un accès Pass Famille, une équipe et un contexte pour calculer l’audience.</p>;
  if (result.key !== queryKey || result.state === "loading") return <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-slate-600" aria-live="polite"><Loader2 className="animate-spin" size={16} /> Calcul de l’audience…</p>;
  if (result.state === "error") return <p className="mt-2 text-sm font-bold text-red-700" role="alert">Audience indisponible. Réessayez après vérification de l’équipe.</p>;
  return <p className="mt-2 text-sm font-black text-[#002f1d]" aria-live="polite">{result.count} famille{result.count > 1 ? "s" : ""} actuellement éligible{result.count > 1 ? "s" : ""}.</p>;
}

function MediaFormSummary({ form, teams }: { form: FormValues; teams: TeamOption[] }) {
  const missing = missingMediaFields(form);
  const team = teams.find((item) => item.id === form.teamId)?.name ?? (form.teamId ? "Équipe introuvable" : "Aucune");
  const context = form.type === "PHOTO" ? "Photo" : `Vidéo · ${CONTENT_KINDS.find((item) => item.value === form.contentKind)?.label ?? "Contexte manquant"}`;

  return (
    <div className="mt-6 grid gap-5 border-t border-slate-200 pt-5 lg:grid-cols-2">
      <section aria-labelledby="media-summary-title">
        <h4 className="text-sm font-black uppercase text-[#002f1d]" id="media-summary-title">Récapitulatif avant enregistrement</h4>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-xs font-black uppercase text-slate-500">Accès</dt><dd className="mt-1 font-bold text-slate-900">{form.accessLevel === "FAMILY_PASS" ? "Pass Famille Média" : "Public"}</dd></div>
          <div><dt className="text-xs font-black uppercase text-slate-500">Équipe</dt><dd className="mt-1 break-words font-bold text-slate-900">{team}</dd></div>
          <div><dt className="text-xs font-black uppercase text-slate-500">Type et contexte</dt><dd className="mt-1 font-bold text-slate-900">{context}</dd></div>
          <div><dt className="text-xs font-black uppercase text-slate-500">Publication</dt><dd className="mt-1 font-bold text-slate-900">{STATUS.find((item) => item.value === form.status)?.label ?? "Brouillon / dépublié"}</dd></div>
        </dl>
        {missing.length ? <p className="mt-3 flex items-start gap-2 text-sm font-bold text-amber-800"><AlertTriangle className="mt-0.5 shrink-0" size={17} /> Éléments manquants : {missing.join(", ")}.</p> : <p className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 size={17} /> Configuration complète.</p>}
      </section>
      <section className="border-t border-slate-200 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0" aria-labelledby="media-audience-title">
        <h4 className="flex items-center gap-2 text-sm font-black uppercase text-[#002f1d]" id="media-audience-title"><Users size={17} /> Audience actuelle</h4>
        <MediaAudiencePreview form={form} />
      </section>
    </div>
  );
}

export function MediaAssetsAdmin() {
  const [teams, setTeams] = useState<TeamOption[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const res = await fetch("/api/admin/teams?limit=200", { credentials: "same-origin" }).catch(() => null);
      const json = res ? await res.json().catch(() => null) : null;
      if (json?.ok && Array.isArray(json.data?.teams)) {
        setTeams(json.data.teams.map((team: { id: string; name: string }) => ({ id: team.id, name: team.name })));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const teamName = (id: unknown) => (typeof id === "string" ? teams.find((team) => team.id === id)?.name ?? "—" : "—");

  const fields: CrudField[] = [
    { name: "title", label: "Titre", required: true, fullWidth: true, placeholder: "Finale U13 — célébration" },
    { name: "type", label: "Type", type: "select", options: TYPES },
    { name: "contentKind", label: "Contexte accueil", type: "select", rowKey: "content_kind", options: CONTENT_KINDS, emptyEditPayload: null, hiddenEditPayload: null, required: (form) => form.accessLevel === "FAMILY_PASS", visibleWhen: (form) => form.type === "VIDEO", help: "Match pour une rediffusion, Entraînement pour un direct ou une rediffusion. Galerie standard n'alimente pas la carte média de l'accueil." },
    { name: "playbackKind", label: "Mode de lecture", type: "select", rowKey: "playback_kind", options: PLAYBACK_KINDS, defaultValue: "VIDEO", hiddenEditPayload: "VIDEO", visibleWhen: (form) => form.type === "VIDEO" },
    { name: "accessLevel", label: "Accès", type: "select", rowKey: "access_level", options: ACCESS_LEVELS, defaultValue: "PUBLIC", help: "Pass Famille exige une équipe et contrôle chaque lecture côté serveur." },
    { name: "status", label: "Publication", type: "select", options: STATUS, defaultValue: "DRAFT" },
    {
      name: "teamId",
      label: "Équipe concernée (ciblage automatique)",
      type: "select",
      rowKey: "team_id",
      fullWidth: true,
      required: (form) => form.accessLevel === "FAMILY_PASS",
      options: [{ value: "", label: "— Aucune équipe —" }, ...teams.map((team) => ({ value: team.id, label: team.name }))],
      help: "Si une équipe est choisie, les familles concernées reçoivent automatiquement une notification « nouvelle photo/vidéo »."
    },
    { name: "url", label: "URL publique / lien de diffusion", type: "url", fullWidth: true, required: true, placeholder: "https://…", emptyEditPayload: null, hiddenEditPayload: null, visibleWhen: (form) => form.accessLevel === "PUBLIC" || (form.type === "VIDEO" && form.playbackKind === "BROADCAST_LINK"), help: "URL du média public ou lien externe de diffusion." },
    { ...imageUploadField({ targetField: "url", folder: "medias", label: "Téléverser une photo publique", help: "JPEG, PNG ou WebP, 5 Mo max." }), visibleWhen: (form: FormValues) => form.accessLevel === "PUBLIC" && form.type === "PHOTO" },
    { name: "storagePath", label: "Fichier privé", type: "hidden", rowKey: "storage_path", emptyEditPayload: null, hiddenEditPayload: null, visibleWhen: (form) => form.accessLevel === "FAMILY_PASS" && (form.type === "PHOTO" || form.playbackKind !== "BROADCAST_LINK") },
    {
      name: "privateMediaFile",
      label: "Téléverser le fichier Pass Famille",
      type: "file",
      fullWidth: true,
      uploadEndpoint: "/api/admin/media/private-upload",
      uploadTargetField: "storagePath",
      uploadResponseKey: "storagePath",
      required: true,
      uploadExtraFieldSources: { teamId: "teamId" },
      accept: "image/jpeg,image/png,image/webp,video/mp4,video/webm",
      maxBytes: 100 * 1024 * 1024,
      uploadSuccessMessage: "Fichier privé téléversé. Enregistrez la fiche pour le rattacher au média.",
      help: "Choisissez d'abord l'équipe. JPEG, PNG, WebP, MP4 ou WebM, 100 Mo max.",
      visibleWhen: (form) => form.accessLevel === "FAMILY_PASS" && (form.type === "PHOTO" || form.playbackKind !== "BROADCAST_LINK")
    },
    { name: "thumbnailUrl", label: "Image de couverture (URL)", type: "url", rowKey: "thumbnail_url", placeholder: "https://…", emptyEditPayload: null, hiddenEditPayload: null, visibleWhen: (form) => form.type === "VIDEO" },
    { ...imageUploadField({ targetField: "thumbnailUrl", folder: "medias", label: "…ou téléverser une couverture" }), visibleWhen: (form: FormValues) => form.type === "VIDEO" },
    { name: "altText", label: "Texte alternatif (accessibilité)", rowKey: "alt_text", fullWidth: true, placeholder: "Description de l'image" },
    { name: "isFeatured", label: "Mis en avant", type: "boolean", rowKey: "is_featured" },
    { name: "isLive", label: "Direct entraînement actif", type: "boolean", rowKey: "is_live", defaultValue: "false", hiddenEditPayload: false, visibleWhen: (form) => form.type === "VIDEO" && form.contentKind === "TRAINING" && form.playbackKind === "BROADCAST_LINK", help: "Activez uniquement pendant un direct d'entraînement. Les matchs en direct se pilotent dans le module Calendrier." },
    { name: "startsAt", label: "Début d'affichage", type: "datetime", rowKey: "starts_at", emptyEditPayload: null },
    { name: "endsAt", label: "Fin d'affichage", type: "datetime", rowKey: "ends_at", emptyEditPayload: null },
    { name: "publishedAt", label: "Date de publication", type: "datetime", rowKey: "published_at", emptyEditPayload: null }
  ];

  return (
    <AdminCrud
      title="Médiathèque — photos & vidéos"
      description="Gérez les médias du club. En rattachant un média à une équipe, les familles concernées sont notifiées automatiquement (CRM intelligent)."
      listEndpoint="/api/admin/media"
      endpoint="/api/admin/media/assets"
      listKey="assets"
      itemKey="asset"
      newLabel="Nouveau média"
      allowDelete
      allowBulkDelete
      rowLabel={(r) => `« ${String(r.title ?? "ce média")} »`}
      renderMobileRow={(row) => (
        <div className="min-w-0">
          <p className="break-words font-black text-[#002f1d]">{String(row.title ?? "Média sans titre")}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-black uppercase">
            <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">{row.type === "VIDEO" ? "Vidéo" : "Photo"}</span>
            <span className="rounded bg-[#002f1d]/10 px-2 py-1 text-[#002f1d]">{row.access_level === "FAMILY_PASS" ? "Pass Famille" : "Public"}</span>
            <span className="rounded bg-[#f7c600]/20 px-2 py-1 text-[#553f00]">{STATUS.find((status) => status.value === row.status)?.label ?? String(row.status ?? "Brouillon")}</span>
          </div>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-xs font-black uppercase text-slate-500">Équipe</dt><dd className="mt-0.5 break-words font-bold text-slate-800">{teamName(row.team_id)}</dd></div>
            <div><dt className="text-xs font-black uppercase text-slate-500">Contexte</dt><dd className="mt-0.5 font-bold text-slate-800">{CONTENT_KINDS.find((kind) => kind.value === row.content_kind)?.label ?? "Galerie standard"}</dd></div>
          </dl>
        </div>
      )}
      renderFormSupplement={({ form }) => <MediaFormSummary form={form} teams={teams} />}
      validateForm={(form) => {
        const missing = missingMediaFields(form);
        return missing.length > 0 ? `Complétez avant d’enregistrer : ${missing.join(", ")}.` : null;
      }}
      fields={fields}
      columns={[
        { label: "Titre", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.title ?? "—")}</span> },
        { label: "Type", render: (r) => (r.type === "VIDEO" ? "Vidéo" : "Photo") },
        { label: "Contexte", render: (r) => CONTENT_KINDS.find((kind) => kind.value === r.content_kind)?.label ?? "Galerie standard" },
        { label: "Accès", render: (r) => r.access_level === "FAMILY_PASS" ? <span className="font-black text-[#07542f]">Pass Famille</span> : "Public" },
        { label: "Publication", render: (r) => STATUS.find((status) => status.value === r.status)?.label ?? String(r.status ?? "—") },
        { label: "Équipe", render: (r) => teamName(r.team_id) },
        { label: "En avant", render: (r) => (r.is_featured ? <span className="font-black text-emerald-700">✓</span> : <span className="text-slate-400">—</span>) },
        { label: "Direct", render: (r) => (r.is_live ? <span className="font-black text-red-600">ACTIF</span> : <span className="text-slate-400">—</span>) },
        { label: "Publié le", render: (r) => fmtDate(r.published_at) }
      ]}
    />
  );
}

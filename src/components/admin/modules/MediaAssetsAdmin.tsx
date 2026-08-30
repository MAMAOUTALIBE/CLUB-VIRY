"use client";

import { useEffect, useState } from "react";

import { AdminCrud, imageUploadField } from "@/components/admin/AdminCrud";
import type { CrudField } from "@/components/admin/AdminCrud";

type TeamOption = { id: string; name: string };

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
    { name: "contentKind", label: "Contexte accueil", type: "select", rowKey: "content_kind", options: CONTENT_KINDS, emptyEditPayload: null, help: "Match pour une rediffusion, Entraînement pour un direct ou une rediffusion. Galerie standard n'alimente pas la carte média de l'accueil." },
    { name: "playbackKind", label: "Mode de lecture", type: "select", rowKey: "playback_kind", options: PLAYBACK_KINDS, defaultValue: "VIDEO" },
    { name: "accessLevel", label: "Accès", type: "select", rowKey: "access_level", options: ACCESS_LEVELS, defaultValue: "PUBLIC", help: "Pass Famille exige une équipe et contrôle chaque lecture côté serveur." },
    { name: "status", label: "Publication", type: "select", options: STATUS, defaultValue: "DRAFT" },
    {
      name: "teamId",
      label: "Équipe concernée (ciblage automatique)",
      type: "select",
      rowKey: "team_id",
      fullWidth: true,
      options: [{ value: "", label: "— Aucune équipe —" }, ...teams.map((team) => ({ value: team.id, label: team.name }))],
      help: "Si une équipe est choisie, les familles concernées reçoivent automatiquement une notification « nouvelle photo/vidéo »."
    },
    { name: "url", label: "URL publique ou lien de diffusion", type: "url", fullWidth: true, placeholder: "https://…", emptyEditPayload: null, help: "Obligatoire pour un média public ou un lien de diffusion. Laissez vide pour un fichier privé Pass Famille." },
    imageUploadField({ targetField: "url", folder: "medias", label: "Téléverser une photo publique", help: "JPEG, PNG ou WebP, 5 Mo max. Réservé aux contenus marqués Public." }),
    { name: "storagePath", label: "Fichier privé", type: "hidden", rowKey: "storage_path", emptyEditPayload: null },
    {
      name: "privateMediaFile",
      label: "Téléverser le fichier Pass Famille",
      type: "file",
      fullWidth: true,
      uploadEndpoint: "/api/admin/media/private-upload",
      uploadTargetField: "storagePath",
      uploadResponseKey: "storagePath",
      uploadExtraFieldSources: { teamId: "teamId" },
      accept: "image/jpeg,image/png,image/webp,video/mp4,video/webm",
      maxBytes: 100 * 1024 * 1024,
      uploadSuccessMessage: "Fichier privé téléversé. Enregistrez la fiche pour le rattacher au média.",
      help: "Pass Famille uniquement. Choisissez d'abord l'équipe. JPEG, PNG, WebP, MP4 ou WebM, 100 Mo max."
    },
    { name: "thumbnailUrl", label: "Image de couverture (URL)", type: "url", rowKey: "thumbnail_url", placeholder: "https://…", emptyEditPayload: null },
    imageUploadField({ targetField: "thumbnailUrl", folder: "medias", label: "…ou téléverser une couverture" }),
    { name: "altText", label: "Texte alternatif (accessibilité)", rowKey: "alt_text", fullWidth: true, placeholder: "Description de l'image" },
    { name: "isFeatured", label: "Mis en avant", type: "boolean", rowKey: "is_featured" },
    { name: "isLive", label: "Direct entraînement actif", type: "boolean", rowKey: "is_live", defaultValue: "false", help: "Activez uniquement pendant un direct d'entraînement. Les matchs en direct se pilotent dans le module Calendrier." },
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

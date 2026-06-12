"use client";

import { AdminCrud } from "@/components/admin/AdminCrud";

function fmtDateTime(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

const LOCATION = [
  { value: "HOME", label: "Domicile" },
  { value: "AWAY", label: "Extérieur" },
  { value: "NEUTRAL", label: "Terrain neutre" }
];

const MATCH_STATUS = [
  { value: "SCHEDULED", label: "Programmé" },
  { value: "LIVE", label: "En direct" },
  { value: "FINISHED", label: "Terminé" },
  { value: "POSTPONED", label: "Reporté" },
  { value: "CANCELLED", label: "Annulé" }
];

const EVENT_TYPE = [
  { value: "TRAINING", label: "Entraînement" },
  { value: "MEETING", label: "Réunion" },
  { value: "TOURNAMENT", label: "Tournoi" },
  { value: "CLUB_EVENT", label: "Événement club" },
  { value: "DEADLINE", label: "Échéance" },
  { value: "OTHER", label: "Autre" }
];

const VISIBILITY = [
  { value: "PUBLIC", label: "Public (visible sur le site)" },
  { value: "MEMBERS", label: "Membres" },
  { value: "STAFF", label: "Staff" }
];

export function CalendarAdmin() {
  return (
    <div className="grid gap-6">
      <AdminCrud
        title="Matchs"
        description="Programmez les matchs et saisissez les résultats. Ils apparaissent sur le calendrier et l'accueil du site."
        endpoint="/api/admin/matches"
        listKey="matches"
        itemKey="match"
        newLabel="Nouveau match"
        fields={[
          { name: "opponentName", label: "Adversaire", required: true, rowKey: "opponent_name", placeholder: "FC Massy" },
          { name: "location", label: "Lieu", type: "select", options: LOCATION },
          { name: "startsAt", label: "Date et heure", type: "datetime", required: true, rowKey: "starts_at" },
          { name: "venue", label: "Stade", placeholder: "Stade Henri Longuet" },
          { name: "competition", label: "Compétition", placeholder: "Championnat D1" },
          { name: "status", label: "Statut", type: "select", options: MATCH_STATUS },
          { name: "homeScore", label: "Score domicile", type: "number", rowKey: "home_score" },
          { name: "awayScore", label: "Score extérieur", type: "number", rowKey: "away_score" },
          { name: "notes", label: "Notes", type: "textarea" }
        ]}
        columns={[
          { label: "Adversaire", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.opponent_name ?? "—")}</span> },
          { label: "Date", render: (r) => fmtDateTime(r.starts_at) },
          { label: "Lieu", render: (r) => LOCATION.find((l) => l.value === r.location)?.label ?? String(r.location ?? "—") },
          { label: "Statut", render: (r) => MATCH_STATUS.find((s) => s.value === r.status)?.label ?? String(r.status ?? "—") },
          { label: "Score", render: (r) => (r.home_score != null && r.away_score != null ? `${r.home_score} - ${r.away_score}` : "—") }
        ]}
      />

      <AdminCrud
        title="Événements"
        description="Tournois, stages, réunions, échéances… Les événements en visibilité « Public » apparaissent sur le calendrier du site."
        endpoint="/api/admin/calendar/events"
        listKey="events"
        itemKey="event"
        newLabel="Nouvel événement"
        fields={[
          { name: "title", label: "Titre", required: true, fullWidth: true, placeholder: "Tournoi U11" },
          { name: "type", label: "Type", type: "select", options: EVENT_TYPE },
          { name: "startsAt", label: "Début", type: "datetime", required: true, rowKey: "starts_at" },
          { name: "endsAt", label: "Fin", type: "datetime", rowKey: "ends_at" },
          { name: "venue", label: "Lieu", placeholder: "Stade Henri Longuet" },
          { name: "visibility", label: "Visibilité", type: "select", options: VISIBILITY },
          { name: "description", label: "Description", type: "textarea" }
        ]}
        columns={[
          { label: "Titre", render: (r) => <span className="font-bold text-[#002f1d]">{String(r.title ?? "—")}</span> },
          { label: "Type", render: (r) => EVENT_TYPE.find((t) => t.value === r.type)?.label ?? String(r.type ?? "—") },
          { label: "Début", render: (r) => fmtDateTime(r.starts_at) },
          { label: "Visibilité", render: (r) => VISIBILITY.find((v) => v.value === r.visibility)?.label ?? String(r.visibility ?? "—") }
        ]}
      />
    </div>
  );
}

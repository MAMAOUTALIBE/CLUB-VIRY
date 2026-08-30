import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { toPublicEvent, toPublicMatch } from "../src/lib/api/public-projection.ts";

const teamsSource = await readFile(new URL("../src/lib/db/teams.ts", import.meta.url), "utf8");
const calendarSource = await readFile(new URL("../src/lib/db/calendar.ts", import.meta.url), "utf8");

function functionSource(source, name) {
  const start = source.indexOf(`async function ${name}`);
  assert.notEqual(start, -1, `${name} doit exister`);
  const next = source.indexOf("\nexport async function ", start + 1);
  return source.slice(start, next === -1 ? undefined : next);
}

/**
 * Le CRM peut basculer un match ou un evenement en MEMBERS / STAFF. Toute lecture
 * servie a un visiteur anonyme doit donc filtrer sur visibility = PUBLIC. La fiche
 * publique d'equipe l'oubliait et annonçait le « prochain match » d'un match prive.
 */
const PUBLIC_READERS = [
  [teamsSource, "getPublicTeamRosterBySlug"],
  [teamsSource, "listMatches"],
  [calendarSource, "listPublicCalendar"],
  [calendarSource, "listPublicHomeMatches"],
  [calendarSource, "getPublicMatchById"]
];

for (const [source, name] of PUBLIC_READERS) {
  test(`${name} ne sert que les elements marques PUBLIC`, () => {
    const body = functionSource(source, name);
    assert.match(body, /\.eq\("visibility", "PUBLIC"\)/, `${name} doit filtrer sur visibility`);
    assert.match(body, /\.is\("deleted_at", null\)/, `${name} doit exclure les elements archives`);
  });
}

// --- Projection publique ----------------------------------------------------

const INTERNAL_MATCH_FIELDS = ["notes", "educator_id", "season_id", "visibility", "deleted_at", "deleted_by", "created_at", "updated_at"];
const INTERNAL_EVENT_FIELDS = ["created_by", "educator_id", "visibility", "deleted_at", "deleted_by", "created_at", "updated_at"];

test("un match public ne transporte aucun champ de travail interne", () => {
  const row = {
    id: "m1", team_id: null, season_id: "s1", title: null, category_id: null, group_label: null, pitch_code: null,
    educator_id: "profil-interne", opponent_name: "Adversaire", opponent_logo_url: null, location: "HOME",
    starts_at: "2026-09-05T13:00:00+00:00", ends_at: null, venue: null, competition: null, status: "SCHEDULED",
    home_score: null, away_score: null, live_minute: null, follow_url: null, access_level: "PUBLIC",
    notes: "Note interne a ne jamais publier", visibility: "PUBLIC",
    created_at: "2026-09-01T10:00:00+00:00", updated_at: "2026-09-01T10:00:00+00:00",
    deleted_at: null, deleted_by: null
  };

  const projected = toPublicMatch(row);
  for (const field of INTERNAL_MATCH_FIELDS) {
    assert.ok(!(field in projected), `le champ interne ${field} ne doit pas etre expose`);
  }
  assert.equal(projected.opponent_name, "Adversaire");
  assert.equal(projected.starts_at, row.starts_at);
});

test("un evenement public ne transporte aucun champ de travail interne", () => {
  const row = {
    id: "e1", team_id: null, category_id: null, group_label: "A", pitch_code: "T1", opponent_name: null,
    educator_id: "profil-interne", title: "Entrainement", type: "TRAINING",
    starts_at: "2026-09-05T16:00:00+00:00", ends_at: null, venue: null, description: null,
    visibility: "PUBLIC", status: "SCHEDULED", is_featured: false, created_by: "profil-interne",
    created_at: "2026-09-01T10:00:00+00:00", updated_at: "2026-09-01T10:00:00+00:00",
    deleted_at: null, deleted_by: null
  };

  const projected = toPublicEvent(row);
  for (const field of INTERNAL_EVENT_FIELDS) {
    assert.ok(!(field in projected), `le champ interne ${field} ne doit pas etre expose`);
  }
  assert.equal(projected.title, "Entrainement");
  assert.equal(projected.pitch_code, "T1");
});

test("les routes publiques calendrier et matchs passent par la projection", async () => {
  for (const route of ["matches", "calendar"]) {
    const source = await readFile(new URL(`../src/app/api/${route}/route.ts`, import.meta.url), "utf8");
    assert.match(source, /public-projection/, `/api/${route} doit projeter sa reponse`);
    assert.doesNotMatch(source, /return jsonOk\(calendar\);|return jsonOk\(\{ matches \}\);/, `/api/${route} ne doit pas renvoyer la ligne brute`);
  }
});

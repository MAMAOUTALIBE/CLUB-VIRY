import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  countFamilyMediaLibrary,
  filterFamilyMediaLibrary,
  sortFamilyMediaLibrary
} from "../src/lib/family-media-library.ts";

function media(overrides) {
  return {
    id: "media-1",
    team_id: "team-u16",
    team_name: "U16",
    type: "PHOTO",
    content_kind: "MATCH",
    is_live: false,
    published_at: "2026-08-28T10:00:00.000Z",
    ...overrides
  };
}

const resources = [
  media({ id: "photo-u16", published_at: "2026-08-30T10:00:00.000Z" }),
  media({ id: "match-u16", type: "VIDEO", content_kind: "MATCH", published_at: "2026-08-29T10:00:00.000Z" }),
  media({ id: "training-u16", type: "VIDEO", content_kind: "TRAINING", published_at: "2026-08-28T10:00:00.000Z" }),
  media({ id: "live-training-u18", team_id: "team-u18", team_name: "U18", type: "VIDEO", content_kind: "TRAINING", is_live: true, published_at: "2026-08-20T10:00:00.000Z" }),
  media({ id: "photo-u18", team_id: "team-u18", team_name: "U18", published_at: "2026-08-31T10:00:00.000Z" })
];

test("les directs entraînement passent avant toutes les archives puis la date décroît", () => {
  assert.deepEqual(sortFamilyMediaLibrary(resources).map((item) => item.id), [
    "live-training-u18",
    "photo-u18",
    "photo-u16",
    "match-u16",
    "training-u16"
  ]);
});

test("les compteurs reflètent les ressources réellement autorisées et l'équipe choisie", () => {
  assert.deepEqual(countFamilyMediaLibrary(resources, null), {
    ALL: 5,
    PHOTOS: 2,
    MATCH_VIDEOS: 1,
    TRAINING: 2
  });
  assert.deepEqual(countFamilyMediaLibrary(resources, "team-u16"), {
    ALL: 3,
    PHOTOS: 1,
    MATCH_VIDEOS: 1,
    TRAINING: 1
  });
});

test("les filtres équipe et catégorie se combinent sans perdre la priorité du direct", () => {
  assert.deepEqual(
    filterFamilyMediaLibrary(resources, { category: "TRAINING", teamId: null }).map((item) => item.id),
    ["live-training-u18", "training-u16"]
  );
  assert.deepEqual(
    filterFamilyMediaLibrary(resources, { category: "PHOTOS", teamId: "team-u18" }).map((item) => item.id),
    ["photo-u18"]
  );
  assert.deepEqual(
    filterFamilyMediaLibrary(resources, { category: "ALL", teamId: null }).map((item) => item.id),
    sortFamilyMediaLibrary(resources).map((item) => item.id)
  );
});

test("la projection famille ajoute uniquement le vrai nom d'équipe après autorisation", async () => {
  const database = await readFile(new URL("../src/lib/db/family-media-access.ts", import.meta.url), "utf8");
  const route = await readFile(new URL("../src/app/api/family/media/route.ts", import.meta.url), "utf8");

  assert.match(database, /team_name: string/);
  assert.match(database, /const authorizedAssets = assets\.filter/);
  assert.match(database, /authorizedAssets\.map[\s\S]*authorizedTeamIds/);
  assert.match(database, /from\("teams"\)[\s\S]*select\("id,name"\)[\s\S]*\.in\("id", authorizedTeamIds\)/);
  assert.match(database, /team_name: teamName, access_path:/);
  assert.match(database, /\.order\("is_live", \{ ascending: false \}\)[\s\S]*\.order\("published_at", \{ ascending: false \}\)/);
  assert.doesNotMatch(database.slice(database.indexOf("export type FamilyMediaSummary"), database.indexOf("export type FamilyMediaPassOverview")), /storage_path|follow_url|\| "url"/);
  assert.match(route, /jsonOk\(\{ assets: result\.assets \}\)/);
  assert.doesNotMatch(route, /storage_path|follow_url/);
});

test("l'espace famille sépare Pass, directs et bibliothèque avec filtres accessibles", async () => {
  const component = await readFile(new URL("../src/components/member/MemberSpace.tsx", import.meta.url), "utf8");
  const passIndex = component.indexOf("Pass Famille Média");
  const liveIndex = component.indexOf("family-live-matches-title");
  const libraryIndex = component.indexOf("family-media-library-title");

  assert.ok(passIndex >= 0 && liveIndex > passIndex && libraryIndex > liveIndex);
  assert.match(component, /MEDIA_CATEGORIES[\s\S]*Tout[\s\S]*Photos[\s\S]*Vidéos de match[\s\S]*Entraînements/);
  assert.match(component, /mediaCounts\[category\.value\]/);
  assert.match(component, /mediaTeams\.length > 1/);
  assert.match(component, /const mediaTeamFilterId = useId\(\)/);
  assert.match(component, /htmlFor=\{mediaTeamFilterId\}[\s\S]*id=\{mediaTeamFilterId\}/);
  assert.match(component, /aria-pressed=\{selected\}/);
  assert.match(component, /setMediaCategory\("ALL"\); setMediaTeamId\(null\)/);
  assert.match(component, /visibleProtectedMedia\.map/);
  assert.match(component, /media\.team_name/);
  assert.match(component, /Aucune ressource « \{selectedMediaCategoryLabel\} »/);
  assert.match(component, /sm:grid-cols-2 xl:grid-cols-3/);
  assert.match(component, /break-words/);
  assert.doesNotMatch(component, /media\.url|media\.storage_path|follow_url/);
  assert.match(component, /openProtectedBroadcast\(media\)/);
  assert.match(component, /openAuthorizedLink\(media\.access_path/);
  assert.match(component, /href=\{`\/api\/family\/media\/\$\{media\.id\}\/file\?download=1`\}/);
});

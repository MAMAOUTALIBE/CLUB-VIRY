import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateAdminMediaAssetPayload } from "../src/lib/api/validation.ts";
import { mergeCurrentMediaAssetWithPatch } from "../src/lib/media-asset-state.ts";

const TEAM_ID = "33333333-3333-4333-8333-333333333333";

function current(overrides = {}) {
  return {
    album_id: null,
    team_id: TEAM_ID,
    type: "PHOTO",
    content_kind: null,
    playback_kind: "VIDEO",
    access_level: "FAMILY_PASS",
    status: "PUBLISHED",
    title: "Photo U13",
    url: null,
    storage_path: `${TEAM_ID}/photo.webp`,
    thumbnail_url: null,
    alt_text: "Photo du match",
    is_featured: false,
    is_live: false,
    starts_at: null,
    ends_at: null,
    published_at: "2026-08-30T10:00:00.000Z",
    ...overrides
  };
}

function finalValidation(asset, patch) {
  const merged = mergeCurrentMediaAssetWithPatch(asset, patch);
  assert.notEqual(merged, null);
  return validateAdminMediaAssetPayload(merged);
}

function issueFields(result) {
  assert.equal(result.ok, false);
  return result.issues.map((issue) => issue.field);
}

test("PATCH refuse de retirer équipe et fichier d'une photo Pass Famille", () => {
  const fields = issueFields(finalValidation(current(), { teamId: null, storagePath: null }));
  assert.ok(fields.includes("teamId"));
  assert.ok(fields.includes("storagePath"));
});

test("PATCH refuse de retirer le fichier d'une vidéo privée Pass Famille", () => {
  const fields = issueFields(finalValidation(current({ type: "VIDEO", content_kind: "TRAINING", storage_path: `${TEAM_ID}/video.mp4` }), { storagePath: null }));
  assert.ok(fields.includes("storagePath"));
});

test("PATCH refuse de retirer l'URL d'un lien de diffusion Pass Famille", () => {
  const fields = issueFields(finalValidation(current({ type: "VIDEO", content_kind: "MATCH", playback_kind: "BROADCAST_LINK", storage_path: null, url: "https://video.example/live" }), { url: null }));
  assert.ok(fields.includes("url"));
});

test("PATCH accepte une transition complète du lien de diffusion vers un fichier privé", () => {
  const result = finalValidation(
    current({ type: "VIDEO", content_kind: "MATCH", playback_kind: "BROADCAST_LINK", storage_path: null, url: "https://video.example/live" }),
    { playbackKind: "VIDEO", storagePath: `${TEAM_ID}/replay.mp4` }
  );
  assert.equal(result.ok, true);
  assert.equal(result.data.storagePath, `${TEAM_ID}/replay.mp4`);
  assert.equal(result.data.url, null);
});

test("un asset absent produit un état final absent pour la réponse 404", () => {
  assert.equal(mergeCurrentMediaAssetWithPatch(null, { title: "Introuvable" }), null);
});

test("les PATCH historiques et publics restent possibles", () => {
  const publicPhoto = current({ team_id: null, access_level: "PUBLIC", storage_path: null, url: "https://club.example/photo.webp" });
  const result = finalValidation(publicPhoto, { title: "Titre corrigé", isFeatured: true });
  assert.equal(result.ok, true);
  assert.equal(result.data.title, "Titre corrigé");
  assert.equal(result.data.url, "https://club.example/photo.webp");
  assert.equal(result.data.storagePath, null);
});

test("la route charge puis valide l'état final et renvoie deux 404 propres", async () => {
  const route = await readFile(new URL("../src/app/api/admin/media/assets/[id]/route.ts", import.meta.url), "utf8");
  assert.match(route, /getMediaAssetForAdminById\(id\)/);
  assert.match(route, /mergeCurrentMediaAssetWithPatch\(current, payload\.data\)/);
  assert.match(route, /validateAdminMediaAssetPayload\(finalInput\)/);
  assert.match(route, /updateMediaAsset\(id, finalPayload\.data\)/);
  assert.match(route, /if \(!finalInput\)[\s\S]*404, "NOT_FOUND"/);
  assert.match(route, /if \(!asset\)[\s\S]*404, "NOT_FOUND"/);
});

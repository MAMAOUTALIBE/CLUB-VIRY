import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  evaluateFamilyMediaAccess,
  isFamilyMediaPassCurrent,
  requiredRightForMedia
} from "../src/lib/family-media-entitlement.ts";
import { toPublicMatch } from "../src/lib/api/public-projection.ts";
import { selectMobileMatchFeed } from "../src/lib/mobile-match-feed.ts";
import {
  detectPrivateMediaMimeType,
  validateAdminMatchPayload,
  validateAdminMediaAssetPayload,
  validatePrivateMediaUploadPayload
} from "../src/lib/api/validation.ts";

const TEAM_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_TEAM_ID = "44444444-4444-4444-8444-444444444444";

const activePass = {
  id: "pass-1",
  familyId: "family-1",
  status: "ACTIVE",
  startsOn: "2026-08-01",
  endsOn: "2027-07-31",
  allowPhotos: true,
  allowTrainingVideos: false,
  allowLiveMatches: true,
  teamIds: [TEAM_ID]
};

const snapshot = {
  profileStatus: "ACTIVE",
  familyIds: ["family-1"],
  passes: [activePass]
};

test("autorisation famille : applique profil, famille, pass/date, droit puis équipe dans cet ordre", () => {
  assert.deepEqual(
    evaluateFamilyMediaAccess({ profileStatus: "SUSPENDED", familyIds: [], passes: [] }, { right: "PHOTOS", teamId: TEAM_ID, dateKey: "2026-09-01" }),
    { ok: false, reason: "PROFILE_INACTIVE" }
  );
  assert.deepEqual(
    evaluateFamilyMediaAccess({ profileStatus: "ACTIVE", familyIds: [], passes: [activePass] }, { right: "PHOTOS", teamId: TEAM_ID, dateKey: "2026-09-01" }),
    { ok: false, reason: "NO_FAMILY" }
  );
  assert.deepEqual(
    evaluateFamilyMediaAccess({ ...snapshot, passes: [{ ...activePass, status: "PENDING_REVIEW" }] }, { right: "PHOTOS", teamId: TEAM_ID, dateKey: "2026-09-01" }),
    { ok: false, reason: "NO_ACTIVE_PASS" }
  );
  assert.deepEqual(
    evaluateFamilyMediaAccess(snapshot, { right: "TRAINING_VIDEOS", teamId: OTHER_TEAM_ID, dateKey: "2026-09-01" }),
    { ok: false, reason: "RIGHT_DENIED" }
  );
  assert.deepEqual(
    evaluateFamilyMediaAccess(snapshot, { right: "PHOTOS", teamId: OTHER_TEAM_ID, dateKey: "2026-09-01" }),
    { ok: false, reason: "TEAM_DENIED" }
  );
  assert.deepEqual(
    evaluateFamilyMediaAccess(snapshot, { right: "LIVE_MATCHES", teamId: TEAM_ID, dateKey: "2026-09-01" }),
    { ok: true, passId: "pass-1", familyId: "family-1" }
  );
});

test("autorisation famille : les dates de début et fin sont inclusives", () => {
  assert.equal(evaluateFamilyMediaAccess(snapshot, { right: "PHOTOS", teamId: TEAM_ID, dateKey: "2026-08-01" }).ok, true);
  assert.equal(evaluateFamilyMediaAccess(snapshot, { right: "PHOTOS", teamId: TEAM_ID, dateKey: "2027-07-31" }).ok, true);
  assert.equal(evaluateFamilyMediaAccess(snapshot, { right: "PHOTOS", teamId: TEAM_ID, dateKey: "2027-08-01" }).ok, false);
});

test("l'état visuel d'un pass actif respecte également ses dates", () => {
  assert.equal(isFamilyMediaPassCurrent(activePass, "2026-08-01"), true);
  assert.equal(isFamilyMediaPassCurrent(activePass, "2027-07-31"), true);
  assert.equal(isFamilyMediaPassCurrent(activePass, "2026-07-31"), false);
  assert.equal(isFamilyMediaPassCurrent(activePass, "2027-08-01"), false);
  assert.equal(isFamilyMediaPassCurrent({ ...activePass, status: "SUSPENDED" }, "2026-09-01"), false);
});

test("chaque type de média demande le droit prévu", () => {
  assert.equal(requiredRightForMedia({ type: "PHOTO", content_kind: "MATCH" }), "PHOTOS");
  assert.equal(requiredRightForMedia({ type: "VIDEO", content_kind: "TRAINING" }), "TRAINING_VIDEOS");
  assert.equal(requiredRightForMedia({ type: "VIDEO", content_kind: "MATCH" }), "LIVE_MATCHES");
  assert.equal(requiredRightForMedia({ type: "VIDEO", content_kind: null }), null);
});

test("validation CRM : un média premium fichier exige équipe, contexte vidéo et storage_path", () => {
  const valid = validateAdminMediaAssetPayload({
    title: "Séance U16",
    teamId: TEAM_ID,
    type: "VIDEO",
    contentKind: "TRAINING",
    accessLevel: "FAMILY_PASS",
    storagePath: "u16/seance-2026-09-01.mp4"
  });
  assert.equal(valid.ok, true);
  assert.equal(valid.data.url, undefined);

  for (const payload of [
    { title: "Séance", type: "VIDEO", contentKind: "TRAINING", accessLevel: "FAMILY_PASS", storagePath: "a.mp4" },
    { title: "Séance", teamId: TEAM_ID, type: "VIDEO", accessLevel: "FAMILY_PASS", storagePath: "a.mp4" },
    { title: "Séance", teamId: TEAM_ID, type: "VIDEO", contentKind: "TRAINING", accessLevel: "FAMILY_PASS" },
    { title: "Séance", teamId: TEAM_ID, type: "VIDEO", contentKind: "TRAINING", accessLevel: "FAMILY_PASS", storagePath: "../secret.mp4" }
  ]) {
    assert.equal(validateAdminMediaAssetPayload(payload).ok, false);
  }
});

test("validation CRM : un broadcast premium garde une URL externe mais exige une équipe", () => {
  assert.equal(
    validateAdminMediaAssetPayload({
      title: "Direct entraînement",
      teamId: TEAM_ID,
      type: "VIDEO",
      contentKind: "TRAINING",
      playbackKind: "BROADCAST_LINK",
      accessLevel: "FAMILY_PASS",
      url: "https://video.example/live"
    }).ok,
    true
  );
});

test("validation CRM : un match premium exige une équipe", () => {
  const base = { opponentName: "Massy", startsAt: "2026-09-01T18:00:00.000Z", accessLevel: "FAMILY_PASS" };
  assert.equal(validateAdminMatchPayload(base).ok, false);
  assert.equal(validateAdminMatchPayload({ ...base, teamId: TEAM_ID }).ok, true);
});

test("upload CRM privé : accepte uniquement un type autorisé et une équipe UUID", () => {
  assert.equal(
    validatePrivateMediaUploadPayload({ fileName: "seance.mp4", contentType: "video/mp4", teamId: TEAM_ID }).ok,
    true
  );
  assert.equal(validatePrivateMediaUploadPayload({ fileName: "../x.svg", contentType: "image/svg+xml", teamId: TEAM_ID }).ok, false);
  assert.equal(validatePrivateMediaUploadPayload({ fileName: "x.mp4", contentType: "video/mp4", teamId: "bad" }).ok, false);
});

test("upload CRM privé : détecte le type réel par magic bytes", () => {
  assert.equal(detectPrivateMediaMimeType(Uint8Array.from([0xff, 0xd8, 0xff])), "image/jpeg");
  assert.equal(
    detectPrivateMediaMimeType(Uint8Array.from([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d])),
    "video/mp4"
  );
  assert.equal(detectPrivateMediaMimeType(Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3])), "video/webm");
  assert.equal(detectPrivateMediaMimeType(Uint8Array.from([0x3c, 0x73, 0x76, 0x67])), null);
});

test("aucune projection publique ne sort le lien d'un match FAMILY_PASS", () => {
  const premium = {
    id: "match-1", team_id: TEAM_ID, season_id: null, title: null, category_id: null, group_label: null, pitch_code: null,
    educator_id: null, opponent_name: "Massy", opponent_logo_url: null, location: "HOME", starts_at: "2026-09-01T18:00:00Z",
    ends_at: null, venue: null, competition: "Championnat", status: "LIVE", home_score: 1, away_score: 0, live_minute: 32,
    follow_url: "https://secret.example/live", access_level: "FAMILY_PASS", notes: null, visibility: "PUBLIC",
    created_at: "2026-09-01T10:00:00Z", updated_at: "2026-09-01T10:00:00Z"
  };
  assert.equal(toPublicMatch(premium).follow_url, null);

  const feed = selectMobileMatchFeed([{ ...premium, teams: { name: "U16" } }]);
  assert.equal(feed.live?.followUrl, null);
  assert.equal(feed.live?.minute, 32, "les métadonnées sportives restent publiques");
});

test("contrats backend : bucket privé, filtres publics, auth et refus 403", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20260830110000_family_media_access.sql", import.meta.url), "utf8");
  const content = await readFile(new URL("../src/lib/db/content.ts", import.meta.url), "utf8");
  const familyAccess = await readFile(new URL("../src/lib/db/family-media-access.ts", import.meta.url), "utf8");
  const projection = await readFile(new URL("../src/lib/api/public-projection.ts", import.meta.url), "utf8");
  const mobileFeed = await readFile(new URL("../src/lib/mobile-match-feed.ts", import.meta.url), "utf8");
  const privateUpload = await readFile(new URL("../src/app/api/admin/media/private-upload/route.ts", import.meta.url), "utf8");

  assert.match(migration, /'family-media',[\s\S]*false/);
  assert.match(migration, /104857600/);
  assert.match(migration, /access_level = 'PUBLIC' or public\.is_admin_role\(\)/);
  assert.match(migration, /revoke select on public\.matches from anon, authenticated/);
  assert.match(migration, /storage_path is not null/);
  assert.ok((content.match(/\.eq\("access_level", "PUBLIC"\)/g) ?? []).length >= 4);
  assert.match(projection, /match\.access_level === "FAMILY_PASS" \? null : match\.follow_url/);
  assert.match(mobileFeed, /row\.access_level === "FAMILY_PASS" \? null/);
  assert.match(familyAccess, /Date\.parse\(asset\.starts_at\) > now\.getTime\(\)/);
  assert.match(familyAccess, /Date\.parse\(asset\.ends_at\) <= now\.getTime\(\)/);
  assert.match(privateUpload, /getAdminContext\(request, "content:manage"\)/);
  assert.match(privateUpload, /isSameOriginRequest\(request\)/);
  assert.match(privateUpload, /request\.formData\(\)/);
  assert.match(privateUpload, /detectPrivateMediaMimeType/);
  assert.match(privateUpload, /\.upload\(storagePath, file,/);
  assert.match(privateUpload, /jsonOk\(\{ storagePath \}, 201\)/);
  assert.doesNotMatch(privateUpload, /createSignedUploadUrl|signedUrl|NEXT_PUBLIC_SUPABASE_URL/);
  assert.doesNotMatch(privateUpload, /getPublicUrl/);

  const fileRoute = await readFile(new URL("../src/app/api/family/media/[id]/file/route.ts", import.meta.url), "utf8");
  assert.match(fileRoute, /\/storage\/v1\/object\/\$\{FAMILY_MEDIA_BUCKET\}\/\$\{encodedPath\}/);
  assert.doesNotMatch(fileRoute, /object\/authenticated/);
  assert.match(fileRoute, /Range: range/);
  assert.match(fileRoute, /status: storageResponse\.status/);
  assert.match(fileRoute, /new Response\(storageResponse\.body/);
  assert.match(fileRoute, /"Content-Range": contentRange/);
  assert.match(fileRoute, /searchParams\.get\("download"\) === "1"/);
  assert.match(fileRoute, /attachment; filename\*=UTF-8''/);
  assert.match(fileRoute, /downloadFilename\(asset\.title, asset\.storage_path\)/);
  assert.doesNotMatch(fileRoute, /\.arrayBuffer\(\)|\.download\(/);

  const liveListRoute = await readFile(new URL("../src/app/api/family/matches/live/route.ts", import.meta.url), "utf8");
  const familyAccessSource = await readFile(new URL("../src/lib/db/family-media-access.ts", import.meta.url), "utf8");
  assert.match(liveListRoute, /listAuthorizedLiveMatches\(auth\.context\.user\.id\)/);
  assert.match(familyAccessSource, /\.eq\("status", "LIVE"\)/);
  assert.match(familyAccessSource, /\.eq\("access_level", "FAMILY_PASS"\)/);
  assert.match(familyAccessSource, /accessPath: `\/api\/family\/matches\/\$\{row\.id as string\}\/live`/);
  assert.doesNotMatch(liveListRoute, /followUrl|follow_url/);

  for (const path of [
    "../src/app/api/family/media/route.ts",
    "../src/app/api/family/media/[id]/access/route.ts",
    "../src/app/api/family/media/[id]/file/route.ts",
    "../src/app/api/family/matches/live/route.ts",
    "../src/app/api/family/matches/[id]/live/route.ts"
  ]) {
    const route = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(route, /getAuthContext\(request\)/, `${path} doit exiger une session`);
    assert.match(route, /jsonError\(403, "FORBIDDEN"/, `${path} doit refuser un compte non habilité`);
    assert.match(route, /private, no-store/, `${path} ne doit pas laisser un cache partager la réponse`);
  }
});

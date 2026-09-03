import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { selectHomeMediaCard } from "../src/lib/home-media-card.ts";

const now = new Date("2026-08-27T12:00:00.000Z");

const media = (overrides = {}) => ({
  id: "media-1",
  content_kind: "TRAINING",
  playback_kind: "VIDEO",
  status: "PUBLISHED",
  type: "VIDEO",
  title: "Séance U16",
  url: "https://cdn.example/video.mp4",
  thumbnail_url: "https://cdn.example/cover.jpg",
  is_live: false,
  starts_at: null,
  ends_at: null,
  published_at: "2026-08-27T10:00:00.000Z",
  created_at: "2026-08-27T10:00:00.000Z",
  ...overrides
});

const liveMatch = {
  id: "match-1",
  category: "Seniors A",
  competition: "Championnat",
  home: "Seniors A",
  away: "FC Massy",
  homeScore: 2,
  awayScore: 1,
  minute: 67,
  followUrl: "/matchs/match-1",
  homeLogoUrl: null,
  awayLogoUrl: null
};

test("priorité 1 : un vrai match en direct masque tous les médias", () => {
  const selected = selectHomeMediaCard(liveMatch, [media({ content_kind: "MATCH" }), media({ is_live: true })], now);
  assert.equal(selected?.kind, "LIVE_MATCH");
});

test("priorité 2 : la dernière vidéo de match publiée est utilisée", () => {
  const selected = selectHomeMediaCard(null, [
    media({ id: "older-match", content_kind: "MATCH", published_at: "2026-08-25T09:00:00.000Z" }),
    media({ id: "latest-match", content_kind: "MATCH", published_at: "2026-08-26T09:00:00.000Z" }),
    media({ id: "newer-training", published_at: "2026-08-27T09:00:00.000Z" })
  ], now);
  assert.equal(selected?.kind, "VIDEO");
  assert.equal(selected?.id, "latest-match");
});

test("priorité 3 : la dernière vidéo d'entraînement remplace les photos", () => {
  const selected = selectHomeMediaCard(null, [
    media({ id: "older-training", published_at: "2026-08-25T09:00:00.000Z" }),
    media({ id: "latest-training", published_at: "2026-08-26T09:00:00.000Z", teams: { name: "U16 A" } })
  ], now);
  assert.equal(selected?.kind, "VIDEO");
  assert.equal(selected?.id, "latest-training");
  assert.equal(selected?.contentKind, "TRAINING");
  assert.equal(selected?.teamName, "U16 A");
});

test("un média de match marqué direct ne simule pas un match LIVE du calendrier", () => {
  const selected = selectHomeMediaCard(null, [media({ content_kind: "MATCH", is_live: true })], now);
  assert.equal(selected, null);
});

test("un direct d'entraînement ne remplace pas une vidéo publiée", () => {
  const selected = selectHomeMediaCard(null, [media({ is_live: true, starts_at: "2026-08-27T11:00:00.000Z", ends_at: "2026-08-27T13:00:00.000Z" })], now);
  assert.equal(selected, null);
});

test("un match non publié, programmé ou expiré ne remplace jamais les photos", () => {
  const selected = selectHomeMediaCard(null, [
    media({ content_kind: "MATCH", status: "DRAFT" }),
    media({ content_kind: "MATCH", status: "ARCHIVED" }),
    media({ content_kind: "MATCH", published_at: "2026-08-28T10:00:00.000Z" }),
    media({ content_kind: "MATCH", starts_at: "2026-08-28T10:00:00.000Z" }),
    media({ content_kind: "MATCH", ends_at: "2026-08-27T11:59:59.000Z" }),
    media({ content_kind: "MATCH", url: "" }),
    media({ content_kind: "MATCH", type: "PHOTO" })
  ], now);
  assert.equal(selected, null);
});

test("le lecteur public reste en 16:9 avec la couverture CRM avant lecture", async () => {
  const player = await readFile(new URL("../src/components/HomeMediaPlayer.tsx", import.meta.url), "utf8");
  assert.match(player, /aspect-video/);
  assert.match(player, /<video[\s\S]*controls[\s\S]*playsInline[\s\S]*poster=\{coverImageUrl \?\? undefined\}/);
  assert.match(player, /href=\{videoUrl\}[\s\S]*target="_blank"[\s\S]*coverImageUrl/);
});

test("le CRM expose le cycle de publication et tous les champs de pilotage", async () => {
  const admin = await readFile(new URL("../src/components/admin/modules/MediaAssetsAdmin.tsx", import.meta.url), "utf8");
  const calendar = await readFile(new URL("../src/components/admin/modules/CalendarAdmin.tsx", import.meta.url), "utf8");
  const migration = await readFile(new URL("../supabase/migrations/20260827120000_home_media_crm.sql", import.meta.url), "utf8");

  for (const field of ["contentKind", "playbackKind", "status", "url", "thumbnailUrl", "isLive", "startsAt", "endsAt", "publishedAt"]) {
    assert.match(admin, new RegExp(`name: "${field}"`));
  }
  assert.match(admin, /DRAFT[\s\S]*PUBLISHED[\s\S]*ARCHIVED/);
  assert.match(calendar, /name="followUrl"/);
  assert.match(migration, /content_kind[\s\S]*playback_kind[\s\S]*status public\.publication_status[\s\S]*is_live[\s\S]*starts_at[\s\S]*ends_at/);
  assert.match(migration, /add column if not exists follow_url/);
});

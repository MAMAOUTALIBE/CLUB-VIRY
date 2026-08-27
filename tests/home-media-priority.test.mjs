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

test("priorité 2 : la dernière vidéo de match passe avant un direct entraînement", () => {
  const selected = selectHomeMediaCard(null, [
    media({ id: "training-live", is_live: true }),
    media({ id: "match-video", content_kind: "MATCH", published_at: "2026-08-26T09:00:00.000Z" })
  ], now);
  assert.equal(selected?.kind, "VIDEO");
  assert.equal(selected?.id, "match-video");
});

test("priorité 3 : le direct entraînement actif passe avant la vidéo d'entraînement", () => {
  const selected = selectHomeMediaCard(null, [
    media({ id: "recording" }),
    media({ id: "training-live", is_live: true, starts_at: "2026-08-27T11:00:00.000Z", ends_at: "2026-08-27T13:00:00.000Z" })
  ], now);
  assert.equal(selected?.kind, "VIDEO");
  assert.equal(selected?.id, "training-live");
  assert.equal(selected?.isLive, true);
});

test("priorité 4 : la dernière vidéo d'entraînement publiée est utilisée", () => {
  const selected = selectHomeMediaCard(null, [
    media({ id: "older", published_at: "2026-08-25T10:00:00.000Z" }),
    media({ id: "latest", published_at: "2026-08-27T10:00:00.000Z" })
  ], now);
  assert.equal(selected?.kind, "VIDEO");
  assert.equal(selected?.id, "latest");
});

test("priorité 5 : aucun contenu éligible retourne null", () => {
  const selected = selectHomeMediaCard(null, [
    media({ status: "DRAFT" }),
    media({ status: "ARCHIVED" }),
    media({ published_at: "2026-08-28T10:00:00.000Z" }),
    media({ starts_at: "2026-08-28T10:00:00.000Z" }),
    media({ ends_at: "2026-08-27T11:59:59.000Z" }),
    media({ url: "" }),
    media({ type: "PHOTO" })
  ], now);
  assert.equal(selected, null);
});

test("un direct entraînement désactivé n'est jamais traité comme actif", () => {
  const selected = selectHomeMediaCard(null, [media({ id: "recording", is_live: false })], now);
  assert.equal(selected?.kind, "VIDEO");
  assert.equal(selected?.id, "recording");
  assert.equal(selected?.isLive, false);
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
  assert.match(calendar, /name: "followUrl"/);
  assert.match(migration, /content_kind[\s\S]*playback_kind[\s\S]*status public\.publication_status[\s\S]*is_live[\s\S]*starts_at[\s\S]*ends_at/);
  assert.match(migration, /add column if not exists follow_url/);
});

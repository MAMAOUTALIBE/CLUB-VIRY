import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { selectMobileMatchFeed } from "../src/lib/mobile-match-feed.ts";

const row = (overrides = {}) => ({ id: "1", opponent_name: "FC Massy", opponent_logo_url: null, location: "HOME", starts_at: "2026-08-26T18:00:00Z", competition: "Championnat", status: "FINISHED", home_score: 2, away_score: 1, live_minute: null, teams: { name: "Seniors A" }, ...overrides });

test("sélectionne uniquement un direct complet avec minute CRM", () => {
  const feed = selectMobileMatchFeed([row({ status: "LIVE", live_minute: 67 })]);
  assert.equal(feed.live?.minute, 67);
  assert.equal(feed.live?.category, "Seniors A");
});

test("n'affiche aucun direct si minute ou score manque", () => {
  assert.equal(selectMobileMatchFeed([row({ status: "LIVE" })]).live, null);
  assert.equal(selectMobileMatchFeed([row({ status: "LIVE", live_minute: 12, away_score: null })]).live, null);
});

test("limite les résultats complets aux deux plus récents", () => {
  const feed = selectMobileMatchFeed([
    row({ id: "old", starts_at: "2026-08-20T18:00:00Z" }),
    row({ id: "new", starts_at: "2026-08-26T18:00:00Z" }),
    row({ id: "middle", starts_at: "2026-08-24T18:00:00Z" }),
    row({ id: "incomplete", starts_at: "2026-08-27T18:00:00Z", home_score: null })
  ]);
  assert.deepEqual(feed.results.map((item) => item.id), ["new", "middle"]);
});

test("n'invente aucun logo d'équipe absent du CRM", () => {
  const [result] = selectMobileMatchFeed([row()]).results;
  assert.equal(result.homeLogoUrl, null);
  assert.equal(result.awayLogoUrl, null);
});

test("mappe HOME, AWAY et NEUTRAL uniquement depuis les noms CRM", () => {
  const home = selectMobileMatchFeed([row({ location: "HOME" })]).results[0];
  const away = selectMobileMatchFeed([row({ location: "AWAY" })]).results[0];
  const neutral = selectMobileMatchFeed([row({ location: "NEUTRAL" })]).results[0];
  assert.deepEqual([home.home, home.away], ["Seniors A", "FC Massy"]);
  assert.deepEqual([away.home, away.away], ["FC Massy", "Seniors A"]);
  assert.deepEqual([neutral.home, neutral.away], ["Seniors A", "FC Massy"]);
});

test("retombe sur la compétition quand aucune équipe n'est rattachée", () => {
  // Le CRM autorise un match sans équipe : le côté club prend alors le libellé de
  // la compétition plutôt que de disparaître du site.
  const [card] = selectMobileMatchFeed([row({ teams: null, competition: "U16 A" })]).results;
  assert.equal(card.category, "U16 A");
  assert.equal(card.home, "U16 A");
});

test("exclut une entrée sans aucun libellé exploitable", () => {
  // Ni équipe ni compétition : rien à afficher côté club, on masque.
  assert.deepEqual(selectMobileMatchFeed([row({ teams: null, competition: null })]).results, []);
  assert.deepEqual(selectMobileMatchFeed([row({ opponent_name: "" })]).results, []);
});

test("ne contient aucun nom de club codé en dur", async () => {
  const source = await readFile(new URL("../src/lib/mobile-match-feed.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /ES Viry(?:-Châtillon)?/i);
});

test("le rendu et l'administration câblent uniquement les logos CRM", async () => {
  const component = await readFile(new URL("../src/components/MobileLiveResults.tsx", import.meta.url), "utf8");
  const admin = await readFile(new URL("../src/components/admin/modules/CalendarAdmin.tsx", import.meta.url), "utf8");
  assert.match(component, /<TeamLogo src=\{match\.homeLogoUrl\}/);
  assert.match(component, /<TeamLogo src=\{match\.awayLogoUrl\}/);
  assert.match(admin, /name: "teamId"/);
  assert.match(admin, /\/api\/admin\/teams\?limit=200/);
  assert.match(admin, /name: "opponentLogoUrl"[\s\S]*emptyEditPayload: null/);
});

test("la section reste mobile/tablette et la source ne contient aucun fallback", async () => {
  const page = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const view = await readFile(new URL("../src/lib/calendar-view.ts", import.meta.url), "utf8");
  assert.match(page, /<section className="bg-\[#f7f8f4\] xl:hidden">[\s\S]*<MobileLiveResults/);
  assert.match(page, /<div className="hidden xl:block">/);
  assert.match(view, /selectMobileMatchFeed\(rows \?\? \[\]\)/);
  assert.doesNotMatch(view, /getMobileMatchFeed[\s\S]{0,500}getFallbackCalendarItems/);
});

test("le direct s'ajoute sous xl sans priver le mobile de l'appel a l'inscription", async () => {
  const page = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const component = await readFile(new URL("../src/components/MobileLiveResults.tsx", import.meta.url), "utf8");

  // Le bloc « Rejoignez la famille Viry » est rendu a TOUTES les largeurs : c'est le
  // seul appel a l'inscription de l'accueil, le masquer prive le mobile de ce chemin.
  assert.match(page, /<section className="mx-auto max-w-7xl px-4 pb-10 pt-10[^"]*">[\s\S]*Rejoignez la/);
  assert.doesNotMatch(page, /<section className="mx-auto hidden max-w-7xl[^"]*xl:block[^"]*">[\s\S]*Rejoignez la/);
  // Le direct, lui, reste propre au mobile.
  assert.match(page, /<section className="bg-\[#f7f8f4\] xl:hidden">[\s\S]*<MobileLiveResults/);
  assert.match(component, /id="mobile-live-title" className="[^"]*whitespace-nowrap[^"]*uppercase[^"]*text-red-500"[^>]*>Match en direct<\/h2>/);
});

test("le direct pointe vers une vraie route publique de match", async () => {
  const component = await readFile(new URL("../src/components/MobileLiveResults.tsx", import.meta.url), "utf8");
  const route = await readFile(new URL("../src/app/matchs/[id]/page.tsx", import.meta.url), "utf8");
  assert.match(component, /href=\{`\/matchs\/\$\{live\.id\}`\}/);
  assert.match(component, />Suivre le match /);
  assert.match(route, /getPublicMatchDetail\(id\)/);
  assert.match(route, /if \(!detail\) notFound\(\)/);
});

test("la lecture détail valide l'UUID et reste DB-only sans fallback", async () => {
  const publicMatch = await readFile(new URL("../src/lib/public-match.ts", import.meta.url), "utf8");
  const db = await readFile(new URL("../src/lib/db/calendar.ts", import.meta.url), "utf8");
  assert.match(publicMatch, /if \(!isUuid\(id\)\) return null/);
  assert.match(publicMatch, /readPublicDb\(\(\) => getPublicMatchById\(id\)\)/);
  assert.doesNotMatch(publicMatch, /fallback/i);
  assert.match(db, /getPublicMatchById[\s\S]*\.eq\("id", id\)[\s\S]*\.is\("deleted_at", null\)[\s\S]*\.maybeSingle\(\)/);
});

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
  assert.match(admin, /name="teamId"/);
  assert.match(admin, /\/api\/admin\/teams\?limit=200/);
  assert.match(admin, /name="opponentLogoUrl"/);
  assert.match(admin, /opponentLogoUrl: form\.opponentLogoUrl/);
});

test("la section reste mobile/tablette et la source ne contient aucun fallback", async () => {
  const page = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const view = await readFile(new URL("../src/lib/calendar-view.ts", import.meta.url), "utf8");
  assert.match(page, /<section className="bg-\[#f7f8f4\] xl:hidden">[\s\S]*<MobileLiveResults/);
  assert.match(page, /<div className="hidden xl:block">/);
  assert.match(view, /selectMobileMatchFeed\(rows \?\? \[\]\)/);
  assert.doesNotMatch(view, /getMobileMatchFeed[\s\S]{0,500}getFallbackCalendarItems/);
});

test("le repli média reste mobile et le direct est aussi disponible sur tablette et ordinateur", async () => {
  const page = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
  const component = await readFile(new URL("../src/components/MobileLiveResults.tsx", import.meta.url), "utf8");
  const homeLiveGallery = await readFile(new URL("../src/components/HomeLiveGallery.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(page, /Rejoignez la[\s\S]{0,30}famille Viry/);
  assert.match(page, /selectHomeMediaCard\(mobileMatchFeed\.live, homepageVideoMedia, now\)/);
  assert.match(page, /<HomeLiveGallery media=\{homepageMedia\} photos=\{latestGalleryPhotos\} \/>/);
  assert.match(homeLiveGallery, /aria-label="Match en direct, dernier match ou photos" className="[^"]*md:hidden"/);
  assert.match(homeLiveGallery, /\{media \? <DynamicMediaCard media=\{media\} \/> : <LatestPhotosCard photos=\{photos\} \/>\}/);
  assert.equal((homeLiveGallery.match(/<LatestPhotosCard photos=\{photos\} \/>/g) ?? []).length, 1);
  assert.match(homeLiveGallery, /media\?\.kind === "LIVE_MATCH"[\s\S]*aria-label="Match en direct sur ordinateur" className="[^"]*hidden[^"]*xl:block/);
  assert.match(homeLiveGallery, /<LiveMatchCard media=\{media\} \/>/);
  assert.doesNotMatch(homeLiveGallery, /Match en direct sur ordinateur[\s\S]{0,500}<LatestPhotosCard/);
  assert.match(homeLiveGallery, /Aucune photo publiée/);
  assert.match(homeLiveGallery, /href="\/medias"/);
  assert.match(homeLiveGallery, /Voir toutes les photos/);

  // Les autres blocs mobiles déjà présents restent inchangés.
  assert.match(page, /<section className="bg-\[#f7f8f4\] xl:hidden">[\s\S]*<MobileLiveResults/);
  assert.match(component, /id="mobile-live-title" className="[^"]*whitespace-nowrap[^"]*uppercase[^"]*text-red-500"[^>]*>Match en direct<\/h2>/);
  assert.match(component, /className="relative overflow-hidden[^"]*xl:hidden"/);
  assert.match(component, /live \? live\.followUrl \?\? `\/matchs\/\$\{live\.id\}` : null/);
  assert.match(component, />Voir le match en direct /);
});

test("les photos de l'accueil viennent uniquement des assets PHOTO publiés du CRM", async () => {
  const db = await readFile(new URL("../src/lib/db/content.ts", import.meta.url), "utf8");
  const publicContent = await readFile(new URL("../src/lib/public-content.ts", import.meta.url), "utf8");

  assert.match(db, /listLatestPublishedPhotos[\s\S]*?\.eq\("type", "PHOTO"\)[\s\S]*?\.not\("published_at", "is", null\)[\s\S]*?\.lte\("published_at", nowIso\)[\s\S]*?\.order\("published_at", \{ ascending: false \}\)/);
  assert.match(publicContent, /getLatestPublishedGalleryPhotos[\s\S]*?readPublicDb\(\(\) => listLatestPublishedPhotos\(limit\)\)[\s\S]*?return \(assets \?\? \[\]\)\.map/);
  assert.doesNotMatch(publicContent, /getLatestPublishedGalleryPhotos[\s\S]{0,500}(?:mockNews|images\.)/);
});

test("le direct tablette utilise le lien CRM puis la vraie route publique de match", async () => {
  const component = await readFile(new URL("../src/components/MobileLiveResults.tsx", import.meta.url), "utf8");
  const route = await readFile(new URL("../src/app/matchs/[id]/page.tsx", import.meta.url), "utf8");
  assert.match(component, /live \? live\.followUrl \?\? `\/matchs\/\$\{live\.id\}` : null/);
  assert.match(component, /href=\{liveHref \?\? `\/matchs\/\$\{live\.id\}`\}/);
  assert.match(component, />Voir le match en direct /);
  assert.match(route, /getPublicMatchDetail\(id\)/);
  assert.match(route, /if \(!detail\) notFound\(\)/);
});

test("la carte dynamique utilise le lien de suivi CRM puis la fiche publique", async () => {
  const component = await readFile(new URL("../src/components/HomeLiveGallery.tsx", import.meta.url), "utf8");
  const feed = await readFile(new URL("../src/lib/mobile-match-feed.ts", import.meta.url), "utf8");

  assert.match(feed, /followUrl: row\.follow_url\?\.trim\(\) \|\| null/);
  assert.match(component, /match\.followUrl \?\? `\/matchs\/\$\{match\.id\}`/);
  assert.match(component, />\s*Voir le match en direct /);
});

test("la lecture détail valide l'UUID et reste DB-only sans fallback", async () => {
  const publicMatch = await readFile(new URL("../src/lib/public-match.ts", import.meta.url), "utf8");
  const db = await readFile(new URL("../src/lib/db/calendar.ts", import.meta.url), "utf8");
  assert.match(publicMatch, /if \(!isUuid\(id\)\) return null/);
  assert.match(publicMatch, /readPublicDb\(\(\) => getPublicMatchById\(id\)\)/);
  assert.doesNotMatch(publicMatch, /fallback/i);
  assert.match(db, /getPublicMatchById[\s\S]*\.eq\("id", id\)[\s\S]*\.is\("deleted_at", null\)[\s\S]*\.maybeSingle\(\)/);
});

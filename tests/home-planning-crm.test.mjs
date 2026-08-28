import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homeSource = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const hubSource = await readFile(new URL("../src/components/HomeSportsHub.tsx", import.meta.url), "utf8");
const sportsDataSource = await readFile(new URL("../src/lib/home-sports-data.ts", import.meta.url), "utf8");
const settingsSource = await readFile(new URL("../src/components/admin/modules/SettingsAdmin.tsx", import.meta.url), "utf8");
const sidebarSource = await readFile(new URL("../src/components/admin/AdminSidebar.tsx", import.meta.url), "utf8");
const eventCollectionRoute = await readFile(new URL("../src/app/api/admin/calendar/events/route.ts", import.meta.url), "utf8");
const eventItemRoute = await readFile(new URL("../src/app/api/admin/calendar/events/[id]/route.ts", import.meta.url), "utf8");

test("le planning de l'accueil provient uniquement des événements du calendrier CRM", () => {
  assert.match(homeSource, /export const dynamic = "force-dynamic"/);
  assert.match(homeSource, /listPublicWeeklyPlanning\(planningWindow\.startIso, planningWindow\.endExclusiveIso\)/);
  assert.match(homeSource, /trainingPlanningItems = weeklyPlanningItems\.filter\(\(item\) => item\.source === "event"\)/);
  assert.match(homeSource, /planningItems=\{trainingPlanningItems\}/);
  assert.doesNotMatch(homeSource, /settings\.homeSports|trainingSchedule/);
  assert.match(hubSource, /publicPlanningRows\(planningItems\)/);
  for (const field of ["slot.title", "slot.teamName", "slot.groupLabel", "slot.pitchCode"]) assert.match(hubSource, new RegExp(field.replace(".", "\\.")));
  assert.doesNotMatch(hubSource, /fallback|Semaine du 2 au 6 septembre 2026/);
});

test("aucun créneau sportif fictif ne subsiste dans le module public", () => {
  assert.doesNotMatch(sportsDataSource, /17h30|20h00|U6 à U10|Brétigny|Morsang|trainingSchedule|recentResults|upcomingMatches/);
});

test("l'ancien planning de réglages est retiré du CRM au profit du calendrier", () => {
  assert.doesNotMatch(settingsSource, /TrainingPlanningAdmin|settings\.home_sports/);
  assert.doesNotMatch(sidebarSource, /Accueil sportif|#home_sports/);
  assert.match(sidebarSource, /Calendrier[\s\S]*\/admin\/calendrier/);
});

test("chaque écriture du calendrier invalide immédiatement l'accueil et la page planning", () => {
  for (const source of [eventCollectionRoute, eventItemRoute]) {
    assert.match(source, /revalidatePath\("\/"\)/);
    assert.match(source, /revalidatePath\("\/calendrier"\)/);
  }
});

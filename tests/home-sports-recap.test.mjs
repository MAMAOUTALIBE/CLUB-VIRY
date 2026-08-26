import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homeSource = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const hubSource = await readFile(new URL("../src/components/HomeSportsHub.tsx", import.meta.url), "utf8");

test("every responsive home layout passes the three calendar data sets", () => {
  const homeHubCalls = homeSource.match(/<HomeSportsHub[^>]+\/>/g) ?? [];

  assert.equal(homeHubCalls.length, 2);
  assert.ok(homeHubCalls.every((call) => call.includes("matches={sportsMatches}")));
  assert.ok(homeHubCalls.every((call) => call.includes("results={calendar.isFallback ? undefined : sportsResults}")));
  assert.ok(homeHubCalls.every((call) => !call.includes("showRecap")));
});

test("the sports hub exposes three exclusive accessible calendars with training selected by default", () => {
  assert.doesNotMatch(hubSource, /value: "all"|label: "Tous"|active === "all"/);
  assert.match(hubSource, /useState<Filter>\("training"\)/);
  assert.match(hubSource, /role="tablist"/);
  assert.match(hubSource, /role="tab"/);
  assert.match(hubSource, /role="tabpanel"/);
  assert.match(hubSource, /aria-selected=/);
  assert.match(hubSource, /aria-controls=/);
  assert.match(hubSource, /event\.key === "ArrowRight"/);
  assert.match(hubSource, /event\.key === "ArrowLeft"/);
  assert.match(hubSource, /event\.key === "Home"/);
  assert.match(hubSource, /event\.key === "End"/);
  assert.match(hubSource, /event\.preventDefault\(\)/);
  assert.match(hubSource, /tabRefs\.current\[index\]\?\.focus\(\)/);
  assert.match(hubSource, /onKeyDown=/);
  assert.match(hubSource, /const showTraining = active === "training"/);
  assert.match(hubSource, /const showMatches = active === "matches"/);
  assert.match(hubSource, /const showResults = active === "results"/);
  assert.match(hubSource, /grid grid-cols-3/);
  assert.doesNotMatch(hubSource, /min-w-max/);
  assert.match(hubSource, /displayedResults\.slice\(0, 2\)/);
  assert.match(hubSource, /href="\/resultats"/);
  assert.match(hubSource, />Terminé</);
});

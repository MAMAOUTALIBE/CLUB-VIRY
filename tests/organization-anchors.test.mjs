import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const organizationSource = await readFile(new URL("../src/app/le-club/organigramme/page.tsx", import.meta.url), "utf8");
const bureauRedirect = await readFile(new URL("../src/app/le-club/bureau/page.tsx", import.meta.url), "utf8");
const dirigeantsRedirect = await readFile(new URL("../src/app/le-club/dirigeants/page.tsx", import.meta.url), "utf8");

test("historical organization routes redirect to stable section anchors", () => {
  assert.match(bureauRedirect, /permanentRedirect\("\/le-club\/organigramme#bureau"\)/);
  assert.match(dirigeantsRedirect, /permanentRedirect\("\/le-club\/organigramme#dirigeants"\)/);
});

test("organization renders each redirected anchor once and keeps an empty state", () => {
  assert.match(organizationSource, /<OfficialsSection[\s\S]*title="Bureau exécutif"[\s\S]*officials=\{officials\.bureau\}/);
  assert.match(organizationSource, /<OfficialsSection[\s\S]*title="Dirigeants"[\s\S]*officials=\{officials\.dirigeants\}/);
  assert.match(organizationSource, /Aucun responsable n’est actuellement publié dans cette section\./);
  assert.doesNotMatch(organizationSource, /if \(officials\.length === 0\) return null/);
  assert.equal((organizationSource.match(/"bureau" : "dirigeants"/g) ?? []).length, 1);
});

test("redirected organization sections are shared by mobile and desktop layouts", () => {
  const firstDesktopClose = organizationSource.indexOf("</DesktopOnly>", organizationSource.indexOf('id="tous-les-responsables"'));
  const bureauSection = organizationSource.indexOf('title="Bureau exécutif"', firstDesktopClose);
  const secondDesktopOpen = organizationSource.indexOf("<DesktopOnly>", bureauSection);
  const dirigeantsSection = organizationSource.indexOf('title="Dirigeants"', bureauSection);

  assert.ok(firstDesktopClose > -1, "the desktop-only overview must close before shared anchor sections");
  assert.ok(bureauSection > firstDesktopClose, "the bureau target must not be hidden in DesktopOnly");
  assert.ok(dirigeantsSection > bureauSection && dirigeantsSection < secondDesktopOpen, "both targets must be shared across breakpoints");
  assert.doesNotMatch(organizationSource, /<MobileScreen[\s\S]*<OfficialIdentityCard/);
});

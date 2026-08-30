import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateFamilyMediaAudiencePreviewPayload } from "../src/lib/api/validation.ts";
import { countDistinctActiveAudienceFamilies } from "../src/lib/family-media-audience.ts";

const TEAM_ID = "33333333-3333-4333-8333-333333333333";

const component = await readFile(new URL("../src/components/admin/modules/MediaAssetsAdmin.tsx", import.meta.url), "utf8");
const crud = await readFile(new URL("../src/components/admin/AdminCrud.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/app/api/admin/media/audience-preview/route.ts", import.meta.url), "utf8");
const database = await readFile(new URL("../src/lib/db/family-media-audience.ts", import.meta.url), "utf8");
const content = await readFile(new URL("../src/lib/db/content.ts", import.meta.url), "utf8");
const mediaState = await readFile(new URL("../src/lib/media-asset-state.ts", import.meta.url), "utf8");

test("l'aperçu audience valide strictement l'équipe et le droit demandé", () => {
  for (const right of ["PHOTOS", "TRAINING_VIDEOS", "LIVE_MATCHES"]) {
    assert.deepEqual(validateFamilyMediaAudiencePreviewPayload({ teamId: TEAM_ID, right }), {
      ok: true,
      data: { teamId: TEAM_ID, right }
    });
  }
  assert.equal(validateFamilyMediaAudiencePreviewPayload({ teamId: "invalide", right: "PHOTOS" }).ok, false);
  assert.equal(validateFamilyMediaAudiencePreviewPayload({ teamId: TEAM_ID, right: "VIDEOS" }).ok, false);
  assert.equal(validateFamilyMediaAudiencePreviewPayload({}).ok, false);
});

test("la route d'aperçu est protégée et ne renvoie que le compteur", () => {
  assert.match(route, /getAdminContext\(request, "content:manage"\)/);
  assert.match(route, /validateFamilyMediaAudiencePreviewPayload/);
  assert.match(route, /countCurrentFamilyMediaAudience/);
  assert.match(route, /jsonOk\(\{ count \}\)/);
  assert.match(route, /private, no-store/);
  assert.doesNotMatch(route, /family_name|email|storage_path|follow_url|url:/);
});

test("le compteur reproduit les conditions réelles d'habilitation et déduplique les familles", () => {
  assert.match(database, /family_media_pass_teams[\s\S]*\.eq\("team_id", input\.teamId\)/);
  assert.match(database, /family_media_passes[\s\S]*\.eq\("status", "ACTIVE"\)/);
  assert.match(database, /\.lte\("starts_on", dateKey\)[\s\S]*\.gte\("ends_on", dateKey\)/);
  assert.match(database, /\.eq\(RIGHT_COLUMN\[input\.right\], true\)/);
  assert.match(database, /families[\s\S]*\.is\("deleted_at", null\)/);
  assert.match(database, /profiles[\s\S]*\.eq\("status", "ACTIVE"\)/);
  assert.match(database, /countDistinctActiveAudienceFamilies/);
  assert.doesNotMatch(database, /select\("[^"\n]*(?:email|name|url|storage_path)/);

  assert.equal(
    countDistinctActiveAudienceFamilies(
      [
        { familyId: "famille-a", profileId: "actif-a" },
        { familyId: "famille-a", profileId: "actif-b" },
        { familyId: "famille-b", profileId: "inactif" },
        { familyId: "famille-c", profileId: "actif-c" }
      ],
      ["actif-a", "actif-b", "actif-c"]
    ),
    2
  );
});

test("la médiathèque conditionne les champs et nettoie ceux devenus hors contexte", () => {
  assert.match(component, /visibleWhen: \(form\) => form\.accessLevel === "PUBLIC" \|\| \(form\.type === "VIDEO" && form\.playbackKind === "BROADCAST_LINK"\)/);
  assert.match(component, /form\.accessLevel === "PUBLIC" && form\.type === "PHOTO"/);
  assert.match(component, /form\.accessLevel === "FAMILY_PASS" && \(form\.type === "PHOTO" \|\| form\.playbackKind !== "BROADCAST_LINK"\)/);
  assert.match(component, /visibleWhen: \(form\) => form\.type === "VIDEO"/);
  assert.match(component, /form\.type === "VIDEO" && form\.contentKind === "TRAINING" && form\.playbackKind === "BROADCAST_LINK"/);
  assert.match(component, /required: \(form\) => form\.accessLevel === "FAMILY_PASS"/);
  assert.match(component, /hiddenEditPayload: null/);
  assert.match(component, /hiddenEditPayload: false/);
  assert.match(crud, /f\.visibleWhen\?\.\(form\)/);
  assert.match(crud, /f\.hiddenEditPayload !== undefined/);
  assert.match(content, /normalizeMediaAssetPayload\(input\)/);
  assert.match(mediaState, /output\.type === "PHOTO"[\s\S]*output\.thumbnailUrl = null/);
  assert.match(mediaState, /output\.isLive = false/);
});

test("le récapitulatif et l'audience gèrent les états, le debounce et les petits écrans", () => {
  assert.match(component, /Récapitulatif avant enregistrement/);
  assert.match(component, /Éléments manquants/);
  assert.match(component, /Configuration complète/);
  assert.match(component, /new AbortController\(\)/);
  assert.match(component, /requestId\.current/);
  assert.match(component, /}, 350\)/);
  assert.match(component, /Calcul de l’audience/);
  assert.match(component, /Audience indisponible/);
  assert.match(component, /\{result\.count\} famille/);
  assert.match(component, /renderMobileRow/);
  assert.match(component, /validateForm=\{\(form\) =>/);
  assert.match(crud, /disabled=\{saving \|\| Boolean\(validateForm\?\.\(form\)\)\}/);
  assert.match(crud, /grid gap-3 md:hidden/);
  assert.match(crud, /hidden overflow-x-auto md:block/);
  assert.match(component, /sm:grid-cols-2/);
  assert.match(component, /lg:grid-cols-2/);
});

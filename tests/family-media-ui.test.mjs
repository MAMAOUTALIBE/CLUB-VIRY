import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("le CRM attribue un Pass Famille par saison, droits et équipes", async () => {
  const source = await readFile(new URL("../src/components/admin/modules/FamilyMediaPassesAdmin.tsx", import.meta.url), "utf8");
  for (const endpoint of ["/api/admin/family-media-passes", "/api/admin/families", "/api/admin/seasons", "/api/admin/teams"]) {
    assert.match(source, new RegExp(endpoint.replaceAll("/", "\\/")));
  }
  for (const field of ["familyId", "seasonId", "startsOn", "endsOn", "allowPhotos", "allowTrainingVideos", "allowLiveMatches", "teamIds", "reviewNote"]) {
    assert.match(source, new RegExp(field));
  }
  assert.match(source, /PENDING_REVIEW[\s\S]*ACTIVE[\s\S]*SUSPENDED[\s\S]*REJECTED/);
  assert.match(source, /L’activation est manuelle/);
});

test("la médiathèque CRM sépare URL publique et fichier privé rattaché à une équipe", async () => {
  const source = await readFile(new URL("../src/components/admin/modules/MediaAssetsAdmin.tsx", import.meta.url), "utf8");
  const crud = await readFile(new URL("../src/components/admin/AdminCrud.tsx", import.meta.url), "utf8");
  const content = await readFile(new URL("../src/lib/db/content.ts", import.meta.url), "utf8");
  assert.match(source, /name: "accessLevel"[\s\S]*PUBLIC[\s\S]*FAMILY_PASS/);
  assert.match(source, /uploadEndpoint: "\/api\/admin\/media\/private-upload"/);
  assert.match(source, /uploadTargetField: "storagePath"/);
  assert.match(source, /uploadExtraFieldSources: \{ teamId: "teamId" \}/);
  assert.match(source, /maxBytes: 100 \* 1024 \* 1024/);
  assert.match(crud, /uploadExtraFieldSources/);
  assert.match(crud, /body\.append\(key, value\)/);
  assert.match(content, /privateFileSelected[\s\S]*playbackKind !== "BROADCAST_LINK"/);
  assert.match(content, /privateBroadcastSelected[\s\S]*storage_path: null/);
});

test("le calendrier CRM protège le lien d'un direct sans masquer score et minute", async () => {
  const source = await readFile(new URL("../src/components/admin/modules/CalendarAdmin.tsx", import.meta.url), "utf8");
  assert.match(source, /access_level: "PUBLIC" \| "FAMILY_PASS"/);
  assert.match(source, /name="accessLevel"[\s\S]*Familles sélectionnées uniquement/);
  assert.match(source, /followUrl: form\.followUrl \|\| null, accessLevel: form\.accessLevel/);
  assert.match(source, /Le score et la minute restent visibles/);
});

test("l'espace famille consomme uniquement les routes protégées", async () => {
  const source = await readFile(new URL("../src/components/member/MemberSpace.tsx", import.meta.url), "utf8");
  assert.match(source, /fetch\("\/api\/family\/media-pass"/);
  assert.match(source, /fetch\("\/api\/family\/media\?limit=100"/);
  assert.match(source, /fetch\("\/api\/family\/matches\/live"/);
  assert.match(source, /src=\{`\/api\/family\/media\/\$\{media\.id\}\/file`\}/);
  assert.match(source, /href=\{`\/api\/family\/media\/\$\{media\.id\}\/file\?download=1`\}/);
  assert.match(source, /openAuthorizedLink\(match\.accessPath/);
  assert.match(source, /poster=\{media\.thumbnail_url \?\? undefined\}/);
  assert.match(source, /fetch\(accessPath/);
  assert.match(source, /currentMediaPassIsActive/);
  assert.match(source, /isFamilyMediaPassCurrent\(currentMediaPass, today\)/);
  assert.doesNotMatch(source, /media\.url/);
  assert.doesNotMatch(source, /followUrl|follow_url/);
});

test("la fiche match vérifie le Pass Famille avant d'ouvrir un direct premium", async () => {
  const button = await readFile(new URL("../src/components/ProtectedLiveButton.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../src/app/matchs/[id]/page.tsx", import.meta.url), "utf8");
  assert.match(button, /fetch\(`\/api\/family\/matches\/\$\{matchId\}\/live`/);
  assert.match(button, /response\.status === 401/);
  assert.match(button, /href="\/espace-membre"/);
  assert.match(page, /row\.access_level === "FAMILY_PASS" \? <ProtectedLiveButton matchId=\{row\.id\}/);
  assert.doesNotMatch(button, /followUrl|follow_url/);
});

test("les offres commerciales restent invisibles jusqu'au lancement", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260830120000_hide_support_passes_until_launch.sql", import.meta.url), "utf8");
  assert.match(sql, /status = 'DRAFT'/);
  assert.match(sql, /pass-famille-plus/);
  assert.match(sql, /pass-supporter/);
});

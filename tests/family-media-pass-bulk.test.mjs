import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await readFile(new URL("../src/app/api/admin/family-media-passes/bulk/route.ts", import.meta.url), "utf8");
const database = await readFile(new URL("../src/lib/db/family-media-passes.ts", import.meta.url), "utf8");
const component = await readFile(new URL("../src/components/admin/modules/FamilyMediaPassesAdmin.tsx", import.meta.url), "utf8");

test("l'action groupée reste protégée, validée et auditée", () => {
  assert.match(route, /isSameOriginRequest\(request\)/);
  assert.match(route, /getAdminContext\(request, "admin:manage_users"\)/);
  assert.match(route, /validateAdminFamilyMediaPassBulkPayload\(body\)/);
  assert.match(route, /bulkUpdateFamilyMediaPassStatus/);
  assert.match(route, /family_media_pass\.bulk_status_updated/);
  assert.match(route, /requestedIds: payload\.data\.ids/);
  assert.match(route, /succeeded: result\.succeeded/);
  assert.match(route, /failed: result\.failed/);
});

test("la base ne modifie que les identifiants sélectionnés et explicite les absents", () => {
  assert.match(database, /bulkUpdateFamilyMediaPassStatus/);
  assert.match(database, /\.in\("id", ids\)/);
  assert.match(database, /\.select\("id"\)/);
  assert.match(database, /reviewed_by: actorId/);
  assert.match(database, /succeeded: ids\.filter/);
  assert.match(database, /reason: "NOT_FOUND"/);
  assert.doesNotMatch(database, /bulkUpdateFamilyMediaPassStatus[\s\S]*\.neq\(/);
});

test("la liste combine recherche, filtres et compteur avec remise à zéro", () => {
  assert.match(component, /pass\.family_name[\s\S]*pass\.teams\.some/);
  assert.match(component, /statusFilter[\s\S]*seasonFilter[\s\S]*teamFilter/);
  assert.match(component, /filteredPasses\.length[\s\S]*sur \{passes\.length\}/);
  assert.match(component, /clearFilters/);
  assert.match(component, /Réinitialiser/);
});

test("la sélection individuelle et filtrée alimente uniquement la route bulk bornée", () => {
  assert.match(component, /MAX_BULK_SELECTION = 100/);
  assert.match(component, /togglePassSelection/);
  assert.match(component, /toggleFilteredSelection/);
  assert.match(component, /filteredPasses\.every\(\(pass\) => selectedIds\.has\(pass\.id\)\)/);
  assert.match(component, /fetch\("\/api\/admin\/family-media-passes\/bulk"/);
  assert.match(component, /JSON\.stringify\(\{ ids, status: bulkStatus \}\)/);
  assert.match(component, /window\.confirm/);
  assert.match(component, /feedback\.succeeded\.length/);
  assert.match(component, /feedback\.failed\.map/);
  assert.match(component, /bulkFeedback\.failed\.length/);
});

test("les cartes mobile et la table desktop ne nécessitent aucun scroll horizontal", () => {
  assert.match(component, /grid gap-3 lg:hidden/);
  assert.match(component, /hidden w-full[\s\S]*lg:table/);
  assert.match(component, /break-words/);
  assert.doesNotMatch(component, /overflow-x-auto|min-w-\[[0-9]+px\]/);
  assert.match(component, /Choisir une famille/);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildFamilyOperationsAnomalies,
  canLoadFamilyOperationsResources
} from "../src/lib/family-operations-state.ts";

const page = await readFile(new URL("../src/app/admin/familles/[id]/page.tsx", import.meta.url), "utf8");
const component = await readFile(new URL("../src/components/admin/FamilyOperationsCenter.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/app/api/admin/families/[id]/operations/route.ts", import.meta.url), "utf8");
const database = await readFile(new URL("../src/lib/db/family-operations.ts", import.meta.url), "utf8");
const passesDatabase = await readFile(new URL("../src/lib/db/family-media-passes.ts", import.meta.url), "utf8");
const operationsState = await readFile(new URL("../src/lib/family-operations-state.ts", import.meta.url), "utf8");

test("la fiche famille conserve les accès existants et ajoute le centre de pilotage", () => {
  assert.match(page, /FamilyOperationsCenter familyId=\{id\}/);
  assert.match(page, /FamilyAccessAdmin familyId=\{id\}/);
  assert.match(component, /Pilotage famille/);
  assert.match(component, /Compte famille/);
  assert.match(component, /Pass Famille Média courant/);
  assert.match(component, /Ressources publiées accessibles/);
});

test("la synthèse famille reste sous la permission de gestion des utilisateurs", () => {
  assert.match(route, /getAdminContext\(request, "admin:manage_users"\)/);
  assert.match(route, /isUuid\(id\)/);
  assert.match(route, /getFamilyOperationsSummaryForAdmin\(id\)/);
  assert.match(passesDatabase, /listFamilyMediaPassesForFamilyAdmin[\s\S]*\.eq\("family_id", familyId\)/);
});

test("le résumé ne sélectionne que les métadonnées premium publiées et autorisées", () => {
  assert.match(database, /\.eq\("access_level", "FAMILY_PASS"\)/);
  assert.match(database, /\.eq\("status", "PUBLISHED"\)/);
  assert.match(database, /\.in\("team_id", scopedTeamIds\)/);
  assert.match(database, /passAllowsResource\(currentPass, asset\)/);
  assert.match(database, /accessFilters\.join\(","\)/);
  assert.match(database, /asset\.starts_at === null/);
  assert.match(database, /asset\.ends_at === null/);
  assert.doesNotMatch(database, /select\("[^"]*(?:storage_path|follow_url|,url|url,)/);
});

test("les anomalies opérationnelles couvrent tous les cas demandés", () => {
  for (const label of [
    "Aucun compte famille rattaché",
    "Aucun compte famille actif",
    "Aucun Pass Famille Média pour la saison courante",
    "Le Pass Famille Média courant est inactif ou hors période",
    "Aucune équipe autorisée sur le pass",
    "Aucune ressource publiée accessible"
  ]) {
    assert.match(operationsState, new RegExp(label));
  }
});

test("aucun compte ne permet jamais de charger les ressources", () => {
  const readiness = { accountStatuses: [], hasPass: true, passIsCurrent: true, teamCount: 1, resourceCount: 0 };
  assert.equal(canLoadFamilyOperationsResources(readiness), false);
  assert.deepEqual(buildFamilyOperationsAnomalies(readiness).map((item) => item.code), ["NO_ACCOUNT", "NO_RESOURCE"]);
});

test("des comptes uniquement inactifs bloquent les ressources et signalent l'anomalie", () => {
  const readiness = {
    accountStatuses: ["PENDING", "SUSPENDED"],
    hasPass: true,
    passIsCurrent: true,
    teamCount: 1,
    resourceCount: 0
  };
  assert.equal(canLoadFamilyOperationsResources(readiness), false);
  assert.deepEqual(buildFamilyOperationsAnomalies(readiness).map((item) => item.code), ["ACCOUNT_INACTIVE", "NO_RESOURCE"]);
});

test("au moins un compte actif autorise le chargement si pass et équipe sont valides", () => {
  const readiness = {
    accountStatuses: ["SUSPENDED", "ACTIVE"],
    hasPass: true,
    passIsCurrent: true,
    teamCount: 1,
    resourceCount: 3
  };
  assert.equal(canLoadFamilyOperationsResources(readiness), true);
  assert.deepEqual(buildFamilyOperationsAnomalies(readiness), []);
});

test("le pass est créé ou modifié pour la famille courante sans sélecteur de famille", () => {
  assert.match(component, /fetch\(form\.id \? `\/api\/admin\/family-media-passes\/\$\{form\.id\}` : "\/api\/admin\/family-media-passes"/);
  assert.match(component, /body: JSON\.stringify\(\{[\s\S]*familyId,/);
  assert.match(component, /Famille : \{summary\.family\.name\}/);
  assert.doesNotMatch(component, /Choisir une famille|\/api\/admin\/families\?limit/);
});

test("le centre reste lisible sur mobile et enrichit progressivement la grille", () => {
  assert.match(component, /grid gap-px[\s\S]*sm:grid-cols-2 lg:grid-cols-4/);
  assert.match(component, /grid gap-6 lg:grid-cols-2/);
  assert.match(component, /grid gap-2 sm:grid-cols-2 lg:grid-cols-3/);
  assert.match(component, /break-words/);
  assert.doesNotMatch(component, /min-w-\[[0-9]+px\]|overflow-x-auto|<table/);
});

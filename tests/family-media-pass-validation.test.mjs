import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateAdminFamilyMediaPassPayload } from "../src/lib/api/validation.ts";

const FAMILY_ID = "11111111-1111-4111-8111-111111111111";
const SEASON_ID = "22222222-2222-4222-8222-222222222222";
const TEAM_ID = "33333333-3333-4333-8333-333333333333";

const validPass = {
  familyId: FAMILY_ID,
  seasonId: SEASON_ID,
  startsOn: "2026-09-01",
  endsOn: "2027-06-30",
  allowPhotos: true,
  allowTrainingVideos: true,
  allowLiveMatches: true,
  teamIds: [TEAM_ID],
  reviewNote: "Identité et rattachement vérifiés."
};

function issueFields(result) {
  assert.equal(result.ok, false);
  return result.issues.map((issue) => issue.field);
}

test("Pass Famille Média : création valide, saisonnière et en attente par défaut", () => {
  const result = validateAdminFamilyMediaPassPayload(validPass);
  assert.equal(result.ok, true);
  assert.equal(result.data.status, "PENDING_REVIEW");
  assert.deepEqual(result.data.teamIds, [TEAM_ID]);
  assert.equal(result.data.allowLiveMatches, true);
});

test("Pass Famille Média : famille, saison, dates et équipe sont obligatoires", () => {
  const fields = issueFields(validateAdminFamilyMediaPassPayload({ allowPhotos: true }));
  for (const field of ["familyId", "seasonId", "startsOn", "endsOn", "teamIds"]) {
    assert.ok(fields.includes(field), `${field} doit être signalé`);
  }
});

test("Pass Famille Média : refuse un pass sans aucun droit", () => {
  const fields = issueFields(
    validateAdminFamilyMediaPassPayload({
      ...validPass,
      allowPhotos: false,
      allowTrainingVideos: false,
      allowLiveMatches: false
    })
  );
  assert.ok(fields.includes("rights"));
});

test("Pass Famille Média : refuse une équipe invalide, absente ou en doublon", () => {
  assert.ok(issueFields(validateAdminFamilyMediaPassPayload({ ...validPass, teamIds: [] })).includes("teamIds"));
  assert.ok(issueFields(validateAdminFamilyMediaPassPayload({ ...validPass, teamIds: ["invalide"] })).includes("teamIds"));
  assert.ok(issueFields(validateAdminFamilyMediaPassPayload({ ...validPass, teamIds: [TEAM_ID, TEAM_ID] })).includes("teamIds"));
});

test("Pass Famille Média : refuse les dates inversées et les statuts inconnus", () => {
  assert.ok(
    issueFields(validateAdminFamilyMediaPassPayload({ ...validPass, startsOn: "2027-07-01", endsOn: "2026-09-01" })).includes(
      "endsOn"
    )
  );
  assert.ok(issueFields(validateAdminFamilyMediaPassPayload({ ...validPass, status: "PAID" })).includes("status"));
});

test("Pass Famille Média : accepte une vraie modification partielle et refuse un corps vide", () => {
  assert.deepEqual(validateAdminFamilyMediaPassPayload({ status: "SUSPENDED" }, { partial: true }), {
    ok: true,
    data: { status: "SUSPENDED" }
  });
  assert.ok(issueFields(validateAdminFamilyMediaPassPayload({}, { partial: true })).includes("body"));
  assert.ok(issueFields(validateAdminFamilyMediaPassPayload({ reviewNote: "x".repeat(1001) }, { partial: true })).includes("reviewNote"));
});

test("Pass Famille Média : la migration impose l'isolation, la portée saisonnière et l'écriture atomique", async () => {
  const sql = await readFile(
    new URL("../supabase/migrations/20260830100000_family_media_passes.sql", import.meta.url),
    "utf8"
  );

  assert.match(sql, /family_media_passes_family_season_unique unique \(family_id, season_id\)/);
  assert.match(sql, /allow_photos or allow_training_videos or allow_live_matches/);
  assert.match(sql, /season_id = p_season_id/);
  assert.match(sql, /cardinality\(p_team_ids\) = 0/);
  assert.match(sql, /create constraint trigger family_media_passes_integrity_check/);
  assert.match(sql, /create constraint trigger family_media_pass_teams_integrity_check/);
  assert.match(sql, /teams\.season_id is distinct from v_pass\.season_id/);
  assert.match(sql, /status not in \('ACTIVE', 'REJECTED'\)/);
  assert.match(sql, /create policy "family_media_passes_admin_read"[\s\S]*using \(public\.is_admin_role\(\)\)/);
  assert.doesNotMatch(sql, /family_media_passes_member_read/);
  assert.match(sql, /create or replace function public\.save_family_media_pass/);
  assert.match(sql, /revoke all on function public\.save_family_media_pass/);
  assert.match(sql, /grant execute on function public\.save_family_media_pass[\s\S]*to service_role/);
});

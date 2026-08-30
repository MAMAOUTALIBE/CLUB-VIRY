import type { ProfileStatus } from "@/lib/db/types";

export type FamilyOperationsAnomalyCode =
  | "NO_ACCOUNT"
  | "ACCOUNT_INACTIVE"
  | "NO_PASS"
  | "PASS_INACTIVE"
  | "NO_TEAM"
  | "NO_RESOURCE";

export type FamilyOperationsReadiness = {
  accountStatuses: ProfileStatus[];
  hasPass: boolean;
  passIsCurrent: boolean;
  teamCount: number;
  resourceCount: number;
};

export function canLoadFamilyOperationsResources(
  input: Pick<FamilyOperationsReadiness, "accountStatuses" | "passIsCurrent" | "teamCount">
): boolean {
  return input.accountStatuses.some((status) => status === "ACTIVE") && input.passIsCurrent && input.teamCount > 0;
}

export function buildFamilyOperationsAnomalies(
  input: FamilyOperationsReadiness
): Array<{ code: FamilyOperationsAnomalyCode; label: string }> {
  const anomalies: Array<{ code: FamilyOperationsAnomalyCode; label: string }> = [];
  const hasActiveAccount = input.accountStatuses.some((status) => status === "ACTIVE");

  if (input.accountStatuses.length === 0) {
    anomalies.push({ code: "NO_ACCOUNT", label: "Aucun compte famille rattaché" });
  } else if (!hasActiveAccount) {
    anomalies.push({ code: "ACCOUNT_INACTIVE", label: "Aucun compte famille actif" });
  }
  if (!input.hasPass) anomalies.push({ code: "NO_PASS", label: "Aucun Pass Famille Média pour la saison courante" });
  if (input.hasPass && !input.passIsCurrent) anomalies.push({ code: "PASS_INACTIVE", label: "Le Pass Famille Média courant est inactif ou hors période" });
  if (input.hasPass && input.teamCount === 0) anomalies.push({ code: "NO_TEAM", label: "Aucune équipe autorisée sur le pass" });
  if (input.resourceCount === 0) anomalies.push({ code: "NO_RESOURCE", label: "Aucune ressource publiée accessible" });

  return anomalies;
}

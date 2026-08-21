import { Admin360Explorer } from "@/components/admin/Admin360Explorer";

export const metadata = {
  title: "CRM Familles"
};

export default function AdminFamiliesPage() {
  return (
    <>
          <Admin360Explorer
            description="Vue 360 des foyers : enfants rattachés, membres du foyer, contact principal, documents et paiements à suivre. Ouvrez un dossier famille depuis le CRM et archivez les foyers inactifs — l'archivage est réversible depuis la corbeille."
            endpoint="/api/admin/families?limit=100"
            kind="families"
            title="Familles"
          />
    </>
  );
}

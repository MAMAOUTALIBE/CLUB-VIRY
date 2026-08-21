import { Admin360Explorer } from "@/components/admin/Admin360Explorer";

export const metadata = {
  title: "CRM Familles"
};

export default function AdminFamiliesPage() {
  return (
    <>
          <Admin360Explorer
            description="Vue 360 des foyers : enfants rattaches, membres du foyer, contact principal, documents et paiements a suivre."
            endpoint="/api/admin/families?limit=100"
            kind="families"
            title="Familles"
          />
    </>
  );
}

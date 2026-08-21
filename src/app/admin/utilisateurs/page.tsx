import { PermissionsReference } from "@/components/admin/modules/PermissionsReference";
import { UtilisateursAdmin } from "@/components/admin/modules/UtilisateursAdmin";

export const metadata = {
  title: "CRM Utilisateurs & permissions"
};

export default function AdminUtilisateursPage() {
  return (
    <div className="grid gap-6">
      <UtilisateursAdmin />
      <PermissionsReference />
    </div>
  );
}

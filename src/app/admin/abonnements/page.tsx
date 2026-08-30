import { AbonnementsAdmin } from "@/components/admin/modules/AbonnementsAdmin";
import { FamilyMediaPassesAdmin } from "@/components/admin/modules/FamilyMediaPassesAdmin";

export const metadata = {
  title: "CRM Abonnements"
};

export default function AdminAbonnementsPage() {
  return (
    <div className="grid gap-6">
      <FamilyMediaPassesAdmin />
      <AbonnementsAdmin />
    </div>
  );
}

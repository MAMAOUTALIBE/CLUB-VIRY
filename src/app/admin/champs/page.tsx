import { CustomFieldsAdmin } from "@/components/admin/modules/CustomFieldsAdmin";

export const metadata = {
  title: "CRM Champs personnalisés"
};

export default function AdminChampsPage() {
  return (
    <>
      <CustomFieldsAdmin />
    </>
  );
}

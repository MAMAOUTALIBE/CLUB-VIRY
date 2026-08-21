import { AuditLogAdmin } from "@/components/admin/modules/AuditLogAdmin";

export const metadata = {
  title: "CRM Journal d'audit"
};

export default function AdminJournalPage() {
  return (
    <>
          <AuditLogAdmin />
    </>
  );
}

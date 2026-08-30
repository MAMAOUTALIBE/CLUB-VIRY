import { Admin360Detail } from "@/components/admin/Admin360Detail";
import { FamilyAccessAdmin } from "@/components/admin/FamilyAccessAdmin";

export const metadata = {
  title: "Detail famille CRM"
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminFamilyDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="grid gap-6">
      <Admin360Detail backHref="/admin/familles" endpoint={`/api/admin/families/${id}`} kind="family" />
      <FamilyAccessAdmin familyId={id} />
    </div>
  );
}

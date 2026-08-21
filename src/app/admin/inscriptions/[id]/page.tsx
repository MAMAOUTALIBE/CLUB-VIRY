import { Admin360Detail } from "@/components/admin/Admin360Detail";

export const metadata = {
  title: "Detail inscription CRM"
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminRegistrationDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
          <Admin360Detail backHref="/admin/inscriptions" endpoint={`/api/admin/registrations/${id}`} kind="registration" />
    </>
  );
}

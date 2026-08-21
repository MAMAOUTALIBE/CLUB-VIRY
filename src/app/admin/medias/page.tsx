import { MediaAdmin } from "@/components/admin/modules/MediaAdmin";
import { MediaAssetsAdmin } from "@/components/admin/modules/MediaAssetsAdmin";

export const metadata = {
  title: "CRM Médiathèque"
};

export default function AdminMediaPage() {
  return (
    <>
          <MediaAssetsAdmin />
          <MediaAdmin />
    </>
  );
}

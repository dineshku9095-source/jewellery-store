import { StaticPage } from "@/components/StaticPage";
import { apiGet } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { settings } = await apiGet<{ settings: { contactEmail?: string; contactPhone?: string; address?: string } }>(
    "/api/settings/public"
  );

  return (
    <StaticPage title="Contact">
      <p>Reach our team during studio hours (IST).</p>
      {settings.contactEmail ? <p>Email: {settings.contactEmail}</p> : null}
      {settings.contactPhone ? <p>Phone: {settings.contactPhone}</p> : null}
      {settings.address ? <p>Address: {settings.address}</p> : null}
    </StaticPage>
  );
}

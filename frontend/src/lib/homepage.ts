import { DEFAULT_HOMEPAGE_CONTENT, type HomepageContent } from "@jewellery/shared";
import { apiGet } from "@/lib/api";

export type PublicSettings = {
  storeName: string;
  tagline?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  whatsappNumber?: string;
  address?: string | null;
  currency: string;
  homepage: HomepageContent;
};

export async function fetchPublicSettings(): Promise<PublicSettings> {
  try {
    const data = await apiGet<{ settings: PublicSettings }>("/api/settings/public");
    return {
      ...data.settings,
      homepage: data.settings.homepage ?? DEFAULT_HOMEPAGE_CONTENT,
    };
  } catch {
    return {
      storeName: "Queen's Jewels Aura",
      currency: "INR",
      homepage: DEFAULT_HOMEPAGE_CONTENT,
    };
  }
}

export { DEFAULT_HOMEPAGE_CONTENT };
export type { HomepageContent };

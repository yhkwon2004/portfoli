import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * `output: "export"` has no server to evaluate a route at request time, so the route has to
 * declare that it is fully static. Next refuses the build rather than guess.
 */
export const dynamic = "force-static";


/**
 * One page, two languages.
 *
 * The chapter and record deep links are fragments (`#projects/<id>`), and a fragment is not a
 * separate URL to a crawler — listing them would be noise. What is worth declaring is that the
 * same document exists in Korean and English, which is what `alternates.languages` says.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: { ko: `${SITE_URL}/`, en: `${SITE_URL}/?lang=en` } },
    },
  ];
}

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * `output: "export"` has no server to evaluate a route at request time, so the route has to
 * declare that it is fully static. Next refuses the build rather than guess.
 */
export const dynamic = "force-static";


export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

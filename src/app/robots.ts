import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * `output: "export"` has no server to evaluate a route at request time, so the route has to
 * declare that it is fully static. Next refuses the build rather than guess.
 */
export const dynamic = "force-static";


/** `/render/` is the offline harness scripts/render-media.mjs films the 3D scenes through. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/render/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

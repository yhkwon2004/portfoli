import { Harness } from "@/components/three/Harness";

/**
 * /render?scene=evidence&w=1280&h=720 — the media render harness (scripts/render-media.mjs).
 * Not linked from anywhere, excluded from the sitemap and marked noindex.
 */
export default function RenderPage() {
  return <Harness />;
}

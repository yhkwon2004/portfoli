import { src, srcSet } from "@/lib/assets";

type Props = {
  /** Master path from the content data, e.g. `/assets/evidence/x.jpg`. */
  master: string;
  alt: string;
  /** The box this image fills, as a `sizes` attribute. Without it the browser assumes 100vw. */
  sizes: string;
  className?: string;
  /** Leave lazy except for images above the fold on the first chapter. */
  priority?: boolean;
};

/**
 * An image from the two pre-rendered tiers.
 *
 * Not `next/image`: under `output: "export"` there is no optimization server, so next/image
 * would run in `unoptimized` mode and add a wrapper around the same `<img>` we emit here —
 * while `scripts/images.mjs` has already done the resizing at build time. A bare `<img>` with
 * an explicit `srcset` and `sizes` is smaller and says exactly what happens.
 *
 * The original carried an `onerror` handler on every tag to fall back from the thumbnail to
 * the full-size original. That is gone because it cannot fire: the build generates both tiers
 * from the same master list, so a thumbnail exists for every path in the data — and if one
 * ever didn't, a silent swap to a 4 MB camera JPEG is the wrong repair anyway.
 */
export function Img({ master, alt, sizes, className, priority = false }: Props) {
  return (
    <img
      src={src(master, "thumb")}
      srcSet={srcSet(master)}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      // The reel pre-warms the next slide, so its image must not be deprioritised.
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

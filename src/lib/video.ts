import type { Video } from "@/lib/types";

/** The 11-character YouTube id in any of the link shapes the data uses, or null. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const id =
      u.hostname === "youtu.be"
        ? u.pathname.slice(1)
        : /(^|\.)youtube\.com$/.test(u.hostname)
          ? (u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).at(-1) ?? null)
          : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** The poster YouTube serves for a video — the only thing fetched from YouTube before a click. */
export const youtubePoster = (v: Video): string | null => {
  const id = youtubeId(v.url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};

/** The privacy-enhanced embed, playing from the start once the visitor asks for it. */
export const youtubeEmbed = (v: Video): string | null => {
  const id = youtubeId(v.url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1` : null;
};

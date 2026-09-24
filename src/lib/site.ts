import { PORTFOLIO } from "@/data/portfolio";
import { awards, certifications, education, experience, honoured, profile, projects, stats } from "@/lib/select";

/**
 * Where the site lives. Used for canonical URLs, the OG card and the JSON-LD `@id`, all of
 * which must be absolute — a relative OG image URL is simply ignored by every crawler.
 *
 * Override with NEXT_PUBLIC_SITE_URL at build time; the default is the GitHub Pages address
 * for this repository.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://yhkwon2004.github.io/portfoli").replace(/\/$/, "");

export const OWNER_EN = PORTFOLIO.owner.en;
export const OWNER_KO = PORTFOLIO.owner.ko;

/**
 * Schema.org `Person`, built from the records rather than written by hand.
 *
 * This is the machine-readable half of the portfolio: `knowsAbout` is the real tag set,
 * `alumniOf` the real schools, and `hasCredential`/`award` the real certificates and honours.
 * A search engine or an ATS reading this gets the same claims the page makes, and gets them
 * without having to run the sand simulation.
 */
export function personJsonLd(): Record<string, unknown> {
  const skills = [...new Set([...projects, ...experience].flatMap((i) => i.tags))].sort();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: OWNER_EN,
    alternateName: OWNER_KO,
    description: PORTFOLIO.headline.en,
    url: SITE_URL,
    image: `${SITE_URL}/og.png`,
    sameAs: ["https://github.com/yhkwon2004"],
    knowsAbout: skills,
    knowsLanguage: [
      { "@type": "Language", name: "Korean", alternateName: "ko" },
      { "@type": "Language", name: "English", alternateName: "en" },
    ],
    alumniOf: education.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.t.en,
      alternateName: e.t.ko,
    })),
    hasOccupation: experience.map((e) => ({
      "@type": "Role",
      roleName: e.t.en,
      description: e.s.en,
    })),
    hasCredential: certifications.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.t.en,
      alternateName: c.t.ko,
      dateCreated: c.year || undefined,
    })),
    // Awards are plain strings in schema.org; the count is what carries here, and the full
    // record for each one is on the page itself. The honours a work won without a certificate
    // on the wall follow the certificates, named with the work they were won for.
    award: [
      ...awards.map((a) => a.t.ko),
      ...honoured.flatMap((p) => (p.honor ? [`${p.honor.event.ko} ${p.honor.grade.ko} — ${p.t.ko}`] : [])),
    ],
  };
}

/**
 * A `CollectionPage` listing the works, so every project is individually addressable.
 * Each entry points at its own deep link — the URLs this port introduced.
 */
export function worksJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/#works`,
    name: `${OWNER_EN} — Works`,
    isPartOf: { "@id": `${SITE_URL}/#person` },
    numberOfItems: stats.projects,
    about: { "@id": `${SITE_URL}/#person` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: stats.projects,
      itemListElement: projects.map((p, n) => ({
        "@type": "ListItem",
        position: n + 1,
        item: {
          "@type": "CreativeWork",
          name: p.t.ko,
          alternateName: p.t.en,
          description: p.s.ko,
          url: `${SITE_URL}/#projects/${p.id}`,
          dateCreated: p.year || undefined,
          keywords: p.tags.join(", "),
          creator: { "@id": `${SITE_URL}/#person` },
        },
      })),
    },
  };
}

/** The description both the meta tag and the OG card use. */
export const DESCRIPTION = {
  ko: `${PORTFOLIO.owner.ko} 포트폴리오 — 수상 ${stats.awards}건 · 프로젝트 ${stats.projects}건 · 자격 ${stats.certifications}건. ${profile.t.ko}`,
  en: `${PORTFOLIO.owner.en} — ${stats.awards} awards, ${stats.projects} projects, ${stats.certifications} certifications. ${profile.t.en}`,
} as const;

"use client";

import { Txt } from "@/components/Txt";
import { Scrub } from "@/components/motion/Scrub";
import { SectionHead } from "@/components/site/SectionHead";
import { UI } from "@/data/ui";
import { domains, education, maxDomainProof, profile } from "@/lib/select";
import type { Bi } from "@/lib/types";

/**
 * Who, in the author's own words: the profile summary, set large and lit word by word as it is
 * read, beside the fields the work actually falls in — each a bar measured in works.
 */
export function About() {
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHead idx="01" label={UI.aboutIdx} a={UI.aboutTitleA} b={UI.aboutTitleB} id="about-title" />
        <div className="about-grid">
          <Scrub v={profile.s} className="about-lede" />
          <aside className="about-side">
            <ul className="about-tags" data-reveal="up">
              {profile.tags.map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
            <ol className="about-fields">
              {domains.map((d, n) => (
                <li key={d.name.en} data-reveal="up" style={{ "--d": n * 70, "--w": d.proof / maxDomainProof } as React.CSSProperties}>
                  <span className="about-field-top">
                    <Txt v={d.name} />
                    <b className="mono">{d.proof}</b>
                  </span>
                  <i aria-hidden="true" />
                </li>
              ))}
            </ol>
            <p className="about-edu label" data-reveal="fade">
              {education.map((e, n) => (
                <span key={e.id}>
                  {n > 0 && " · "}
                  <Txt v={e.t as Bi} />
                </span>
              ))}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

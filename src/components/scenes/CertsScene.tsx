"use client";

import { Txt } from "@/components/Txt";
import { certifications } from "@/lib/select";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

/** Engraved plates, stamped in one at a time — the visual language of a certificate. */
export function CertsScene({ index, live }: { index: number; live: boolean }) {
  return (
    <Scene index={index} live={live} className="s-certs" gutter>
      <Txt v={UI.certsEyebrow} as="p" className="eyebrow rise" style={{ "--i": 0 } as React.CSSProperties} />
      <div className="certs">
        {certifications.map((item, n) => (
          <div className="cert" key={item.id} style={{ "--i": n + 1 } as React.CSSProperties}>
            <span className="seal" aria-hidden="true">
              CERT {String(n + 1).padStart(2, "0")}
            </span>
            <span className="yr">{item.year}</span>
            <span className="hair" aria-hidden="true" />
            <Txt v={item.t} as="span" className="ttl" />
            <Txt v={item.s} as="span" className="sub" />
          </div>
        ))}
      </div>
    </Scene>
  );
}

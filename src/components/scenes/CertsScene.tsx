"use client";

import { Txt } from "@/components/Txt";
import { Decode } from "@/components/motion/Decode";
import { riseAt } from "@/components/motion/timing";
import { certifications } from "@/lib/select";
import { UI } from "@/data/ui";
import { Scene } from "@/components/scenes/Scene";

/**
 * Engraved plates, stamped in one at a time — the visual language of a certificate.
 *
 * Each stamp is three beats: the plate slams down out of focus and settles, an ink ring leaves
 * the seal like a shockwave from the impact, and the seal and year read themselves off the
 * plate. Plates land 0.13s apart (panels.css), and the decoders are keyed to the same clock.
 */
export function CertsScene({ index, live }: { index: number; live: boolean }) {
  return (
    <Scene index={index} live={live} className="s-certs" gutter>
      <Decode
        v={UI.certsEyebrow}
        as="p"
        className="eyebrow rise"
        style={{ "--i": 0 } as React.CSSProperties}
        delay={riseAt(0)}
      />
      <div className="certs">
        {certifications.map((item, n) => {
          const lands = 360 + (n + 1) * 130;
          return (
            <div className="cert" key={item.id} style={{ "--i": n + 1 } as React.CSSProperties}>
              <span className="ink" aria-hidden="true" />
              {/* Decorative, as before: the number restates the plate's position. */}
              <span className="seal" aria-hidden="true">
                <Decode v={`CERT ${String(n + 1).padStart(2, "0")}`} delay={lands + 380} />
              </span>
              <Decode v={item.year} className="yr" delay={lands + 260} />
              <span className="hair" aria-hidden="true" />
              <Txt v={item.t} as="span" className="ttl" />
              <Txt v={item.s} as="span" className="sub" />
            </div>
          );
        })}
      </div>
    </Scene>
  );
}

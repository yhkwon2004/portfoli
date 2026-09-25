"use client";

import { useSyncExternalStore } from "react";
import { useLang } from "@/components/LangProvider";
import { Decode } from "@/components/motion/Decode";
import { useCut } from "@/components/motion/context";
import { LAST } from "@/data/chapters";
import { text } from "@/lib/i18n";
import { UI } from "@/data/ui";
import type { Telemetry as Reading } from "@/lib/sim/hourglass";
import type { Store } from "@/lib/store";

type Props = {
  /** The pour's latest reading. Subscribed to here, so a sample re-renders this block alone. */
  store: Store<Reading | null>;
  /** Re-aims the pour at the current chapter, restarting the surge. */
  onReset: () => void;
};

/** Fixed-width so a changing digit never shifts the column. */
const num = (v: number, digits = 2): string => v.toFixed(digits);

/** The static HTML has no reading; it renders the placeholders until the pour reports. */
const none = (): null => null;

/**
 * The instrument block.
 *
 * The reference puts a live `MainLogo Quaternion` readout beside its hero — the site narrating
 * the state of its own 3D object. This is the same device over the thing this site actually
 * simulates: the pour.
 *
 * Every figure is measured. FLOW is the number of grains in the air this frame; FILL and TRGT
 * are the eased level and where it is heading; VOL is the summed heightmap; REPOSE is the
 * angle the pile has genuinely settled at, which drifts as it grows; SURGE is how hard the
 * neck is still running after the last cut. Watch FLOW spike and SURGE decay on a chapter
 * change — that is the simulation, not a loop of canned numbers.
 *
 * `aria-hidden`: it is an ambient readout of a decorative canvas, and announcing six figures
 * that change eight times a second would make the page unusable with a screen reader. The
 * information a non-visual reader needs about position is in the chapter live region.
 */
export function TelemetryBlock({ store, onReset }: Props) {
  const lang = useLang();
  const reading = useSyncExternalStore(store.subscribe, store.get, none);
  // The block stands aside on the two bookends; each time it steps back in, its head re-reads.
  const { chapter } = useCut();
  const bookend = chapter === 0 || chapter === LAST;

  return (
    <div className="telemetry" aria-hidden="true">
      <Decode v={UI.telemetryTitle} as="p" className="tel-head" delay={260} replay={bookend} />

      <dl className="tel-grid">
        <Row n={0} label="FLOW" value={reading ? String(reading.flow).padStart(3, "0") : "---"} />
        <Row n={1} label="FILL" value={reading ? num(reading.fill) : "--.--"} />
        <Row n={2} label="TRGT" value={reading ? num(reading.target) : "--.--"} />
        <Row n={3} label="VOL" value={reading ? num(reading.volume) : "--.--"} />
        <Row n={4} label="ANG" value={reading ? `${num(reading.repose, 1)}°` : "--.-°"} />
        <Row n={5} label="SRG" value={reading ? num(reading.surge) : "--.--"} />
      </dl>

      {/*
        A bar per channel rather than a second set of digits: the shape of the block changes as
        the pour runs, which is what makes it read as an instrument at a glance rather than as
        a table you have to parse.
      */}
      <div className="tel-bars">
        <Bar v={reading?.fill ?? 0} />
        <Bar v={reading ? Math.min(1, reading.flow / 260) : 0} />
        <Bar v={reading?.surge ?? 0} />
      </div>

      <button type="button" className="tel-reset" onClick={onReset} tabIndex={-1}>
        {text(UI.telemetryReset, lang)}
      </button>
    </div>
  );
}

function Row({ n, label, value }: { n: number; label: string; value: string }) {
  // `--r` staggers the rows in when the block steps back into the frame after a bookend.
  const style = { "--r": n } as React.CSSProperties;
  return (
    <>
      <dt style={style}>{label}</dt>
      <dd style={style}>{value}</dd>
    </>
  );
}

function Bar({ v }: { v: number }) {
  return (
    <span className="tel-bar">
      <i style={{ transform: `scaleX(${Math.max(0, Math.min(1, v))})` }} />
    </span>
  );
}

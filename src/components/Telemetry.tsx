"use client";

import { useLang } from "@/components/LangProvider";
import { text } from "@/lib/i18n";
import { UI } from "@/data/ui";
import type { Telemetry as Reading } from "@/lib/sim/hourglass";

type Props = {
  reading: Reading | null;
  /** Re-aims the pour at the current chapter, restarting the surge. */
  onReset: () => void;
};

/** Fixed-width so a changing digit never shifts the column. */
const num = (v: number, digits = 2): string => v.toFixed(digits);

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
export function TelemetryBlock({ reading, onReset }: Props) {
  const lang = useLang();

  return (
    <div className="telemetry" aria-hidden="true">
      <p className="tel-head">{UI.telemetryTitle}</p>

      <dl className="tel-grid">
        <Row label="FLOW" value={reading ? String(reading.flow).padStart(3, "0") : "---"} />
        <Row label="FILL" value={reading ? num(reading.fill) : "--.--"} />
        <Row label="TRGT" value={reading ? num(reading.target) : "--.--"} />
        <Row label="VOL" value={reading ? num(reading.volume) : "--.--"} />
        <Row label="ANG" value={reading ? `${num(reading.repose, 1)}°` : "--.-°"} />
        <Row label="SRG" value={reading ? num(reading.surge) : "--.--"} />
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
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

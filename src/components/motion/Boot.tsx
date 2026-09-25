"use client";

type Props = {
  /** Set on the first frame after hydration, when motion is allowed. */
  run: boolean;
};

/**
 * The power-on. A single line of light stretches across a black frame, flares, and the
 * picture splits open from it top and bottom — a display being switched on, which is what
 * the rest of the instrument language has been claiming the frame is.
 *
 * It is in the static HTML, closed, so the page never paints its content and then snaps
 * shut over it when the script arrives. Three things guarantee it can never trap the page:
 *
 *  · with JavaScript off, a <noscript> style in the layout removes it;
 *  · under reduced motion (the OS setting or the site's own switch) the stylesheet removes
 *    it before it is ever seen;
 *  · and it carries a failsafe of its own — if the script never boots, a delayed keyframe
 *    hides it after a few seconds regardless.
 *
 * Pointer-transparent throughout, so nothing underneath is ever unclickable behind it.
 */
export function Boot({ run }: Props) {
  return (
    <div className="boot" data-run={run} aria-hidden="true">
      <i className="boot-half boot-top" />
      <i className="boot-half boot-bot" />
      <i className="boot-flash" />
      <i className="boot-line" />
    </div>
  );
}

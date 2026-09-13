"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Keep Tab inside `ref` while `active`, and give focus back where it came from on close.
 *
 * The original set `role="dialog" aria-modal="true"` and focused the close button, but did
 * nothing to hold focus: pressing Tab walked straight out of the sheet and into the 35 wall
 * tiles behind it — still rendered, still focusable, and covered by a backdrop the visitor
 * could not see past. `aria-modal` tells a screen reader the rest is inert; it does not make
 * it so for the keyboard. This does.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;

    const restoreTo = document.activeElement as HTMLElement | null;

    const focusable = (): HTMLElement[] =>
      Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    /*
     * Move focus in on the next frame, not in this effect.
     *
     * React commits the DOM and runs effects before the browser recalculates style, so at this
     * point the dialog is still rendered with the `visibility: hidden` it had a moment ago —
     * and `focus()` on a hidden element is specified to do nothing, silently. Focusing here
     * looks correct, logs correct, and leaves focus sitting on the tile behind the backdrop.
     * One frame later the dialog is really visible and the call takes.
     */
    const raf = requestAnimationFrame(() => {
      const first = focusable()[0];
      if (first) {
        first.focus();
      } else {
        // No controls yet: park focus on the container so it is never left behind the
        // backdrop, and so the next Tab starts from inside.
        root.tabIndex = -1;
        root.focus();
      }
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (!firstEl || !lastEl) return;

      const current = document.activeElement;
      const outside = !root.contains(current);

      // Wrapping at either end — and pulling focus back if it is outside the trap at all,
      // which is where it starts before the frame above lands.
      if (e.shiftKey && (current === firstEl || outside)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && (current === lastEl || outside)) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown, true);
      // Only restore if focus is still inside the closing dialog, or was never moved out of
      // the body — otherwise the visitor has deliberately clicked elsewhere and yanking focus
      // back would be rude.
      const stillInside = root.contains(document.activeElement);
      if (stillInside || document.activeElement === document.body) restoreTo?.focus?.();
    };
  }, [ref, active]);
}

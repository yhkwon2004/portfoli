"use client";

import { useEffect } from "react";

/**
 * The page's one IntersectionObserver.
 *
 * Every element marked `data-reveal` (and every `.split` heading) is observed, and the first
 * time it comes within reach of the viewport it is stamped `data-inview` — once, and never
 * removed, so nothing re-animates on the way back up. A MutationObserver picks up elements
 * that mount later (a filtered grid, an opened sheet), so a component never has to register
 * itself.
 *
 * With motion off the stamp still lands — the stylesheet just drops the transition — so no
 * content can be stranded invisible behind an animation that will never run.
 */
export function RevealRoot() {
  useEffect(() => {
    const SELECTOR = "[data-reveal]:not([data-inview]), .split:not([data-inview])";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.inview = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    const scan = (root: ParentNode) => root.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    scan(document);

    const mo = new MutationObserver((records) => {
      for (const r of records)
        r.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches(SELECTOR)) io.observe(n);
          scan(n);
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}

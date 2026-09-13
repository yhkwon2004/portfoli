"use client";

import { useEffect, useState, type RefObject } from "react";

export type Size = { readonly w: number; readonly h: number };

/**
 * The element's CSS box, kept current.
 *
 * A window `resize` listener — what the original used — misses everything else that changes
 * a box: a device rotating into a different safe-area inset, a desktop browser's zoom, or a
 * scrollbar appearing. ResizeObserver sees all of them, and reports the element rather than
 * the viewport, which is what the canvases actually need to size their backing store.
 */
export function useElementSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}

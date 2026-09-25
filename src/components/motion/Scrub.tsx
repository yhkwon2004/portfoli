"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/components/LangProvider";
import { useMotion } from "@/components/site/MotionContext";
import { resolve } from "@/lib/i18n";
import { clamp01, onScrollFrame } from "@/lib/scroll";
import type { Bi } from "@/lib/types";

type Props = {
  v: Bi;
  className?: string;
};

/**
 * A paragraph that brightens word by word as it is scrolled through — reading pace, set by
 * the reader's own hand. Each word carries its position as `--w` (0 → 1); the container
 * carries the scroll position as `--p`; the stylesheet turns the difference into opacity.
 * With motion off `--p` is left unset, which the stylesheet reads as 1: fully lit.
 */
export function Scrub({ v, className }: Props) {
  const lang = useLang();
  const ref = useRef<HTMLParagraphElement>(null);
  const { motion } = useMotion();
  const r = resolve(v, lang);
  const words = r.text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motion) return;
    const off = onScrollFrame(() => {
      const box = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Lit from when the paragraph's top is 85% down the screen to when its bottom is at 55%.
      const p = clamp01((vh * 0.85 - box.top) / (box.height + vh * 0.3));
      el.style.setProperty("--p", p.toFixed(3));
    });
    return () => {
      off();
      el.style.removeProperty("--p");
    };
  }, [motion]);

  return (
    <p ref={ref} className={`scrub${className ? ` ${className}` : ""}`} lang={r.lang}>
      {words.map((w, n) => (
        <span key={n}>
          <span className="sw" style={{ "--w": (n / words.length).toFixed(3) } as React.CSSProperties}>
            {w}
          </span>{" "}
        </span>
      ))}
    </p>
  );
}

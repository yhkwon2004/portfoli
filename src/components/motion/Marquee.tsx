type Props = {
  items: readonly React.ReactNode[];
  /** Seconds for one full pass. */
  duration?: number;
  dir?: 1 | -1;
  className?: string;
};

/**
 * An endless ticker. The track is rendered twice and each copy slides its own width, so the
 * seam is never visible. The second copy is `aria-hidden`: the items are read once.
 */
export function Marquee({ items, duration = 38, dir = 1, className }: Props) {
  const track = (hidden: boolean) => (
    <div className="marquee-track" aria-hidden={hidden || undefined}>
      {items.map((it, n) => (
        <span className="marquee-item" key={n}>
          {it}
        </span>
      ))}
    </div>
  );
  return (
    <div
      className={`marquee${className ? ` ${className}` : ""}`}
      data-dir={dir}
      style={{ "--dur": `${duration}s` } as React.CSSProperties}
    >
      {track(false)}
      {track(true)}
    </div>
  );
}

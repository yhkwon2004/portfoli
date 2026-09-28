"use client";

import { useEffect, useRef, useState } from "react";
import { AiVisual } from "@/components/ai/AiVisual";
import { Img } from "@/components/Img";
import { Txt } from "@/components/Txt";
import { useLang } from "@/components/LangProvider";
import { useMotion } from "@/components/site/MotionContext";
import { aiMedia, aiWorkFor, isScene } from "@/data/ai";
import { DETAIL_LABELS } from "@/data/labels";
import { PRESS } from "@/data/press";
import { rankOf, topicTags } from "@/data/ranks";
import { UI } from "@/data/ui";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { asset } from "@/lib/assets";
import { text } from "@/lib/i18n";
import { cover, gallery } from "@/lib/select";
import { youtubeEmbed, youtubePoster } from "@/lib/video";
import type { DetailKey, Img as ImgT, Item, Video } from "@/lib/types";

type Props = {
  item: Item | null;
  set: readonly Item[];
  onStep: (delta: number) => void;
  onClose: () => void;
};

/**
 * The full record, as a sheet over the page.
 *
 * It opens out of whatever was pressed: the card's picture and the sheet's head share a
 * `view-transition-name`, so where the browser supports View Transitions the picture itself
 * flies from the card into place and the page cross-fades around it. Elsewhere the sheet
 * rises. ← → step through the set the record belongs to — every work or every award — and
 * Escape closes. Focus is held inside while it is open, and handed back on close.
 *
 * Every picture says what it is: a concept render is labelled as one, and a photograph that is
 * not the author's own carries its source. A demo video stays a still until it is asked for —
 * nothing is loaded from YouTube but the poster until then.
 */
export function Dossier({ item, set, onStep, onClose }: Props) {
  const lang = useLang();
  const { motion } = useMotion();
  const sheet = useRef<HTMLDivElement>(null);
  const open = item !== null;
  useFocusTrap(sheet, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onStep(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onStep(-1);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose, onStep]);

  // Page scroll is held while the sheet is open; the sheet is the one thing that scrolls.
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      lenis?.start();
      document.documentElement.style.removeProperty("overflow");
    };
  }, [open]);

  useEffect(() => {
    sheet.current?.scrollTo({ top: 0 });
  }, [item]);

  const at = item ? set.indexOf(item) : -1;
  const ai = item ? aiWorkFor(item.id) : undefined;
  const media = ai && isScene(ai.visual) ? aiMedia(ai.visual) : null;
  const lead = item ? cover(item) : null;
  const rest = item ? gallery(item) : [];
  const rank = item ? rankOf(item) : null;
  const cert = lead?.r === "certificate";
  const press = item ? PRESS.filter((p) => (p.related as readonly string[]).includes(item.id)) : [];
  const badge = item
    ? rank
      ? lang === "en"
        ? rank.en
        : rank.key
      : item.honor
        ? text(item.honor.grade, lang)
        : item.featured
          ? text(UI.featured, lang)
          : ""
    : "";

  return (
    <div
      className="dossier"
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-labelledby={open ? "dossier-title" : undefined}
      aria-label={open ? undefined : text(UI.dialogLabel, lang)}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      {...(!open ? { inert: true } : {})}
    >
      <div className="dos-sheet" ref={sheet}>
        {item && (
          <>
            <div className="dos-bar">
              <button type="button" className="dos-close" onClick={onClose}>
                <span aria-hidden="true">✕</span> <Txt v={UI.close} />
              </button>
              <div className="dos-steps">
                <span className="mono dos-pos">
                  {String(at + 1).padStart(2, "0")} / {String(set.length).padStart(2, "0")}
                </span>
                <button type="button" onClick={() => onStep(-1)} disabled={at <= 0} aria-label={text(UI.prevRecord, lang)}>
                  ←
                </button>
                <button type="button" onClick={() => onStep(1)} disabled={at >= set.length - 1} aria-label={text(UI.nextRecord, lang)}>
                  →
                </button>
              </div>
            </div>

            <div className="dos-body" key={item.id}>
              <figure className={`dos-media${cert ? " is-cert" : ""}`}>
                {media ? (
                  motion ? (
                    <video src={asset(media.video)} poster={asset(media.poster)} autoPlay muted loop playsInline aria-hidden="true" />
                  ) : (
                    <img src={asset(media.poster)} alt="" />
                  )
                ) : lead ? (
                  <Img master={lead.u} alt={lead.a} sizes="(max-width: 900px) 100vw, 1100px" priority />
                ) : (
                  <span className="dos-blank" aria-hidden="true">
                    {item.t.en.slice(0, 1)}
                  </span>
                )}
                {media && <Txt v={UI.concept} as="span" className="dos-concept label" />}
                {!media && lead && <Caption img={lead} />}
              </figure>

              <header className="dos-head">
                <p className="dos-meta">
                  {badge && <span className={`chip${item.honor || rank ? " chip-honor" : ""}`}>{badge}</span>}
                  {item.year && <span className="mono">{item.year}</span>}
                  {item.honor && (
                    <span className="dos-honor">
                      <Txt v={item.honor.event} />
                      {item.honor.track && (
                        <>
                          {" · "}
                          <Txt v={item.honor.track} />
                        </>
                      )}
                    </span>
                  )}
                </p>
                <Txt v={item.t} as="h2" />
                <span id="dossier-title" className="sr-only">
                  {text(item.t, lang)}
                </span>
                <Txt v={item.s} as="p" className="dos-lede" />
                {topicTags(item).length > 0 && (
                  <ul className="dos-tags">
                    {topicTags(item).map((t) => (
                      <li key={t} className="chip">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </header>

              {item.details && (
                <div className="dos-details">
                  {(Object.keys(item.details) as DetailKey[]).map((k) => {
                    const v = item.details?.[k];
                    if (!v) return null;
                    return (
                      <section key={k} className="dos-card">
                        <Txt v={DETAIL_LABELS[k]} as="h3" className="label" />
                        {Array.isArray(v) ? (
                          <ul lang="ko">
                            {v.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        ) : (
                          <p lang="ko">{v as string}</p>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}

              {item.videos && item.videos.length > 0 && (
                <section className="dos-section">
                  <Txt v={UI.videos} as="h3" className="label" />
                  <div className="dos-videos">
                    {item.videos.map((v) => (
                      <Facade key={v.url} video={v} />
                    ))}
                  </div>
                </section>
              )}

              {ai && (
                <section className="dos-section">
                  <Txt v={UI.howItWorks} as="h3" className="label" />
                  {isScene(ai.visual) && (
                    <div className="dos-diagram">
                      <AiVisual kind={ai.visual} play={open && motion} fit="meet" />
                    </div>
                  )}
                  <ol className="dos-steps-list" style={{ "--n": ai.steps.length } as React.CSSProperties}>
                    {ai.steps.map((s, k) => (
                      <li key={s.en}>
                        <b className="mono">{String(k + 1).padStart(2, "0")}</b>
                        <Txt v={s} />
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {media && (
                <section className="dos-section">
                  <Txt v={UI.renders} as="h3" className="label" />
                  <div className="dos-gallery">
                    {media.stills.map((u, n) => (
                      <img key={u} src={asset(u)} alt={`${text(item.t, lang)} — ${text(ai!.steps[n + 1] ?? ai!.steps[0]!, lang)}`} loading="lazy" />
                    ))}
                  </div>
                </section>
              )}

              {rest.length > 0 && (
                <section className="dos-section">
                  <Txt v={UI.gallery} as="h3" className="label" />
                  <div className="dos-gallery">
                    {rest.map((m) => (
                      <figure key={m.u}>
                        <Img master={m.u} alt={m.a} sizes="(max-width: 900px) 50vw, 360px" />
                        <Caption img={m} />
                      </figure>
                    ))}
                  </div>
                </section>
              )}

              {press.length > 0 && (
                <section className="dos-section">
                  <Txt v={UI.pressLabel} as="h3" className="label" />
                  <ul className="dos-press">
                    {press.map((p) => (
                      <li key={p.id}>
                        <a href={p.url} target="_blank" rel="noopener noreferrer">
                          <span className="mono">
                            {p.date.replaceAll("-", ".")} · <Txt v={p.publisher} />
                          </span>
                          <Txt v={p.title} as="span" className="dos-press-t" />
                          <span aria-hidden="true">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {item.links && item.links.length > 0 && (
                <section className="dos-section">
                  <Txt v={UI.links} as="h3" className="label" />
                  <ul className="dos-links">
                    {item.links.map((l) => (
                      <li key={l.url}>
                        <a href={l.url} target="_blank" rel="noopener noreferrer">
                          {l.label} <span aria-hidden="true">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** What a picture is, where that is not obvious: a concept visual, or someone else's photograph. */
function Caption({ img }: { img: ImgT }) {
  const lang = useLang();
  if (!img.concept && !img.credit) return null;
  return (
    <figcaption className="dos-cap mono">
      {img.concept && <span className="dos-cap-concept">{text(UI.conceptVisual, lang)}</span>}
      {img.credit && (
        <a href={img.credit.url} target="_blank" rel="noopener noreferrer">
          {text(UI.source, lang)} · {img.credit.label}
        </a>
      )}
    </figcaption>
  );
}

/**
 * A YouTube demo as a still and a play button. Pressing it swaps in the privacy-enhanced
 * player; until then the only request to YouTube is for the poster image.
 */
function Facade({ video }: { video: Video }) {
  const lang = useLang();
  const [play, setPlay] = useState(false);
  const poster = youtubePoster(video);
  const embed = youtubeEmbed(video);
  if (!embed) {
    return (
      <a className="dos-video" href={video.url} target="_blank" rel="noopener noreferrer">
        <span className="dos-video-t">{video.title} ↗</span>
      </a>
    );
  }
  return (
    <div className="dos-video">
      {play ? (
        <iframe
          src={embed}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} aria-label={`${text(UI.playVideo, lang)} — ${video.title}`}>
          {poster && <img src={poster} alt="" loading="lazy" referrerPolicy="no-referrer" />}
          <span className="dos-play" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="dos-video-t">{video.title}</span>
        </button>
      )}
    </div>
  );
}

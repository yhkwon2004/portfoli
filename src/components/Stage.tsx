"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AmbientSandCanvas } from "@/components/AmbientSandCanvas";
import { GridRoomCanvas } from "@/components/GridRoomCanvas";
import { ContactSheet } from "@/components/ContactSheet";
import { Dossier, type Origin } from "@/components/Dossier";
import { Hourglass } from "@/components/Hourglass";
import { Hud } from "@/components/Hud";
import { TelemetryBlock } from "@/components/Telemetry";
import { LangProvider } from "@/components/LangProvider";
import { Txt } from "@/components/Txt";
import { Boot } from "@/components/motion/Boot";
import { CutFx } from "@/components/motion/CutFx";
import { PointerFx } from "@/components/motion/PointerFx";
import { CutProvider, type CutState } from "@/components/motion/context";
import { AiScene, type AiAsk } from "@/components/scenes/AiScene";
import { AimScene } from "@/components/scenes/AimScene";
import { CertsScene } from "@/components/scenes/CertsScene";
import { CreditsScene } from "@/components/scenes/CreditsScene";
import { GrainScene } from "@/components/scenes/GrainScene";
import { MetricsScene } from "@/components/scenes/MetricsScene";
import { ProfileScene } from "@/components/scenes/ProfileScene";
import { SkillsScene } from "@/components/scenes/SkillsScene";
import { SwotScene } from "@/components/scenes/SwotScene";
import { TimelineScene } from "@/components/scenes/TimelineScene";
import { TitleScene } from "@/components/scenes/TitleScene";
import { WallScene } from "@/components/scenes/WallScene";
import { WorksScene } from "@/components/scenes/WorksScene";
import { CHAPTERS, LAST, chapterAt } from "@/data/chapters";
import { SECONDS_PER_CHAPTER } from "@/data/reel";
import { UI } from "@/data/ui";
import { readLink, useDeepLink, useInitialLang, useStoredLang } from "@/hooks/useDeepLink";
import { useLatestRef } from "@/hooks/useLatestRef";
import { readMotionOff, useStoredMotion } from "@/hooks/useMotionPref";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSceneMachine } from "@/hooks/useSceneMachine";
import { DEFAULT_LANG, text } from "@/lib/i18n";
import { SETS, awards, itemById, projects } from "@/lib/select";
import { createStore } from "@/lib/store";
import type { Telemetry } from "@/lib/sim/hourglass";
import type { Item, Lang } from "@/lib/types";

/** How recent a pointer press has to be to count as the thing that opened a record. */
const PRESS_WINDOW_MS = 1000;

/** The recoil when the reel is pushed past either end — a rubber band, not a wall. */
const recoil = (dir: 1 | -1): Keyframe[] => [
  { translate: "0 0" },
  { translate: `0 ${-dir * 18}px`, offset: 0.22 },
  { translate: `0 ${dir * 5}px`, offset: 0.58 },
  { translate: "0 0" },
];

type Playback = { readonly on: boolean; readonly since: number };
const STOPPED: Playback = { on: false, since: 0 };

/**
 * The projector, the frame, and everything in it.
 *
 * One client component owns the view state — which chapter is live, which language, which
 * record's sheet is open, whether the reel is playing and whether motion is on — because it
 * is genuinely coupled: the sheet suspends the projector, the projector drives the hourglass,
 * the language changes every string on screen at once, and a hand on any control stops the
 * reel playing itself. Pushing them into separate providers would spread one interaction
 * across four files and buy nothing.
 *
 * Every scene is always mounted, so the static export contains the full text of the
 * portfolio — which is what makes this version indexable where the original, a CSR page that
 * built its DOM from a script, was a blank document to a crawler.
 */
export function Stage() {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [openId, setOpenId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [booted, setBooted] = useState(false);
  // Eight samples a second, displayed in one corner: kept out of the stage's state so a sample
  // re-renders the readout and nothing else. See src/lib/store.ts.
  const [telemetry] = useState(() => createStore<Telemetry | null>(null));
  /** Bumped to make the hourglass re-aim at the current chapter and surge again. */
  const [flowNonce, setFlowNonce] = useState(0);
  /** The visitor's own motion switch. The OS preference still wins when it asks for less. */
  const [motionOff, setMotionOff] = useState(false);
  const [play, setPlay] = useState<Playback>(STOPPED);
  /** Which AI work the title card's shortcut asked the AI chapter to open on. */
  const [aiAsk, setAiAsk] = useState<AiAsk>({ n: 0, k: 0 });
  const chaptersId = useId();

  const osReduced = useReducedMotion();
  const reduced = osReduced || motionOff;
  const animate = booted && !reduced;

  /** Anything the visitor does by hand stops the reel playing itself. */
  const pause = useCallback(() => setPlay((p) => (p.on ? STOPPED : p)), []);

  /*
   * Anything overlaying the frame takes the wheel and the arrow keys while it is open — the
   * record sheet and the contact card alike. Without the contact card in here, Escape would
   * close it and step the chapter in the same keystroke.
   */
  const [contactOpen, setContactOpen] = useState(false);
  const openRef = useLatestRef(openId);
  const contactRef = useLatestRef(contactOpen);
  const blocked = useCallback(
    () => openRef.current !== null || contactRef.current,
    [openRef, contactRef],
  );
  const machine = useSceneMachine(blocked, { onInput: pause });

  const item: Item | null = openId ? itemById(openId) ?? null : null;

  /**
   * The set the sheet steps through, chosen by what the record *is* rather than by where it
   * was opened from. An award or a work steps its whole wall — including one reached from a
   * capability chip, so a chip drops you into the works set and you can keep reading rather
   * than being marooned on a single record. Anything else (the profile) is a set of one, and
   * ← → are correctly disabled.
   */
  const set: readonly Item[] = useMemo(() => {
    if (!item) return [];
    if (item.type === "award") return SETS.award;
    if (item.type === "project") return SETS.project;
    return [item];
  }, [item]);

  /*
   * What was pressed last, so the sheet can open *out of* it. Every surface that opens a
   * record calls `open(id)` and nothing more; rather than thread an element through six
   * components' props, the stage notes the last press itself, and falls back to whatever
   * holds focus for a keyboard press (Enter on a tile focuses the tile, a click on Safari
   * does not).
   */
  const pressRef = useRef<{ el: Element | null; t: number }>({ el: null, t: 0 });
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      pressRef.current = { el: e.target instanceof Element ? e.target : null, t: performance.now() };
    };
    window.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    return () => window.removeEventListener("pointerdown", onDown, { capture: true });
  }, []);

  const open = useCallback((id: string) => {
    const press = pressRef.current;
    const from =
      performance.now() - press.t < PRESS_WINDOW_MS ? press.el : document.activeElement;
    const src = from?.closest?.("button, a, [role='button']");
    if (src) {
      const r = src.getBoundingClientRect();
      setOrigin({ x: r.left, y: r.top, w: r.width, h: r.height });
    } else {
      setOrigin(null);
    }
    setOpenId(id);
    setPlay(STOPPED);
  }, []);
  const close = useCallback(() => setOpenId(null), []);

  const step = useCallback(
    (delta: number) => {
      setOpenId((current) => {
        if (!current) return current;
        const list = itemById(current);
        if (!list) return current;
        const pool = list.type === "award" ? awards : list.type === "project" ? projects : [list];
        const next = pool.indexOf(list) + delta;
        return pool[next]?.id ?? current;
      });
    },
    [],
  );

  /** A cut the visitor asked for — from the rail, the step buttons, the replay link. */
  const { go, chapter } = machine;
  const goByHand = useCallback(
    (to: number, reverse = false) => {
      pause();
      go(to, reverse);
    },
    [pause, go],
  );

  const togglePlay = useCallback(() => {
    if (play.on) {
      setPlay(STOPPED);
      return;
    }
    // From the last chapter, PLAY means "from the top".
    if (chapter === LAST) go(0, true);
    setPlay({ on: true, since: performance.now() });
  }, [play.on, chapter, go]);

  /*
   * PLAY: hold each chapter for its twelve seconds of reel, then cut to the next — the site
   * running as the film it has always been dressed as. The timecode in the frame is driven by
   * the same `since`, so while this runs the timecode *is* the playhead.
   *
   * One timeout per chapter rather than an interval, so a pause, a resume or a cut made by
   * hand simply replaces it, and the hold is measured from when this chapter actually began.
   */
  useEffect(() => {
    if (!play.on) return;
    const remaining = Math.max(0, SECONDS_PER_CHAPTER * 1000 - (performance.now() - play.since));
    const id = window.setTimeout(() => {
      const next = chapter + 1;
      go(next);
      // Arriving at the credits ends the reel; there is nothing after them to hold for.
      setPlay(next >= LAST ? STOPPED : { on: true, since: performance.now() });
    }, remaining);
    return () => window.clearTimeout(id);
  }, [play, chapter, go]);

  // ── deep links ──
  const initialLang = useInitialLang();
  useStoredLang(lang, booted);
  useStoredMotion(motionOff, booted);

  useEffect(() => {
    /*
     * Hydrate the view from the URL, on the first animation frame.
     *
     * It cannot happen during render: the static HTML is built for chapter 1 in Korean, and
     * reading `location` while rendering would make the markup and the first client render
     * disagree. Deferring to a frame rather than running in the effect body also keeps all
     * the pieces of state landing together with the power-on — one cut, not a flicker
     * through the title chapter — and keeps the writes out of the effect body, which React's
     * `set-state-in-effect` rule rightly objects to.
     */
    // Read *now*, apply on the frame. The read has to be synchronous with mount: useDeepLink's
    // writer effect runs immediately after this one and would rewrite the location to the
    // default chapter, erasing the incoming link before a deferred read could see it.
    const link = readLink();
    const raf = requestAnimationFrame(() => {
      setLang(link.lang === DEFAULT_LANG ? initialLang() : link.lang);
      setMotionOff(readMotionOff());
      if (link.chapter > 0) machine.go(link.chapter);
      if (link.item) setOpenId(link.item);
      setBooted(true);
    });
    return () => cancelAnimationFrame(raf);
    // Deliberately once, on mount: this is the initial URL read, not a subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDeepLink({ chapter: machine.chapter, item: openId, lang }, booted, (next) => {
    setLang(next.lang);
    // A record reopened by the history buttons was not pressed out of anything on screen.
    setOrigin(null);
    setOpenId(next.item);
    setPlay(STOPPED);
    machine.go(next.chapter);
  });

  // Keep the document's own language honest — it drives `:lang()` styling and every
  // assistive technology's pronunciation.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  /*
   * The recoil, when the reel is pushed past either end. The Web Animations API rather than a
   * CSS state: it has to replay on every push, including two in a row, and it animates the
   * individual `translate` property so it composes with the chapter's own entrance transform
   * instead of interrupting it.
   */
  const recoiled = useRef(0);
  useEffect(() => {
    const { n, dir } = machine.bump;
    if (n === recoiled.current) return;
    recoiled.current = n;
    if (!animate) return;
    const el = document.querySelector<HTMLElement>('.scene[data-live="true"]');
    if (!el) return;
    el.animate(recoil(dir), { duration: 640, easing: "cubic-bezier(0.25, 0.9, 0.3, 1)" });
  }, [machine.bump, animate]);

  const isLive = (id: Parameters<typeof chapterAt>[0]) => machine.chapter === chapterAt(id);

  const cutState: CutState = useMemo(
    () => ({ chapter: machine.chapter, prev: machine.prev, dir: machine.dir, motion: animate, play: booted }),
    [machine.chapter, machine.prev, machine.dir, animate, booted],
  );

  return (
    <LangProvider value={lang}>
      <CutProvider value={cutState}>
        <a className="skip" href={`#${chaptersId}`}>
          <Txt v={UI.skipToChapters} />
        </a>

        <div
          className={`stage${booted ? " booted" : ""}`}
          data-scene={machine.chapter}
          data-finale={machine.chapter === LAST}
          data-reversing={machine.reversing}
          data-dir={machine.dir}
          data-motion={motionOff ? "off" : "on"}
          data-playing={play.on}
          // Progress as a number the stylesheet can compute with — the backdrop wash drifts
          // across the reel from this rather than from hard-coded chapter indices — and the
          // direction of the last cut, which every direction-aware keyframe multiplies by.
          style={{ "--chapter": machine.chapter / LAST, "--dir": machine.dir } as React.CSSProperties}
        >
          <GridRoomCanvas
            progress={machine.chapter / LAST}
            dir={machine.dir}
            bump={machine.bump}
            animate={animate}
          />
          <div className="wash" aria-hidden="true" />
          <AmbientSandCanvas cut={machine.cut} dir={machine.dir} animate={animate} />
          <Hourglass
            // `flowNonce` is in the key so the reset button rebuilds the simulation, which is
            // the honest way to "reset the flow" — it re-runs the pour rather than faking it.
            key={flowNonce}
            progress={machine.chapter / LAST}
            animate={animate}
            flip={machine.turns}
            onTelemetry={telemetry.set}
          />

          <div className="scenes">
            <TitleScene
              index={chapterAt("title")}
              live={isLive("title")}
              onAi={(n) => {
                setAiAsk((a) => ({ n, k: a.k + 1 }));
                goByHand(chapterAt("ai"));
              }}
            />
            <AiScene
              index={chapterAt("ai")}
              live={isLive("ai")}
              animate={animate}
              ask={aiAsk}
              onOpen={open}
            />
            <ProfileScene index={chapterAt("profile")} live={isLive("profile")} onOpen={open} />
            <GrainScene index={chapterAt("grain")} live={isLive("grain")} />
            <TimelineScene index={chapterAt("timeline")} live={isLive("timeline")} />
            <SkillsScene index={chapterAt("skills")} live={isLive("skills")} onOpen={open} />
            <MetricsScene index={chapterAt("metrics")} live={isLive("metrics")} />
            <WallScene
              index={chapterAt("awards")}
              live={isLive("awards")}
              kind="awards"
              items={awards}
              eyebrow={UI.awardsEyebrow}
              autoplay={animate}
              onOpen={open}
            />
            <WorksScene
              index={chapterAt("projects")}
              live={isLive("projects")}
              items={projects}
              animate={animate}
              onOpen={open}
            />
            <CertsScene index={chapterAt("certs")} live={isLive("certs")} />
            <SwotScene index={chapterAt("swot")} live={isLive("swot")} />
            <AimScene index={chapterAt("aim")} live={isLive("aim")} />
            <CreditsScene
              index={chapterAt("credits")}
              live={isLive("credits")}
              onReplay={() => goByHand(0, true)}
            />
          </div>

          <Hud
            chapter={machine.chapter}
            dir={machine.dir}
            onGo={goByHand}
            onLang={setLang}
            onContact={() => {
              pause();
              setContactOpen(true);
            }}
            chaptersId={chaptersId}
            playing={play.on}
            playSince={play.since}
            onPlay={togglePlay}
            motionOn={!motionOff}
            motionLocked={osReduced}
            onMotion={() => setMotionOff((off) => !off)}
            animate={animate}
          />
          <TelemetryBlock store={telemetry} onReset={() => setFlowNonce((n) => n + 1)} />

          {/*
            A chapter change is a visual cut with no text to announce it. This is the only thing
            that tells a screen-reader user the scene moved — without it, navigating this site
            non-visually is silent.
          */}
          <p className="sr-only-live" role="status" aria-live="polite">
            {text(UI.sceneAnnounce, lang)} {machine.chapter + 1} / {CHAPTERS.length} ·{" "}
            {text(CHAPTERS[machine.chapter]?.name ?? CHAPTERS[0].name, lang)}
          </p>

          {/* `key` restarts the transition on every cut; CSS alone would play it once. */}
          <CutFx key={machine.cut} chapter={machine.chapter} run={booted && machine.cut > 0} />
          <div className="vignette" aria-hidden="true" />
          <div className="grain" aria-hidden="true" />
          <div className="bar bar-top-edge" aria-hidden="true" />
          <div className="bar bar-bot-edge" aria-hidden="true" />

          <Dossier item={item} set={set} origin={origin} animate={animate} onStep={step} onClose={close} />
          <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />
          <Boot run={booted && !reduced} />
        </div>

        <PointerFx enabled={animate} chapter={machine.chapter} />
      </CutProvider>
    </LangProvider>
  );
}

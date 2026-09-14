"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { AmbientSandCanvas } from "@/components/AmbientSandCanvas";
import { GridRoomCanvas } from "@/components/GridRoomCanvas";
import { ContactSheet } from "@/components/ContactSheet";
import { Dossier } from "@/components/Dossier";
import { Hourglass } from "@/components/Hourglass";
import { Hud } from "@/components/Hud";
import { TelemetryBlock } from "@/components/Telemetry";
import { LangProvider } from "@/components/LangProvider";
import { Txt } from "@/components/Txt";
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
import { UI } from "@/data/ui";
import { readLink, useDeepLink, useInitialLang, useStoredLang } from "@/hooks/useDeepLink";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSceneMachine } from "@/hooks/useSceneMachine";
import { DEFAULT_LANG, text } from "@/lib/i18n";
import { SETS, awards, itemById, projects } from "@/lib/select";
import type { Telemetry } from "@/lib/sim/hourglass";
import type { Item, Lang } from "@/lib/types";

/**
 * The projector, the frame, and everything in it.
 *
 * One client component owns the three pieces of view state — which chapter is live, which
 * language, and which record's sheet is open — because all three are genuinely coupled: the
 * sheet suspends the projector, the projector drives the hourglass, and the language changes
 * every string on screen at once. Pushing them into separate providers would spread one
 * interaction across four files and buy nothing.
 *
 * All twelve scenes are always mounted, so the static export contains the full text of the
 * portfolio — which is what makes this version indexable where the original, a CSR page that
 * built its DOM from a script, was a blank document to a crawler.
 */
export function Stage() {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [openId, setOpenId] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const [reading, setReading] = useState<Telemetry | null>(null);
  /** Bumped to make the hourglass re-aim at the current chapter and surge again. */
  const [flowNonce, setFlowNonce] = useState(0);
  const chaptersId = useId();

  const reduced = useReducedMotion();
  const animate = booted && !reduced;

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
  const machine = useSceneMachine(blocked);

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

  const open = useCallback((id: string) => setOpenId(id), []);
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

  // ── deep links ──
  const initialLang = useInitialLang();
  useStoredLang(lang, booted);

  useEffect(() => {
    /*
     * Hydrate the view from the URL, on the first animation frame.
     *
     * It cannot happen during render: the static HTML is built for chapter 1 in Korean, and
     * reading `location` while rendering would make the markup and the first client render
     * disagree. Deferring to a frame rather than running in the effect body also keeps all
     * three pieces of state landing together with the letterbox bars — one cut, not a flicker
     * through the title chapter — and keeps the writes out of the effect body, which React's
     * `set-state-in-effect` rule rightly objects to.
     */
    // Read *now*, apply on the frame. The read has to be synchronous with mount: useDeepLink's
    // writer effect runs immediately after this one and would rewrite the location to the
    // default chapter, erasing the incoming link before a deferred read could see it.
    const link = readLink();
    const raf = requestAnimationFrame(() => {
      setLang(link.lang === DEFAULT_LANG ? initialLang() : link.lang);
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
    setOpenId(next.item);
    machine.go(next.chapter);
  });

  // Keep the document's own language honest — it drives `:lang()` styling and every
  // assistive technology's pronunciation.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const isLive = (id: Parameters<typeof chapterAt>[0]) => machine.chapter === chapterAt(id);

  return (
    <LangProvider value={lang}>
      <a className="skip" href={`#${chaptersId}`}>
        <Txt v={UI.skipToChapters} />
      </a>

      <div
        className={`stage${booted ? " booted" : ""}`}
        data-scene={machine.chapter}
        data-finale={machine.chapter === LAST}
        data-reversing={machine.reversing}
        // Progress as a number the stylesheet can compute with — the backdrop wash drifts
        // across the reel from this rather than from hard-coded chapter indices.
        style={{ "--chapter": machine.chapter / LAST } as React.CSSProperties}
      >
        <GridRoomCanvas progress={machine.chapter / LAST} animate={animate} />
        <div className="wash" aria-hidden="true" />
        <AmbientSandCanvas cut={machine.cut} animate={animate} />
        <Hourglass
          // `flowNonce` is in the key so the reset button rebuilds the simulation, which is
          // the honest way to "reset the flow" — it re-runs the pour rather than faking it.
          key={flowNonce}
          progress={machine.chapter / LAST}
          animate={animate}
          onTelemetry={setReading}
        />

        <div className="scenes">
          <TitleScene index={chapterAt("title")} live={isLive("title")} />
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
            onReplay={() => machine.go(0, true)}
          />
        </div>

        <Hud
          chapter={machine.chapter}
          onGo={machine.go}
          onLang={setLang}
          onContact={() => setContactOpen(true)}
          chaptersId={chaptersId}
        />
        <TelemetryBlock reading={reading} onReset={() => setFlowNonce((n) => n + 1)} />

        {/*
          A chapter change is a visual cut with no text to announce it. This is the only thing
          that tells a screen-reader user the scene moved — without it, navigating this site
          non-visually is silent.
        */}
        <p className="sr-only-live" role="status" aria-live="polite">
          {text(UI.sceneAnnounce, lang)} {machine.chapter + 1} / {CHAPTERS.length} ·{" "}
          {text(CHAPTERS[machine.chapter]?.name ?? CHAPTERS[0].name, lang)}
        </p>

        {/* `key` restarts the wipe on every cut; CSS alone would play it once. */}
        <div className="wipe" key={machine.cut} data-run={booted} aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <div className="bar bar-top-edge" aria-hidden="true" />
        <div className="bar bar-bot-edge" aria-hidden="true" />

        <Dossier item={item} set={set} onStep={step} onClose={close} />
        <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    </LangProvider>
  );
}

"use client";

import { createContext, useContext } from "react";
import type { Dir } from "@/hooks/useSceneMachine";

/**
 * What every moving part needs to know about the cut, in one place.
 *
 * The CSS half of the motion system reads direction from `--dir` on the stage; the JS half —
 * the decoders, the counters, the timecode — reads it from here, so neither half has to be
 * told twice and neither can disagree with the other about which way the reel just moved.
 */
export type CutState = {
  readonly chapter: number;
  /** The chapter playing its exit, or −1. */
  readonly prev: number;
  readonly dir: Dir;
  /**
   * Whether scripted motion may run at all: false under reduced motion, with the MOTION
   * switch off, and before the first frame. Every JS-driven effect checks this, so there is
   * exactly one gate and nothing can animate past it.
   */
  readonly motion: boolean;
  /**
   * Whether the opening has finished enough for entrances to play. Held back through the
   * power-on, so the title's type assembles in the open frame rather than behind the
   * shutter.
   */
  readonly play: boolean;
};

const CutContext = createContext<CutState>({ chapter: 0, prev: -1, dir: 1, motion: false, play: true });

export const CutProvider = CutContext.Provider;
export const useCut = (): CutState => useContext(CutContext);

/**
 * Whether the chapter this element sits in is on screen. Outside any chapter — the HUD, the
 * contact card — it reads true, so a counter there simply plays when it mounts.
 */
const SceneLiveContext = createContext<boolean>(true);

export const SceneLiveProvider = SceneLiveContext.Provider;
export const useSceneLive = (): boolean => useContext(SceneLiveContext);

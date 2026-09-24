"use client";

import { DriveVisual } from "@/components/ai/DriveVisual";
import { EvidenceVisual } from "@/components/ai/EvidenceVisual";
import { PoseVisual } from "@/components/ai/PoseVisual";
import { AI_LOOP_MS, type AiVisualKind } from "@/data/ai";

type Props = {
  kind: AiVisualKind;
  /** Run the diagram. Off, it rests on its finished frame — which is also what the server rendered. */
  play: boolean;
  /** Each completed run. */
  onLoop?: () => void;
  fit?: "slice" | "meet";
};

/** The four captioned beats every diagram is choreographed in. */
export const AI_STEPS = 4;

/**
 * One AI work's diagram, by kind. Used wherever that work appears — its panel in the AI
 * chapter, the near plate in the works reel, the pick card, the head of its dossier sheet —
 * so a work looks like the same object everywhere it is shown.
 */
export function AiVisual({ kind, play, onLoop, fit }: Props) {
  const props = { play, period: AI_LOOP_MS, steps: AI_STEPS, onLoop, fit };
  switch (kind) {
    case "evidence":
      return <EvidenceVisual {...props} />;
    case "drive":
      return <DriveVisual {...props} />;
    case "pose":
      return <PoseVisual {...props} />;
  }
}

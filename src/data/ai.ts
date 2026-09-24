import type { Bi } from "@/lib/types";

/**
 * The three AI works the reel now leads with — and what each one's diagram shows.
 *
 * The records themselves (title, summary, honour, details) live in src/data/portfolio.ts with
 * everything else, so the dossier, the works reel and the metrics count them like any other
 * work. This file only holds what is particular to the AI chapter: which motion diagram draws
 * the work, and the phases that diagram runs through.
 *
 * None of the three has a screenshot. Rather than a blank plate or a stock photo, each is
 * *explained* by a diagram that runs the idea once per loop — the evidence being put in order,
 * the car learning the track, the scene being segmented and a pose placed in it. The phases
 * below are the captions that light up in step with it; they restate the author's own
 * description of the work in four beats, and claim nothing it does not.
 */

export type AiVisualKind = "evidence" | "drive" | "pose";

export type AiWork = {
  /** The record in portfolio.ts. */
  readonly id: string;
  readonly visual: AiVisualKind;
  /** Machine voice for the diagram's corner — Latin on purpose, like the telemetry. */
  readonly code: string;
  /** The name a collapsed panel has room for. */
  readonly short: Bi;
  /** The diagram's beats, in order. Each takes an equal share of one loop. */
  readonly steps: readonly Bi[];
};

export const AI_WORKS = [
  {
    id: "project-ai-evidence",
    visual: "evidence",
    code: "EVIDENCE / TIMELINE",
    short: { ko: "학교폭력 증거 정리", en: "Evidence organiser" },
    steps: [
      { ko: "흩어진 사건 자료", en: "Scattered case material" },
      { ko: "시간 순서로 정렬", en: "Put in time order" },
      { ko: "빠진 증거 점검", en: "Check for missing evidence" },
      { ko: "한눈에 정리", en: "Laid out at a glance" },
    ],
  },
  {
    id: "project-ai-airsim",
    visual: "drive",
    code: "AIRSIM / AUTONOMOUS",
    short: { ko: "AirSim 자율주행", en: "AirSim autonomy" },
    steps: [
      { ko: "가상 주행 환경", en: "Virtual driving world" },
      { ko: "딥러닝 학습", en: "Deep-learning training" },
      { ko: "조향", en: "Steering" },
      { ko: "주차 신호 인식 · 주차", en: "Parking-sign recognition" },
    ],
  },
  {
    id: "project-ai-pose",
    visual: "pose",
    code: "POSE / COMPOSITION",
    short: { ko: "포즈 · 구도 생성", en: "Pose & framing" },
    steps: [
      { ko: "실시간 배경 인식", en: "Read the scene live" },
      { ko: "세그멘테이션 영역 설정", en: "Segment the regions" },
      { ko: "구도 · 촬영 기법", en: "Composition & technique" },
      { ko: "마네킹 포즈 생성", en: "Generate a mannequin pose" },
    ],
  },
] as const satisfies readonly AiWork[];

/**
 * One run of a diagram. The chapter holds each work for exactly one run and then moves on,
 * so a visitor who does nothing still sees every diagram through once.
 */
export const AI_LOOP_MS = 9000;

export const aiWorkFor = (id: string): AiWork | undefined => AI_WORKS.find((w) => w.id === id);

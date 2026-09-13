import type { Bi } from "@/lib/types";

/**
 * The operating principle, as four bins.
 *
 * `size` is the load-bearing field: one number sets the panel's border brightness, its
 * heading size, the diameter of its pile dots and — through a negative delay — the order
 * the four bins appear in. Heavier bins land first, so the scene performs the rule it
 * states instead of only asserting it.
 */
export type Grain = {
  readonly name: Bi;
  /** 1–5. Drives weight, scale and reveal order together. */
  readonly size: number;
  /** How many dots the pile shows. */
  readonly dots: number;
  readonly quadrant: Bi;
  readonly body: Bi;
};

export const GRAINS = [
  {
    name: { ko: "먼저 떨어뜨린다", en: "Drop it first" },
    size: 5,
    dots: 7,
    quadrant: { ko: "긴급 · 중요", en: "Urgent · Heavy" },
    body: {
      ko: "막히면 나머지 전부가 멈추는 것. 제어 루프, 안전 로직, 데이터 경로부터 뚫습니다.",
      en: "Whatever halts everything else when it jams: control loop, safety path, data path.",
    },
  },
  {
    name: { ko: "목을 미리 넓힌다", en: "Widen the neck early" },
    size: 4,
    dots: 5,
    quadrant: { ko: "중요 · 비긴급", en: "Heavy · Not urgent" },
    body: {
      ko: "지금 급하지 않지만 미루면 이후 전부가 느려지는 것. 구조와 설계가 여기에 있습니다.",
      en: "Not pressing now, but deferring it slows everything later. Structure and design live here.",
    },
  },
  {
    name: { ko: "얇게 흘려보낸다", en: "Let it run thin" },
    size: 2,
    dots: 4,
    quadrant: { ko: "긴급 · 비중요", en: "Urgent · Light" },
    body: {
      ko: "빨리 쳐내되 공들이지 않습니다. 여기에 시간을 쓰면 굵은 알갱이가 막힙니다.",
      en: "Clear it fast without polish. Time spent here is time the heavy grain waits.",
    },
  },
  {
    name: { ko: "떨어뜨리지 않는다", en: "Never let it in" },
    size: 1,
    dots: 3,
    quadrant: { ko: "비긴급 · 비중요", en: "Neither" },
    body: {
      ko: "가장 빠른 구현은 만들지 않는 것입니다. 쓰지 않을 기능은 병목만 만듭니다.",
      en: "The fastest build is the one not built. Unused features are pure narrowing.",
    },
  },
] as const satisfies readonly Grain[];

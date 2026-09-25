import type { Bi } from "@/lib/types";

/**
 * How the author works, and where they are aiming.
 *
 * Each stance carries `proof`: the real pieces of work that back it. The claim is not
 * "I value X" but "here are the four things I built that show X" — which is the only form
 * of that claim a recruiter has any reason to believe.
 */
export type Stance = {
  readonly name: Bi;
  readonly body: Bi;
  /** Korean-only, like the rest of the long-form copy. */
  readonly proof: string;
};

export const STANCES = [
  {
    name: { ko: "현장에서 문제를 찾는다", en: "Find the problem in the field" },
    body: {
      ko: "책상에서 정의한 문제 대신, 사람이 실제로 겪는 불편에서 시작합니다.",
      en: "Start from what people actually struggle with, not a problem defined at a desk.",
    },
    proof: "학교폭력 증거 정리 · 결식 아동 예약결제 · 심부전 환자 EV 개선 · 노동자 자세감지 · 발달장애 측정 클릭커",
  },
  {
    name: { ko: "만들어서 검증한다", en: "Build it, then verify" },
    body: {
      ko: "도면과 시뮬레이션에서 멈추지 않고 회로를 뜨고 코드를 올려 굴려봅니다.",
      en: "Not stopping at drawings and simulation — cut the board, flash it, and run it.",
    },
    proof: "자작차량 제작 · 3D 설계 로봇팔 제어 · 스마트 IoT 링거폴대 · 자율주행 트랙 주행",
  },
  {
    name: { ko: "나눠서 확장한다", en: "Share it to make it bigger" },
    body: {
      ko: "혼자 쥐고 있으면 거기서 끝납니다. 가르치고 팀으로 옮겨야 다음이 생깁니다.",
      en: "Held alone, it ends there. Teaching it and moving it into a team is what makes a next step.",
    },
    proof: "멀티콥터 교육 교관 · Re:cap 대표 · 기빙플러스 입점 · 치앙마이 해외 SW 세미나",
  },
] as const satisfies readonly Stance[];

/**
 * ⚠️  The target organisation and the fit argument below were set from the author's data,
 * but the actual posting was never checked. Before applying, read the real job description
 * and match this wording to it. Changing the target means changing the SWOT O and T columns
 * in src/data/swot.ts too — they are written against this specific aim.
 */
export const TARGET = {
  org: { ko: "현대자동차\n로보틱스랩", en: "Hyundai Motor\nRobotics Lab" },
  body: {
    ko: "사람의 움직임을 돕는 기계를, 기구 설계부터 회로·펌웨어·제어까지 한 사람이 끝까지 책임지는 자리를 목표로 합니다.",
    en: "A seat where one person carries a machine that assists human movement — from mechanism through board, firmware and control.",
  },
  reasons: [
    {
      name: { ko: "사람을 돕는 기계", en: "Assistive machines" },
      body: {
        ko: "재활 치료 게임 · 노동자 자세감지 · 발달장애 측정 클릭커 · 심부전 환자 EV 개선 · IoT 링거폴대 — 5개 작업이 같은 주제를 향합니다",
        en: "Rehab game, worker posture detection, developmental-disability clicker, EV for heart-failure patients, IoT IV pole — five works on one theme",
      },
    },
    {
      name: { ko: "로봇 하드웨어", en: "Robot hardware" },
      body: {
        ko: "4족보행 로봇 · 3D 설계 로봇팔 제어 · Altium PCB · ESP32 펌웨어 — 기구부터 회로까지 직접",
        en: "Quadruped robot, 3D-designed arm control, Altium PCB, ESP32 firmware — mechanism through board",
      },
    },
    {
      name: { ko: "움직임 제어", en: "Motion control" },
      body: {
        ko: "ROS2 Nav2 · CARLA · Pixhawk 실비행 · CATIA 자작차량 — 실기체로 검증한 이력",
        en: "ROS2 Nav2, CARLA, Pixhawk flight tests, a CATIA-designed car — verified on real hardware",
      },
    },
  ],
} as const satisfies {
  org: Bi;
  body: Bi;
  reasons: readonly { name: Bi; body: Bi }[];
};

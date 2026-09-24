import type { Bi } from "@/lib/types";

/**
 * ⚠️  DRAFT — NOT YET REVIEWED BY THE AUTHOR.
 *
 * This is the one screen on the site that is not the author's own words. The *figures* are
 * counted off src/data/portfolio.ts:
 *
 *   · 35 awards, graded 대상 4 · 국가장학 1 · 최우수상 10 · 우수상 12 · 장려상 6 ·
 *     3위 1 · 입선 1  (every award carries a grade; none are ungraded)
 *   · 97 distinct tags across the evidence set, of which 73 appear on exactly one record
 *   · only 5 axes are backed by 4 or more works (AI 8 · Mobility 6 · Upcycling 5 ·
 *     Hardware 4 · Healthcare 4)
 *   · output per year: 2023 → 13 · 2024 → 23 · 2025 → 26 · 2026 → 8 so far — the three AI
 *     works carry no year yet, so they are in no year's bar
 *   · the AI works' two honours (HUSS AI 경진대회 전국 2위, 미래자동차 경진대회 장려상) are the
 *     author's own account; neither has a certificate scan on the award wall
 *
 * Two figures in the inherited draft did not survive a recount against the data and were
 * corrected here: 장려상 was written as 7 (it is 6), and a "2023년 7건 → 2025년 18건" volume
 * claim matched no reading of the records at all (the real totals are 13 → 26). Both had
 * drifted out of date as records were added — which is exactly why the 지표 scene computes
 * its figures rather than quoting them, and why prose figures like these need a recount
 * whenever the data changes. `npm run audit:content` does that recount.
 *
 * The *reading* of those figures is a first pass written from the data, and a recruiter
 * reads this as the author's self-assessment. The Threats column especially is a claim
 * about the market that has no basis in the data at all — review it first.
 *
 * Flip `SWOT_REVIEWED` to true once the author has read and owned every line. Until then
 * `npm run audit:content` reports this screen as unreviewed, and the CI summary says so.
 */
export const SWOT_REVIEWED = false;

export type SwotQuadrant = {
  readonly key: "S" | "W" | "O" | "T";
  readonly name: Bi;
  /**
   * Korean-only, like the author's other long-form copy. The EN view labels these
   * `lang="ko"` rather than pretending they are English — see src/lib/i18n.ts.
   */
  readonly items: readonly string[];
};

export const SWOT = [
  {
    key: "S",
    name: { ko: "강점", en: "Strengths" },
    items: [
      "AI 대표작 3건 — HUSS AI 경진대회 전국 2위 · 미래자동차 경진대회 장려상 · 실시간 포즈 생성",
      "수상 35건 · 대상 4 · 최우수상 10 · 우수상 12 — 2023년부터 3년 연속",
      "H/W→F/W→제어 수직 통합: Altium PCB · ESP32 펌웨어 · CATIA/Inventor 3D를 한 프로젝트에서",
      "제작에서 사업화까지 완결 — 기빙플러스 입점, 전북현대모터스FC 협력 업사이클",
      "조직 경험: Re:cap 대표 · 사물인터넷연구실 H/W·F/W · 전남대 인턴십 1위",
    ],
  },
  {
    key: "W",
    name: { ko: "약점", en: "Weaknesses" },
    items: [
      "기술 태그 97개 중 73개가 단 1건 — 폭은 넓지만 깊이가 문서상 드러나지 않음",
      "4건 이상으로 증명되는 축은 AI · Mobility · Upcycling · Hardware · Healthcare 5개뿐",
      "대회 · 캠프 산출물 비중이 높아 장기 운영 · 유지보수 이력이 적음",
      "양산 관점(신뢰성 시험 · DFM · 규격 인증) 이력이 기록에 없음",
    ],
  },
  {
    key: "O",
    name: { ko: "기회", en: "Opportunities" },
    items: [
      "로보틱스 직무는 기구 · 회로 · 펌웨어 · 제어를 함께 보는 인력을 선호 — 이력이 직접 부합",
      "'사람을 돕는 기계'가 5개 작업을 관통 — 재활 게임 · 자세감지 · 클릭커 · 환자용 EV · 링거폴대",
      "2026년 작업이 로봇으로 수렴 — 4족보행 로봇 · 로봇팔 제어",
      "멀티콥터 지도조종자(교관) + Pixhawk 실비행은 실기체 검증의 드문 조합",
    ],
  },
  {
    key: "T",
    name: { ko: "위협", en: "Threats" },
    items: [
      "대기업 연구조직은 석사 이상 · 경력직 선호 비중이 큼",
      "양산 · 신뢰성 · 규격 인증 이력 부재는 로보틱스 하드웨어에서 특히 크게 읽힘",
      "넓은 스펙트럼이 '전문 분야 불명확'으로 읽힐 위험 — 로봇 축으로 재편집 필요",
      "수상 이력의 상당수가 아이디어 · 창업 트랙 — 기술 직무에서는 가중치가 낮게 읽힐 수 있음",
    ],
  },
] as const satisfies readonly SwotQuadrant[];

import { CHAPTERS } from "@/data/chapters";
import { stats } from "@/lib/select";
import type { Bi } from "@/lib/types";

/**
 * Every string the chrome says, in one place.
 *
 * In the original these were inlined into the markup as paired `<span class="ko">` /
 * `<span class="en">` elements — which meant both languages were always in the DOM, and
 * changing a label meant finding it among 1,500 lines of template. Collecting them here
 * costs one indirection and buys a copy deck the author can read end to end.
 *
 * A figure in the copy is interpolated from the records, never typed: "84건의 기록" and "12장"
 * were both typed once, and both went stale the day the AI works and their chapter arrived.
 */

/** A run of text where one span carries emphasis. */
export type Emphasised = readonly { readonly text: string; readonly em?: boolean }[];

export const UI = {
  // ── chrome ──
  rec: "HOURGLASS",
  /** The instrument block beside the glass. Latin on purpose — it is machine voice. */
  telemetryTitle: "SAND SYSTEM",
  telemetryReset: { ko: "흐름 재설정", en: "Reset flow" } satisfies Bi,
  dialogLabel: { ko: "상세 기록", en: "Record detail" } satisfies Bi,
  close: { ko: "닫기", en: "Close" } satisfies Bi,
  prevScene: { ko: "이전 장면", en: "Previous scene" } satisfies Bi,
  nextScene: { ko: "다음 장면", en: "Next scene" } satisfies Bi,
  prevRecord: { ko: "이전 기록", en: "Previous record" } satisfies Bi,
  nextRecord: { ko: "다음 기록", en: "Next record" } satisfies Bi,
  chapterNav: { ko: "장면 목록", en: "Chapters" } satisfies Bi,
  skipToChapters: { ko: "장면 목록으로 건너뛰기", en: "Skip to chapters" } satisfies Bi,
  sceneAnnounce: { ko: "장", en: "Chapter" } satisfies Bi,
  featured: { ko: "★ 대표작", en: "★ Featured" } satisfies Bi,

  // ── the projector's own controls ──
  play: { ko: "재생", en: "Play" } satisfies Bi,
  pause: { ko: "일시정지", en: "Pause" } satisfies Bi,
  playHint: {
    ko: "장면을 12초씩 자동으로 넘깁니다 · 아무 조작이나 하면 멈춥니다",
    en: "Advances a chapter every 12 seconds · any input stops it",
  } satisfies Bi,
  motion: { ko: "모션", en: "Motion" } satisfies Bi,
  motionLocked: {
    ko: "시스템 설정에서 동작 줄이기가 켜져 있어 모션이 꺼져 있습니다",
    en: "Motion is off because your system asks for reduced motion",
  } satisfies Bi,

  // ── contact, from the pill in the frame ──
  contactOpen: { ko: "연락 · 채용", en: "Contact · Recruit" } satisfies Bi,
  contactEyebrow: { ko: "연락 · 채용", en: "Contact · Recruit" } satisfies Bi,
  contactAim: { ko: "지원 목표 — ", en: "Aiming at — " } satisfies Bi,
  contactNote: {
    ko: `링크는 새 창에서 열립니다. 전체 이력은 ${CHAPTERS.length}장을 순서대로 보시면 됩니다.`,
    en: `Links open in a new tab. The full record is the ${CHAPTERS.length} chapters, in order.`,
  } satisfies Bi,

  // ── title ──
  titleEyebrow: "A Portfolio in Falling Sand",
  titleHint: { ko: "스크롤 · 방향키로 재생", en: "Scroll or arrow keys to play" } satisfies Bi,

  titleAiLead: { ko: "AI 대표작부터", en: "AI works first" } satisfies Bi,

  // ── AI works ──
  aiEyebrow: { ko: "AI 대표작 · 먼저 보는 세 작품", en: "Flagship AI · the three to see first" } satisfies Bi,
  aiTitle: { ko: "현장 문제를 AI로 풀다", en: "Field problems, answered with AI" } satisfies Bi,
  aiOpen: { ko: "전체 기록 보기", en: "Open the full record" } satisfies Bi,
  aiExpand: { ko: "펼치기", en: "Expand" } satisfies Bi,
  aiHint: {
    ko: "패널을 눌러 펼치기 · 올려두면 멈춥니다",
    en: "Select a panel to open it · hover to hold",
  } satisfies Bi,
  aiTabs: { ko: "AI 대표작 목록", en: "Flagship AI works" } satisfies Bi,
  aiSteps: { ko: "작동 순서", en: "How it runs" } satisfies Bi,

  // ── profile ──
  profileEyebrow: { ko: "인물 소개", en: "The Subject" } satisfies Bi,
  statAwards: { ko: "수상", en: "Awards" } satisfies Bi,
  statProjects: { ko: "프로젝트", en: "Projects" } satisfies Bi,
  statCerts: { ko: "자격", en: "Certificates" } satisfies Bi,
  statRoles: { ko: "경력", en: "Roles" } satisfies Bi,
  picksTitle: { ko: "대표 성과", en: "Selected work & honours" } satisfies Bi,
  picksHint: { ko: "눌러서 상세 보기", en: "Select for the full record" } satisfies Bi,

  // ── principle ──
  grainEyebrow: { ko: "일하는 원칙", en: "Operating principle" } satisfies Bi,
  grainCreed: {
    ko: "모래알은 굵기와 자리에 따라\n내려가는 순서가 다르다",
    en: "Grains fall in an order set by\ntheir size and where they sit",
  } satisfies Bi,
  grainThesis: {
    ko: [
      { text: "좁은 목을 먼저 지나는 건 언제나 굵고 위에 있는 알갱이입니다. 개발도 같습니다 — 손이 아니라 " },
      { text: "시급성과 중요도", em: true },
      { text: "가 순서를 정합니다. 무엇을 먼저 떨어뜨릴지 정하는 것이 속도를 만듭니다." },
    ],
    en: [
      { text: "What clears the neck first is always the grain that is heavy and sitting high. Development is the same — " },
      { text: "urgency and weight", em: true },
      { text: " set the order, not what happens to be at hand. Choosing what drops first is what makes speed." },
    ],
  } satisfies Record<"ko" | "en", Emphasised>,
  axisWeight: { ko: "중요도 ↑", en: "Weight ↑" } satisfies Bi,
  axisUrgency: { ko: "시급성 →", en: "Urgency →" } satisfies Bi,

  // ── chronicle ──
  timelineEyebrow: { ko: "학력 · 경력", en: "Education & Experience" } satisfies Bi,

  // ── capability ──
  skillsEyebrow: { ko: "역량 · 근거 기반", en: "Capability · evidence-backed" } satisfies Bi,
  skillsHint: {
    ko: "숫자 = 그 역량을 증명하는 작업 수 · 눌러서 확인",
    en: "The number is how many works prove it · select to open",
  } satisfies Bi,
  works: { ko: "건", en: "works" } satisfies Bi,

  // ── metrics ──
  metricsEyebrow: { ko: "지표 · 데이터에서 집계", en: "Metrics · counted from the record" } satisfies Bi,
  metricsHint: {
    ko: `아래 수치는 모두 ${stats.records}건의 기록에서 직접 센 값입니다`,
    en: `Every figure below is counted directly off the ${stats.records} records`,
  } satisfies Bi,
  metricOutput: { ko: "연도별 산출", en: "Output per year" } satisfies Bi,
  metricOutputNote: { ko: "수상 · 프로젝트 합계", en: "Awards and projects combined" } satisfies Bi,
  metricGrades: { ko: "수상 등급 분포", en: "Awards by grade" } satisfies Bi,
  metricGradesNote: { ko: `${stats.awards}건 전체`, en: `All ${stats.awards} awards` } satisfies Bi,
  metricDepth: { ko: "역량 증명 깊이", en: "Depth of evidence" } satisfies Bi,
  // The row count is interpolated from DEPTH_ROWS in MetricsScene, so the caption cannot
  // drift from the number of bars actually drawn.
  metricDepthNote: {
    ko: "태그별 증명 건수 — 상위 {n}개",
    en: "Works backing each tag — top {n}",
  } satisfies Bi,
  metricThin: {
    ko: "단 1건으로만 증명되는 태그",
    en: "tags proven by a single work",
  } satisfies Bi,

  // ── awards ──
  awardsEyebrow: { ko: "수상 기록", en: "Awards" } satisfies Bi,

  // ── works ──
  projectsEyebrow: { ko: "프로젝트 · ★ 대표작", en: "Works · ★ Featured" } satisfies Bi,
  focusHint: {
    ko: "타일에 올리면 멈춥니다 · 클릭하면 전체 기록",
    en: "Hover to hold · click for the full record",
  } satisfies Bi,
  prevWork: { ko: "이전 작업", en: "Previous work" } satisfies Bi,
  nextWork: { ko: "다음 작업", en: "Next work" } satisfies Bi,
  worksIndex: { ko: "작업 목록", en: "Works index" } satisfies Bi,
  worksHint: {
    ko: "눌러서 전체 기록 · 눈금으로 이동",
    en: "Select for the full record · step with the scale",
  } satisfies Bi,

  // ── credentials ──
  certsEyebrow: { ko: "보유 자격", en: "Credentials" } satisfies Bi,

  // ── analysis ──
  swotEyebrow: {
    ko: "자기 분석 · 지원 목표 기준",
    en: "Self-analysis · against the stated target",
  } satisfies Bi,

  // ── direction ──
  aimEyebrow: { ko: "일하는 기준", en: "How I work" } satisfies Bi,
  aimTargetLabel: { ko: "지원 목표", en: "Target" } satisfies Bi,

  // ── credits ──
  creditsEyebrow: "Fin.",
  replay: { ko: "처음부터 다시", en: "Replay" } satisfies Bi,
} as const;

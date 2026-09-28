import { stats } from "@/lib/select";
import type { Bi } from "@/lib/types";

/**
 * Every string the interface says, in one place — the copy deck.
 *
 * This is the site's own voice (headings, labels, calls to action). The author's words — the
 * records, their summaries, the details — live in src/data/portfolio.ts and are never
 * paraphrased here. A figure in this copy is interpolated from the records, never typed.
 */
/** Counted things read better as words: "네 가지", "Four problems". */
const KO_N = ["영", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열"];
const EN_N = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export const UI = {
  // ── chrome ──
  brand: "YONGHYUN KWON",
  skip: { ko: "본문으로 건너뛰기", en: "Skip to content" } satisfies Bi,
  menu: { ko: "메뉴", en: "Menu" } satisfies Bi,
  close: { ko: "닫기", en: "Close" } satisfies Bi,
  motionOn: { ko: "모션 켜짐", en: "Motion on" } satisfies Bi,
  motionOff: { ko: "모션 꺼짐", en: "Motion off" } satisfies Bi,
  motionLocked: {
    ko: "시스템 설정에서 동작 줄이기가 켜져 있어 모션이 꺼져 있습니다",
    en: "Motion is off because your system asks for reduced motion",
  } satisfies Bi,
  contact: { ko: "연락하기", en: "Get in touch" } satisfies Bi,
  loading: { ko: "모델을 불러오는 중", en: "Loading the model" } satisfies Bi,
  backToTop: { ko: "맨 위로", en: "Back to top" } satisfies Bi,
  concept: {
    ko: "3D 콘셉트 시각화 — 실제 서비스 화면이 아닙니다",
    en: "3D concept visualisation — not a product screenshot",
  } satisfies Bi,

  // ── nav ──
  nav: {
    ai: { ko: "AI 대표작", en: "AI Work" },
    works: { ko: "작업", en: "Works" },
    skills: { ko: "역량", en: "Skills" },
    awards: { ko: "수상", en: "Awards" },
    press: { ko: "보도", en: "Press" },
    journey: { ko: "여정", en: "Journey" },
    contact: { ko: "연락", en: "Contact" },
  } satisfies Record<string, Bi>,

  // ── hero ──
  heroKicker: "PORTFOLIO — AI ENGINEERING",
  heroLine1: { ko: "현장의 문제를,", en: "Field problems," } satisfies Bi,
  heroLine2: { ko: "동작하는 AI로.", en: "answered with working AI." } satisfies Bi,
  heroCta: { ko: "AI 대표작 보기", en: "See the AI work" } satisfies Bi,
  heroCta2: { ko: "전체 작업", en: "All works" } satisfies Bi,
  heroScroll: { ko: "스크롤", en: "Scroll" } satisfies Bi,
  // The author's own two lines from their cinematic site (public/cinematic/content.js).
  heroRole: { ko: "개발자 · 메이커 · 문제 해결자", en: "Developer · Maker · Problem solver" } satisfies Bi,
  heroPlace: { ko: "대한민국", en: "Based in South Korea" } satisfies Bi,
  heroBeat: {
    ko: "뉴런이 레이어가 되듯 — 문제에서 모델로, 모델에서 제품으로.",
    en: "As neurons become layers — problem to model, model to product.",
  } satisfies Bi,
  statAi: { ko: "AI 대표작", en: "AI flagships" } satisfies Bi,
  statAwards: { ko: "수상", en: "Awards" } satisfies Bi,
  statProjects: { ko: "프로젝트", en: "Projects" } satisfies Bi,
  statTags: { ko: "기술 태그", en: "Skill tags" } satisfies Bi,

  // ── about ──
  aboutIdx: { ko: "소개", en: "About" } satisfies Bi,
  aboutTitleA: { ko: "만들어서", en: "A developer" } satisfies Bi,
  aboutTitleB: { ko: "증명하는 개발자", en: "who proves it by building" } satisfies Bi,

  // ── AI work ──
  aiIdx: { ko: "AI 대표작", en: "Selected AI work" } satisfies Bi,
  aiTitleA: { ko: "AI로 푼", en: `${cap(EN_N[stats.ai] ?? String(stats.ai))} problems,` } satisfies Bi,
  aiTitleB: { ko: `${KO_N[stats.ai] ?? stats.ai} 가지 현장 문제`, en: "answered with AI" } satisfies Bi,
  aiNote: {
    ko: "스크롤하면 각 작품의 작동 방식이 3D로 한 단계씩 재생됩니다.",
    en: "Scroll, and each work plays out how it works, step by step, in 3D.",
  } satisfies Bi,
  aiOpen: { ko: "케이스 스터디", en: "Case study" } satisfies Bi,
  realScreens: { ko: "실제 서비스 화면", en: "Real product screens" } satisfies Bi,
  aiSteps: { ko: "작동 순서", en: "How it runs" } satisfies Bi,

  // ── skills ──
  skillsIdx: { ko: "역량", en: "Capabilities" } satisfies Bi,
  skillsTitleA: { ko: "근거로 세는", en: "Counted," } satisfies Bi,
  skillsTitleB: { ko: "역량 지도", en: "not claimed" } satisfies Bi,
  skillsNote: {
    ko: "숫자는 그 기술을 실제로 쓴 작업의 수입니다. 자기 평가 점수는 없습니다.",
    en: "Each number is how many works actually use the skill. There are no self-rated scores.",
  } satisfies Bi,
  works: { ko: "건", en: "works" } satisfies Bi,
  leadWork: { ko: "대표 작업", en: "Lead work" } satisfies Bi,
  proofLabel: { ko: "증명 작업", en: "works backing it" } satisfies Bi,
  gradesTitle: { ko: "수상 등급 분포", en: "Awards by grade" } satisfies Bi,
  depthTitle: { ko: "증명 깊이", en: "Depth of evidence" } satisfies Bi,
  depthNote: {
    ko: `기술 태그 ${stats.tags}개 중 ${stats.thinTags}개는 단 1건의 작업으로만 증명됩니다 — 폭은 넓고, 깊이는 아직 쌓는 중입니다.`,
    en: `${stats.thinTags} of ${stats.tags} skill tags rest on a single work — the range is wide, the depth still being built.`,
  } satisfies Bi,
  outputTitle: { ko: "연도별 산출", en: "Output per year" } satisfies Bi,

  // ── works ──
  worksIdx: { ko: "전체 작업", en: "All works" } satisfies Bi,
  worksTitleA: { ko: "만든 것", en: "Everything" } satisfies Bi,
  worksTitleB: { ko: "전부", en: "built" } satisfies Bi,
  filterAll: { ko: "전체", en: "All" } satisfies Bi,
  filterLabel: { ko: "분야로 거르기", en: "Filter by field" } satisfies Bi,
  featured: { ko: "대표작", en: "Featured" } satisfies Bi,
  open: { ko: "열기", en: "Open" } satisfies Bi,
  shown: { ko: "개 표시", en: "shown" } satisfies Bi,
  selected: { ko: "대표 작업", en: "Selected" } satisfies Bi,
  index: { ko: "전체 목록", en: "Index" } satisfies Bi,
  colTitle: { ko: "작업", en: "Work" } satisfies Bi,
  colField: { ko: "분야", en: "Field" } satisfies Bi,
  colYear: { ko: "연도", en: "Year" } satisfies Bi,

  // ── awards ──
  awardsIdx: { ko: "수상", en: "Awards" } satisfies Bi,
  awardsTitleA: { ko: `${stats.awardYears}년 동안`, en: `${stats.awardYears} years,` } satisfies Bi,
  awardsTitleB: { ko: `${stats.awards}번의 수상`, en: `${stats.awards} awards` } satisfies Bi,
  awardsNote: {
    ko: "해마다 받은 상을 날짜순으로 모았습니다. 한 줄을 누르면 상장 원본이 열립니다.",
    en: "Every award, year by year and date by date. Select a line for the original certificate.",
  } satisfies Bi,
  colDate: { ko: "날짜", en: "Date" } satisfies Bi,
  colGrade: { ko: "등급", en: "Grade" } satisfies Bi,
  colAward: { ko: "대회", en: "Competition" } satisfies Bi,

  // ── press ──
  pressIdx: { ko: "보도", en: "Press" } satisfies Bi,
  pressTitleA: { ko: "기사로 남은", en: "On the record," } satisfies Bi,
  pressTitleB: { ko: "현장의 기록", en: "in the press" } satisfies Bi,
  pressNote: {
    ko: "대학과 기관이 직접 낸 보도만 모았습니다. 카드 제목은 요약이고, 원문 제목은 그 아래에 있습니다.",
    en: "Only reports published by the university or institution itself. Card titles are summaries; the publisher's own headline sits beneath.",
  } satisfies Bi,
  relDirect: { ko: "직접 소개", en: "Features the author" } satisfies Bi,
  relRelated: { ko: "행사 보도", en: "Event coverage" } satisfies Bi,
  readArticle: { ko: "기사 원문", en: "Read the article" } satisfies Bi,
  photoBy: { ko: "사진", en: "Photo" } satisfies Bi,
  relatedRecord: { ko: "관련 기록", en: "Related record" } satisfies Bi,

  // ── journey ──
  journeyIdx: { ko: "여정", en: "Journey" } satisfies Bi,
  journeyTitleA: { ko: "배우고,", en: "Learned," } satisfies Bi,
  journeyTitleB: { ko: "가르치고, 이끈 곳", en: "taught, led" } satisfies Bi,
  education: { ko: "학력", en: "Education" } satisfies Bi,
  experience: { ko: "경력 · 활동", en: "Experience" } satisfies Bi,
  credentials: { ko: "자격", en: "Credentials" } satisfies Bi,

  // ── principles ──
  principlesIdx: { ko: "일하는 방식", en: "How I work" } satisfies Bi,
  principlesTitleA: { ko: "세 가지", en: "Three" } satisfies Bi,
  principlesTitleB: { ko: "원칙", en: "principles" } satisfies Bi,
  proof: { ko: "근거", en: "Proof" } satisfies Bi,

  // ── contact ──
  contactIdx: { ko: "연락", en: "Contact" } satisfies Bi,
  contactTitleA: { ko: "다음 문제를", en: "Let's build" } satisfies Bi,
  contactTitleB: { ko: "함께 풀어요", en: "the next one" } satisfies Bi,
  contactAim: { ko: "지원 목표", en: "Aiming at" } satisfies Bi,
  contactNote: {
    ko: "링크는 새 창에서 열립니다.",
    en: "Links open in a new tab.",
  } satisfies Bi,
  builtWith: { ko: "Next.js · Three.js로 직접 설계하고 만들었습니다", en: "Designed and built with Next.js · Three.js" } satisfies Bi,

  // ── dossier ──
  dialogLabel: { ko: "상세 기록", en: "Record detail" } satisfies Bi,
  prevRecord: { ko: "이전 기록", en: "Previous record" } satisfies Bi,
  nextRecord: { ko: "다음 기록", en: "Next record" } satisfies Bi,
  howItWorks: { ko: "작동 원리", en: "How it works" } satisfies Bi,
  renders: { ko: "콘셉트 렌더", en: "Concept renders" } satisfies Bi,
  gallery: { ko: "기록 사진", en: "Gallery" } satisfies Bi,
  links: { ko: "링크", en: "Links" } satisfies Bi,
  videos: { ko: "시연 영상", en: "Demo videos" } satisfies Bi,
  playVideo: { ko: "영상 재생", en: "Play video" } satisfies Bi,
  pressLabel: { ko: "관련 보도", en: "In the press" } satisfies Bi,
  conceptVisual: { ko: "콘셉트 이미지", en: "Concept visual" } satisfies Bi,
  source: { ko: "출처", en: "Source" } satisfies Bi,
} as const;

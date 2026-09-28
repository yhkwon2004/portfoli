import type { Bi, Link } from "@/lib/types";

/**
 * Press — official reports that name the author or the events their work won at.
 *
 * Taken from the author's cinematic site (public/cinematic/content.js and media.js on the
 * default branch), where each was checked against its publisher. The titles and summaries
 * are paraphrases, not quotations; `original` keeps the publisher's own headline where the
 * card's differs. The photographs are the publishers' own, fetched from each article and
 * credited back to it.
 *
 * `direct` reports feature the author or their team by name; `related` ones cover an event
 * the author took part in without naming individuals — the page says which.
 */
export type Press = {
  readonly id: string;
  readonly title: Bi;
  /** The publisher's own headline, where the card paraphrases it. */
  readonly original?: string;
  readonly publisher: Bi;
  /** ISO date of publication. */
  readonly date: string;
  readonly url: string;
  readonly summary: Bi;
  readonly relation: "direct" | "related";
  /** Records this report is about, if any are on the site. */
  readonly related: readonly string[];
  readonly image: { readonly u: string; readonly a: string; readonly credit: Link };
};

const WKU: Bi = { ko: "원광대학교", en: "Wonkwang University" };

export const PRESS = [
  {
    id: "won-pbl-2026",
    title: { ko: "텍스트 3차원 배열을 활용한 리걸 AI 서비스 개발", en: "A legal-AI service built on a 3-D arrangement of text" },
    original: "WON+PBL 교과, 창업아이디어 경진대회 수상 결실",
    publisher: WKU,
    date: "2026-06-02",
    url: "https://www.wku.ac.kr/wonpbl-교과-창업아이디어-경진대회-수상-결실원광대학.html",
    summary: {
      ko: "권용현의 비전문가용 증거 정리 리걸 AI 에이전트와 GIST·호남권 대학 창업아이디어 경진대회 수상 소식을 소개한 대학 공식 보도입니다.",
      en: "The university's own report on Kwon's evidence-organising legal-AI agent for non-experts, and its award at the GIST · Honam universities startup-idea competition.",
    },
    relation: "direct",
    related: [],
    image: {
      u: "/assets/press/won-pbl-2026.webp",
      a: "WON+PBL 창업아이디어 경진대회 수상 현장",
      credit: { label: "원광대학교", url: "https://www.wku.ac.kr/wonpbl-교과-창업아이디어-경진대회-수상-결실원광대학.html" },
    },
  },
  {
    id: "recap-soldout-2026",
    title: {
      ko: "‘2025 전북권 Drive-UP 창업캠프’ 수상 Re:CAP팀의 제품, 성황리에 완판",
      en: "Re:CAP's product, from the 2025 Jeonbuk Drive-UP camp, sells out",
    },
    publisher: { ko: "원광대학교 RISE사업단", en: "Wonkwang University RISE" },
    date: "2026-04-10",
    url: "https://rise.wku.ac.kr/?p=3811",
    summary: {
      ko: "버려진 키보드가 전북현대 팬들의 키링으로 이어졌습니다. Re:CAP의 제품 출시와 현장 판매 시작 1시간 만의 완판을 전합니다.",
      en: "Discarded keyboards became key rings for Jeonbuk Hyundai fans: Re:CAP's launch, and a stall that sold out within an hour.",
    },
    relation: "direct",
    related: ["project-upcycle", "project-upcycle-jbmotors", "award-driveup"],
    image: {
      u: "/assets/press/recap-soldout-2026.webp",
      a: "전북현대 경기장 판매 부스에서 Re:CAP의 업사이클링 키링을 소개하는 현장",
      credit: { label: "원광대학교 RISE사업단", url: "https://rise.wku.ac.kr/?p=3811" },
    },
  },
  {
    id: "recap-store-2026",
    title: {
      ko: "학생 창업동아리 RE:CAP팀, 업사이클링 제품 전북현대모터스FC 입점",
      en: "Student startup Re:CAP's upcycled goods stocked by Jeonbuk Hyundai Motors FC",
    },
    publisher: WKU,
    date: "2026-04-06",
    url: "https://www.wku.ac.kr/학생-창업동아리-recap팀-업사이클링-제품-전북현대모.html",
    summary: {
      ko: "폐키보드를 활용한 수작업 키링의 구단 입점 과정과 팀장 권용현이 밝힌 제작·기부 계획을 담았습니다.",
      en: "How hand-made key rings from scrapped keyboards reached the club's store, and the making and donation plans team lead Kwon described.",
    },
    relation: "direct",
    related: ["project-upcycle", "project-upcycle-jbmotors"],
    image: {
      u: "/assets/press/recap-store-2026.webp",
      a: "전북현대모터스FC 입점 기사에 소개된 Green Cycle 업사이클링 키링",
      credit: { label: "원광대학교", url: "https://www.wku.ac.kr/학생-창업동아리-recap팀-업사이클링-제품-전북현대모.html" },
    },
  },
  {
    id: "gangneung-2025",
    title: { ko: "2025 근거기반 지역문제 해결 캠프서 대상 수상", en: "Grand prize at the 2025 evidence-based regional problem-solving camp" },
    publisher: WKU,
    date: "2025-09-03",
    url: "https://www.wku.ac.kr/2025-근거기반-지역문제-해결-캠프서-대상-수상원광대학.html",
    summary: {
      ko: "현장 인터뷰와 데이터 분석으로 지역 문제를 탐색한 강릉 캠프의 대학 공식 기록입니다. 개인 이름이 나오지 않는 행사 관련 보도입니다.",
      en: "The university's record of the Gangneung camp, which explored a regional problem through field interviews and data. An event report; no individual is named.",
    },
    relation: "related",
    related: ["award-gangneung"],
    image: {
      u: "/assets/press/gangneung-2025.webp",
      a: "2025 근거기반 지역문제 해결 캠프 대상 수상팀 단체 사진",
      credit: { label: "원광대학교", url: "https://www.wku.ac.kr/2025-근거기반-지역문제-해결-캠프서-대상-수상원광대학.html" },
    },
  },
  {
    id: "driveup-2025",
    title: {
      ko: "‘2025 전북권 Drive-UP 창업캠프’서 대상 포함 3개 팀 수상",
      en: "Three teams, the grand prize among them, win at the 2025 Jeonbuk Drive-UP startup camp",
    },
    publisher: WKU,
    date: "2025-08-11",
    url: "https://www.wku.ac.kr/?p=148305",
    summary: {
      ko: "권용현·이지윤·황윤성의 Re:cap 팀이 제안한 키캡 업사이클링 아이디어가 대상과 구단 굿즈 입점 기회로 연결된 기록입니다.",
      en: "The Re:cap team of Kwon, Lee Ji-yun and Hwang Yun-seong: a keycap-upcycling idea that won the grand prize and a place in the club's merchandise.",
    },
    relation: "direct",
    related: ["project-upcycle", "project-upcycle-jbmotors", "award-driveup"],
    image: {
      u: "/assets/press/driveup-2025.webp",
      a: "2025 전북권 Drive-UP 창업캠프 Re:CAP팀 대상 수상 현장",
      credit: { label: "원광대학교", url: "https://www.wku.ac.kr/?p=148305" },
    },
  },
  {
    id: "educart-2024",
    title: { ko: "LINC3.0사업단, 에듀카트 기반 비즈모델 개발 캠프", en: "LINC 3.0 EduCart business-model camp" },
    publisher: WKU,
    date: "2024-06-10",
    url: "https://www.wku.ac.kr/linc3-0사업단-에듀카트-기반-비즈모델-개발-캠프원광대.html",
    summary: {
      ko: "전기차 구동·제어 교육부터 카트 조립과 기능 시험까지, 에듀카트 캠프의 진행 과정을 전합니다. 개인 수상 여부는 별도 수상 기록에서 확인할 수 있습니다.",
      en: "From EV drive and control training to cart assembly and function tests — the camp's programme. An event report; individual results are in the award records.",
    },
    relation: "related",
    related: ["award-educart-2024"],
    image: {
      u: "/assets/press/educart-2024.webp",
      a: "에듀카트 기반 비즈모델 개발 캠프 교육과 참가자 단체 사진",
      credit: { label: "원광대학교", url: "https://www.wku.ac.kr/linc3-0사업단-에듀카트-기반-비즈모델-개발-캠프원광대.html" },
    },
  },
] as const satisfies readonly Press[];

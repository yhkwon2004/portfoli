import type { Bi, DetailKey } from "@/lib/types";

/**
 * Display names for the dossier's detail headings.
 *
 * The source data spells them as unspaced Korean compounds (`프로젝트개요`), which is fine
 * as a key and wrong as a heading. A heuristic splitter would break compounds nobody
 * proof-read, so this is an explicit table — and because `DetailKey` is a closed union,
 * `Record` forces it to stay complete: add a heading to the data without adding it here and
 * `npm run typecheck` fails.
 *
 * The English column is a literal rendering of the heading, not a translation of the body
 * beneath it; the bodies themselves are Korean-only in the source data.
 */
export const DETAIL_LABELS: Record<DetailKey, Bi> = {
  기술스택: { ko: "기술 스택", en: "Tech Stack" },
  대표프로젝트: { ko: "대표 프로젝트", en: "Representative Work" },
  막혔던부분과해결: { ko: "막혔던 부분과 해결", en: "Blockers & Resolution" },
  문제정의: { ko: "문제 정의", en: "Problem Definition" },
  문제해결과리더십: { ko: "문제 해결과 리더십", en: "Problem Solving & Leadership" },
  배운점: { ko: "배운 점", en: "What I Learned" },
  분석모듈: { ko: "분석 모듈", en: "Analysis Modules" },
  역할: { ko: "역할", en: "Role" },
  주요기술활동: { ko: "주요 기술 활동", en: "Key Technical Work" },
  진행타임라인: { ko: "진행 타임라인", en: "Timeline" },
  진행포인트: { ko: "진행 포인트", en: "Delivery Notes" },
  프로젝트개요: { ko: "프로젝트 개요", en: "Overview" },
  프로젝트설명: { ko: "프로젝트 설명", en: "Description" },
  필요성: { ko: "필요성", en: "Motivation" },
  한줄소개: { ko: "한 줄 소개", en: "In One Line" },
  핵심기능: { ko: "핵심 기능", en: "Core Features" },
  핵심축: { ko: "핵심 축", en: "Core Axes" },
  핵심포인트: { ko: "핵심 포인트", en: "Key Points" },
  협업: { ko: "협업", en: "Collaboration" },
  환경구축메모: { ko: "환경 구축 메모", en: "Environment Notes" },
  활동기간: { ko: "활동 기간", en: "Period" },
};

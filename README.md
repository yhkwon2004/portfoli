# 권용현 · AI Portfolio

현장의 문제를 동작하는 AI로 푼 작업을 **스크롤로 재생되는 3D 케이스 스터디**로 보여 주는
포트폴리오입니다. AI 대표작 3건이 소개 바로 다음에 나오고, 각 작품의 작동 방식이 3D 장면으로
한 단계씩 재생됩니다. 그 장면을 그대로 렌더한 영상 · 포스터 · 스틸이 함께 배포됩니다.

87건의 기록 · AI 대표작 3건 · 수상 35건 · 작업 38건 · 기술 태그 97개 — 숫자는 전부 데이터에서
세어 옵니다. 본문에 손으로 적은 수치는 없습니다(`npm run audit`이 검사).

```bash
npm install
npm run dev          # http://localhost:3000
```

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 정적 export → `out/` |
| `npm run verify` | typecheck → lint → 색상 검사 → build → 콘텐츠 감사 |
| `npm test` | 빌드 후 Playwright 32개 테스트 (데스크톱 + reduced-motion) |
| `npm run audit` | 콘텐츠 감사 — 번역 누락 · 연도 누락 · 이미지/미디어 누락 · 손으로 쓴 수치 |
| `npm run check:css` | 잘못된 색상 리터럴 검사 — 아래 *색상 검사* 참고 |
| `npm run media` | 3D 장면에서 영상 · 포스터 · 스틸 재렌더 → `public/media/` |
| `npm run og` | OG 카드 재생성 (`public/og.png`) — 실제 사이트를 촬영 |
| `npm run figma` | Figma용 편집 가능한 SVG 프레임 · 디자인 시스템 보드 · 토큰 → `design/figma/` ([안내](design/figma/README.md)) |
| `npm run images` | 사진 티어 재생성 — 아래 *이미지 파이프라인* 참고 |

---

## 구성

한 페이지를 위에서 아래로 스크롤합니다. 기존의 모래시계 · 장면 전환(“릴”) 구조는 전부
걷어냈습니다.

| # | 섹션 | 무엇을 하나 |
|---|---|---|
| — | **Hero** | 16,000개 입자로 된 뇌가 스크롤에 따라 5층 신경망으로 풀립니다(230vh 고정). 헤드라인이 물러나면 “문제에서 모델로, 모델에서 제품으로” 한 줄과 수치 4개가 올라옵니다 |
| 01 | 소개 | 요약 문단이 스크롤 속도대로 한 단어씩 밝아지고(scrub), 분야별 근거 작업 수가 막대로 |
| 02 | **AI 대표작** | 작품마다 320vh 스크롤리텔링. 3D 장면이 고정된 채 스크롤이 곧 재생 헤드 — 뒤로 굴리면 거꾸로 재생. 옆의 4단계가 같은 진행도로 켜집니다 |
| 03 | 역량 | 벤토 그리드. 기술 칩을 누르면 그 기술의 가장 강한 작업이 열림. 등급 분포 · 증명 깊이 · 연도별 산출 차트 |
| 04 | 전체 작업 | 분야 필터 + FLIP 재배치. AI 카드는 렌더 포스터, hover 시 영상 |
| 05 | 수상 | 세로 스크롤을 가로 트랙으로 바꾸는 고정 섹션. 상장 스캔 35장 |
| 06 | 여정 | 스크롤에 따라 그려지는 타임라인 + 자격 목록 |
| 07 | 일하는 방식 | 겹쳐 쌓이는 스티키 카드 3장, 각 원칙의 근거 작업 |
| 08 | 연락 | 대형 타이포 · 채널 · 지원 목표 |

모든 기록은 **시트(dossier)** 로 열립니다. 카드의 그림이 View Transitions로 시트 머리까지
날아가고, ← → 로 같은 세트(작업 전체 / 수상 전체)를 넘기며, Esc · 뒤로가기로 닫힙니다.

---

## AI 대표작 — 3D 장면

| 작품 | 장면 | 네 단계 |
|---|---|---|
| 학교폭력 증거 정리 AI 서비스 · *HUSS AI 경진대회 전국 2위* | 흩어진 증거 카드가 떨어지고 → 시간축 슬롯으로 날아가 정렬 → 스캐너가 지나가며 빈 슬롯(T4)을 **MISSING**으로 표시 → 연결 호가 이어지고 **LAID OUT** | 흩어진 자료 · 시간 순 정렬 · 누락 점검 · 한눈에 정리 |
| AirSim 자율주행 시뮬레이터 · *미래자동차 경진대회 장려상* | 가상 도시(빌딩 · 나무 · 트랙)가 파문처럼 솟아오르고 → 트랙 위에 신경망 홀로그램이 **TRAINING** → 추격 카메라로 라이다를 쏘며 주행, 회전 표지판 인식 → **P** 표지판을 박스로 잡고 주차 칸에 **PARKED** | 가상 주행 환경 · 딥러닝 학습 · 조향 · 주차 신호 인식 |
| 실시간 포즈 · 구도 생성 서비스 | 해 질 녘 광장 사진이 스캔되며 SKY · BUILDING · TREE · GROUND를 찾고 → 각 영역이 씨앗 점에서 번져 나가는 세그멘테이션 마스크 → 삼분할선이 그려지고 설 자리가 표시 → 마네킹이 부품 단위로 조립돼 포즈를 잡고, 셔터 · **CAPTURED** | 배경 인식 · 세그멘테이션 · 구도 · 마네킹 포즈 |

포즈 장면은 그 자체가 삼분할 구도입니다. 매 프레임 카메라의 화각에서 역산해 마네킹 머리가
정확히 우상단 교차점에 오도록 조준하므로 화면 비율이 바뀌어도 유지됩니다.

**모든 3D 이미지는 “3D 콘셉트 시각화 — 실제 서비스 화면이 아닙니다”라고 표시됩니다.**
세 작품 모두 실제 스크린샷이 없어서, 설명을 장면으로 그린 것입니다. 작품이 주장하지 않는
기능(정확도 수치 등)은 넣지 않았습니다.

### 구현

- **Three.js + React Three Fiber**, `next/dynamic({ ssr: false })` 로 지연 로드. 장면 그래프는
  한 번만 만들고(`useMemo`), `useFrame` 에서 `drive = { p, t }` 만 읽어 갱신합니다. 같은
  `(p, t)` 는 항상 같은 그림 — 그래서 영상 렌더가 결정적입니다.
- 셰이더: 심플렉스 노이즈 입자 모핑(hero), 씨앗 점에서 번지는 세그멘테이션 + 해칭 마스크 +
  노을 하늘 · 창문 불빛 · 포장 타일(pose), 수평선 글로(drive), `fwidth` 로 거리 페이드되는
  바닥 그리드.
- 화면 밖 장면은 `frameloop="never"` — WebGL 장면이 넷이어도 한 번에 하나만 그립니다.
- 모드는 세 가지(`useLive`): **3d**(모션 켬 + WebGL + 넓은 화면) · **video**(휴대폰이거나
  WebGL 없음 → 같은 장면의 사전 렌더 영상) · **poster**(모션 끔 → 정지 프레임 하나).
  서버 HTML은 언제나 poster로 시작하므로 정적 HTML과 첫 렌더가 일치합니다.

---

## 미디어 파이프라인 — `npm run media`

영상과 이미지는 스톡이 아니라 **페이지가 실제로 돌리는 그 3D 장면**에서 나옵니다.

1. 빌드된 사이트에는 `/render/?scene=pose&w=1280&h=720` 하네스가 있습니다(noindex,
   robots 차단, 사이트맵 제외). 장면을 시계가 멈춘 상태로 마운트합니다.
2. `scripts/render-media.mjs` 가 Chromium(소프트웨어 WebGL)을 띄워 프레임을 하나씩 지정해
   렌더합니다. 아무리 느려도 프레임이 빠지지 않습니다.
3. 페이지 안에서 WebCodecs + [mediabunny](https://github.com/Vanilagy/mediabunny) 가 VP9
   WebM으로 인코딩합니다. 스크린 레코더도 ffmpeg도 필요 없습니다.

| 파일 | 내용 |
|---|---|
| `public/media/ai/<장면>.webm` | 10초 · 30fps · 1280×720 VP9 · 마지막 12%는 완성 장면에서 정지 후 루프 |
| `public/media/ai/<장면>-poster.webp` | 완성 장면(p ≈ 0.97) — 재생을 안 누른 사람이 보는 그림 |
| `public/media/ai/<장면>-{1,2,3}.webp` | 각 막의 스틸 — 시트의 “콘셉트 렌더” |
| `public/media/hero-poster.webp` | 3D가 준비되기 전 hero 자리 |
| `public/og.png` | 실제 페이지를 1200×630으로 촬영한 OG 카드 |

합계 약 7 MB. 전부 커밋되므로 CI와 배포에는 브라우저가 필요 없습니다. 장면을 고치면:

```bash
npm run build && npx serve -l 4321 out &
npm run media          # 또는: node scripts/render-media.mjs http://127.0.0.1:4321 pose hero
npm run og
```

`CHROMIUM_PATH` 로 이미 설치된 브라우저를 지정할 수 있습니다.

---

## 모션

| 기법 | 어디에 |
|---|---|
| Lenis 관성 스크롤 + 스크롤 버스 하나(`onScrollFrame`) | 전체. 모든 스크롤 연동이 한 rAF에서 |
| `position: sticky` 스크롤리텔링(pin progress → CSS 변수) | hero `--hp`, 케이스 `--cp`, 수상 `--ap`, 여정 `--tp` |
| 분할 텍스트 — 글자/단어가 마스크 안에서 솟음 | hero 헤드라인, 케이스 제목 |
| scrub 문단 — 스크롤 위치로 단어별 밝기 | 소개 |
| IntersectionObserver 하나로 모든 reveal(up · fade · blur · scale · clip) | 전체 |
| View Transitions — 카드 그림 ↔ 시트 머리 | 작업 · 수상 · 케이스 → 시트 |
| FLIP — 필터 후 남은 카드가 새 자리로 미끄러짐 | 전체 작업 |
| 카운트업, 마퀴, 스티키 카드 덱, 가로 트랙 | hero 수치, 태그 티커, 원칙, 수상 |
| 커스텀 커서 · 마그네틱 버튼 · 스포트라이트 테두리 · 3D 틸트 | 정밀 포인터에서만. 위임 핸들러 하나 |
| 오로라 그라디언트 · 필름 그레인 · 로더(세션당 1회) | 배경 |

---

## 접근성

- **모션 게이트 하나.** OS의 reduced-motion, 또는 내비의 `MOTION` 스위치(WCAG 2.2.2 — 스스로
  움직이는 것을 멈출 수 있어야 함)가 꺼지면 스무스 스크롤 · WebGL · 자동재생 영상 · 카운터 ·
  커서가 전부 멈추고, reveal은 전환 없이 즉시 보입니다. 선택은 localStorage에 기억됩니다.
- 전 섹션이 정적 HTML로 렌더됩니다(크롤러 · 스크린리더 · 스크립트 없는 환경). JSON-LD 포함.
- 시트는 `role="dialog"` + 실제 포커스 트랩 + 닫을 때 포커스 복원. 본문 바로가기 링크.
- 한 언어만 렌더하고, 번역되지 않은 필드는 `lang="ko"` 로 표시합니다.
- 차트는 팔레트를 검증했습니다(`src/data/charts.ts` 머리말). 범례 · 직접 라벨 · 숨은 표가
  색을 뒷받침하고, 글자는 시리즈 색을 입지 않습니다.

---

## 딥 링크

| 링크 | 열리는 것 |
|---|---|
| `/#work/project-ai-airsim` | 작업 시트 |
| `/#award/<id>` | 수상 시트 (상장 스캔) |
| `/#record/<id>` | 그 밖의 기록 |
| `/#projects/<id>` · `/#awards/<id>` | 이전 사이트의 링크 — 그대로 동작 |
| `/?lang=en` | 영어 |

---

## 색상 검사

CSS와 three.js는 형식이 틀린 hex(`#3b4considered` 같은)를 **조용히 버립니다**. 타입 검사도
린터도 빌드도 말해 주지 않습니다. `npm run check:css` 가 `src/styles`, `src/components/three`,
`src/data` 의 모든 색 리터럴을 검사합니다.

## 이미지 파이프라인

마스터는 131 MB의 카메라 JPEG과 PNG 스크린샷입니다. 디자인이 실제로 쓰는 **두 크기만**
미리 렌더합니다 — `thumb` 560px(카드 · 수상 트랙 · 갤러리), `full` 1600px(시트 머리).

```bash
node scripts/images.mjs <마스터-디렉터리> --out public/assets
```

마스터는 이 저장소에 없습니다 — `portfolio-hourglass` 저장소가 원본 보관소입니다.

---

## 배포

정적 export이므로 서버가 없습니다. `out/` 을 어디에 올려도 동작합니다.

**GitHub Pages** — https://yhkwon2004.github.io/portfoli/ . `nextjs.yml` 이 기본 브랜치
push마다 배포합니다(`deploy.yml` 은 `main` 용 · 수동 실행). Pages는 `/portfoli` 아래에서
서빙하므로 빌드에 아래가 필요합니다 — 빠지면 이미지와 영상이 전부 404입니다.

```yaml
env:
  NEXT_PUBLIC_BASE_PATH: ${{ steps.pages.outputs.base_path }}
  NEXT_PUBLIC_SITE_URL: ${{ steps.pages.outputs.origin }}${{ steps.pages.outputs.base_path }}
```

**Vercel / 버킷** — 환경변수 없이 그대로. 루트에서 서빙됩니다.

---

## ⚠️ 공개 전 확인

1. **AI 작품 3건에는 연도가 없습니다.** 알려 준 설명에 연도가 없어 비워 두었고, 그래서 연도별
   차트에 들어가지 않습니다. `src/data/portfolio.ts` 의 `project-ai-*` 에 `year` 를 채우면
   모든 화면이 따라옵니다.
2. **두 수상(HUSS AI 경진대회 전국 2위, 미래자동차 경진대회 장려상)은 상장 스캔이 없습니다.**
   그래서 수상 트랙이 아니라 작품의 `honor` 로 붙였습니다.
3. **AI 작품의 제목은 설명에서 지은 가제입니다**(예: “학교폭력 증거 정리 AI 서비스”). 실제
   이름이 있으면 바꿔 주세요. “참교육과 함께”는 원문 그대로이며, 영어로는 `Chamgyoyuk` 으로
   옮겼습니다.
4. **지원 목표는 현대자동차 로보틱스랩입니다**(`src/data/aim.ts` 의 `TARGET`). AI 직무로
   지원한다면 이 목표부터 바꾸는 게 맞습니다.
5. **영어 번역이 66개 필드 비어 있습니다** — 물려받은 프로젝트 33건의 제목 · 요약입니다.
6. 이전 사이트의 **분석(SWOT) 장면은 없앴습니다.** 본인 검토를 거치지 않은 초안이었습니다.

---

## 콘텐츠 수정

`src/data/portfolio.ts` 의 `items[]` 를 고칩니다. `satisfies Portfolio` 덕분에 오타는
`npm run typecheck` 에서 잡힙니다. 화면 문구는 `src/data/ui.ts`, AI 작품의 장면 · 단계는
`src/data/ai.ts` 에 있습니다.

```ts
{ id, type, t:{ko,en}, s:{ko,en}, year, tags:[], featured, rank, honor,
  imgs:[{u,a,r}], details:{…}, links:[{label,url}] }
```

## 알려진 제약

- 3D는 휴대폰에서 hero만 실시간으로 돌리고, 케이스 스터디는 사전 렌더 영상으로 대신합니다.
  고정(pin) 스크롤리텔링도 넓은 화면에서만 — 좁은 화면에서는 단계가 모두 켜진 채 흐릅니다.
- 커서 · 마그네틱 · 틸트는 정밀 포인터(마우스 · 펜)에서만 동작합니다.
- View Transitions가 없는 브라우저에서는 시트가 아래에서 올라오기만 합니다.

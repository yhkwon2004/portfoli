/**
 * The portfolio content: 84 records, verbatim from the author's source data.
 *
 * Generated from the original `data.js` of yhkwon2004/portfolio-hourglass, which in turn
 * was extracted from `lib/seed-content.ts` of yhkwon2004/-My-Portfolio_web. Every figure
 * the site displays — award counts, grade distribution, tag depth, output per year — is
 * counted off this array at render time. Nothing is hard-coded downstream, so editing a
 * record here is the only step needed to change what the site claims.
 *
 * `satisfies Portfolio` is load-bearing: it type-checks all 84 records against the model
 * in src/lib/types.ts at build time, so a typo in a detail heading or an image role fails
 * `npm run typecheck` instead of silently rendering an unlabelled card.
 */
import type { Portfolio } from "@/lib/types";

export const PORTFOLIO = {
  "owner": {
    "ko": "권용현",
    "en": "Yonghyun Kwon"
  },
  "headline": {
    "ko": "도전과 함께 성장하는 문제 해결 기반 성장 전략가",
    "en": "A challenge-driven growth strategist who turns field problems into working products"
  },
  "quote": {
    "ko": "경험과 도전은 나눔에서 이루어진다",
    "en": "Experience and challenge become meaningful when shared."
  },
  "items": [
    {
      "id": "profile-main",
      "type": "profile",
      "t": {
        "ko": "현장 문제를 이해하고, 동작하는 제품으로 빠르게 검증하는 개발자",
        "en": "Developer who understands field problems and validates them with working products"
      },
      "s": {
        "ko": "컴퓨터 소프트웨어, 스마트 모빌리티, 하드웨어 제작, 펌웨어, 창업 실험을 연결해 실제 문제를 해결하는 프로젝트를 만듭니다.",
        "en": "I connect computer software, smart mobility, hardware prototyping, firmware, and startup experiments to build products that solve real problems."
      },
      "year": "",
      "tags": [
        "Problem Solving",
        "Mobility",
        "H/W",
        "F/W",
        "AI"
      ],
      "featured": true,
      "rank": 1,
      "imgs": []
    },
    {
      "id": "edu-yangji",
      "type": "education",
      "t": {
        "ko": "양지 고등학교",
        "en": "Yangji High School"
      },
      "s": {
        "ko": "2019 ~ 2022",
        "en": "2019 ~ 2022"
      },
      "year": "2019-2022",
      "tags": [],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "edu-wku",
      "type": "education",
      "t": {
        "ko": "원광대학교 컴퓨터 소프트웨어 공학과",
        "en": "Wonkwang University, Computer Software Engineering"
      },
      "s": {
        "ko": "2023 ~ 2029",
        "en": "2023 ~ 2029"
      },
      "year": "2023-2029",
      "tags": [],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "edu-jst",
      "type": "education",
      "t": {
        "ko": "JST 공유대학교 스마트 모빌리티 SW공학과",
        "en": "JST Shared University, Smart Mobility Software Engineering"
      },
      "s": {
        "ko": "전북대학교 연계 스마트 모빌리티 SW 전공",
        "en": "Smart mobility software program connected with Jeonbuk National University"
      },
      "year": "2023-2029",
      "tags": [
        "Smart Mobility"
      ],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "exp-gantts",
      "type": "experience",
      "t": {
        "ko": "산학 프로젝트: GAN-TTS 개발 참여",
        "en": "Industry-academic project: GAN-TTS development"
      },
      "s": {
        "ko": "사투리와 자연스러운 한국어 음성을 지원하는 TTS 모델 연구와 제작에 참여했습니다.",
        "en": "Contributed to a TTS model supporting dialect-aware and natural Korean speech."
      },
      "year": "2023-2024",
      "tags": [
        "AI",
        "TTS",
        "Research"
      ],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "exp-drone-instructor",
      "type": "experience",
      "t": {
        "ko": "초경량 무인 멀티콥터 지도조종자 | 교육 교관",
        "en": "Ultralight multicopter instructor"
      },
      "s": {
        "ko": "무인 멀티콥터 조종과 교육 운영 경험을 쌓았습니다.",
        "en": "Built experience in multicopter piloting and instructor-led education."
      },
      "year": "2024-2025",
      "tags": [
        "Drone",
        "Instruction"
      ],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "exp-cnu",
      "type": "experience",
      "t": {
        "ko": "전남대 인턴십 프로그램 1위 평가",
        "en": "Top-ranked evaluation in Chonnam National University internship program"
      },
      "s": {
        "ko": "문제 해결력과 실행력을 바탕으로 인턴십 프로그램에서 1위 평가를 받았습니다.",
        "en": "Earned the top evaluation based on execution and problem-solving ability."
      },
      "year": "2025-2026",
      "tags": [],
      "featured": true,
      "rank": 5,
      "imgs": []
    },
    {
      "id": "exp-recap",
      "type": "experience",
      "t": {
        "ko": "Re:cap | 대표",
        "en": "Re:cap | Founder"
      },
      "s": {
        "ko": "업사이클 제품 제작과 사업화를 진행하는 팀을 이끌었습니다.",
        "en": "Led a team building and commercializing upcycled products."
      },
      "year": "2025-2026",
      "tags": [
        "Startup",
        "Upcycling"
      ],
      "featured": true,
      "rank": 4,
      "imgs": []
    },
    {
      "id": "exp-iot-lab",
      "type": "experience",
      "t": {
        "ko": "사물인터넷연구실 | H/W(PCB, 3D) / F/W",
        "en": "IoT Lab | Hardware, PCB, 3D, firmware"
      },
      "s": {
        "ko": "PCB, 3D 설계, 펌웨어 기반 하드웨어 제품 실험을 진행했습니다.",
        "en": "Worked on hardware product experiments across PCB, 3D design, and firmware."
      },
      "year": "2025-2026",
      "tags": [
        "PCB",
        "Firmware",
        "3D"
      ],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "cert-drone-1",
      "type": "certification",
      "t": {
        "ko": "초경량 무인 멀티콥터 조종자격 1종",
        "en": "Ultralight multicopter pilot certificate, class 1"
      },
      "s": {
        "ko": "2018 취득",
        "en": "Earned in 2018"
      },
      "year": "2018",
      "tags": [
        "Drone"
      ],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "cert-ecommerce",
      "type": "certification",
      "t": {
        "ko": "글로벌 이커머스 전문가 자격",
        "en": "Global e-commerce specialist certificate"
      },
      "s": {
        "ko": "2023 취득",
        "en": "Earned in 2023"
      },
      "year": "2023",
      "tags": [],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "cert-drone-instructor",
      "type": "certification",
      "t": {
        "ko": "초경량 무인멀티콥터 지도조종자(교관)",
        "en": "Ultralight multicopter instructor certificate"
      },
      "s": {
        "ko": "2024 취득",
        "en": "Earned in 2024"
      },
      "year": "2024",
      "tags": [
        "Drone",
        "Instructor"
      ],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "cert-aipot",
      "type": "certification",
      "t": {
        "ko": "AI-POT 2급",
        "en": "AI-POT level 2"
      },
      "s": {
        "ko": "2025 취득",
        "en": "Earned in 2025"
      },
      "year": "2025",
      "tags": [
        "AI"
      ],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "cert-3d-printer",
      "type": "certification",
      "t": {
        "ko": "3D Printer User (Inventor 3D)",
        "en": "3D Printer User (Inventor 3D)"
      },
      "s": {
        "ko": "2025 취득",
        "en": "Earned in 2025"
      },
      "year": "2025",
      "tags": [
        "3D",
        "Inventor"
      ],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "award-school-video-2023",
      "type": "award",
      "t": {
        "ko": "슬기로운 학교생활 영상공모전 · 3위",
        "en": "School life video contest · 3rd place"
      },
      "s": {
        "ko": "드론 촬영 기법과 영상 편집을 결합해 대학교 전경과 시설을 효과적으로 담아낸 학교 홍보 영상을 제작했습니다.",
        "en": "Created a promotional university video using drone cinematography and editing."
      },
      "year": "2023-06-21",
      "tags": [
        "3위",
        "드론",
        "영상"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2023-06-21.jpg",
          "a": "2023년 6월 21일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-smart-healthcare-2023",
      "type": "award",
      "t": {
        "ko": "스마트헬스케어 SW비교과 경진대회 · 우수상",
        "en": "Smart healthcare SW contest · Excellence Award"
      },
      "s": {
        "ko": "C#과 Unity를 활용해 재활 환자의 움직임을 반영하는 VR 헬스케어 게임을 설계하고 구현했습니다.",
        "en": "Built a VR healthcare rehab game with C# and Unity."
      },
      "year": "2023-08-31",
      "tags": [
        "우수상",
        "VR",
        "Healthcare"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2023-08-31.jpg",
          "a": "2023년 8월 31일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-job-mock-interview-2023",
      "type": "award",
      "t": {
        "ko": "SW취업컨설팅 및 모의면접 경진대회 · 장려상",
        "en": "SW mock interview contest · Encouragement Award"
      },
      "s": {
        "ko": "압박면접, 토론면접, PT면접 등 실전형 면접 과정을 수행하며 구조적 전달력과 대응 역량을 강화했습니다.",
        "en": "Strengthened real-world interview, presentation, and response skills."
      },
      "year": "2023-11-14",
      "tags": [
        "장려상",
        "면접",
        "커뮤니케이션"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2023-11-14.jpg",
          "a": "2023년 11월 14일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-ticket-dream-2023",
      "type": "award",
      "t": {
        "ko": "Ticket to the Dream 대학생 해커톤 · 최우수상",
        "en": "Ticket to the Dream hackathon · Grand Prize"
      },
      "s": {
        "ko": "리프트와 집게 메커니즘을 적용한 로봇 밀어내기 프로젝트를 수행하며 3D 모델링, 배선, 제어 앱 개발을 통합했습니다.",
        "en": "Integrated 3D modeling, wiring, and control-app development in a robot hackathon."
      },
      "year": "2023-12-10",
      "tags": [
        "최우수상",
        "로봇",
        "Hackathon"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2023-12-10.jpg",
          "a": "2023년 12월 10일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-ros-car-2023",
      "type": "award",
      "t": {
        "ko": "ROS 기반 자율주행 자동차 경진대회 · 우수상",
        "en": "ROS autonomous driving contest · Excellence Award"
      },
      "s": {
        "ko": "Pixhawk, GPS, Mission Planner와 ROS를 연결해 자율주행 로버와 비행 제어 로직을 설계하고 최적화했습니다.",
        "en": "Built and optimized a ROS-based autonomous rover and flight control system."
      },
      "year": "2023-12-20",
      "tags": [
        "우수상",
        "ROS",
        "자율주행"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2023-12-20.jpg",
          "a": "2023년 12월 20일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-adventure-design-2023",
      "type": "award",
      "t": {
        "ko": "Adventure Design 경진대회 · 우수상",
        "en": "Adventure Design contest · Excellence Award"
      },
      "s": {
        "ko": "자율주행 로직을 중심으로 하드웨어 설계와 소프트웨어 제어를 결합한 시스템 설계를 제안했습니다.",
        "en": "Proposed a system design combining autonomous logic with hardware and software control."
      },
      "year": "2023-12-22",
      "tags": [
        "우수상",
        "설계",
        "Mobility"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2023-12-22.jpg",
          "a": "2023년 12월 22일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-sw-startup-2023",
      "type": "award",
      "t": {
        "ko": "실전 SW창업교육 및 창업경진대회 · 최우수상",
        "en": "Practical SW startup contest · Grand Prize"
      },
      "s": {
        "ko": "글로벌 이커머스 역량을 바탕으로 시장 분석, 타겟 설정, 플랫폼 전략까지 사업화 관점의 기획을 구체화했습니다.",
        "en": "Developed a commercialization-oriented startup concept based on e-commerce strategy."
      },
      "year": "2023-12-28",
      "tags": [
        "최우수상",
        "창업",
        "E-commerce"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/award-collection.svg",
          "a": "수상 기록 모음",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-product-camp-2024",
      "type": "award",
      "t": {
        "ko": "2023 호남제주권 제품 제작 역량강화 캠프 · 우수상",
        "en": "Honam-Jeju product camp · Excellence Award"
      },
      "s": {
        "ko": "온도·가스 센서와 외부 환경 데이터를 연동하는 스마트 IoT 선풍기를 제작하며 하드웨어와 임베디드 제어를 통합했습니다.",
        "en": "Built a smart IoT fan by integrating sensors, external data, and embedded control."
      },
      "year": "2024-01-26",
      "tags": [
        "우수상",
        "IoT",
        "Embedded"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-01-26.jpg",
          "a": "2024년 1월 26일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-educart-2024",
      "type": "award",
      "t": {
        "ko": "에듀카트 기반 비즈니스모델 개발 캠프 · 우수상",
        "en": "EduCart business model camp · Excellence Award"
      },
      "s": {
        "ko": "아두이노 메가 기반 전원 관리, 브레이크·배터리 센싱, 직관적 조작 인터페이스를 갖춘 실제 탑승형 차량 구조를 개발했습니다.",
        "en": "Developed a rideable vehicle concept with Arduino-based sensing and power control."
      },
      "year": "2024-05-25",
      "tags": [
        "우수상",
        "Arduino",
        "Vehicle"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-05-25.jpg",
          "a": "2024년 5월 25일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-psst-2024",
      "type": "award",
      "t": {
        "ko": "PSST 창업 시뮬레이션 연합 캠프 · 최우수상",
        "en": "PSST startup simulation camp · Grand Prize"
      },
      "s": {
        "ko": "복수 쇼핑몰을 하나의 계정으로 연결하는 통합 패션 쇼핑 앱을 기획하며 플랫폼 문제 해결과 창업 모델을 설계했습니다.",
        "en": "Designed a unified fashion shopping app and startup model."
      },
      "year": "2024-05-31",
      "tags": [
        "최우수상",
        "앱",
        "플랫폼"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-05-31.jpg",
          "a": "2024년 5월 31일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-linc-creative-2024",
      "type": "award",
      "t": {
        "ko": "2024학년도 LINC 3.0 창의대첩 · 대상",
        "en": "LINC 3.0 creative competition · Grand Prize"
      },
      "s": {
        "ko": "발효 백출 기반 기능성 식혜를 기획하고 브릭스 수치 분석과 실험 데이터 시각화로 최적 제조 조건을 도출했습니다.",
        "en": "Planned a fermented beverage product and derived optimal conditions through data analysis."
      },
      "year": "2024-06-25",
      "tags": [
        "대상",
        "데이터분석",
        "기획"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-06-25.jpg",
          "a": "2024년 6월 25일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-engineering-idea-2024",
      "type": "award",
      "t": {
        "ko": "제1회 공학혁신인재 아이디어 캠프 · 최우수상",
        "en": "Engineering innovation idea camp · Grand Prize"
      },
      "s": {
        "ko": "자기 살균 공법과 저온 보관 구조를 결합한 약물 보관 솔루션 아이디어를 설계했습니다.",
        "en": "Designed a medication preservation concept combining sterilization and cooling."
      },
      "year": "2024-06-26",
      "tags": [
        "최우수상",
        "아이디어",
        "융합기술"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-06-26.jpg",
          "a": "2024년 6월 26일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-triangle-career-2024",
      "type": "award",
      "t": {
        "ko": "Triangle+ 진로설계 전략 캠프 · 최우수상",
        "en": "Triangle+ career strategy camp · Grand Prize"
      },
      "s": {
        "ko": "강의계획서와 비교과 데이터를 엑셀 수식으로 구조화해 맞춤형 진로 시나리오와 시간 분배 모델을 설계했습니다.",
        "en": "Created a data-based career path and time allocation model."
      },
      "year": "2024-08-20",
      "tags": [
        "최우수상",
        "Excel",
        "진로설계"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-08-20.jpg",
          "a": "2024년 8월 20일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-mobility-idea-2024",
      "type": "award",
      "t": {
        "ko": "자율주행 로봇제작 및 스마트 모빌리티 아이디어 경진대회 · 우수상",
        "en": "Smart mobility idea contest · Excellence Award"
      },
      "s": {
        "ko": "EV 차량 구조와 의료 접근성 문제를 연결해 이동형 의료 차량 서비스를 제안하고 실제 도입 가능성을 검토했습니다.",
        "en": "Proposed a smart mobility medical vehicle service with feasibility review."
      },
      "year": "2024-08-31",
      "tags": [
        "우수상",
        "모빌리티",
        "의료"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-08-31.jpg",
          "a": "2024년 8월 31일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-product-camp-2024-2",
      "type": "award",
      "t": {
        "ko": "2024 호남제주권 제품 제작 역량강화 캠프 · 우수상",
        "en": "2024 product fabrication camp · Excellence Award"
      },
      "s": {
        "ko": "발받힘대 제품의 하중 데이터를 측정하고 외형 제작과 회로 구성을 완료해 설계·제작 역량을 검증했습니다.",
        "en": "Validated product design and fabrication through load measurement and prototyping."
      },
      "year": "2024-09-06",
      "tags": [
        "우수상",
        "제품제작",
        "3D"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-09-06.jpg",
          "a": "2024년 9월 6일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-won-story-2024",
      "type": "award",
      "t": {
        "ko": "WON+ 페스티벌 성장 이야기 공모전 · 우수상",
        "en": "WON+ growth story contest · Excellence Award"
      },
      "s": {
        "ko": "협업 과정의 갈등 조율과 문제 해결 경험을 수기 에세이로 정리해 가치관과 성장 과정을 전달했습니다.",
        "en": "Captured teamwork, conflict resolution, and growth in an essay."
      },
      "year": "2024-10-31",
      "tags": [
        "우수상",
        "에세이",
        "성장"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-10-31.jpg",
          "a": "2024년 10월 31일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-energy-startup-2024",
      "type": "award",
      "t": {
        "ko": "생활 속 에너지 창업 아이디어 경진대회 · 장려상",
        "en": "Energy startup idea contest · Encouragement Award"
      },
      "s": {
        "ko": "펠티어 소자를 활용한 노트북 쿨러 아이디어를 제안하고, 열을 전기와 쿨링으로 재활용하는 구조를 구상했습니다.",
        "en": "Proposed a laptop cooler concept using Peltier-based energy recycling."
      },
      "year": "2024-11-02",
      "tags": [
        "장려상",
        "Energy",
        "Hardware"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-11-02.jpg",
          "a": "2024년 11월 2일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-portfolio-2024",
      "type": "award",
      "t": {
        "ko": "대학생활설계 포트폴리오 경진대회 · 우수상 / 장려상",
        "en": "University portfolio contest · Excellence / Encouragement"
      },
      "s": {
        "ko": "마이크로 디그리 기반 학습 경로와 진로 연계 포트폴리오를 직접 설계해 자기주도적 성장 구조를 제시했습니다.",
        "en": "Designed a self-directed learning and career portfolio path."
      },
      "year": "2024-11-13",
      "tags": [
        "우수상",
        "장려상",
        "포트폴리오"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-11-13.jpg",
          "a": "2024년 11월 13일 수상 상장",
          "r": "certificate"
        },
        {
          "u": "/assets/evidence/awards/award-2024-11-13-2.jpg",
          "a": "2024년 11월 13일 추가 수상 상장",
          "r": "gallery"
        }
      ]
    },
    {
      "id": "award-my-money-my-startup-2024",
      "type": "award",
      "t": {
        "ko": "전북권 대학 연합 내 돈내산 창업캠프 · 장려상",
        "en": "Startup camp · Encouragement Award"
      },
      "s": {
        "ko": "예산군 유휴 공간을 사과 아이덴티티 기반 체류형 숙소로 재해석하는 공간 창업 아이디어를 구체화했습니다.",
        "en": "Designed a region-based stay concept from underused local space."
      },
      "year": "2024-11-21",
      "tags": [
        "장려상",
        "창업",
        "공간기획"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-11-21.jpg",
          "a": "2024년 11월 21일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-gstartup-2024",
      "type": "award",
      "t": {
        "ko": "2024 G-Startup 아이디어 캠프 · 최우수상",
        "en": "G-Startup idea camp · Grand Prize"
      },
      "s": {
        "ko": "수분 기반 자가발전 구조와 제습 기능을 결합한 시스템 아이디어를 발전시켜 적용 가능성을 탐색했습니다.",
        "en": "Explored a self-powering dehumidification system concept."
      },
      "year": "2024-12-06",
      "tags": [
        "최우수상",
        "아이디어",
        "에너지"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-12-06.jpg",
          "a": "2024년 12월 6일 수상 상장",
          "r": "certificate"
        },
        {
          "u": "/assets/evidence/awards/award-2024-12-06-2.jpg",
          "a": "2024년 12월 6일 추가 수상 상장",
          "r": "gallery"
        }
      ]
    },
    {
      "id": "award-region-problem-2024",
      "type": "award",
      "t": {
        "ko": "제1회 전북권 지역 문제 해결 아이디어 경진대회 · 우수상",
        "en": "Regional problem-solving contest · Excellence Award"
      },
      "s": {
        "ko": "실리카겔 기반 제습과 수분 자가발전을 결합한 구조를 3D 설계로 구체화하며 실현 가능성을 높였습니다.",
        "en": "Improved feasibility of a silica gel and self-power generation system through 3D design."
      },
      "year": "2024-12-19",
      "tags": [
        "우수상",
        "지역문제",
        "3D설계"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-12-19.jpg",
          "a": "2024년 12월 19일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-linc-creative-2024-2",
      "type": "award",
      "t": {
        "ko": "2024학년도 2학기 LINC 3.0 창의대첩 · 최우수상",
        "en": "LINC 3.0 creative competition 2H · Grand Prize"
      },
      "s": {
        "ko": "PTC 도자기 발열체와 저전압 기반 재생 구조를 적용해 이전 제습 시스템 아이디어의 안정성을 개선했습니다.",
        "en": "Improved safety and sustainability of the prior dehumidification system concept."
      },
      "year": "2024-12-24",
      "tags": [
        "최우수상",
        "LINC",
        "고도화"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2024-12-24.jpg",
          "a": "2024년 12월 24일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-national-scholar",
      "type": "award",
      "t": {
        "ko": "국가우수 이공계 장학생",
        "en": "National scholarship for outstanding science and engineering students"
      },
      "s": {
        "ko": "정보통신부장관 명의 국가우수 이공계 장학생으로 선정되며 학업과 프로젝트 성과를 공식적으로 인정받았습니다.",
        "en": "Selected as a national science and engineering scholarship recipient."
      },
      "year": "2025-01-01",
      "tags": [
        "국가장학",
        "장학생",
        "대표수상"
      ],
      "featured": true,
      "rank": 1,
      "imgs": [
        {
          "u": "/assets/evidence/award-national-scholarship.jpg",
          "a": "국가우수 이공계 장학생 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-future-mobility-2025",
      "type": "award",
      "t": {
        "ko": "미래수송기기 아이디어 해커톤 경진대회 · 우수상",
        "en": "Future mobility hackathon · Excellence Award"
      },
      "s": {
        "ko": "기계공학과와 협업해 자율주행 이동형 의료 차량 아이디어를 기획하고 심부전 환자 이송 구조를 설계했습니다.",
        "en": "Proposed an autonomous medical mobility vehicle with engineering collaboration."
      },
      "year": "2025-02-14",
      "tags": [
        "우수상",
        "해커톤",
        "의료모빌리티"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-02-14.jpg",
          "a": "2025년 2월 14일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-company-analysis-2025",
      "type": "award",
      "t": {
        "ko": "기업분석경진대회 · 장려상",
        "en": "Company analysis contest · Encouragement Award"
      },
      "s": {
        "ko": "현대자동차의 핵심 가치와 미래 전략을 분석하고 전공·프로젝트 경험과의 연관성을 정량·정성적으로 도출했습니다.",
        "en": "Analyzed Hyundai's strategy and linked it to personal project experience."
      },
      "year": "2025-05-12",
      "tags": [
        "장려상",
        "분석",
        "현대자동차"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-05-12.jpg",
          "a": "2025년 5월 12일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-learning-essay-2025",
      "type": "award",
      "t": {
        "ko": "제20회 학습공모전 · 입선",
        "en": "Learning essay contest · Honorable Mention"
      },
      "s": {
        "ko": "KPT 회고법 기반으로 팀 갈등 해결과 협업 구조 개선 경험을 수필로 정리해 생산성 향상 사례를 제시했습니다.",
        "en": "Documented a KPT-based conflict resolution and productivity improvement story."
      },
      "year": "2025-06-04",
      "tags": [
        "입선",
        "회고",
        "협업"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-06-04.jpg",
          "a": "2025년 6월 4일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-do-dream-2025",
      "type": "award",
      "t": {
        "ko": "JST Do-Dream 챌린지 해커톤 · 최우수상",
        "en": "JST Do-Dream challenge · Grand Prize"
      },
      "s": {
        "ko": "공공데이터 기반 농업 환경 분석과 특허·기술 동향을 결합한 스마트팜 웹 플랫폼을 설계했습니다.",
        "en": "Designed a smart farming platform combining public data and technology trends."
      },
      "year": "2025-07-04",
      "tags": [
        "최우수상",
        "스마트팜",
        "데이터"
      ],
      "featured": true,
      "rank": 5,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-07-04.jpg",
          "a": "2025년 7월 4일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-energy-up-2025",
      "type": "award",
      "t": {
        "ko": "Energy Up! 아이디어 경진대회 · 우수상",
        "en": "Energy Up idea contest · Excellence Award"
      },
      "s": {
        "ko": "한옥 구조에 맞춰 벽지와 문을 배터리 팩처럼 활용하는 ESS 아이디어를 제안하며 전통 건축과 에너지 기술의 접점을 탐색했습니다.",
        "en": "Explored an ESS concept tailored to hanok architecture."
      },
      "year": "2025-07-18",
      "tags": [
        "우수상",
        "ESS",
        "한옥"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-07-18.jpg",
          "a": "2025년 7월 18일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-driveup",
      "type": "award",
      "t": {
        "ko": "2025 전북권 Drive Up 창업캠프 · 대상 (전북도지사 표창)",
        "en": "Drive Up startup camp · Grand Prize"
      },
      "s": {
        "ko": "폐키보드를 전북현대 모터스 굿즈로 업사이클링해 실제 입점까지 연계했고, 수익을 기부로 연결한 지속가능 창업 모델을 구현했습니다.",
        "en": "Built an upcycling startup model that reached real product placement and donation impact."
      },
      "year": "2025-08-07",
      "tags": [
        "대상",
        "전북도지사상",
        "업사이클"
      ],
      "featured": true,
      "rank": 2,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-08-07.jpg",
          "a": "2025년 8월 7일 수상 상장",
          "r": "certificate"
        },
        {
          "u": "/assets/evidence/awards/award-2025-08-07-2.jpg",
          "a": "2025년 8월 7일 추가 수상 상장",
          "r": "gallery"
        }
      ]
    },
    {
      "id": "award-gangneung",
      "type": "award",
      "t": {
        "ko": "근거기반 지역문제 해결 캠프 in 강릉 · 대상 (강릉시장 표창)",
        "en": "Gangneung problem-solving camp · Grand Prize"
      },
      "s": {
        "ko": "강릉 커피축제의 커피박 문제를 현장 조사와 AI 기반 자료 제작으로 검증하며 지역문제 해결 대안을 제시했습니다.",
        "en": "Proposed a data-backed local solution to coffee waste in Gangneung."
      },
      "year": "2025-08-29",
      "tags": [
        "대상",
        "강릉시장상",
        "지역문제"
      ],
      "featured": true,
      "rank": 3,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-08-29.jpg",
          "a": "2025년 8월 29일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-jeonju-startup-2025",
      "type": "award",
      "t": {
        "ko": "전주 청년 창업경진대회 · 최우수상 (전북중기청장 표창)",
        "en": "Jeonju youth startup contest · Grand Prize"
      },
      "s": {
        "ko": "커피박 친환경 패키징 솔루션을 금형 기반 시제품까지 연결하며 제조 가능성과 사업화 가능성을 함께 검증했습니다.",
        "en": "Validated manufacturability and business potential of coffee-ground packaging."
      },
      "year": "2025-09-16",
      "tags": [
        "최우수상",
        "패키징",
        "창업"
      ],
      "featured": true,
      "rank": 4,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-09-16.jpg",
          "a": "2025년 9월 16일 수상 상장",
          "r": "certificate"
        },
        {
          "u": "/assets/evidence/awards/award-2025-09-16-2.jpg",
          "a": "2025년 9월 16일 인증서",
          "r": "gallery"
        }
      ]
    },
    {
      "id": "award-honam-jeju-startup-2025",
      "type": "award",
      "t": {
        "ko": "호남·제주권 대학 연합 창업경진대회 · 장려상",
        "en": "Honam-Jeju startup contest · Encouragement Award"
      },
      "s": {
        "ko": "커피박 업사이클링 프로젝트의 원료 수거와 가공, 제품화 흐름을 실제 운영 가능한 공급 체계로 확장했습니다.",
        "en": "Expanded the coffee-ground upcycling project into an operational supply chain."
      },
      "year": "2025-10-24",
      "tags": [
        "장려상",
        "창업",
        "공급체계"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-10-24.jpg",
          "a": "2025년 10월 24일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-innovation-league-2025",
      "type": "award",
      "t": {
        "ko": "도전! 생활혁신 아이디어 리그 · 최우수상",
        "en": "Life innovation idea league · Grand Prize"
      },
      "s": {
        "ko": "신인 웹툰 작가의 자금·진입 장벽 문제를 해결하기 위한 클라우드 펀딩 기반 창작 생태계 플랫폼을 제안했습니다.",
        "en": "Proposed a crowdfunding platform for emerging webtoon creators."
      },
      "year": "2025-10-31",
      "tags": [
        "최우수상",
        "플랫폼",
        "콘텐츠"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-10-31.jpg",
          "a": "2025년 10월 31일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-hollim-2025",
      "type": "award",
      "t": {
        "ko": "홀림 공모전 · 장려상",
        "en": "Hollim writing contest · Encouragement Award"
      },
      "s": {
        "ko": "실패를 성장 과정으로 재해석한 수필 형식의 소설을 통해 도전과 회복의 과정을 문학적으로 풀어냈습니다.",
        "en": "Turned failure and recovery into a literary growth narrative."
      },
      "year": "2025-11-13",
      "tags": [
        "장려상",
        "글쓰기",
        "스토리텔링"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-11-13.jpg",
          "a": "2025년 11월 13일 수상 상장",
          "r": "certificate"
        }
      ]
    },
    {
      "id": "award-region-problem-2025",
      "type": "award",
      "t": {
        "ko": "제2회 전북권 지역문제 해결 아이디어 경진대회 · 대상",
        "en": "Regional problem-solving contest II · Grand Prize"
      },
      "s": {
        "ko": "자동차 불량 부품과 PLA 펠릿을 활용한 3D 프린터용 필라멘트 재가공 아이디어를 제안하며 업사이클링의 사업화 가능성을 확장했습니다.",
        "en": "Expanded upcycling into a filament and goods business model using industrial waste parts."
      },
      "year": "2025-12-02",
      "tags": [
        "대상",
        "3D프린팅",
        "업사이클"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/awards/award-2025-12-02.jpg",
          "a": "2025년 12월 2일 수상 상장",
          "r": "certificate"
        },
        {
          "u": "/assets/evidence/awards/award-2025-12-02-2.jpg",
          "a": "2025년 12월 2일 추가 수상 상장",
          "r": "gallery"
        }
      ]
    },
    {
      "id": "project-autonomous",
      "type": "project",
      "t": {
        "ko": "자율주행 프로젝트",
        "en": "자율주행 프로젝트"
      },
      "s": {
        "ko": "Pixhawk, ROS2 Nav2, Gazebo, CARLA 시뮬레이션을 넘나들며 드론과 차량의 자율주행 로직을 실습하고 검증한 프로젝트 묶음입니다.",
        "en": "Pixhawk, ROS2 Nav2, Gazebo, CARLA 시뮬레이션을 넘나들며 드론과 차량의 자율주행 로직을 실습하고 검증한 프로젝트 묶음입니다."
      },
      "year": "2024-2025",
      "tags": [
        "ROS2",
        "CARLA",
        "Pixhawk",
        "Mobility",
        "Simulation"
      ],
      "featured": true,
      "rank": 1,
      "imgs": [
        {
          "u": "/assets/notion-projects/carla-cover.png",
          "a": "CARLA 자율주행 시뮬레이션 커버",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/ros2-gazebo.png",
          "a": "ROS2 Gazebo 실습 화면",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/pixhawk-cover.png",
          "a": "픽스호크 자율주행 실습 장면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/autonomous-rviz.png",
          "a": "RViz 자율주행 경로 시각화 화면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/autonomous-track-overview.webp",
          "a": "자율주행 트랙 전체 장면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/autonomous-track-run.jpg",
          "a": "자율주행 트랙 주행 실습 장면",
          "r": "gallery"
        }
      ],
      "details": {
        "프로젝트개요": "실제 주행 환경과 시뮬레이션 환경을 오가며 자율주행의 센서 처리, 경로 추종, 비행 제어, 차량 제어를 모두 경험한 포트폴리오 축입니다.",
        "핵심포인트": [
          "ROS2 Nav2 기반 경로 계획과 Gazebo 실습",
          "CARLA를 활용한 end-to-end 자율주행 시뮬레이션 검증",
          "Pixhawk와 Mission Planner 기반 드론 자율비행 테스트",
          "대회형 환경에서 제어 안정성과 실전 대응 방식 확인"
        ],
        "배운점": [
          "자율주행은 알고리즘 하나가 아니라 센서, 제어, 환경 제약을 함께 다뤄야 한다는 점",
          "시뮬레이터와 실제 장비 사이의 오차를 줄이는 튜닝 감각",
          "소프트웨어와 하드웨어가 만나는 현장에서의 문제 해결 방식"
        ]
      },
      "links": [
        {
          "label": "CARLA 자율주행",
          "url": "https://www.notion.so/333faf73802f8099b798ca6b64f6b3c1"
        },
        {
          "label": "ROS2 스터디",
          "url": "https://www.notion.so/330faf73802f80da9529d35696f4588d"
        },
        {
          "label": "픽스호크 활용 자율주행",
          "url": "https://www.notion.so/333faf73802f802788f4ecc0ff3e2dea"
        },
        {
          "label": "자율주행 경진대회",
          "url": "https://www.notion.so/333faf73802f806da756fdaadd4f250c"
        }
      ]
    },
    {
      "id": "project-handmade-car",
      "type": "project",
      "t": {
        "ko": "자작차량 제작 프로젝트",
        "en": "자작차량 제작 프로젝트"
      },
      "s": {
        "ko": "원광대학교 자작차 동아리 메카니즘에서 BAJA, EV, Formula 차량 설계와 제작, 주행 테스트까지 전 과정에 참여한 장기 프로젝트입니다.",
        "en": "원광대학교 자작차 동아리 메카니즘에서 BAJA, EV, Formula 차량 설계와 제작, 주행 테스트까지 전 과정에 참여한 장기 프로젝트입니다."
      },
      "year": "2025",
      "tags": [
        "Mobility",
        "CATIA",
        "Vehicle",
        "Hardware",
        "Teamwork"
      ],
      "featured": true,
      "rank": 2,
      "imgs": [
        {
          "u": "/assets/notion-projects/handmade-car-cover.png",
          "a": "자작차량 제작 프로젝트 커버",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/handmade-car-intro.png",
          "a": "자작차량 제작 소개 화면",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/handmade-car-workshop.jpg",
          "a": "자작차량 제작 작업 현장",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/handmade-car-catia.jpg",
          "a": "CATIA 기반 설계 장면",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/handmade-car-driving.jpg",
          "a": "자작차량 주행 사진",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/handmade-car-build.jpg",
          "a": "자작차량 조립 및 제작 장면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/handmade-car-chassis.jpg",
          "a": "자작차량 차체 작업 장면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/handmade-car-workshop.jpg",
          "a": "자작차량 제작 워크숍 장면",
          "r": "gallery"
        }
      ],
      "details": {
        "활동기간": [
          "2024.03 ~ 2024.12",
          "원광대학교 기계공학과 자작차 동아리 메카니즘"
        ],
        "프로젝트개요": [
          "실제 주행 가능한 자작자동차를 설계부터 제작, 주행 테스트까지 경험",
          "소프트웨어 전공자로서 하드웨어 제작 현장에 직접 참여해 End-to-End 제작 흐름 체득",
          "이론, 설계, 가공, 조립, 테스트가 한 프로젝트 안에서 어떻게 연결되는지 체험"
        ],
        "주요기술활동": [
          "선반, 밀링, 그라인더, 용접기 등 정밀 가공 장비 운용",
          "CATIA 기반 차량 프레임 및 주요 부품 설계",
          "BAJA, EV, Formula 차량 제작 참여로 구조별 특성 이해"
        ],
        "문제해결과리더십": [
          "팀 내 교류 부족으로 소통이 끊긴 상황에서 단체 모임을 직접 제안",
          "작업 정보 공유와 역할 조율이 자연스럽게 이뤄지도록 분위기 개선",
          "실제 작업 속도와 완성도 향상으로 이어지는 협업 경험 확보"
        ],
        "배운점": [
          "1mm 오차가 전체 구조를 흔든다는 정밀 엔지니어링 감각",
          "하드웨어와 소프트웨어가 만나는 지점에 대한 실질적 이해",
          "융합 프로젝트에서 커뮤니케이션이 기술만큼 중요하다는 점"
        ]
      },
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/330faf73802f80c7b854e0317d7e8c56"
        },
        {
          "label": "관련 기사",
          "url": "http://www.gocarnet.co.kr/motorsports_tunning/2025/09/105170"
        }
      ]
    },
    {
      "id": "project-gantts",
      "type": "project",
      "t": {
        "ko": "생동감있는 GAN-TTS 제작",
        "en": "생동감있는 GAN-TTS 제작"
      },
      "s": {
        "ko": "더 자연스러운 한국어와 사투리를 지원하는 TTS-GAN 모델을 연구하며, 환경 구축부터 음성 데이터 제작, 오류 해결, 학습 흐름까지 직접 따라간 연구형 프로젝트입니다.",
        "en": "더 자연스러운 한국어와 사투리를 지원하는 TTS-GAN 모델을 연구하며, 환경 구축부터 음성 데이터 제작, 오류 해결, 학습 흐름까지 직접 따라간 연구형 프로젝트입니다."
      },
      "year": "2023",
      "tags": [
        "AI",
        "TTS",
        "Python",
        "Linux",
        "Research"
      ],
      "featured": true,
      "rank": 3,
      "imgs": [
        {
          "u": "/assets/generated/growth-corridor.png",
          "a": "GAN-TTS 프로젝트 대표 배경",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/gantts-grid.png",
          "a": "GAN-TTS TextGrid 결과 화면",
          "r": "gallery"
        }
      ],
      "details": {
        "프로젝트설명": "TTS는 사람이 읽는 것처럼 자연스러운 발음과 감정을 담아 텍스트를 음성으로 변환하는 기술입니다. 이 프로젝트에서는 더 현실감 있는 한국어 음성 합성을 목표로 GAN-TTS 모델을 연구했습니다.",
        "필요성": [
          "사용자 경험 향상",
          "시각장애인과 독서 약자를 위한 보조 기술 확장",
          "광고, 오디오북, 게임, 교육, 고객지원 등 산업 활용",
          "다양한 언어와 방언 지원 가능성"
        ],
        "역할": [
          "학부연구생",
          "환경 구축",
          "wav 데이터 제작",
          "음성 학습 흐름 파악",
          "오류 해결 지원"
        ],
        "진행타임라인": [
          "2023.04 카카오 공공 GPU 접속 테스트 및 개발 환경 구축",
          "2023.05 anaconda, Ubuntu, PyTorch 학습",
          "2023.06 wav 파일 제작과 레포지토리 기반 응용 학습",
          "2023.07 실제 목소리 학습과 TTS 개발 착수",
          "2023.08~10 문제 해결과 연구 과제 진행"
        ],
        "막혔던부분과해결": [
          "Ubuntu, anaconda, CUDA, PyTorch 환경을 처음 접하면서 초기 세팅에서 반복적으로 막힘",
          "konlpy / MeCab 관련 오류를 인터넷 탐색과 자료 조사로 해결",
          "학년 차이가 큰 팀 환경에서도 조언을 받아가며 빠르게 적응"
        ],
        "환경구축메모": [
          "CUDA 12.0 설치",
          "WSL Ubuntu 기반 개발 환경 구성",
          "TensorFlowTTS 설치",
          "TextGrid 기반 음성 정렬 결과 확인"
        ]
      },
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/330faf73802f805ca96efd0a52460091"
        },
        {
          "label": "참고 레포",
          "url": "https://huggingface.co/tensorspeech/tts-mb_melgan-kss-ko"
        },
        {
          "label": "MeCab 오류 참고",
          "url": "https://sosomemo.tistory.com/30"
        }
      ]
    },
    {
      "id": "project-upcycle",
      "type": "project",
      "t": {
        "ko": "업사이클 프로젝트",
        "en": "업사이클 프로젝트"
      },
      "s": {
        "ko": "폐키보드, 폐플라스틱, 커피박처럼 버려지는 자원을 상품화와 사업화로 연결한 업사이클 프로젝트 축입니다.",
        "en": "폐키보드, 폐플라스틱, 커피박처럼 버려지는 자원을 상품화와 사업화로 연결한 업사이클 프로젝트 축입니다."
      },
      "year": "2025-2026",
      "tags": [
        "Startup",
        "Upcycling",
        "Re:cap",
        "Product"
      ],
      "featured": true,
      "rank": 4,
      "imgs": [
        {
          "u": "/assets/evidence/project-upcycle-1.jpg",
          "a": "업사이클 프로젝트 대표 제품",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/jbmotors-upcycle-cover.png",
          "a": "전북현대모터스 FC 업사이클 프로젝트",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/givingplus-upcycle-cover.png",
          "a": "기빙플러스 업사이클 프로젝트",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/coffee-box-cover.jpg",
          "a": "커피박 상자 제작 프로젝트",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/upcycle-material.webp",
          "a": "업사이클 소재 준비 장면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/upcycle-product-making.jpg",
          "a": "업사이클 제품 제작 과정",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/upcycle-panel.jpg",
          "a": "업사이클 패널 제작 결과",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/upcycle-coffee-box.jpg",
          "a": "커피박 업사이클 상자 결과물",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/upcycle-award-stage.jpg",
          "a": "업사이클 프로젝트 발표 및 수상 장면",
          "r": "gallery"
        }
      ],
      "details": {
        "핵심축": [
          "폐기물 수거 -> 분해/가공 -> 굿즈/제품 제작 -> 판매 및 사업화 연결",
          "브랜드 협업과 실제 입점 경험 확보",
          "기술, 디자인, 사회적 가치가 함께 작동하는 구조 설계"
        ],
        "대표프로젝트": [
          "전북현대모터스 FC 협력 업사이클 제품 제작 및 사업화",
          "기빙플러스 입점형 업사이클 제품 제작",
          "커피박 업사이클 상자 제작"
        ]
      },
      "links": [
        {
          "label": "전북현대모터스 FC 협력",
          "url": "https://www.notion.so/330faf73802f808eb0caea4524c71e63"
        },
        {
          "label": "기빙플러스 입점",
          "url": "https://www.notion.so/330faf73802f80708574fdc86e452c38"
        },
        {
          "label": "커피박 상자 제작",
          "url": "https://www.notion.so/333faf73802f80cea845ee4a96cd48dd"
        }
      ]
    },
    {
      "id": "project-iot-ring",
      "type": "project",
      "t": {
        "ko": "스마트 IoT 링거폴대",
        "en": "스마트 IoT 링거폴대"
      },
      "s": {
        "ko": "간호 인력 부족과 환자 관리 부담을 줄이기 위해, 수액 흐름과 임의 조작을 모니터링하는 GTT 기반 스마트 링거폴대를 설계한 프로젝트입니다.",
        "en": "간호 인력 부족과 환자 관리 부담을 줄이기 위해, 수액 흐름과 임의 조작을 모니터링하는 GTT 기반 스마트 링거폴대를 설계한 프로젝트입니다."
      },
      "year": "2026",
      "tags": [
        "Altium",
        "ESP32",
        "PCB",
        "3D",
        "IoT"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/iot-ring-cover.png",
          "a": "스마트 IOT 링거폴대 커버",
          "r": "cover"
        }
      ],
      "details": {
        "협업": [
          "권용현",
          "정익상",
          "최이지",
          "한우진"
        ],
        "역할": [
          "3D 설계",
          "PCB / 회로 설계",
          "회계 관리"
        ],
        "문제정의": "수액과 약물 투여 과정에서 발생할 수 있는 환자 임의 조작과 의료사고 리스크를 줄이고, 간호사의 반복 관리 업무를 보조하기 위한 프로젝트입니다."
      },
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/330faf73802f80988cdbcf9b9b8d0ee0"
        }
      ]
    },
    {
      "id": "project-farm-app",
      "type": "project",
      "t": {
        "ko": "농림축산식품 공공데이터 APP 개발",
        "en": "농림축산식품 공공데이터 APP 개발"
      },
      "s": {
        "ko": "초보 농민을 위한 영농 재배력 캘린더와 AI 성장률 예측 흐름을 모바일 경험으로 풀어낸 공공데이터 기반 앱 프로젝트입니다.",
        "en": "초보 농민을 위한 영농 재배력 캘린더와 AI 성장률 예측 흐름을 모바일 경험으로 풀어낸 공공데이터 기반 앱 프로젝트입니다."
      },
      "year": "2024",
      "tags": [
        "App",
        "Public Data",
        "농업",
        "AI",
        "UX"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/farm-app-cover.png",
          "a": "농림축산식품 공공데이터 앱 커버",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/farm-app-screen-1.png",
          "a": "농림축산식품 공공데이터 앱 화면 1",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/farm-app-screen-2.png",
          "a": "농림축산식품 공공데이터 앱 화면 2",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/farm-app-screen-3.png",
          "a": "농림축산식품 공공데이터 앱 화면 3",
          "r": "gallery"
        }
      ],
      "details": {
        "협업": [
          "강세창",
          "손석민"
        ],
        "핵심기능": [
          "영농 재배력 캘린더",
          "작물 성장률 예측",
          "초보 농민이 이해하기 쉬운 정보 구조",
          "공공데이터 기반 작물 정보 연결"
        ]
      },
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f80efa7eec4ec444c1d6a"
        }
      ]
    },
    {
      "id": "project-posture-ios",
      "type": "project",
      "t": {
        "ko": "노동자를 위한 자세감지 APP (iOS)",
        "en": "Posture-detection iOS app for workers"
      },
      "s": {
        "ko": "실시간 객체 인식으로 노동자의 안전을 지원하는 HUSS AI 경진대회 출품작입니다.",
        "en": "A HUSS AI competition project using real-time object detection for worker safety."
      },
      "year": "2025",
      "tags": [
        "Swift",
        "Python",
        "Object Detection"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/projects/posture-detection-pose.png",
          "a": "자세 감지 앱 포즈 인식 화면",
          "r": "cover"
        },
        {
          "u": "/assets/evidence/projects/posture-detection-flow.png",
          "a": "자세 감지 앱 분석 흐름",
          "r": "gallery"
        }
      ]
    },
    {
      "id": "project-ess",
      "type": "project",
      "t": {
        "ko": "한옥형 ESS 설계",
        "en": "ESS design for hanok"
      },
      "s": {
        "ko": "태양광 발전과 저장시스템 부족을 해결하기 위한 시설 아이디어 설계 프로젝트입니다.",
        "en": "A facility concept for solar generation and energy storage gaps in hanok environments."
      },
      "year": "2025",
      "tags": [
        "Energy",
        "Design"
      ],
      "featured": false,
      "rank": 99,
      "imgs": []
    },
    {
      "id": "project-ai-detector",
      "type": "project",
      "t": {
        "ko": "AI 생성물 탐지기 제작",
        "en": "AI 생성물 탐지기 제작"
      },
      "s": {
        "ko": "물리적 특성 추출 기반으로 AI 생성물 여부를 판별하는 탐지 인터페이스를 설계하고, 빠른 프로토타이핑으로 검증한 프로젝트입니다.",
        "en": "물리적 특성 추출 기반으로 AI 생성물 여부를 판별하는 탐지 인터페이스를 설계하고, 빠른 프로토타이핑으로 검증한 프로젝트입니다."
      },
      "year": "2026",
      "tags": [
        "AI",
        "Detection",
        "Computer Vision"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/ai-detector-cover.png",
          "a": "AI 생성물 탐지기 커버",
          "r": "cover"
        },
        {
          "u": "/assets/evidence/projects/ai-detector-grid.png",
          "a": "AI 생성물 탐지 판단 구조 자료",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/ai-detector-worksheet.png",
          "a": "AI 생성물 탐지 분석 워크시트",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/ai-detector-emotion-board.png",
          "a": "AI 생성물 탐지 감정 분석 보드",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/ai-detector-dataset.png",
          "a": "AI 생성물 탐지 데이터셋 정리 화면",
          "r": "gallery"
        }
      ],
      "details": {
        "프로젝트개요": "AI 생성 결과물의 흔적을 물리적 특징 기반으로 분해해 판별 가능성을 검증한 프로젝트입니다.",
        "진행포인트": [
          "입력 -> 분석 -> 결과 확인 흐름 설계",
          "탐지 아이디어의 초기 검증과 인터페이스 프로토타입 구축",
          "실제 사용 흐름을 상상한 UX 정리"
        ]
      },
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f8065a100d74d1503d5c4"
        },
        {
          "label": "Demo",
          "url": "https://3000-ii7n0v0uca8g55c0qrqox-583b4d74.sandbox.novita.ai"
        }
      ]
    },
    {
      "id": "project-dontstarve",
      "type": "project",
      "t": {
        "ko": "결식 아동을 위한 예약결제 서비스 APP",
        "en": "결식 아동을 위한 예약결제 서비스 APP"
      },
      "s": {
        "ko": "결식 아동이 직접 카드를 내밀며 결제해야 하는 부담을 줄이기 위해, 위치 기반 정보와 비대면 예약결제를 연결한 서비스입니다.",
        "en": "결식 아동이 직접 카드를 내밀며 결제해야 하는 부담을 줄이기 위해, 위치 기반 정보와 비대면 예약결제를 연결한 서비스입니다."
      },
      "year": "2024",
      "tags": [
        "FastAPI",
        "Kakao Map API",
        "MariaDB",
        "ESG"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/dontstarve-cover.png",
          "a": "결식 아동 예약결제 서비스 커버",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/dontstarve-map.png",
          "a": "결식 아동 예약결제 지도 화면",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/dontstarve-detail.png",
          "a": "결식 아동 예약결제 상세 화면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/dontstarve-home.png",
          "a": "결식 아동 예약결제 앱 홈 화면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/dontstarve-map.png",
          "a": "결식 아동 예약결제 지도 탐색 화면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/dontstarve-reservation.png",
          "a": "결식 아동 예약결제 예약 화면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/dontstarve-erd.png",
          "a": "결식 아동 예약결제 데이터베이스 ERD",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/dontstarve-db-data.png",
          "a": "결식 아동 예약결제 데이터베이스 화면",
          "r": "gallery"
        }
      ],
      "details": {
        "핵심기능": [
          "Kakao Map API 기반 지도 조회",
          "결식카드 가맹점과 착한식당 레이어",
          "상세 정보 모달",
          "비대면 예약결제 확장 구조"
        ]
      },
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/330faf73802f8007b1b5f8f59cc56b92"
        },
        {
          "label": "Video",
          "url": "https://youtu.be/7oQWhoboMmE?si=scPsr8Ue6Lt67gqq"
        }
      ]
    },
    {
      "id": "project-kakao-fin-next",
      "type": "project",
      "t": {
        "ko": "kakao FIN:NEXT 프로젝트",
        "en": "kakao FIN:NEXT 프로젝트"
      },
      "s": {
        "ko": "웹툰 창작자 수익 구조 문제를 클라우드 펀딩과 팬 참여 투자 모델로 풀어낸 서비스형 프로젝트입니다.",
        "en": "웹툰 창작자 수익 구조 문제를 클라우드 펀딩과 팬 참여 투자 모델로 풀어낸 서비스형 프로젝트입니다."
      },
      "year": "2025",
      "tags": [
        "Next.js 15",
        "TypeScript",
        "Supabase",
        "Fintech"
      ],
      "featured": true,
      "rank": 5,
      "imgs": [
        {
          "u": "/assets/notion-projects/kakao-fin-cover.png",
          "a": "kakao FIN:NEXT 프로젝트 커버",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/kakao-fin-screen.png",
          "a": "kakao FIN:NEXT 화면",
          "r": "gallery"
        }
      ],
      "details": {
        "역할": [
          "프론트엔드 개발",
          "Supabase 연동",
          "UI/UX 구현"
        ],
        "핵심기능": [
          "팬 참여형 투자 플랫폼 UX",
          "프로젝트 상세 페이지와 자산 흐름 시각화",
          "Supabase 기반 인증/저장 구조",
          "Next.js 15 App Router 기반 서비스 구성"
        ]
      },
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f804db2a7e52ae01b5142"
        },
        {
          "label": "Demo",
          "url": "https://kakaofanance.vercel.app/"
        },
        {
          "label": "Video",
          "url": "https://youtube.com/shorts/NZwp7W0fqdU?feature=share"
        }
      ]
    },
    {
      "id": "project-climate-dashboard",
      "type": "project",
      "t": {
        "ko": "영농 기후 기술을 활용한 데이터 시각화 웹제작",
        "en": "영농 기후 기술을 활용한 데이터 시각화 웹제작"
      },
      "s": {
        "ko": "Python 기반 분석과 Streamlit/시각화 도구를 활용해 기후 기술 데이터를 한 화면에서 탐색할 수 있도록 설계한 프로젝트입니다.",
        "en": "Python 기반 분석과 Streamlit/시각화 도구를 활용해 기후 기술 데이터를 한 화면에서 탐색할 수 있도록 설계한 프로젝트입니다."
      },
      "year": "2025",
      "tags": [
        "Python",
        "Streamlit",
        "Plotly",
        "Dashboard"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/climate-cover.png",
          "a": "영농 기후 기술 데이터 시각화 커버",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/climate-screen-1.png",
          "a": "영농 기후 기술 데이터 시각화 화면 1",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/climate-screen-2.png",
          "a": "영농 기후 기술 데이터 시각화 화면 2",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/climate-screen-3.png",
          "a": "영농 기후 기술 데이터 시각화 화면 3",
          "r": "gallery"
        }
      ],
      "details": {
        "분석모듈": [
          "기후기술 분류체계 분석",
          "국가 현황 분석",
          "분야 현황 분석",
          "기술 생애주기 분석",
          "해외 진출 분석"
        ],
        "기술스택": [
          "Python",
          "Streamlit",
          "Pandas",
          "Plotly",
          "Folium",
          "BeautifulSoup",
          "Selenium"
        ]
      },
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f8032b436e33d1cb71028"
        }
      ]
    },
    {
      "id": "project-retrofit-game",
      "type": "project",
      "t": {
        "ko": "레트로핏 윈도우 게임",
        "en": "레트로핏 윈도우 게임"
      },
      "s": {
        "ko": "여러 미니게임을 하나의 패키지로 묶고, GitHub 협업 흐름까지 경험한 레트로 윈도우 게임 프로젝트입니다.",
        "en": "여러 미니게임을 하나의 패키지로 묶고, GitHub 협업 흐름까지 경험한 레트로 윈도우 게임 프로젝트입니다."
      },
      "year": "2024",
      "tags": [
        "C#",
        "Windows Forms",
        ".NET",
        "GitHub"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/retrofit-cover.png",
          "a": "레트로핏 윈도우 게임 커버",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/retrofit-gameplay.jpg",
          "a": "레트로핏 윈도우 게임 화면",
          "r": "gallery"
        }
      ],
      "details": {
        "한줄소개": "독립 구동 게임을 하나의 패키지로 묶은 레트로 미니게임 프로젝트입니다.",
        "역할": [
          "숫자야구 게임",
          "뱀 게임",
          "지뢰찾기",
          "테트리스"
        ],
        "기술스택": [
          "C#",
          "Windows Forms",
          ".NET Framework",
          "Visual Studio",
          "GitHub"
        ],
        "핵심포인트": [
          "로그인·회원가입·점수 기록 시스템 구성",
          "게임별 모듈 분리로 확장 가능 구조 설계",
          "feature / develop / main 기반 협업 브랜치 전략 실습"
        ]
      },
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f8075b43de45fc2584d76"
        },
        {
          "label": "Video",
          "url": "https://youtu.be/PEcXeQw4Ipo"
        }
      ]
    },
    {
      "id": "project-rehab-game",
      "type": "project",
      "t": {
        "ko": "스마트 헬스케어 재활 치료 게임",
        "en": "스마트 헬스케어 재활 치료 게임"
      },
      "s": {
        "ko": "재활 치료 경험을 더 능동적이고 몰입감 있게 만들기 위한 게임형 인터페이스를 기획하고, 화면 시안까지 정리한 프로젝트입니다.",
        "en": "재활 치료 경험을 더 능동적이고 몰입감 있게 만들기 위한 게임형 인터페이스를 기획하고, 화면 시안까지 정리한 프로젝트입니다."
      },
      "year": "2025",
      "tags": [
        "Healthcare",
        "Game UX",
        "Interactive"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/rehab-game-cover.png",
          "a": "스마트 헬스케어 재활 치료 게임 커버",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/rehab-game-screen-1.png",
          "a": "재활 치료 게임 화면 1",
          "r": "gallery"
        },
        {
          "u": "/assets/notion-projects/rehab-game-screen-2.png",
          "a": "재활 치료 게임 화면 2",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/rehab-game-motion.png",
          "a": "재활 동작 인식 게임 테스트 장면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/rehab-app-login.png",
          "a": "재활 치료 앱 로그인 화면",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/rehab-app-flow.png",
          "a": "재활 치료 앱 주요 화면 흐름",
          "r": "gallery"
        }
      ],
      "details": {
        "프로젝트개요": "재활 치료와 인터랙티브 게임 UX의 경계를 줄여 치료 참여도를 높이기 위한 방향을 탐색했습니다.",
        "핵심포인트": [
          "재활 상황에 맞춘 게임형 인터페이스 시안",
          "사용자의 몰입감을 높이는 피드백 구조 고민",
          "헬스케어와 게임 UX의 접점을 시각적으로 검토"
        ]
      },
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/335faf73802f80699aa2c5c408e89ab0"
        }
      ]
    },
    {
      "id": "project-ros2-study",
      "type": "project",
      "t": {
        "ko": "ROS2 자율주행 스터디",
        "en": "ROS2 자율주행 스터디"
      },
      "s": {
        "ko": "ROS2 Nav2와 Gazebo 환경에서 경로 계획과 자율주행 기초를 반복 실습한 스터디형 프로젝트입니다.",
        "en": "ROS2 Nav2와 Gazebo 환경에서 경로 계획과 자율주행 기초를 반복 실습한 스터디형 프로젝트입니다."
      },
      "year": "2024",
      "tags": [
        "ROS2",
        "Nav2",
        "Gazebo"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/ros2-cover.png",
          "a": "ROS2 자율주행 스터디 커버",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/ros2-gazebo.png",
          "a": "Gazebo 자율주행 실습 화면",
          "r": "gallery"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/330faf73802f80da9529d35696f4588d"
        }
      ]
    },
    {
      "id": "project-pixhawk-autonomy",
      "type": "project",
      "t": {
        "ko": "픽스호크 활용 자율주행",
        "en": "픽스호크 활용 자율주행"
      },
      "s": {
        "ko": "픽스호크와 미션플래너를 활용해 자율주행 드론 제어 흐름을 익히고 실습한 프로젝트입니다.",
        "en": "픽스호크와 미션플래너를 활용해 자율주행 드론 제어 흐름을 익히고 실습한 프로젝트입니다."
      },
      "year": "2024",
      "tags": [
        "Pixhawk",
        "Mission Planner",
        "Drone"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/pixhawk-cover.png",
          "a": "픽스호크 자율주행 커버",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f802788f4ecc0ff3e2dea"
        }
      ]
    },
    {
      "id": "project-autonomous-competition",
      "type": "project",
      "t": {
        "ko": "자율주행 경진대회",
        "en": "자율주행 경진대회"
      },
      "s": {
        "ko": "산업부 주관 자율주행 경진대회 환경에서 실제 대회형 주행과 제어 튜닝을 경험한 프로젝트입니다.",
        "en": "산업부 주관 자율주행 경진대회 환경에서 실제 대회형 주행과 제어 튜닝을 경험한 프로젝트입니다."
      },
      "year": "2024",
      "tags": [
        "Autonomous",
        "Competition",
        "Mobility"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/carla-cover.png",
          "a": "자율주행 경진대회 커버",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f806da756fdaadd4f250c"
        }
      ]
    },
    {
      "id": "project-upcycle-jbmotors",
      "type": "project",
      "t": {
        "ko": "전북현대모터스 FC 협력 업사이클",
        "en": "전북현대모터스 FC 협력 업사이클"
      },
      "s": {
        "ko": "폐키보드를 전북현대모터스 FC 굿즈로 재가공해 실제 판매와 사업화 흐름까지 연결한 프로젝트입니다.",
        "en": "폐키보드를 전북현대모터스 FC 굿즈로 재가공해 실제 판매와 사업화 흐름까지 연결한 프로젝트입니다."
      },
      "year": "2026",
      "tags": [
        "Upcycling",
        "Brand",
        "Goods"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/jbmotors-upcycle-cover.png",
          "a": "전북현대모터스 FC 업사이클 커버",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/jbmotors-upcycle-1.png",
          "a": "전북현대모터스 FC 업사이클 제품",
          "r": "gallery"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/330faf73802f808eb0caea4524c71e63"
        }
      ]
    },
    {
      "id": "project-upcycle-givingplus",
      "type": "project",
      "t": {
        "ko": "기빙플러스 업사이클 제품 입점",
        "en": "기빙플러스 업사이클 제품 입점"
      },
      "s": {
        "ko": "산업단지 폐플라스틱을 필라멘트와 굿즈로 가공해 입점형 상품화 경험까지 이어간 프로젝트입니다.",
        "en": "산업단지 폐플라스틱을 필라멘트와 굿즈로 가공해 입점형 상품화 경험까지 이어간 프로젝트입니다."
      },
      "year": "2026",
      "tags": [
        "Upcycling",
        "Filament",
        "Commercialization"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/givingplus-upcycle-cover.png",
          "a": "기빙플러스 업사이클 커버",
          "r": "cover"
        },
        {
          "u": "/assets/notion-projects/givingplus-upcycle-1.jpg",
          "a": "기빙플러스 업사이클 제품",
          "r": "gallery"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/330faf73802f80708574fdc86e452c38"
        }
      ]
    },
    {
      "id": "project-self-powered-dehumidifier",
      "type": "project",
      "t": {
        "ko": "수분 자가 발전응용 제습장치 제작",
        "en": "수분 자가 발전응용 제습장치 제작"
      },
      "s": {
        "ko": "수분 자가발전 아이디어를 제습장치 구조와 결합해 실현 가능성을 검토한 하드웨어 프로젝트입니다.",
        "en": "수분 자가발전 아이디어를 제습장치 구조와 결합해 실현 가능성을 검토한 하드웨어 프로젝트입니다."
      },
      "year": "2024",
      "tags": [
        "Energy",
        "Hardware",
        "Prototype"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/generated/project-lab.png",
          "a": "수분 자가 발전응용 제습장치 대표 이미지",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/330faf73802f80baa069e8cf86b99000"
        }
      ]
    },
    {
      "id": "project-personal-color-chatbot",
      "type": "project",
      "t": {
        "ko": "AWS 클라우드 활용 퍼스널컬러 챗봇",
        "en": "AWS 클라우드 활용 퍼스널컬러 챗봇"
      },
      "s": {
        "ko": "슬랙 챗봇과 색 조합 분석을 통해 퍼스널 컬러를 추천하는 클라우드 기반 서비스 실험 프로젝트입니다.",
        "en": "슬랙 챗봇과 색 조합 분석을 통해 퍼스널 컬러를 추천하는 클라우드 기반 서비스 실험 프로젝트입니다."
      },
      "year": "2023",
      "tags": [
        "AWS",
        "Slack Bot",
        "Color"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/personal-color-cover.png",
          "a": "퍼스널컬러 챗봇 커버",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f80a99356c92f666342f7"
        }
      ]
    },
    {
      "id": "project-java-registration",
      "type": "project",
      "t": {
        "ko": "객체지향프로그래밍 JAVA 수강신청 알고리즘",
        "en": "객체지향프로그래밍 JAVA 수강신청 알고리즘"
      },
      "s": {
        "ko": "소켓 통신과 객체지향 설계를 바탕으로 수강신청 알고리즘과 프로그램 구조를 구현한 프로젝트입니다.",
        "en": "소켓 통신과 객체지향 설계를 바탕으로 수강신청 알고리즘과 프로그램 구조를 구현한 프로젝트입니다."
      },
      "year": "2023",
      "tags": [
        "Java",
        "Socket",
        "OOP"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f8015abedf888b2a0fcc9"
        }
      ]
    },
    {
      "id": "project-chiangmai-seminar",
      "type": "project",
      "t": {
        "ko": "치앙마이 해외 SW교육 & 세미나",
        "en": "치앙마이 해외 SW교육 & 세미나"
      },
      "s": {
        "ko": "치앙마이 대학교에서 SW 교육을 받고, 스마트 헬스케어 분야 세미나 발표까지 경험한 글로벌 학습 프로젝트입니다.",
        "en": "치앙마이 대학교에서 SW 교육을 받고, 스마트 헬스케어 분야 세미나 발표까지 경험한 글로벌 학습 프로젝트입니다."
      },
      "year": "2023",
      "tags": [
        "Seminar",
        "Global",
        "Healthcare"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f80c69e73d5c189974e0a"
        }
      ]
    },
    {
      "id": "project-robot-dog",
      "type": "project",
      "t": {
        "ko": "4족보행 로봇 개발",
        "en": "4족보행 로봇 개발"
      },
      "s": {
        "ko": "사족 보행 구조와 로봇 제어 흐름을 탐색하기 위한 로봇 프로젝트입니다.",
        "en": "사족 보행 구조와 로봇 제어 흐름을 탐색하기 위한 로봇 프로젝트입니다."
      },
      "year": "2026",
      "tags": [
        "Robot",
        "Hardware"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/robot-dog-cover.png",
          "a": "4족보행 로봇 개발 커버",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f805582b6e4b6970a187f"
        }
      ]
    },
    {
      "id": "project-robot-arm",
      "type": "project",
      "t": {
        "ko": "3D 설계 로봇팔 제어",
        "en": "3D 설계 로봇팔 제어"
      },
      "s": {
        "ko": "비전 인식 기반으로 로봇팔을 제어하는 흐름을 3D 설계와 함께 검토한 프로젝트입니다.",
        "en": "비전 인식 기반으로 로봇팔을 제어하는 흐름을 3D 설계와 함께 검토한 프로젝트입니다."
      },
      "year": "2026",
      "tags": [
        "Robot Arm",
        "3D",
        "Vision"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f80a3a073d981caee0c8a"
        }
      ]
    },
    {
      "id": "project-ev-medical-vehicle",
      "type": "project",
      "t": {
        "ko": "심부전증 환자를 위한 EV 차량 개선안",
        "en": "심부전증 환자를 위한 EV 차량 개선안"
      },
      "s": {
        "ko": "실측 EV 차량 모델링을 바탕으로 이동형 의료 차량 아이디어를 구체화한 모빌리티 프로젝트입니다.",
        "en": "실측 EV 차량 모델링을 바탕으로 이동형 의료 차량 아이디어를 구체화한 모빌리티 프로젝트입니다."
      },
      "year": "2025",
      "tags": [
        "EV",
        "Mobility",
        "Healthcare"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/ev-medical-cover.png",
          "a": "EV 차량 개선안 커버",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f80c8a2b7e86ecaeffe31"
        }
      ]
    },
    {
      "id": "project-peltier-cooler",
      "type": "project",
      "t": {
        "ko": "펠티어 노트북 쿨러",
        "en": "펠티어 노트북 쿨러"
      },
      "s": {
        "ko": "펠티어 소자의 전열발전을 활용해 냉각과 에너지 순환을 함께 노린 노트북 쿨러 아이디어 프로젝트입니다.",
        "en": "펠티어 소자의 전열발전을 활용해 냉각과 에너지 순환을 함께 노린 노트북 쿨러 아이디어 프로젝트입니다."
      },
      "year": "2025",
      "tags": [
        "Peltier",
        "Cooling",
        "Hardware"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/peltier-cover.jpg",
          "a": "펠티어 노트북 쿨러 커버",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f800780eade7b89c890b9"
        }
      ]
    },
    {
      "id": "project-clicker",
      "type": "project",
      "t": {
        "ko": "압력센서를 활용한 발달장애 측정 클릭커",
        "en": "압력센서를 활용한 발달장애 측정 클릭커"
      },
      "s": {
        "ko": "압력센서를 손 움직임 지표로 활용해 발달장애 아동의 뇌인지 능력을 측정하려는 프로젝트입니다.",
        "en": "압력센서를 손 움직임 지표로 활용해 발달장애 아동의 뇌인지 능력을 측정하려는 프로젝트입니다."
      },
      "year": "2025",
      "tags": [
        "Sensor",
        "Healthcare",
        "Prototype"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/clicker-cover.png",
          "a": "발달장애 측정 클릭커 커버",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f8074a3c4f9fb4ee90343"
        }
      ]
    },
    {
      "id": "project-coffee-box",
      "type": "project",
      "t": {
        "ko": "커피박 업사이클 상자 제작",
        "en": "커피박 업사이클 상자 제작"
      },
      "s": {
        "ko": "강릉 지역 커피박 문제에서 출발해 실제 상자 제작 단계까지 연결한 업사이클 프로젝트입니다.",
        "en": "강릉 지역 커피박 문제에서 출발해 실제 상자 제작 단계까지 연결한 업사이클 프로젝트입니다."
      },
      "year": "2025",
      "tags": [
        "Upcycling",
        "Coffee Grounds",
        "Product"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/coffee-box-cover.jpg",
          "a": "커피박 업사이클 상자 제작 커버",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f80cea845ee4a96cd48dd"
        }
      ]
    },
    {
      "id": "project-baekchul-sikhye",
      "type": "project",
      "t": {
        "ko": "발효 백출 식혜 제작",
        "en": "발효 백출 식혜 제작"
      },
      "s": {
        "ko": "쓴 한약재 백출을 발효 기반 식혜로 바꾸고 데이터 예측까지 시도한 식품 개발 프로젝트입니다.",
        "en": "쓴 한약재 백출을 발효 기반 식혜로 바꾸고 데이터 예측까지 시도한 식품 개발 프로젝트입니다."
      },
      "year": "2023",
      "tags": [
        "Food Tech",
        "Data",
        "Experiment"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/evidence/projects/baekchul-sikhye-cover.png",
          "a": "발효 백출 식혜 제작 커버",
          "r": "cover"
        },
        {
          "u": "/assets/evidence/projects/baekchul-risk-chart.png",
          "a": "백출 식혜 위해 인자 분석 자료",
          "r": "gallery"
        },
        {
          "u": "/assets/evidence/projects/baekchul-fermentation-chart.png",
          "a": "발효 백출 식혜 발효 결과 분석 자료",
          "r": "gallery"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f80b0b391d7fe4e6af52f"
        }
      ]
    },
    {
      "id": "project-ai-pedal-blackbox",
      "type": "project",
      "t": {
        "ko": "인지오류 예방 AI 페달 블랙박스",
        "en": "인지오류 예방 AI 페달 블랙박스"
      },
      "s": {
        "ko": "페달 블랙박스를 활용해 사고 전 경고형 안내장치로 확장하는 아이디어 프로젝트입니다.",
        "en": "페달 블랙박스를 활용해 사고 전 경고형 안내장치로 확장하는 아이디어 프로젝트입니다."
      },
      "year": "2026",
      "tags": [
        "AI",
        "Mobility",
        "Safety"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f8000b265d7e04aeb385e"
        }
      ]
    },
    {
      "id": "project-population-visualization",
      "type": "project",
      "t": {
        "ko": "유동인구 데이터 시각화",
        "en": "유동인구 데이터 시각화"
      },
      "s": {
        "ko": "서울 시민 유동 데이터를 기반으로 이슈 연계형 인구 포화 예측을 시도한 데이터 시각화 프로젝트입니다.",
        "en": "서울 시민 유동 데이터를 기반으로 이슈 연계형 인구 포화 예측을 시도한 데이터 시각화 프로젝트입니다."
      },
      "year": "2026",
      "tags": [
        "Data Viz",
        "Big Data",
        "Urban"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/population-cover.png",
          "a": "유동인구 데이터 시각화 커버",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/333faf73802f80c5abb0fbccaef142e4"
        }
      ]
    },
    {
      "id": "project-drone-soccer",
      "type": "project",
      "t": {
        "ko": "드론 축구",
        "en": "드론 축구"
      },
      "s": {
        "ko": "드론 축구 대회 참여와 동아리 훈련을 통해 드론 제어와 실전 조작 감각을 쌓은 활동형 프로젝트입니다.",
        "en": "드론 축구 대회 참여와 동아리 훈련을 통해 드론 제어와 실전 조작 감각을 쌓은 활동형 프로젝트입니다."
      },
      "year": "2023",
      "tags": [
        "Drone",
        "Competition",
        "Control"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/drone-soccer-cover.png",
          "a": "드론 축구 커버",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/336faf73802f805eaf09f934e75304b1"
        }
      ]
    },
    {
      "id": "project-manual-electric-vehicle",
      "type": "project",
      "t": {
        "ko": "아두이노 기반 수동 제어 전기차량",
        "en": "아두이노 기반 수동 제어 전기차량"
      },
      "s": {
        "ko": "파워서플라이와 페달을 활용해 사람이 탑승 가능한 크기의 전기 차량을 제작하며 조향장치와 제어 로직을 익힌 프로젝트입니다.",
        "en": "파워서플라이와 페달을 활용해 사람이 탑승 가능한 크기의 전기 차량을 제작하며 조향장치와 제어 로직을 익힌 프로젝트입니다."
      },
      "year": "2025",
      "tags": [
        "Arduino",
        "Vehicle",
        "Control"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [
        {
          "u": "/assets/notion-projects/manual-ev-cover.jpg",
          "a": "수동 제어 전기차량 커버",
          "r": "cover"
        }
      ],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/33afaf73802f808b9eaad2ac3d37f544"
        }
      ]
    },
    {
      "id": "project-ess-hanok",
      "type": "project",
      "t": {
        "ko": "한옥의 ESS 설계",
        "en": "한옥의 ESS 설계"
      },
      "s": {
        "ko": "태양열 발전과 저장시설 부족 문제를 한옥 구조에 맞춰 해결하려는 ESS 아이디어 프로젝트입니다.",
        "en": "태양열 발전과 저장시설 부족 문제를 한옥 구조에 맞춰 해결하려는 ESS 아이디어 프로젝트입니다."
      },
      "year": "2025",
      "tags": [
        "Energy",
        "ESS",
        "Design"
      ],
      "featured": false,
      "rank": 99,
      "imgs": [],
      "links": [
        {
          "label": "Notion 원문",
          "url": "https://www.notion.so/334faf73802f8030883bc17cc132f157"
        }
      ]
    }
  ]
} as const satisfies Portfolio;

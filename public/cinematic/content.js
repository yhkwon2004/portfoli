import { records } from './data.js';
// 개인 소개와 대표 프로젝트 순서는 여기서, 전체 프로젝트는 data.js에서 수정합니다.
export { records };
export const projects = records.filter(item => item.type === 'project');
export const awards = records.filter(item => item.type === 'award');
export const categories = ['All', 'Mobility', 'Hardware', 'AI & Data', 'Software', 'Product'];
export const featuredIds = ['project-upcycle', 'project-autonomous', 'project-handmade-car', 'project-iot-ring', 'project-kakao-fin-next', 'project-ai-detector'];
export const featured = featuredIds.map(id => projects.find(item => item.id === id));
// Article summaries are original paraphrases. Sources identify the person/team or the related event.
export const press = [
 {id:'won-pbl-2026',title:'WON+PBL 교과, 창업아이디어 경진대회 수상 결실',publisher:'원광대학교',date:'2026-06-02',url:'https://www.wku.ac.kr/wonpbl-교과-창업아이디어-경진대회-수상-결실원광대학.html',summary:'권용현의 비전문가용 증거 정리 리걸 AI 에이전트와 GIST·호남권 대학 창업아이디어 경진대회 수상 소식을 소개한 대학 공식 보도입니다.',relation:'직접 소개',projectIds:[],imageId:null,image:{src:'assets/portfolio/press/won-pbl-2026.jpg',alt:'WON+PBL 창업아이디어 경진대회 관련 공식 사진',source:{label:'원광대학교',url:'https://www.wku.ac.kr/wonpbl-교과-창업아이디어-경진대회-수상-결실원광대학.html'}}},
 {id:'recap-soldout-2026',title:'‘2025 전북권 Drive-UP 창업캠프’ 수상 Re:CAP팀의 제품, 성황리에 완판',publisher:'원광대학교 RISE사업단',date:'2026-04-10',url:'https://rise.wku.ac.kr/?p=3811',summary:'버려진 키보드가 전북현대 팬들의 키링으로 이어졌습니다. Re:CAP의 제품 출시와 현장 판매 시작 1시간 만의 완판을 전합니다.',relation:'직접 소개',projectIds:['project-upcycle','project-upcycle-jbmotors','award-driveup'],imageId:'project-upcycle-jbmotors'},
 {id:'recap-store-2026',title:'학생 창업동아리 RE:CAP팀, 업사이클링 제품 전북현대모터스FC 입점',publisher:'원광대학교',date:'2026-04-06',url:'https://www.wku.ac.kr/학생-창업동아리-recap팀-업사이클링-제품-전북현대모.html',summary:'폐키보드를 활용한 수작업 키링의 구단 입점 과정과 팀장 권용현이 밝힌 제작·기부 계획을 담았습니다.',relation:'직접 소개',projectIds:['project-upcycle','project-upcycle-jbmotors'],imageId:'project-upcycle'},
 {id:'gangneung-2025',title:'2025 근거기반 지역문제 해결 캠프서 대상 수상',publisher:'원광대학교',date:'2025-09-03',url:'https://www.wku.ac.kr/2025-근거기반-지역문제-해결-캠프서-대상-수상원광대학.html',summary:'현장 인터뷰와 데이터 분석으로 지역 문제를 탐색한 강릉 캠프의 대학 공식 기록입니다. 개인 이름이 나오지 않는 행사 관련 보도입니다.',relation:'관련 보도',projectIds:['award-gangneung'],imageId:'award-gangneung'},
 {id:'driveup-2025',title:'‘2025 전북권 Drive-UP 창업캠프’서 대상 포함 3개 팀 수상',publisher:'원광대학교',date:'2025-08-11',url:'https://www.wku.ac.kr/?p=148305',summary:'권용현·이지윤·황윤성의 Re:cap 팀이 제안한 키캡 업사이클링 아이디어가 대상과 구단 굿즈 입점 기회로 연결된 기록입니다.',relation:'직접 소개',projectIds:['project-upcycle','project-upcycle-jbmotors','award-driveup'],imageId:'award-driveup'},
 {id:'educart-2024',title:'LINC3.0사업단, 에듀카트 기반 비즈모델 개발 캠프',publisher:'원광대학교',date:'2024-06-10',url:'https://www.wku.ac.kr/linc3-0사업단-에듀카트-기반-비즈모델-개발-캠프원광대.html',summary:'전기차 구동·제어 교육부터 카트 조립과 기능 시험까지, 에듀카트 캠프의 진행 과정을 전합니다. 개인 수상 여부는 별도 수상 기록에서 확인할 수 있습니다.',relation:'관련 보도',projectIds:['award-educart-2024'],imageId:'award-educart-2024'}
];
export const content = {
 name:'권용현', englishName:'Yonghyun Kwon', wordmark:'KWON',
 role:'Developer · Maker · Problem solver', location:'Based in South Korea', email:'yhkwon2004@gmail.com',
 intro:['현장의 문제를 발견하고,','동작하는 제품으로 답합니다.'],
 about:{heading:['현장을 이해하고,','가능성을 구현합니다.'],english:'From real-world problems to working products.',description:'컴퓨터 소프트웨어와 스마트 모빌리티를 공부하며 하드웨어 제작, 펌웨어, AI와 창업을 연결합니다. 문제의 시급성과 중요성을 판단하고, 직접 만들고 검증하는 과정에서 다음 해답을 찾습니다.'},
 vision:{heading:['경험과 도전은,','나눔에서 이루어집니다.'],english:['Build. Learn. Share.','And make the next possibility real.']},
 news:[{date:'2026.04',title:'전북현대모터스FC × Re:cap, 아이디어에서 실제 판매까지',target:'works/project-upcycle-jbmotors/'},{date:'2026',title:'스마트 IoT 링거폴대 — 회로와 제품 설계',target:'works/project-iot-ring/'},{date:'2025.08',title:'Drive Up 창업캠프 대상 · 전북도지사 표창',target:'records/award-driveup/'}],
 practice:[
  {number:'01',title:'Build.',subtitle:'하드웨어와 소프트웨어를 잇다.',text:'회로와 3D 설계부터 펌웨어, 실제 장비 테스트까지. 동작하는 결과물로 아이디어를 확인합니다.',tags:['ESP32','Altium','CATIA','3D Printing']},
  {number:'02',title:'Develop.',subtitle:'문제에 맞는 기술을 선택하다.',text:'자율주행 시뮬레이션, AI 실험, 웹과 앱 개발을 통해 현장의 문제를 사용 가능한 서비스로 만듭니다.',tags:['ROS2','Python','TypeScript','Swift']},
  {number:'03',title:'Connect.',subtitle:'아이디어를 시장과 연결하다.',text:'Re:cap의 업사이클링 제품 개발과 브랜드 협업을 통해 제품 제작에서 실제 판매까지 경험합니다.',tags:['Re:cap','Upcycling','Prototyping','Collaboration']}
 ],
 links:[{label:'GitHub',url:'https://github.com/yhkwon2004'},{label:'Notion',url:'https://befitting-paper-753.notion.site/PR-75bfaf73802f835f948881f5ba22bdc4?pvs=74'},{label:'Blog',url:'https://blog.naver.com/procmd'}]
};
export const detailLabels={프로젝트개요:'프로젝트 개요',프로젝트설명:'프로젝트 설명',핵심포인트:'핵심 포인트',배운점:'배운 점',활동기간:'활동 기간',주요기술활동:'주요 기술 활동',문제해결과리더십:'문제 해결과 리더십',진행타임라인:'진행 타임라인',막혔던부분과해결:'막혔던 부분과 해결',환경구축메모:'환경 구축 메모',핵심축:'핵심 축',대표프로젝트:'대표 프로젝트',문제정의:'문제 정의',진행포인트:'진행 포인트',핵심기능:'핵심 기능',기술스택:'기술 스택',분석모듈:'분석 모듈',한줄소개:'한 줄 소개'};
export const cover = item => item.images.find(image=>image.role==='cover') || item.images[0];
export const itemPath = item => `${item.type==='project'?'works':'records'}/${item.id}/`;
export function filterProjects({category='All',query='',year='All'}={}) {
 const term=query.trim().toLocaleLowerCase();
 return projects.filter(item=>(category==='All'||item.category===category)&&(year==='All'||item.year.includes(year))&&(!term||`${item.title} ${item.summary} ${item.tags.join(' ')}`.toLocaleLowerCase().includes(term)));
}
export function youtubeId(url) {
 try { const u=new URL(url); const id=u.hostname==='youtu.be'?u.pathname.slice(1):['youtube.com','www.youtube.com'].includes(u.hostname)?u.searchParams.get('v')||u.pathname.split('/').filter(Boolean).at(-1):null; return /^[\w-]{11}$/.test(id||'')?id:null; } catch{return null;}
}

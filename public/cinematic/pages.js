import { content, records, projects, awards, press, categories, cover, itemPath, detailLabels, youtubeId, filterProjects } from './content.js?v=20261003-studio';

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const e = escapeHTML;
const number = value => String(value).padStart(2, '0');
const tags = item => `<div class="tags">${item.tags.map(tag=>`<span>${e(tag)}</span>`).join('')}</div>`;
const external = link => { try { return ['https:','http:'].includes(new URL(link.url).protocol) ? `<a href="${e(link.url)}" target="_blank" rel="noopener noreferrer">${e(link.label)} <span>↗</span></a>` : ''; } catch { return ''; } };
export const externalLinks = links => links.map(external).join('');
export const photoSource = image => image.source ? `<span class="image-source">사진 출처 ${external(image.source)}</span>` : '';

export function projectFacts(item) {
  const details=item.details, collaborators=Array.isArray(details.협업)?details.협업.filter(name=>/^[가-힣]{2,4}$/.test(name)):[];
  const names=collaborators.length?[...new Set([content.name,...collaborators])]:[];
  const teamNotes=Array.isArray(details['팀과 역할'])?details['팀과 역할'].filter(line=>!line.startsWith(`${content.name}:`)):[];
  const explicitCount=teamNotes.flatMap(line=>[...line.matchAll(/(\d+)인/g)]).reduce((sum,match)=>sum+Number(match[1]),0);
  return {
    idea:details.한줄소개||item.summary,
    participants:names.length?`${collaborators.includes(content.name)?'':'확인된 참여 '}${names.length}명`:explicitCount?`${explicitCount}명`:'인원 미기재',
    team:names.length?names.join(' · '):teamNotes.join(' · ')||'팀 구성 미기재',
    role:Array.isArray(details.역할)?details.역할.join(' · '):details.역할||'프로젝트 참여 · 세부 역할 미기재'
  };
}

export function pressCard(article) {
  try { if (!['https:','http:'].includes(new URL(article.url).protocol)) return ''; } catch { return ''; }
  const record=records.find(item=>item.id===article.imageId), image=article.image||(record&&cover(record));
  return `<a class="press-card" href="${e(article.url)}" target="_blank" rel="noopener noreferrer" data-press-id="${e(article.id)}"><div class="press-image">${image?`<img src="${e(image.thumb||image.src)}" alt="${e(image.alt)}${article.image?'':' · 관련 포트폴리오 사진'}" loading="lazy" decoding="async"><span class="press-image-caption">${article.image?.source?`사진: ${e(article.image.source.label)}`:'포트폴리오 아카이브'}</span>`:`<div class="press-placeholder" aria-hidden="true"><span>FIELD NOTES</span><b>${e(article.publisher)}</b><small>${e(article.date.slice(0,4))} / KWON</small></div>`}<span class="press-type">${e(article.relation)}</span><span class="press-open" aria-hidden="true">↗</span></div><div class="press-meta"><span>${e(article.publisher)}</span><time datetime="${e(article.date)}">${e(article.date.replaceAll('-','.'))}</time></div><h3>${e(article.title)}</h3>${article.originalTitle&&article.originalTitle!==article.title?`<p class="press-original-title">원문 · ${e(article.originalTitle)}</p>`:''}<p>${e(article.summary)}</p><span class="press-read">기사 원문 읽기 ↗<span class="sr-only"> (새 탭)</span></span></a>`;
}

export const fieldPhotos = [
  ['project-handmade-car','notion-projects/handmade-car-driving.webp'],
  ['project-upcycle','evidence/project-upcycle-1.webp'],
  ['project-autonomous','evidence/projects/autonomous-track-run.webp'],
  ['project-robot-dog','notion-projects/robot-dog-cover.webp'],
  ['project-manual-electric-vehicle','notion-projects/manual-ev-cover.webp'],
  ['project-drone-soccer','notion-projects/drone-soccer-cover.webp']
].map(([id,file])=>{const item=projects.find(item=>item.id===id);return {item,image:item?.images.find(image=>image.src.endsWith(file)&&!image.illustrative&&image.role!=='certificate')};}).filter(entry=>entry.image);

export function visual(item, { full=false, eager=false }={}) {
  const image = cover(item);
  return image ? `<img src="${e(full?image.src:image.thumb)}" alt="${e(image.alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">${image.illustrative?'<span class="concept-label">CONCEPT VISUAL</span>':''}` : `<div class="type-visual" aria-hidden="true"><span>${e(item.category)}</span><b>${e(item.tags[0]||item.category)}</b><small>${e(item.year)} / KWON</small></div>`;
}
export function projectCard(item, index=0) {
  return `<a class="project-card" href="${itemPath(item)}"><div class="project-image">${visual(item)}<span class="project-open">↗</span></div><div class="project-caption"><span>${e(item.year)}</span><span>[ ${e(item.category)} ]</span></div><h2>${e(item.title)}</h2><p>${e(item.summary)}</p>${tags(item)}</a>`;
}
function pageHeading(kicker, title, text='') {
  return `<div class="page-heading"><p class="eyebrow">${e(kicker)}</p><h1>${title}</h1>${text?`<p class="page-intro">${e(text)}</p>`:''}</div>`;
}
export function worksPage(search) {
  const category=categories.includes(search.get('category'))?search.get('category'):'All';
  const year=search.get('year')||'All', query=search.get('q')||'';
  const years=[...new Set(projects.flatMap(item=>item.year.match(/20\d{2}/g)||[]))].sort().reverse();
  const results=filterProjects({category,year,query});
  return `${pageHeading('01 / PROJECT ARCHIVE',`Works<span class="heading-count">(${number(projects.length)})</span>`,'현장의 문제에서 시작해, 직접 만들고 검증한 프로젝트들.')}<section class="archive" aria-label="프로젝트 목록"><div class="archive-toolbar"><div class="category-tabs" role="group" aria-label="프로젝트 분야">${categories.map(cat=>`<button data-category="${e(cat)}" aria-pressed="${cat===category}">${e(cat)}<sup>${cat==='All'?projects.length:projects.filter(item=>item.category===cat).length}</sup></button>`).join('')}</div><form class="archive-search" role="search"><label><span class="sr-only">프로젝트 검색</span><input name="q" type="search" placeholder="프로젝트, 기술 검색" value="${e(query)}" autocomplete="off"></label><label><span class="sr-only">프로젝트 연도</span><select name="year" aria-label="프로젝트 연도"><option value="All">All years</option>${years.map(y=>`<option ${year===y?'selected':''}>${y}</option>`).join('')}</select></label><button type="submit" aria-label="검색">↗</button></form></div><div class="results-line"><span id="result-count" role="status">${number(results.length)} PROJECTS</span><button class="text-button" data-reset-filters ${!query&&category==='All'&&year==='All'?'hidden':''}>필터 초기화 ↺</button></div><div id="project-grid" class="project-grid">${results.map(projectCard).join('')||emptyResults()}</div></section><a class="motion-teaser" href="motion/"><span>DEVELOPER LAB / CASE STUDIES</span><h2>Inside the build.</h2><p>문제를 코드와 제품으로 바꾼 과정을 만나보세요. <b>↗</b></p></a>`;
}
export const emptyResults = () => '<div class="empty-results"><span>∅</span><h2>검색 결과가 없습니다.</h2><p>다른 프로젝트 이름이나 기술로 찾아보세요.</p><button class="pill" data-reset-filters>전체 프로젝트 보기 ↗</button></div>';

function relatedProjects(item, collection) {
  const related=[...collection.filter(other=>other.id!==item.id&&other.category===item.category),...collection.filter(other=>other.id!==item.id&&other.category!==item.category)].slice(0,6);
  if (!related.length) return '';
  const isProject=item.type==='project';
  return `<section class="related-projects" aria-labelledby="related-title"><header class="related-heading"><div><p class="eyebrow">${isProject?'MORE TO DISCOVER':'MORE RECOGNITION'} / ${number(related.length)}</p><h2 id="related-title">Keep exploring<span class="accent">.</span></h2></div><a class="underlined-link" href="${isProject?'works/':'news/'}">${isProject?'All projects':'All recognition'} ↗</a></header><div class="related-rail" role="region" aria-label="${isProject?'다른 프로젝트 둘러보기':'다른 수상 기록 둘러보기'}" tabindex="0">${related.map((other,index)=>`<a class="related-card" href="${itemPath(other)}"><div class="related-image">${visual(other)}<span class="related-open" aria-hidden="true">↗</span></div><div class="related-meta"><span>${number(index+1)} / ${e(other.category)}</span><span>${e(other.year)}</span></div><h3>${e(other.title)}</h3><p>${e(other.summary)}</p></a>`).join('')}</div><div class="related-footer"><span>SCROLL TO EXPLORE <span aria-hidden="true">↔</span></span><div><button type="button" data-related-step="-1" aria-label="이전 프로젝트 보기">←</button><button type="button" data-related-step="1" aria-label="다음 프로젝트 보기">→</button></div></div></section>`;
}

export function detailPage(item) {
  const isProject=item.type==='project', collection=isProject?projects:awards;
  const current=collection.indexOf(item), next=collection[(current+1)%collection.length], previous=collection[(current-1+collection.length)%collection.length];
  const mainImage=cover(item), mainIndex=item.images.indexOf(mainImage);
  const relatedPress=press.filter(article=>article.projectIds.includes(item.id));
  const facts=isProject&&projectFacts(item);
  return `${pageHeading(isProject?'01 / SELECTED PROJECT':'02 / RECOGNITION',isProject?'Works':'Recognition')}<article class="project-detail"><div class="detail-marquee" aria-hidden="true"><span>${e(item.title)} — ${e(item.title)} — </span></div><header class="detail-heading"><div class="detail-kicker"><a href="${isProject?'works/':'news/'}">← ${isProject?'All projects':'All recognition'}</a><span>${e(item.year)} / ${e(item.category)}</span></div><h2>${e(item.title)}</h2><p class="detail-summary">${e(item.summary)}</p>${tags(item)}</header>${mainImage?`<button class="detail-hero media-button ${mainImage.role==='certificate'?'certificate':''}" data-image="${mainIndex}" aria-label="${e(mainImage.alt)} 확대 보기">${visual(item,{full:true,eager:true})}<span class="zoom-label">VIEW FULL IMAGE ＋</span></button>${photoSource(mainImage)}`:`<div class="detail-hero no-image">${visual(item)}</div>`}<div class="detail-body"><aside class="detail-aside"><span class="eyebrow">PROJECT NOTES</span><dl><dt>YEAR</dt><dd>${e(item.year)||'—'}</dd><dt>FIELD</dt><dd>${e(item.category)}</dd>${isProject?`<dt>IDEA / 한 줄 소개</dt><dd class="project-idea">${e(facts.idea)}</dd><dt>TEAM / 참여 인원</dt><dd class="project-team"><strong>${e(facts.participants)}</strong><span>${e(facts.team)}</span></dd><dt>MY ROLE / 역할</dt><dd>${e(facts.role)}</dd>`:item.details.역할?`<dt>ROLE</dt><dd>${e(Array.isArray(item.details.역할)?item.details.역할.join(' · '):item.details.역할)}</dd>`:''}</dl><div class="source-links">${externalLinks(item.links)}</div><button class="share-button" data-share>Copy project link ↗</button></aside><div class="detail-copy">${Object.entries(item.details).map(([label,value])=>`<section><h3>${e(detailLabels[label]||label)}</h3>${Array.isArray(value)?`<ul>${value.map(line=>`<li>${e(line)}</li>`).join('')}</ul>`:`<p>${e(value)}</p>`}</section>`).join('')||`<section><h3>${isProject?'프로젝트 소개':'수상 기록'}</h3><p>${e(item.summary)}</p></section>`}${item.videos.length?`<section class="video-section"><h3>In action.</h3>${item.videos.map(video=>{const id=youtubeId(video.url);return `<div class="video-block">${id?`<div class="video-stage"><button class="video-play" data-video="${id}" data-video-title="${e(video.title||item.title)}" aria-label="${e(video.title||item.title)} 영상 재생"><span class="play-icon">▶</span><strong>${e(video.title||'프로젝트 영상')}</strong><small>PLAY VIDEO / YOUTUBE</small></button></div>`:''}<p class="video-caption">${e(video.title||'프로젝트 시연 영상')} ${external({label:'YouTube에서 보기',url:video.url})}</p></div>`;}).join('')}</section>`:''}</div></div>${item.images.length>1?`<section class="detail-gallery" aria-label="프로젝트 이미지 모음"><div class="gallery-heading"><span>PROCESS & DOCUMENTATION</span><span>${number(item.images.length-1)} IMAGES</span></div>${item.images.map((image,index)=>index===mainIndex?'':`<figure class="gallery-item ${image.role==='certificate'?'certificate':''}"><button class="media-button" data-image="${index}" aria-label="${e(image.alt)} 확대 보기"><img src="${e(image.src)}" alt="${e(image.alt)}" loading="lazy" decoding="async">${image.illustrative?'<span class="concept-label">CONCEPT VISUAL</span>':''}<span class="zoom-label">＋</span></button><figcaption><span>${number(index+1)} /</span>${e(image.alt)}${photoSource(image)}</figcaption></figure>`).join('')}</section>`:''}${relatedPress.length?`<section class="related-press"><header class="journal-heading"><div><span class="eyebrow">PRESS & CONTEXT</span><h2>Related stories.</h2></div><p>이 프로젝트와 연결되는 보도를 확인해 보세요.</p></header><div class="press-grid">${relatedPress.map(pressCard).join('')}</div></section>`:''}</article>${relatedProjects(item,collection)}${next?`<nav class="project-pagination" aria-label="프로젝트 이동"><a href="${itemPath(previous)}"><span>PREVIOUS ${isProject?'PROJECT':'RECORD'}</span><strong>← ${e(previous.title)}</strong></a><a href="${itemPath(next)}"><span>NEXT ${isProject?'PROJECT':'RECORD'}</span><strong>${e(next.title)} ↗</strong></a></nav>`:''}<div class="back-to-archive"><a class="pill" href="${isProject?'works/':'news/'}">${isProject?'All projects':'All recognition'} ↗</a></div>`;
}

export function newsPage() {
  const sorted=[...awards].sort((a,b)=>b.year.localeCompare(a.year));
  return `${pageHeading('02 / NEWS & RECOGNITION',`News<span class="heading-count">(${number(awards.length+press.length)})</span>`,'프로젝트의 다음 장면, 그리고 도전의 기록.')}<section class="latest-news"><p class="eyebrow">LATEST STORIES</p>${content.news.map(news=>`<a href="${news.target}"><time>${news.date}</time><h2>${e(news.title)}</h2><span>↗</span></a>`).join('')}</section><section id="press" class="press-section"><header class="journal-heading"><div><span class="eyebrow">PRESS / ${number(press.length)} STORIES</span><h2>In the press.</h2></div><p>나의 활동을 소개한 기사와 프로젝트의 배경이 되는 관련 보도. 출처와 발행일을 함께 기록했습니다.</p></header><div class="press-grid">${press.map(pressCard).join('')}</div></section><section class="recognition-list"><div class="archive-section-title"><h2>Recognition.</h2><span>${awards.length} AWARDS</span></div>${sorted.map(item=>`<a class="recognition-row" href="${itemPath(item)}"><time>${e(item.year)}</time><div><h3>${e(item.title)}</h3><p>${e(item.summary)}</p></div><span>↗</span></a>`).join('')}</section>`;
}

export function aboutPage() {
  const sections=[['education','Education.','배움'],['experience','Experience.','경험'],['certification','Qualifications.','자격']];
  return `${pageHeading('03 / ABOUT ME','Yonghyun<br>Kwon<span class="accent">.</span>')}<section class="about-profile"><p class="profile-name">권용현 <span>Developer · Maker</span></p><h2>${content.about.heading.map(e).join('<br>')}</h2><p>${e(content.about.description)}</p><div class="profile-stats"><a href="works/"><b>${projects.length}</b><span>PROJECTS</span></a><a href="news/"><b>${awards.length}</b><span>AWARDS</span></a><span><b>${records.filter(item=>item.type==='certification').length}</b><span>QUALIFICATIONS</span></span></div><div class="profile-links">${externalLinks(content.links)}<a href="mailto:${content.email}">Email ↗</a></div></section><a class="activity-teaser" href="activities/"><span class="eyebrow">2023 — 2026 / MY JOURNEY</span><h2>Learning,<br>in motion<span class="accent">.</span></h2><p>LLM 연구실에서 모빌리티, 드론 교육, 창업과 IoT까지.<br>경험이 다음 경험으로 이어지는 과정을 만나보세요.</p><span class="activity-teaser-link">활동 타임라인 보기 <b aria-hidden="true">↗</b></span></a><section class="field-gallery"><header class="journal-heading"><div><span class="eyebrow">MAKING / TESTING / LEARNING</span><h2>In the field.</h2></div><p>직접 만들고, 달리고, 실험한 순간들. 사진을 누르면 각 프로젝트의 기록으로 이어집니다.</p></header><div class="field-grid">${fieldPhotos.map(({item,image},index)=>`<a class="field-photo" href="${itemPath(item)}"><figure><img src="${e(image.thumb)}" alt="${e(image.alt)}" loading="lazy" decoding="async"><figcaption><span>${number(index+1)} / ${e(item.title)}</span><span aria-hidden="true">↗</span></figcaption></figure></a>`).join('')}</div></section><section class="about-belief"><span class="eyebrow">WHAT I BELIEVE IN</span><h2>경험과 도전은,<br>나눔에서 이루어집니다.</h2><p>Build. Learn. Share.</p></section>${sections.map(([type,title,korean])=>`<section class="profile-section"><div><span class="eyebrow">${korean}</span><h2>${title}</h2></div><div>${records.filter(item=>item.type===type).sort((a,b)=>b.year.localeCompare(a.year)).map(item=>`<article class="profile-row"><span>${e(item.year)||'QUALIFICATION'}</span><h3>${e(item.title)}</h3><p>${e(item.summary)}</p>${tags(item)}</article>`).join('')}</div></section>`).join('')}<a class="about-contact" href="./#contact"><span>LET’S CONNECT</span><h2>Make it real. ↗</h2></a>`;
}

export const activityIds = ['exp-llm-lab','edu-jst','exp-drone-instructor','exp-cnu','exp-iot-lab'];

export function activitiesPage() {
  const activities=activityIds.map(id=>records.find(item=>item.id===id)).filter(Boolean);
  return `${pageHeading('04 / ACTIVITIES & EXPERIENCE','Always<br>in motion<span class="accent">.</span>','연구실에서 배운 기술을 현장에서 검증하고, 사람과 제품을 연결해 온 시간.')}<section class="activity-journey" aria-label="활동 타임라인"><aside class="activity-index"><span class="eyebrow">2023 — 2026</span><h2>다음 가능성은,<br>경험에서 시작됩니다.</h2><nav aria-label="활동 연도 바로가기">${activities.map((item,index)=>`<a href="activities/#${e(item.id)}"><span>${number(index+1)}</span>${e(item.year.replaceAll('-',' — '))}<span aria-hidden="true">↘</span></a>`).join('')}</nav><a class="underlined-link" href="about/">About Yonghyun ↗</a></aside><ol class="activity-timeline">${activities.map((item,index)=>`<li class="activity-entry" id="${e(item.id)}" data-activity-id="${e(item.id)}"><div class="activity-marker" aria-hidden="true">${number(index+1)}</div><div class="activity-entry-content"><p class="activity-year">${e(item.year.replaceAll('-','—'))}</p><p class="eyebrow">${item.type==='education'?'EDUCATION':'EXPERIENCE'} / ${number(index+1)}</p><h2>${e(item.title)}</h2>${item.summary?`<p class="activity-summary">${e(item.summary)}</p>`:''}${tags(item)}${item.links.length?`<div class="activity-sources">${externalLinks(item.links)}</div>`:''}</div></li>`).join('')}</ol></section><a class="activity-closing" href="works/"><span class="eyebrow">EXPERIENCE INTO PRACTICE</span><h2>배움의 다음은,<br>만드는 일<span class="accent">.</span></h2><span>프로젝트에서 이어 보기 <b aria-hidden="true">↗</b></span></a>`;
}

export function motionPage() {
  const cases=[
    {id:'project-factline',field:'LLM / FULL STACK',problem:'흩어진 일상 기록과 대화, 증거만으로는 사건의 시간 순서를 파악하기 어렵습니다.',design:'기록·자료·이벤트를 타임라인으로 연결하고, LLM 질문으로 누락과 모순을 점검하는 흐름을 구성했습니다.',verification:'공식 README의 기록 허브와 셀프 기록 화면에서 실제 인터페이스를 확인할 수 있습니다. 로컬 개발과 테스트에는 Mock AI를 사용합니다.',evidence:'구현 화면 · 공개 저장소'},
    {id:'project-iot-ring',field:'EMBEDDED / HARDWARE',problem:'반복적인 수액 확인과 환자의 임의 조작은 간호 인력의 관리 부담으로 이어집니다.',design:'ESP32 회로와 PCB, 기존 링거폴대에 부착하는 3D 하우징을 함께 설계했습니다.',verification:'제작된 PCB의 전압·USB 인식·펌웨어를 점검하고, 기판과 하우징을 실물로 검토한 기록을 남겼습니다.',evidence:'회로 · PCB · 실물 검수 기록'},
    {id:'project-ai-airsim',field:'AI / AUTONOMOUS MOBILITY',problem:'실제 차량에서 반복하기 어려운 조향과 주차 신호 인식을 가상환경에서 먼저 검토했습니다.',design:'AirSim 주행 환경에서 딥러닝을 학습시키고, 조향과 주차 신호 인식 기능을 연결했습니다.',verification:'미래자동차 경진대회 조향 및 주차 신호인식 부문 장려상으로 이어진 프로젝트입니다.',evidence:'시뮬레이션 · 경진대회 기록'},
    {id:'project-upcycle-jbmotors',field:'PRODUCT / FIELD VALIDATION',problem:'사용이 끝난 키보드의 부품을 버리는 대신, 다시 쓸 수 있는 제품으로 만들고자 했습니다.',design:'키캡과 스위치를 선별·가공하고, 전북현대모터스FC 팬들이 소장하는 키링으로 제작했습니다.',verification:'Notion 기록에 따르면 2026년 4월 Green Cycle 팝업에서 판매 시작 1시간 만에 준비 수량이 완판됐습니다.',evidence:'브랜드 협업 · 현장 판매 기록'}
  ];
  return `${pageHeading('04 / DEVELOPER LAB','Inside<br>the build<span class="accent">.</span>','문제를 정의하고, 구조를 설계하고, 실제 결과로 확인합니다. 프로젝트마다 다른 선택과 검증의 과정을 기록했습니다.')}<section class="lab-intro"><span class="eyebrow">THINK → BUILD → VERIFY</span><p>어떤 기술을 썼는지보다,<br>왜 그 선택을 했는지.</p><a class="underlined-link" href="works/">All projects ↗</a></section><section class="lab-cases" aria-label="개발 과정 사례">${cases.map((study,index)=>{const item=projects.find(item=>item.id===study.id);return `<details class="lab-case" name="lab-cases" ${index===0?'open':''}><summary><span class="lab-number">${number(index+1)}</span><span class="lab-case-title"><small>${e(study.field)}</small><strong>${e(item.title)}</strong></span><span class="lab-toggle" aria-hidden="true">＋</span></summary><div class="lab-case-content"><a class="lab-image" href="${itemPath(item)}" aria-label="${e(item.title)} 상세 보기">${visual(item)}<span>PROJECT DOSSIER ↗</span></a><div class="lab-process">${[['01 / DEFINE','문제 정의',study.problem],['02 / DESIGN','설계와 구현',study.design],['03 / VERIFY','검증과 결과',study.verification]].map(([step,title,text])=>`<section><span>${step}</span><h2>${title}</h2><p>${e(text)}</p></section>`).join('')}<a class="lab-evidence" href="${itemPath(item)}"><span>${e(study.evidence)}</span><b>프로젝트 기록 보기 ↗</b></a></div></div></details>`;}).join('')}</section><a class="lab-closing" href="./#contact"><span class="eyebrow">THE NEXT PROBLEM</span><h2>다음 문제도,<br>함께 풀어갑니다<span class="accent">.</span></h2><span>Let's connect ↗</span></a>`;
}

export function resolvePage(path, search=new URLSearchParams()) {
  const route=path.replace(/^\/+|\/+$/g,'');
  if (!route) return {kind:'home',title:`${content.name} — Developer & Maker`,html:''};
  if (route==='works') return {kind:'works',title:'Works',html:worksPage(search)};
  if (route==='news') return {kind:'news',title:'News & Recognition',html:newsPage()};
  if (route==='about') return {kind:'about',title:'About',html:aboutPage()};
  if (route==='activities') return {kind:'activities',title:'Activities & Experience',html:activitiesPage()};
  if (route==='motion') return {kind:'lab',title:'Developer Lab',html:motionPage()};
  const match=route.match(/^(works|records)\/([a-z0-9-]+)$/);
  const item=match&&records.find(item=>item.id===match[2]&&(match[1]==='works'?item.type==='project':item.type==='award'));
  if (item) return {kind:'detail',title:item.title,item,html:detailPage(item)};
  return {kind:'not-found',title:'Page not found',html:`${pageHeading('404 / LOST IN SPACE','Nothing here<span class="accent">.</span>','요청한 페이지를 찾을 수 없습니다.')}<div class="back-to-archive"><a class="pill" href="works/">프로젝트 둘러보기 ↗</a></div>`};
}

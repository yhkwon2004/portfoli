import { content, projects, awards, press, featured, cover, itemPath, filterProjects } from './content.js?v=20261003-honors';
import { createScene } from './scene.js?v=20261003-honors';
import { createHomeMotion } from './home-motion.js?v=20261003-honors';
import { animatePageTransition } from './page-transition.js';
import { institutions } from './media.js?v=20261003-honors';
import { resolvePage, projectCard, pressCard, photoSource, emptyResults, escapeHTML, externalLinks, visual } from './pages.js?v=20261003-honors';

const $ = selector => document.querySelector(selector);
const text = (selector, value) => { $(selector).textContent = value; };
const root = new URL('.', import.meta.url);
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const e = escapeHTML;
const home = $('#home-page'), view = $('#page-view'), loader = $('#page-loader');
let currentPage, scene, navigation = 0, activeWork = -1, framePending = false;
let routeAnimations=[];
const scrollPositions=new Map();
let entryKey=history.state?.entryKey||crypto.randomUUID();
history.replaceState({...history.state,entryKey},'',location.href);
history.scrollRestoration = 'manual';
function lines(selector, values) {
  $(selector).replaceChildren(...values.flatMap((value,index)=>index?[document.createElement('br'),document.createTextNode(value)]:[document.createTextNode(value)]));
}
text('.brand',content.wordmark); text('#hero-title',content.wordmark); text('.footer-wordmark',content.wordmark);
text('#hero-role',content.role); text('#about-name',content.name); text('#footer-name',content.name);
text('#footer-role',content.role); text('#copyright-name',content.name); text('#location',content.location);
text('#year',new Date().getFullYear());
lines('#intro-copy',content.intro); lines('#about-title',content.about.heading);
text('#about-english',content.about.english); text('#about-description',content.about.description);
const caseStudies=[
 {id:'project-iot-ring',problem:'수액 상태를 확인하는 의료진의 반복 업무',solution:'탈부착 구조와 회로를 설계해 기존 폴대에 연결',proof:'시제품 제작 · 캡스톤디자인 대상'},
 {id:'project-factline',problem:'흩어진 기록 속에서 사실관계를 찾기 어려운 상황',solution:'LLM으로 기록과 증거를 구조화',proof:'기록·증거 정리 서비스 구현'},
 {id:'project-upcycle-jbmotors',problem:'버려지는 키보드와 지속 가능한 구단 굿즈',solution:'폐키캡을 팬들이 쓰는 키링으로 제작',proof:'구단 입점 · 판매 시작 1시간 만에 완판'}
];
$('#quote-stage').innerHTML=content.quotes.map((quote,index)=>{
 const story=caseStudies[index],project=projects.find(item=>item.id===story.id);
 return `<div class="quote-frame" aria-hidden="${index!==0}"><div class="quote-thought"><span class="eyebrow">PROBLEM INTO POSSIBILITY / 0${index+1}</span><p class="quote-line" aria-label="${e(quote.line.replaceAll('|',' '))}">${quote.line.split('|').map(line=>line.split(' ').map(word=>`<span class="quote-mask" aria-hidden="true"><span class="quote-word">${e(word)}</span></span>`).join(' ')).join('<br> ')}</p><p class="quote-note">${e(quote.note)}</p></div><a class="quote-case" href="${itemPath(project)}">${visual(project)}<div><span class="eyebrow">0${index+1} / ${e(project.title)}</span><ol><li><span>DEFINE</span>${e(story.problem)}</li><li><span>BUILD</span>${e(story.solution)}</li><li><span>PROVE</span>${e(story.proof)}</li></ol><span class="case-link">과정 자세히 보기 ↗</span></div></a></div>`;
}).join('');
$('.quote-controls').innerHTML=content.quotes.map((quote,index)=>`<button data-quote="${index}" aria-label="문장 ${index+1}" aria-pressed="${index===0}"><span></span></button>`).join('');
$('.mission-memory').innerHTML=featured.map((item,index)=>`<img src="${e(cover(item).thumb)}" alt="" style="--memory-delay:${index*1.8}s" loading="lazy">`).join('');
$('.memory-toggle').addEventListener('click',event=>{const paused=event.currentTarget.getAttribute('aria-pressed')!=='true';event.currentTarget.setAttribute('aria-pressed',String(paused));event.currentTarget.textContent=paused?'PROJECT MEMORIES ▷':'PROJECT MEMORIES Ⅱ';$('.chapter-sticky').classList.toggle('memory-paused',paused);});
const logoHTML=item=>`<a href="${e(item.url)}" target="_blank" rel="noopener noreferrer" class="institution-logo ${['AWS','전남대학교','캠틱종합기술원'].includes(item.name)?'logo-dark':''}"><img src="${e(item.logo)}" alt="${e(item.name)}" loading="lazy"><span>${e(item.name)}</span></a>`;
$('#institution-logos').innerHTML=[0,1].map(row=>{const logos=institutions.filter((_,index)=>index%2===row).map(logoHTML).join('');return `<div class="institution-logos"><div class="logo-group">${logos}</div><div class="logo-group" aria-hidden="true" inert>${logos}</div></div>`;}).join('');
$('.logo-pause').addEventListener('click',event=>{const paused=event.currentTarget.getAttribute('aria-pressed')!=='true';event.currentTarget.setAttribute('aria-pressed',String(paused));$('.institution-marquee').classList.toggle('is-paused',paused);event.currentTarget.textContent=paused?'로고 움직임 재생 ▷':'로고 움직임 멈추기 Ⅱ';});
$('#email-link').href=`mailto:${content.email}`;
$('#email-link').innerHTML=`${e(content.email)} <span>↗</span>`;
$('#contact-socials').innerHTML=externalLinks(content.links);
$('#home-stats').innerHTML=`<a href="works/"><b>${projects.length}</b><span>PROJECTS</span></a><a href="news/"><b>${awards.length}</b><span>AWARDS</span></a>`;
$('#news-list').innerHTML=content.news.map(item=>`<a href="${item.target}"><time>${e(item.date)}</time><p>${e(item.title)}</p></a>`).join('');
if($('#home-press'))$('#home-press').innerHTML=['huss-ai-2026','capstone-2025','innovation-league-2025'].map(id=>press.find(article=>article.id===id)).map(pressCard).join('');
$('#work-track').innerHTML=featured.map((item,index)=>`<a class="work-card" href="${itemPath(item)}" aria-label="${e(item.title)} 프로젝트 자세히 보기">${visual(item,{eager:true})}<span class="card-label">${String(index+1).padStart(2,'0')} / ${e(item.category.toUpperCase())}</span><span class="card-open" aria-hidden="true">↗</span></a>`).join('');
$('.work-scrubber').innerHTML=featured.map((item,index)=>`<button type="button" data-work-index="${index}" aria-label="${index+1}. ${e(item.title)}" aria-pressed="false"><span></span></button>`).join('');
const recognition=['award-driveup','award-jeonju-startup-2025','award-gangneung'].map(id=>awards.find(item=>item.id===id));
const awardPlaces=['대상.','최우수상.','대상.'],awardNames=['GOVERNOR','SME OFFICE','MAYOR'],awardProjects=['project-upcycle-jbmotors','project-coffee-box',null];
const awardIssuers=['전북특별자치도지사상','전북지방중소벤처기업청장상','강릉시장상'];
$('#practice-grid').innerHTML=recognition.map((item,index)=>`<button class="practice-tab" id="practice-tab-${index}" type="button" role="tab" aria-controls="practice-card-${index}" aria-selected="${index===0}" tabindex="${index===0?0:-1}" data-practice="${index}"><span>0${index+1}</span><strong>${awardNames[index]}</strong></button>`).join('');
$('#practice-panel').innerHTML=recognition.map((item,index)=>{
 const project=projects.find(project=>project.id===awardProjects[index]),institution=institutions.find(logo=>logo.name===(index===0?'전북현대모터스FC':'원광대학교'));
 return `<article class="practice-card" id="practice-card-${index}" data-award-id="${e(item.id)}" role="tabpanel" aria-labelledby="practice-tab-${index}" aria-hidden="${index!==0}"><div class="practice-card-header"><a class="practice-partner ${index===0?'is-crest':''}" href="${e(institution.url)}" target="_blank" rel="noopener noreferrer"><img src="${e(institution.logo)}" alt="${e(institution.name)}"><span>RECOGNITION / ${e(item.year.slice(0,4))}</span></a><span>0${index+1} — 03</span></div><a class="practice-object" href="${itemPath(item)}" aria-label="${e(item.title)} 원본 상장과 수상 기록">${visual(item,{full:true})}<span class="award-media-label">ORIGINAL CERTIFICATE / 0${index+1}</span><span class="practice-object-open" aria-hidden="true">↗</span></a><div class="practice-copy"><span class="eyebrow">${e(item.year)} / SELECTED RECOGNITION</span><p class="award-issuer">${awardIssuers[index]}</p><h3>${awardPlaces[index]}</h3><h4>${e(item.title)}</h4><p>${e(item.summary)}</p><div class="tags">${item.tags.map(tag=>`<span>${e(tag)}</span>`).join('')}</div><a class="practice-result" href="${itemPath(item)}"><span>AWARD RECORD</span>원본 상장과 수상 기록 보기 ↗</a><a class="practice-proof" href="${project?itemPath(project):'news/'}"><span><small>${project?'THE PROJECT BEHIND THE AWARD':'THE COMPLETE RECOGNITION ARCHIVE'}</small><strong>${project?e(project.title):`${awards.length}개 수상 기록 모두 보기`}</strong></span><b aria-hidden="true">↗</b></a></div></article>`;
}).join('');
function selectPractice(index){
 document.querySelectorAll('[data-practice]').forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
 document.querySelectorAll('.practice-card').forEach((card,i)=>{card.setAttribute('aria-hidden',String(i!==index));card.inert=i!==index;});
 text('#practice-count',`0${index+1} / 03`);$('#previous-practice').disabled=index===0;$('#next-practice').disabled=index===recognition.length-1;
}
selectPractice(0);
$('#previous-practice').addEventListener('click',()=>homeMotion.goToPractice(Number($('.practice-tab[aria-selected="true"]').dataset.practice)-1));
$('#next-practice').addEventListener('click',()=>homeMotion.goToPractice(Number($('.practice-tab[aria-selected="true"]').dataset.practice)+1));
$('#practice-grid').addEventListener('click',event=>{const button=event.target.closest('[data-practice]');if(button)homeMotion.goToPractice(Number(button.dataset.practice));});
$('#practice-grid').addEventListener('keydown',event=>{if(!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const i=Number(event.target.dataset.practice),next=event.key==='Home'?0:event.key==='End'?2:(i+(['ArrowDown','ArrowRight'].includes(event.key)?1:2))%3;homeMotion.goToPractice(next);document.querySelectorAll('[data-practice]')[next].focus();});
$('.section-rail [data-section="about"]').href='./#about';
$('.footer-nav a').href='works/';
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
const observeReveals=()=>{
  observer.disconnect();
  document.querySelectorAll('.project-card,.detail-copy section,.gallery-item,.profile-row,.press-card,.field-photo,.activity-entry,.related-card').forEach(element=>element.classList.add('reveal'));
  document.querySelectorAll('.reveal:not(.visible)').forEach(element=>reducedMotion?element.classList.add('visible'):observer.observe(element));
};
observeReveals();

// Every navigation gets a token so slow image loads cannot replace a newer page.
function preload(src) {
  return new Promise(resolve=>{
    const img=new Image();
    const timeout=setTimeout(finish,7000);
    function finish(){clearTimeout(timeout);img.onload=img.onerror=null;resolve();}
    img.onload=()=>{img.decode().catch(()=>{}).finally(finish);}; img.onerror=finish; img.src=src;
  });
}
function showLoader(label, initial=false, image) {
  text('#loader-label',label); text('#loader-status',initial?'LOADING EXPERIENCE':'LOADING PAGE');
  text('#loader-percent','00%'); $('.loader-progress i').style.transform='scaleX(0)';
  const preview=$('.loader-preview');preview.hidden=!image;
  if(image)preview.querySelector('img').src=image.thumb;else preview.querySelector('img').removeAttribute('src');
  loader.classList.add('active'); loader.hidden=false; document.body.classList.add('is-loading');
  home.setAttribute('aria-busy','true'); view.setAttribute('aria-busy','true');
}
async function loadPageAssets(page, token, initial) {
  const image=page.item&&cover(page.item);
  const urls=page.kind==='home'?featured.map(item=>cover(item)?.thumb).filter(Boolean):image?[image.src]:[];
  const jobs=urls.map(preload);
  if(initial) jobs.push(Promise.race([sceneReady,new Promise(resolve=>setTimeout(resolve,8000))]));
  let loaded=0;
  await Promise.all(jobs.map(async job=>{await job;if(token===navigation){const progress=++loaded/jobs.length;text('#loader-percent',`${Math.round(progress*100)}%`);$('.loader-progress i').style.transform=`scaleX(${progress})`;}}));
}
function pathOf(url) {return decodeURIComponent(url.pathname.slice(root.pathname.length));}
function saveScroll(){scrollPositions.set(entryKey,scrollY);history.replaceState({...history.state,entryKey,scroll:scrollY},'',location.href);}
async function navigate(url,{pop=false,initial=false}={}) {
  homeMotion.stop();
  const token=++navigation;
  routeAnimations.forEach(animation=>animation.cancel());routeAnimations=[];
  loader.classList.toggle('route-transition',!initial);
  const next=resolvePage(pathOf(url),url.searchParams);
  if(pop){scrollPositions.set(entryKey,scrollY);entryKey=history.state?.entryKey||crypto.randomUUID();}
  const saved=pop?(scrollPositions.get(entryKey)??history.state?.scroll??0):0;
  if(!initial&&!pop){saveScroll();entryKey=crypto.randomUUID();history.pushState({entryKey,scroll:0},'',url);}
  showLoader(next.item?.title||next.title,initial,next.item&&cover(next.item));
  if(!initial)routeAnimations=animatePageTransition(loader,currentPage?.kind==='home'?home:view,true,reducedMotion);
  await Promise.all([loadPageAssets(next,token,initial),...(initial?loader.getAnimations():routeAnimations).map(animation=>animation.finished.catch(()=>{}))]);
  if(token!==navigation)return;
  if(lightbox.open)lightbox.close(); closeMenu();
  currentPage=next;
  const isHome=next.kind==='home';
  home.hidden=!isHome; view.hidden=isHome;
  view.innerHTML=next.html;
  document.body.dataset.page=next.kind;
  $('.section-rail').hidden=!isHome;
  document.title=isHome?next.title:`${next.title} — ${content.name}`;
  document.querySelector('meta[name="description"]').content=next.item?.summary||'권용현의 자율주행, IoT, AI, 웹 개발, 업사이클링 프로젝트와 수상 기록.';
  document.querySelectorAll('.desktop-nav a').forEach(link=>{
    const active=next.kind==='detail'?link.getAttribute('href')===(next.item.type==='project'?'works/':'news/'):link.getAttribute('href')===`${next.kind==='lab'?'motion':next.kind}/`;
    if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
  scene?.setView(next.kind);
  scrollTo({top:saved,behavior:'instant'});
  if(url.hash&&!pop){try{document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView({behavior:'instant'});}catch{}}
  text('#loader-percent','100%'); $('.loader-progress i').style.transform='scaleX(1)';
  routeAnimations.forEach(animation=>animation.cancel());
  if(!initial)routeAnimations=animatePageTransition(loader,isHome?home:view,false,reducedMotion);
  document.body.classList.remove('booting');
  document.body.classList.add('has-entered');
  observeReveals(); updatePage();
  await Promise.all(routeAnimations.map(animation=>animation.finished.catch(()=>{})));
  if(token!==navigation)return;
  loader.classList.remove('active');document.body.classList.remove('is-loading');
  routeAnimations.forEach(animation=>animation.cancel());routeAnimations=[];
  home.removeAttribute('aria-busy');view.removeAttribute('aria-busy');
  if(!initial){(isHome?$('#hero-title'):view).setAttribute('tabindex','-1');(isHome?$('#hero-title'):view).focus({preventScroll:true});}
}
addEventListener('popstate',()=>navigate(new URL(location.href),{pop:true}));
document.addEventListener('click',event=>{
  const anchor=event.target.closest('a[href]');
  if(!anchor||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||anchor.target||anchor.hasAttribute('download'))return;
  const url=new URL(anchor.href);
  if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname))return;
  event.preventDefault();
  if(url.pathname===location.pathname&&url.search===location.search&&url.hash){
    homeMotion.stop();
    closeMenu(); saveScroll(); entryKey=crypto.randomUUID();history.pushState({entryKey,scroll:scrollY},'',url);
    document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView({behavior:reducedMotion?'instant':'smooth'}); return;
  }
  navigate(url);
});

const homeMotion=createHomeMotion({onPractice:selectPractice,onWork(index){
 activeWork=index;const item=featured[index];
 text('#active-work-title',item.title);$('#active-work-subtitle').innerHTML=item.tags.map(tag=>`<span>${e(tag)}</span>`).join('');text('#active-work-type',`${item.year} / ${item.category.toUpperCase()}`);$('#active-work-title').href=itemPath(item);
 document.querySelectorAll('[data-work-index]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
 const atmosphere=$('.work-atmosphere img'),image=cover(item);atmosphere.hidden=!image;if(image)atmosphere.src=image.thumb;
 text('#work-index',`${String(index+1).padStart(2,'0')} / ${String(featured.length).padStart(2,'0')}`);text('.work-count',`${String(index+1).padStart(2,'0')} — ${String(featured.length).padStart(2,'0')}`);
 $('#previous-work').disabled=index===0;$('#next-work').disabled=index===featured.length-1;
 if(!reducedMotion)$('.work-bottom>div').animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:450,easing:'ease-out'});
}});
function updatePage(){
 framePending=false;$('.header').classList.toggle('scrolled',scrollY>30);$('.reading-progress').style.transform=`scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`;
 if(currentPage?.kind==='detail'){const hero=$('.detail-hero');const top=hero.getBoundingClientRect().top;hero.style.setProperty('--hero-parallax',`${!reducedMotion&&innerWidth>650?clamp((innerHeight*.5-top-hero.offsetHeight*.5)*.055,-18,18):0}px`);}
 if(currentPage?.kind!=='home')return;homeMotion.update();
 let section='top';for(const id of ['top','works','about','vision','practice','journal','contact'])if(document.getElementById(id).getBoundingClientRect().top<=innerHeight*.5)section=id;
 document.querySelectorAll('.section-rail a').forEach(link=>{const active=link.dataset.section===section;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
}
function scheduleUpdate(){if(!framePending){framePending=true;requestAnimationFrame(updatePage);}}
addEventListener('scroll',scheduleUpdate,{passive:true});addEventListener('resize',scheduleUpdate);

const menu=$('#mobile-menu'),menuButton=$('.menu-toggle');
function setMenu(open){
  menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
  document.body.style.overflow=open?'hidden':'';
  document.querySelectorAll('main,footer,.section-rail').forEach(element=>{element.inert=open;});
}
const closeMenu=()=>setMenu(false);
menuButton.addEventListener('click',()=>setMenu(menu.hidden));
addEventListener('resize',()=>{if(innerWidth>650&&!menu.hidden)closeMenu();});

const lightbox=$('#lightbox');let lightboxIndex=0,lightboxTrigger;
const lightboxRail=document.createElement('div');lightboxRail.className='lightbox-thumbnails';lightboxRail.setAttribute('role','group');lightboxRail.setAttribute('aria-label','프로젝트 사진 선택');lightbox.append(lightboxRail);
function updateLightbox(){
  const images=currentPage.item.images;lightboxIndex=(lightboxIndex+images.length)%images.length;
  const item=images[lightboxIndex],image=lightbox.querySelector('figure img');image.src=item.src;image.alt=item.alt;
  lightbox.querySelector('figcaption').innerHTML=`${e(item.alt)}${photoSource(item)}`;
  text('.lightbox-count',`${String(lightboxIndex+1).padStart(2,'0')} / ${String(images.length).padStart(2,'0')}`);
  $('.lightbox-prev').hidden=$('.lightbox-next').hidden=images.length<2;
  lightboxRail.hidden=images.length<2;
  const thumbnails=lightboxRail.querySelectorAll('[data-lightbox-index]');
  thumbnails.forEach((button,index)=>button.setAttribute('aria-current',String(index===lightboxIndex)));
  if(lightbox.open)thumbnails[lightboxIndex]?.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'nearest',inline:'center'});
}
function openLightbox(index,trigger){
  lightboxIndex=index;lightboxTrigger=trigger;
  lightboxRail.innerHTML=currentPage.item.images.map((image,index)=>`<button type="button" data-lightbox-index="${index}" aria-label="${index+1}. ${e(image.alt)}"><img src="${e(image.thumb)}" alt="" loading="lazy" decoding="async"></button>`).join('');
  lightbox.showModal();updateLightbox();document.body.style.overflow='hidden';
}
lightboxRail.addEventListener('click',event=>{const button=event.target.closest('[data-lightbox-index]');if(button){lightboxIndex=Number(button.dataset.lightboxIndex);updateLightbox();}});
$('.lightbox-close').addEventListener('click',()=>lightbox.close());
$('.lightbox-prev').addEventListener('click',()=>{lightboxIndex--;updateLightbox();});$('.lightbox-next').addEventListener('click',()=>{lightboxIndex++;updateLightbox();});
lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close();});
lightbox.addEventListener('close',()=>{document.body.style.overflow='';lightboxTrigger?.focus({preventScroll:true});});
document.addEventListener('keydown',event=>{
  if(lightbox.open&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();lightboxIndex+=event.key==='ArrowRight'?1:-1;updateLightbox();}
  if(menu.hidden)return;
  if(event.key==='Escape'){closeMenu();menuButton.focus();}
  if(event.key==='Tab'){
    const targets=[...document.querySelectorAll('.header a,.header button,#mobile-menu a')].filter(el=>el.getClientRects().length),first=targets[0],last=targets.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});

function updateFilters({reset=false}={}){
  const category=reset?'All':$('.category-tabs [aria-pressed="true"]').dataset.category;
  const form=$('.archive-search'),query=reset?'':form.elements.q.value,year=reset?'All':form.elements.year.value;
  if(reset){form.reset();form.elements.q.value='';form.elements.year.value='All';document.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category==='All')));}
  const results=filterProjects({category,query,year});
  $('#project-grid').innerHTML=results.map(projectCard).join('')||emptyResults();
  observeReveals();
  text('#result-count',`${String(results.length).padStart(2,'0')} PROJECTS`);
  $('.results-line [data-reset-filters]').hidden=category==='All'&&!query&&year==='All';
  const url=new URL(location.href);url.search='';if(category!=='All')url.searchParams.set('category',category);if(query)url.searchParams.set('q',query);if(year!=='All')url.searchParams.set('year',year);
  history.replaceState({...history.state,scroll:scrollY},'',url);
}
view.addEventListener('submit',event=>{if(event.target.matches('.archive-search')){event.preventDefault();updateFilters();}});
view.addEventListener('input',event=>{if(event.target.name==='q')updateFilters();});
view.addEventListener('change',event=>{if(event.target.name==='year')updateFilters();});
motionPreference.addEventListener('change',event=>{
  reducedMotion=event.matches;homeMotion.stop();
  observeReveals();scheduleUpdate();
});
view.addEventListener('click',async event=>{
  const target=event.target.closest('button');if(!target)return;
  if(target.hasAttribute('data-related-step')){const rail=target.closest('.related-projects').querySelector('.related-rail');rail.scrollBy({left:Number(target.dataset.relatedStep)*(rail.querySelector('.related-card').getBoundingClientRect().width+parseFloat(getComputedStyle(rail).gap)),behavior:reducedMotion?'instant':'smooth'});}
  if(target.dataset.category){document.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button===target)));updateFilters();}
  if(target.hasAttribute('data-reset-filters'))updateFilters({reset:true});
  if(target.dataset.image!==undefined&&currentPage.item)openLightbox(Number(target.dataset.image),target);
  if(target.dataset.video){
    const frame=document.createElement('iframe');frame.src=`https://www.youtube-nocookie.com/embed/${target.dataset.video}?autoplay=1&rel=0`;frame.title=target.dataset.videoTitle;frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';target.parentElement.replaceChildren(frame);
  }
  if(target.hasAttribute('data-share')){
    try{await navigator.clipboard.writeText(location.href);target.textContent='Link copied ✓';text('#announcement','프로젝트 링크를 복사했습니다.');}catch{target.textContent='주소 표시줄에서 링크를 복사해 주세요.';}
  }
});
// Broken media leaves a usable retry control, including when a static host is temporarily unavailable.
document.addEventListener('error',event=>{
  if(!(event.target instanceof HTMLImageElement)||event.target.dataset.failed)return;
  const image=event.target;image.dataset.failed='true';image.classList.add('image-failed');
  const retry=document.createElement('button');retry.type='button';retry.className='media-retry';retry.textContent='이미지를 불러오지 못했습니다. 다시 시도 ↺';
  const parent=image.closest('a,button')||image;parent.insertAdjacentElement('afterend',retry);
  retry.addEventListener('click',()=>{delete image.dataset.failed;image.classList.remove('image-failed');const src=image.src;image.removeAttribute('src');image.src=src;retry.remove();});
},true);

let audioContext,audioGain,soundEnabled=false;
async function setSound(enabled){
  try{
    if(enabled&&!audioContext){audioContext=new(window.AudioContext||window.webkitAudioContext)();audioGain=audioContext.createGain();audioGain.gain.value=0;audioGain.connect(audioContext.destination);for(const frequency of [130.81,196,261.63]){const oscillator=audioContext.createOscillator();oscillator.type='sine';oscillator.frequency.value=frequency;const gain=audioContext.createGain();gain.gain.value=.09;oscillator.connect(gain).connect(audioGain);oscillator.start();}}
    if(enabled)await audioContext.resume();if(audioGain)audioGain.gain.setTargetAtTime(enabled ? .12 : 0,audioContext.currentTime,.4);
    soundEnabled=enabled;$('.sound-toggle').setAttribute('aria-pressed',String(enabled));$('.sound-toggle').setAttribute('aria-label',enabled?'사운드 끄기':'사운드 켜기');
  }catch{text('#announcement','이 브라우저에서는 사운드를 재생할 수 없습니다.');}
}
$('.sound-toggle').addEventListener('click',()=>setSound(!soundEnabled));
document.addEventListener('visibilitychange',()=>{if(audioGain)audioGain.gain.setTargetAtTime(!document.hidden&&soundEnabled ? .12 : 0,audioContext.currentTime,.2);});
const sceneReady=createScene($('#scene'),content.wordmark).then(result=>{scene=result;scene.setView(currentPage?.kind||resolvePage(pathOf(new URL(location.href))).kind);}).catch(error=>{console.warn('3D unavailable; using static background.',error);$('#scene').hidden=true;document.body.classList.remove('scene-ready');});
navigate(new URL(location.href),{initial:true});

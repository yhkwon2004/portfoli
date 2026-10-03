import { content, projects, awards, press, featured, cover, itemPath, filterProjects, youtubeId } from './content.js?v=20261003-archive';
import { createScene } from './scene.js?v=20261003-archive';
import { createHomeMotion } from './home-motion.js?v=20261003-archive';
import { animatePageTransition } from './page-transition.js';
import { institutions } from './media.js?v=20261003-archive';
import { resolvePage, projectCard, pressCard, photoSource, emptyResults, escapeHTML, externalLinks, visual } from './pages.js?v=20261003-archive';

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
$('#quote-stage').innerHTML=content.quotes.map((quote,index)=>{
 return `<div class="quote-frame" aria-hidden="${index!==0}"><div class="quote-thought"><span class="eyebrow">PROBLEM INTO POSSIBILITY / 0${index+1}</span><p class="quote-line" aria-label="${e(quote.line.replaceAll('|',' '))}">${quote.line.split('|').map(line=>line.split(' ').map(word=>`<span class="quote-mask" aria-hidden="true"><span class="quote-word">${e(word)}</span></span>`).join(' ')).join('<br> ')}</p><p class="quote-note">${e(quote.note)}</p></div></div>`;
}).join('');
$('.quote-controls').innerHTML=content.quotes.map((quote,index)=>`<button data-quote="${index}" aria-label="문장 ${index+1}" aria-pressed="${index===0}"><span></span></button>`).join('');
$('.mission-memory').style.setProperty('--memory-duration',`${featured.length*1.8}s`);
$('.mission-memory').innerHTML=featured.map((item,index)=>`<img src="${e(cover(item).src)}" alt="" style="--memory-delay:${index*1.8}s" loading="lazy">`).join('');
$('.memory-toggle').addEventListener('click',event=>{const paused=event.currentTarget.getAttribute('aria-pressed')!=='true';event.currentTarget.setAttribute('aria-pressed',String(paused));event.currentTarget.textContent=paused?'PROJECT MEMORIES ▷':'PROJECT MEMORIES Ⅱ';home.classList.toggle('memory-paused',paused);});
const logoHTML=item=>`<a href="${e(item.url)}" target="_blank" rel="noopener noreferrer" class="institution-logo ${item.tone==='light'||['AWS','전남대학교','캠틱종합기술원'].includes(item.name)?'logo-dark':''}">${item.logo?`<img src="${e(item.logo)}" alt="${e(item.name)}" loading="lazy">`:`<div class="institution-wordmark" aria-hidden="true"><b>${e(item.wordmark)}</b><small>${e(item.caption)}</small></div>`}<span>${e(item.name)}</span></a>`;
$('#institution-logos').innerHTML=[0,1].map(row=>{const logos=institutions.filter((_,index)=>index%2===row).map(logoHTML).join('');return `<div class="institution-logos"><div class="logo-group">${logos}</div><div class="logo-group" aria-hidden="true" inert>${logos}</div></div>`;}).join('');
$('#email-link').href=`mailto:${content.email}`;
$('#email-link').innerHTML=`${e(content.email)} <span>↗</span>`;
$('#contact-socials').innerHTML=externalLinks(content.links);
const socialIcons=[
 '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none"/>',
 '<path fill="currentColor" stroke="none" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
 '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17V7l8 10V7" stroke-width="2"/>',
 '<path d="M5 3h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8l-6 3v-3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M9 7h4a2 2 0 0 1 0 4H9V7Zm0 4h4a2 2 0 0 1 0 4H9v-4Z"/>'
];
$('#contact-socials').querySelectorAll('a').forEach((link,index)=>{
 const label=content.links[index].label;
 link.setAttribute('aria-label',`${label} 새 창에서 열기`);
 link.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${socialIcons[index]}</svg><span class="social-name">${e(label)}</span>`;
});
$('#home-stats').innerHTML=`<a href="works/"><b>${projects.length}</b><span>PROJECTS</span></a><a href="news/"><b>${awards.length}</b><span>AWARDS</span></a>`;
$('#news-list').innerHTML=content.news.map(item=>`<a href="${item.target}"><time>${e(item.date)}</time><p>${e(item.title)}</p></a>`).join('');
if($('#home-press'))$('#home-press').innerHTML=['huss-ai-2026','capstone-2025','innovation-league-2025'].map(id=>press.find(article=>article.id===id)).map(pressCard).join('');
$('#work-track').innerHTML=featured.map((item,index)=>`<a class="work-card" ${item.id==='project-autonomous'?`data-preview-video="${youtubeId(item.videos[0].url)}" data-video-title="${e(item.videos[0].title)}"`:""} href="${itemPath(item)}" aria-label="${e(item.title)} 프로젝트 자세히 보기">${visual(item,{eager:true})}${item.id==='project-autonomous'?'<span class="work-video-label">▶ AIRSIM / AUTONOMOUS DRIVING</span>':''}<span class="card-label">${String(index+1).padStart(2,'0')} / ${e(item.category.toUpperCase())}</span><span class="card-open" aria-hidden="true">↗</span></a>`).join('');
$('.work-scrubber').innerHTML=featured.map((item,index)=>`<button type="button" data-work-index="${index}" aria-label="${index+1}. ${e(item.title)}" aria-pressed="false"><span></span></button>`).join('');
const recognition=['award-driveup','award-jeonju-startup-2025','award-gangneung'].map(id=>awards.find(item=>item.id===id));
const awardIssuers=['전북특별자치도지사상','전북지방중소벤처기업청장상','강릉시장상'];
const awardNames=['Drive-UP 창업캠프','전주 청년 창업경진대회','근거기반 지역문제 해결 캠프'];
text('#recognition-total',String(awards.length).padStart(2,'0'));
$('#recognition-selected').innerHTML=recognition.map((item,index)=>`<a class="recognition-feature" data-award-id="${e(item.id)}" href="${itemPath(item)}"><div class="recognition-paper">${visual(item,{full:true})}</div><div class="recognition-caption"><span>0${index+1} / ${e(awardIssuers[index])}</span><h3>${index===1?'최우수상':'대상'}<b aria-hidden="true">↗</b></h3><p>${e(awardNames[index])}</p></div></a>`).join('');
const awardHistory=[...awards].sort((a,b)=>b.year.localeCompare(a.year));
const awardEvidence=item=>item.images.some(image=>image.role==='certificate')?'원본 상장':item.images.length?'수상 현장 사진':'수상 기록';
$('#recognition-wall').innerHTML=awardHistory.filter(item=>cover(item)).map(item=>`<img src="${e(cover(item).thumb)}" alt="" loading="lazy">`).join('');
$('#recognition-flight').innerHTML=awardHistory.map((item,index)=>`<div class="award-flight" data-award-id="${e(item.id)}"><div class="award-flight-paper">${visual(item)}</div><p>${e(item.year)} / ${e(item.title)}</p></div>`).join('');
$('#award-years').innerHTML=[...new Set(awardHistory.map(item=>item.year.slice(0,4)))].map((year,index)=>{
 const entries=awardHistory.filter(item=>item.year.startsWith(year));
 return `<details class="award-year" ${index===0?'open':''}><summary><span>${e(year)}</span><span>${String(entries.length).padStart(2,'0')} RECORDS <b aria-hidden="true">＋</b></span></summary><div class="award-records">${entries.map(item=>`<a class="award-record" data-award-id="${e(item.id)}" href="${itemPath(item)}"><div class="award-record-image">${visual(item)}</div><div><span class="eyebrow">${e(item.year)} / ${awardEvidence(item)}</span><h3>${e(item.title)}</h3><p>${e(item.summary)}</p><span class="award-record-more">수상 기록 자세히 보기 ↗</span></div></a>`).join('')}</div></details>`;
}).join('');
$('.section-rail [data-section="about"]').href='./#about';
$('.footer-nav a').href='works/';
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
const observeReveals=()=>{
  observer.disconnect();
  document.querySelectorAll('.project-card,.detail-copy section,.gallery-item,.profile-row,.press-card,.field-photo,.activity-entry,.related-card,#about-title,.chapter-word,.practice-title,.journal-heading').forEach(element=>element.classList.add('reveal'));
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

const homeMotion=createHomeMotion({onWork(index){
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

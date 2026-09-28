export const clamp = (value, low=0, high=1) => Math.min(high, Math.max(low, value));
export function workPose(distance, width) {
  const angle=clamp(distance,-2.5,2.5)*.76;
  return {x:Math.sin(angle)*width*.91,y:distance*width*.038,z:(Math.cos(angle)-1)*width*.58,rotation:-angle*180/Math.PI*.66,opacity:1-clamp((Math.abs(distance)-1.1)/1.4),scale:1-clamp(Math.abs(distance))*.12};
}

// Native scroll remains the timeline; drag and keys seek it without trapping wheel or touch input.
export function createHomeMotion({onWork,onPractice}) {
  const home=document.querySelector('#home-page'),works=document.querySelector('#works');
  const cards=[...document.querySelectorAll('.work-card')],vision=document.querySelector('#vision'),contact=document.querySelector('#contact');
  const quotes=[...document.querySelectorAll('.quote-frame')],practice=document.querySelector('#practice'),preference=matchMedia('(prefers-reduced-motion: reduce)');
  const practiceCount=document.querySelectorAll('[data-practice]').length;
  let position=0,active=-1,activePractice=0,raf=0,lastTime=0,drag=null,clickBlockedUntil=0,snapTimer=0,seekFrame=0;
  const bounds=element=>({start:element.offsetTop,end:element.offsetTop+Math.max(1,element.offsetHeight-innerHeight)});
  const fraction=element=>{const b=bounds(element);return clamp((scrollY-b.start)/(b.end-b.start));};
  const visible=element=>{const b=element.getBoundingClientRect();return b.bottom>0&&b.top<innerHeight;};
  function seek(top,animate=true){
    cancelAnimationFrame(seekFrame);
    if(preference.matches||!animate){scrollTo({top,behavior:'instant'});return;}
    const from=scrollY,started=performance.now();
    const step=now=>{if(home.hidden){seekFrame=0;return;}const p=clamp((now-started)/760),e=1-Math.pow(1-p,4);scrollTo({top:from+(top-from)*e,behavior:'instant'});if(p<1)seekFrame=requestAnimationFrame(step);else seekFrame=0;};
    seekFrame=requestAnimationFrame(step);
  }
  function goToWork(index){const b=bounds(works);seek(b.start+clamp(index,0,cards.length-1)/(cards.length-1)*(b.end-b.start));}
  function goToQuote(index){const b=bounds(vision);seek(b.start+clamp(index,0,quotes.length-1)/(quotes.length-1)*(b.end-b.start));}
  function goToPractice(index){
    if(innerHeight<=650){activePractice=index;onPractice(index);return;}
    const b=bounds(practice);seek(b.start+clamp(index,0,practiceCount-1)/(practiceCount-1)*(b.end-b.start));
  }
  function render(now){
    raf=0;if(home.hidden)return;
    const target=fraction(works)*(cards.length-1),dt=Math.min((now-lastTime)||16,50);lastTime=now;
    position=preference.matches?target:position+(target-position)*(1-Math.exp(-dt/105));
    if(Math.abs(position-target)<.0002)position=target;
    const selected=Math.round(position),rect=works.getBoundingClientRect();
    works.style.setProperty('--work-progress',String(position/(cards.length-1)));
    works.style.setProperty('--work-entry',String(preference.matches?1:clamp(1-rect.top/innerHeight)));
    cards.forEach((card,index)=>{
      const d=index-position,p=workPose(d,innerWidth);
      card.style.transform=preference.matches?`translate3d(calc(-50% + ${d*innerWidth*.9}px),-50%,0)`:`translate3d(calc(-50% + ${p.x}px),calc(-50% + ${p.y}px),${p.z}px) rotateY(${p.rotation}deg) scale(${p.scale})`;
      card.style.opacity=String(p.opacity);card.style.zIndex=String(10-Math.round(Math.abs(d)*2));card.tabIndex=index===selected?0:-1;
      card.setAttribute('aria-hidden',String(Math.abs(d)>1.9));card.style.pointerEvents=Math.abs(d)>1.9?'none':'';
    });
    if(selected!==active){active=selected;onWork(active);}
    const q=fraction(vision)*(quotes.length-1),qIndex=Math.round(q);
    quotes.forEach((quote,index)=>{
      const d=index-q,show=index===qIndex;
      quote.setAttribute('aria-hidden',String(!show));quote.inert=!show;
      if(preference.matches){quote.style.opacity=show?'1':'0';quote.style.transform='none';}
      else {quote.style.opacity=String(1-clamp(Math.abs(d)*1.6));quote.style.transform=`translate3d(0,${d*52}px,${-Math.abs(d)*180}px) rotateX(${d*8}deg)`;}
      quote.querySelectorAll('.quote-word').forEach((word,i)=>{const lag=i*.014;word.style.opacity=String(clamp((1-Math.abs(d)*1.5-lag)*2));word.style.transform=preference.matches?'none':`translateY(${clamp(Math.abs(d)+lag,0,1)*25}px)`;});
    });
    document.querySelectorAll('[data-quote]').forEach((button,index)=>button.setAttribute('aria-pressed',String(index===qIndex)));
    document.querySelector('#quote-count').textContent=`0${qIndex+1} / 0${quotes.length}`;
    const about=document.querySelector('#about'),a=about.getBoundingClientRect(),ap=clamp(1-a.top/innerHeight);
    about.style.setProperty('--chapter-in',String(preference.matches?1:ap));
    const c=contact.getBoundingClientRect(),cp=clamp(1-c.top/innerHeight),hold=fraction(contact);
    contact.style.setProperty('--contact-in',String(preference.matches?1:cp));contact.style.setProperty('--contact-progress',String(hold));
    const servicePosition=fraction(practice)*(practiceCount-1),serviceIndex=Math.round(servicePosition);
    if(innerHeight>650&&visible(practice)&&serviceIndex!==activePractice){activePractice=serviceIndex;onPractice(activePractice);}
    practice.style.setProperty('--service-turn',String(preference.matches?0:servicePosition-activePractice));
    if(position!==target)raf=requestAnimationFrame(render);
  }
  function update(){if(!raf){lastTime=0;raf=requestAnimationFrame(render);}}
  function scheduleSnap(){
    clearTimeout(snapTimer);if(preference.matches||home.hidden||drag||seekFrame)return;
    snapTimer=setTimeout(()=>{const b=bounds(works);if(scrollY>b.start+12&&scrollY<b.end-12){const p=fraction(works)*(cards.length-1);if(Math.abs(p-Math.round(p))>.012)goToWork(Math.round(p));}},220);
  }
  addEventListener('scroll',()=>{update();scheduleSnap();},{passive:true});addEventListener('resize',update);
  addEventListener('wheel',()=>{cancelAnimationFrame(seekFrame);seekFrame=0;},{passive:true});
  addEventListener('keydown',event=>{
    if(home.hidden||!document.querySelector('#mobile-menu').hidden||document.querySelector('dialog[open]')||event.target.closest('input,textarea,select,[role="tab"]'))return;
    if(['ArrowLeft','ArrowRight'].includes(event.key)&&visible(works)&&Math.abs(works.getBoundingClientRect().top)<works.offsetHeight-innerHeight){event.preventDefault();goToWork(active+(event.key==='ArrowRight'?1:-1));}
  });
  for(const area of document.querySelectorAll('[data-drag-scene]')){
    area.addEventListener('dragstart',event=>event.preventDefault());
    area.addEventListener('pointerdown',event=>{
      if(!event.isPrimary||event.button!==0||event.target.closest('button,input,select'))return;
      if(area.closest('section')===practice&&innerHeight<=650)return;
      cancelAnimationFrame(seekFrame);seekFrame=0;clearTimeout(snapTimer);
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,scroll:scrollY,area,section:area.closest('section'),moved:false,touch:event.pointerType==='touch'};
    });
  }
  addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)<8)return;
    // Touch keeps native vertical scrolling; horizontal gestures seek the pinned scene.
    if(drag.touch&&!drag.moved&&Math.abs(dy)>Math.abs(dx)){drag=null;return;}
    drag.moved=true;drag.area.classList.add('is-dragging');
    if(!drag.area.hasPointerCapture(event.pointerId))drag.area.setPointerCapture(event.pointerId);
    const horizontal=Math.abs(dx)>=Math.abs(dy),delta=horizontal?-dx:-dy,b=bounds(drag.section);
    if(drag.section===practice&&innerHeight<=650)return;
    const steps=drag.section===works?cards.length-1:drag.section===vision?quotes.length-1:drag.section===practice?practiceCount-1:1;
    const travel=(b.end-b.start)/steps;
    scrollTo({top:clamp(drag.scroll+delta/Math.max(240,innerWidth*.48)*travel,b.start,b.end),behavior:'instant'});
  },{passive:true});
  function release(event){
    if(!drag||drag.id!==event.pointerId)return;
    const finished=drag;drag=null;finished.area.classList.remove('is-dragging');
    if(finished.area.hasPointerCapture(event.pointerId))finished.area.releasePointerCapture(event.pointerId);
    if(finished.moved){clickBlockedUntil=performance.now()+400;if(event.type!=='pointercancel'){if(finished.section===works)goToWork(Math.round(fraction(works)*(cards.length-1)));if(finished.section===vision)goToQuote(Math.round(fraction(vision)*(quotes.length-1)));if(finished.section===practice&&innerHeight>650)goToPractice(Math.round(fraction(practice)*(practiceCount-1)));}}
  }
  addEventListener('pointerup',release);addEventListener('pointercancel',release);
  home.addEventListener('click',event=>{if(performance.now()<clickBlockedUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
  document.querySelector('#previous-work').addEventListener('click',()=>goToWork(active-1));document.querySelector('#next-work').addEventListener('click',()=>goToWork(active+1));
  document.querySelector('.work-scrubber').addEventListener('click',event=>{const button=event.target.closest('[data-work-index]');if(button)goToWork(Number(button.dataset.workIndex));});
  document.querySelector('.quote-controls').addEventListener('click',event=>{const button=event.target.closest('[data-quote]');if(button)goToQuote(Number(button.dataset.quote));});
  preference.addEventListener('change',()=>{stop();update();});
  function stop(){cancelAnimationFrame(seekFrame);seekFrame=0;clearTimeout(snapTimer);if(drag)release({pointerId:drag.id,type:'pointercancel'});}
  return {update,goToWork,goToPractice,stop};
}

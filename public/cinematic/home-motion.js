export const clamp = (value, low=0, high=1) => Math.min(high, Math.max(low, value));
export function dragPosition(start, delta, width, count) {
  const anchor=Math.round(start);
  return clamp(anchor+clamp(start-anchor+delta/Math.max(240,width*.48),-1,1),0,count-1);
}
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
  const practiceCards=[...document.querySelectorAll('.practice-card')];
  let position=0,servicePosition=0,active=-1,activePractice=0,activeQuote=-1,manualPractice=0,raf=0,lastTime=0,drag=null,clickBlockedUntil=0,snapTimer=0,seekFrame=0;
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
    index=clamp(index,0,practiceCount-1);
    if(innerHeight<=800){manualPractice=index;update();return;}
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
      const show=innerHeight<=650||index===qIndex;
      quote.setAttribute('aria-hidden',String(!show));quote.inert=!show;
    });
    if(visible(vision)&&qIndex!==activeQuote){
      activeQuote=qIndex;
      quotes.forEach(quote=>quote.querySelectorAll('.quote-word').forEach(word=>word.getAnimations().forEach(animation=>animation.cancel())));
      if(!preference.matches&&innerHeight>650)quotes[qIndex].querySelectorAll('.quote-word').forEach((word,i)=>word.animate([{opacity:0,transform:'translateY(105%)',filter:'blur(5px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:850,delay:i*65,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'}));
    }
    document.querySelectorAll('[data-quote]').forEach((button,index)=>button.setAttribute('aria-pressed',String(index===qIndex)));
    document.querySelector('#quote-count').textContent=`0${qIndex+1} / 0${quotes.length}`;
    const about=document.querySelector('#about'),a=about.getBoundingClientRect(),ap=clamp(1-a.top/innerHeight);
    about.style.setProperty('--chapter-in',String(preference.matches?1:ap));
    const c=contact.getBoundingClientRect(),cp=clamp(1-c.top/innerHeight),hold=fraction(contact);
    contact.style.setProperty('--contact-in',String(preference.matches?1:cp));contact.style.setProperty('--contact-progress',String(hold));
    const serviceTarget=innerHeight<=800?manualPractice:fraction(practice)*(practiceCount-1);
    servicePosition=preference.matches?serviceTarget:servicePosition+(serviceTarget-servicePosition)*(1-Math.exp(-dt/95));
    if(Math.abs(servicePosition-serviceTarget)<.0002)servicePosition=serviceTarget;
    const serviceIndex=Math.round(servicePosition);
    if(serviceIndex!==activePractice){activePractice=serviceIndex;onPractice(activePractice);}
    practiceCards.forEach((card,index)=>{
      const d=index-servicePosition;
      card.style.transform=preference.matches?'none':`translate3d(${d*110}%,0,${-Math.abs(d)*70}px) rotateY(${clamp(d,-1,1)*-5}deg)`;
      card.style.opacity=preference.matches?(index===serviceIndex?'1':'0'):String(1-clamp(Math.abs(d)*.72));
      card.style.visibility=Math.abs(d)>1.15?'hidden':'visible';
    });
    if(position!==target||servicePosition!==serviceTarget)raf=requestAnimationFrame(render);
  }
  function update(){if(!raf){lastTime=0;raf=requestAnimationFrame(render);}}
  function scheduleSnap(){
    clearTimeout(snapTimer);if(preference.matches||home.hidden||drag||seekFrame)return;
    snapTimer=setTimeout(()=>{for(const [section,count,go] of [[works,cards.length,goToWork],[vision,quotes.length,goToQuote],[practice,practiceCount,goToPractice]]){const b=bounds(section);if((section===practice&&innerHeight<=800)||(section===vision&&innerHeight<=650))continue;if(scrollY>b.start+12&&scrollY<b.end-12){const p=fraction(section)*(count-1);if(Math.abs(p-Math.round(p))>.012)go(Math.round(p));break;}}},320);
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
      if((area.closest('section')===practice&&innerHeight<=800)||(area.closest('section')===vision&&innerHeight<=650))return;
      const section=area.closest('section'),rect=section.getBoundingClientRect();
      if(rect.top>1||rect.bottom<innerHeight-1)return;
      cancelAnimationFrame(seekFrame);seekFrame=0;clearTimeout(snapTimer);
      const count=section===works?cards.length:section===vision?quotes.length:section===practice?practiceCount:2;
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,start:fraction(section)*(count-1),count,delta:0,axis:null,area,section,moved:false,touch:event.pointerType==='touch'};
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
    drag.axis??=Math.abs(dx)>=Math.abs(dy)?'x':'y';
    drag.delta=drag.axis==='x'?-dx:-dy;
    const b=bounds(drag.section);
    if(drag.section===practice&&innerHeight<=800)return;
    const p=dragPosition(drag.start,drag.delta,innerWidth,drag.count);
    scrollTo({top:b.start+p/(drag.count-1)*(b.end-b.start),behavior:'instant'});
  },{passive:true});
  function release(event){
    if(!drag||drag.id!==event.pointerId)return;
    const finished=drag;drag=null;finished.area.classList.remove('is-dragging');
    if(finished.area.hasPointerCapture(event.pointerId))finished.area.releasePointerCapture(event.pointerId);
    if(finished.moved){
      clickBlockedUntil=performance.now()+400;
      if(event.type!=='pointercancel'){
        const next=clamp(Math.round(finished.start)+(Math.abs(finished.delta)>=Math.min(90,innerWidth*.15)?Math.sign(finished.delta):0),0,finished.count-1);
        const b=bounds(finished.section);seek(b.start+next/(finished.count-1)*(b.end-b.start));
      }
    }
  }
  addEventListener('pointerup',release);addEventListener('pointercancel',release);
  home.addEventListener('click',event=>{if(performance.now()<clickBlockedUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
  document.querySelector('#previous-work').addEventListener('click',()=>goToWork(active-1));document.querySelector('#next-work').addEventListener('click',()=>goToWork(active+1));
  document.querySelector('.work-scrubber').addEventListener('click',event=>{const button=event.target.closest('[data-work-index]');if(button)goToWork(Number(button.dataset.workIndex));});
  document.querySelector('.quote-controls').addEventListener('click',event=>{const button=event.target.closest('[data-quote]');if(button)goToQuote(Number(button.dataset.quote));});
  preference.addEventListener('change',()=>{activeQuote=-1;stop();update();});
  function stop(){cancelAnimationFrame(seekFrame);seekFrame=0;clearTimeout(snapTimer);if(drag)release({pointerId:drag.id,type:'pointercancel'});}
  return {update,goToWork,goToPractice,stop};
}

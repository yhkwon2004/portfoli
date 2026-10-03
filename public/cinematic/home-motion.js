export const clamp = (value, low=0, high=1) => Math.min(high, Math.max(low, value));
const dragThreshold=6;
export function dragPosition(start, delta, width, count) {
  const anchor=Math.round(start);
  return clamp(anchor+clamp(start-anchor+delta/Math.max(120,width*.2),-1,1),0,count-1);
}
export function wheelGesture(state, delta, now) {
  if(now-state.last>220&&now>=state.until){state.used=false;state.total=0;}
  state.last=now;
  if(state.used)return 0;
  state.total+=delta;
  if(Math.abs(state.total)<18)return 0;
  state.used=true;state.until=now+420;
  return Math.sign(state.total);
}
export const gestureIndex=(start,delta,count)=>clamp(Math.round(start)+(Math.abs(delta)>=dragThreshold?Math.sign(delta):0),0,count-1);
export function workPose(distance, width) {
  const angle=clamp(distance,-2.5,2.5)*.76;
  return {x:Math.sin(angle)*width*.91,y:distance*width*.038,z:(Math.cos(angle)-1)*width*.58,rotation:-angle*180/Math.PI*.66,opacity:1-clamp((Math.abs(distance)-1.1)/1.4),scale:1-clamp(Math.abs(distance))*.12};
}
export function awardPose(distance) {
  const d=clamp(distance,-2,2),depth=Math.abs(d);
  return {x:d*22,y:depth*3,rotation:-d*12,scale:1-depth*.08,opacity:1-depth*.23};
}

// Native scroll remains the timeline; each wheel or drag gesture seeks one work card.
export function createHomeMotion({onWork,onPractice}) {
  const home=document.querySelector('#home-page'),works=document.querySelector('#works');
  const cards=[...document.querySelectorAll('.work-card')],vision=document.querySelector('#vision'),contact=document.querySelector('#contact');
  const quotes=[...document.querySelectorAll('.quote-frame')],practice=document.querySelector('#practice'),preference=matchMedia('(prefers-reduced-motion: reduce)'),precision=matchMedia('(hover: hover) and (pointer: fine)');
  const practiceCount=document.querySelectorAll('[data-practice]').length;
  const practiceCards=[...document.querySelectorAll('.practice-card')];
  let pointed=null,pointedBounds=null;
  function clearPointed(){
    if(pointed){pointed.classList.remove('is-pointed');pointed.style.setProperty('--tilt-x','0deg');pointed.style.setProperty('--tilt-y','0deg');}
    pointed=pointedBounds=null;
  }
  home.addEventListener('pointermove',event=>{
    if(preference.matches||!precision.matches||event.pointerType!=='mouse'||drag){clearPointed();return;}
    const surface=event.target.closest('.work-card[tabindex="0"],.practice-card[aria-hidden="false"] .practice-object');
    if(surface!==pointed){clearPointed();pointed=surface;pointedBounds=surface?.getBoundingClientRect();}
    if(!pointed)return;
    const x=clamp((event.clientX-pointedBounds.left)/pointedBounds.width,0,1),y=clamp((event.clientY-pointedBounds.top)/pointedBounds.height,0,1),angle=pointed.classList.contains('work-card')?5:3;
    pointed.style.setProperty('--tilt-x',`${(y-.5)*-angle*2}deg`);pointed.style.setProperty('--tilt-y',`${(x-.5)*angle*2}deg`);
    pointed.style.setProperty('--light-x',`${x*100}%`);pointed.style.setProperty('--light-y',`${y*100}%`);pointed.classList.add('is-pointed');
  },{passive:true});
  home.addEventListener('pointerleave',clearPointed);addEventListener('blur',clearPointed);precision.addEventListener('change',clearPointed);
  let position=0,servicePosition=0,active=-1,activePractice=0,activeQuote=-1,manualPractice=0,raf=0,lastTime=0,drag=null,clickBlockedUntil=0,snapTimer=0,seekFrame=0;
  const wheel={last:-Infinity,until:0,total:0,used:false};
  const bounds=element=>({start:element.offsetTop,end:element.offsetTop+Math.max(1,element.offsetHeight-innerHeight)});
  const fraction=element=>{const b=bounds(element);return clamp((scrollY-b.start)/(b.end-b.start));};
  const visible=element=>{const b=element.getBoundingClientRect();return b.bottom>0&&b.top<innerHeight;};
  function seek(top,animate=true){
    clearTimeout(snapTimer);cancelAnimationFrame(seekFrame);seekFrame=0;
    if(preference.matches||!animate){scrollTo({top,behavior:'instant'});return;}
    const from=scrollY,started=performance.now();
    const step=now=>{if(home.hidden){seekFrame=0;return;}const p=clamp((now-started)/420),e=1-Math.pow(1-p,4);scrollTo({top:from+(top-from)*e,behavior:'instant'});if(p<1)seekFrame=requestAnimationFrame(step);else seekFrame=0;};
    seekFrame=requestAnimationFrame(step);
  }
  function goToWork(index){const b=bounds(works);seek(b.start+clamp(index,0,cards.length-1)/(cards.length-1)*(b.end-b.start));}
  function goToQuote(index){const b=bounds(vision);seek(b.start+clamp(index,0,quotes.length-1)/(quotes.length-1)*(b.end-b.start));}
  function goToPractice(index){
    clearPointed();
    index=clamp(index,0,practiceCount-1);
    if(innerHeight<=800){manualPractice=index;update();return;}
    const b=bounds(practice);seek(b.start+clamp(index,0,practiceCount-1)/(practiceCount-1)*(b.end-b.start));
  }
  function render(now){
    raf=0;if(home.hidden)return;
    const target=fraction(works)*(cards.length-1),dt=lastTime?now-lastTime:16;lastTime=now;
    position=preference.matches?target:position+(target-position)*(1-Math.exp(-dt/70));
    if(Math.abs(position-target)<.0002)position=target;
    const selected=Math.round(position),rect=works.getBoundingClientRect();
    works.querySelector('[data-drag-scene]').style.touchAction=rect.top<=1&&rect.bottom>=innerHeight-1?'pinch-zoom':'pan-y pinch-zoom';
    works.style.setProperty('--work-progress',String(position/(cards.length-1)));
    works.style.setProperty('--work-entry',String(preference.matches?1:clamp(1-rect.top/innerHeight)));
    cards.forEach((card,index)=>{
      const d=index-position,p=workPose(d,innerWidth);
      card.style.transform=preference.matches?`translate3d(calc(-50% + ${d*innerWidth*.9}px),-50%,0)`:`translate3d(calc(-50% + ${p.x}px),calc(-50% + ${p.y}px),${p.z}px) rotateY(${p.rotation}deg) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) scale(${p.scale})`;
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
    home.classList.toggle('is-memory-playing',visible(about)||visible(vision));
    const c=contact.getBoundingClientRect(),cp=clamp(1-c.top/innerHeight),hold=fraction(contact);
    contact.style.setProperty('--contact-in',String(preference.matches?1:cp));contact.style.setProperty('--contact-progress',String(hold));
    const serviceTarget=innerHeight<=800?manualPractice:fraction(practice)*(practiceCount-1);
    servicePosition=preference.matches?serviceTarget:servicePosition+(serviceTarget-servicePosition)*(1-Math.exp(-dt/65));
    if(Math.abs(servicePosition-serviceTarget)<.0002)servicePosition=serviceTarget;
    const serviceIndex=Math.round(servicePosition);
    if(serviceIndex!==activePractice){activePractice=serviceIndex;onPractice(activePractice);}
    practiceCards.forEach((card,index)=>{
      const d=index-servicePosition,p=awardPose(d),certificate=card.querySelector('.practice-object');
      card.style.zIndex=String(10-Math.round(Math.abs(d)*2));
      card.style.visibility=Math.abs(d)>2.1||(preference.matches&&index!==serviceIndex)?'hidden':'visible';
      certificate.style.transform=preference.matches?'none':`translate3d(${p.x}%,${p.y}%,${-Math.abs(d)*60}px) rotateZ(${p.rotation}deg) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) scale(${p.scale})`;
      certificate.style.opacity=String(preference.matches?1:p.opacity);
    });
    if(position!==target||servicePosition!==serviceTarget)raf=requestAnimationFrame(render);
  }
  function update(){if(!raf){lastTime=0;raf=requestAnimationFrame(render);}}
  function scheduleSnap(){
    clearTimeout(snapTimer);if(preference.matches||home.hidden||drag||seekFrame)return;
    snapTimer=setTimeout(()=>{if(home.hidden||drag||seekFrame)return;for(const [section,count,go] of [[works,cards.length,goToWork],[practice,practiceCount,goToPractice]]){const b=bounds(section);if(section===practice&&innerHeight<=800)continue;if(scrollY>b.start+12&&scrollY<b.end-12){const p=fraction(section)*(count-1);if(Math.abs(p-Math.round(p))>.012)go(Math.round(p));break;}}},320);
  }
  addEventListener('scroll',()=>{clearPointed();update();scheduleSnap();},{passive:true});addEventListener('resize',()=>{clearPointed();update();});
  addEventListener('wheel',event=>{
    if(home.hidden||event.ctrlKey||event.target.closest('dialog,input,select,textarea'))return;
    const b=bounds(works),delta=(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    if(scrollY<b.start-2||scrollY>b.end+2){cancelAnimationFrame(seekFrame);seekFrame=0;return;}
    const index=Math.max(0,active);
    if(!wheel.used&&((index===0&&delta<0)||(index===cards.length-1&&delta>0)))return;
    const now=performance.now();
    if(now-wheel.last>220&&now>=wheel.until){wheel.used=false;wheel.total=0;if((index===0&&delta<0)||(index===cards.length-1&&delta>0))return;}
    event.preventDefault();clearTimeout(snapTimer);
    const direction=wheelGesture(wheel,delta,now);if(direction)goToWork(index+direction);
  },{passive:false});
  addEventListener('keydown',event=>{
    if(home.hidden||!document.querySelector('#mobile-menu').hidden||document.querySelector('dialog[open]')||event.target.closest('input,textarea,select,[role="tab"]'))return;
    if(['ArrowLeft','ArrowRight'].includes(event.key)&&visible(works)&&Math.abs(works.getBoundingClientRect().top)<works.offsetHeight-innerHeight){event.preventDefault();goToWork(active+(event.key==='ArrowRight'?1:-1));}
  });
  for(const area of document.querySelectorAll('[data-drag-scene]')){
    area.addEventListener('dragstart',event=>event.preventDefault());
    area.addEventListener('pointerdown',event=>{
      if(!event.isPrimary||event.button!==0||event.target.closest('button,input,select'))return;
      clearPointed();
      if(area.closest('section')===vision&&innerHeight<=650)return;
      const section=area.closest('section'),rect=section.getBoundingClientRect();
      if(!(section===practice&&innerHeight<=800)&&(rect.top>1||rect.bottom<innerHeight-1))return;
      cancelAnimationFrame(seekFrame);seekFrame=0;clearTimeout(snapTimer);
      const count=section===works?cards.length:section===vision?quotes.length:section===practice?practiceCount:2;
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,start:section===works?Math.max(0,active):section===practice?activePractice:fraction(section)*(count-1),count,delta:0,axis:null,area,section,moved:false,touch:event.pointerType==='touch'};
    });
  }
  addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)<dragThreshold)return;
    // Touch keeps native vertical scrolling; horizontal gestures seek the pinned scene.
    if(drag.touch&&drag.section!==works&&!drag.moved&&Math.abs(dy)>Math.abs(dx)){drag=null;return;}
    drag.moved=true;drag.area.classList.add('is-dragging');
    if(!drag.area.hasPointerCapture(event.pointerId))drag.area.setPointerCapture(event.pointerId);
    drag.axis??=Math.abs(dx)>=Math.abs(dy)?'x':'y';
    drag.delta=drag.axis==='x'?-dx:-dy;
    const b=bounds(drag.section);
    const p=dragPosition(drag.start,drag.delta,innerWidth,drag.count);
    if(drag.section===practice&&innerHeight<=800){manualPractice=p;update();return;}
    scrollTo({top:b.start+p/(drag.count-1)*(b.end-b.start),behavior:'instant'});
  },{passive:true});
  function release(event){
    if(!drag||drag.id!==event.pointerId)return;
    const finished=drag;drag=null;finished.area.classList.remove('is-dragging');
    if(finished.area.hasPointerCapture(event.pointerId))finished.area.releasePointerCapture(event.pointerId);
    if(event.type==='pointercancel'&&finished.section===practice&&innerHeight<=800){manualPractice=Math.round(finished.start);update();}
    if(finished.moved){
      clickBlockedUntil=performance.now()+400;
      if(event.type!=='pointercancel'){
        const next=gestureIndex(finished.start,finished.delta,finished.count),b=bounds(finished.section);
        const leaving=finished.touch&&finished.section===works&&((Math.round(finished.start)===0&&finished.delta<0)||(Math.round(finished.start)===finished.count-1&&finished.delta>0));
        if(finished.section===practice)goToPractice(next);
        else seek(leaving?(finished.delta>0?b.end+innerHeight*.65:b.start-innerHeight*.65):b.start+next/(finished.count-1)*(b.end-b.start));
      }
    }
  }
  addEventListener('pointerup',release);addEventListener('pointercancel',release);
  home.addEventListener('click',event=>{if(performance.now()<clickBlockedUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
  document.querySelector('#previous-work').addEventListener('click',()=>goToWork(active-1));document.querySelector('#next-work').addEventListener('click',()=>goToWork(active+1));
  document.querySelector('.work-scrubber').addEventListener('click',event=>{const button=event.target.closest('[data-work-index]');if(button)goToWork(Number(button.dataset.workIndex));});
  document.querySelector('.quote-controls').addEventListener('click',event=>{const button=event.target.closest('[data-quote]');if(button)goToQuote(Number(button.dataset.quote));});
  preference.addEventListener('change',()=>{activeQuote=-1;stop();update();});
  function stop(){clearPointed();cancelAnimationFrame(seekFrame);seekFrame=0;clearTimeout(snapTimer);if(drag)release({pointerId:drag.id,type:'pointercancel'});}
  return {update,goToWork,goToPractice,stop};
}

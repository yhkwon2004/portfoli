import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { records, content, projects, awards, press, featured, categories, filterProjects, youtubeId, itemPath } from './content.js';
import { resolvePage, escapeHTML, pressCard, photoSource, fieldPhotos, activityIds, projectFacts } from './pages.js';
import { institutions } from './media.js';
import { workPose, awardPose, clamp, dragPosition, wheelGesture, gestureIndex } from './home-motion.js';
for(const count of [3,6])for(const width of [320,390,1440])for(let start=0;start<count;start++){
  assert.equal(dragPosition(start,10000,width,count),Math.min(count-1,start+1),'Long drag must advance only one card');
  assert.equal(dragPosition(start,-10000,width,count),Math.max(0,start-1),'Reverse drag must retreat only one card');
  assert.equal(dragPosition(start,0,width,count),start);
}
assert.equal(dragPosition(1.25,0,1440,6),1.25,'Grabbing a moving card must not jump');
for(const delta of [6,9,30,10000]){assert.equal(gestureIndex(2,delta,6),3);assert.equal(gestureIndex(2,-delta,6),1);assert.equal(gestureIndex(0,delta,3),1);}
assert.equal(gestureIndex(2,5,6),2,'Clicks must not advance a card');
assert.equal(gestureIndex(0,-9,3),0);assert.equal(gestureIndex(2,9,3),2);
assert(dragPosition(1,6,1440,6)>1.02,'A gentle drag must immediately preview movement');
const wheel={last:-Infinity,until:0,total:0,used:false};
assert.equal(wheelGesture(wheel,6,0),0);assert.equal(wheelGesture(wheel,12,10),1);
for(const time of [30,100,300,500,700,800])assert.equal(wheelGesture(wheel,500,time),0,'Momentum must not skip another card');
assert.equal(wheelGesture(wheel,-30,1200),-1,'New gestures can move back');
const quickWheel={last:-Infinity,until:0,total:0,used:false};
assert.equal(wheelGesture(quickWheel,18,0),1);assert.equal(wheelGesture(quickWheel,18,450),1,'A second deliberate gesture must not wait for the old 850ms lock');
const lab=resolvePage('motion/');assert.equal(lab.kind,'lab');assert.equal((lab.html.match(/class="lab-case"/g)||[]).length,4);assert(!lab.html.includes('data-material'));
assert.equal(projectFacts(projects.find(item=>item.id==='project-iot-ring')).participants,'4명');
for(const project of projects){const html=resolvePage(itemPath(project)).html;for(const field of ['IDEA / 한 줄 소개','TEAM / 참여 인원','MY ROLE / 역할'])assert(html.includes(field));}
import { animatePageTransition } from './page-transition.js';
assert.deepEqual(animatePageTransition(null,null,true,true),[],'Reduced motion must not start animations');
const motionCalls=[];
const motionElement={animate(frames,options){motionCalls.push({frames,options});return {finished:Promise.resolve()};},querySelector(){return this;}};
for(const entering of [true,false]){
  motionCalls.length=0;
  const animations=animatePageTransition(motionElement,motionElement,entering,false);
  await Promise.all(animations.map(animation=>animation.finished));
  assert.equal(animations.length,3,'Curtain, graphic and page must move together');
  assert.equal(motionCalls[0].frames[entering?1:0].transform,'translateY(0)','DOM swap must be fully covered');
  assert.equal(motionCalls[2].frames.at(-1).opacity,entering?.35:1,'Incoming content must finish fully visible');
}
const local=path=>new URL(path,import.meta.url);
assert.equal(new Set(records.map(item=>item.id)).size,records.length,'Record IDs must be unique');
assert(featured.every(item=>item?.type==='project'),'Featured projects must resolve');
assert.deepEqual(featured.slice(0,4).map(item=>item.id),['project-factline','project-handmade-car','project-autonomous','project-iot-ring']);
assert.deepEqual(projects.slice(0,6).map(item=>item.id),featured.map(item=>item.id),'The archive must share featured project priority');
assert.equal(records.find(item=>item.id==='award-national-scholar').images.length,0,'Unrelated Drive-Up certificate must not be shown as scholarship evidence');
assert.deepEqual(awardPose(0),{x:0,y:0,rotation:-0,scale:1,opacity:1});
for(const d of [.5,1,2]){const a=awardPose(-d),b=awardPose(d);assert.equal(a.x,-b.x);assert.equal(a.rotation,-b.rotation);assert.equal(a.opacity,b.opacity);assert(b.scale>0&&b.opacity>0);}
assert.equal(clamp(-1),0);assert.equal(clamp(2),1);
assert.deepEqual(workPose(0,1000),{x:0,y:0,z:0,rotation:-0,opacity:1,scale:1});
for(const d of [.2,1,2,3]){const left=workPose(-d,1000),right=workPose(d,1000);assert.equal(left.x,-right.x);assert.equal(left.z,right.z);assert(right.opacity>=0&&right.opacity<=1);assert(right.z<=0);}
assert.equal(activityIds.length,5);
assert.equal((resolvePage('activities/').html.match(/data-activity-id=/g)||[]).length,5);
for(const id of activityIds)assert(records.some(item=>item.id===id));
const imagesFor=id=>records.find(item=>item.id===id).images;
assert(imagesFor('project-manual-electric-vehicle').some(image=>image.src.endsWith('/upcycle-material.webp')));
assert(!imagesFor('project-upcycle').some(image=>image.src.endsWith('/upcycle-material.webp')));
for(const name of ['build','chassis','workshop']){const file=`evidence/projects/handmade-car-${name}.webp`;assert(imagesFor('project-autonomous').some(image=>image.src.endsWith(file)));assert(!imagesFor('project-handmade-car').some(image=>image.src.endsWith(file)));}
assert(!records.some(item=>item.images.some(image=>image.src.includes('upcycle-panel'))));
assert.equal(filterProjects().length,projects.length);
assert.equal(filterProjects({query:'  Re:CAP  '}).length,projects.filter(item=>`${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes('re:cap')).length);
assert.equal(filterProjects({query:'no-project-matches-this-98765'}).length,0);
for(const category of categories.slice(1))assert(filterProjects({category}).every(item=>item.category===category));
assert(filterProjects({category:'Hardware',year:'2026'}).every(item=>item.category==='Hardware'&&item.year.includes('2026')));
assert.equal(youtubeId('https://youtu.be/sLgSZitPeOc?si=abc'),'sLgSZitPeOc');
assert.equal(youtubeId('https://www.youtube.com/watch?v=sLgSZitPeOc'),'sLgSZitPeOc');
assert.equal(youtubeId('https://youtube.com/shorts/NZwp7W0fqdU?feature=share'),'NZwp7W0fqdU');
assert.equal(youtubeId('https://evil.example/watch?v=sLgSZitPeOc'),null);
assert.equal(youtubeId('javascript:alert(1)'),null);
assert.equal(escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
const assets=new Set(['app.js','content.js','data.js','pages.js','scene.js','style.css','pages.css','assets/scene.glb',...['px','nx','py','ny','pz','nz'].map(side=>`assets/env-${side}.png`),'vendor/three.module.js','vendor/three.core.js','vendor/GLTFLoader.js','vendor/BufferGeometryUtils.js']);
for(const path of ['media.js','home-motion.js','home-motion.css','detail-updates.css'])assets.add(path);
assert.equal(institutions.length,9);
for(const quote of content.quotes)for(const id of quote.awardIds||[])assert(awards.some(award=>award.id===id),'Vision achievements must use actual award records');
for(const institution of institutions){assert(['https:','http:'].includes(new URL(institution.url).protocol));assert(institution.name);assets.add(institution.logo);}
assert.equal(new Set(press.map(article=>article.id)).size,press.length,'Press IDs must be unique');
for(const [index,article] of press.entries()){
  assert(article.title&&article.publisher&&article.summary,`Incomplete article: ${article.id}`);
  assert(['http:','https:'].includes(new URL(article.url).protocol),`Unsafe article URL: ${article.id}`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(article.date)&&new Date(article.date).toISOString().slice(0,10)===article.date,`Invalid article date: ${article.id}`);
  assert(!index||press[index-1].date>=article.date,'Press must be newest first');
  assert(['직접 소개','관련 보도'].includes(article.relation),`Missing relationship label: ${article.id}`);
  assert(article.imageId==null||records.some(item=>item.id===article.imageId),`Unknown article cover: ${article.id}`);
  for(const id of article.projectIds){
    const item=records.find(item=>item.id===id);assert(item,`Unknown article project: ${id}`);
    assert(resolvePage(itemPath(item)).html.includes(`data-press-id="${article.id}"`),`Missing related article: ${id}`);
  }
  if(article.image){
    assert(article.image.alt&&article.image.src.startsWith('assets/'),`Invalid article image: ${article.id}`);
    assets.add(article.image.src);if(article.image.thumb)assets.add(article.image.thumb);
    assert(article.image.source?.label&&['http:','https:'].includes(new URL(article.image.source.url).protocol),`Missing article photo credit: ${article.id}`);
  }
  const card=pressCard(article);assert(card.includes('target="_blank" rel="noopener noreferrer"'));
  assert(article.image?.src.startsWith('assets/portfolio/press/'),'News uses the publisher photograph');
  assert.equal((card.match(/<a\b/g)||[]).length,1,'Press cards cannot contain nested links');
  assert(resolvePage('news/').html.includes(`data-press-id="${article.id}"`));
}
assert.equal(pressCard({url:'javascript:alert(1)'}),'');
assert(!photoSource({source:{label:'Unsafe',url:'javascript:alert(1)'}}).includes('href='));
assert.equal(fieldPhotos.length,6,'Field gallery should contain six selected photographs');
assert.equal(new Set(fieldPhotos.map(({item})=>item.id)).size,6,'Field photographs must cover different projects');
for(const {item,image} of fieldPhotos){assert(!image.illustrative&&image.role!=='certificate');assert(resolvePage('about/').html.includes(itemPath(item)));assets.add(image.src);assets.add(image.thumb);}
for(const item of records){
  assert(item.title,`Missing title: ${item.id}`);
  if(['project','award'].includes(item.type))assert(item.summary,`Missing summary: ${item.id}`);
  for(const image of item.images){assert(image.alt,`Missing image alt: ${item.id}`);assets.add(image.src);assets.add(image.thumb);if(image.source)assert(image.source.label&&['http:','https:'].includes(new URL(image.source.url).protocol),`Unsafe photo source: ${item.id}`);}
  for(const link of item.links)assert(['http:','https:'].includes(new URL(link.url).protocol),`Unsafe link: ${item.id}`);
  for(const video of item.videos)assert(youtubeId(video.url),`Unsupported video: ${item.id}`);
  if(['project','award'].includes(item.type)){
    const path=itemPath(item),page=resolvePage(path);
    assert.equal(page.item.id,item.id,`Wrong route: ${path}`);
    assert(page.html.includes(escapeHTML(item.title)));
    const related=page.html.split('<section class="related-projects"')[1].split('</section>')[0];
    assert(!related.includes(`href="${itemPath(item)}"`),'Related rail must exclude the current item');
    assert.equal((related.match(/class="related-card"/g)||[]).length,6);
    for(const match of page.html.matchAll(/data-image="(\d+)"/g))assert(item.images[Number(match[1])],`Invalid gallery image: ${path} ${match[1]}`);
    const html=await readFile(local(`${path}index.html`),'utf8');
    assert(html.includes('<base href="../../">'),`Broken deep route base: ${path}`);
  }
}
await Promise.all([...assets].map(asset=>access(local(asset))));
for(const path of ['works/','news/','about/','activities/','motion/']){assert.notEqual(resolvePage(path).kind,'not-found');await access(local(`${path}index.html`));}
for(const news of content.news)assert.notEqual(resolvePage(news.target).kind,'not-found');
assert.equal(resolvePage('works/missing/').kind,'not-found');
assert.equal(resolvePage('records/project-upcycle/').kind,'not-found');
assert(resolvePage('works/',new URLSearchParams('q=nothing-matches-98765')).html.includes('검색 결과가 없습니다'));
const html=await readFile(local('index.html'),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert(!html.includes('sound-intro'),'Sound prompt removed');
assert(content.links.some(link=>link.url==='https://www.instagram.com/dydgus_.0802'));
assert.equal(new Set(ids).size,ids.length,'Duplicate HTML IDs');
for(const match of html.matchAll(/href="(?:\.\/)?#([^"]+)"/g))assert(ids.includes(match[1]),`Missing anchor: ${match[1]}`);
console.log(`PASS: ${projects.length} projects, ${awards.length} awards, ${press.length} verified press links, ${fieldPhotos.length} field photographs, ${records.length} records, ${assets.size} local assets, filters, embeds, safe markup and all static routes.`);

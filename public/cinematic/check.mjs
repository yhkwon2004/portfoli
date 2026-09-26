import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { records, content, projects, awards, press, featured, categories, filterProjects, youtubeId, itemPath } from './content.js';
import { resolvePage, escapeHTML, pressCard, photoSource, fieldPhotos } from './pages.js';
const local=path=>new URL(path,import.meta.url);
assert.equal(new Set(records.map(item=>item.id)).size,records.length,'Record IDs must be unique');
assert(featured.every(item=>item?.type==='project'),'Featured projects must resolve');
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
    for(const match of page.html.matchAll(/data-image="(\d+)"/g))assert(item.images[Number(match[1])],`Invalid gallery image: ${path} ${match[1]}`);
    const html=await readFile(local(`${path}index.html`),'utf8');
    assert(html.includes('<base href="../../">'),`Broken deep route base: ${path}`);
  }
}
await Promise.all([...assets].map(asset=>access(local(asset))));
for(const path of ['works/','news/','about/','motion/']){assert.notEqual(resolvePage(path).kind,'not-found');await access(local(`${path}index.html`));}
for(const news of content.news)assert.notEqual(resolvePage(news.target).kind,'not-found');
assert.equal(resolvePage('works/missing/').kind,'not-found');
assert.equal(resolvePage('records/project-upcycle/').kind,'not-found');
assert(resolvePage('works/',new URLSearchParams('q=nothing-matches-98765')).html.includes('검색 결과가 없습니다'));
const html=await readFile(local('index.html'),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(ids).size,ids.length,'Duplicate HTML IDs');
for(const match of html.matchAll(/href="(?:\.\/)?#([^"]+)"/g))assert(ids.includes(match[1]),`Missing anchor: ${match[1]}`);
console.log(`PASS: ${projects.length} projects, ${awards.length} awards, ${press.length} verified press links, ${fieldPhotos.length} field photographs, ${records.length} records, ${assets.size} local assets, filters, embeds, safe markup and all static routes.`);

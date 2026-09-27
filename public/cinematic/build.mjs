import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { records, content, itemPath } from './content.js';
import { escapeHTML } from './pages.js';
const shell=await readFile(new URL('index.html',import.meta.url),'utf8');
const pages=[...['works','news','about','activities','motion'].map(path=>({path:`${path}/`,title:`${path[0].toUpperCase()+path.slice(1)} — ${content.name}`})),...records.filter(item=>['project','award'].includes(item.type)).map(item=>({path:itemPath(item),title:`${item.title} — ${content.name}`,description:item.summary}))];
for(const page of pages){
  const directory=new URL(page.path,import.meta.url);await mkdir(directory,{recursive:true});
  const base='../'.repeat(page.path.split('/').filter(Boolean).length);
  const html=shell.replace('<base href="./">',`<base href="${base}">`).replace(/<title>[^<]*<\/title>/,`<title>${escapeHTML(page.title)}</title>`).replace(/(<meta name="description" content=")[^"]*/,`$1${escapeHTML(page.description||'권용현의 프로젝트와 도전의 기록.')}`);
  await writeFile(new URL('index.html',directory),html);
}
console.log(`Built ${pages.length} static route entry points. No runtime dependencies required.`);

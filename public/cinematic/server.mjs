import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.avif':'image/avif','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.glb':'model/gltf-binary','.svg':'image/svg+xml','.woff2':'font/woff2'};
createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(url.pathname);
    let file=resolve(root,`.${pathname}`);
    if(file!==resolve(root)&&!file.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403).end();return;}
    const info=await stat(file);
    if(info.isDirectory()){
      if(!pathname.endsWith('/')){res.writeHead(301,{Location:`${url.pathname}/${url.search}`}).end();return;}
      file=resolve(file,'index.html');
    }else if(!info.isFile()){res.writeHead(404).end();return;}
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('Portfolio ready at http://localhost:4173'));

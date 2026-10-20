import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv.includes('--dist')?'dist':'.');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
http.createServer(async(req,res)=>{
  try{
    let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(name.startsWith('/sprint-after-nine/'))name=name.slice('/sprint-after-nine'.length);
    if(name==='/')name='/index.html';
    if(name.startsWith('/vendor/'))name='/node_modules/three/build/'+name.slice(8);
    if(root.endsWith('dist')&&name.startsWith('/node_modules/three/build/'))name='/vendor/'+name.split('/').pop();
    const file=path.resolve(root,'.'+name);
    if(!file.startsWith(root+path.sep)||name.split('/').some(p=>p.startsWith('.'))||!['.html','.js','.css','.png'].includes(path.extname(file)))throw Error();
    res.setHeader('Content-Type',types[path.extname(file)]);res.setHeader('Cache-Control','no-store');
    res.end(await readFile(file));
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Local server http://127.0.0.1:${port}`));

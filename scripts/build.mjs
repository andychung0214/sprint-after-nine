import {mkdir,copyFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.resolve(root,'dist');
if(path.dirname(out)!==path.resolve(root)||path.basename(out)!=='dist')throw Error('Unsafe output directory');
await rm(out,{recursive:true,force:true});
await mkdir(path.join(out,'src'),{recursive:true});
await mkdir(path.join(out,'vendor'),{recursive:true});
for(const file of ['index.html','styles.css'])await copyFile(path.join(root,file),path.join(out,file));
for(const file of ['main.js','content.js','game-state.js','storage.js','ui.js','scene.js','movement.js','audio.js'])
  await copyFile(path.join(root,'src',file),path.join(out,'src',file));
for(const file of ['three.module.js','three.core.js'])
  await copyFile(path.join(root,'node_modules/three/build',file),path.join(out,'vendor',file));
await copyFile(path.join(root,'node_modules/three/LICENSE'),path.join(out,'vendor/LICENSE'));
console.log('Built self-contained static site: dist/');

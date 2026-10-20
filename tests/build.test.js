import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,readdir} from 'node:fs/promises';
test('static build is self-contained and excludes development and private files',async()=>{
  const result=spawnSync(process.execPath,['scripts/build.mjs'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const files=await readdir('dist',{recursive:true});
  for(const name of ['index.html','styles.css','src/main.js','vendor/three.module.js','vendor/three.core.js','vendor/LICENSE'])
    assert.ok(files.map(f=>f.replaceAll('\\','/')).includes(name),name);
  assert.ok(!files.some(f=>/node_modules|\.git|\.env|tests|\.pem|\.key/.test(f)));
  assert.match(await readFile('dist/src/scene.js','utf8'),/\.\.\/vendor\/three\.module\.js/);
  assert.match(await readFile('dist/index.html','utf8'),/src="\.\/src\/main\.js"/);
});

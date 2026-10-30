import test from 'node:test';
import assert from 'node:assert/strict';
import * as movement from '../src/movement.js';
test('smooth turning takes the shortest path across ±pi',()=>{
  assert.equal(typeof movement.dampAngle,'function');
  const result=movement.dampAngle(Math.PI-.1,-Math.PI+.1,.016);
  assert.ok(result>Math.PI-.1&&result<Math.PI+.1);
});
test('turn smoothing is consistent at 30 and 120 updates per second',()=>{
  assert.equal(typeof movement.dampAngle,'function');
  const run=fps=>{let a=0;for(let i=0;i<fps;i++)a=movement.dampAngle(a,2,1/fps);return a;};
  assert.ok(Math.abs(run(30)-run(120))<1e-9);
});
test('routing escapes the narrow rear aisle from a legal manual position',()=>{
  const bounds={minX:-10.4,maxX:10.4,minZ:-6.35,maxZ:6.35};
  const obstacles=[{minX:-4.97,maxX:-2.23,minZ:4.505,maxZ:6.095}];
  const path=movement.findRoute({x:-4.2,z:6.2},{x:0,z:0},bounds,obstacles);
  assert.ok(path.length>0,'must find a way around the last desk row');
  for(const p of path){assert.ok(p.z<=bounds.maxZ);assert.ok(!obstacles.some(o=>p.x>o.minX&&p.x<o.maxX&&p.z>o.minZ&&p.z<o.maxZ));}
});

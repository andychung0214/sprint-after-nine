import test from 'node:test';
import assert from 'node:assert/strict';
import {stepMovement} from '../src/movement.js';
const bounds={minX:-6,maxX:6,minZ:-4,maxZ:4};
test('diagonal speed normalized, delta capped and no input stable',()=>{
  const a=stepMovement({x:0,z:0},{x:1,z:0},.05,bounds,[]);
  const b=stepMovement({x:0,z:0},{x:1,z:1},.05,bounds,[]);
  assert.ok(Math.abs(Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))<1e-8);
  assert.deepEqual(stepMovement({x:0,z:0},{x:1,z:0},30,bounds,[]),a);
  assert.deepEqual(stepMovement({x:1,z:2},{x:0,z:0},.05,bounds,[]),{x:1,z:2});
});
test('bounds and collision prevent leaving walkable floor',()=>{
  assert.equal(stepMovement({x:6,z:0},{x:1,z:0},.05,bounds,[]).x,6);
  assert.equal(stepMovement({x:0,z:0},{x:1,z:0},.05,bounds,[{minX:.1,maxX:1,minZ:-1,maxZ:1}]).x,0);
});

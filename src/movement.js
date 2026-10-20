export function stepMovement(p,input,delta,bounds,obstacles){
  const length=Math.hypot(input.x,input.z);
  if(!length)return {...p};
  const speed=3.2*Math.min(.05,Math.max(0,delta))/length;
  const valid=(x,z)=>!obstacles.some(o=>x>o.minX&&x<o.maxX&&z>o.minZ&&z<o.maxZ);
  let x=Math.max(bounds.minX,Math.min(bounds.maxX,p.x+input.x*speed)),z=p.z;
  if(!valid(x,z))x=p.x;
  z=Math.max(bounds.minZ,Math.min(bounds.maxZ,p.z+input.z*speed));
  if(!valid(x,z))z=p.z;
  return {x,z};
}

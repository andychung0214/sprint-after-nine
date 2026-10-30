export function dampAngle(current,target,delta){
  const difference=Math.atan2(Math.sin(target-current),Math.cos(target-current));
  return current+difference*(1-Math.exp(-12*Math.max(0,delta)));
}
export function findRoute(position,to,bounds,obstacles){
  const step=.2,key=(x,z)=>`${x},${z}`;
  const snap=p=>[Math.max(Math.ceil(bounds.minX/step),Math.min(Math.floor(bounds.maxX/step),Math.round(p.x/step))),Math.max(Math.ceil(bounds.minZ/step),Math.min(Math.floor(bounds.maxZ/step),Math.round(p.z/step)))];
  const start=snap(position),end=snap(to);
  const queue=[start],parents=new Map([[key(...start),null]]);let found=null;
  for(let i=0;i<queue.length&&i<20000;i++){
    const [x,z]=queue[i];if(x===end[0]&&z===end[1]){found=key(x,z);break;}
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,nz=z+dz,k=key(nx,nz),wx=nx*step,wz=nz*step;
      if(parents.has(k)||wx<bounds.minX||wx>bounds.maxX||wz<bounds.minZ||wz>bounds.maxZ||obstacles.some(o=>wx>o.minX&&wx<o.maxX&&wz>o.minZ&&wz<o.maxZ))continue;
      parents.set(k,key(x,z));queue.push([nx,nz]);
    }
  }
  const points=[];while(found){const [x,z]=found.split(',').map(Number);points.unshift({x:x*step,z:z*step});found=parents.get(found);}
  return points.slice(1);
}
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

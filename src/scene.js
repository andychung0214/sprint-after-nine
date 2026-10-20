import * as THREE from '../vendor/three.module.js';
import {STATIONS} from './content.js';
import {stepMovement} from './movement.js';
export function createScene(container,{onStation,onUnavailable,reducedMotion}){
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}
  catch{onUnavailable('這個瀏覽器無法啟用立體場景。請使用下方站點繼續遊戲。');return {setInputEnabled(){},resize(){},dispose(){}};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xe4e8dc,0);
  renderer.domElement.setAttribute('aria-label','辦公室場景：點擊編號站點前往');
  container.append(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-9,9,7,-7,.1,100);
  camera.position.set(13,15,17);camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight(0xfff7e8,0x73806c,2.6));
  const sunlight=new THREE.DirectionalLight(0xfff2d6,3.2);
  sunlight.position.set(-3,12,5);sunlight.castShadow=true;sunlight.shadow.mapSize.set(1024,1024);
  Object.assign(sunlight.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:1,far:30});
  sunlight.shadow.normalBias=.04;scene.add(sunlight);
  const materials=new Map();
  const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.87}));return materials.get(color);};
  function box(w,h,d,color,x,y,z,parent=scene){
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function cylinder(top,bottom,height,color,x,y,z,parent=scene){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,12),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  const floor=box(13,.35,9,0xd4c8ac,0,-.22,0);
  box(13,.06,9,0xe2dbca,0,0,0);
  for(let x=-6;x<6;x+=.65)box(.015,.012,8.9,0xcfc8b7,x,.036,0);
  box(13,2.7,.16,0xf5f0df,0,1.35,-4.45);
  box(.16,2.7,9,0xeae5d4,-6.45,1.35,0);
  box(13,.12,.24,0x87947c,0,2.75,-4.45);
  // 大窗與窗框，讓辦公室保留自然光的方向。
  for(const x of [-4.5,-2.3]){
    box(1.9,1.65,.05,0xacc5c1,x,1.65,-4.34);
    box(1.95,.08,.09,0xfbf7e7,x,1.65,-4.27);
    box(.06,1.75,.09,0xfbf7e7,x,1.65,-4.26);
    box(2.1,.12,.35,0xb98c62,x,.79,-4.15);
  }
  const obstacles=[];
  function obstacle(x,z,w,d){obstacles.push({minX:x-w/2-.22,maxX:x+w/2+.22,minZ:z-d/2-.22,maxZ:z+d/2+.22});}
  function desk(x,z,color=0xb98c62){
    box(2.3,.12,1.15,color,x,.92,z);
    for(const dx of [-.95,.95])for(const dz of [-.43,.43])box(.09,.86,.09,0x4d5a4e,x+dx,.45,z+dz);
    box(.08,.35,.08,0x374b40,x,1.12,z-.18);box(.9,.57,.09,0x35473f,x,1.44,z-.18);
    box(.8,.46,.015,0x98bcb2,x,1.44,z-.123);
    for(let i=0;i<3;i++)box(.45-i*.08,.025,.018,0xd7e7cf,x-.08,1.52-i*.09,z-.11);
    box(.65,.04,.24,0xe9e9d8,x,.999,z+.23);
    cylinder(.09,.07,.17,0xf5e4be,x+.76,1.06,z+.25);
    box(.45,.025,.35,0xf5f0df,x-.78,1.003,z+.14).rotation.y=.12;
    chair(x,z+.95);obstacle(x,z,2.3,1.15);
  }
  function chair(x,z){
    cylinder(.05,.05,.5,0x384b41,x,.3,z);
    box(.62,.12,.6,0x607762,x,.58,z);
    box(.62,.6,.12,0x607762,x,.86,z+.28);
    box(.8,.06,.08,0x384b41,x,.1,z);box(.08,.06,.8,0x384b41,x,.1,z);
  }
  function plant(x,z,scale=1){
    cylinder(.23*scale,.17*scale,.43*scale,0xbc9271,x,.23*scale,z);
    cylinder(.035,.035,1.1*scale,0x776e47,x,.8*scale,z);
    for(let i=0;i<5;i++){
      const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.36*scale,0),mat(i%2?0x6b865a:0x4f704f));
      mesh.scale.set(.65,1.3,.7);mesh.position.set(x+Math.sin(i*2)*.21*scale,(.9+i*.12)*scale,z+Math.cos(i*2)*.17*scale);scene.add(mesh);mesh.castShadow=true;
    }
  }
  function person(x,z,color=0xbd714e){
    const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
    box(.44,.56,.3,color,0,.73,0,group);
    cylinder(.19,.19,.34,0xe6b98c,0,1.19,0,group);
    box(.4,.14,.36,0x3e4236,0,1.37,-.025,group);
    box(.13,.33,.15,0x3b4b43,-.12,.27,0,group);box(.13,.33,.15,0x3b4b43,.12,.27,0,group);
    box(.16,.09,.25,0x354139,-.12,.08,.06,group);box(.16,.09,.25,0x354139,.12,.08,.06,group);
    box(.12,.45,.14,color,-.29,.72,0,group);box(.12,.45,.14,color,.29,.72,0,group);
    return group;
  }
  desk(-3.7,2);desk(-.6,2);desk(3.5,2.3,0x9eac8d);
  person(-.6,3,0x6c8583).rotation.y=Math.PI;
  // 會議室用矮隔間維持視線通透。
  box(3.2,.1,1.5,0xb98c62,3.6,.93,-2.45);
  box(.18,.85,1.2,0x64765f,2.5,.45,-2.45);box(.18,.85,1.2,0x64765f,4.7,.45,-2.45);
  obstacle(3.6,-2.45,3.2,1.5);
  for(const x of [2.6,4.5]){chair(x,-3.6);chair(x,-1.25);}
  box(.08,1.3,3.4,0xa9b7a4,1.65,.65,-2.8);
  obstacle(1.65,-2.8,.08,3.4);
  box(2.3,1.25,.12,0x788873,.1,1.65,-4.2);
  box(2.12,1.06,.14,0xf7f3e3,.1,1.65,-4.12);
  for(let i=0;i<6;i++)box(.3,.24,.02,i%2?0xc9d1a8:0xd5ad7f,-.62+(i%3)*.6,1.9-Math.floor(i/3)*.43,-4.03);
  // 茶水櫃、咖啡機與資料夾。
  box(1.8,1.05,.75,0x789075,-4.7,.53,-2.95);obstacle(-4.7,-2.95,1.8,.75);
  box(1.95,.09,.9,0xe6d6b9,-4.7,1.1,-2.95);
  box(.48,.5,.43,0x35483e,-4.9,1.4,-2.95);box(.25,.14,.06,0x9eb4a1,-4.9,1.45,-2.7);
  cylinder(.1,.08,.2,0xf1e7cb,-4.27,1.26,-2.82);
  box(1.3,1.4,.5,0x9c8a66,5.4,.7,-4);
  for(let i=0;i<6;i++)box(.11,.5,.35,i%2?0x4c6c5d:0xb26f50,4.95+i*.17,1.05,-3.94);
  plant(-5.6,.1,1.1);plant(5.7,3.3,.85);plant(1,-3.9,.65);
  const player=person(0,.1);
  const halo=new THREE.Mesh(new THREE.RingGeometry(.28,.36,28),new THREE.MeshBasicMaterial({color:0xad5142,side:THREE.DoubleSide}));
  halo.rotation.x=-Math.PI/2;halo.position.y=.06;player.add(halo);
  const targets=[],markers=[];
  const arrivals={desk:{x:-3.7,z:.5},whiteboard:{x:0,z:-2.8},meeting:{x:3.6,z:-.3},test:{x:3.5,z:.8},pantry:{x:-4.4,z:-1.6}};
  for(const st of STATIONS){
    const c=document.createElement('canvas');c.width=256;c.height=96;
    const ctx=c.getContext('2d');ctx.fillStyle='#fffcf5';ctx.beginPath();ctx.roundRect(4,5,248,76,14);ctx.fill();
    ctx.strokeStyle='#aab5a1';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#385747';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText(`${st.number}  ${st.name}`,128,54);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));
    sprite.position.set(st.x,2.25,st.z);sprite.scale.set(2.3,.86,1);sprite.userData.stationId=st.id;scene.add(sprite);markers.push(sprite);targets.push(sprite);
  }
  let enabled=false,lost=false,dirty=true,position={x:0,z:.1},keys=new Set(),path=[],destination=null,last=performance.now(),raf;
  const bounds={minX:-5.9,maxX:5.9,minZ:-3.9,maxZ:3.9};
  const listeners=[];
  const listen=(el,type,fn,options)=>{el.addEventListener(type,fn,options);listeners.push(()=>el.removeEventListener(type,fn,options));};
  const clear=()=>{keys.clear();path=[];destination=null;};
  function route(to){
    // 小型固定格網搜尋，避免點選站點時穿過桌子。
    const step=.4,key=(x,z)=>`${x},${z}`,start=[Math.round(position.x/step),Math.round(position.z/step)],end=[Math.round(to.x/step),Math.round(to.z/step)];
    const queue=[start],parents=new Map([[key(...start),null]]);
    let found=null;
    for(let i=0;i<queue.length&&i<1600;i++){
      const [x,z]=queue[i];if(x===end[0]&&z===end[1]){found=key(x,z);break;}
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=x+dx,nz=z+dz,k=key(nx,nz),wx=nx*step,wz=nz*step;
        if(parents.has(k)||wx<bounds.minX||wx>bounds.maxX||wz<bounds.minZ||wz>bounds.maxZ||obstacles.some(o=>wx>o.minX&&wx<o.maxX&&wz>o.minZ&&wz<o.maxZ))continue;
        parents.set(k,key(x,z));queue.push([nx,nz]);
      }
    }
    const points=[];
    while(found){const [x,z]=found.split(',').map(Number);points.unshift({x:x*step,z:z*step});found=parents.get(found);}
    return points.slice(1);
  }
  listen(window,'keydown',e=>{
    if(!enabled||e.target.matches('input,select,textarea,button'))return;
    const k=e.key.toLowerCase();
    if(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright'].includes(k)){e.preventDefault();path=[];destination=null;keys.add(k);}
    if(k==='e'&&!e.repeat){const nearest=STATIONS.find(st=>Math.hypot(position.x-arrivals[st.id].x,position.z-arrivals[st.id].z)<1.35);if(nearest)onStation(nearest.id);}
  });
  listen(window,'keyup',e=>keys.delete(e.key.toLowerCase()));
  listen(window,'blur',clear);listen(document,'visibilitychange',clear);listen(window,'resize',()=>{clear();resize();});
  const keyMap={up:'w',left:'a',down:'s',right:'d'};
  document.querySelectorAll('[data-move]').forEach(b=>{
    listen(b,'pointerdown',e=>{if(!enabled)return;e.preventDefault();b.setPointerCapture(e.pointerId);path=[];destination=null;keys.add(keyMap[b.dataset.move]);});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])listen(b,event,()=>keys.delete(keyMap[b.dataset.move]));
  });
  const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
  listen(renderer.domElement,'pointerdown',e=>{
    if(!enabled)return;
    const rect=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(targets)[0];
    if(hit){destination=hit.object.userData.stationId;path=route(arrivals[destination]);if(!path.length&&Math.hypot(position.x-arrivals[destination].x,position.z-arrivals[destination].z)<1.35)onStation(destination);}
  });
  listen(renderer.domElement,'webglcontextlost',e=>{e.preventDefault();lost=true;clear();onUnavailable('立體場景已中斷。工作進度仍在，請用下方站點繼續。');});
  function resize(){
    const w=container.clientWidth,h=container.clientHeight;
    if(!w||!h)return;
    const aspect=w/h,half=Math.max(7.5,10.1/aspect);
    camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;
    camera.updateProjectionMatrix();renderer.setSize(w,h,false);dirty=true;
  }
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  function frame(now){
    raf=requestAnimationFrame(frame);const delta=(now-last)/1000;last=now;
    if(lost||document.hidden)return;
    if(enabled){
      let input={x:(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),z:(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)};
      if(path.length){const next=path[0],dx=next.x-position.x,dz=next.z-position.z;if(Math.hypot(dx,dz)<.13)path.shift();else input={x:dx,z:dz};}
      const next=stepMovement(position,input,delta,bounds,obstacles);
      if(Math.hypot(next.x-position.x,next.z-position.z)>.001)player.rotation.y=Math.atan2(input.x,input.z);
      if(Math.hypot(input.x,input.z))dirty=true;
      position=next;player.position.set(position.x,!reducedMotion&&Math.hypot(input.x,input.z)?Math.sin(now*.014)*.025:0,position.z);
      if(destination&&!path.length){const id=destination;destination=null;if(Math.hypot(position.x-arrivals[id].x,position.z-arrivals[id].z)<1.35)onStation(id);}
    }
    container.dataset.position=`${position.x.toFixed(3)},${position.z.toFixed(3)}`;
    if(dirty){renderer.render(scene,camera);dirty=false;}
  }
  raf=requestAnimationFrame(frame);
  return {setInputEnabled(value){enabled=value;if(!value)clear();},resize,dispose(){cancelAnimationFrame(raf);observer.disconnect();listeners.forEach(fn=>fn());scene.traverse(o=>{o.geometry?.dispose();if(o.material?.map)o.material.map.dispose();});materials.forEach(m=>m.dispose());markers.forEach(m=>m.material.dispose());halo.material.dispose();renderer.dispose();renderer.domElement.remove();}};
}

import * as THREE from '../vendor/three.module.js';
import {STATIONS} from './content.js';
import {stepMovement,dampAngle,findRoute} from './movement.js';
export function createScene(container,{onStation,onUnavailable,reducedMotion}){
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}
  catch{onUnavailable('這個瀏覽器無法啟用立體場景。請使用下方站點繼續遊戲。');return {setInputEnabled(){},resize(){},dispose(){}};}
  let pixelRatio=Math.min(devicePixelRatio,1.25);
  renderer.setPixelRatio(pixelRatio);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.BasicShadowMap;
  renderer.setClearColor(0xe4e8dc,0);
  renderer.domElement.setAttribute('aria-label','辦公室場景：點擊編號站點前往');
  container.append(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-9,9,7,-7,.1,100);
  camera.position.set(13,15,17);camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight(0xfff7e8,0x73806c,2.6));
  const sunlight=new THREE.DirectionalLight(0xfff2d6,3.2);
  sunlight.position.set(-3,12,5);sunlight.castShadow=true;sunlight.shadow.mapSize.set(1024,1024);
  Object.assign(sunlight.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:45});
  sunlight.shadow.normalBias=.04;scene.add(sunlight);
  const materials=new Map();
  const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshLambertMaterial({color}));return materials.get(color);};
  function box(w,h,d,color,x,y,z,parent=scene){
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function cylinder(top,bottom,height,color,x,y,z,parent=scene){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,12),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  box(22,.35,14,0xd4c8ac,0,-.22,0);
  box(22,.06,14,0xe2dbca,0,0,0);
  for(let x=-10.5;x<11;x+=.65)box(.015,.012,13.9,0xcfc8b7,x,.036,0);
  box(22,2.7,.16,0xf5f0df,0,1.35,-6.95);
  box(.16,2.7,14,0xeae5d4,-10.95,1.35,0);
  box(22,.12,.24,0x87947c,0,2.75,-6.95);
  // 不同地坪界定空間；中央保留連續走道。
  box(4.2,.025,4.5,0xc4cebd,-8.2,.05,-3.8);
  box(4.3,.025,5,0xc5cecb,8.2,.05,-3.8);
  box(4.3,.025,4.7,0xc9bda4,8.2,.05,3.5);
  box(4.3,.025,4.7,0xd2c8b5,-8.2,.05,3.5);
  // 大窗與窗框，讓辦公室保留自然光的方向。
  for(const x of [-8,-5,-2,2,5,8]){
    box(2.4,1.65,.05,0xacc5c1,x,1.65,-6.84);
    box(2.45,.08,.09,0xfbf7e7,x,1.65,-6.77);
    box(.06,1.75,.09,0xfbf7e7,x,1.65,-6.76);
    box(2.5,.12,.35,0xb98c62,x,.79,-6.65);
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
    box(.07,.32,.07,0x374b40,x+.72,1.1,z-.2);
    box(.56,.45,.06,0x35473f,x+.72,1.4,z-.2).rotation.y=-.22;
    box(.48,.36,.02,0x769a99,x+.72,1.4,z-.155).rotation.y=-.22;
    box(.13,.04,.2,0x35473f,x+.51,1.01,z+.25);
    for(let i=0;i<3;i++)box(.49,.008,.012,0xaab4a5,x,1.024,z+.17+i*.06);
    box(.13,.6,.04,0x454b43,x+.8,.55,z-.4); // 桌下線槽
    box(.4,.57,.48,0x536254,x-.72,.32,z); // 主機
    chair(x,z+.95);obstacle(x,z,2.3,1.15);
  }
  function chair(x,z){
    cylinder(.05,.05,.5,0x384b41,x,.3,z);
    box(.62,.12,.6,0x607762,x,.58,z);
    box(.62,.6,.12,0x607762,x,.86,z+.28);
    box(.8,.06,.08,0x384b41,x,.1,z);box(.08,.06,.8,0x384b41,x,.1,z);
    for(const dx of [-.37,.37])for(const dz of [-.25,.25])cylinder(.065,.065,.08,0x303c35,x+dx,.08,z+dz);
    for(const dx of [-.4,.4]){box(.06,.3,.06,0x384b41,x+dx,.68,z);box(.12,.06,.38,0x384b41,x+dx,.85,z);}
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
    const limbs=[];
    for(const side of [-1,1]){
      const leg=new THREE.Group();leg.position.set(side*.12,.46,0);group.add(leg);
      box(.13,.33,.15,0x3b4b43,0,-.19,0,leg);box(.16,.09,.25,0x354139,0,-.38,.06,leg);limbs.push(leg);
    }
    for(const side of [-1,1]){
      const arm=new THREE.Group();arm.position.set(side*.29,.97,0);group.add(arm);
      box(.12,.4,.14,color,0,-.2,0,arm);cylinder(.067,.067,.1,0xe6b98c,0,-.43,0,arm);limbs.push(arm);
    }
    group.userData.limbs=limbs;
    return group;
  }
  desk(-3.7,2);desk(-.6,2);desk(3.5,2.3,0x9eac8d);
  const colleague=person(-.6,3,0x6c8583);colleague.rotation.y=Math.PI;
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
  // 玻璃隔間保留門口，家具與隔間共用碰撞矩形。
  const glass=new THREE.MeshStandardMaterial({color:0xa2c6c4,transparent:true,opacity:.18,roughness:.25,depthWrite:false});
  function partition(x,z,w,d){
    const pane=box(w,2.15,d,0xa2c6c4,x,1.1,z);pane.material=glass;pane.castShadow=false;
    box(w,.055,d+.025,0x64766b,x,2.2,z);
    for(const sign of [-1,1])box(.055,2.2,.055,0x64766b,x+sign*w/2,1.1,z+sign*d/2);
    obstacle(x,z,w,d);
  }
  partition(6,-4.6,.06,3.6);partition(8.4,-1.3,4.7,.06);
  partition(6,4.5,.06,3);partition(8.4,1,4.7,.06);
  // 接待櫃台、訪客識別證、印表機與信件格。
  box(2.7,1.15,.8,0x8a9c85,-8.5,.6,3.1);box(2.9,.1,.94,0xe8d8bd,-8.5,1.2,3.1);obstacle(-8.5,3.1,2.9,.94);
  box(.55,.05,.38,0xece8db,-8.5,1.28,3.15);box(.36,.32,.06,0x385747,-9.2,1.4,3.1);
  box(1.2,.7,.65,0xb7a085,-9.4,.35,5.4);box(.8,.5,.56,0xe5e7db,-9.4,.95,5.4);
  box(.6,.07,.26,0x42594d,-9.4,1.16,5.68);box(.4,.02,.4,0xfffcf5,-9.4,1.23,5.4);
  obstacle(-9.4,5.4,1.2,.65);
  // 機房的兩座機櫃：散熱格柵、狀態燈、走線與 UPS。
  const statusLights=[];
  for(const x of [7.4,9.4]){
    box(1.25,2.3,.9,0x3c4d48,x,1.2,-4.7);obstacle(x,-4.7,1.25,.9);
    for(let row=0;row<7;row++){
      box(1.1,.24,.07,0x60706b,x,.32+row*.29,-4.21);
      for(let j=0;j<5;j++)box(.025,.12,.025,0x2c3b36,x-.4+j*.12,.32+row*.29,-4.16);
      const light=box(.07,.045,.035,0xb2d2a1,x+.42,.32+row*.29,-4.15);light.userData.dynamic=true;statusLights.push(light);
    }
    box(1.4,.06,.2,0x7d8f7c,x,2.5,-4.7);
  }
  box(.7,.7,.7,0x55625d,9.7,.4,-2.3);obstacle(9.7,-2.3,.7,.7);
  // 休息區沙發、矮桌、杯子、書報與落地燈。
  box(2.6,.4,.9,0x7d9279,-8.4,.4,-4.8);box(2.6,.7,.22,0x7d9279,-8.4,.8,-5.25);
  for(const x of [-9.6,-7.2])box(.22,.65,1.1,0x6e846b,x,.65,-4.8);
  for(const x of [-9.1,-8.3,-7.5])box(.7,.12,.73,0x9bae91,x,.65,-4.75);
  obstacle(-8.4,-4.9,2.8,1.2);
  box(1.6,.12,.85,0xb98c62,-8.2,.55,-2.9);box(.12,.5,.6,0x61745c,-8.7,.28,-2.9);box(.12,.5,.6,0x61745c,-7.7,.28,-2.9);obstacle(-8.2,-2.9,1.6,.85);
  box(.5,.04,.4,0xf4e5c8,-8.4,.65,-2.9);cylinder(.08,.06,.16,0xe9e9d8,-7.8,.68,-2.9);
  cylinder(.25,.25,.06,0x53665a,-10,.09,-3.8);cylinder(.035,.035,1.8,0x53665a,-10,1,-3.8);cylinder(.27,.43,.4,0xf2d9ad,-10,1.9,-3.8);
  desk(8.3,4.4,0xa78a68);plant(10.1,5.9,.9);plant(-10,1,1.1);
  box(2,.7,.4,0x9e8a6b,8.5,.4,6.3);obstacle(8.5,6.3,2,.4);
  for(let i=0;i<9;i++)box(.13,.4,.3,i%2?0x6c8583:0xbd714e,7.8+i*.17,.95,6.3);
  // 額外座位與會議投影設備，讓空間具有真正辦公室的密度。
  desk(-3.6,5.3);desk(-.5,5.3);desk(3,5.3,0x9eac8d);
  box(2.2,1.2,.09,0xeceee3,3.8,1.9,-5.8);box(1.9,.025,.02,0x78978b,3.8,2.05,-5.73);
  box(.55,.2,.4,0xf0e9d7,3.6,1.1,-2.5);box(.15,.12,.04,0x50695d,3.6,1.1,-2.23);
  for(const x of [2.5,4.5]){box(.4,.035,.28,0xeee9db,x,1,-2.4);cylinder(.06,.06,.2,0x9ebbb8,x+.3,1.08,-2.4);}
  partition(1.65,-4.85,.06,1);partition(3.8,-5.95,4.3,.06);
  // 咖啡機壓桿、出水口、冰箱與杯架。
  box(.16,.04,.19,0xc8cbbd,-4.9,1.26,-2.65);box(.035,.15,.035,0xa6b1a1,-4.9,1.34,-2.6);
  box(.72,1.8,.72,0xe1e5d8,-5.6,.92,-5.5);box(.025,.6,.06,0x73806c,-5.32,1,-5.11);obstacle(-5.6,-5.5,.72,.72);
  const steam=new THREE.Group();steam.position.set(-4.27,1.4,-2.82);scene.add(steam);
  for(let i=0;i<3;i++){const puff=new THREE.Mesh(new THREE.SphereGeometry(.045,6,5),new THREE.MeshBasicMaterial({color:0xfffcf5,transparent:true,opacity:.35}));puff.position.y=i*.12;steam.add(puff);}
  // 合併靜態家具的相同材質，避免場景擴建後每支桌腳都增加一次繪圖呼叫。
  const batches=new Map();
  for(const mesh of [...scene.children]){
    if(!mesh.isMesh||mesh.userData.dynamic||mesh.material.transparent)continue;
    mesh.updateMatrix();const geometry=(mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone()).applyMatrix4(mesh.matrix);
    if(!batches.has(mesh.material))batches.set(mesh.material,[]);
    batches.get(mesh.material).push(geometry);scene.remove(mesh);mesh.geometry.dispose();
  }
  for(const [material,geometries] of batches){
    const merged=new THREE.BufferGeometry();
    for(const name of ['position','normal','uv']){
      const length=geometries.reduce((sum,g)=>sum+g.getAttribute(name).array.length,0),values=new Float32Array(length);let offset=0;
      for(const g of geometries){const a=g.getAttribute(name).array;values.set(a,offset);offset+=a.length;}
      merged.setAttribute(name,new THREE.BufferAttribute(values,name==='uv'?2:3));
    }
    const mesh=new THREE.Mesh(merged,material);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);geometries.forEach(g=>g.dispose());
  }
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const player=person(0,.1);
  player.traverse(o=>{if(o.isMesh)o.castShadow=false;});
  const halo=new THREE.Mesh(new THREE.RingGeometry(.28,.36,28),new THREE.MeshBasicMaterial({color:0xad5142,side:THREE.DoubleSide}));
  halo.rotation.x=-Math.PI/2;halo.position.y=.06;player.add(halo);
  const targets=[],markers=[];
  const arrivals={desk:{x:-3.7,z:.5},whiteboard:{x:0,z:-2.8},meeting:{x:3.6,z:-.3},test:{x:3.5,z:.8},pantry:{x:-4.4,z:-1.6},reception:{x:-8.4,z:1.8},server:{x:8.4,z:-3.2},lounge:{x:-8.4,z:-3.8},manager:{x:8.4,z:3.2}};
  for(const st of STATIONS){
    const c=document.createElement('canvas');c.width=256;c.height=96;
    const ctx=c.getContext('2d');ctx.fillStyle='#fffcf5';ctx.beginPath();ctx.roundRect(4,5,248,76,14);ctx.fill();
    ctx.strokeStyle='#aab5a1';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#385747';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText(`${st.number}  ${st.name}`,128,54);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));
    sprite.position.set(st.x,2.25,st.z);sprite.scale.set(2.3,.86,1);sprite.userData.stationId=st.id;scene.add(sprite);markers.push(sprite);targets.push(sprite);
  }
  let enabled=false,paused=true,lost=false,dirty=true,position={x:0,z:.1},keys=new Set(),path=[],destination=null,last=performance.now(),raf;
  let zoom=1,actualZoom=1,gait=0,walkBlend=0,actionTime=0,actionStation=null,scripted=false,animationClock=0;
  let frameCost=16,sampleCount=0;
  const focus=new THREE.Vector3(),cameraTarget=new THREE.Vector3();
  const bounds={minX:-10.4,maxX:10.4,minZ:-6.35,maxZ:6.35};
  const listeners=[];
  const listen=(el,type,fn,options)=>{el.addEventListener(type,fn,options);listeners.push(()=>el.removeEventListener(type,fn,options));};
  const clear=()=>{keys.clear();path=[];destination=null;scripted=false;};
  const route=to=>findRoute(position,to,bounds,obstacles);
  listen(window,'keydown',e=>{
    if(!enabled||e.repeat||e.target.matches?.('input,select,textarea,button'))return;
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
    const aspect=w/h,half=Math.max(10.8,16.2/aspect);
    camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;
    camera.updateProjectionMatrix();renderer.setSize(w,h,false);dirty=true;
  }
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  const zoomTo=value=>{zoom=Math.max(1,Math.min(2,value));container.dataset.zoom=zoom.toFixed(2);dirty=true;};
  document.querySelectorAll('[data-camera]').forEach(button=>{button.disabled=false;listen(button,'click',()=>{const command=button.dataset.camera;zoomTo(command==='in'?zoom+.25:command==='out'?zoom-.25:1);});});
  zoomTo(1);
  function frame(now){
    raf=requestAnimationFrame(frame);const elapsed=now-last,delta=Math.min(.05,elapsed/1000);last=now;
    if(lost||document.hidden)return;
    if(!paused&&!reducedMotion){
      frameCost=frameCost*.96+elapsed*.04;
      if(++sampleCount>=90){sampleCount=0;if(frameCost>38&&pixelRatio>.65){pixelRatio=Math.max(.65,pixelRatio*.8);renderer.setPixelRatio(pixelRatio);resize();}}
    }
    let moving=false;
    if(!paused)animationClock+=delta;
    if(!paused&&(enabled||scripted)){
      let input={x:(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),z:(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)};
      let moveDelta=delta;
      while(path.length&&Math.hypot(path[0].x-position.x,path[0].z-position.z)<.03)path.shift();
      if(path.length){const next=path[0],dx=next.x-position.x,dz=next.z-position.z,distance=Math.hypot(dx,dz);input={x:dx,z:dz};moveDelta=Math.min(delta,distance/3.2);}
      const next=stepMovement(position,input,moveDelta,bounds,obstacles);
      moving=Math.hypot(next.x-position.x,next.z-position.z)>.001;
      if(moving)player.rotation.y=reducedMotion?Math.atan2(input.x,input.z):dampAngle(player.rotation.y,Math.atan2(input.x,input.z),delta);
      position=next;
      if(destination&&!path.length){const id=destination;destination=null;if(Math.hypot(position.x-arrivals[id].x,position.z-arrivals[id].z)<1.35){if(scripted){scripted=false;actionStation=id;actionTime=2.2;}else onStation(id);}else scripted=false;}
    }
    if(!paused){
      walkBlend+=(Number(moving)-walkBlend)*(1-Math.exp(-14*delta));gait+=delta*11;
      if(actionTime>0)actionTime=Math.max(0,actionTime-delta);
      const limbs=player.userData.limbs,work=actionTime>0&&!moving;
      for(let i=0;i<4;i++){
        const stride=reducedMotion?0:Math.sin(gait+(i%2)*Math.PI)*.48*walkBlend;
        const resting=actionStation==='pantry'||actionStation==='lounge';
        const pose=work&&i>=2?(resting?(i===2?-1.8:-.25):-.9)+(reducedMotion?0:Math.sin(animationClock*(resting?3:14)+i)*.09):stride*(i<2?1:-.75);
        limbs[i].rotation.x+=(pose-limbs[i].rotation.x)*(1-Math.exp(-16*delta));
      }
      if(work)player.rotation.y=dampAngle(player.rotation.y,Math.PI,delta);
      player.position.set(position.x,reducedMotion?0:Math.abs(Math.sin(gait))*.025*walkBlend,position.z);
      if(!reducedMotion){
        colleague.userData.limbs[2].rotation.x=-1+Math.sin(animationClock*8)*.06;
        colleague.userData.limbs[3].rotation.x=-1+Math.sin(animationClock*8+2)*.06;
        steam.children.forEach((p,i)=>{p.position.y=(animationClock*.14+i*.12)%.45;p.material.opacity=.35*(1-p.position.y/.45);});
        statusLights.forEach((l,i)=>l.scale.x=.8+.2*Math.sin(animationClock*2+i));
      }
    }
    actualZoom=reducedMotion?zoom:THREE.MathUtils.damp(actualZoom,zoom,10,delta);
    cameraTarget.set(zoom>1?position.x*.8:0,0,zoom>1?position.z*.8:0);
    if(reducedMotion)focus.copy(cameraTarget);else focus.lerp(cameraTarget,1-Math.exp(-5*delta));
    camera.position.set(focus.x+13,15,focus.z+17);camera.lookAt(focus);camera.zoom=actualZoom;camera.updateProjectionMatrix();
    container.dataset.position=`${position.x.toFixed(3)},${position.z.toFixed(3)}`;
    if(dirty||(!paused&&!reducedMotion)||moving||Math.abs(actualZoom-zoom)>.001||focus.distanceTo(cameraTarget)>.001){renderer.render(scene,camera);dirty=false;}
  }
  raf=requestAnimationFrame(frame);
  return {setInputEnabled(value){enabled=value;if(!value){keys.clear();if(!scripted){path=[];destination=null;}}},setPaused(value){paused=value;if(value)clear();dirty=true;},playAction(id){if(!arrivals[id])return;clear();actionStation=id;path=route(arrivals[id]);destination=id;scripted=true;dirty=true;},resize,dispose(){cancelAnimationFrame(raf);observer.disconnect();listeners.forEach(fn=>fn());scene.traverse(o=>{o.geometry?.dispose();if(o.material?.map)o.material.map.dispose();});materials.forEach(m=>m.dispose());markers.forEach(m=>m.material.dispose());steam.children.forEach(p=>p.material.dispose());glass.dispose();halo.material.dispose();renderer.dispose();renderer.domElement.remove();}};
}

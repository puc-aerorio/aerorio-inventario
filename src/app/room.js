import * as THREE from 'three';
import { F, FADE, S, ray } from './state.js';
import { box, camera, controls, labG, lamps, mesh, scene } from './scene.js';

/* ================= Lab 01 (Manufatura) e Lab Drone (Eletrônica): geometria da sala real =================
   Medidas da maquete (metros): x ao longo da fachada, z da fachada (z=0) até a porta (z=7).
   OFF leva a maquete para o mundo do app. */
export const OFF=new THREE.Vector3(-3.6,0,-3.5);
export const LH=2.6,LF=2.25,DG=.15;              // pé-direito na entrada, altura da fachada/recuo, degrau
export const FUNDO=[[.35,5.2,0,1.75],[1.0,5.2,1.75,2.8]];
export const CALCOS=[{r:[2.525,3.325,2.8,6.404],top:DG},{r:[0,.67,5.22,6.83],top:DG},{r:[0,.67,3.65,4.95],top:DG}];
export const inRr=(r,x,z)=>x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3];
export function fyM(x,z){for(const c of CALCOS)if(inRr(c.r,x,z))return c.top;if(FUNDO.some(r=>inRr(r,x,z)))return -DG;return 0;}
export const fyW=(x,z)=>fyM(x-OFF.x,z-OFF.z);
export const tetoM=z=>z<.6?LF:(z<3.0?LF+(z-.6)/2.4*(LH-LF):LH);

/* helpers por extremos (coordenadas da maquete, dentro de um grupo deslocado por OFF) */
export function X(g,x0,x1,y0,y1,z0,z1,hex,role='clay',o){return box(g,Math.abs(x1-x0),Math.abs(y1-y0),Math.abs(z1-z0),(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,hex,role,o);}
export function trans(m,op,o={}){m.userData.op=op;if(o.opA!=null)m.userData.opA=o.opA;m.material.transparent=true;m.material.opacity=op;m.material.depthWrite=false;m.castShadow=false;return m;}
export function vidro(m,op=.22,col='#b9cad6'){const p=new THREE.MeshPhysicalMaterial({color:col,roughness:.04,metalness:.15,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:2.2,transparent:true,opacity:op,depthWrite:false});
 m.material.dispose();m.material=p;m.userData.base=new THREE.Color(col);m.userData.role='glass2';m.userData.op=op;m.castShadow=false;return m;}
export function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
export function textTex(lines,w,h,o={}){return canvasTex(w,h,(x)=>{x.fillStyle=o.bg||'#fff';x.fillRect(0,0,w,h);x.fillStyle=o.fg||'#111';x.textAlign='center';x.textBaseline='middle';
 const L=Array.isArray(lines)?lines:[lines];const fs=o.fs||Math.floor(h/(L.length+1));x.font=`${o.w||600} ${fs}px Barlow, Arial, sans-serif`;L.forEach((l,i)=>x.fillText(l,w/2,h/2+(i-(L.length-1)/2)*fs*1.15));if(o.draw)o.draw(x,w,h);});}
export function texPlane(g,w,h,tex,x,y,z,ry=0){const m=mesh(g,new THREE.PlaneGeometry(w,h),'#ffffff','paint',x,y,z,{cast:false,r:.6});m.material.map=tex;m.rotation.y=ry;return m;}
export const etqTex=t=>textTex(t,128,64,{bg:'#f7f5ee',fg:'#222',fs:30,w:700});
export function tomadaM(g,x,y,z,ry=0){const t=new THREE.Group();t.position.set(x,y,z);t.rotation.y=ry;g.add(t);X(t,-.2,.2,-.05,.05,0,.05,'#c3c8cb','color',{m:.55,r:.35});
 for(let i=0;i<8;i++){const c=mesh(t,new THREE.CylinderGeometry(.012,.012,.01,12),'#222','color',-.165+i*.047,0,.05);c.rotation.x=Math.PI/2;}X(t,-.6,-.2,-.015,.015,0,.03,'#1d2226','color');return t;}
/* tira faces voltadas para cima: de cima, a estrutura aparece em corte */
export function semTopo(geo){const g=geo.index?geo.toNonIndexed():geo;const p=g.attributes.position,keep=[];const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),t=new THREE.Vector3();
 for(let i=0;i<p.count;i+=3){a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);n.subVectors(c,b).cross(t.subVectors(a,b)).normalize();if(n.y<.5)keep.push(i);}
 const out=new THREE.BufferGeometry();for(const k of['position','normal','uv']){const at=g.attributes[k];if(!at)continue;const arr=new Float32Array(keep.length*3*at.itemSize);keep.forEach((i,j)=>{for(let v=0;v<3;v++)for(let q=0;q<at.itemSize;q++)arr[(j*3+v)*at.itemSize+q]=at.array[(i+v)*at.itemSize+q];});out.setAttribute(k,new THREE.BufferAttribute(arr,at.itemSize));}
 out.computeVertexNormals();return out;}
/* lajota 33 cm com rejunte escuro */
export const TILE=canvasTex(256,256,(x)=>{x.fillStyle='#f2f3f1';x.fillRect(0,0,256,256);for(let i=0;i<300;i++){x.fillStyle=`rgba(120,130,135,${Math.random()*.04})`;x.fillRect(Math.random()*256,Math.random()*256,2+Math.random()*6,2+Math.random()*6);}x.fillStyle='#8f969b';x.fillRect(0,0,256,5);x.fillRect(0,0,5,256);});
TILE.wrapS=TILE.wrapT=THREE.RepeatWrapping;
export function laje(g,x0,x1,z0,z1,top,lab,th=.14){const m=X(g,x0,x1,top-th,top,z0,z1,'#ffffff','tile',{cast:false});const t=TILE.clone();t.needsUpdate=true;t.repeat.set((x1-x0)/.33,(z1-z0)/.33);t.offset.set(x0/.33,z0/.33);
 const side=new THREE.MeshStandardMaterial({color:'#c4c9cc',roughness:.8});m.material=[side,side,new THREE.MeshStandardMaterial({map:t,roughness:.55}),side,side,side];m.userData.base=new THREE.Color('#ffffff');m.userData.multi=true;m.userData.labFloor=lab;return m;}

/* ---------- fachada: módulos quadrados do chão ao teto, baixo fosco, cima transparente com puxador ---------- */
export function fachada(g,x0,x1,yb,yt,n){const fr='#f7f7f5',bw=(x1-x0)/n,rh=(yt-yb-.06)/2;
 for(let i=0;i<n;i++){const a=x0+i*bw;trans(X(g,a+.04,a+bw-.04,yb+.04,yb+rh,-.012,.012,'#cfcbc2','glass2',{cast:false}),.95);
  vidro(X(g,a+.04,a+bw-.04,yb+rh+.06,yt-.04,-.006,.006,'#b9cad6','glass2',{cast:false}),.2);
  X(g,a+bw/2-.07,a+bw/2+.07,yb+rh+.09,yb+rh+.12,.006,.03,'#e6e6e3','paint');X(g,a+bw/2-.02,a+bw/2+.02,yb+rh+.075,yb+rh+.13,.004,.02,'#bfc3c5','paint');}
 for(let i=0;i<=n;i++){const a=x0+i*bw;X(g,a-.035,a+.035,yb,yt,-.04,.04,fr,'paint');X(g,a-.012,a+.012,yb,yt,.04,.06,fr,'paint');}
 for(const y of[yb+.02,yb+rh+.03,yt-.02]){X(g,x0,x1,y-.03,y+.03,-.04,.04,fr,'paint');X(g,x0,x1,y-.012,y+.012,.04,.06,fr,'paint');}}


/* ================= ocultadores: paredes, colunas, coifa, ar-condicionado, teto =================
   modos: 'wall' e 'down' recolhem para o chão; 'up' recolhe para o teto; 'fade' fica translúcido; 'keep' (parede curva da direita e faixa) só fica translúcido no zoom. */
export const OCC=[];
export function occ(parent,mode,o={}){const g=new THREE.Group();parent.add(g);const r={g,mode,link:o.link||null,lab:o.lab||'man',n:o.n?new THREE.Vector2(o.n[0],o.n[1]):null,shared:!!o.shared,s:1,blk:false,items:[],box:null,meshes:[],fadeOp:o.fadeOp??1};if(o.top!=null){g.position.y=o.top;}OCC.push(r);return r;}
export function prisma(g,pts,y0,y1,lab){// laje com contorno qualquer (pontos x,z da maquete), topo com lajota
 const sh=new THREE.Shape(pts.map(([x,z])=>new THREE.Vector2(x,-z)));const geo=new THREE.ExtrudeGeometry(sh,{depth:y1-y0,bevelEnabled:false});geo.rotateX(-Math.PI/2);geo.translate(0,y0,0);
 const t=TILE.clone();t.needsUpdate=true;t.repeat.set(1/.33,1/.33);const m=mesh(g,geo,'#ffffff','tile',0,0,0,{cast:false});const side=new THREE.MeshStandardMaterial({color:'#c4c9cc',roughness:.8});
 m.material=[new THREE.MeshStandardMaterial({map:t,roughness:.55}),side];m.userData.multi=true;m.userData.labFloor=lab;return m;}
export const ROOM={estrutura:[],ceil:[]};
export function construirSalas(){
 const man=new THREE.Group();man.position.copy(OFF);labG.man.add(man);
 const ele=new THREE.Group();ele.position.copy(OFF);labG.ele.add(ele);
 const sharedG=new THREE.Group();sharedG.position.copy(OFF);scene.add(sharedG); // paredes entre os dois labs: não apagam com a Manufatura
 /* pisos: nível da porta, fundo rebaixado em L, calços (mesa central, PC, lixo) */
 for(const [x0,x1,z0,z1] of[[0,.35,0,1.75],[0,1.0,1.75,7],[1.0,5.2,3.5,7],[5.2,7.2,0,4.15]])laje(man,x0,x1,z0,z1,0,'man');
 for(const r of FUNDO)laje(man,r[0],r[1],r[2],r[3],-DG,'man');
 for(const c of CALCOS){const r=c.r;laje(man,r[0],r[1],r[2],r[3],c.top,'man',c.top+DG+.02);}
 // rampa da esquerda: retângulo até o calço da mesa; da direita: borda diagonal até a ponta do degrau (coluna)
 {const w=2.525-1.0,geo=new THREE.BoxGeometry(w,DG,.7);const p=geo.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>0&&p.getZ(i)<0)p.setY(i,-DG/2+.002);geo.computeVertexNormals();
  const m=mesh(man,geo,'#8c9295','env',(1.0+2.525)/2,-DG/2,3.15,{cast:false});m.userData.labFloor='man';}
 {const w=5.2-3.325,geo=new THREE.BoxGeometry(w,DG,.7);const p=geo.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>0&&p.getZ(i)<0)p.setY(i,-DG/2+.002);geo.computeVertexNormals();
  const m=mesh(man,geo,'#8c9295','env',(3.325+5.2)/2,-DG/2,3.15,{cast:false});m.userData.labFloor='man';}
 /* parede esquerda + parede curva da esquerda (acoplada) + placas: saem juntas */
 const arco=(z0,z1)=>{const a=new THREE.Shape();a.moveTo(z0,-DG);for(let i=1;i<=22;i++){const t=i/22;a.lineTo(z0+t*(z1-z0),Math.max(-DG,LH*Math.pow(t,.55)));}a.lineTo(0,LH);a.lineTo(0,-DG);a.closePath();return a;};
 const ext=(shape,x0,x1)=>{const g=new THREE.ExtrudeGeometry(shape,{depth:x1-x0,bevelEnabled:false,curveSegments:4});g.rotateY(-Math.PI/2);g.translate(x1,0,0);return g;};
 const oEsq=occ(man,'wall',{n:[-1,0]});{const o=oEsq;const g=o.g;X(g,-.12,0,-DG,LH,0,7,'#efebe5','wall');mesh(g,ext(arco(1.1,3.3),0,.35),'#efebe5','wall');
  texPlane(g,.32,.13,textTex(['AERO RIO','COMPOSITES','LAB'],256,104,{bg:'#202326',fg:'#e8e8e8',fs:26,w:700}),.005,1.45,2.75,Math.PI/2);
  for(const [z,y] of[[5.55,1.82],[5.75,1.82],[5.95,1.82],[5.75,1.56]]){X(g,0,.015,y-.11,y+.11,z-.08,z+.08,'#1f2a38','color');texPlane(g,.13,.19,textTex(['','1st Place'],64,96,{bg:'#f4f7fb',fg:'#2b5aa8',fs:12,draw:(x)=>{x.fillStyle='#2b6cc4';x.fillRect(0,0,64,22);}}),.017,y,z,Math.PI/2);}
  X(g,0,.02,1.62,1.9,5.05,5.25,'#5a3420','color');tomadaM(g,.02,1.15,2.35,Math.PI/2);}
 /* divisória de vidro do corredor + porta + tela de projeção */
 {const o=occ(man,'wall',{n:[0,1]});const g=o.g;
  X(g,0,4.0,0,1.0,6.94,7.06,'#8e979d','wall');X(g,0,4.0,2.45,LH,6.94,7.06,'#d5d9db','wall');vidro(X(g,0,4.0,1.0,2.45,6.99,7.01,'#a9bcc8','glass2',{cast:false}),.16,'#a9bcc8');
  for(let a=0;a<=4.001;a+=1.0)X(g,a-.025,a+.025,0,2.45,6.96,7.04,'#1c2125','color');X(g,0,4,.98,1.03,6.96,7.04,'#1c2125','color');X(g,0,4,2.42,2.47,6.96,7.04,'#1c2125','color');
  X(g,4.0,4.06,0,2.3,6.94,7.06,'#1c2125','color');X(g,4.84,4.9,0,2.3,6.94,7.06,'#1c2125','color');X(g,4.0,4.9,2.25,LH,6.94,7.06,'#efebe5','wall');X(g,4.06,4.84,0,2.22,6.98,7.02,'#cfd4d6','clay');X(g,4.9,5.32,0,LH,6.94,7.06,'#efebe5','wall');
  X(g,2.025,3.825,2.33,2.41,6.88,6.94,'#ececea','paint');mesh(g,new THREE.CylinderGeometry(.01,.01,.22,8),'#222','color',2.925,2.2,6.9);}
 /* parede do quadro (alinhada à face externa da parede do fundo) */
 {const o=occ(sharedG,'wall',{n:[1,0],shared:1});const g=o.g;X(g,5.2,5.32,0,LH,4.15,7.0,'#efebe5','wall');const t=textTex(['','Reunião quinta 18h','Não deixar a serra ligada'],600,320,{bg:'#fbfbfa',fg:'#1f4c96',fs:34,w:500});
  X(g,5.13,5.2,.95,2.12,4.45,6.75,'#b9bec1','color',{m:.5});texPlane(g,2.24,1.13,t,5.128,1.535,5.6,-Math.PI/2);X(g,5.07,5.2,.92,.95,4.6,6.6,'#b9bec1','color',{m:.5});}
 {const o=occ(sharedG,'wall',{n:[0,1],shared:1});X(o.g,5.2,7.32,0,LH,4.15,4.27,'#efebe5','wall');}
 {const o=occ(sharedG,'wall',{n:[1,0],shared:1});X(o.g,7.2,7.32,0,LF,0,4.27,'#efebe5','wall');}
 /* fachada contínua: sai quando a câmera olha de fora */
 const oFach=occ(man,'wall',{n:[0,-1]});{const o=oFach;const g=new THREE.Group();g.position.z=-.02;o.g.add(g);fachada(g,.35,4.85,-DG,LF,4);fachada(g,5.2,7.2,0,LF,2);}
 {const o=occ(ele,'wall',{n:[0,-1],lab:'ele'});const g=new THREE.Group();g.position.z=-.02;o.g.add(g);fachada(g,7.2,10,0,LF,3);}
 /* estrutura que não sai: parede curva da direita (divide o fundo do recuo) e a faixa inclinada; translúcidas no zoom quando atrapalham */
 {const o=occ(man,'keep');const es=o.g;
  const m1=mesh(es,ext(arco(1.5,3.7),4.85,5.2),'#efebe5','wall');
  const sb=new THREE.Shape();sb.moveTo(0,LF);sb.lineTo(.6,LF);sb.lineTo(3.0,LH);sb.lineTo(0,LH);sb.closePath();mesh(es,semTopo(ext(sb,.35,4.85)),'#efebe5','wall');
  texPlane(es,.62,.46,canvasTex(310,230,(x)=>{x.fillStyle='#ece8de';x.fillRect(0,0,310,230);x.fillStyle='#2b3c66';x.font='700 22px Arial';x.fillText('F/A-18F',60,24);x.strokeStyle='#4a5a6a';x.lineWidth=2;x.beginPath();x.moveTo(40,170);x.lineTo(160,90);x.lineTo(280,120);x.lineTo(170,150);x.closePath();x.stroke();for(let i=0;i<40;i++){x.fillStyle='rgba(60,60,60,.35)';x.fillRect(8,40+i*4.5,40,2);}}),4.845,2.0,1.75,-Math.PI/2);}
 /* colunas pretas */
 for(const [x,z] of[[.85,3.6],[.85,4.95],[.85,6.9],[5.255,2.855]]){const o=occ(man,'down',{link:x<1?oEsq:null});X(o.g,x-.055,x+.055,fyM(x,z),LH,z-.055,z+.055,'#1d2226','color',{r:.5,m:.3});}
 /* luminárias: translúcidas de dia, acesas no noturno */
 {const o=occ(man,'fade',{fadeOp:.2});for(const [x,z] of[[2.0,2.5],[3.85,2.5],[2.0,4.4],[3.85,4.4],[2.0,6.1],[3.85,6.1],[6.3,1.4],[6.3,3.5]]){const l=new THREE.Group();l.position.set(x,(x>5.2?LF:tetoM(z))-.02,z);o.g.add(l);
  trans(X(l,-.64,.64,-.03,0,-.07,.07,'#d9dcdd','clay'),.2,{opA:.55});for(const zz of[-.035,.035]){const t=mesh(l,new THREE.CylinderGeometry(.014,.014,1.2,10),'#ffffff','bulb',0,-.045,zz,{cast:false});t.rotation.z=Math.PI/2;trans(t,.25,{opA:.9});}
  const pl=new THREE.PointLight(0xfff8f0,0,9,1.3);pl.position.set(OFF.x+x,l.position.y-.25,OFF.z+z);scene.add(pl);lamps.push({pl,g:new THREE.Group(),I:2.4});}}
 /* projetor (translúcido, braço mais baixo) */
 {const o=occ(man,'fade',{fadeOp:.45});const g=o.g,x=2.925,z=3.95;mesh(g,new THREE.CylinderGeometry(.02,.02,LH-2.3,10),'#c9cdd0','clay',x,(LH+2.3)/2,z,{m:.6});X(g,x-.04,x+.04,2.32,2.4,z-.03,z+.03,'#e9ebea','clay');
  X(g,x-.16,x+.16,2.18,2.3,z-.14,z+.14,'#f5f5f3','clay');const l=mesh(g,new THREE.CylinderGeometry(.035,.035,.02,16),'#1d2a3a','color',x+.07,2.24,z+.14);l.rotation.x=Math.PI/2;}
 /* ar-condicionado: recolhe para cima */
 {const o=occ(man,'up',{top:LF,link:oFach});const g=o.g,x=2.6,y0=1.98-LF,y1=2.24-LF,z0=.06,z1=.72;mesh(g,new THREE.BoxGeometry(1.6,y1-y0,z1-z0),'#f7f7f5','clay',x,(y0+y1)/2,(z0+z1)/2,{r:.35});
  for(const s of[-1,1])X(g,x+s*.8-.03,x+s*.8+.03,y0+.01,y1-.01,z0+.02,z1-.02,'#dcdfe0','clay');const v=X(g,x-.7,x+.7,y0+.02,y0+.05,z1-.06,z1+.005,'#c9cdcf','clay');v.rotation.x=-.35;
  for(let i=0;i<9;i++)X(g,x-.7,x+.7,y0-.005,y0-.002,z0+.14+i*.035,z0+.15+i*.035,'#c3c8ca','clay',{cast:false});X(g,x+.58,x+.6,y0+.11,y0+.13,z1,z1+.004,'#3ad16b','paint');
  mesh(g,new THREE.CylinderGeometry(.022,.022,LF,10),'#e8e2d4','clay',x+.86,-LF/2-DG/2,.12);}
 /* coifa e cano de gás: recolhem para cima */
 {const o=occ(man,'up',{top:LH,link:oEsq});const g=new THREE.Group();g.position.set(.42,1.95-LH,4.3);g.rotation.y=Math.PI/2;o.g.add(g);const geo=new THREE.BoxGeometry(1,.36,1);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const top=p.getY(i)>0;p.setX(i,p.getX(i)*(top?.95:1.25));p.setZ(i,p.getZ(i)*(top?.42:.62));}geo.computeVertexNormals();
  mesh(g,geo,'#1b1e21','color',0,.18,0,{r:.5,m:.3});X(g,-.45,.45,.36,.62,-.2,-.05,'#1b1e21','color',{m:.3});mesh(o.g,new THREE.CylinderGeometry(.012,.012,1.9,8),'#d8b21f','color',.07,1.95-LH,5.0);}
 /* Lab Drone (Eletrônica): piso em L e paredes na mesma altura da parede do quadro */
 for(const [x0,x1,z0,z1] of[[7.32,10,0,4.27],[5.32,10,4.27,7]])laje(ele,x0,x1,z0,z1,0,'ele');
 {const o=occ(ele,'wall',{n:[1,0],lab:'ele'});X(o.g,10,10.12,0,LH,0,7.06,'#efebe5','wall');}
 {const o=occ(ele,'wall',{n:[0,1],lab:'ele'});X(o.g,5.32,10.12,0,LH,6.94,7.06,'#efebe5','wall');}
 scene.updateMatrixWorld(true);
 for(const o of OCC){o.box=new THREE.Box3().setFromObject(o.g);o.g.traverse(m=>{if(m.isMesh){o.meshes.push(m);if(o.shared){m.userData.shared=true;m.userData.lab='man';}if(o.mode==='fade'||o.mode==='keep'){m.material.transparent=true;}}});}
}
construirSalas();

/* ---------- modo de visão e cálculo do que atrapalha ---------- */
export function viewMode(){if(S.stack.length||S.loc||S.vist||S.oc||(S.carry&&S.carry.stage==='confirm'))return 'zoom';return S.lab?'lab':'over';}
export const occRay=new THREE.Ray(),tmpV=new THREE.Vector3(),hitV=new THREE.Vector3();export let occT=0;export const OCC_SOLID=[];
export function alvosVista(mode){const t=[];if(mode==='zoom'){const fc=S.focusT||controls.target;t.push(fc.clone());const f=S.stack[0]?.f||S.loc?.f||(S.carry&&S.carry.target?.f);if(f){t.push(f.center.clone(),f.anchor.clone());}}
 else if(mode==='lab'){for(const f of F)if(f.d.lab===S.lab&&f.bb){const b=f.bb;t.push(f.center.clone(),f.anchor.clone());for(const x of[b.min.x,b.max.x])for(const z of[b.min.z,b.max.z])t.push(new THREE.Vector3(x,(b.min.y+b.max.y)/2,z));}}return t;}
export function occTick(dt){const mode=viewMode();
 if(++occT%4===0){const v=new THREE.Vector2(camera.position.x-controls.target.x,camera.position.z-controls.target.z).normalize();const alvos=alvosVista(mode);const cam=camera.position;
  for(const o of OCC){let b=false;
   if(mode==='over'){if(o.mode==='wall'&&o.n)b=o.n.dot(v)>.2;}
   else if(FADE===1&&S.lab&&o.lab!==S.lab&&!o.shared){b=o.mode==='wall'||o.mode==='down'||o.mode==='up';}
   else if(o.lab===S.lab||o.shared||mode==='zoom'){if(o.mode==='keep'&&mode!=='zoom'){b=false;}else for(const t of alvos){if(o.box.containsPoint(t))continue;occRay.origin.copy(cam);occRay.direction.copy(tmpV.subVectors(t,cam).normalize());const h=occRay.intersectBox(o.box,hitV);if(h&&cam.distanceTo(hitV)<cam.distanceTo(t)-.12){b=true;break;}}}
   o.blk=b;}
  for(const o of OCC)if(o.link&&o.link.blk&&mode!=='over')o.blk=true;
  OCC_SOLID.length=0;for(const o of OCC)if((o.mode==='wall'||o.mode==='down'||o.mode==='up'||o.mode==='keep')&&o.s>.6)OCC_SOLID.push(...o.meshes);}
 const faded=S.lab?(lab=>lab!==S.lab):(()=>false);const k=Math.min(1,dt*.01);
 for(const o of OCC){
  if(o.mode==='wall'||o.mode==='down'||o.mode==='up'){const t=o.blk?.04:1;o.s+=(t-o.s)*k;o.g.scale.y=Math.max(.03,o.s);o.g.visible=o.s>.05||o.mode==='wall';}
  else{const t=o.mode==='keep'?(o.blk?.1:1):(o.blk?.06:(mode==='zoom'?.6:1));o.s+=(t-o.s)*k;const dim=faded(o.lab)?(FADE===1?.25:1):1;
   for(const m of o.meshes){const base=(S.style==='a'&&m.userData.opA!=null)?m.userData.opA:(m.userData.op??o.fadeOp);const op=(o.mode==='fade'?base:1)*o.s*dim;m.material.opacity=op;m.material.transparent=op<.999;m.material.depthWrite=op>.95;m.castShadow=false;}}}}
export function roomTick(dt){occTick(dt);}
/* não clicar através de paredes */
export function atrasDeParede(dist){if(!OCC_SOLID.length)return false;const h=ray.intersectObjects(OCC_SOLID,false)[0];return h&&h.distance<dist-.02;}



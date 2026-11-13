import * as THREE from 'three';
import { F, app, halos, pick } from './state.js';
import { CARD, CL, IT, M, NIVEIS, OT, SZ, isAlert, unitsOf } from './data.js';
import { shade } from './html.js';
import { box, cyl, iconTexture, mesh, numTexture, scene, sprite } from './scene.js';
import { X, canvasTex, etqTex, texPlane, textTex, tomadaM, trans } from './room.js';
import { applyStyleTo } from './style.js';
import { LIVE } from '../config.js';

/* ---------- móveis ---------- */

export const part=(g,y,w,d,h,k,extra={})=>{const c=new THREE.Group();c.position.set(extra.x||0,y,extra.z||0);g.add(c);
 /* halo: volume invisível, só para o ponteiro. mark: a superfície onde as coisas ficam, que acende no destaque. */
 const halo=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));halo.position.y=h/2;halo.visible=false;c.add(halo);
 const mark=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({color:0x2f8cff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));mark.rotation.x=-Math.PI/2;mark.position.y=.005;mark.visible=false;mark.raycast=()=>{};mark.userData.noOverride=true;mark.renderOrder=3;c.add(mark);
 const ml=new THREE.LineSegments(new THREE.EdgesGeometry(mark.geometry),new THREE.LineBasicMaterial({color:0x2f8cff,transparent:true,opacity:0}));ml.raycast=()=>{};mark.add(ml);mark.userData.line=ml;
 return {content:c,w,d,h,k,open:0,hl:0,halo,mark,...extra};};
export const BUILD={
 estante(f,r){const n=f.d.n||3,W=f.d.W||2.0,D=.42,sp=1.5/n,H=.12+n*sp+.06;const g=new THREE.Group();
  for(const sx of[-1,1])for(const sz of[-1,1])box(g,.04,H,.04,sx*(W/2-.02),H/2,sz*(D/2-.02),'#6b737b','clay',{m:.4,r:.4});
  const ys=[];for(let k=0;k<=n;k++){const y=.12+k*sp;ys.push(y);}const boards=ys.map(y=>box(g,W,.025,D,0,y,0,r,'clay',{m:.2,r:.5}));
  const parts={A:part(g,ys[n]+.0125,W-.1,D-.04,.34,'above',{board:boards[n]})};
  for(let i=1;i<=n;i++){const k=n-i;parts['N'+i]=part(g,ys[k]+.0125,W-.1,D-.04,sp-.05,'shelf',{board:boards[k]});}
  return {g,parts};}};

/* ================= móveis do Lab 01 real ================= */
export const WHITE='#eef0ed';
export function gaveta(g,x0,x1,y0,y1,zf,D,c,parts,id,o={}){// gaveta: frente + bandeja que desliza para fora (parte do tipo 'drawer')
 const dg=new THREE.Group();g.add(dg);const w=x1-x0,h=y1-y0,cx=(x0+x1)/2;
 X(dg,x0+.006,x1-.006,y0+.005,y1-.005,zf-.018,zf,c,o.role||'clay',o.mo);
 if(o.puxador!==false)X(dg,cx-.05,cx+.05,y1-.04,y1-.025,zf,zf+.012,'#c3c8cb','clay',{m:.6,r:.35});
 const tray=new THREE.Group();tray.position.set(cx,y0+.02,zf-.02-D/2);dg.add(tray);const tw=w-.05,th=Math.max(.04,h-.05);
 box(tray,tw,.008,D,0,0,0,'#d5dade');box(tray,tw,th,.008,0,th/2,-D/2,'#d5dade');box(tray,.008,th,D,-tw/2,th/2,0,'#d5dade');box(tray,.008,th,D,tw/2,th/2,0,'#d5dade');
 parts[id]=part(tray,.006,tw-.03,D-.04,th,'drawer',{obj:dg});return dg;}
export function portas(f,g,W,y0,y1,zf,c,num){// duas portas de abrir com puxador de barra (armários baixos e armário 10)
 const doors={open:0,l:new THREE.Group(),r:new THREE.Group()};doors.l.position.set(-W/2,0,zf);doors.r.position.set(W/2,0,zf);g.add(doors.l,doors.r);
 X(doors.l,.003,W/2-.003,y0,y1,0,.02,c,'clay',{r:.55});X(doors.r,-W/2+.003,-.003,y0,y1,0,.02,c,'clay',{r:.55});
 const hy=(y0+y1)/2;mesh(doors.l,new THREE.CylinderGeometry(.007,.007,.15,8),'#c3c8cb','clay',W/2-.05,hy,.04,{m:.7,r:.3});mesh(doors.r,new THREE.CylinderGeometry(.007,.007,.15,8),'#c3c8cb','clay',-W/2+.05,hy,.04,{m:.7,r:.3});
 if(num)texPlane(doors.r,.09,.045,etqTex(num),-W/4,y1-.06,.021);f.doors=doors;return doors;}
export function mesaEsc(f,W,lado){const D=.6,H=.75,c=f.d.real&&f.d.lab==='ele'?f.d.real:WHITE,g=new THREE.Group(),parts={};// mesa branca de escritório: painel à esquerda, painel de fundo, gaveteiro de 2 gavetas à direita
 const top=X(g,-W/2,W/2,H-.03,H,-D/2,D/2,c);X(g,-W/2+.02,-W/2+.05,0,H-.03,-D/2+.02,D/2-.04,c);X(g,-W/2+.05,W/2-.05,.4,.62,-D/2+.04,-D/2+.06,c);
 const x0=W/2-.42,x1=W/2-.03;X(g,x0,x1,.42,H-.03,-D/2+.05,D/2-.04,c);X(g,x1,x1+.02,0,H-.03,-D/2+.02,D/2-.04,c);X(g,x0-.02,x0,.42,H-.03,-D/2+.05,D/2-.04,c);
 gaveta(g,x0,x1,.59,.72,D/2-.02,D-.14,c,parts,'G1');gaveta(g,x0,x1,.43,.585,D/2-.02,D-.14,c,parts,'G2');
 parts.T=part(g,H,lado?.72:W-.08,D-.08,.6,'top',{x:lado?-.2:0,board:top});parts.U=part(g,.01,W-.55,D-.1,.6,'under',{x:-.2,board:top});
 if(lado){const fl=trans(mesh(g,new THREE.PlaneGeometry(.5,.55),'#b07a2a','paint',W/2+.3,.012,0,{cast:false}),.08);fl.rotation.x=-Math.PI/2;parts.AL=part(g,.012,.46,.5,.8,'top',{x:W/2+.3,board:fl});}
 return {g,parts};}
/* modelos das máquinas (itens inventariáveis com modelo próprio) */
export const MODEL={
 serrafita(g){X(g,-.07,.07,0,.55,-.08,.08,'#5b6b3a','color');X(g,-.075,.075,.08,.5,.06,.085,'#d8b52a','color');X(g,-.16,.16,.22,.24,-.02,.22,'#b8bcc0','color',{m:.6});X(g,.07,.17,.05,.2,-.06,.06,'#222','color');return .58;},
 furadeira(g){X(g,-.16,.16,0,.05,-.14,.16,'#222','color');X(g,-.04,.04,.05,.75,-.12,-.04,'#2a2d30','color',{m:.4});X(g,-.1,.1,.14,.17,-.06,.14,'#3a3d40','color');X(g,-.09,.09,.6,.8,-.12,.12,'#1d2024','color');X(g,-.012,.012,.48,.6,.02,.04,'#c3c8cb','color',{m:.7});return .82;},
 ticotico(g){X(g,-.15,.15,0,.08,-.14,.14,'#25282b','color');X(g,-.14,.14,.08,.11,-.13,.13,'#b8bcc0','color',{m:.6});X(g,-.03,.03,.08,.36,-.14,-.08,'#25282b','color');X(g,-.03,.03,.3,.36,-.14,.05,'#25282b','color');return .38;}};
export const BUILD_ID={
 central(f){const g=new THREE.Group(),L=1.8,W=.9,T=.04,H=.78;let top0;// 2 mesas emendadas; bordas longas arredondadas; pontas pretas; pés pretos em T alinhados às pontas
  for(let k=0;k<2;k++){const zc=(k-.5)*(L+.004);const s=new THREE.Shape(),r=T/2,Lt=L-.012;s.moveTo(-W/2+r,0);s.lineTo(W/2-r,0);s.absarc(W/2-r,r,r,-Math.PI/2,Math.PI/2,false);s.lineTo(-W/2+r,T);s.absarc(-W/2+r,r,r,Math.PI/2,Math.PI*1.5,false);
   const geo=new THREE.ExtrudeGeometry(s,{depth:Lt,bevelEnabled:false,curveSegments:10});geo.translate(0,0,-Lt/2);const top=mesh(g,geo,'#f4f5f3','clay',0,H-T,zc,{r:.45});if(!k)top0=top;
   for(const sg of[-1,1]){X(g,-W/2+.003,W/2-.003,H-T,H,zc+sg*(L/2-.006)-.003,zc+sg*(L/2-.006)+.003+(sg>0?.003:-.003),'#15181b','color',{r:.5});
    const z=zc+sg*(L/2-.04);X(g,-.3,.3,.06,H-T-.03,z-.02,z+.02,'#15181b','color',{r:.5});X(g,-.38,.38,0,.06,z-.04,z+.04,'#15181b','color',{r:.5});X(g,-.4,.4,H-T-.035,H-T,z-.025,z+.025,'#15181b','color');}}
  return {g,parts:{T:part(g,H,W-.12,2*L-.12,.34,'top',{board:top0}),U:part(g,.01,.7,2*L-.3,.6,'under',{board:top0})}};},
 e10(f){const g=new THREE.Group(),W=.84,D=.45,H=1.75,yc=.66,ys=.95,c='#cfd3d4',t=.025;// prateleira de baixo baixa, de cima alta; armário 10 embaixo
  X(g,-W/2,-W/2+t,0,H,-D/2,D/2,c);X(g,W/2-t,W/2,0,H,-D/2,D/2,c);const top=X(g,-W/2,W/2,H-t,H,-D/2,D/2,c);X(g,-W/2+t,W/2-t,0,H,-D/2,-D/2+.012,'#bfc4c6');X(g,-W/2+t,W/2-t,0,.05,-D/2,D/2-.02,'#9ea4a7');
  const cab=X(g,-W/2+t,W/2-t,yc,yc+.025,-D/2,D/2,c);const sh=X(g,-W/2+t,W/2-t,ys,ys+.022,-D/2,D/2,c);const inn=X(g,-W/2+t,W/2-t,.33,.345,-D/2,D/2-.03,c);
  portas(f,g,W-.004,.06,yc-.005,D/2-.02,WHITE,'10');
  return {g,parts:{A:part(g,H,W-.06,D-.06,.3,'above',{board:top}),P1:part(g,ys+.022,W-.08,D-.06,H-ys-.07,'shelf',{board:sh}),P2:part(g,yc+.025,W-.08,D-.06,ys-yc-.04,'shelf',{board:cab}),P3:part(g,.345,W-.08,D-.08,yc-.37,'shelf',{board:inn})}};},
 carrinho(f){const g=new THREE.Group(),W=.75,D=.45,H=.85,c='#6f7466';for(const [x,z] of[[-1,-1],[1,-1],[-1,1],[1,1]]){X(g,x*W/2-.015,x*W/2+.015,.08,H,z*D/2-.015,z*D/2+.015,c,'color',{m:.4});mesh(g,new THREE.CylinderGeometry(.035,.035,.07,12),'#222','color',x*(W/2-.03),.035,z*(D/2-.03));}
  const parts={};[H-.02,.48,.15].forEach((y,i)=>{const b=X(g,-W/2,W/2,y,y+.02,-D/2,D/2,c,'color',{m:.35});X(g,-W/2,W/2,y+.02,y+.045,D/2-.01,D/2,c,'color');X(g,-W/2,W/2,y+.02,y+.045,-D/2,-D/2+.01,c,'color');parts['N'+(i+1)]=part(g,y+.02,W-.08,D-.06,i?.28:.3,'shelf',{board:b});});
  return {g,parts};}};
Object.assign(BUILD,{
 suspenso(f){const d=f.d,W=d.W||1.3,D=.45,yb=d.yb||1.42,yt=yb+.6,t=.025,ad=.38,c=d.real||WHITE,g=new THREE.Group();// armário suspenso: suportes laterais até o chão, portas de correr esquerda/direita
  X(g,-W/2,-W/2+t,0,yt,-D/2,D/2,c);X(g,W/2-t,W/2,0,yt,-D/2,D/2,c);X(g,-W/2+t,W/2-t,yt-t,yt,-D/2,-D/2+ad,c);const bot=X(g,-W/2+t,W/2-t,yb,yb+.02,-D/2,-D/2+ad,c);X(g,-W/2+t,W/2-t,yb,yt,-D/2,-D/2+.012,c);
  const half=(W-2*t)/2,zf=-D/2+ad,parts={};
  ['PE','PD'].forEach((id,i)=>{const dg=new THREE.Group();g.add(dg);const x0=-W/2+t+i*half,zz=zf-(i?0:.017);X(dg,x0-(i?.01:0),x0+half+(i?0:.01),yb+.03,yt-t-.005,zz-.014,zz,c);
   const fh=mesh(dg,new THREE.CylinderGeometry(.018,.018,.005,16),'#5d6266','color',x0+(i?.07:half-.05),(yb+yt)/2,zz+.002);fh.rotation.x=Math.PI/2;
   parts[id]=part(g,yb+.02,half-.06,ad-.07,yt-yb-.08,'shelf',{x:x0+half/2,z:-D/2+ad/2+.005,board:bot,slide:{o:dg,dx:i?-half:half}});});
  if(d.num)texPlane(g,.07,.035,etqTex(d.num),W/2-t-.1,yt-.075,zf+.002);
  if(d.rotulo)texPlane(g,.1,.025,textTex(d.rotulo,160,40,{bg:'#fff',fs:22}),0,yt-.08,zf+.002);
  if(d.tomada||d.under)tomadaM(g,0,1.0,-D/2+.03);
  if(d.under)parts.U=part(g,.012,W-.1,D-.08,Math.min(1.25,yb-.12),'under',{board:bot});
  return {g,parts};},
 bancada(f){return mesaEsc(f,f.d.W||1.25,false);},
 serra(f){return mesaEsc(f,1.2,true);},
 computador(f){const W=1.55,D=.7,H=.75,g=new THREE.Group();// mesa de estrutura metálica cinza com dois monitores
  const top=X(g,-W/2,W/2,H-.03,H,-D/2,D/2,'#e8eae8');for(const s of[-1,1]){const x=s*(W/2-.06);X(g,x-.03,x+.03,0,.03,-D/2+.03,D/2-.03,'#8b9196','clay',{m:.5});X(g,x-.02,x+.02,0,H-.03,-.02,.02,'#8b9196','clay',{m:.5});}X(g,-W/2+.06,W/2-.06,.5,.54,-.02,.02,'#8b9196','clay',{m:.5});
  for(const x of[-.3,.25]){X(g,x-.27,x+.27,H+.09,H+.43,-.2,-.17,'#15181b','color',{r:.3});X(g,x-.24,x+.24,H+.1,H+.42,-.169,-.168,'#2a3a52','color');X(g,x-.02,x+.02,H,H+.1,-.21,-.18,'#222','color');}
  X(g,-.35,.1,H,H+.02,-.02,.13,'#222','color');
  return {g,parts:{T:part(g,H,.55,D-.1,.3,'top',{x:.45,z:.08,board:top}),U:part(g,.01,W-.3,D-.1,.6,'under',{board:top})}};},
 armario(f){const d=f.d,W=d.id==='a9'?.7:.8,H=1.2,D=.5,t=.018,g=new THREE.Group(),c=WHITE,ci='#e9ebe9';// armário de 2 portas, oco por dentro, tampo bege
  X(g,-W/2,-W/2+t,.04,H-.03,-D/2,D/2-.02,c);X(g,W/2-t,W/2,.04,H-.03,-D/2,D/2-.02,c);X(g,-W/2+t,W/2-t,.04,H-.03,-D/2,-D/2+t,ci);X(g,-W/2,W/2,0,.06,-D/2+.02,D/2-.04,'#d8dbd9');
  const top=X(g,-W/2-.01,W/2+.01,H-.03,H,-D/2,D/2+.01,'#e3d8c3');
  const ys=[.06,.43,.8],bs=ys.map(y=>X(g,-W/2+t,W/2-t,y,y+.018,-D/2+t,D/2-.04,ci));
  portas(f,g,W,.06,H-.035,D/2-.02,c,null);(d.rot2||[]).forEach((tx,i)=>tx&&texPlane(i?f.doors.r:f.doors.l,.075,.022,textTex(tx,150,44,{bg:'#fff',fs:26}),i?-W/4:W/4,H-.16,.021));
  return {g,parts:{A:part(g,H,W-.04,D-.04,.3,'above',{board:top}),P1:part(g,ys[2]+.018,W-.06,D-.1,H-ys[2]-.08,'shelf',{board:bs[2]}),P2:part(g,ys[1]+.018,W-.06,D-.1,ys[2]-ys[1]-.04,'shelf',{board:bs[1]}),P3:part(g,ys[0]+.018,W-.06,D-.1,ys[1]-ys[0]-.04,'shelf',{board:bs[0]})}};},
 gaveteiro(f){const W=.56,D=.5,H=1.3,z=.1,top=.13,g=new THREE.Group(),az='#1f4c96',parts={};// estrutura azul, 8 gavetas (as 2 de baixo maiores), top hat com fechadura, rodízios
  for(const [x,zz] of[[-.22,-.18],[.22,-.18],[-.22,.18],[.22,.18]])mesh(g,new THREE.CylinderGeometry(.035,.035,.07,12),'#222','color',x,.035,zz);
  const A=(a,b,c2,d2,e,f2)=>X(g,a,b,c2,d2,e,f2,az,'color',{m:.3,r:.5});A(-W/2,W/2,z,z+.03,-D/2,D/2);A(-W/2,-W/2+.04,z,H-top,-D/2,D/2);A(W/2-.04,W/2,z,H-top,-D/2,D/2);A(-W/2+.04,W/2-.04,z,H-top,-D/2,-D/2+.02);
  A(-W/2-.012,W/2+.012,H-top,H-.02,-D/2-.01,D/2+.012);const lid=A(-W/2-.02,W/2+.02,H-.02,H,-D/2-.015,D/2+.02);const lk=mesh(g,new THREE.CylinderGeometry(.012,.012,.01,12),'#aab0bb','color',0,H-top/2-.01,D/2+.014);lk.rotation.x=Math.PI/2;
  const hs=[.115,.115,.115,.115,.115,.115,.2,.2],tot=H-top-z-.04,k=tot/hs.reduce((a,b)=>a+b,0);let y=H-top-.01;
  hs.forEach((h0,i)=>{const h=h0*k;const dg=gaveta(g,-W/2+.045,W/2-.045,y-h,y,D/2-.01,D-.08,'#9aa2a9',parts,'G'+(i+1),{role:'color',mo:{m:.35,r:.5},puxador:false});
   const ct=CARD[i].split(' e ');ct.forEach((t,j)=>texPlane(dg,.15,.042,textTex(t,180,50,{bg:'#f1ead6',fg:'#2a2a2a',fs:30,w:500}),ct.length===1?-.08:(j?.11:-.11),y-h/2+(h0>.15?.03:0),D/2-.008));y-=h;});
  parts.A=part(g,H,W,D,.3,'above',{board:lid});return {g,parts};},
 lugar(f){const d=f.d,W=d.W,D=d.D,g=new THREE.Group();// lugar sem subdivisões: contorno tracejado + objetos típicos
  const pts=[[-W/2,-D/2],[W/2,-D/2],[W/2,D/2],[-W/2,D/2],[-W/2,-D/2]].map(([x,z])=>new THREE.Vector3(x,.012,z));const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineDashedMaterial({color:0xb07a2a,dashSize:.08,gapSize:.05}));ln.computeLineDistances();ln.raycast=()=>{};g.add(ln);
  const fl=trans(mesh(g,new THREE.PlaneGeometry(W,D),'#b07a2a','paint',0,.01,0,{cast:false}),.1);fl.rotation.x=-Math.PI/2;
  /* objetos ilustrativos (tábuas, tubos, caixas) só na demonstração: com a planilha ligada, o 3D mostra só o que existe */
  if(d.deco==='vao'&&!LIVE){X(g,-.2,.07,0,.3,-.55,-.3,'#c49a62');X(g,-.18,.02,0,.5,-.2,0,'#888d90');}
  if(d.deco==='materiais'&&!LIVE){for(let i=0;i<5;i++){const m=X(g,-.25+i*.1,-.23+i*.1,0,1.2+i*.1,-1.0,.2,i%2?'#d6c09a':'#c8ad80');m.rotation.z=-.12;}for(let i=0;i<6;i++){const m=mesh(g,new THREE.CylinderGeometry(.012,.012,1.9,6),i%2?'#3a3a3a':'#c9a36a','color',-.3+i*.08,.95,.7+(i%3)*.06);m.rotation.z=.08;}}
  if(d.deco==='lixo'){if(!LIVE)X(g,-.25,.25,0,.55,-.55,-.15,'#c49a62');mesh(g,new THREE.CylinderGeometry(.2,.2,.5,20),'#f2f2ef','clay',0,.25,.15);if(!LIVE)X(g,-.3,.3,0,.08,.25,.55,'#b98d55');}
  return {g,parts:{L:part(g,.012,W-.04,D-.04,.6,'top',{board:fl})}};}});

/* organizadores 3D */
export function tray3d(parent,w,d,h,hex,role='color'){const g=new THREE.Group();parent.add(g);const t=.01;
 box(g,w,t,d,0,t/2,0,hex,role);box(g,w,h,t,0,h/2,-d/2+t/2,hex,role);box(g,w,h,t,0,h/2,d/2-t/2,hex,role);box(g,t,h,d,-w/2+t/2,h/2,0,hex,role);box(g,t,h,d,w/2-t/2,h/2,0,hex,role);return g;}
export const CESTO_A=canvasTex(64,64,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,64,64);x.fillStyle='#000';for(let i=0;i<4;i++)for(let j=0;j<3;j++)x.fillRect(6+i*15,10+j*18,8,10);});CESTO_A.colorSpace=THREE.NoColorSpace;
export function orgVidro(g,w,h,d,x,y,z,op=.32){const m=box(g,w,h,d,x,y,z,'#dfe8ee','glass2',{cast:false});return trans(m,op);}
export function buildOrg(o,parent){const g=new THREE.Group();parent.add(g);const [W,D]=o._sz||SZ[o.tam];const H=OT[o.tipo].h[o.tam];const c=o.cor,dk=shade(c,.7),lt=shade(c,1.2);
 g.userData={org:o.id,openAmt:0,W,D,H};let inner=new THREE.Group();let innerY=.012,closed=false;const t=.008;
 const tampa=(hh,fn)=>{const pv=new THREE.Group();pv.position.set(0,hh,-D/2);g.add(pv);fn(pv);g.userData.lid=pv;};
 if(o.tipo==='caixaTrava'){for(const [w,h,d,x,y,z] of[[W,t,D,0,t/2,0],[W,H,t,0,H/2,-D/2],[W,H,t,0,H/2,D/2],[t,H,D,-W/2,H/2,0],[t,H,D,W/2,H/2,0]])orgVidro(g,w,h,d,x,y,z);
  tampa(H,pv=>{orgVidro(pv,W+.01,.014,D+.01,0,.007,D/2,.42);});for(const s of[-1,1])box(g,.012,H*.4,D*.3,s*(W/2+.006),H*.8,0,c,'color');}
 else if(o.tipo==='divisorias'){for(const [w,h,d,x,y,z] of[[W,t,D,0,t/2,0],[W,H,t,0,H/2,-D/2],[W,H,t,0,H/2,D/2],[t,H,D,-W/2,H/2,0],[t,H,D,W/2,H/2,0]])orgVidro(g,w,h,d,x,y,z);
  for(let k=1;k<4;k++)box(g,.004,H*.9,D-.01,-W/2+k*W/4,H*.45,0,c,'color',{cast:false});tampa(H,pv=>{orgVidro(pv,W+.008,.01,D+.008,0,.005,D/2,.4);});}
 else if(o.tipo==='maletaT'){const hb=H*.82;box(g,W,hb,D,0,hb/2,0,c,'color');tray3d(g,W,D,.001,c);
  tampa(hb,pv=>{orgVidro(pv,W,H-hb,D,0,(H-hb)/2,D/2,.4);box(pv,W*.3,.012,.014,0,H-hb+.012,D*.85,'#1c1c1c','color');});innerY=hb*.25;}
 else if(o.tipo==='maleta'||o.tipo==='ferramentas'){const hb=H*(o.tipo==='maleta'?.55:.82);box(g,W,hb,D,0,hb/2,0,c,'color');
  tampa(hb,pv=>{box(pv,W,H-hb,D,0,(H-hb)/2,D/2,o.tipo==='maleta'?lt:dk,'color');box(pv,W*.3,.012,.014,0,H-hb+.015,D/2,'#1c1c1c','color');});
  if(o.tipo==='maleta')for(const s of[-1,1])box(g,.03,.02,.008,s*W*.28,hb*.9,D/2+.004,'#1c1c1c','color',{cast:false});else box(g,.03,.035,.01,0,hb-.01,D/2+.005,'#2b2e31','color');
  closed=true;innerY=hb;}
 else if(o.tipo==='gavetinhas'){box(g,W,H,D,0,H/2,0,c,'color');const dr=[];for(let k=0;k<2;k++){const dg=new THREE.Group();dg.position.set(0,H*(k+.5)/2,D/2);g.add(dg);box(dg,W*.9,H/2*.82,.012,0,0,.006,lt,'color');box(dg,W*.3,H*.06,.012,0,H*.08,.016,'#c8302c','color');dr.push(dg);}
  g.userData.drawers=dr;closed=true;innerY=H+.01;}
 else if(o.tipo==='cesto'){for(const [w,d,x,z,ry] of[[W,0,0,D/2,0],[W,0,0,-D/2,0],[D,0,W/2,0,Math.PI/2],[D,0,-W/2,0,Math.PI/2]]){const m=mesh(g,new THREE.PlaneGeometry(w,H),c,'color',x,H/2,z,{cast:false});m.rotation.y=ry;m.material.alphaMap=CESTO_A;m.material.alphaTest=.5;m.material.side=THREE.DoubleSide;}box(g,W,t,D,0,t/2,0,c,'color');}
 else if(o.tipo==='papelao'){tray3d(g,W,D,H,c);box(g,W*.4,H*.3,.004,0,H*.55,D/2+.003,'#ffffff','paint',{cast:false});}
 else if(o.tipo==='saco'){const s=mesh(g,new THREE.SphereGeometry(.5,24,16),c,'color',0,H*.45,0);s.scale.set(W,H*.9,D);box(g,W*.7,.006,.01,0,H*.88,0,dk,'color',{cast:false});closed=true;innerY=H+.01;}
 else tray3d(g,W,D,H,c);
 g.add(inner);inner.position.y=innerY;g.userData.inner=inner;g.userData.closed=closed;g.userData.iw=W*.84;g.userData.id_=D*.78;
 g.traverse(x=>{if(x.isMesh)x.userData.org=o.id;});return g;}
/* peças de item: ícone flutuante sobre base colorida */
export function piece(parent,e,size){const g=new THREE.Group();parent.add(g);const it=IT(e),c=CL[it.cl].c;g.userData.entry=e.id;
 if(it.model&&MODEL[it.model]){const h=MODEL[it.model](g);const sp=sprite(iconTexture(it.cl),.12);sp.position.y=h+.1;g.add(sp);g.userData.icon=sp;const ns=sprite(numTexture(String(unitsOf(e))),.13);ns.position.y=h+.2;ns.visible=false;g.add(ns);g.userData.num=ns;
  const al=isAlert(e);g.traverse(x=>{x.userData.entry=e.id;x.userData.alert=al;});return g;}
 if(it.modo==='conjunto'){const w=size*1.15;tray3d(g,w,w*.8,size*.5,'#cfd5da','color');const lv=(e.nivel||0)/3;if(lv>0)box(g,w*.86,size*.42*lv,w*.66,0,.006+size*.21*lv,0,c,'color');}
 else{const b=cyl(g,size*.42,.012,0,.006,0,c,'color',24);b.castShadow=false;}
 const sp=sprite(iconTexture(it.cl),size*.95);sp.position.y=size*(it.modo==='conjunto'?1.05:.75);g.add(sp);g.userData.icon=sp;
 const q=it.modo==='conjunto'?NIVEIS[e.nivel]:String(unitsOf(e));const ns=sprite(numTexture(q),size*1.1);ns.position.y=sp.position.y+size*.75;ns.visible=false;g.add(ns);g.userData.num=ns;
 if(it.modo==='contavel'&&e.qtd===0)g.userData.esg=true;
 const al=isAlert(e);g.traverse(x=>{x.userData.entry=e.id;x.userData.alert=al;});return g;}
/* Preenchimento: organizadores em fileiras, reduzidos por igual até caberem na área e na altura da parte; itens soltos na faixa que sobra, com peça limitada pela célula e pela altura. Nada atravessa prateleira nem lateral. */
export function layout(parent,w,d,entries,orgs,size,hmax=9){const placed=[],gap=.02;
 const fundo=s=>{let x=0,z=0,row=0;for(const o of orgs){const [ow,od]=SZ[o.tam];const a=Math.min(ow*s,w),b=od*a/ow;if(x>0&&x+a>w+1e-3){x=0;z+=row+gap;row=0;}x+=a+gap;row=Math.max(row,b);}return z+row;};
 let s=1;if(orgs.length){const hs=Math.max(...orgs.map(o=>OT[o.tipo].h[o.tam]));s=Math.min(1,hmax*.9/hs);const cabe=d*(entries.length?.68:1);while(s>.35&&fundo(s)>cabe)s-=.05;}
 let x=-w/2,z=-d/2,rowD=0;
 for(const o of orgs){const [ow,od]=SZ[o.tam];o._sz=[ow,od];const a=Math.min(ow*s,w),sc=a/ow,b=od*sc;
  if(x>-w/2&&x+a>w/2+1e-3){x=-w/2;z+=rowD+gap;rowD=0;}const g=buildOrg(o,parent);g.scale.setScalar(sc);g.userData.sc=sc;g.position.set(x+a/2,0,z+b/2);x+=a+gap;rowD=Math.max(rowD,b);placed.push(g);
  if(o.itens.length)gridPlace(g.userData.inner,ow*.8,od*.7,o.itens,Math.min(size/sc,Math.min(ow,od)*.5));}
 const z0=orgs.length?Math.min(d/2-.07,z+rowD+.03):-d/2;const remD=Math.max(.07,d/2-z0);
 if(entries.length){const g=new THREE.Group();parent.add(g);g.position.z=z0+remD/2;gridPlace(g,w*.92,remD,entries,size,hmax);}return placed;}
export function gridPlace(parent,w,d,entries,size,hmax=9){const n=entries.length;const cols=Math.max(1,Math.min(n,Math.round(Math.sqrt(n*w/d))||1));const rows=Math.ceil(n/cols);const cw=w/cols,cd=d/rows;
 const s=Math.min(size,cw*.8,cd*1.1,hmax/1.6);entries.forEach((e,k)=>{const p=piece(parent,e,s);p.position.set(-w/2+cw*(k%cols+.5),0,-d/2+cd*(Math.floor(k/cols)+.5));});}
export function buildContents(f,pid){const pt=f.parts[pid],p=f.d.partes.find(x=>x.id===pid);const c=pt.content;
 for(const ch of [...c.children]){if(ch===pt.halo||ch===pt.mark)continue;c.remove(ch);ch.traverse(x=>{if(x.isMesh)x.geometry.dispose();});}
 const size=pt.k==='drawer'?.085:.13;pt.orgG=layout(c,pt.w,pt.d,p.itens,p.orgs,size,(pt.k==='shelf'||pt.k==='under')?pt.h:9);
 c.traverse(x=>{if(x.isMesh||x.isSprite){x.userData.f=f;x.userData.part=pid;x.userData.lab=f.d.lab;}});applyStyleTo(c);collect(f);}
export function collect(f){f.meshes=[];f.sprites=[];f.g.traverse(o=>{if(o.isMesh&&o.userData.base){f.meshes.push(o);o.userData.f=f;o.userData.lab=f.d.lab;}if(o.isSprite)f.sprites.push(o);});
 pick.length=0;F.forEach(x=>x.meshes&&pick.push(...x.meshes));}
export function measure(f){f.g.updateMatrixWorld(true);const bb=new THREE.Box3();f.g.traverse(o=>{if(o.isMesh&&o.userData.base)bb.expandByObject(o);});f.center=bb.getCenter(new THREE.Vector3());const s=bb.getSize(new THREE.Vector3());
 f.bb=bb.clone();f.anchor=new THREE.Vector3(f.center.x,bb.max.y+.08,f.center.z);f.size=Math.max(s.x,s.y,s.z);f.rad=Math.max(s.x,s.z)/2+.3;f.h=s.y;if(f.ring){f.ring.position.set(f.center.x,.012,f.center.z);f.ring.scale.setScalar(f.rad);}}
export const byId=id=>F.find(f=>f.d.id===id);
export const partW=(f,pid)=>{const v=new THREE.Vector3();f.parts[pid].content.getWorldPosition(v);return v;};

M.forEach(d=>{const f={d,v:{hover:0},cut:0};const clay=new THREE.Color(d.real).lerp(new THREE.Color('#dedbd6'),.4);
 const b=(BUILD_ID[d.id]||BUILD[d.tipo])(f,'#'+clay.getHexString());f.g=b.g;f.parts=b.parts;f.g.position.set(...d.pos);f.g.rotation.y=d.rot;scene.add(f.g);F.push(f);
 for(const [pid,pt] of Object.entries(f.parts)){pt.halo.userData.halo={f,pid};halos.push(pt.halo);}
 for(const p of d.partes)buildContents(f,p.id);collect(f);measure(f);
 const pts=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a),0,Math.sin(a)));}
 const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineDashedMaterial({color:0x0077C8,dashSize:.1,gapSize:.07,transparent:true,opacity:0}));
 ring.computeLineDistances();ring.raycast=()=>{};ring.visible=false;scene.add(ring);f.ring=ring;f.ringO=0;measure(f);
 const bd=document.createElement('div');bd.className='badge';app.appendChild(bd);f.badge=bd;});


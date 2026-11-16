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
 const tray=new THREE.Group();tray.position.set(cx,y0+.02,zf-.02-D/2);dg.add(tray);const tw=w-.05,th=Math.max(.04,h-.05),tc=o.tray||'#d5dade';
 box(tray,tw,.008,D,0,0,0,tc);box(tray,tw,th,.008,0,th/2,-D/2,tc);box(tray,.008,th,D,-tw/2,th/2,0,tc);box(tray,.008,th,D,tw/2,th/2,0,tc);
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
 /* ===== Lab de Eletrônica (fotos de 13/11) ===== */
 /* mesa de escritório com tampo branco, borda escura e pés de painel pretos; com R>0 vira mesa em L com canto interno curvo */
 mesaL(f){const d=f.d,W=d.W||1.6,D=d.D||.7,H=.75,R=d.R||0,RW=d.RW||.6,s=d.lado||1,g=new THREE.Group(),parts={},wh='#eef0ed',bk='#24272a';
  const ex=s*W/2,ix=ex-s*RW,r=.22;const sh=new THREE.Shape();
  const P=(x,z)=>[x,z];const pts=[];
  if(R>0){pts.push(P(-ex,-D/2),P(ex,-D/2),P(ex,D/2+R),P(ix,D/2+R),P(ix,D/2+r));}else pts.push(P(-W/2,-D/2),P(W/2,-D/2),P(W/2,D/2));
  sh.moveTo(...pts[0]);for(const q of pts.slice(1))sh.lineTo(...q);
  if(R>0){if(s>0)sh.absarc(ix-r,D/2+r,r,0,-Math.PI/2,true);else sh.absarc(ix+r,D/2+r,r,Math.PI,1.5*Math.PI,false);sh.lineTo(-ex,D/2);}else sh.lineTo(-W/2,D/2);
  const tampo=(y0,y1,c,role,o)=>{const geo=new THREE.ExtrudeGeometry(sh,{depth:y1-y0,bevelEnabled:false,curveSegments:10});geo.rotateX(Math.PI/2);geo.translate(0,y1,0);return mesh(g,geo,c,role,0,0,0,o);};
  tampo(H-.034,H-.006,bk,'color',{m:.2,r:.6});const top=tampo(H-.006,H,wh,'clay');
  /* pé de quadro preto: duas colunas, travessa no alto e sapata no chão (como nas fotos) */
  const perna=(x,z0,z1)=>{for(const z of[z0+.07,z1-.07])X(g,x-.022,x+.022,.03,H-.034,z-.022,z+.022,bk,'color',{m:.3});X(g,x-.02,x+.02,H-.08,H-.034,z0+.05,z1-.05,bk,'color',{m:.3});X(g,x-.03,x+.03,0,.035,z0,z1,bk,'color',{m:.3});};
  const pernaX=(x0,x1,z)=>{for(const x of[x0+.07,x1-.07])X(g,x-.022,x+.022,.03,H-.034,z-.022,z+.022,bk,'color',{m:.3});X(g,x0+.05,x1-.05,H-.08,H-.034,z-.02,z+.02,bk,'color',{m:.3});X(g,x0,x1,0,.035,z-.03,z+.03,bk,'color',{m:.3});};
  perna(-ex+s*.06,-D/2+.02,D/2-.02);
  if(R>0)pernaX(Math.min(ix,ex)+.02,Math.max(ix,ex)-.02,D/2+R-.07);
  else perna(W/2-.06,-D/2+.02,D/2-.02);
  if(d.gav){const gw=.42,gx0=R>0?(s>0?ix-gw-.03:ix+.03):(W/2-gw-.08),gx1=gx0+gw,gd=D-.12,zf=D/2-.04;// gaveteiro branco de 3 gavetas sob o tampo
   X(g,gx0,gx1,H-.06,H-.034,-D/2+.06,zf,wh);X(g,gx0,gx0+.018,.06,H-.06,-D/2+.06,zf,wh);X(g,gx1-.018,gx1,.06,H-.06,-D/2+.06,zf,wh);X(g,gx0,gx1,.06,.08,-D/2+.06,zf,wh);
   for(const [x,z] of[[gx0+.05,-D/2+.12],[gx1-.05,-D/2+.12],[gx0+.05,zf-.05],[gx1-.05,zf-.05]])mesh(g,new THREE.CylinderGeometry(.022,.022,.05,10),'#222','color',x,.025,z);
   const ys=[.08,.3,.5,H-.06];for(let i=0;i<3;i++)gaveta(g,gx0+.018,gx1-.018,ys[2-i],ys[3-i],zf,gd-.06,wh,parts,'G'+(i+1));}
  const ua=R>0?-ex:-W/2,ub=R>0?ix-s*(d.gav?.47:0):(d.gav?W/2-.52:W/2);const ux=(ua+ub)/2,uw=Math.abs(ub-ua)-.1;parts.T=part(g,H,(R>0?W-RW:W)-.1,D-.08,.5,'top',{x:R>0?-s*RW/2:0,board:top});
  if(R>0)parts.T2=part(g,H,RW-.08,R+D-.1,.5,'top',{x:ex-s*RW/2,z:R/2,board:top});
  /* embaixo do lado curto: é onde os gaveteiros de rodinha costumam ficar (encaixe) */
  if(R>0)parts.U2=part(g,.01,RW-.1,R+D-.16,.5,'under',{x:ex-s*RW/2,z:R/2,board:top});
  const slots=R>0?[{x:ex-s*RW/2,z:D/2+R-.45,rot:-s*Math.PI/2,parte:'U2'}]/* gavetas viradas para o lado onde entra a cadeira */:[{x:W/2-.32,z:0,rot:0,parte:'U'}];
  parts.U=part(g,.01,uw,D-.12,.5,'under',{x:ux,board:top});
  return {g,parts,slots};},
 /* gaveteiro volante branco (rodízios, borda preta no tampo) */
 gavvol(f){const d=f.d,W=.46,D=.55,H=.64,n=d.n||2,g=new THREE.Group(),parts={},wh='#eef0ed';
  for(const [x,z] of[[-.17,-.2],[.17,-.2],[-.17,.2],[.17,.2]])mesh(g,new THREE.CylinderGeometry(.025,.025,.05,10),'#222','color',x,.025,z);
  X(g,-W/2,W/2,.05,.07,-D/2,D/2,wh);X(g,-W/2,-W/2+.018,.05,H-.03,-D/2,D/2,wh);X(g,W/2-.018,W/2,.05,H-.03,-D/2,D/2,wh);X(g,-W/2,W/2,.05,H-.03,-D/2,-D/2+.015,wh);
  X(g,-W/2-.005,W/2+.005,H-.034,H-.008,-D/2-.005,D/2+.005,'#24272a','color',{m:.2});const top=X(g,-W/2,W/2,H-.008,H,-D/2,D/2,wh);
  /* gaveta de baixo um pouco maior; interior preto */
  const y0=.07,y1=H-.034,hs=n===2?[.45,.55]:Array(n).fill(1/n);let yy=y1;for(let i=0;i<n;i++){const h=(y1-y0)*hs[i];gaveta(g,-W/2+.018,W/2-.018,yy-h,yy,D/2,D-.08,wh,parts,'G'+(i+1),{tray:'#1d2024'});yy-=h;}
  parts.A=part(g,H,W-.04,D-.04,.45,'above',{board:top});return {g,parts};},
 /* gaveteiro fixo: 4 gavetas iguais, tampo na altura das mesas */
 gavfixo(f){const W=.46,D=.55,H=.75,g=new THREE.Group(),parts={},wh='#eef0ed';
  X(g,-W/2,W/2,0,.06,-D/2,D/2,'#d7dadb');X(g,-W/2,-W/2+.018,.06,H-.02,-D/2,D/2,wh);X(g,W/2-.018,W/2,.06,H-.02,-D/2,D/2,wh);X(g,-W/2+.018,W/2-.018,.06,H-.02,-D/2,-D/2+.015,wh);const top=X(g,-W/2-.01,W/2+.01,H-.02,H,-D/2-.01,D/2+.01,wh);
  const h=(H-.02-.06)/4;for(let i=0;i<4;i++)gaveta(g,-W/2+.018,W/2-.018,H-.02-(i+1)*h,H-.02-i*h,D/2,D-.08,wh,parts,'G'+(i+1));
  const lk=mesh(g,new THREE.CylinderGeometry(.01,.01,.01,10),'#aab0bb','color',W/2-.06,H-.06,D/2+.012);lk.rotation.x=Math.PI/2;
  parts.A=part(g,H,W-.04,D-.04,.5,'above',{board:top});return {g,parts};},
 /* gaveteiro azul: móvel pequeno que vive em cima de tampos */
 gavazul(f){const bw=.36,bd=.3,bh=.31,g=new THREE.Group(),parts={},az='#1f4c96';const A=(a,b,c2,d2,e,f2)=>X(g,a,b,c2,d2,e,f2,az,'color',{m:.3,r:.5});
  A(-bw/2,bw/2,0,.015,-bd/2,bd/2);A(-bw/2,-bw/2+.015,.015,bh-.015,-bd/2,bd/2);A(bw/2-.015,bw/2,.015,bh-.015,-bd/2,bd/2);A(-bw/2+.015,bw/2-.015,.015,bh-.015,-bd/2,-bd/2+.012);const tb=A(-bw/2,bw/2,bh-.015,bh,-bd/2,bd/2);
  const hb=(bh-.03)/4;for(let i=0;i<4;i++)gaveta(g,-bw/2+.015,bw/2-.015,bh-.015-(i+1)*hb,bh-.015-i*hb,bd/2,bd-.06,'#c9ced3',parts,'B'+(i+1),{role:'color',mo:{m:.3,r:.5}});
  parts.A=part(g,bh,bw-.04,bd-.04,.3,'above',{board:tb});return {g,parts};},
 /* estante suspensa: 3 prateleiras do teto para baixo, laterais até o chão; embaixo cabe uma mesa */
 estSusp(f){const d=f.d,W=d.W||1.3,D=.5,top=d.H||2.55,g=new THREE.Group(),parts={},wh='#e9ece9',t=.03,n=3,sp=.4;
  X(g,-W/2,-W/2+t,0,top,-D/2,D/2,wh);X(g,W/2-t,W/2,0,top,-D/2,D/2,wh);X(g,-W/2+t,W/2-t,top-n*sp-.02,top,-D/2,-D/2+.012,'#dfe2df');
  const bs=[];for(let k=0;k<=n;k++){const y=top-k*sp;bs.push(X(g,-W/2+t,W/2-t,y-.022,y,-D/2+.012,D/2,wh));}
  for(let i=1;i<=n;i++){const yb=top-(n-i+1)*sp;parts['N'+i]=part(g,yb,W-.1,D-.05,sp-.05,'shelf',{board:bs[n-i+1]});}
  const yb=top-n*sp-.022;parts.U=part(g,.012,W-.1,D-.06,Math.min(1.3,yb-.05),'under',{board:bs[n]});return {g,parts};},
 /* estante alta branca, laterais e fundo fechados */
 estanteAlta(f){const d=f.d,W=d.W||.95,D=.4,H=d.H||2.05,n=d.n||5,g=new THREE.Group(),parts={},wh='#e9ece9';
  X(g,-W/2,-W/2+.02,0,H,-D/2,D/2,wh);X(g,W/2-.02,W/2,0,H,-D/2,D/2,wh);X(g,-W/2,W/2,0,H,-D/2,-D/2+.012,'#dfe2df');
  const ys=[];for(let k=0;k<=n;k++)ys.push(.06+k*(H-.08)/n);const bs=ys.map(y=>X(g,-W/2+.02,W/2-.02,y-.02,y,-D/2+.012,D/2,wh));
  for(let i=1;i<=n;i++){const k=n-i;parts['N'+i]=part(g,ys[k],W-.08,D-.05,ys[k+1]-ys[k]-.04,'shelf',{board:bs[k]});}
  parts.A=part(g,ys[n],W-.06,D-.04,.3,'above',{board:bs[n]});return {g,parts};},
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
/* ===== móveis dentro de móveis =====
   classe do móvel que pode ficar "dentro" de outro: 'gav' (gaveteiro de rodinha), 'mesa' (bancadas e mesas), 'topo' (gaveteiro azul, vive em cima de tampos).
   quem aceita o quê embaixo: estantes/armários suspensos aceitam mesas e gaveteiros; mesas aceitam gaveteiros; áreas aceitam gaveteiros. */
export const ACEITA={estSusp:['mesa','gav'],suspenso:['mesa','gav'],mesaL:['gav'],bancada:['gav'],mesa:['gav'],serra:['gav'],computador:['gav'],lugar:['gav']};
export const classeMovel=d=>d.tipo==='gavvol'?'gav':d.tipo==='gavazul'?'topo':({mesaL:1,bancada:1,serra:1,computador:1}[d.tipo]?'mesa':null);
const tv=new THREE.Vector3();
function dentroParte(f,pid,p,tol){const pt=f.parts[pid];const v=pt.content.worldToLocal(tv.copy(p));return Math.abs(v.x)<=pt.w/2+tol&&Math.abs(v.z)<=pt.d/2+tol;}
function dentroBB(f,p,tol){return p.x>=f.bb.min.x-tol&&p.x<=f.bb.max.x+tol&&p.z>=f.bb.min.z-tol&&p.z<=f.bb.max.z+tol;}
/* onde um móvel está (ou estaria, em pos): {f,pid,y} — pid nulo quando o hospedeiro não tem parte "embaixo" (armários suspensos da Manufatura) */
export function hospedeiro(c,pos){const cl=classeMovel(c.d);if(!cl)return null;pos=pos||c.g.position;let best=null;
 for(const h of F){if(h===c||h.d.lab!==c.d.lab||!h.bb)continue;
  if(cl==='topo'){for(const [pid,pt] of Object.entries(h.parts))if((pt.k==='top'||pt.k==='above')&&dentroParte(h,pid,pos,0)){h.g.updateMatrixWorld();const y=pt.content.getWorldPosition(new THREE.Vector3()).y;if(!best||y>best.y)best={f:h,pid,y};}continue;}
  if(!(ACEITA[h.d.tipo]||[]).includes(cl))continue;
  const us=Object.entries(h.parts).filter(([pid,pt])=>pt.k==='under'||h.d.tipo==='lugar');
  if(us.length){for(const [pid,pt] of us)if(dentroParte(h,pid,pos,.03)){const a=pt.w*pt.d;if(!best||a<best.a)best={f:h,pid,a};}}
  else if(dentroBB(h,pos,-.05)){const a=(h.bb.max.x-h.bb.min.x)*(h.bb.max.z-h.bb.min.z);if(!best||a<best.a)best={f:h,pid:null,a};}}
 return best;}
/* refaz as relações (depois de construir, mover ou receber posições da planilha) */
export function relaciona(){for(const f of F){f.host=null;f.filhos=[];}
 for(const c of F){const h=hospedeiro(c,c.g.position);if(h&&(classeMovel(c.d)!=='topo'||Math.abs(h.y-c.g.position.y)<.08)){c.host=h;h.f.filhos.push({f:c,pid:h.pid});}}}
/* um gaveteiro embaixo de mesa/estante perde o "em cima" (o tampo do hospedeiro está logo acima) */
export const semTopo=f=>!!(f.host&&classeMovel(f.d)==='gav'&&f.host.f.d.tipo!=='lugar');
/* troca o laboratório de um móvel (rótulos dos meshes; o estilo é reaplicado por quem chama) */
export function mudaLab(f,lab){f.d.lab=lab;f.g.traverse(o=>{if(o.isMesh||o.isSprite)o.userData.lab=lab;});}
/* caixa do móvel no próprio referencial (não muda ao mover; calculada uma vez) */
export function bbLocal(f){if(f.bbL)return f.bbL;f.g.updateMatrixWorld(true);const inv=f.g.matrixWorld.clone().invert(),b=new THREE.Box3(),m4=new THREE.Matrix4();
 f.g.traverse(o=>{if(o.isMesh&&o.userData.base){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();b.union(o.geometry.boundingBox.clone().applyMatrix4(m4.multiplyMatrices(inv,o.matrixWorld)));}});return f.bbL=b;}
/* pontos de encaixe de um hospedeiro para um móvel: os do próprio móvel (gaveteiros sob o lado curto das mesas em L);
   senão, encostado no fundo do hospedeiro — centralizado (mesa sob armário/estante suspensa) ou numa ponta (gaveteiro sob bancada) */
export function slotsPara(h,c){const cl=classeMovel(c.d);if(cl==='gav'&&h.slots&&h.slots.length)return h.slots;if(h.d.tipo==='lugar')return [];
 const H=bbLocal(h),C=bbLocal(c);const z=H.min.z-C.min.z+.02;
 if(cl==='mesa')return [{x:(H.min.x+H.max.x)/2-(C.min.x+C.max.x)/2,z,rot:0}];
 return [{x:H.max.x-C.max.x-.06,z,rot:0}];}
/* encaixe enquanto arrasta um móvel de rodinha: devolve {x,y,z,rot,host} ou null quando não pode ficar ali */
export function encaixe(f,x,z){const cl=classeMovel(f.d);const p=new THREE.Vector3(x,0,z);
 if(cl==='topo'){const h=hospedeiro(f,p);if(!h)return null;const pt=h.f.parts[h.pid];const v=pt.content.worldToLocal(p.clone());const mx=Math.max(0,pt.w/2-.18),mz=Math.max(0,pt.d/2-.15);
  v.x=Math.max(-mx,Math.min(mx,v.x));v.z=Math.max(-mz,Math.min(mz,v.z));if(Math.hypot(v.x,v.z)<.12){v.x=0;v.z=0;}v.y=0;pt.content.localToWorld(v);return {x:v.x,y:h.y,z:v.z,rot:f.g.rotation.y,host:h};}
 let best=null;for(const h of F){if(h===f||h.d.lab!==f.d.lab||!(ACEITA[h.d.tipo]||[]).includes(cl))continue;
  for(const sl of slotsPara(h,f)){h.g.updateMatrixWorld();const w=h.g.localToWorld(new THREE.Vector3(sl.x,0,sl.z));const dd=Math.hypot(w.x-x,w.z-z);if(dd<.55&&(!best||dd<best.dd))best={dd,x:w.x,z:w.z,rot:h.g.rotation.y+sl.rot,h,pid:sl.parte};}}
 if(best)return {x:best.x,y:0,z:best.z,rot:best.rot,host:{f:best.h,pid:best.pid}};
 return {x,y:0,z,rot:f.g.rotation.y,host:hospedeiro(f,p)};}
export const partW=(f,pid)=>{const v=new THREE.Vector3();f.parts[pid].content.getWorldPosition(v);return v;};

M.forEach(d=>{const f={d,v:{hover:0},cut:0};const clay=new THREE.Color(d.real).lerp(new THREE.Color('#dedbd6'),.4);
 const b=(BUILD_ID[d.id]||BUILD[d.tipo])(f,'#'+clay.getHexString());f.g=b.g;f.parts=b.parts;f.slots=b.slots||[];f.g.position.set(...d.pos);f.g.rotation.y=d.rot;scene.add(f.g);F.push(f);
 for(const [pid,pt] of Object.entries(f.parts)){pt.halo.userData.halo={f,pid};halos.push(pt.halo);}
 for(const p of d.partes)buildContents(f,p.id);collect(f);measure(f);
 const pts=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a),0,Math.sin(a)));}
 const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineDashedMaterial({color:0x0077C8,dashSize:.1,gapSize:.07,transparent:true,opacity:0}));
 ring.computeLineDistances();ring.raycast=()=>{};ring.visible=false;scene.add(ring);f.ring=ring;f.ringO=0;measure(f);
 const bd=document.createElement('div');bd.className='badge';app.appendChild(bd);f.badge=bd;});
relaciona();


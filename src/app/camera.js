import * as THREE from 'three';
import { $, F, S } from './state.js';
import { IC } from './icons.js';
import { byLab } from './data.js';
import { tween } from './tween.js';
import { DIR, HOME, asp, camera, controls, fitD } from './scene.js';
import { OCC } from './room.js';
import { applyStyle } from './style.js';
import { partW } from './furniture.js';

/* ================= câmera ================= */
applyStyle();
camera.position.copy(HOME.t).addScaledVector(DIR,fitD(HOME.d));controls.update();
export const labChip=$('#labChip');
export function updateLabChip(){if(!S.lab){labChip.classList.remove('on');return;}labChip.innerHTML=`${IC.back}${IC.lab}<span>${byLab(S.lab).nome.replace('Laboratório de ','')}</span>`;labChip.classList.add('on');}
export function camTo(target,dist,dir,ms=620){const t0=controls.target.clone(),d0=camera.position.distanceTo(controls.target);const dir0=camera.position.clone().sub(controls.target).normalize();
 let d1=(dir||dir0).clone().normalize();const ang=dir0.angleTo(d1);if(ang>1.9)d1=dir0.clone().lerp(d1,1.9/ang).normalize();controls.enabled=false;
 tween({ms,key:'cam',update:p=>{controls.target.lerpVectors(t0,target,p);const dd=dir0.clone().lerp(d1,p).normalize();camera.position.copy(controls.target).addScaledVector(dd,d0+(dist-d0)*p);},done:()=>controls.enabled=true});
 S.focusT=target.clone();}
export const frontOf=f=>new THREE.Vector3(0,0,1).applyQuaternion(f.g.quaternion);
export function focusLab(id,quiet){S.lab=id;applyStyle();updateLabChip();if(!id){camTo(HOME.t,fitD(HOME.d),DIR);S.focusT=null;return;}const L=byLab(id);if(!quiet)camTo(L.c,fitD(L.d),DIR);}
export function ensureLab(f){if(S.lab!==f.d.lab){S.lab=f.d.lab;applyStyle();updateLabChip();}}
export const bvRay=new THREE.Raycaster(),bvR=new THREE.Ray(),bvH=new THREE.Vector3();
/* Procura o ângulo livre mais perto da frente do móvel. Usa a posição e a rotação atuais de cada móvel, então continua valendo depois de mudar a sala de lugar. */
export function bestDir(t,dist,pref,f){const keep=[];for(const o of OCC)if(o.mode==='keep')keep.push(...o.meshes);const ph=new THREE.Vector3(pref.x,0,pref.z).normalize();const y0=Math.atan2(ph.x,ph.z);const e0=Math.asin(Math.min(.98,pref.clone().normalize().y));
 const cur=camera.position.clone().sub(controls.target).normalize();const pts=[t];
 if(f&&f.bb){const b=f.bb,y=Math.min(b.max.y,t.y+.25);for(const x of[b.min.x,b.max.x])for(const z of[b.min.z,b.max.z])pts.push(new THREE.Vector3(x,y,z));}
 let best=pref.clone().normalize(),bs=1e9;
 for(const dy of[0,.35,-.35,.7,-.7,1.1,-1.1,1.6,-1.6,2.3,-2.3,Math.PI])for(const de of[0,.2,-.15,.4]){const el=Math.max(.38,Math.min(1.2,e0+de)),yw=y0+dy;
  const d=new THREE.Vector3(Math.sin(yw)*Math.cos(el),Math.sin(el),Math.cos(yw)*Math.cos(el));const cp=t.clone().addScaledVector(d,dist);let sc=Math.abs(dy)*.9+Math.abs(de)*.8+cur.angleTo(d)*.12;
  bvRay.set(cp,d.clone().negate());bvRay.far=dist-.15;if(bvRay.intersectObjects(keep,false).length)sc+=6;
  let tap=0;for(const p of pts){bvR.origin.copy(cp);bvR.direction.copy(p).sub(cp);const L=bvR.direction.length();bvR.direction.normalize();
   for(const g of F){if(g===f||!f||g.d.lab!==f.d.lab||!g.bb||g.d.tipo==='lugar')continue;const h=bvR.intersectBox(g.bb,bvH);if(h&&cp.distanceTo(bvH)<L-.1){tap++;break;}}}
  sc+=tap/pts.length*4;if(sc<bs){bs=sc;best=d;}}return best;}
export function focusF(f){ensureLab(f);let dist=Math.max(7.5,Math.min(13,f.size*5.4))*Math.pow(Math.max(1,1.2/asp()),.7);const t=f.center.clone();t.y=Math.min(t.y,1.2);
 const fr=frontOf(f);dist=Math.max(3.4,Math.min(7.5,f.size*2.4+1.8))*Math.pow(Math.max(1,1.2/asp()),.7);const dir=bestDir(t,dist,fr.clone().add(new THREE.Vector3(-.15,.85,.3)),f);camTo(t,dist,dir);}
export function focusPart(f,pid){ensureLab(f);const pt=f.parts[pid];const t=partW(f,pid);t.y+=pt.h*.35;const fr=frontOf(f);const side=new THREE.Vector3(fr.z,0,-fr.x);
 let dir,dist=Math.max(3.2,Math.min(6,Math.max(pt.w,.6)*3.4));
 if(pt.k==='drawer'){dir=fr.clone().multiplyScalar(.75).add(new THREE.Vector3(0,1.45,0)).addScaledVector(side,-.25).normalize();t.addScaledVector(fr,.36);dist=3.2;}
 else if(pt.k==='shelf'||pt.k==='under'){dir=fr.clone().add(new THREE.Vector3(0,.38,0)).addScaledVector(side,-.3).normalize();}
 else dir=fr.clone().multiplyScalar(.8).add(new THREE.Vector3(0,.95,0)).addScaledVector(side,-.35).normalize();
 dist*=Math.pow(Math.max(1,1.2/asp()),.7);dir=bestDir(t,dist,dir,f);camTo(t,dist,dir);}
export function focusOrg(f,pid,o){const g=f.parts[pid].orgG?.find(x=>x.userData.org===o.id);if(!g){focusPart(f,pid);return;}const t=new THREE.Vector3();g.getWorldPosition(t);t.y+=g.userData.H*.5;
 const fr=frontOf(f);const pt=f.parts[pid];const dir=(pt.k==='drawer'?fr.clone().multiplyScalar(.7).add(new THREE.Vector3(0,1.4,0)):fr.clone().add(new THREE.Vector3(0,.95,0))).normalize();
 if(pt.k==='drawer')t.addScaledVector(fr,.36);const dist=Math.max(1.9,Math.max(g.userData.W,g.userData.D)*6.5)*Math.pow(Math.max(1,1.2/asp()),.7);camTo(t,dist,bestDir(t,dist,dir,f));}
export const goHome=()=>{S.focusT=null;if(S.lab)focusLab(S.lab);else camTo(HOME.t,fitD(HOME.d),DIR);};
export function setOpen(f,pid,keep){for(const [id,pt] of Object.entries(f.parts)){if(!pt.obj&&!pt.slide)continue;const to=id===pid?1:0,from=pt.open;if(from===to)continue;
  tween({ms:to?520:360,ease:to?'spring':'out',key:f.d.id+id,update:p=>{pt.open=from+(to-from)*p;}});}
}
export function orgOpen(f,pid,oid,to){const g=f.parts[pid]?.orgG?.find(x=>x.userData.org===oid);if(!g)return;const from=g.userData.openAmt;
 tween({ms:to?560:340,ease:to?'spring':'out',key:'og'+oid,update:p=>{const v=from+(to-from)*p;g.userData.openAmt=v;if(g.userData.lid)g.userData.lid.rotation.x=-v*1.75;
  if(g.userData.drawers)g.userData.drawers[1].position.z=g.userData.D/2+v*g.userData.D*.45;g.userData.inner.visible=!g.userData.closed||v>.4;g.position.y=v*.012;}});}
/* móveis entre a câmera e o foco somem (corte) */
export let cutTick=0;
export function updateCut(){if(++cutTick%6)return;const tgt=S.focusT&&(S.stack.length||S.loc||S.carry&&S.carry.stage==='confirm');
 for(const f of F){let c=0;if(tgt&&!(S.stack[0]&&S.stack[0].f===f)&&!(S.carry&&S.carry.target&&S.carry.target.f===f)&&!(S.loc&&S.loc.f===f)){
   const cam=camera.position,to=S.focusT;const dCam=cam.distanceTo(to);const dF=cam.distanceTo(f.center);
   if(dF<dCam-.4){const ab=to.clone().sub(cam),ap=f.center.clone().sub(cam);const t=Math.max(0,Math.min(1,ap.dot(ab)/ab.lengthSq()));const cl=cam.clone().addScaledVector(ab,t);if(cl.distanceTo(f.center)<f.rad+.15)c=1;}}
  if(c){f.cutT=1;f.cutN=0;}else if(f.cutT&&++f.cutN>=5)f.cutT=0;}}



import * as THREE from 'three';
import { FADE, LITE, S, app } from './state.js';
import { LABS } from './data.js';
import { BGS, grid, hemi, labG, lamps, scene, sun, toonGrad } from './scene.js';
import { post } from './post.js';

/* ================= estilos ================= */
export const CLAYB={a:new THREE.Color('#5a6069'),b:new THREE.Color('#dedbd6'),c:new THREE.Color('#efe6d4'),e:new THREE.Color('#f7f8fa')};
export const ENVC={a:{floor:'#2c3138',env:'#1d2126',wall:'#3a3f47',cap:'#0b0d10',glass:'#3b5a78'},b:{floor:'#d9dcdf',env:'#b5bcc3',wall:'#efebe5',cap:'#2b3440'},
 c:{floor:'#ead7b0',env:'#c9a978',wall:'#f8efdc',cap:'#1a1a1a',glass:'#bfe0f0'},e:{floor:'#f7f8fa',env:'#e6eaee',wall:'#f7f8fa',cap:'#0b1b2e',paint:'#f7f8fa',glass:'#f7f8fa'}};
export const tmpC=new THREE.Color();
export function styleKey(o){if(S.edit){const f=o.userData.f;return (f&&f===S.sel)?S.style:'e';}return S.style;}
export const WASH={a:new THREE.Color('#252c35'),b:new THREE.Color('#e9edf1'),c:new THREE.Color('#f3e3c0'),e:new THREE.Color('#f1f4f7')};
export function wash(c,st){const l=c.r*.3+c.g*.59+c.b*.11;c.r+=(l-c.r)*.8;c.g+=(l-c.g)*.8;c.b+=(l-c.b)*.8;c.lerp(WASH[st],.66);}
export function matFor(o,st){const u=o.userData;const f1=FADE===1&&S.lab&&u.lab&&u.lab!==S.lab&&!u.shared;
 if(u.multi){for(const m of o.material){m.transparent=false;m.opacity=1;m.depthWrite=true;m.color.set(m.map?(st==='a'?'#7b8087':st==='c'?'#f3e3c2':'#ffffff'):(st==='a'?'#4a4f55':'#c4c9cc'));if(f1)wash(m.color,st);}o.castShadow=false;return;}
 const wantToon=st==='c'&&!u.op;
 if(wantToon&&!o.material.isMeshToonMaterial){u.std=u.std||o.material;u.toon=u.toon||new THREE.MeshToonMaterial({color:o.material.color.clone(),gradientMap:toonGrad,map:o.material.map||null,alphaMap:o.material.alphaMap||null,alphaTest:o.material.alphaTest||0,side:o.material.side});o.material=u.toon;}
 if(!wantToon&&o.material.isMeshToonMaterial)o.material=u.std;
 const r=u.role;tmpC.copy(u.base);
 if(r==='clay'){tmpC.lerp(CLAYB[st],st==='e'?1:.25);if(st==='a')tmpC.multiplyScalar(.8);}
 else if(r==='color'){if(st==='e')tmpC.lerp(CLAYB.e,.85);if(st==='a')tmpC.multiplyScalar(.85);}
 else if(r==='glass2'||r==='tile'){if(st==='a')tmpC.multiplyScalar(.6);if(st==='e')tmpC.lerp(CLAYB.e,.7);}
 else if(ENVC[st][r])tmpC.set(ENVC[st][r]);else if(r==='paint'&&st==='a')tmpC.multiplyScalar(.5);
 if(r==='bulb'){o.material.emissive=new THREE.Color(st==='a'?'#ffffff':'#000');o.material.emissiveIntensity=st==='a'?2.2:0;}
 const faded=f1;const op0=(st==='a'&&u.opA!=null)?u.opA:(u.op??1);if(f1)wash(tmpC,st);o.material.color.copy(tmpC);o.material.transparent=op0<1;o.material.opacity=((f1&&op0<1)?.5:1)*op0;o.material.depthWrite=op0>=1;if(r==='bulb'&&f1)o.material.emissiveIntensity=st==='a'?.3:0;o.castShadow=!faded&&op0>=1&&u.castOrig!==false;
 const needE=(st==='c'||st==='e')&&!faded;
 if(needE&&!u.edges&&!u.op&&o.geometry.type==='BoxGeometry'){const e=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,25),new THREE.LineBasicMaterial({color:0x1a1a1a,transparent:true,opacity:1}));e.raycast=()=>{};o.add(e);u.edges=e;}
 if(u.edges){u.edges.visible=needE;u.edges.material.color.set(st==='e'?'#0b1b2e':'#1a1a1a');u.edges.material.opacity=st==='e'?.75:1;}}
export function applyStyleTo(root){root.traverse(o=>{if(o.isMesh&&o.userData.base)matFor(o,styleKey(o));if(o.isSprite){const fd=FADE===1&&S.lab&&o.userData.lab&&o.userData.lab!==S.lab;o.material.opacity=fd?0:1;o.material.transparent=true;}});}
export function applyStyle(){const st=S.edit?'e':S.style;app.dataset.style=S.style;app.dataset.edit=S.edit?'1':'0';scene.background=BGS[st];
 for(const L of LABS)labG[L.id].traverse(o=>{if(o.isMesh)o.userData.lab=L.id;});applyStyleTo(scene);
 hemi.intensity=st==='a'?.34:st==='c'?1.25:st==='e'?1.4:1;hemi.color.set(st==='a'?'#9fb0c8':'#ffffff');hemi.groundColor.set(st==='a'?'#202329':'#c9d1d9');
 sun.intensity=st==='a'?.35:st==='c'?1.1:st==='e'?.6:1.6;sun.color.set(st==='a'?'#9db7ff':'#fff6ea');sun.castShadow=st!=='e';sun.shadow.radius=st==='c'?1:6;
 lamps.forEach(l=>{l.pl.intensity=st==='a'?(l.I||14):0;});grid.visible=S.edit;
 if(post){post.gtao.enabled=!LITE&&(st==='a'||st==='b');post.bloom.enabled=!LITE&&st==='a';}
 document.querySelectorAll('#styles .sw').forEach(s=>s.classList.toggle('on',s.dataset.v===S.style));}


import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { app } from './state.js';
import { P } from './icons.js';
import { CL, LABS } from './data.js';

/* ================= cena ================= */
export const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.domElement.className='main';app.prepend(renderer.domElement);
export const scene=new THREE.Scene();
export const camera=new THREE.PerspectiveCamera(26,1,.05,200);
export const HOME={t:new THREE.Vector3(1.0,.2,.2),d:25};export const DIR=new THREE.Vector3(-.35,.95,1).normalize();
export const asp=()=>app.clientWidth/app.clientHeight;export const fitD=d=>d*Math.pow(Math.max(1,1.55/asp()),.85);
camera.position.copy(HOME.t).addScaledVector(DIR,HOME.d);
export const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(HOME.t);controls.enableDamping=true;controls.dampingFactor=.12;
controls.minDistance=.9;controls.maxDistance=60;controls.minPolarAngle=.35;controls.maxPolarAngle=1.25;controls.update();
export const hemi=new THREE.HemisphereLight(0xffffff,0xc9d1d9,1);scene.add(hemi);
export const sun=new THREE.DirectionalLight(0xfff6ea,1.6);sun.position.set(7,12,7);sun.target.position.set(2.5,0,0);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-10,right:10,top:9,bottom:-9,near:1,far:45});sun.shadow.bias=-.0005;sun.shadow.radius=6;scene.add(sun);
export function bgTex(c1,c2){const c=document.createElement('canvas');c.width=2;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,0,2,256);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
export const BGS={a:bgTex('#2a313b','#0e1115'),b:bgTex('#e4edf6','#f6f2ec'),c:bgTex('#F6E7C8','#F1DDB4'),e:bgTex('#f4f6f9','#eef1f5')};scene.background=BGS.b;
export const toonGrad=(()=>{const d=new Uint8Array([90,170,255]);const t=new THREE.DataTexture(d,3,1,THREE.RedFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t;})();
export function mesh(parent,geo,hex,role,x=0,y=0,z=0,o={}){const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:hex,roughness:o.r??.82,metalness:o.m??0}));
 m.position.set(x,y,z);m.castShadow=o.cast??true;m.receiveShadow=true;m.userData.base=new THREE.Color(hex);m.userData.role=role;parent.add(m);return m;}
export const box=(p,w,h,d,x,y,z,hex,role='clay',o)=>mesh(p,new THREE.BoxGeometry(w,h,d),hex,role,x,y,z,o);
export const cyl=(p,r,h,x,y,z,hex,role='clay',seg=28)=>mesh(p,new THREE.CylinderGeometry(r,r,h,seg),hex,role,x,y,z);

/* sprites de ícone e número */
export const iconTex={},numTex={};
export function iconTexture(cl){if(iconTex[cl])return iconTex[cl];const k=CL[cl];const c=document.createElement('canvas');c.width=c.height=128;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;iconTex[cl]=t;
 const x=c.getContext('2d');x.fillStyle=k.c;x.beginPath();x.arc(64,64,58,0,7);x.fill();x.lineWidth=6;x.strokeStyle='rgba(255,255,255,.85)';x.stroke();
 const img=new Image();img.onload=()=>{x.drawImage(img,30,30,68,68);t.needsUpdate=true;};
 img.src='data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="68" height="68" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${P[k.i]}</svg>`);return t;}
export function numTexture(s){if(numTex[s])return numTex[s];const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d');
 x.fillStyle='rgba(11,27,46,.88)';const w=Math.min(124,30+s.length*22);x.beginPath();x.roundRect((128-w)/2,8,w,48,24);x.fill();x.fillStyle='#fff';x.font='600 34px "Barlow Condensed",Barlow,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(s,64,33);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;numTex[s]=t;return t;}
export function sprite(tex,size){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthWrite:false,alphaTest:.05}));s.scale.set(size,size*(tex.image.height/tex.image.width),1);s.raycast=()=>{};s.userData.sprite=true;return s;}

/* ---------- laboratórios ---------- */
export const labG={};export const RZ=3.5,WH=2.6;
for(const L of LABS){const g=new THREE.Group();g.userData.lab=L.id;scene.add(g);labG[L.id]=g;}
export const grid=new THREE.GridHelper(16,64,0x0077C8,0x9FB1C2);grid.material.transparent=true;grid.material.opacity=.35;grid.position.set(1.4,.004,0);grid.visible=false;scene.add(grid);
export const lamps=[];


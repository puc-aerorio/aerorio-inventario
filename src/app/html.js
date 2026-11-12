import * as THREE from 'three';
import { $, S, app } from './state.js';
import { IC, P } from './icons.js';
import { CL, etqOf, stats } from './data.js';

/* ================= utilidades ================= */
export const clsH=(c,extra='')=>{const k=CL[c];return `<span class="cls ${extra}" style="--c:${k.c}" data-cl="${c}"><span class="ic"><svg viewBox="0 0 24 24">${P[k.i]}</svg></span><span class="nm">${k.n}</span></span>`;};
export function odoH(v){return `<span class="odo" data-v="${v}">${String(v).split('').map(d=>`<span class="d"><span class="col" style="transform:translateY(-${+d*10}%)">${'0123456789'.split('').map(x=>`<span>${x}</span>`).join('')}</span></span>`).join('')}</span>`;}
export function odoSet(el,v){if(!el)return;const s=String(v);if(s.length!==String(el.dataset.v).length){el.outerHTML=odoH(v);return;}el.dataset.v=v;[...el.querySelectorAll('.col')].forEach((c,i)=>c.style.transform=`translateY(-${+s[i]*10}%)`);}
export function qrSvg(text){let h=2166136261;for(const ch of text){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}const n=17;let r='';
 const fin=(x,y)=>`<rect x="${x}" y="${y}" width="7" height="7" fill="#111"/><rect x="${x+1}" y="${y+1}" width="5" height="5" fill="#fff"/><rect x="${x+2}" y="${y+2}" width="3" height="3" fill="#111"/>`;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){if((x<8&&y<8)||(x>8&&y<8)||(x<8&&y>8))continue;h^=h<<13;h^=h>>>17;h^=h<<5;if((h>>>0)%2)r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="#111"/>`;}
 return `<svg viewBox="-1 -1 19 19"><rect x="-1" y="-1" width="19" height="19" fill="#fff"/>${r}${fin(0,0)}${fin(10,0)}${fin(0,10)}</svg>`;}
export const tagH=(node,ref)=>node.etq?`<span class="plabel" data-tag="${ref}">${qrSvg(etqOf(node.etq).t)}${etqOf(node.etq).t}</span>`:`<button class="tagbtn" data-tag="${ref}">${IC.tag}Etiquetar</button>`;
export const cntH=(st,opt={})=>`<span class="cnts"><span class="cnt" title="unidades">${IC.stack}${odoH(st.u)}</span>${st.org||opt.org?`<span class="cnt" title="organizadores">${IC.box}${odoH(st.org)}</span>`:''}${st.al?`<span class="cnt w" title="alertas">${IC.alert}${odoH(st.al)}</span>`:''}</span>`;
export const clsNH=st=>`<div class="clsrow">${Object.entries(st.cls).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`<span class="clsn">${clsH(c)}<b>${n}</b></span>`).join('')}</div>`;
export const clsIconsH=st=>Object.keys(st.cls).slice(0,5).map(c=>clsH(c,'sm')).join('');
export function heroH(n){const st=stats(n);return `<div class="hero"><div class="big"><span class="n">${odoH(st.u)}</span><span class="c">unidades</span></div>${clsNH(st)}<span style="flex:1"></span><span class="cnts">${st.org?`<span class="cnt" title="organizadores">${IC.box}${odoH(st.org)}</span>`:''}${st.al?`<span class="cnt w" title="alertas">${IC.alert}${odoH(st.al)}</span>`:''}</span></div>`;}
/* desenho 2D dos organizadores: pequena isometria */
export function shade(hex,f){const c=new THREE.Color(hex);c.multiplyScalar(f);return '#'+c.getHexString();}
/* desenhos 2D dos organizadores (isometria nos cards, frente nas pilhas) */
export const OH={caixaTrava:15,gavetinhas:22,maleta:11,maletaT:13,cesto:10,ferramentas:16,divisorias:7,papelao:16,saco:14};
export function orgIso(tipo,cor){const top=shade(cor,1.25),l=cor,r=shade(cor,.75);const D=12,h=OH[tipo]||14,y0=34-h;
 const face=(yy,hh,fl=l,fr=r,op=1)=>`<path d="M2 ${yy} L22 ${yy+D/2} L22 ${yy+D/2+hh} L2 ${yy+hh}Z" fill="${fl}" fill-opacity="${op}"/><path d="M22 ${yy+D/2} L42 ${yy} L42 ${yy+hh} L22 ${yy+D/2+hh}Z" fill="${fr}" fill-opacity="${op}"/>`;
 const topf=(yy,fill,op=1)=>`<path d="M2 ${yy} L22 ${yy-D/2} L42 ${yy} L22 ${yy+D/2}Z" fill="${fill}" fill-opacity="${op}"/>`;
 const vid='#cfe0ea',vidE='#9fb6c4';let s='';
 if(tipo==='saco')s=`<ellipse cx="22" cy="27" rx="19" ry="9" fill="${l}"/><ellipse cx="22" cy="23" rx="16" ry="7" fill="${top}"/><path d="M8 23 Q22 30 36 23" stroke="${r}" stroke-width="1.5" fill="none"/>`;
 else if(tipo==='caixaTrava'||tipo==='divisorias'){s=face(y0,h,vid,vidE,.85)+topf(y0,'#e6f0f6',.9)+`<path d="M2 ${y0} L22 ${y0+D/2} L42 ${y0}" stroke="${vidE}" stroke-width="1" fill="none"/>`;
  if(tipo==='caixaTrava')s+=`<rect x="5" y="${y0+1}" width="3" height="6" rx="1" fill="${cor}"/><rect x="36" y="${y0+1}" width="3" height="6" rx="1" fill="${cor}"/>`;
  else for(let k=1;k<4;k++)s+=`<path d="M${2+k*5} ${y0+k*1.5} L${22+k*5} ${y0+k*1.5-D/2}" stroke="${cor}" stroke-width="1.4"/>`;}
 else if(tipo==='maletaT'){s=face(y0+4,h-4,l,r)+topf(y0+4,'#e6f0f6',.85)+`<path d="M2 ${y0+4} L22 ${y0+D/2+4} L42 ${y0+4}" stroke="#1c1c1c" stroke-width="1.6" fill="none"/><path d="M17 ${y0+2} q5 -6 10 0" stroke="#1c1c1c" stroke-width="2.2" fill="none"/>`;}
 else if(tipo==='cesto'){s=face(y0,h,l,r)+topf(y0,shade(cor,.7));for(let k=0;k<3;k++)s+=`<rect x="${5+k*5}" y="${y0+4+k*2.4}" width="3" height="${h-7}" fill="${shade(cor,.55)}"/><rect x="${25+k*5}" y="${y0+6-k*2.4}" width="3" height="${h-7}" fill="${shade(cor,.45)}"/>`;}
 else if(tipo==='papelao'){s=face(y0,h,l,r)+topf(y0,shade(cor,.65))+`<path d="M2 ${y0} L-1 ${y0-6} L19 ${y0-12} L22 ${y0-D/2}Z" fill="${top}"/><path d="M42 ${y0} L45 ${y0-6} L25 ${y0-12} L22 ${y0-D/2}Z" fill="${shade(cor,1.1)}"/><rect x="6" y="${y0+6}" width="10" height="5" fill="#fff" transform="skewY(17)"/>`;}
 else{s=face(y0,h)+topf(y0,top);
  if(tipo==='maleta'||tipo==='ferramentas')s+=`<path d="M17 ${y0-1} q5 -${tipo==='ferramentas'?5:7} 10 0" stroke="${shade(cor,.5)}" stroke-width="2.5" fill="none"/><path d="M2 ${y0+h*.45} L22 ${y0+h*.45+D/2} L42 ${y0+h*.45}" stroke="${shade(cor,.55)}" stroke-width="1" fill="none"/>`;
  if(tipo==='gavetinhas')for(let k=0;k<2;k++){const yy=y0+4+k*h/2.2;s+=`<path d="M5 ${yy+2} L19 ${yy+8}" stroke="${top}" stroke-width="1.4"/><rect x="9" y="${yy+3.5}" width="5" height="2.2" fill="#c8302c" transform="skewY(22)"/>`;}}
 return `<svg class="iso" viewBox="-2 0 48 38">${s}</svg>`;}
export function orgFront(tipo,cor){const r=shade(cor,.7);const h={caixaTrava:12,gavetinhas:16,maleta:10,maletaT:11,cesto:8,ferramentas:13,divisorias:6,papelao:13,saco:10}[tipo]||10;let s='';
 if(tipo==='caixaTrava'||tipo==='divisorias')s=`<rect x="2" y="${20-h}" width="20" height="${h}" rx="2" fill="#cfe0ea" stroke="#9fb6c4"/>`+(tipo==='caixaTrava'?`<rect x="1" y="${21-h}" width="3" height="5" fill="${cor}"/><rect x="20" y="${21-h}" width="3" height="5" fill="${cor}"/>`:`<path d="M7 ${21-h}v${h-2}M12 ${21-h}v${h-2}M17 ${21-h}v${h-2}" stroke="${cor}" stroke-width="1.2"/>`);
 else if(tipo==='maletaT')s=`<rect x="2" y="${20-h}" width="20" height="${h}" rx="2" fill="${cor}"/><rect x="2" y="${20-h}" width="20" height="3" fill="#cfe0ea"/><path d="M9 ${20-h} q3 -4 6 0" stroke="#1c1c1c" stroke-width="2" fill="none"/>`;
 else if(tipo==='saco')s=`<rect x="2" y="${20-h}" width="20" height="${h}" rx="5" fill="${cor}"/>`;
 else{s=`<rect x="2" y="${20-h}" width="20" height="${h}" rx="2" fill="${cor}"/>`;
  if(tipo==='maleta'||tipo==='ferramentas')s+=`<path d="M9 ${20-h} q3 -4 6 0" stroke="${r}" stroke-width="2" fill="none"/><path d="M2 ${20-h*.5}h20" stroke="${r}" stroke-width="1"/>`;
  if(tipo==='gavetinhas')s+=`<path d="M4 ${20-h*.5}h16" stroke="${r}" stroke-width="1.2"/><rect x="9" y="${20-h*.78}" width="6" height="2" fill="#c8302c"/><rect x="9" y="${20-h*.3}" width="6" height="2" fill="#c8302c"/>`;
  if(tipo==='cesto')s+=`<path d="M6 ${22-h}v${h-4}M10 ${22-h}v${h-4}M14 ${22-h}v${h-4}M18 ${22-h}v${h-4}" stroke="${shade(cor,.55)}" stroke-width="1.6"/>`;
  if(tipo==='papelao')s+=`<rect x="6" y="${23-h}" width="12" height="4" fill="#fff"/>`;}
 return `<svg viewBox="0 0 24 22">${s}</svg>`;}
export const ostackH=orgs=>orgs.length?`<span class="ostack" title="${orgs.length} organizador${orgs.length>1?'es':''}">${orgs.slice(0,3).map(o=>orgFront(o.tipo,o.cor)).join('')}${orgs.length>3?`<em>+${orgs.length-3}</em>`:''}</span>`:'';
export let toastT;export function toast(html,undo,ms=4200){const t=$('#toast');t.innerHTML=`<span>${html}</span>${undo?'<button>Desfazer</button>':''}`;t.classList.add('on');
 if(undo)t.querySelector('button').onclick=()=>{undo();t.classList.remove('on');};clearTimeout(toastT);if(ms)toastT=setTimeout(()=>t.classList.remove('on'),ms);}
export const relRect=el=>{const a=app.getBoundingClientRect(),r=el.getBoundingClientRect();return {x:r.left-a.left,y:r.top-a.top,w:r.width,h:r.height};};
export const can=()=>S.role!=='vis';export const isAdmin=()=>S.role==='admin';


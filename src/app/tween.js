import { app } from './state.js';

/* ================= tweens ================= */
export const tweens=new Set(),owners=new Map();
export const EASE={out:p=>1-Math.pow(1-p,3),inout:p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,spring:p=>1-Math.cos(p*Math.PI*2.6)*Math.exp(-p*6.5),lin:p=>p,back:p=>{const c1=1.5,c3=c1+1;return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2);}};
export function tween({ms,ease='out',update,done,delay=0,key}){if(key&&owners.has(key))tweens.delete(owners.get(key));
 const t={t0:performance.now()+delay,ms,ease:EASE[ease],update,done,key};tweens.add(t);if(key)owners.set(key,t);return t;}
export function runTweens(now){for(const t of [...tweens]){if(now<t.t0)continue;const p=t.ms<=0?1:Math.min(1,(now-t.t0)/t.ms);t.update(t.ease(p),p);
 if(p>=1){tweens.delete(t);if(t.key&&owners.get(t.key)===t)owners.delete(t.key);t.done&&t.done();}}}
export const wait=ms=>new Promise(r=>setTimeout(r,ms));
export function fly(from,to,html,ms=560,done){const f=document.createElement('div');f.className='fly glass';f.innerHTML=html;app.appendChild(f);
 tween({ms,ease:'inout',update:p=>{const q=1-p,cx=(from.x+to.x)/2,cy=Math.min(from.y,to.y)-90;f.style.left=(q*q*from.x+2*q*p*cx+p*p*to.x)+'px';f.style.top=(q*q*from.y+2*q*p*cy+p*p*to.y)+'px';f.style.transform=`scale(${1-.25*p})`;f.style.opacity=p>.85?(1-p)/.15:1;},
  done:()=>{f.remove();done&&done();}});}


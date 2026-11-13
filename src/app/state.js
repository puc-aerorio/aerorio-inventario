import * as THREE from 'three';

/* celular (toque) começa no modo leve, sem pós-processamento; #full na URL força o completo */
export const TOQUE=matchMedia('(pointer:coarse)').matches;
export const LITE=location.hash.includes('lite')||(TOQUE&&!location.hash.includes('full'));
/* lab não selecionado: 1 = apagado por material (modo leve e celular) · 3 = desfocado em passe separado (modo completo) */
export const FADE=(LITE||matchMedia('(pointer:coarse)').matches||innerWidth<=820)?1:3;
export const F=[];export const pick=[];export const halos=[];export const ray=new THREE.Raycaster();
export const $=s=>document.querySelector(s);export const app=$('#app');
export const mob=()=>innerWidth<=820;
export const S={style:'b',role:'mem',lab:null,sel:null,stack:[],carry:null,mode:'nav',edit:false,hover:null,hoverPart:null,focusAmt:0,pal:null,vist:null,oc:null,loc:null,last:null,openRow:null};


/* desenho sob demanda: qualquer mudança visual pede alguns quadros */
export const RENDER={ate:0,quadros:0,soma:0};
export function wake(ms=1800){RENDER.ate=Math.max(RENDER.ate,performance.now()+ms);}
/* ganchos para módulos que vêm depois (celular) */
export const UIH={};

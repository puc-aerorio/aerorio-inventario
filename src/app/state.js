import * as THREE from 'three';

export const LITE=location.hash.includes('lite');
/* lab não selecionado: 1 = apagado por material (modo leve e celular) · 3 = desfocado em passe separado (modo completo) */
export const FADE=(LITE||matchMedia('(pointer:coarse)').matches||innerWidth<=820)?1:3;
export const F=[];export const pick=[];export const halos=[];export const ray=new THREE.Raycaster();
export const $=s=>document.querySelector(s);export const app=$('#app');
export const mob=()=>innerWidth<=820;
export const S={style:'b',role:'mem',lab:null,sel:null,stack:[],carry:null,mode:'nav',edit:false,hover:null,hoverPart:null,focusAmt:0,pal:null,vist:null,oc:null,loc:null,last:null,openRow:null};


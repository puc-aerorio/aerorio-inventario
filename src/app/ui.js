import * as THREE from 'three';
import { $, F, FADE, LITE, RENDER, S, UIH, WL, app, halos, mob, pick, ray, wake } from './state.js';
import { IC, P } from './icons.js';
import { BUY, CL, COMPRADOS, DAY, E, ESTADOS, ETQ, IT, ITEMS, LABS, LOG, M, NIVEIS, O, OCOL, OT, OTK, PESSOAS, RECADO, SEM, SPECK, SZ, TIPOEMP, TRANSP, U, alertsOf, allLoc, byLab, clean, countable, etqOf, findOrg, identOp, isAlert, locE, log, norm, orgName, partName, pathOf, resetDemo, save, stats, sugCl, touch, uid, unitsOf, usedEtq, walk, orgH, orgSz, tamsOf } from './data.js';
import { can, clsH, clsIconsH, cntH, heroH, isAdmin, odoH, odoSet, orgFront, orgIso, ostackH, qrSvg, relRect, tagH, toast } from './html.js';
import { fly, runTweens, tween, tweens, wait } from './tween.js';
import { DIR, camera, controls, fitD, labG, renderer, scene } from './scene.js';
import { LABGLOW, OCC, OFF, PLANTA_R, atrasDeParede, occAgora, fyW, inLab, roomTick, setRecado, viewMode } from './room.js';
import { GH, ghostPost, ghostPre, post } from './post.js';
import { applyStyle, applyStyleTo } from './style.js';
import { buildContents, buildOrg, byId, measure, partW, piece, ACEITA, bbLocal, classeMovel, encaixe, mudaLab, relaciona, semTopo } from './furniture.js';
import { bestDir, frontOf, camTo, ensureLab, focusF, focusLab, focusOrg, focusPart, goHome, labChip, orgOpen, setOpen, updateCut, updateLabChip } from './camera.js';

/* ================= laboratório (primeiro nível) ================= */
labChip.onclick=()=>{if(S.carry)return;closeStack(true);deselect();focusLab(null);};

/* ================= card ancorado ================= */
export const acard=$('#acard');
export function select(f){ensureLab(f);S.sel=f;const d=f.d;const st=stats(d);
 acard.innerHTML=`<div>${tagH(d,'m:'+d.id)}</div><h3>${d.nome} <span class="code">${d.cod}</span></h3>${heroH(d)}
  <div class="acts"><button class="pill pri" data-a="open">${IC.open}Abrir</button><button class="pill" data-a="guardar" data-need="m">${IC.in}Guardar aqui</button></div>`;
 acard.classList.add('on');placeOverlays();}
export function deselect(){S.sel=null;acard.classList.remove('on');}
acard.addEventListener('click',e=>{const t=e.target.closest('[data-tag]');if(t)return tagPop(t);const b=e.target.closest('[data-a]');if(!b||!S.sel)return;
 if(b.dataset.a==='open')openStack([{t:'m',f:S.sel}]);else openPalette('aqui',{dest:{f:S.sel}},b);});

/* ================= pilha de cards ================= */
export const stackEl=$('#stack');
/* lixo e materiais são só áreas: abrem direto no conteúdo, sem o nível do móvel */
export const areaUnica=f=>f&&f.d.tipo==='lugar'&&f.d.partes.length===1;
export function openStack(entries){entries=entries.filter((e,i)=>!(e.t==='m'&&areaUnica(e.f)&&entries[i+1]&&entries[i+1].f===e.f));acard.classList.remove('on');S.sel=entries[0].f;ensureLab(entries[0].f);
 [...stackEl.querySelectorAll('.scard')].forEach(c=>c.remove());S.stack=[];entries.forEach((e,i)=>pushCard(e,i<entries.length-1));home();}
export function pushCard(e,silent){wake();if(e.t==='m'&&areaUnica(e.f))e={t:'p',f:e.f,p:e.f.d.partes[0]};S.stack.push(e);UIH.sheetFor&&UIH.sheetFor(e.t);wake();const el=document.createElement('div');el.className='scard glass'+(silent?'':' enter');stackEl.appendChild(el);e.el=el;
 renderCard(e);layoutStack();if(!silent)requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.remove('enter')));if(!silent||S.stack.length)onTop();}
export function popTo(i){wake();while(S.stack.length-1>i){const e=S.stack.pop();e.el.classList.add('leave');const el=e.el;setTimeout(()=>el.remove(),320);if(e.t==='o')orgOpen(e.f,e.p.id,e.o.id,0);}layoutStack();onTop();}
export function closeStack(quiet){wake();S.stack.forEach(e=>{e.el.classList.add('leave');const el=e.el;setTimeout(()=>el.remove(),320);if(e.t==='o')orgOpen(e.f,e.p.id,e.o.id,0);});const f=S.stack[0]&&S.stack[0].f;S.stack=[];if(f)setOpen(f,null);
 setHoverPart(null);deselect();home();if(!quiet)goHome();}
export function layoutStack(){const n=S.stack.length;S.stack.forEach((e,i)=>{const depth=n-1-i;e.el.style.top=(i*50)+'px';e.el.style.zIndex=i;e.el.style.transform=depth?`scale(${1-depth*.025})`:'';e.el.classList.toggle('under',!!depth);});}
export function onTop(){const top=S.stack[S.stack.length-1];if(!top)return;const f=top.f;
 if(top.t==='m'){setOpen(f,null);focusF(f);}
 else if(top.t==='p'){setOpen(f,top.p.id);if(areaUnica(f))focusF(f);else focusPart(f,top.p.id);}
 else if(top.t==='o'){setOpen(f,top.p.id);orgOpen(f,top.p.id,top.o.id,1);focusOrg(f,top.p.id,top.o);}}
stackEl.addEventListener('click',ev=>{const card=ev.target.closest('.scard');if(!card)return;const i=S.stack.findIndex(x=>x.el===card);
 if(i<S.stack.length-1){popTo(i);return;}handleCard(ev,S.stack[i]);});
stackEl.addEventListener('mouseover',ev=>{const s=ev.target.closest('[data-part]');const top=S.stack[S.stack.length-1];if(s&&top&&top.t==='m')setHoverPart({f:top.f,pid:s.dataset.part},'card');});
stackEl.addEventListener('mouseout',ev=>{const s=ev.target.closest('[data-part]');if(s&&!s.contains(ev.relatedTarget))setHoverPart(null,'card');});
export function nodeOf(e){return e.t==='m'?e.f.d:e.t==='p'?e.p:e.t==='o'?e.o:null;}
export function refOf(e){return e.t==='m'?'m:'+e.f.d.id:e.t==='p'?`p:${e.f.d.id}/${e.p.id}`:'o:'+e.o.id;}
export const visParts=(f,carry)=>f.d.partes.filter(p=>p.id!=='A'||(!semTopo(f)&&(p.itens.length||p.orgs.length||carry)));
export function cardHead(e){const i=S.stack.indexOf(e);const prev=S.stack[i-1];
 const back=prev?`<button class="back" data-b="back">${IC.back}${prev.t==='m'?prev.f.d.nome:prev.t==='p'?partName(prev.f.d,prev.p):prev.t==='o'?orgName(prev.o):''}</button>`:`<button class="back" data-b="close">${IC.back}${byLab(e.f.d.lab).nome.replace('Laboratório de ','Lab. de ')}</button>`;
 let nav='',title='',tag='',code='';
 if(e.t==='m'){nav=`<span class="nav"><button data-b="prev" title="Móvel anterior">${IC.back}</button><button data-b="next" title="Próximo móvel">${IC.next}</button></span>`;title=e.f.d.nome;tag=tagH(e.f.d,refOf(e));code=e.f.d.cod;}
 if(e.t==='p'&&areaUnica(e.f)){nav=`<span class="nav"><button data-b="prev" title="Móvel anterior">${IC.back}</button><button data-b="next" title="Próximo móvel">${IC.next}</button></span>`;title=e.f.d.nome;tag=tagH(e.p,refOf(e));code=e.f.d.cod;}
 else if(e.t==='p'){const ps=visParts(e.f,false);const tb=['mesa','serra','bancada','computador'].includes(e.f.d.tipo);
  nav=`<span class="nav mmap"><button data-b="pprev">${IC.back}</button><span class="msil ${tb?'tb':''}" title="Partes do móvel">${ps.map(p=>`<i class="${p===e.p?'on':''}" data-goto="${p.id}"></i>`).join('')}</span><button data-b="pnext">${IC.next}</button></span>`;
  title=partName(e.f.d,e.p);tag=tagH(e.p,refOf(e));code=e.f.d.cod+'-'+e.p.id;}
 if(e.t==='o'){title=orgName(e.o);tag=tagH(e.o,refOf(e));code='ORG-'+e.o.id.toUpperCase();}
 if(e.t==='i'||e.t==='ed'){const it=IT(e.x.e);return `<div class="sh"><div class="row1">${back}</div>${e.t==='ed'?'<div class="kick">Editar cadastro</div>':''}<h3>${clsH(e.t==='ed'?e.ed.cl:it.cl)}${e.t==='ed'?e.ed.nome||it.nome:it.nome}</h3></div>`;}
 const ren=((e.t==='p'&&!areaUnica(e.f))||e.t==='o')?`<button class="ren" data-b="ren" data-need="m" title="Renomear">${IC.edit}</button>`:'';
 return `<div class="sh"><div class="row1">${back}${nav}</div><div class="tagrow">${tag}</div><h3>${e.t==='o'?orgIso(e.o.tipo,e.o.cor):''}<span class="tt">${title}</span>${ren} <span class="code">${code}</span></h3></div>`;}
export function subH(f,p){const st=stats(p);const carry=S.carry;const dis=carry&&p.cheia;const empty=!st.u&&!p.orgs.length;
 return `<div class="sub ${carry&&!dis?'drop':''} ${dis?'dis':''} ${empty?'empty':''} ${S.hoverPart&&S.hoverPart.f===f&&S.hoverPart.pid===p.id?'hov':''} ${p.id==='A'?'above':''}" data-part="${p.id}">
  <span class="sn">${partName(f.d,p)}${p.etq&&!p.etqNome?`<span class="plabel" style="pointer-events:none;font-size:.62rem">${etqOf(p.etq).t}</span>`:''}${p.cheia?'<span class="full">CHEIA</span>':''}</span>${empty?'<span class="cnt" style="font-size:.8rem">vazio</span>':cntH({u:st.u,org:0,al:st.al})}
  ${empty?'':`<div class="sx"><span class="clsrow">${clsIconsH(st)}</span>${ostackH(p.orgs)}</div>`}</div>`;}
export function silhH(f){const d=f.d,ps=visParts(f,!!S.carry);const g=id=>d.partes.find(p=>p.id===id);const above=ps.find(p=>p.id==='A');let h=semTopo(f)?`<button class="hostTop" data-b="vai" data-id="${f.host.f.d.id}">${IC.up||''}<span>Embaixo de <b>${f.host.f.d.nome}</b></span></button>`:above?subH(f,above):'';
 if(d.tipo==='suspenso'){h+=`<div class="cab sus">${ps.filter(p=>p.id==='PE'||p.id==='PD').map(p=>`<div class="lvl">${subH(f,p)}</div>`).join('')}</div>`;const u=ps.find(p=>p.id==='U');if(u)h+=`<div class="susU"><i></i>${subH(f,u)}<i></i></div>`;return `<div class="silh">${h}</div>`;}
 if(d.tipo==='lugar'){h+=`<div class="lugarS">${ps.map(p=>subH(f,p)).join('')}</div>`;return `<div class="silh">${h}</div>`;}
 if(d.tipo==='estSusp'){h+=`<div class="shv">${ps.filter(p=>p.id[0]==='N').map(p=>`<div class="lvl">${subH(f,p)}</div>`).join('')}</div>`;const u=ps.find(p=>p.id==='U');if(u)h+=`<div class="susU"><i></i>${subH(f,u)}<i></i></div>`;return `<div class="silh">${h}</div>`;}
 if(d.tipo==='estante'||d.tipo==='estanteAlta')h+=`<div class="shv">${ps.filter(p=>p.id[0]==='N').map(p=>`<div class="lvl">${subH(f,p)}</div>`).join('')}</div>`;
 else if(d.tipo==='armario')h+=`<div class="cab">${ps.filter(p=>p.id[0]==='P').map(p=>`<div class="lvl">${subH(f,p)}</div>`).join('')}</div>`;
 else if(d.tipo==='gaveteiro'||d.tipo==='gavvol'||d.tipo==='gavfixo')h+=`<div class="gvb">${ps.filter(p=>p.id[0]==='G').map(p=>subH(f,p)).join('')}</div>`;
 else if(d.tipo==='gavazul')h+=`<div class="gvb az">${ps.filter(p=>p.id[0]==='B').map(p=>subH(f,p)).join('')}</div>`;
 else{const gs=ps.filter(p=>p.id[0]==='G');h+=`<div class="tbl"><div class="tt">${subH(f,g('T'))}${g('T2')?subH(f,g('T2')):''}</div><div class="lg">${g('U')?subH(f,g('U')):'<div style="height:46px;flex:1"></div>'}${g('U2')?subH(f,g('U2')):''}${gs.length?`<div class="gvb mini">${gs.map(p=>subH(f,p)).join('')}</div>`:''}<div class="floor"></div></div></div>`;}
 /* partes que o desenho não cobre (Ao lado, Atrás…): faixa própria, para todas serem alcançáveis pelo card */
 const usadas=new RegExp(d.tipo==='estante'||d.tipo==='estanteAlta'?'^(A|N.*)$':d.tipo==='armario'?'^(A|P.*)$':/^(gaveteiro|gavvol|gavfixo)$/.test(d.tipo)?'^(A|G.*)$':d.tipo==='gavazul'?'^(A|B.*)$':'^(A|T|T2|U|U2|G.*)$');
 const resto=ps.filter(p=>!usadas.test(p.id));if(resto.length)h+=`<div class="flbl" style="margin-top:8px">Outros lugares</div><div class="lugarS">${resto.map(p=>subH(f,p)).join('')}</div>`;
 return `<div class="silh">${h}</div>`;}
export function renderCard(e){const sc=e.el.querySelector('.sb')?.scrollTop||0;let b='';
 if(e.t==='m'){b+=heroH(e.f.d)+encaixeH(e.f)+silhH(e.f)+filhosH(e.f,null);}
 else if(e.t==='p'){const p=e.p;b+=heroH(p)+filhosH(e.f,p.id);
  b+=`<div style="display:flex;gap:6px;align-items:center;margin:0 0 4px"><button class="chipbtn ${p.cheia?'red':''}" data-b="cheia" data-need="m">${p.cheia?'Cheia · sem espaço':'Tem espaço'}</button><span class="hint" data-need="m">${p.cheia?'Toque quando liberar espaço':'Toque para marcar como cheia'}</span></div>`;
  if(p.orgs.length){b+=`<div class="grp">Organizadores</div>`+p.orgs.map(o=>orgRowH(o)).join('');}
  b+=`<div class="grp">Itens<span class="x" data-need="m"><button class="link" data-b="addi">+ Item</button> · <button class="link" data-b="addo">+ Organizador</button></span></div>`;
  b+=p.itens.length?p.itens.map(x=>itemH(x,e)).join(''):`<div style="color:var(--ink3);font-size:.85rem;padding:6px 0">${p.orgs.length?'Nenhum item fora dos organizadores.':'Nada guardado aqui ainda.'}</div>`;}
 else if(e.t==='o'){const o=e.o;b+=heroH(o);
  b+=`<div style="display:flex;gap:8px;margin:0 0 6px" data-need="m"><button class="pill sm" data-b="moveorg">${IC.move}Mudar de lugar</button><button class="pill sm" data-b="rmorg" title="Os itens de dentro ficam soltos neste lugar">${IC.trash}Remover</button><span class="cols8" style="margin-left:auto;align-items:center">${[OT[o.tipo].cor,...OCOL.filter(c=>c!==OT[o.tipo].cor)].slice(0,6).map(c=>`<button data-ocor="${c}" class="${c===o.cor?'on':''}${c===TRANSP?' tr':''}" style="--c:${c}" title="${c===TRANSP?'Transparente':'Trocar a cor'}"></button>`).join('')}</span></div>`;
  b+=`<div class="grp">Dentro de ${orgName(o).toLowerCase()}<span class="x" data-need="m"><button class="link" data-b="addi">+ Item</button></span></div>`;
  b+=o.itens.length?o.itens.map(x=>itemH(x,e)).join(''):'<div style="color:var(--ink3);font-size:.85rem">Vazio.</div>';}
 else if(e.t==='i')b+=detailH(e);
 else if(e.t==='ed')b+=editCardH(e);
 e.el.innerHTML=cardHead(e)+`<div class="sb">${b}</div>`;e.el.querySelector('.sb').scrollTop=sc;layoutStack();}
export function orgRowH(o){const st=stats(o);return `<div class="orow ${S.carry&&S.carry.stage==='confirm'?'drop':''}" data-org="${o.id}">${orgIso(o.tipo,o.cor)}<div><div class="on">${orgName(o)}</div></div><span>${cntH({u:st.u,org:0,al:st.al})}</span><div class="os"><span class="clsrow">${clsIconsH(st)}</span>${o.etq?`<span class="plabel" style="font-size:.62rem;pointer-events:none">${etqOf(o.etq).t}</span>`:''}</div></div>`;}
export function refreshCards(){S.stack.forEach(renderCard);if(S.sel&&acard.classList.contains('on'))select(S.sel);refreshBadges();}

/* --------- linha de item --------- */
export const piecesH=n=>{const m=12;return '<i></i>'.repeat(Math.min(n,m))+(n>m?`<em>+${n-m}</em>`:'');};
/* resumo das especificações cadastradas (tamanho, validade…) para aparecer sob o nome */
export const specLine=it=>Object.entries(it.spec||{}).filter(([,v])=>v&&String(v).trim()).slice(0,3).map(([k,v])=>{const kk=k.replace(/\s*\(.*\)$/,'');return `${kk} ${v}`;}).join(' · ');
export function itemH(e,ctx,opt={}){const it=IT(e),c=CL[it.cl].c;const al=alertsOf(e);const esg=it.modo==='contavel'&&e.qtd===0;let q='',ctl='';
 if(it.modo==='contavel'){q=esg?`<div class="q" style="color:#C0392B">0<small>${it.un}</small></div>`:`<div class="q">${odoH(e.qtd)}<small>${it.un}</small></div>`;
  ctl=`<div class="pcs" style="--c:${c}">${piecesH(e.qtd)}</div><span class="rc"><button data-act="dec" aria-label="Usar uma">−</button><button data-act="inc" aria-label="Repor uma">+</button></span>`;}
 else if(it.modo==='unidades'){q=`<div class="q">${odoH(e.units.length)}<small>${e.units.length===1?'unidade':'unidades'}</small></div>`;
  ctl=`<div class="units">${e.units.map(u=>unitH(u,it)).join('')}<button class="uc add" data-act="addunit" data-need="m" title="Registrar mais uma unidade">+</button></div>${vlegH(e,it)}`;}
 else{q=`<div class="q" style="font-size:1rem">${NIVEIS[e.nivel]}</div>`;
  /* caixa/kit: duas linhas rotuladas — quanto tem (nível) e o que tem dentro (tipos; tocar marca falta) */
  ctl=`<div class="cjrow"><span class="cjl">Quanto tem</span><span class="gauge" style="--c:${c}"><i style="height:${e.nivel/3*100}%"></i></span><div class="gsel" data-need="m">${NIVEIS.map((n,k)=>`<button data-act="lvl" data-n="${k}" class="${k===e.nivel?'on':''}">${n}</button>`).join('')}</div></div>
   <div class="cjrow"><span class="cjl">Tipos dentro</span><div class="tps">${(e.tipos||[]).map((t,k)=>`<button class="tp ${t.aus?'aus':''}" data-act="tipo" data-k="${k}" title="${t.aus?'Está faltando · toque quando repor':'Toque para marcar que está faltando'}">${t.aus?'⚠ ':''}${t.n}</button>`).join('')}<button class="tp add" data-act="addtipo" data-need="m">+ tipo</button></div></div>`;}
 const acts=`<div class="acts">${[['det','info','Detalhes'],['edit','edit','Editar'],['mov','move','Mudar de lugar'],['rm','trash',isAdmin()?'Baixa/apagar':'Dar baixa'],['nf','nf',e.nf?'Encontrei':'Não achei']].concat(it.modo==='unidades'?[['emp','hand','Emprestar']]:[]).map(([a,i,t])=>`<button class="ibtn lb" data-a="${a}">${IC[i]}<span>${t}</span></button>`).join('')}</div>`;
 const open=S.openRow===e.id;
 return `<div class="irow ${open?'open':''} ${esg?'esg':''}" data-item="${e.id}">${clsH(it.cl,it.modo==='contavel'&&e.qtd<=it.min&&e.qtd>0?'pulse':'')}<div class="nm">${it.nome}${specLine(it)?`<span class="spx">${specLine(it)}</span>`:''}${opt.path?`<small>${opt.path}</small>`:''}</div>${q}
  <div class="wr">${al.map(([k,t])=>`<span class="wn ${k}">${t}</span>`).join('')}</div><div class="ctl">${ctl}</div>${acts}</div>`;}
export const unitH=(u,it)=>{const [n,c]=ESTADOS[u.estado];const op=it&&identOp(it,u.v);
 return `<button class="uc ${u.emp?'emp':''} ${op?(op.c?'vcor':'vtxt'):''}" data-act="unit" data-u="${u.n}" style="--sc:${c}${op&&op.c?';--vc:'+op.c:''}" title="#${u.n}${op?' · '+op.n:''} · ${n}${u.emp?' · com '+u.emp.para:''}">${op&&!op.c?`<b>${op.n.slice(0,1).toUpperCase()}</b><i>${u.n}</i>`:u.n}</button>`;};
/* recipiente de uma caixa/kit: qual organizador aparece no 3D e de que cor (compartilhado entre criar e editar) */
export const recH=(rec,at)=>`<div class="flbl">Recipiente <span>como a caixa aparece no 3D</span></div><div class="clc-grid recg"><button class="clc ${!rec?'on':''}" data-${at}t=""><span>Padrão</span></button>${OTK.map(k=>`<button class="clc ${rec&&rec.tipo===k?'on':''}" data-${at}t="${k}">${orgFront(k,rec&&rec.tipo===k?rec.cor:OT[k].cor)}<span>${OT[k].n}</span></button>`).join('')}</div>
 ${rec?`<div class="cols8" style="margin:6px 0 2px">${[TRANSP,...OCOL.filter(c=>c!==TRANSP),OT[rec.tipo].cor].filter((c,i,a)=>a.indexOf(c)===i).map(c=>`<button data-${at}c="${c}" class="${c===rec.cor?'on':''}${c===TRANSP?' tr':''}" style="--c:${c}" title="${c===TRANSP?'Transparente':''}"></button>`).join('')}</div>`:''}`;
export const recSet=(rec,tipo,cor)=>{if(cor!=null)return rec?{...rec,cor}:rec;if(!tipo)return null;return {tipo,cor:rec&&rec.tipo===tipo?rec.cor:OT[tipo].cor};};
export const vlegH=(e,it)=>it.ident?`<div class="vleg"><span>${it.ident.nome}</span>${it.ident.ops.map(o=>[o,e.units.filter(u=>u.v===o.n).length]).filter(x=>x[1]).map(([o,q])=>`<span>${o.c?`<i style="background:${o.c}"></i>`:''}${o.n} <b>${q}</b></span>`).join('')}</div>`:'';
/* ---------- detalhes do item (card próprio) ---------- */
export function detailH(e){const x=e.x,it=IT(x.e);const locs=allLoc().filter(y=>y.e.ref===it.id);const hist=LOG.filter(l=>l.ref===it.id);
 const tot=locs.reduce((a,y)=>a+unitsOf(y.e),0);let tiles='',extra='';
 if(it.modo==='unidades'){const us=locs.flatMap(y=>y.e.units);const emp=us.filter(u=>u.emp).length,at=us.filter(u=>u.estado==='quebrada'||u.estado==='manutencao').length;
  tiles=[[tot,tot===1?'unidade no total':'unidades no total'],[x.e.units.length,'neste lugar'],[emp,emp===1?'emprestada':'emprestadas'],[at,'quebradas ou em manutenção']].map(([n,t])=>`<div class="dtile"><b>${n}</b><span>${t}</span></div>`).join('');
  const est=Object.entries(ESTADOS).map(([k,[n,c]])=>[n,c,us.filter(u=>u.estado===k).length]).filter(z=>z[2]);
  extra+=`<div class="grp">Situação das unidades</div><div class="chipsl">${est.map(([n,c,q])=>`<span class="chipl"><i style="background:${c}"></i>${n} <b>${q}</b></span>`).join('')}</div>`;
  if(it.ident)extra+=`<div class="grp">${it.ident.nome}</div><div class="chipsl">${it.ident.ops.map(o=>`<span class="chipl">${o.c?`<i style="background:${o.c}"></i>`:''}${o.n} <b>${us.filter(u=>u.v===o.n).length}</b></span>`).join('')}${us.some(u=>!u.v)?`<span class="chipl muted">Sem ${it.ident.nome.toLowerCase()} <b>${us.filter(u=>!u.v).length}</b></span>`:''}</div>`;
  const ls=locs.flatMap(y=>y.e.units.filter(u=>u.emp).map(u=>({y,u})));if(ls.length)extra+=`<div class="grp">Emprestadas</div><div class="locs">${ls.map(({y,u})=>{const atr=u.emp.prazo&&u.emp.prazo<Date.now();return `<div class="lr">${IC.hand}<span>#${u.n} com <b>${u.emp.para}</b> desde ${new Date(u.emp.desde).toLocaleDateString('pt-BR')}${u.emp.prazo?` · ${atr?'<b class="atr">atrasado, prazo':'prazo'} ${new Date(u.emp.prazo).toLocaleDateString('pt-BR')}${atr?'</b>':''}`:''}</span></div>`;}).join('')}</div>`;}
 else if(it.modo==='contavel'){tiles=[[tot,`${it.un} no total`],[x.e.qtd,'neste lugar'],[it.min,'mínimo (aviso)']].map(([n,t])=>`<div class="dtile"><b>${n}</b><span>${t}</span></div>`).join('');}
 else{tiles=`<div class="dtile"><b>${NIVEIS[x.e.nivel]}</b><span>neste lugar</span></div><div class="dtile"><b>${(x.e.tipos||[]).length}</b><span>tipos dentro</span></div><div class="dtile"><b>${(x.e.tipos||[]).filter(t=>t.aus).length}</b><span>faltando</span></div>`;
  if((x.e.tipos||[]).length)extra+=`<div class="grp">Tipos dentro</div><div class="chipsl">${x.e.tipos.map(t=>`<span class="chipl ${t.aus?'warn':''}">${t.aus?'⚠ ':''}${t.n}${t.aus?' · faltando':''}</span>`).join('')}</div>`;}
 const specs=Object.entries(it.spec||{});
 return `${it.desc?`<p class="ddesc">${it.desc}</p>`:''}<div class="dtiles">${tiles}</div>
  <div class="mf in" data-need="m" style="justify-content:flex-start;margin:0 0 6px"><button class="pill sm" data-b="editar">${IC.edit}Editar cadastro</button></div>
  ${extra}
  <div class="grp">Cadastro</div><dl class="specs"><dt>Classe</dt><dd>${(CL[it.cl]||CL.div).n}</dd><dt>Controle</dt><dd>${{unidades:'Por unidade (patrimônio)',contavel:'Por quantidade (consumível)',conjunto:'Caixa ou kit (nível)'}[it.modo]}</dd>${it.modo==='contavel'?`<dt>Unidade</dt><dd>${it.un}</dd>`:''}${specs.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
  <div class="grp">Onde está</div><div class="locs">${locs.map(y=>`<div class="lr">${IC.loc}<span>${pathOf(y)}</span><b>${IT(y.e).modo==='conjunto'?NIVEIS[y.e.nivel]:unitsOf(y.e)}</b><button class="link" data-b="loc" data-e="${y.e.id}">Localizar</button></div>`).join('')}</div>
  <details class="histd"><summary>Histórico <span>${hist.length?hist.length+(hist.length===1?' registro':' registros'):'nenhum registro ainda'}</span></summary><ul class="hist2">${hist.slice(0,60).map(l=>`<li><span class="t">${l.h}</span>${l.t}</li>`).join('')||'<li style="color:var(--ink3)">Nada registrado para este item.</li>'}</ul></details>
  <div class="grp">Observações</div><textarea class="obs" data-need="m" rows="3" placeholder="Anotações da equipe sobre este item…">${it.obs||''}</textarea>`;}

/* ---------- diferenciar unidades (cor, tamanho, outro): editor compartilhado entre criar e editar ---------- */
export const PALETA=[['Vermelho','#C8553D'],['Laranja','#E07A1F'],['Amarelo','#E0B12E'],['Verde','#4C9A6A'],['Verde-limão','#9BC53D'],['Azul','#3E7CB1'],['Azul-claro','#5DADE2'],['Roxo','#8E5BD0'],['Rosa','#E58FB0'],['Marrom','#8B5A3C'],['Preto','#2b3138'],['Cinza','#7A8794'],['Branco','#F2F2EE']];
const CORN={vermelho:'#C8553D',vermelha:'#C8553D',laranja:'#E07A1F',amarelo:'#E0B12E',amarela:'#E0B12E',verde:'#4C9A6A',limao:'#9BC53D','verde-limao':'#9BC53D',azul:'#3E7CB1','azul-claro':'#5DADE2',celeste:'#5DADE2',ciano:'#2BB3C0',turquesa:'#2BB3C0',roxo:'#8E5BD0',roxa:'#8E5BD0',lilas:'#B38FD9',violeta:'#8E5BD0',rosa:'#E58FB0',pink:'#E58FB0',magenta:'#C2409A',marrom:'#8B5A3C',bege:'#D9C4A0',preto:'#2b3138',preta:'#2b3138',cinza:'#7A8794',prata:'#B8BCC0',prateado:'#B8BCC0',dourado:'#C9A23A',dourada:'#C9A23A',branco:'#F2F2EE',branca:'#F2F2EE',vinho:'#7B2D3B',grafite:'#4A5058'};
export const corDoNome=(n,usadas=[])=>{const k=norm(n).trim().replace(/\s+/g,'-');if(CORN[k])return CORN[k];const k1=k.split('-')[0];if(CORN[k1])return CORN[k1];return (PALETA.find(([,c])=>!usadas.includes(c))||PALETA[0])[1];};
const IDNOME={cor:'Cor',tam:'Tamanho'};
export function identDe(it){if(!it.ident)return {k:'',nome:'',ops:[],novo:''};const k=it.ident.tipo==='cor'?'cor':norm(it.ident.nome)==='tamanho'?'tam':'outro';return {k,nome:k==='outro'?it.ident.nome:'',ops:it.ident.ops.map(o=>({n:o.n,c:o.c||null,o:o.n,q:0})),novo:''};}
export function identH(ed,cont,uso={}){const tot=ed.ops.reduce((a,o)=>a+(o.q||0),0);
 return `<div class="ided"><div class="flbl">Como diferenciar as unidades <span>(opcional)</span></div>
  <div class="hint">Use quando as unidades não são iguais entre si: estiletes de cores diferentes, chaves de tamanhos diferentes, pontas diferentes…</div>
  <div class="gsel">${[['','Não precisa'],['cor','Por cor'],['tam','Por tamanho'],['outro','Outro critério']].map(([k,v])=>`<button data-idk="${k}" class="${k===ed.k?'on':''}">${v}</button>`).join('')}</div>
  ${ed.k?`${ed.k==='outro'?`<label>Nome do critério<input data-idf="nome" value="${ed.nome}" placeholder="Ex.: Ponta, Material, Voltagem"></label>`:''}
   ${ed.ops.length?`<div class="idops">${ed.ops.map((o,i)=>`<div class="idop">${ed.k==='cor'?`<label class="csw" style="--c:${o.c}" title="Trocar a cor"><input type="color" data-idc="${i}" value="${o.c}"></label>`:''}<input class="idnm" data-idnm="${i}" value="${o.n}" aria-label="Nome da opção">${cont?`<span class="stp"><button data-idq="${i}" data-d="-1" aria-label="Menos uma">−</button><b>${o.q||0}</b><button data-idq="${i}" data-d="1" aria-label="Mais uma">+</button></span>`:`<span class="uso">${uso[o.o]?uso[o.o]+' un.':'sem uso'}</span>`}<button class="idx" data-idx="${i}" title="${uso[o.o]?'Em uso: troque as unidades antes de tirar':'Tirar esta opção'}" ${uso[o.o]?'disabled':''}>×</button></div>`).join('')}</div>`:`<div class="hint">Nenhuma opção ainda. ${ed.k==='cor'?'Toque nas cores abaixo':'Adicione abaixo'}${cont?' e diga quantas unidades há de cada uma':''}.</div>`}
   ${ed.k==='cor'?`<div class="cpal">${PALETA.filter(([n])=>!ed.ops.some(o=>norm(o.n)===norm(n))).map(([n,c])=>`<button data-idp="${n}" style="--c:${c}"><i></i>${n}</button>`).join('')}</div>`:''}
   ${ed.k==='tam'&&!ed.ops.length?`<div class="cpal">${['P','M','G'].map(n=>`<button data-idp="${n}">${n}</button>`).join('')}</div>`:''}
   <div class="idadd"><input data-idf="novo" value="${ed.novo||''}" placeholder="${ed.k==='cor'?'Outra cor: digite o nome':ed.k==='tam'?'Ex.: 4 mm, 1/4", Grande':'Ex.: Fenda, Phillips'}">${ed.k==='cor'?`<label class="csw" style="--c:${ed.novaCor||corDoNome(ed.novo||'',ed.ops.map(o=>o.c))}" title="Escolher a cor"><input type="color" data-idf="novaCor" value="${ed.novaCor||corDoNome(ed.novo||'',ed.ops.map(o=>o.c))}"></label>`:''}<button class="pill sm" data-ida>Adicionar</button></div>
   ${cont?`<div class="idtot">Total: <b>${tot}</b> ${tot===1?'unidade':'unidades'}</div>`:''}`:''}</div>`;}
/* lê os campos do editor para o estado; devolve true se tratou o clique (e o chamador redesenha) */
export function identSync(ed,root){const v=sel=>root.querySelector(sel);if(v('[data-idf=nome]'))ed.nome=clean(v('[data-idf=nome]').value);if(v('[data-idf=novo]'))ed.novo=v('[data-idf=novo]').value;if(v('[data-idf=novaCor]')&&ed._corTocada)ed.novaCor=v('[data-idf=novaCor]').value;
 root.querySelectorAll('[data-idnm]').forEach(i=>{const o=ed.ops[+i.dataset.idnm];if(o&&clean(i.value))o.n=clean(i.value);});root.querySelectorAll('[data-idc]').forEach(i=>{const o=ed.ops[+i.dataset.idc];if(o)o.c=i.value;});}
export function identClick(ed,t,cont){const k=t.closest('[data-idk]');if(k){if(k.dataset.idk!==ed.k){ed.k=k.dataset.idk;ed.ops=[];ed.novo='';ed.novaCor='';}return true;}
 const pp=t.closest('[data-idp]');if(pp){const n=pp.dataset.idp;ed.ops.push({n,c:ed.k==='cor'?(PALETA.find(z=>z[0]===n)||[0,corDoNome(n)])[1]:null,q:cont?1:0});return true;}
 if(t.closest('[data-ida]'))return identAdd(ed,cont);
 const q=t.closest('[data-idq]');if(q){const o=ed.ops[+q.dataset.idq];o.q=Math.max(0,(o.q||0)+(+q.dataset.d));return true;}
 const x=t.closest('[data-idx]');if(x&&!x.disabled){ed.ops.splice(+x.dataset.idx,1);return true;}return false;}
export function identAdd(ed,cont){const n=clean(ed.novo||'');if(!n)return false;if(ed.ops.some(o=>norm(o.n)===norm(n))){toast(`<b>${n}</b> já está na lista`,null,1600);return false;}
 ed.ops.push({n,c:ed.k==='cor'?(ed.novaCor||corDoNome(n,ed.ops.map(o=>o.c))):null,q:cont?1:0});ed.novo='';ed.novaCor='';ed._corTocada=false;return true;}
export const identFinal=ed=>ed.k&&ed.ops.length?{nome:ed.k==='outro'?(ed.nome||'Tipo'):IDNOME[ed.k],tipo:ed.k==='cor'?'cor':'texto',ops:ed.ops.map(o=>ed.k==='cor'?{n:o.n,c:o.c}:{n:o.n})}:null;

/* ---------- editar cadastro (card próprio) ---------- */
const SPECPH={Marca:'Ex.: Bosch',Medida:'Ex.: 10 mm',Potência:'Ex.: 60 W','Tipo (macho/fêmea)':'Ex.: macho',Especificação:'Ex.: 12 V, 2 A',Validade:'Ex.: 03/2027',Rendimento:'Ex.: 50 g',Dimensão:'Ex.: 100 × 1000 mm',Espessura:'Ex.: 3 mm',Faixa:'Até quanto mede. Ex.: 0–150 mm',Resolução:'Menor divisão. Ex.: 0,01 mm',Tamanho:'Ex.: M, 42',Tipos:'Ex.: M2, M3'};
const SPECROT={Faixa:'Faixa de medição',Resolução:'Resolução (menor divisão)'};
export function specsH(cl,spec,extra){const keys=[...new Set([...(SPECK[cl]||[]).filter(k=>k!=='Tipos'),...Object.keys(spec)])];
 return `<div class="flbl">Especificações <span>(opcional)</span></div>${keys.map(k=>`<label>${SPECROT[k]||k}<input data-spec="${k}" value="${spec[k]||''}" placeholder="${SPECPH[k]||''}"></label>`).join('')}
  ${extra.map((z,i)=>`<div class="row"><label>Campo<input data-sxk="${i}" value="${z[0]}" placeholder="Ex.: Cor do cabo"></label><label>Valor<input data-sxv="${i}" value="${z[1]}"></label></div>`).join('')}<button class="link" data-sxadd style="align-self:flex-start">+ outro campo</button>`;}
export function openEdit(x,card){const it=IT(x.e);const usoDe=()=>{const u={};for(const y of allLoc())if(y.e.ref===it.id&&y.e.units)for(const z of y.e.units)if(z.v)u[z.v]=(u[z.v]||0)+1;return u;};
 const ed={nome:it.nome,cl:it.cl,un:it.un,min:it.min,desc:it.desc||'',spec:{...(it.spec||{})},extra:[],id:identDe(it),units:(x.e.units||[]).map(u=>({...u,_u:u})),qtd:x.e.qtd,nivel:x.e.nivel,tipos:(x.e.tipos||[]).map(t=>t.n).join(', '),rec:it.rec?{...it.rec}:null,uso:usoDe()};
 pushCard({t:'ed',f:card.f,p:card.p,o:card.o,x,ed});}
export function editCardH(e){const x=e.x,it=IT(x.e),ed=e.ed;const nl=allLoc().filter(y=>y.e.ref===it.id).length;
 const ops=ed.id.k?ed.id.ops:[];
 return `<div class="form ef">${nl>1?`<div class="hint" style="margin:0 0 4px">O cadastro vale para os ${nl} lugares onde este item está. Quantidades e unidades abaixo são só deste lugar.</div>`:''}
  <label>Nome<input data-ef="nome" value="${ed.nome}"></label>
  <div class="flbl">Classe</div><div class="clc-grid">${Object.entries(CL).map(([k,v])=>`<button class="clc ${k===ed.cl?'on':''}" data-efcl="${k}">${clsH(k)}<span>${v.n}</span></button>`).join('')}</div>
  <div class="hint">Controle: <b>${{unidades:'por unidade (patrimônio)',contavel:'por quantidade (consumível)',conjunto:'caixa ou kit (nível)'}[it.modo]}</b>. Para mudar o tipo de controle, cadastre o item de novo.</div>
  ${it.modo==='contavel'?`<div class="row"><label>Unidade de medida<input data-ef="un" value="${ed.un}" placeholder="un., m, folhas, g"></label><label>Mínimo <span class="h">avisa abaixo disso</span><input data-ef="min" type="number" min="0" value="${ed.min}"></label></div>
   <label>Quantidade neste lugar<span class="stp big"><button data-efq="-1">−</button><input data-ef="qtd" type="number" min="0" value="${ed.qtd}"><button data-efq="1">+</button></span></label>`:''}
  ${it.modo==='conjunto'?`<label>Quanto tem neste lugar<div class="gsel">${NIVEIS.map((n,k)=>`<button data-efnv="${k}" class="${k===ed.nivel?'on':''}">${n}</button>`).join('')}</div></label><label>Tipos dentro <span class="h">separe por vírgula</span><input data-ef="tipos" value="${ed.tipos}" placeholder="Ex.: M2, M3, M4"></label>${recH(ed.rec,'efr')}`:''}
  ${it.modo==='unidades'?identH(ed.id,false,ed.uso)+`<div class="flbl">Unidades neste lugar <span>${ed.units.length}</span></div>
   <div class="eunits">${ed.units.map((u,i)=>`<div class="eu"><b class="eun">#${u.n}</b>${ops.length?`<select data-euv="${i}" aria-label="${ed.id.k==='cor'?'Cor':'Opção'}"><option value="">—</option>${ops.map(o=>`<option ${o.n===u.v||o.o===u.v?'selected':''} value="${o.o||o.n}">${o.n}</option>`).join('')}</select>`:''}<select data-eue="${i}" aria-label="Estado">${Object.entries(ESTADOS).map(([k,[n]])=>`<option value="${k}" ${k===u.estado?'selected':''}>${n}</option>`).join('')}</select><span class="eue">${u.emp?`com ${u.emp.para}`:''}</span><button class="idx" data-eux="${i}" title="Dar baixa nesta unidade">×</button></div>`).join('')||'<div class="hint">Nenhuma unidade aqui.</div>'}</div>
   <button class="link" data-euadd style="align-self:flex-start">+ unidade</button>`:''}
  ${specsH(ed.cl,ed.spec,ed.extra)}
  <label>Descrição<textarea data-ef="desc" rows="2" placeholder="Para que serve, cuidados, de quem é…">${ed.desc}</textarea></label></div>
  <div class="mf stick"><button class="pill" data-b="back">Cancelar</button><button class="pill pri" data-efsave>Salvar alterações</button></div>`;}
export function editSync(e){const ed=e.ed,r=e.el;const g=k=>r.querySelector(`[data-ef="${k}"]`);
 if(g('nome'))ed.nome=g('nome').value;if(g('un'))ed.un=g('un').value;if(g('min'))ed.min=Math.max(0,+g('min').value||0);if(g('qtd'))ed.qtd=Math.max(0,Math.round(+g('qtd').value||0));if(g('desc'))ed.desc=g('desc').value;if(g('tipos'))ed.tipos=g('tipos').value;
 r.querySelectorAll('[data-spec]').forEach(i=>ed.spec[i.dataset.spec]=i.value);r.querySelectorAll('[data-sxk]').forEach(i=>ed.extra[+i.dataset.sxk][0]=i.value);r.querySelectorAll('[data-sxv]').forEach(i=>ed.extra[+i.dataset.sxv][1]=i.value);
 r.querySelectorAll('[data-euv]').forEach(i=>{const u=ed.units[+i.dataset.euv];const o=ed.id.ops.find(o=>(o.o||o.n)===i.value);u.v=o?(o.o||o.n):null;});r.querySelectorAll('[data-eue]').forEach(i=>ed.units[+i.dataset.eue].estado=i.value);
 identSync(ed.id,r);}
export function editClick(e,t){const ed=e.ed;if(!t.closest('input,textarea,select'))editSync(e);let re=false;
 if(identClick(ed.id,t,false))re=true;
 const cl=t.closest('[data-efcl]');if(cl){ed.cl=cl.dataset.efcl;re=true;}
 const q=t.closest('[data-efq]');if(q){ed.qtd=Math.max(0,ed.qtd+(+q.dataset.efq));re=true;}
 const rt=t.closest('[data-efrt]');if(rt){ed.rec=recSet(ed.rec,rt.dataset.efrt);re=true;}const rc=t.closest('[data-efrc]');if(rc){ed.rec=recSet(ed.rec,null,rc.dataset.efrc);re=true;}
 const nv=t.closest('[data-efnv]');if(nv){ed.nivel=+nv.dataset.efnv;re=true;}
 if(t.closest('[data-sxadd]')){ed.extra.push(['','']);re=true;}
 const ux=t.closest('[data-eux]');if(ux){ed.units.splice(+ux.dataset.eux,1);re=true;}
 if(t.closest('[data-euadd]')){const n=Math.max(0,...allLoc().filter(y=>y.e.ref===e.x.e.ref&&y.e.units).flatMap(y=>y.e.units.map(u=>u.n)),...ed.units.map(u=>u.n))+1;ed.units.push({n,estado:'boa',emp:null,v:null,id:null});re=true;}
 if(t.closest('[data-efsave]'))return editSave(e);
 if(re){const sc=e.el.querySelector('.sb').scrollTop;renderCard(e);e.el.querySelector('.sb').scrollTop=sc;}return re;}
export function editSave(e){editSync(e);const ed=e.ed,x=e.x,it=IT(x.e);const nome=clean(ed.nome);if(!nome){toast('O item precisa de um nome',null,1800);return true;}
 const mud=[];if(nome!==it.nome)mud.push('nome');it.nome=nome;if(ed.cl!==it.cl)mud.push('classe');it.cl=ed.cl;it.desc=clean(ed.desc);
 if(it.modo==='contavel'){it.un=clean(ed.un)||'un.';it.min=ed.min;if(x.e.qtd!==ed.qtd){mud.push(`quantidade ${x.e.qtd} → ${ed.qtd}`);x.e.qtd=ed.qtd;}}
 if(it.modo==='conjunto'){if(x.e.nivel!==ed.nivel)mud.push(NIVEIS[ed.nivel].toLowerCase());x.e.nivel=ed.nivel;const ant=new Map((x.e.tipos||[]).map(t=>[norm(t.n),t]));x.e.tipos=ed.tipos.split(',').map(z=>clean(z)).filter(Boolean).map(n=>ant.get(norm(n))||{n});if(ed.rec)it.rec={...ed.rec};else delete it.rec;}
 const spec={};for(const [k,v] of Object.entries(ed.spec))if(clean(v))spec[k]=clean(v);for(const [k,v] of ed.extra)if(clean(k)&&clean(v))spec[clean(k)]=clean(v);it.spec=spec;
 if(it.modo==='unidades'){const novo=identFinal(ed.id);const ren={};for(const o of ed.id.ops)if(o.o&&o.o!==o.n)ren[o.o]=o.n;
  for(const y of allLoc())if(y.e.ref===it.id&&y.e.units&&y.e!==x.e)for(const u of y.e.units)if(u.v&&ren[u.v])u.v=ren[u.v];
  if(novo)it.ident=novo;else delete it.ident;
  const antes=x.e.units;x.e.units=ed.units.map(u=>{const base=u._u||U(u.n,'boa');base.estado=u.estado;base.v=u.v?(ren[u.v]||u.v):null;return base;});
  const tir=antes.filter(u=>!x.e.units.includes(u));if(tir.length)mud.push(`baixa de ${tir.length} unidade(s)`);const nov=x.e.units.filter(u=>!antes.includes(u)).length;if(nov)mud.push(`${nov} unidade(s) nova(s)`);}
 touch(x.e);log(`Cadastro editado: ${it.nome}${mud.length?' ('+mud.join(', ')+')':''}`,it.id);
 if(it.modo==='unidades'&&!x.e.units.length){removeEntry(x);}
 popTo(S.stack.indexOf(e)-1);refreshCards();F.forEach(f=>f.d.partes.forEach(p=>buildContents(f,p.id)));toast('Alterações salvas',null,1600);return true;}
export function rerenderRow(e){document.querySelectorAll(`.irow[data-item="${e.id}"]`).forEach(r=>{const card=S.stack.find(s=>s.el.contains(r));const n=document.createElement('div');n.innerHTML=itemH(e,card,{path:r.querySelector('.nm small')?.textContent});r.replaceWith(n.firstElementChild);});refreshHero();refreshBadges();if(S.vist)renderVist();}
export function refreshHero(){S.stack.forEach(s=>{if(s.t==='i'||s.t==='ed')return;const h=s.el.querySelector('.sb>.hero');if(h){const n=document.createElement('div');n.innerHTML=heroH(nodeOf(s));h.replaceWith(n.firstElementChild);}});}
export function rebuildAt(x){if(!x||x.sem)return;buildContents(byId(x.m.id),x.p.id);}

/* --------- móveis dentro de móveis --------- */
const ondeTxt=h=>!h?'':h.f.d.tipo==='lugar'?'Dentro de':classeMovel(h.f.d)==='mesa'&&false?'':h.pid&&h.f.parts[h.pid]&&(h.f.parts[h.pid].k==='top'||h.f.parts[h.pid].k==='above')?'Em cima de':'Embaixo de';
export function encaixeH(f){let h='';const hs=f.host;const mv=f.d.movel;
 if((hs&&!semTopo(f))||mv)h+=`<div class="encx">${hs&&!semTopo(f)?`<button class="chipbtn" data-b="vai" data-id="${hs.f.d.id}">${ondeTxt(hs)} <b>${hs.f.d.nome}</b></button>`:''}${mv?`<button class="chipbtn pri" data-b="mover" data-need="m">${IC.move||''}Mover</button>`:''}</div>`;
 return h;}
/* móveis encaixados neste móvel (ou nesta parte): clicar abre o card dele por cima deste */
export function filhosH(f,pid){const fs=(f.filhos||[]).filter(x=>pid==null?true:x.pid===pid);if(!fs.length)return '';
 return `<div class="grp">${pid==null?'Móveis encaixados':'Neste espaço'}</div><div class="filhos">${fs.map(x=>`<button class="filho" data-b="vai" data-push="1" data-id="${x.f.d.id}"><span class="fn">${x.f.d.nome}</span><span class="fw">${pid==null&&x.pid&&f.d.partes.find(p=>p.id===x.pid)?partName(f.d,f.d.partes.find(p=>p.id===x.pid)):''}</span>${IC.next}</button>`).join('')}</div>`;}
/* --------- cliques nos cards --------- */
export function handleCard(ev,e){const t=ev.target;if(e.t==='ed'&&!t.closest('[data-b=back]')&&editClick(e,t))return;const tag=t.closest('[data-tag]');if(tag)return tagPop(tag);
 const oc_=t.closest('[data-ocor]');if(oc_&&e.t==='o'){if(!can())return;e.o.cor=oc_.dataset.ocor;log(`${orgName(e.o)}: cor alterada`);buildContents(e.f,e.p.id);orgOpen(e.f,e.p.id,e.o.id,1);refreshCards();return;}
 const goto=t.closest('[data-goto]');if(goto){const p=e.f.d.partes.find(x=>x.id===goto.dataset.goto);replaceTop({t:'p',f:e.f,p});return;}
 const b=t.closest('[data-b]');if(b){const a=b.dataset.b;
  if(a==='close')return closeStack();if(a==='back')return popTo(S.stack.indexOf(e)-1);
  if(a==='vai'){const g=byId(b.dataset.id);if(!g)return;if(b.dataset.push)pushCard({t:'m',f:g});else{setOpen(e.f,null);openStack([{t:'m',f:g}]);}return;}
  if(a==='mover'){if(!can())return;return startMove(e.f);}
  if(a==='prev'||a==='next'){const list=F.filter(f=>f.d.lab===e.f.d.lab&&f.d.partes.length);let i=list.indexOf(e.f);i=(i+(a==='next'?1:-1)+list.length)%list.length;setOpen(e.f,null);openStack([{t:'m',f:list[i]}]);return;}
  if(a==='pprev'||a==='pnext'){const ps=visParts(e.f,false);let i=ps.indexOf(e.p);i=(i+(a==='pnext'?1:-1)+ps.length)%ps.length;replaceTop({t:'p',f:e.f,p:ps[i]});return;}
  if(a==='cheia'){e.p.cheia=!e.p.cheia;log(`${partName(e.f.d,e.p)} (${e.f.d.nome}) marcada como ${e.p.cheia?'cheia':'com espaço'}`);renderCard(e);return;}
  if(a==='ren')return renameInline(e);
  if(a==='editar'&&e.t==='i'){if(!can())return;return openEdit(e.x,e);}
  if(a==='addi')return openItemCreator({dest:{f:e.f,p:e.p,o:e.t==='o'?e.o:null}});
  if(a==='addo')return openOrgCreator({dest:{f:e.f,p:e.p}});
  if(a==='moveorg')return startCarry({kind:'org',x:{m:e.f.d,p:e.p,o:e.o}});
  if(a==='rmorg'){if(!can())return;const o=e.o,p=e.p,f=e.f,i=p.orgs.indexOf(o);if(i<0)return;const its=[...o.itens];
   p.orgs.splice(i,1);p.itens.push(...its);o.itens=[];log(`${orgName(o)} removido de ${f.d.nome} › ${partName(f.d,p)}${its.length?` (${its.length} item(ns) ficaram soltos no lugar)`:''}`);save();
   popTo(S.stack.indexOf(e)-1);refreshCards();buildContents(f,p.id);
   toast(`<b>${orgName(o)}</b> removido${its.length?`. ${its.length===1?'O item ficou':'Os itens ficaram'} em ${partName(f.d,p)}`:''}`,()=>{p.itens=p.itens.filter(z=>!its.includes(z));o.itens=its;p.orgs.splice(i,0,o);save();refreshCards();buildContents(f,p.id);},5200);return;}
  if(a==='loc'){const y=locE(b.dataset.e);return localizar(y);}
  return;}
 const pr=t.closest('[data-part]');if(pr&&e.t==='m'){const p=e.f.d.partes.find(x=>x.id===pr.dataset.part);setHoverPart(null);pushCard({t:'p',f:e.f,p});return;}
 const og=t.closest('[data-org]');if(og&&e.t==='p'){const o=e.p.orgs.find(x=>x.id===og.dataset.org);pushCard({t:'o',f:e.f,p:e.p,o});return;}
 const row=t.closest('.irow');if(!row)return;const x=locE(row.dataset.item);
 const ia=t.closest('[data-a]');if(ia)return itemAction(x,ia.dataset.a,e);
 const act=t.closest('[data-act]');if(act)return entryAct(x,act.dataset.act,act,row);
 if(t.closest('input,textarea,select,.form'))return;
 S.openRow=S.openRow===x.e.id?null:x.e.id;document.querySelectorAll('.irow.open').forEach(r=>{if(r!==row)r.classList.remove('open');});row.classList.toggle('open',S.openRow===x.e.id);}
stackEl.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.matches('[data-idf=novo]')){const e=S.stack.find(z=>z.el.contains(ev.target));if(e&&e.t==='ed'){ev.preventDefault();editSync(e);if(identAdd(e.ed.id,false)){renderCard(e);const n=e.el.querySelector('[data-idf=novo]');n&&n.focus();}}}});
stackEl.addEventListener('input',ev=>{const t=ev.target;if(t.matches('[data-idc],[data-idf=novaCor]')){t.parentElement.style.setProperty('--c',t.value);const e=S.stack.find(z=>z.el.contains(t));if(e&&e.t==='ed'&&t.matches('[data-idf=novaCor]')){e.ed.id._corTocada=true;e.ed.id.novaCor=t.value;}}
 if(t.matches('[data-ef=nome]')){const e=S.stack.find(z=>z.el.contains(t));const h=e&&e.el.querySelector('.sh h3');if(h&&h.lastChild&&h.lastChild.nodeType===3)h.lastChild.textContent=t.value;}});
stackEl.addEventListener('change',ev=>{if(ev.target.classList.contains('obs')){const e=S.stack.find(s=>s.el.contains(ev.target));if(e&&e.t==='i'){IT(e.x.e).obs=clean(ev.target.value);log(`Observação editada em ${IT(e.x.e).nome}`,e.x.e.ref);toast('Observação salva',null,1500);}}});
export function replaceTop(n){const top=S.stack[S.stack.length-1];if(top.t==='o')orgOpen(top.f,top.p.id,top.o.id,0);const i=S.stack.length-1;const old=top.el;
 S.stack.pop();old.classList.add('leave');setTimeout(()=>old.remove(),300);pushCard(n);}
export function renameInline(e){const h=e.el.querySelector('.sh h3 .tt');const node=e.t==='p'?e.p:e.o;const cur=e.t==='p'?partName(e.f.d,e.p):orgName(e.o);
 h.innerHTML=`<input value="${cur}">`;const inp=h.querySelector('input');inp.focus();inp.select();
 const done=save=>{if(save){const v=clean(inp.value);if(e.t==='p')node.nomeP=v&&v!==partName(e.f.d,{...node,nomeP:''})?v:'';else node.nome=v;log(`Renomeado: ${cur} → ${v||'(automático)'}`);}refreshCards();};
 inp.onkeydown=ev=>{if(ev.key==='Enter')done(true);if(ev.key==='Escape')done(false);};inp.onblur=()=>done(true);}
export function entryAct(x,a,el,row){if(!can())return;const e=x.e,it=IT(e);
 if(a==='dec'||a==='inc'){if(a==='dec'&&e.qtd===0)return;const before=e.qtd;e.qtd+=a==='inc'?1:-1;touch(e);
  const pcs=row.querySelector('.pcs');const all=pcs.querySelectorAll('i:not(.out)');
  if(a==='dec'&&e.qtd<12&&all.length){all[all.length-1].classList.add('out');setTimeout(()=>{if(pcs.isConnected)pcs.innerHTML=piecesH(e.qtd);},450);}else{pcs.innerHTML=piecesH(e.qtd);const n=pcs.querySelectorAll('i');if(a==='inc'&&e.qtd<=12&&n.length)n[n.length-1].classList.add('in');}
  log(`${a==='dec'?'Usado':'Reposto'}: 1 ${it.un} de ${it.nome} (agora ${e.qtd})`,e.ref);
  if(a==='dec'&&before>it.min&&e.qtd<=it.min)toast(e.qtd===0?`<b>${it.nome}</b> esgotou. Vai para a lista de compras.`:`<b>${it.nome}</b> abaixo do mínimo (${it.min}).`);
  if((e.qtd===0)!==(before===0)){rerenderRow(e);rebuildAt(x);return;}
  odoSet(row.querySelector('.q .odo'),e.qtd);const w=row.querySelector('.wr');w.innerHTML=alertsOf(e).map(([k,t])=>`<span class="wn ${k}">${t}</span>`).join('');
  row.querySelector('.cls').classList.toggle('pulse',e.qtd<=it.min&&e.qtd>0);refreshHero();refreshBadges();rebuildAt(x);return;}
 if(a==='lvl'){e.nivel=+el.dataset.n;touch(e);log(`${it.nome}: ${NIVEIS[e.nivel].toLowerCase()}`,e.ref);rerenderRow(e);rebuildAt(x);return;}
 if(a==='tipo'){const t=e.tipos[+el.dataset.k];t.aus=!t.aus;touch(e);log(`${it.nome} · ${t.n}: ${t.aus?'falta registrada':'encontrado'}`,e.ref);
  if(t.aus)toast(`Falta registrada: <b>${it.nome} · ${t.n}</b>. Aparece na lista de compras.`,()=>{t.aus=false;rerenderRow(e);});rerenderRow(e);return;}
 if(a==='addtipo'){const sp=document.createElement('input');sp.placeholder='Novo tipo';sp.className='tp';sp.style.width='110px';el.replaceWith(sp);sp.focus();
  sp.onkeydown=ev=>{if(ev.key==='Enter'&&sp.value.trim()){e.tipos=e.tipos||[];e.tipos.push({n:clean(sp.value)});log(`${it.nome}: tipo ${clean(sp.value)} acrescentado`,e.ref);rerenderRow(e);}if(ev.key==='Escape')rerenderRow(e);};return;}
 if(a==='unit')return unitPop(x,e.units.find(u=>u.n===+el.dataset.u),el);
 if(a==='addunit'){const add=v=>{const n=Math.max(0,...allLoc().filter(y=>y.e.ref===e.ref&&y.e.units).flatMap(y=>y.e.units.map(u=>u.n)))+1;e.units.push(U(n,'boa',null,v));touch(e);log(`${it.nome}: unidade ${n}${v?' ('+v+')':''} registrada`,it.id);closePop();rerenderRow(e);rebuildAt(x);stampUnit(e,{n});};
  if(!it.ident)return add(null);
  const cor=it.ident.tipo==='cor';
  pop.innerHTML=`<div class="tl">Nova unidade · qual ${it.ident.nome.toLowerCase()}?</div><div class="popl">${it.ident.ops.map((o,k)=>`<button class="it" data-v="${k}">${o.c?`<span class="dot" style="--sc:${o.c};background:${o.c}"></span>`:''}${o.n}</button>`).join('')}<button class="it muted" data-v="none">Sem ${it.ident.nome.toLowerCase()}</button></div>
   <div class="tl">Ou uma opção nova</div><div class="popadd"><input id="newOp" placeholder="${cor?'Nome da cor':'Ex.: '+(norm(it.ident.nome)==='tamanho'?'6 mm':'Phillips')}">${cor?`<label class="csw" id="newSw" style="--c:#C8553D" title="Escolher a cor"><input type="color" id="newCor" value="#C8553D"></label>`:''}<button class="pill sm pri" data-v="new">Criar</button></div>`;
  placePop(el);const ni=pop.querySelector('#newOp'),nc=pop.querySelector('#newCor');let tocou=false;
  if(cor){const upd=()=>{if(!tocou){nc.value=corDoNome(ni.value,it.ident.ops.map(o=>o.c));}pop.querySelector('#newSw').style.setProperty('--c',nc.value);};ni.oninput=upd;nc.oninput=()=>{tocou=true;upd();};upd();}
  ni.onkeydown=ev=>{if(ev.key==='Enter')pop.querySelector('[data-v=new]').click();};
  pop.onclick=ev=>{const b=ev.target.closest('[data-v]');if(!b)return;if(b.dataset.v==='none')return add(null);if(b.dataset.v==='new'){const t=clean(ni.value);if(!t)return ni.focus();const ja=identOp(it,t)||it.ident.ops.find(o=>norm(o.n)===norm(t));if(!ja)it.ident.ops.push(cor?{n:t,c:nc.value}:{n:t});return add(ja?ja.n:t);}add(it.ident.ops[+b.dataset.v].n);};return;}
}
export function itemAction(x,a,card){const e=x.e,it=IT(e);
 if(a==='det')return pushCard({t:'i',f:card.f,p:card.p,o:card.o,x});
 if(!can())return;
 if(a==='edit')return openEdit(x,card);
 if(a==='mov')return startCarry({kind:'entry',x});
 if(a==='rm')return openRemove(x);
 if(a==='nf'){e.nf=!e.nf;touch(e);log(`${it.nome}: ${e.nf?'não encontrado':'encontrado'} em ${pathOf(x)}`,e.ref);rerenderRow(e);rebuildAt(x);
  toast(e.nf?`<b>${it.nome}</b> marcado como não encontrado. Aparece em Guardar › Fora do lugar.`:`<b>${it.nome}</b> encontrado.`,null,3600);return;}
 if(a==='emp')return openLoan(x);}

/* --------- popovers --------- */
export const pop=$('#pop');
export function placePop(el){const r=relRect(el);pop.classList.add('on');const w=pop.offsetWidth,h=pop.offsetHeight;let x=r.x+r.w/2-w/2,y=r.y+r.h+8;
 x=Math.max(8,Math.min(x,app.clientWidth-w-8));if(y+h>app.clientHeight-8)y=r.y-h-8;pop.style.left=x+'px';pop.style.top=Math.max(8,y)+'px';}
export function closePop(){pop.classList.remove('on');}
export function unitPop(x,u,el){const it=IT(x.e);pop.innerHTML=`<div class="tl">${it.nome} · unidade ${u.n}</div>${it.ident?`<div class="tl sub">${it.ident.nome}</div><div class="vsel">${it.ident.ops.map((o,k)=>`<button data-sv="${k}" class="${o.n===u.v?'on':''}">${o.c?`<i style="background:${o.c}"></i>`:''}${o.n}</button>`).join('')}</div>`:''}${Object.entries(ESTADOS).map(([k,[n,c]])=>`<button class="it" data-s="${k}"><span class="dot" style="--sc:${c}"></span>${n}${u.estado===k?' ✓':''}</button>`).join('')}
 <div class="tl">${u.emp?'Com '+u.emp.para:'Ações'}</div>${u.emp?`<button class="it" data-s="dev">${IC.in}Devolver</button>`:`<button class="it" data-s="emp">${IC.hand}Emprestar…</button>`}
 <button class="it" data-s="mov">${IC.move}Mudar esta unidade de lugar</button><button class="it" data-s="ed">${IC.edit}Editar unidades e opções…</button><button class="it" data-s="baixa">${IC.trash}Dar baixa</button>`;
 placePop(el);pop.onclick=ev=>{const sv=ev.target.closest('[data-sv]');if(sv&&can()){u.v=it.ident.ops[+sv.dataset.sv].n;touch(x.e);log(`${it.nome}: unidade ${u.n} é ${u.v}`,it.id);closePop();rerenderRow(x.e);stampUnit(x.e,u);return;}
  const b=ev.target.closest('[data-s]');if(!b||!can())return;const s=b.dataset.s;closePop();
  if(s==='emp')return openLoan(x,u);if(s==='dev')return devolver(x,u,false);if(s==='ed'){const card=S.stack.find(z=>z.el.contains(el))||S.stack[S.stack.length-1];return openEdit(x,card);}if(s==='mov')return startCarry({kind:'unit',x,u});
  if(s==='baixa'){const i=x.e.units.indexOf(u);x.e.units.splice(i,1);log(`${it.nome}: baixa da unidade ${u.n}`,it.id);const rm=!x.e.units.length;if(rm)removeEntry(x);refreshCards();rebuildAt(x);
   toast(`Baixa da unidade ${u.n} de <b>${it.nome}</b>`,()=>{if(rm)restoreEntry(x);x.e.units.splice(i,0,u);refreshCards();rebuildAt(x);});return;}
  u.estado=s;touch(x.e);log(`${it.nome}: unidade ${u.n} ${ESTADOS[s][0].toLowerCase()}`,it.id);rerenderRow(x.e);stampUnit(x.e,u);};}
export const stampUnit=(e,u)=>{const c=document.querySelector(`.irow[data-item="${e.id}"] .uc[data-u="${u.n}"]`);c&&c.classList.add('stamp');};
export function nodeOfRef(ref){const [k,v]=ref.split(':');if(k==='m')return byId(v).d;if(k==='p'){const [mid,pid]=v.split('/');return byId(mid).d.partes.find(p=>p.id===pid);}if(k==='oc')return S.oc;return findOrg(v).o;}
export function tagPop(el){if(!can())return;const ref=el.dataset.tag;const node=nodeOfRef(ref);const used=usedEtq();const free=ETQ.filter(e=>!used.has(e.id)&&e.id!==node.etq);
 pop.innerHTML=node.etq?`<div class="tl">Etiqueta</div><div style="padding:4px 10px 8px">${tagH(node,'x')}</div><button class="it" data-e="rm">Remover etiqueta</button>`
  :`<div class="tl">Nova etiqueta</div><div style="padding:2px 6px 6px;display:flex;gap:6px"><input id="newTag" placeholder="Texto da etiqueta"><button class="pill sm pri" data-e="new">Criar</button></div>
   <div class="tl">Etiquetas sem uso</div>${free.length?free.map(e=>`<button class="it" data-e="${e.id}"><span class="plabel" style="pointer-events:none">${qrSvg(e.t)}${e.t}</span></button>`).join(''):'<div style="padding:4px 10px;color:var(--ink3);font-size:.8rem">Nenhuma livre.</div>'}`;
 placePop(el);const inp=pop.querySelector('#newTag');inp&&setTimeout(()=>inp.focus(),20);
 const assign=id=>{node.etq=id;log(`Etiqueta ${id?etqOf(id).t:''} atribuída`);closePop();if(ref==='oc')return renderOC();refreshCards();const l=document.querySelector(`[data-tag="${ref}"].plabel`);l&&l.classList.add('stamp');};
 pop.onclick=ev=>{const b=ev.target.closest('[data-e]');if(!b)return;const v=b.dataset.e;
  if(v==='rm'){node.etq=null;closePop();if(ref==='oc')return renderOC();refreshCards();return;}
  if(v==='new'){const t=clean(pop.querySelector('#newTag').value||'').toUpperCase();if(!t)return;const id='ETQ-'+uid();ETQ.push({id,t});assign(id);return;}assign(v);};
 if(inp)inp.onkeydown=ev=>{if(ev.key==='Enter')pop.querySelector('[data-e=new]').click();};}
addEventListener('pointerdown',ev=>{if(pop.classList.contains('on')&&!pop.contains(ev.target)&&!ev.target.closest('[data-act=unit],[data-act=addunit],[data-tag]'))closePop();},true);

/* --------- modais --------- */
export const modalEl=$('#modal');
export function modal(h,wide){modalEl.className='ui modal glass'+(wide?' wide':'');modalEl.innerHTML=h;requestAnimationFrame(()=>modalEl.classList.add('on'));$('#scrim').classList.add('on');}
export function closeModal(){modalEl.classList.remove('on');if(!S.pal)$('#scrim').classList.remove('on');}
modalEl.addEventListener('click',ev=>{if(ev.target.closest('[data-mclose]'))closeModal();});
export function openLoan(x,unit){const it=IT(x.e);const avail=x.e.units.filter(u=>!u.emp&&u.estado!=='quebrada'&&u.estado!=='manutencao'&&u.estado!=='baixada');if(!avail.length)return toast(x.e.units.some(u=>!u.emp)?'As unidades livres estão quebradas ou em manutenção':'Nenhuma unidade disponível para emprestar');if(unit&&!avail.includes(unit))return toast(`A unidade ${unit.n} está ${ESTADOS[unit.estado][0].toLowerCase()}. Conserte antes de emprestar.`,null,2600);let u=unit||avail[0];let tipo='equipe',para='',prazo='';
 const render=()=>{modal(`<h4>Emprestar ${it.nome}</h4><div style="color:var(--ink2);font-size:.86rem">Só para quando alguém leva para fora do laboratório. Uso no dia a dia não precisa ser registrado.</div>
  <div class="form"><label>Unidade<div class="units">${avail.map(a=>`<button class="uc ${a===u?'':''}" data-lu="${a.n}" style="--sc:${a===u?'#0077C8':ESTADOS[a.estado][1]};${a===u?'background:#0077C8;color:#fff':''}">${a.n}</button>`).join('')}</div></label>
  <label>Para<div class="gsel">${Object.entries(TIPOEMP).map(([k,v])=>`<button data-lt="${k}" class="${k===tipo?'on':''}">${v}</button>`).join('')}</div></label>
  ${tipo==='equipe'?`${PESSOAS.length?`<div class="units">${PESSOAS.map(p=>`<button class="pill sm ${p===para?'pri':''}" data-lp="${p}">${p}</button>`).join('')}</div>`:''}<label>${PESSOAS.length?'Ou digite o nome':'Nome de quem leva'}<input id="lname" value="${PESSOAS.includes(para)?'':para}" placeholder="Ex.: Ana, Pedro"></label>`:`<label>Nome<input id="lname" value="${para}" placeholder="${tipo==='externa'?'Ex.: Equipe Uai!rbus':'Ex.: Departamento de Mecânica'}"></label>`}
  <label>Devolver até <span class="h">opcional · avisamos quando passar</span><input id="lprazo" type="date" value="${prazo}" min="${new Date().toISOString().slice(0,10)}"></label></div>
  <div class="mf"><button class="pill" data-mclose>Cancelar</button><button class="pill pri" data-lok ${para?'':'disabled'}>${IC.hand}Emprestar</button></div>`);
  modalEl.onclick=ev=>{const t=ev.target;if(t.closest('[data-mclose]'))return closeModal();const lu=t.closest('[data-lu]');if(lu){u=avail.find(a=>a.n===+lu.dataset.lu);render();return;}
   const keep=()=>{const pz=modalEl.querySelector('#lprazo');if(pz)prazo=pz.value;};const lt=t.closest('[data-lt]');if(lt){keep();tipo=lt.dataset.lt;para='';render();return;}const lp=t.closest('[data-lp]');if(lp){keep();para=lp.dataset.lp;render();return;}
   if(t.closest('[data-lok]')){const pz=modalEl.querySelector('#lprazo').value;u.emp={para,tipo,desde:Date.now(),...(pz?{prazo:new Date(pz+'T23:59').getTime()}:{})};touch(x.e);log(`${it.nome} #${u.n} emprestado para ${para} (${TIPOEMP[tipo].toLowerCase()})`,it.id);closeModal();rerenderRow(x.e);stampUnit(x.e,u);toast(`<b>${it.nome} #${u.n}</b> com ${para}. Aparece em Guardar › Devolver.`);}};
  const ln=modalEl.querySelector('#lname');if(ln){ln.oninput=()=>{para=clean(ln.value);modalEl.querySelector('[data-lok]').disabled=!para;};ln.focus();ln.setSelectionRange(99,99);}};render();}
export function removeEntry(x){const arr=x.sem?SEM.itens:x.o?x.o.itens:x.p.itens;x._i=arr.indexOf(x.e);arr.splice(x._i,1);}
export function restoreEntry(x){const arr=x.sem?SEM.itens:x.o?x.o.itens:x.p.itens;arr.splice(x._i??arr.length,0,x.e);}
export function openRemove(x){const it=IT(x.e);let q=1;
 const body=it.modo==='contavel'?`<label>Quantidade a dar baixa<span class="rc" style="margin:4px 0 0"><button data-rq="-">−</button><b id="rqv" style="font:600 1.3rem var(--cond);min-width:34px;text-align:center">1</b><button data-rq="+">+</button></span></label>`
  :it.modo==='unidades'?`<div style="font-size:.86rem;color:var(--ink2)">Para dar baixa numa unidade específica, toque no quadradinho dela.</div>${it.ident?`<label>Dar baixa de todas de um tipo<div class="vsel">${it.ident.ops.map(o=>[o,x.e.units.filter(u=>u.v===o.n).length]).filter(y=>y[1]).map(([o,q])=>`<button data-rmv="${o.n}">${o.c?`<i style="background:${o.c}"></i>`:''}${o.n} · ${q}</button>`).join('')}</div></label>`:''}`:'';
 modal(`<h4>Remover ${it.nome}</h4><div class="form">${body}</div>
  <div class="grp">Dar baixa</div><div style="font-size:.86rem;color:var(--ink2)">Quebrou, acabou ou foi descartado. Fica registrado no histórico.</div>
  ${isAdmin()?`<div class="grp">Apagar cadastro</div><div style="font-size:.86rem;color:var(--ink2)">Cadastro errado ou duplicado. Some deste lugar${allLoc().filter(y=>y.e.ref===it.id).length>1?'; o item continua nos outros lugares':''}.</div>`:''}
  <div class="mf"><button class="pill" data-mclose>Cancelar</button>${isAdmin()?`<button class="pill danger" data-rm="del">${IC.trash}Apagar</button>`:''}<button class="pill pri" data-rm="baixa">Dar baixa${it.modo==='unidades'?' de tudo':''}</button></div>`);
 modalEl.onclick=ev=>{const t=ev.target;if(t.closest('[data-mclose]'))return closeModal();const rq=t.closest('[data-rq]');if(rq){q=Math.max(1,Math.min(x.e.qtd||1,q+(rq.dataset.rq==='+'?1:-1)));modalEl.querySelector('#rqv').textContent=q;return;}
  const rv=t.closest('[data-rmv]');if(rv){const v=rv.dataset.rmv,antes=[...x.e.units],q=antes.filter(u=>u.v===v).length;closeModal();x.e.units=antes.filter(u=>u.v!==v);const vazio=!x.e.units.length;if(vazio)removeEntry(x);log(`${it.nome}: baixa de ${q} (${v})`,it.id);refreshCards();rebuildAt(x);
   toast(`Baixa de ${q} × <b>${it.nome}</b> (${v})`,()=>{if(vazio)restoreEntry(x);x.e.units=antes;refreshCards();rebuildAt(x);});return;}
  const rm=t.closest('[data-rm]');if(!rm)return;closeModal();
  if(rm.dataset.rm==='baixa'&&it.modo==='contavel'){const b=x.e.qtd;x.e.qtd=Math.max(0,x.e.qtd-q);log(`${it.nome}: baixa de ${q} ${it.un}`,it.id);refreshCards();rebuildAt(x);toast(`Baixa de ${q} ${it.un} de <b>${it.nome}</b>`,()=>{x.e.qtd=b;refreshCards();rebuildAt(x);});return;}
  removeEntry(x);log(`${it.nome}: ${rm.dataset.rm==='del'?'cadastro apagado':'baixa'} em ${pathOf(x)}`,it.id);refreshCards();rebuildAt(x);
  toast(`<b>${it.nome}</b> ${rm.dataset.rm==='del'?'apagado':'removido'} de ${pathOf(x)}`,()=>{restoreEntry(x);refreshCards();rebuildAt(x);});};}
export function devolver(x,u,anim=true){const it=IT(x.e);const back=()=>{const who=u.emp.para;u.emp=null;touch(x.e);log(`${it.nome} #${u.n} devolvido por ${who}`,it.id);rerenderRow(x.e);stampUnit(x.e,u);toast(`<b>${it.nome} #${u.n}</b> devolvido. Fica em ${pathOf(x)}.`);};
 if(anim)localizar(x,back);else back();}


/* ================= paleta: buscar, guardar, guardar aqui ================= */
export const pal=$('#pal'),q=$('#q');export let palSrc=null,palRes=[],palSel=0,gTab=0,gq='';
export function openPalette(mode,opt={},src){if(S.carry)return;S.pal={mode,...opt};palSrc=src||(mode==='buscar'?$('#searchBtn'):$('#gBtn'));const s=relRect(palSrc);
 const big=mode!=='buscar';const W=Math.min(big?820:600,app.clientWidth-24);const H=Math.min(big?560:480,app.clientHeight-(mob()?80:130));
 const dst={x:(app.clientWidth-W)/2,y:mob()?56:Math.max(70,(app.clientHeight-H)/2-20),w:W,h:H};
 pal.style.transition='none';Object.assign(pal.style,{left:s.x+'px',top:s.y+'px',width:s.w+'px',height:s.h+'px',display:'flex',borderRadius:'999px'});
 pal.classList.remove('ready','closing');void pal.offsetWidth;pal.style.transition='left .32s var(--out),top .32s var(--out),width .32s var(--out),height .32s var(--out),border-radius .32s var(--out)';
 Object.assign(pal.style,{left:dst.x+'px',top:dst.y+'px',width:dst.w+'px',height:dst.h+'px',borderRadius:'20px'});$('#scrim').classList.add('on');setTimeout(()=>pal.classList.add('ready'),170);
 $('#palIn').style.display=big?'none':'flex';q.placeholder='Buscar itens, gavetas, caixas, organizadores…';q.value=opt.q||'';palSel=0;gq='';gTab=0;renderPal();setTimeout(()=>{(big?pal.querySelector('#gq'):q)?.focus();},40);}
export function closePalette(instant){if(!S.pal)return;S.pal=null;$('#scrim').classList.remove('on');if(instant){pal.style.display='none';return;}
 pal.classList.add('closing');pal.classList.remove('ready');const s=relRect(palSrc);
 setTimeout(()=>{pal.style.transition='left .3s var(--out),top .3s var(--out),width .3s var(--out),height .3s var(--out),border-radius .3s var(--out),opacity .12s .2s';
  Object.assign(pal.style,{left:s.x+'px',top:s.y+'px',width:s.w+'px',height:s.h+'px',borderRadius:'999px',opacity:'0'});
  setTimeout(()=>{if(!S.pal){pal.style.display='none';pal.style.opacity='';pal.classList.remove('closing');}},330);},90);}
export const itemIll=`<svg viewBox="0 0 56 48" width="56" height="48"><ellipse cx="28" cy="40" rx="16" ry="5" fill="#E07A1F" opacity=".55"/><circle cx="28" cy="22" r="15" fill="#E07A1F"/><g transform="translate(18 12) scale(.85)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${P.wrench}</g></svg>`;
export const orgIll=()=>`<svg viewBox="0 0 44 38" width="56" height="48">${orgIso('tampa','#E0B12E').replace(/^<svg[^>]*>|<\/svg>$/g,'')}</svg>`;
export const tilesH=dest=>`<div class="dtiles"><button class="dtile" data-g="newitem"><span class="ill">${itemIll}<span class="plus">+</span></span><span><b>Novo item</b><small>${dest?'Cadastrar e guardar aqui':'Cadastrar e escolher onde guardar'}</small></span></button>
 <button class="dtile" data-g="neworg" ${dest&&!dest.p?'':''}><span class="ill">${orgIll()}<span class="plus">+</span></span><span><b>Novo organizador</b><small>Caixa, maleta, gaveteiro…</small></span></button></div>`;
export function loansAll(){const r=[];for(const x of allLoc())if(IT(x.e).modo==='unidades')x.e.units.forEach(u=>{if(u.emp)r.push({x,u});});return r.sort((a,b)=>a.u.emp.desde-b.u.emp.desde);}
export const crH=(x,k)=>`<div class="cr" data-gk="${k}" data-e="${x.e.id}">${clsH(IT(x.e).cl,'sm')}<div><div class="t">${IT(x.e).nome}</div><div class="p">${pathOf(x)}</div></div></div>`;
export function renderPal(){const mode=S.pal.mode;
 if(mode==='buscar')return renderBusca();
 const dest=S.pal.dest;const loans=loansAll();const all=allLoc();
 const title=mode==='aqui'?`<div class="ph" style="padding:0 2px">${IC.in}Guardar em ${dest.o?orgName(dest.o):dest.p?partName(dest.f.d,dest.p):dest.f.d.nome}</div>`:'';
 let r1=`<div class="r1">${tilesH(mode==='aqui')}<div class="dev"><div class="ph">${IC.hand}Devolver · ${loans.length}<span style="margin-left:auto;text-transform:none;letter-spacing:0;font:500 .72rem var(--sans)">mais antigos primeiro</span></div><div class="lst">${loans.length?loans.map(({x,u},k)=>{const d=Math.round((Date.now()-u.emp.desde)/DAY);
  return `<div class="dr">${clsH(IT(x.e).cl,'sm')}<div><div class="t">${IT(x.e).nome} · ${u.n}</div><div class="p">com ${u.emp.para} · ${d?`há ${d} dia${d>1?'s':''}`:'hoje'}</div></div><button class="pill sm ${d>30?'pri':''}" data-dev="${k}">Devolver</button></div>`;}).join(''):'<div class="colm"><div class="empty">Nada emprestado.</div></div>'}</div></div></div>`;
 const s=norm(gq.trim());let r2;
 if(s){const res=all.filter(x=>norm(IT(x.e).nome).includes(s)||(!x.sem&&norm(pathOf(x)).includes(s))).slice(0,40);
  r2=`<div class="colm" style="flex:1"><div class="ph">${mode==='aqui'?'Trazer para cá':'Mudar de lugar'} · ${res.length}</div><div class="lst">${res.map(x=>crH(x,'mv')).join('')||'<div class="empty">Nada encontrado.</div>'}</div></div>`;}
 else{const sem=SEM.itens.map(e=>({e,sem:true}));const fora=all.filter(x=>x.e.nf);const rec=all.filter(x=>!x.sem).sort((a,b)=>b.e.t-a.e.t).slice(0,10);
  const cols=[['Sem lugar',sem,'Cadastrados sem destino'],['Fora do lugar',fora,'Marcados como não encontrados'],['Mexidos recentemente',rec,'']];
  r2=`<div class="gtabs">${cols.map((c,k)=>`<button data-gt="${k}" class="${k===gTab?'on':''}">${c[0]} · ${c[1].length}</button>`).join('')}</div><div class="cols">${cols.map((c,k)=>`<div class="colm ${k===gTab?'on':''}"><div class="ph">${c[0]} · ${c[1].length}</div><div class="lst">${c[1].map(x=>crH(x,'mv')).join('')||`<div class="empty">${k===1?'Nada marcado.':'Nada aqui.'}</div>`}</div></div>`).join('')}</div>`;}
 $('#pres').innerHTML=`<div class="gl">${title}${r1}<div class="r2"><div class="gsearch"><svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input id="gq" placeholder="${mode==='aqui'?'Buscar um item para trazer para cá…':'Buscar um item para mudar de lugar…'}" value="${gq}" autocomplete="off"></div>${r2}</div></div>`;
 const gi=$('#pres').querySelector('#gq');gi.oninput=()=>{gq=gi.value;const pos=gi.selectionStart;renderPal();const n=$('#pres').querySelector('#gq');n.focus();n.setSelectionRange(pos,pos);};
}
export function renderBusca(){const s=norm(q.value.trim());let h='';palRes=[];
 const row=(r,ic,t,p,right,acts)=>{palRes.push(r);const k=palRes.length-1;return `<div class="r ${k===palSel?'on':''}" data-k="${k}">${ic}<div><div class="t">${t}</div><div class="p">${p}</div></div><span>${right||''}</span><div class="ra">${acts}</div></div>`;};
 const groups={};/* todas as palavras precisam aparecer em algum lugar: nome, descrição, especificações, tipos, cores/opções, caminho; plural simples vira singular */
 const pal=s.split(/\s+/).filter(Boolean).map(w=>w.length>3&&/[^s]s$/.test(w)?w.slice(0,-1):w);
 const casa=x=>{const it=IT(x.e);const hay=norm([it.nome,it.desc,...Object.values(it.spec||{}),...(x.e.tipos||[]).map(t=>t.n),...(it.ident?it.ident.ops.map(o=>o.n):[]),x.m?pathOf(x):''].join(' ')).replace(/\s+/g,' ');return pal.every(w=>hay.includes(w));};
 for(const x of allLoc()){if(s&&!casa(x))continue;(groups[x.e.ref]=groups[x.e.ref]||[]).push(x);}
 const its=Object.entries(groups).slice(0,30);if(its.length)h+='<div class="ph">Itens</div>';
 for(const [ref,xs] of its){const it=ITEMS[ref];const tot=xs.reduce((a,x)=>a+(countable(x.e)?unitsOf(x.e):0),0);const al=xs.flatMap(x=>alertsOf(x.e)).filter(a=>a[0]==='red').map(a=>a[1]);
  h+=row({t:'i',xs},clsH(it.cl),it.nome,(xs.length>1?`${xs.length} lugares`:pathOf(xs[0]))+(al.length?' · '+al.join(' · '):''),it.modo==='conjunto'?NIVEIS[xs[0].e.nivel]:`<b style="font:600 1.25rem var(--cond)">${tot}</b>`,
   xs.map((x,k)=>`<button class="pill sm ${k===0?'pri':''}" data-loc="${k}">${IC.loc}${xs.length>1?pathOf(x).split(' › ').slice(-2).join(' › '):'Localizar'}</button>`).join('')+(xs.length===1&&can()?`<button class="pill sm" data-mv>${IC.move}Mudar de lugar</button>`:''));}
 if(s){const nodes=[];for(const m of M){if(norm(m.nome).includes(s))nodes.push({k:'m',m});for(const p of m.partes){if(norm(partName(m,p)).includes(s)&&s.length>2)nodes.push({k:'p',m,p});for(const o of p.orgs)if(norm(orgName(o)).includes(s))nodes.push({k:'o',m,p,o});}}
  if(nodes.length){h+='<div class="ph">Lugares e organizadores</div>';for(const n of nodes.slice(0,12))h+=row({t:'n',n},n.k==='o'?`<span style="width:28px">${orgFront(n.o.tipo,n.o.cor)}</span>`:`<span class="cls" style="--c:#7A8794"><span class="ic">${IC.lab.replace('class="i"','')}</span></span>`,
   n.k==='m'?n.m.nome:n.k==='p'?partName(n.m,n.p):orgName(n.o),n.k==='m'?byLab(n.m.lab).nome:`${n.m.nome}${n.k==='o'?' › '+partName(n.m,n.p):''}`,'',`<button class="pill sm pri" data-loc="0">${IC.loc}Localizar</button>`);}}
 $('#pres').innerHTML=h||'<div style="padding:18px;color:var(--ink3)">Nada encontrado.</div>';}
q.addEventListener('input',()=>{palSel=0;renderPal();});
q.addEventListener('keydown',ev=>{if(ev.key==='ArrowDown'){palSel=Math.min(palRes.length-1,palSel+1);renderPal();ev.preventDefault();}else if(ev.key==='ArrowUp'){palSel=Math.max(0,palSel-1);renderPal();ev.preventDefault();}
 else if(ev.key==='Enter'){const r=palRes[palSel];if(r)buscaGo(r,0);}else if(ev.key==='Escape')closePalette();});
export function buscaGo(r,k,mv){closePalette();if(r.t==='i'){const x=r.xs[k||0];if(mv)return setTimeout(()=>startCarry({kind:'entry',x}),200);return setTimeout(()=>localizar(x),220);}
 const n=r.n;setTimeout(()=>{const f=byId(n.m.id);if(n.k==='m')return localizarPath({f});if(n.k==='p')return localizarPath({f,p:n.p});return localizarPath({f,p:n.p,o:n.o});},220);}
$('#pres').addEventListener('click',ev=>{const t=ev.target;if(!S.pal)return;const mode=S.pal.mode;
 if(mode==='buscar'){const r=t.closest('.r');if(!r)return;const k=+r.dataset.k;const lb=t.closest('[data-loc]');if(lb)return buscaGo(palRes[k],+lb.dataset.loc);if(t.closest('[data-mv]'))return buscaGo(palRes[k],0,true);
  if(k!==palSel){palSel=k;renderPal();}else buscaGo(palRes[k],0);return;}
 const g=t.closest('[data-g]');if(g){if(!can())return;const dest=mode==='aqui'?S.pal.dest:null;closePalette(true);
  if(g.dataset.g==='newitem')return openItemCreator({dest:dest&&dest.p?dest:null,destM:dest&&!dest.p?dest.f:null});return openOrgCreator({dest:dest&&dest.p?{f:dest.f,p:dest.p}:null,destM:dest&&!dest.p?dest.f:null});}
 const dv=t.closest('[data-dev]');if(dv){const l=loansAll()[+dv.dataset.dev];closePalette();setTimeout(()=>devolver(l.x,l.u,true),240);return;}
 const gt=t.closest('[data-gt]');if(gt){gTab=+gt.dataset.gt;renderPal();return;}
 const cr=t.closest('[data-gk]');if(cr&&can()){const x=locE(cr.dataset.e);const dest=mode==='aqui'?S.pal.dest:null;closePalette(true);
  if(dest&&dest.p)return insertDirect({kind:'entry',x},{f:dest.f,p:dest.p,o:dest.o||null});startCarry({kind:'entry',x,destM:dest?dest.f:null});}});
$('#scrim').onclick=()=>{if(modalEl.classList.contains('on')){/* formulários só fecham pelo Cancelar: um clique fora não pode jogar fora o que foi digitado */if(modalEl.querySelector('.form input,.form textarea')){modalEl.animate([{transform:'translate(-50%,-50%)'},{transform:'translate(calc(-50% - 6px),-50%)'},{transform:'translate(calc(-50% + 6px),-50%)'},{transform:'translate(-50%,-50%)'}],{duration:260});return toast('Para sair sem salvar, use <b>Cancelar</b>',null,1800);}return closeModal();}closePalette();};

/* ================= criar item ================= */
export function openItemCreator(opt={}){
 const st={nome:opt.nome||'',cl:sugCl(opt.nome||''),manual:false,modo:null,q:1,un:'un.',min:0,nivel:2,tipos:'',desc:'',spec:{},extra:[],id:{k:'',nome:'',ops:[],novo:''},more:false,rec:null};
 const modoDe=()=>st.modo||CL[st.cl||'div'].m;
 const total=()=>modoDe()==='unidades'&&st.id.k&&st.id.ops.length?st.id.ops.reduce((a,o)=>a+(o.q||0),0):st.q;
 const render=()=>{const cl=st.cl||'div';const modo=modoDe();const d=opt.dest;const tot=total();const okU=modo!=='unidades'||tot>0;
  modal(`<h4>Novo item</h4><div class="msub">${d?`Vai direto para <b>${d.f.d.nome} › ${partName(d.f.d,d.p)}${d.o?' › '+orgName(d.o):''}</b>.`:'Depois do cadastro você escolhe onde guardar, no 3D.'}</div>
  <div class="form"><label>Nome<input id="cn" value="${st.nome}" placeholder="Ex.: Broca 4 mm, Cola epóxi, Conector XT60"></label>
   <div class="flbl">Classe <span>${st.cl&&!st.manual&&st.nome?'sugerida pelo nome · toque para trocar':'toque para escolher'}</span></div>
   <div class="clc-grid">${Object.entries(CL).map(([k,v])=>`<button class="clc ${k===st.cl?'on':''}" data-ccl="${k}">${clsH(k)}<span>${v.n}</span></button>`).join('')}</div>
   <div class="flbl">Como controlar</div><div class="gsel wrap">${[['unidades','Por unidade','cada uma tem número (ferramentas, instrumentos)'],['contavel','Por quantidade','conta quanto tem (consumíveis)'],['conjunto','Caixa ou kit','só o nível: vazio a cheio']].map(([k,v,h])=>`<button data-cm="${k}" class="${k===modo?'on':''}"><b>${v}</b><small>${h}</small></button>`).join('')}</div>
   ${modo==='conjunto'?`<label>Quanto tem<div class="gsel">${NIVEIS.map((n,k)=>`<button data-cnv="${k}" class="${k===st.nivel?'on':''}">${n}</button>`).join('')}</div></label><label>Tipos dentro <span class="h">opcional · separe por vírgula</span><input id="ctp" value="${st.tipos}" placeholder="Ex.: M2, M3, M4"></label>${recH(st.rec,'cr')}`
   :modo==='contavel'?`<div class="row"><label>Quantidade<span class="stp big"><button data-cq="-">−</button><input id="cq" type="number" min="0" value="${st.q}"><button data-cq="+">+</button></span></label><label>Unidade de medida<input id="cu" value="${st.un}" placeholder="un., m, folhas"></label><label>Mínimo <span class="h">avisa abaixo</span><input id="cmn" type="number" min="0" value="${st.min}"></label></div>`
   :`${st.id.k&&st.id.ops.length?'':`<label>Quantas unidades<span class="stp big"><button data-cq="-">−</button><input id="cq" type="number" min="1" value="${st.q}"><button data-cq="+">+</button></span></label>`}${identH(st.id,true)}`}
   <button class="link cmore" data-cmore>${st.more?'− Esconder especificações e descrição':'+ Especificações e descrição (opcional)'}</button>
   ${st.more?`${specsH(cl,st.spec,st.extra)}<label>Descrição<textarea id="cd" rows="2" placeholder="Para que serve, cuidados, de quem é…">${st.desc}</textarea></label>`:''}
   ${(()=>{const ja=st.nome.trim()&&Object.values(ITEMS).find(i=>norm(i.nome)===norm(st.nome)&&i.modo===modo);return ja?`<div class="hint">Já existe <b>${ja.nome}</b> cadastrado assim. Ao criar, ele entra como mais um lugar do mesmo item${ja.ident?` (diferenciado por <b>${ja.ident.nome.toLowerCase()}</b>: ${ja.ident.ops.map(o=>o.n).join(', ')})`:''}.</div>`:'';})()}
   <div class="ferr" id="cerr">${okU?'':'Diga quantas unidades existem (pelo menos uma).'}</div></div>
  <div class="mf"><button class="pill" data-mclose>Cancelar</button>${d?`<button class="pill pri" data-cok="here" ${okU?'':'disabled'}>${IC.in}Criar e guardar aqui</button>`:`<button class="pill" data-cok="sem" ${okU?'':'disabled'}>Criar sem lugar</button><button class="pill pri" data-cok="place" ${okU?'':'disabled'}>${IC.loc}Criar e escolher lugar</button>`}</div>`,true);
  const cn=modalEl.querySelector('#cn');if(!st._foco){st._foco=1;cn.focus();cn.setSelectionRange(99,99);}
  cn.oninput=()=>{const ex=v=>!!(v.trim()&&Object.values(ITEMS).some(i=>norm(i.nome)===norm(v)));const mudouEx=ex(st.nome)!==ex(cn.value);st.nome=cn.value;if(mudouEx&&st.manual){sync();render();const c2=modalEl.querySelector('#cn');c2.focus();c2.setSelectionRange(99,99);return;}if(!st.manual||mudouEx){const s_=st.manual?st.cl:sugCl(cn.value);if(s_!==st.cl||mudouEx){sync();if(s_!==st.cl){st.cl=s_;st.modo=null;}render();const c2=modalEl.querySelector('#cn');c2.focus();c2.setSelectionRange(99,99);}}};
  const cq=modalEl.querySelector('#cq');if(cq)cq.oninput=()=>{st.q=Math.max(modoDe()==='unidades'?1:0,Math.round(+cq.value||0));};};
 const sync=()=>{const g=id=>modalEl.querySelector(id);if(g('#cn'))st.nome=g('#cn').value;if(g('#cu'))st.un=g('#cu').value;if(g('#cmn'))st.min=Math.max(0,+g('#cmn').value||0);if(g('#cd'))st.desc=g('#cd').value;if(g('#ctp'))st.tipos=g('#ctp').value;if(g('#cq'))st.q=Math.max(modoDe()==='unidades'?1:0,Math.round(+g('#cq').value||0));
  modalEl.querySelectorAll('[data-spec]').forEach(i=>st.spec[i.dataset.spec]=i.value);modalEl.querySelectorAll('[data-sxk]').forEach(i=>st.extra[+i.dataset.sxk][0]=i.value);modalEl.querySelectorAll('[data-sxv]').forEach(i=>st.extra[+i.dataset.sxv][1]=i.value);identSync(st.id,modalEl);};
 render();
 modalEl.onkeydown=ev=>{if(ev.key==='Enter'&&ev.target.matches('[data-idf=novo]')){ev.preventDefault();sync();if(identAdd(st.id,true))render();const n=modalEl.querySelector('[data-idf=novo]');n&&n.focus();}};
 modalEl.oninput=ev=>{const t=ev.target;if(t.matches('[data-idf=novaCor]')){st.id._corTocada=true;st.id.novaCor=t.value;t.parentElement.style.setProperty('--c',t.value);}if(t.matches('[data-idc]')){t.parentElement.style.setProperty('--c',t.value);}
  if(t.matches('[data-idf=novo]')&&st.id.k==='cor'&&!st.id._corTocada){const sw=modalEl.querySelector('[data-idf=novaCor]');if(sw){sw.value=corDoNome(t.value,st.id.ops.map(o=>o.c));sw.parentElement.style.setProperty('--c',sw.value);}}};
 modalEl.onclick=ev=>{const t=ev.target;if(t.closest('[data-mclose]'))return closeModal();
  if(!t.closest('input,textarea,select'))sync();
  if(identClick(st.id,t,true)){if(st.id.k&&st.id.ops.length===0&&st.q>0&&t.closest('[data-idk]')){}return render();}
  const c=t.closest('[data-ccl]');if(c){st.cl=c.dataset.ccl;st.manual=true;st.modo=null;return render();}
  const cm=t.closest('[data-cm]');if(cm){st.modo=cm.dataset.cm;if(st.modo!=='unidades')st.id={k:'',nome:'',ops:[],novo:''};return render();}const rt=t.closest('[data-crt]');if(rt){st.rec=recSet(st.rec,rt.dataset.crt);return render();}const rc=t.closest('[data-crc]');if(rc){st.rec=recSet(st.rec,null,rc.dataset.crc);return render();}const cv=t.closest('[data-cnv]');if(cv){st.nivel=+cv.dataset.cnv;return render();}
  if(t.closest('[data-cmore]')){st.more=!st.more;return render();}
  if(t.closest('[data-sxadd]')){st.extra.push(['','']);return render();}
  const cq=t.closest('[data-cq]');if(cq){st.q=Math.max(modoDe()==='unidades'?1:0,st.q+(cq.dataset.cq==='+'?1:-1));return render();}
  const ok=t.closest('[data-cok]');if(!ok||ok.disabled)return;if(!st.nome.trim()){modalEl.querySelector('#cn').focus();modalEl.querySelector('#cerr').textContent='Dê um nome ao item.';return;}
  st.nome=clean(st.nome);st.desc=clean(st.desc);st.un=clean(st.un);if(!st.nome)return;
  const cl=st.cl||'div';const modo=modoDe();const spec={};for(const [k,v] of Object.entries(st.spec))if(v&&clean(v))spec[k]=clean(v);for(const [k,v] of st.extra)if(clean(k)&&clean(v))spec[clean(k)]=clean(v);
  const ident=modo==='unidades'?identFinal(st.id):null;const uv=ident?st.id.ops.flatMap(o=>Array(o.q||0).fill(o.n)):null;
  if(modo==='unidades'&&(uv?uv.length:st.q)<1){modalEl.querySelector('#cerr').textContent='Diga quantas unidades existem (pelo menos uma).';return;}
  /* mesmo nome e mesmo modo: é o mesmo item em mais um lugar, não um cadastro novo */
  const ja=Object.values(ITEMS).find(i=>norm(i.nome)===norm(st.nome)&&i.modo===modo);const id=ja?ja.id:'I'+uid();
  if(ja&&ja.ident&&ident&&norm(ja.ident.nome)!==norm(ident.nome)){modalEl.querySelector('#cerr').textContent=`${ja.nome} já é diferenciado por ${ja.ident.nome.toLowerCase()}. Use o mesmo critério ou dê outro nome ao item.`;return;}
  if(ja){if(ident){ja.ident=ja.ident||{nome:ident.nome,tipo:ident.tipo,ops:[]};for(const o of ident.ops)if(!identOp(ja,o.n))ja.ident.ops.push(o);}}
  else ITEMS[id]={id,nome:st.nome,cl,modo,un:st.un||'un.',min:st.min,desc:st.desc,spec,obs:'',...(ident?{ident}:{}),...(modo==='conjunto'&&st.rec?{rec:{...st.rec}}:{})};
  const n0=ja&&modo==='unidades'?Math.max(0,...allLoc().filter(y=>y.e.ref===id&&y.e.units).flatMap(y=>y.e.units.map(u=>u.n))):0;
  const e=E(id,{t:Date.now()});if(modo==='unidades')e.units=uv?uv.map((v,k)=>U(n0+k+1,'boa',null,v)):Array.from({length:st.q},(_,k)=>U(n0+k+1));else if(modo==='contavel')e.qtd=st.q;else{e.nivel=st.nivel;e.tipos=st.tipos.split(',').map(z=>clean(z)).filter(Boolean).map(n=>({n}));}
  if(ja&&!(opt.dest&&((opt.dest.o||opt.dest.p).itens||[]).some(z=>z.ref===id)))toast(`<b>${st.nome}</b> já estava cadastrado. Entrou como mais um lugar do mesmo item.`,null,3600);
  log(`Cadastrado: ${st.nome}`,id);closeModal();
  const box=opt.dest&&(opt.dest.o||opt.dest.p);const mesmo=ja&&ok.dataset.cok==='here'&&box&&(box.itens||[]).find(z=>z.ref===id);
  if(mesmo){if(modo==='unidades')mesmo.units.push(...e.units);else if(modo==='contavel')mesmo.qtd+=e.qtd;else{mesmo.nivel=e.nivel;for(const t of e.tipos)if(!(mesmo.tipos||[]).some(z=>norm(z.n)===norm(t.n)))(mesmo.tipos=mesmo.tipos||[]).push(t);}
   touch(mesmo);save();refreshCards();buildContents(opt.dest.f,opt.dest.p.id);toast(`Somado ao <b>${st.nome}</b> que já estava aqui`,null,2600);return;}
  if(ok.dataset.cok==='here')return insertDirect({kind:'new',e},opt.dest,relRect(modalEl));
  if(ok.dataset.cok==='sem'){SEM.itens.push(e);save();return toast(`<b>${st.nome}</b> cadastrado sem lugar. Aparece em Guardar › Sem lugar.`);}
  startCarry({kind:'new',e,destM:opt.destM});};}

/* ================= criar organizador (seletor) ================= */
export const ocEl=$('#oc'),ocx=$('#ocx');export let show=null;
export function openOrgCreator(opt={}){if(!can())return;closeStack(true);deselect();S.oc={ti:0,cor:OT[OTK[0]].cor,corManual:false,tam:'M',nome:'',etq:null,dest:opt.dest||null,destM:opt.destM||null,slide:0};
 show=new THREE.Group();scene.add(show);buildShow(0);renderOC();ocEl.classList.add('on');ocx.classList.add('on');home();}
export function ocData(i){const s=S.oc;const tp=OTK[(i+OTK.length)%OTK.length];return {id:'show'+i,tipo:tp,cor:(tp===OTK[s.ti]||s.corManual)?s.cor:OT[tp].cor,tam:tamsOf(tp).includes(s.tam)?s.tam:'M',itens:[]};}
export function buildShow(dir){const s=S.oc;for(const c of [...show.children]){show.remove(c);c.traverse(x=>{if(x.isMesh)x.geometry.dispose();});}
 for(const k of [-1,0,1]){const o=ocData(s.ti+k);o._sz=orgSz(o);const holder=new THREE.Group();show.add(holder);const g=buildOrg(o,holder);const H=orgH(o);g.position.y=-H/2;
  holder.userData={k,g};applyStyleTo(holder);
  if(k){holder.traverse(x=>{if(x.isMesh){x.material=x.material.clone();x.material.transparent=true;x.material.opacity=.3;x.castShadow=false;}});}}
 s.slide=dir;if(dir)tween({ms:420,ease:'out',key:'oslide',update:p=>{s.slide=dir*(1-p);}});}
export function renderOC(){const s=S.oc;const t=OT[OTK[s.ti]];const node={etq:s.etq};
 ocEl.innerHTML=`<h4>Novo organizador</h4><div style="color:var(--ink2);font-size:.82rem">${s.dest?`Vai direto para <b>${s.dest.f.d.nome} › ${partName(s.dest.f.d,s.dest.p)}</b>.`:'Depois você escolhe onde guardar.'}</div>
 <div class="tsel"><button class="ibtn" data-o="prev">${IC.back}</button><div class="tn"><b>${t.n}</b><small>${OTK.indexOf(OTK[s.ti])+1} de ${OTK.length}</small></div><button class="ibtn" data-o="next">${IC.next}</button></div>
 <div class="form" style="padding-top:0"><label>Cor<div class="cols8">${[OT[OTK[s.ti]].cor,...OCOL.filter(c=>c!==OT[OTK[s.ti]].cor)].slice(0,8).map(c=>`<button data-oc="${c}" class="${c===s.cor?'on':''}${c===TRANSP?' tr':''}" style="--c:${c}" title="${c===TRANSP?'Transparente':''}"></button>`).join('')}</div></label>
 <label>Tamanho<div class="gsel">${tamsOf(OTK[s.ti]).map(z=>`<button data-oz="${z}" class="${z===s.tam?'on':''}">${{P:'Pequeno',M:'Médio',G:'Grande'}[z]}</button>`).join('')}</div></label>
 <label>Nome (opcional)<input id="on" value="${s.nome}" placeholder="${t.n} — ex.: Bandeja de corte"></label>
 <label>Etiqueta (opcional)<div>${tagH(node,'oc')}</div></label></div>
 <div class="mf"><button class="pill" data-o="cancel">Cancelar</button><button class="pill pri" data-o="ok">${s.dest?IC.in+'Criar e guardar aqui':IC.loc+'Criar e escolher lugar'}</button></div>`;
 ocx.innerHTML=`<div class="ocdots glass">${OTK.map((k,i)=>`<i class="${i===s.ti?'on':''}"></i>`).join('')}</div>`;
 const on=ocEl.querySelector('#on');on.oninput=()=>s.nome=on.value;}
ocEl.addEventListener('click',ev=>{const s=S.oc;if(!s)return;const t=ev.target;const tag=t.closest('[data-tag]');if(tag)return tagPop(tag);
 const b=t.closest('[data-o]');if(b){const a=b.dataset.o;if(a==='prev'||a==='next'){s.ti=(s.ti+(a==='next'?1:-1)+OTK.length)%OTK.length;if(!s.corManual)s.cor=OT[OTK[s.ti]].cor;buildShow(a==='next'?1:-1);renderOC();return;}
  if(a==='cancel')return closeOC();if(a==='ok'){const o=O(OTK[s.ti],s.cor,tamsOf(OTK[s.ti]).includes(s.tam)?s.tam:'M',{nome:clean(s.nome),etq:s.etq});log(`Organizador criado: ${orgName(o)}`);const from=relRect(ocEl);const d=s.dest,dm=s.destM;closeOC(true);
   if(d)return insertDirect({kind:'neworg',o},{f:d.f,p:d.p,o:null},from);return startCarry({kind:'neworg',o,destM:dm});}}
 const c=t.closest('[data-oc]');if(c){s.cor=c.dataset.oc;s.corManual=c.dataset.oc!==OT[OTK[s.ti]].cor;buildShow(0);renderOC();return;}const z=t.closest('[data-oz]');if(z){s.tam=z.dataset.oz;buildShow(0);renderOC();}});
export function closeOC(keep){S.oc=null;ocEl.classList.remove('on');ocx.classList.remove('on');if(show){scene.remove(show);show=null;}home();if(!keep)goHome();}
export function updateShow(now){if(!show||!S.oc)return;const fw=new THREE.Vector3();camera.getWorldDirection(fw);const r=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0);const up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
 const base=camera.position.clone().addScaledVector(fw,1.5).addScaledVector(r,mob()?0:-.16).addScaledVector(up,mob()?.12:.02);
 show.children.forEach(h=>{const k=h.userData.k;const off=k*.36+S.oc.slide*.36;h.position.copy(base).addScaledVector(r,off).addScaledVector(fw,Math.abs(k)*.25);const sc=k?.45:.85;h.scale.setScalar(sc);
  const bk=camera.position.clone().sub(h.position);h.rotation.set(0,Math.atan2(bk.x,bk.z)+Math.sin(now*.0006)*.6+(k?.5:0),0);
  const g=h.userData.g;if(!k&&g.userData.lid)g.userData.lid.rotation.x=-.9-.3*Math.sin(now*.002);});}

/* ================= guardar no 3D (destino + confirmação) ================= */
export const guide=$('#guide');
export function carryLabel(c){if(c.kind==='org'||c.kind==='neworg'){const o=c.kind==='org'?c.x.o:c.o;return `<span style="width:30px;height:24px;display:inline-block">${orgFront(o.tipo,o.cor)}</span>${orgName(o)}`;}
 const e=c.kind==='new'?c.e:c.x.e;return `${clsH(IT(e).cl,'sm')}${IT(e).nome}${c.kind==='unit'?' · '+c.u.n:''}`;}
export function startCarry(c){if(!can())return;closePalette(true);closeStack(true);deselect();closePop();c.stage='part';S.carry=c;
 c.ghost=new THREE.Group();scene.add(c.ghost);
 if(c.kind==='org'||c.kind==='neworg'){const o=c.kind==='org'?c.x.o:c.o;const g=buildOrg({...o,id:'ghost',_sz:orgSz(o)},c.ghost);applyStyleTo(c.ghost);}
 else piece(c.ghost,c.kind==='new'?c.e:c.x.e,.16);c.ghost.visible=false;
 if(c.destM){focusF(c.destM);}else if(!S.lab&&c.x&&c.x.m)focusLab(c.x.m.lab);else if(S.lab)focusLab(S.lab);/* afasta do close do card: dá para ver os outros móveis */
 showGuide();home();refreshCards();}
export function showGuide(){const c=S.carry;if(!c){guide.classList.remove('on');return;}
 if(c.stage==='part'){const h=c.hover;const last=S.last&&validTarget(S.last.f,S.last.p.id)?`<button class="pill sm" data-gd="last">${IC.loc}Último: ${S.last.f.d.nome} › ${partName(S.last.f.d,S.last.p)}</button>`:'';
  guide.innerHTML=`<span class="carryx">${carryLabel(c)}</span><span>${h?`Guardar em <b>${h.f.d.nome} › ${partName(h.f.d,h.f.d.partes.find(p=>p.id===h.pid))}</b> · clique para escolher`:(mob()?'Toque na parte do móvel onde vai guardar':'Passe o mouse sobre as partes dos móveis e clique onde vai guardar')}</span>${last}<button class="pill sm ghost" data-gd="cancel">Cancelar</button>`;}
 else{const t=c.target;const path=`${t.f.d.nome} › ${partName(t.f.d,t.p)}${t.org?' › '+orgName(t.org):''}`;const isItem=!(c.kind==='org'||c.kind==='neworg');
  guide.innerHTML=`<span class="carryx">${carryLabel(c)}</span><span>Guardar em <b>${path}</b>${isItem&&t.p.orgs.length?' · clique num organizador para pôr dentro dele':''}</span><button class="pill sm" data-gd="back">${IC.back}Voltar</button><button class="pill sm pri" data-gd="ok">${IC.check}Confirmar</button>`;}
 guide.classList.add('on');}
guide.addEventListener('click',ev=>{const b=ev.target.closest('[data-gd]');if(!b||!S.carry)return;const a=b.dataset.gd;
 if(a==='cancel')return cancelCarry();if(a==='back')return carryBack();if(a==='ok')return commitCarry();if(a==='last')return chooseTarget(S.last.f,S.last.p.id);});
export const validTarget=(f,pid)=>{const p=f.d.partes.find(x=>x.id===pid);return p&&!p.cheia&&(!S.lab||f.d.lab===S.lab||true);};
export function chooseTarget(f,pid){const c=S.carry;const p=f.d.partes.find(x=>x.id===pid);c.stage='confirm';c.target={f,p,org:null};c.hover=null;setHoverPart(null);ensureLab(f);setOpen(f,pid);focusPart(f,pid);
 if(!(c.kind==='org'||c.kind==='neworg'))spreadOrgs(f,pid,1);placeGhost();showGuide();}
export function carryBack(){const c=S.carry;const t=c.target;if(t){spreadOrgs(t.f,t.p.id,0);setOpen(t.f,null);}c.stage='part';c.target=null;showGuide();if(S.lab)focusLab(S.lab);}
export function cancelCarry(){const c=S.carry;if(!c)return;if(c.target){spreadOrgs(c.target.f,c.target.p.id,0);setOpen(c.target.f,null);}scene.remove(c.ghost);S.carry=null;guide.classList.remove('on');setHoverPart(null);home();refreshCards();
 if(c.kind==='new'){SEM.itens.push(c.e);toast(`<b>${IT(c.e).nome}</b> ficou sem lugar. Aparece em Guardar › Sem lugar.`);}}
export function spreadOrgs(f,pid,on){const pt=f.parts[pid];(pt.orgG||[]).forEach(g=>{if(!g.userData.base0)g.userData.base0=g.position.clone();const b=g.userData.base0;const dir=new THREE.Vector3(b.x,0,b.z);if(dir.lengthSq()<1e-4)dir.set(0,0,-1);dir.normalize();
  const from=g.position.clone(),to=on?b.clone().addScaledVector(dir,.04).add(new THREE.Vector3(0,.035,0)):b.clone();tween({ms:420,ease:'spring',key:'sp'+g.userData.org,update:p=>g.position.lerpVectors(from,to,p)});});}
export function ghostTarget(){const c=S.carry;if(!c)return null;
 if(c.stage==='confirm'){const tf=c.target.f;const pt=tf.parts[c.target.p.id];if(c.target.org){const og=pt.orgG.find(x=>x.userData.org===c.target.org.id);if(og){const t=new THREE.Vector3();og.getWorldPosition(t);t.y+=og.userData.H+.12;return t;}}const t=partW(tf,c.target.p.id);t.y+=.1;return t;}
 if(c.hover){const t=partW(c.hover.f,c.hover.pid);t.y+=.1;return t;}return null;}
export function placeGhost(){const c=S.carry;if(!c)return;const g=c.ghost;const t=ghostTarget();const tf=c.stage==='confirm'?c.target.f:c.hover&&c.hover.f;
 if(t){if(!g.visible)g.position.copy(t);g.visible=true;g.userData.to=t;g.quaternion.copy(tf.g.quaternion);g.scale.setScalar(c.stage==='confirm'?1:1.15);}else g.visible=false;}
export function commitCarry(){const c=S.carry;const t=c.target;const f=t.f,p=t.p,o=t.org;const into=o?o.itens:p.itens;let undo=null,msg='',newId=null;
 if(c.kind==='entry'){const x=c.x;removeEntry(x);const same=into.find(e=>e.ref===x.e.ref&&e!==x.e);const it=IT(x.e);
  if(same&&it.modo==='contavel'){same.qtd+=x.e.qtd;newId=same.id;touch(same);}else if(same&&it.modo==='unidades'){same.units.push(...x.e.units);same.units.sort((a,b)=>a.n-b.n);newId=same.id;touch(same);}else{into.push(x.e);touch(x.e);x.e.nf=false;newId=x.e.id;}
  if(!same||it.modo==='conjunto')undo=()=>{into.splice(into.indexOf(x.e),1);restoreEntry(x);rebuildAt(x);buildContents(f,p.id);refreshCards();};
  msg=`<b>${it.nome}</b> agora está em ${f.d.nome} › ${partName(f.d,p)}${o?' › '+orgName(o):''}`;log(`${it.nome}: de ${pathOf(x)} para ${f.d.nome} › ${partName(f.d,p)}${o?' › '+orgName(o):''}`,it.id);rebuildAt(x);}
 else if(c.kind==='unit'){const x=c.x,u=c.u;const it=IT(x.e);x.e.units.splice(x.e.units.indexOf(u),1);const rm=!x.e.units.length;if(rm)removeEntry(x);
  let same=into.find(e=>e.ref===x.e.ref);if(same&&same!==x.e){same.units.push(u);same.units.sort((a,b)=>a.n-b.n);touch(same);newId=same.id;}else{const ne=E(x.e.ref,{units:[u],t:Date.now()});into.push(ne);newId=ne.id;}
  msg=`<b>${it.nome} · ${u.n}</b> agora em ${o?orgName(o):partName(f.d,p)}`;log(`${it.nome} #${u.n}: de ${pathOf(x)} para ${f.d.nome} › ${partName(f.d,p)}`,it.id);rebuildAt(x);}
 else if(c.kind==='new'){into.push(c.e);newId=c.e.id;msg=`<b>${IT(c.e).nome}</b> agora está em ${f.d.nome} › ${partName(f.d,p)}${o?' › '+orgName(o):''}`;}
 else if(c.kind==='org'){const x=c.x;x.p.orgs.splice(x.p.orgs.indexOf(x.o),1);p.orgs.push(x.o);msg=`<b>${orgName(x.o)}</b> agora em ${f.d.nome} › ${partName(f.d,p)}`;log(`${orgName(x.o)}: movido para ${f.d.nome} › ${partName(f.d,p)}`);
  buildContents(byId(x.m.id),x.p.id);undo=()=>{p.orgs.splice(p.orgs.indexOf(x.o),1);x.p.orgs.push(x.o);buildContents(byId(x.m.id),x.p.id);buildContents(f,p.id);refreshCards();};}
 else if(c.kind==='neworg'){p.orgs.push(c.o);msg=`<b>${orgName(c.o)}</b> agora está em ${f.d.nome} › ${partName(f.d,p)}`;}
 S.last={f,p};scene.remove(c.ghost);S.carry=null;guide.classList.remove('on');buildContents(f,p.id);popIn(f,p.id,newId,c.kind==='org'||c.kind==='neworg'?(c.o||c.x.o).id:null);
 const ent=[{t:'m',f},{t:'p',f,p}];if(o)ent.push({t:'o',f,p,o});openStack(ent);
 setTimeout(()=>{const r=newId&&document.querySelector(`.scard:last-child .irow[data-item="${newId}"]`);if(r){r.classList.add('new','hl');r.scrollIntoView({block:'nearest'});}},120);
 toast(msg,undo);refreshBadges();}
export function popIn(f,pid,entryId,orgId){const pt=f.parts[pid];let tgt=null;pt.content.traverse(x=>{if(!tgt&&((entryId&&x.userData.entry===entryId&&x.userData.icon)||(orgId&&x.userData.org===orgId&&x.isGroup&&x.userData.inner)))tgt=x;});
 if(!tgt)return;tween({ms:620,ease:'back',update:p=>tgt.scale.setScalar(Math.max(.01,p))});}
export function insertDirect(c,dest,from){const f=dest.f,p=dest.p;const pos=partW(f,p.id);const [sx,sy]=project(pos);const fr=from?{x:from.x+from.w/2,y:from.y+from.h/2}:{x:app.clientWidth/2,y:app.clientHeight/2};
 closeStack(true);setOpen(f,p.id);focusPart(f,p.id);
 fly(fr,{x:sx,y:sy},carryLabel(c),640,()=>{c.stage='confirm';c.target={f,p,org:dest.o||null};c.ghost=new THREE.Group();S.carry=c;commitCarry();});}

/* ================= localizar: caminho passo a passo ================= */
export const crumbsEl=$('#crumbs');
export async function localizarPath(t,x,after){if(S.loc)return;closeStack(true);deselect();const f=t.f;S.loc={f};const L=byLab(f.d.lab);
 const steps=[L.nome.replace('Laboratório de ','Lab. de '),f.d.nome];if(t.p)steps.push(partName(f.d,t.p));if(t.o)steps.push(orgName(t.o));if(x)steps.push(IT(x.e).nome);
 crumbsEl.innerHTML=steps.map((s,i)=>`${i?'<i>›</i>':''}<span class="glass" data-c="${i}">${s}</span>`).join('');const on=i=>{const el=crumbsEl.querySelector(`[data-c="${i}"]`);el&&el.classList.add('on');};
 home();S.lab=f.d.lab;applyStyle();updateLabChip();camTo(L.c,fitD(L.d),DIR,700);on(0);await wait(1000);
 S.sel=f;focusF(f);on(1);await wait(1000);
 if(t.p){S.loc.pid=t.p.id;setOpen(f,t.p.id);focusPart(f,t.p.id);on(2);await wait(1000);}
 if(t.o){orgOpen(f,t.p.id,t.o.id,1);focusOrg(f,t.p.id,t.o);on(3);await wait(1000);}
 if(x){on(steps.length-1);let ic=null;f.parts[t.p.id].content.traverse(o=>{if(!ic&&o.userData.entry===x.e.id&&o.userData.icon)ic=o.userData.icon;});
  if(ic){const s0=ic.scale.x;tween({ms:900,ease:'lin',update:p=>{const k=1+.6*Math.sin(p*Math.PI*3)*(1-p);ic.scale.set(s0*k,s0*k,1);}});}await wait(700);}
 S.loc=null;crumbsEl.querySelectorAll('span').forEach(s=>s.classList.remove('on'));setTimeout(()=>{if(!S.loc)crumbsEl.innerHTML='';},450);
 const ent=[{t:'m',f}];if(t.p)ent.push({t:'p',f,p:t.p});if(t.o)ent.push({t:'o',f,p:t.p,o:t.o});openStack(ent);
 if(x){setTimeout(()=>{const r=document.querySelector(`.scard:last-child .irow[data-item="${x.e.id}"]`);if(r){r.classList.add('hl');r.scrollIntoView({block:'nearest'});}},150);
  const em=IT(x.e).modo==='unidades'?x.e.units.filter(u=>u.emp):[];
  if(after)after();else if(x.e.nf)toast(`Deveria estar aqui. Alguém marcou como <b>não encontrado</b>.`,null,5200);
  else if(em.length)toast(`Deveria estar aqui · ${em.map(u=>`unidade ${u.n} com ${u.emp.para} desde ${new Date(u.emp.desde).toLocaleDateString('pt-BR')}`).join(' · ')}`,null,6000);}}
export function localizar(x,after){if(!x)return;if(x.sem)return toast(`<b>${IT(x.e).nome}</b> não tem lugar definido. Use Guardar para escolher um.`);localizarPath({f:byId(x.m.id),p:x.p,o:x.o},x,after);}

/* ================= lista de compras, etiquetas, histórico ================= */
export function sugCompras(){const r=[];for(const x of allLoc()){const it=IT(x.e);if(it.modo==='contavel'&&x.e.qtd<=it.min)r.push({x,why:x.e.qtd===0?'Esgotado':`Abaixo do mínimo (${x.e.qtd}/${it.min})`,q:Math.max(1,it.min*2-x.e.qtd)});
 if(it.modo==='conjunto'){const au=(x.e.tipos||[]).filter(t=>t.aus);if(au.length||x.e.nivel===0)r.push({x,why:au.length?'Faltando: '+au.map(t=>t.n).join(', '):'Vazio',q:1});}}
 return r.filter(s=>!BUY.some(b=>b.x.e===s.x.e));}
export function openCompras(){const sug=sugCompras();const sel=new Set(sug.map((_,i)=>i));
 const render=()=>{modal(`<h4>Lista de compras</h4><div style="color:var(--ink2);font-size:.86rem">O laboratório sugere o que acabou, o que está abaixo do mínimo e o que teve falta registrada. Você escolhe o que entra na lista.</div>
  <div class="mb buy"><div class="grp">Sugestões do laboratório · ${sug.length}</div>${sug.length?sug.map((s,i)=>`<div class="br"><input type="checkbox" data-bs="${i}" ${sel.has(i)?'checked':''}>${clsH(IT(s.x.e).cl,'sm')}<div><div class="t">${IT(s.x.e).nome}</div><div class="p">${s.why} · ${pathOf(s.x)}</div></div><span></span></div>`).join(''):'<div style="color:var(--ink3);font-size:.85rem">Nada a sugerir agora.</div>'}
  ${sug.length?`<div style="margin:8px 0 4px"><button class="pill sm pri" data-bimp>${IC.cart}Importar selecionados</button></div>`:''}
  <div class="grp">Na lista · ${BUY.length}</div>${BUY.length?BUY.map((b,i)=>`<div class="br"><span></span>${clsH(IT(b.x.e).cl,'sm')}<div><div class="t">${IT(b.x.e).nome}</div><div class="p">${b.why}</div></div><span style="display:flex;gap:6px;align-items:center">${IT(b.x.e).modo==='contavel'?`<input type="number" min="1" value="${b.q}" data-bq="${i}"> ${IT(b.x.e).un}`:''}<button class="pill sm" data-bok="${i}">${IC.check}Comprado</button></span></div>`).join(''):'<div style="color:var(--ink3);font-size:.85rem">Vazia.</div>'}</div>
  <div class="mf"><button class="pill" data-mclose>Fechar</button></div>`,true);};
 render();
 modalEl.onclick=ev=>{const t=ev.target;if(t.closest('[data-mclose]'))return closeModal();const bs=t.closest('[data-bs]');if(bs){const i=+bs.dataset.bs;bs.checked?sel.add(i):sel.delete(i);return;}
  if(t.closest('[data-bimp]')){[...sel].sort((a,b)=>a-b).forEach(i=>BUY.push(sug[i]));log(`Lista de compras: ${sel.size} itens importados`);return openCompras();}
  const ok=t.closest('[data-bok]');if(ok){const b=BUY[+ok.dataset.bok];const it=IT(b.x.e);if(it.modo==='contavel'){b.x.e.qtd+=b.q;}else{b.x.e.tipos.forEach(t=>t.aus=false);b.x.e.nivel=3;}touch(b.x.e);
   COMPRADOS.push({...b,em:Date.now()});BUY.splice(+ok.dataset.bok,1);log(`Comprado: ${it.nome}${it.modo==='contavel'?' (+'+b.q+' '+it.un+')':''}`,it.id);rebuildAt(b.x);refreshCards();toast(`<b>${it.nome}</b> reposto em ${pathOf(b.x)}`);return openCompras();}};
 modalEl.oninput=ev=>{const bq=ev.target.closest('[data-bq]');if(bq)BUY[+bq.dataset.bq].q=Math.max(1,+bq.value||1);};}
$('#buyBtn').onclick=openCompras;
$('#recBtn').onclick=()=>{modal(`<h4>Recado do quadro</h4><div style="color:var(--ink2);font-size:.86rem">Aparece no quadro branco do laboratório. Até 4 linhas curtas.</div><div class="form"><textarea id="rec" rows="4">${RECADO.linhas.join('\n')}</textarea></div><div class="mf"><button class="pill" data-mclose>Cancelar</button><button class="pill pri" data-rok>Salvar</button></div>`);
 modalEl.onclick=ev=>{if(ev.target.closest('[data-mclose]'))return closeModal();if(ev.target.closest('[data-rok]')){RECADO.linhas=modalEl.querySelector('#rec').value.split('\n').map(clean).filter(Boolean).slice(0,4);setRecado(RECADO.linhas);log('Recado do quadro alterado');closeModal();toast('Recado atualizado no quadro',null,1800);}};};
$('#resetBtn').onclick=()=>{modal(`<h4>Restaurar a demonstração</h4><div style="color:var(--ink2);font-size:.9rem">Apaga tudo o que foi cadastrado e movido neste navegador e volta aos dados de exemplo.</div><div class="mf"><button class="pill" data-mclose>Cancelar</button><button class="pill danger" data-rst>Restaurar</button></div>`);
 modalEl.onclick=ev=>{if(ev.target.closest('[data-mclose]'))return closeModal();if(ev.target.closest('[data-rst]'))resetDemo();};};
$('#labelsBtn').onclick=()=>{const used=new Map();for(const m of M){m.etq&&used.set(m.etq,m.nome);for(const p of m.partes){p.etq&&used.set(p.etq,`${m.nome} › ${partName(m,p)}`);p.orgs.forEach(o=>o.etq&&used.set(o.etq,orgName(o)));}}
 modal(`<h4>Etiquetas</h4><div style="color:var(--ink2);font-size:.85rem">Folha para imprimir. O QR aqui é só um padrão visual; na versão real ele abre o lugar no app.</div><div class="mb"><div class="sheetlab">${ETQ.map(e=>`<div class="flbl">${qrSvg(e.t)}<div><b>${e.t}</b><small>${used.get(e.id)||'sem uso'}</small></div></div>`).join('')}</div></div><div class="mf"><button class="pill" data-mclose>Fechar</button></div>`,true);modalEl.onclick=ev=>{if(ev.target.closest('[data-mclose]'))closeModal();};};
$('#histBtn').onclick=()=>{modal(`<h4>Histórico</h4><div class="mb"><ul class="hist2" style="list-style:none;padding:0;margin:0">${LOG.map(l=>`<li><span class="t">${l.h}</span>${l.t}</li>`).join('')}</ul></div><div class="mf"><button class="pill" data-mclose>Fechar</button></div>`);modalEl.onclick=ev=>{if(ev.target.closest('[data-mclose]'))closeModal();};};

/* ================= vistoria guiada ================= */
export const vs=$('#vsheet');
export function startVist(){closeStack(true);deselect();const lab=S.lab||'man';focusLab(lab,true);const route=F.filter(f=>f.d.lab===lab&&f.d.partes.length).sort((a,b)=>stats(b.d).al-stats(a.d).al);
 S.vist={route,i:0,ok:new Set(),fix:new Set(),open:null};vs.classList.add('on');home();vistGo();}
export function stopVist(){if(S.vist){const f=S.vist.route[S.vist.i];f&&setOpen(f,null);}S.vist=null;vs.classList.remove('on');setMode('nav');S.sel=null;goHome();home();}
/* a parte conferida guarda a data: a vistoria seguinte usa isso para priorizar */
export function conferido(f){if(!f)return;const em=Date.now(),por=S.me||'';for(const p of f.d.partes)p.conf={em,por};save();}
export function vistGo(){const v=S.vist;const f=v.route[v.i];if(!f){renderVist();return;}S.sel=f;
 /* mesma regra do foco normal: de frente para o móvel, sem parede no caminho; um pouco mais longe e com o móvel acima da folha da vistoria */
 const asp_=app.clientWidth/app.clientHeight;const dist=Math.max(4.2,Math.min(8.5,f.size*2.6+2.4))*Math.pow(Math.max(1,1.2/asp_),.7);const t=f.center.clone();t.y=Math.min(t.y,1);
 const fr=frontOf(f);const dir=bestDir(t,dist,fr.clone().add(new THREE.Vector3(-.15,.95,.3)),f);
 const fw=dir.clone().negate();const right=new THREE.Vector3().crossVectors(fw,new THREE.Vector3(0,1,0)).normalize();const up=new THREE.Vector3().crossVectors(right,fw).normalize();
 const wpp=2*dist*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/app.clientHeight;t.addScaledVector(up,-app.clientHeight*.2*wpp);camTo(t,dist,dir);renderVist();}
export function renderVist(){const v=S.vist;if(!v)return;const n=v.route.length;const f=v.route[v.i];
 if(!f){vs.innerHTML=`<div class="hd"><div class="grab"></div><h3 style="margin:0;font:600 1.5rem var(--cond)">Vistoria concluída</h3><div class="vprog"><i style="width:100%"></i></div></div>
  <div class="bd"><div class="cnts" style="margin:12px 0;gap:18px;font-size:1.4rem"><span class="cnt" style="font-size:1.4rem">${IC.check}${v.ok.size} conferidos</span><span class="cnt" style="font-size:1.4rem">${IC.edit}${v.fix.size} corrigidos</span><span class="cnt w" style="font-size:1.4rem">${IC.alert}${allLoc().filter(x=>isAlert(x.e)).length} alertas</span></div></div>
  <div class="ft"><button class="pill pri" data-v="end">Fechar</button></div>`;return;}
 const its=[...walk()].filter(x=>x.m===f.d).sort((a,b)=>isAlert(b.e)-isAlert(a.e));const done=its.filter(x=>v.ok.has(x.e.id)||v.fix.has(x.e.id)).length;
 vs.innerHTML=`<div class="hd"><div class="grab"></div><div style="display:flex;align-items:baseline;gap:10px"><h3 style="margin:0;font:600 1.5rem var(--cond)">${f.d.nome}</h3><span style="color:var(--ink3);font-size:.82rem">móvel ${v.i+1} de ${n} · ${done}/${its.length}</span><button class="pill ghost sm" style="margin-left:auto" data-v="end">Sair</button></div>
  <div class="vprog"><i style="width:${(v.i+done/Math.max(1,its.length))/n*100}%"></i></div></div>
  <div class="bd">${its.map(x=>{const ok=v.ok.has(x.e.id),fx=v.fix.has(x.e.id);const al=alertsOf(x.e);const it=IT(x.e);const val=it.modo==='conjunto'?NIVEIS[x.e.nivel]:unitsOf(x.e);
   return `<div class="vrow ${ok||fx?'done':''}" data-vi="${x.e.id}">${clsH(it.cl)}<div><div style="font-weight:600">${it.nome} <b style="font:600 1.15rem var(--cond);margin-left:4px">${val}</b></div><div style="font-size:.76rem;color:var(--ink3)">${partName(x.m,x.p)}${x.o?' › '+orgName(x.o):''}${al.length?' · '+al.map(a=>a[1]).join(' · '):''}</div></div>
    <div style="display:flex;gap:6px"><button class="chipbtn ${ok?'ok':''}" data-v="ok">${ok?'✓ Confere':'Confere'}</button><button class="chipbtn" data-v="fix">Corrigir</button></div>${v.open===x.e.id?`<div style="grid-column:1/4">${itemH(x.e,null)}</div>`:''}</div>`;}).join('')}</div>
  ${its.length?'':'<div class="hint" style="padding:10px 2px">Nada cadastrado neste móvel. Abra as portas e gavetas: se estiver vazio mesmo, confirme abaixo.</div>'}</div>
  <div class="ft">${v.i>0?`<button class="pill sm ghost" data-v="prev">${IC.back}Anterior</button>`:''}<button class="pill sm ghost" data-v="skip" title="Não marca como conferido">Pular</button><span style="flex:1"></span><button class="pill pri" data-v="next">${!its.length?'Está vazio mesmo':done===its.length?'Conferido':'Tudo confere'} · ${v.i<n-1?'próximo':'concluir'} ${IC.next}</button></div>`;}
vs.addEventListener('click',ev=>{const v=S.vist;if(!v)return;const b=ev.target.closest('[data-v]');
 if(!b){const row=ev.target.closest('.irow');if(!row)return;const x=locE(row.dataset.item);const act=ev.target.closest('[data-act]');if(act){entryAct(x,act.dataset.act,act,row);v.fix.add(x.e.id);}const ia=ev.target.closest('[data-a]');if(ia&&ia.dataset.a!=='det')itemAction(x,ia.dataset.a,{});return;}
 const a=b.dataset.v;if(a==='end')return stopVist();if(a==='next'||a==='skip'||a==='prev'){const fv=v.route[v.i];setOpen(fv,null);
  /* só "Tudo confere" grava a conferência; os itens ainda sem resposta contam como conferidos */
  if(a==='next'){for(const x of [...walk()].filter(x=>x.m===fv.d))if(!v.fix.has(x.e.id))v.ok.add(x.e.id);conferido(fv);log(`Vistoria: ${fv.d.nome} conferido`);}
  v.i+=a==='prev'?-1:1;v.open=null;vistGo();return;}
 const id=b.closest('[data-vi]').dataset.vi;if(a==='ok'){v.ok.add(id);v.fix.delete(id);if(v.open===id)v.open=null;log(`Vistoria: ${IT(locE(id).e).nome} confere`);}
 if(a==='fix'){v.open=v.open===id?null:id;v.ok.delete(id);}renderVist();});

/* ================= modos, papéis, edição ================= */
export function setMode(m){S.mode=m;document.querySelectorAll('#modes button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));}
document.querySelectorAll('#modes button').forEach(b=>b.onclick=()=>{if(b.dataset.m==='vist'){if(S.vist)return;setMode('vist');startVist();}else stopVist();});
document.querySelectorAll('#styles .sw').forEach(s=>s.onclick=()=>{S.style=s.dataset.v;applyStyle();if(show)buildShow(0);});
export function setRole(r){S.role=r;document.querySelectorAll('#roles button').forEach(b=>b.classList.toggle('on',b.dataset.r===r));app.classList.toggle('r-vis',r==='vis');app.classList.toggle('r-admin',r==='admin');
 if(r!=='admin'&&S.edit)endEdit();if(r==='vis'){if(S.carry)cancelCarry();if(S.oc)closeOC();if(S.vist)stopVist();}refreshCards();home();}
document.querySelectorAll('#roles button').forEach(b=>b.onclick=()=>setRole(b.dataset.r));
$('#editBtn').onclick=()=>{closeStack(true);deselect();S.edit=true;applyStyle();home();toast('Clique num móvel e arraste. Os outros ficam em desenho técnico.',null,3500);};
export function endEdit(){S.edit=false;S.sel=null;applyStyle();home();}
$('#edDone').onclick=endEdit;
/* ===== arrastar móveis (edição do Admin e "Mover" dos móveis de rodinha) ===== */
const descendentes=f=>(f.filhos||[]).flatMap(x=>[x.f,...descendentes(x.f)]);
export function iniciaArrasto(f,hit,py){return {f,py,ox:hit.x-f.g.position.x,oz:hit.z-f.g.position.z,moved:false,bb0:f.bb.clone(),p0:f.g.position.clone(),r0:f.g.rotation.y,antes:tocando(f,f.bb),kids:descendentes(f).map(k=>({f:k,p0:k.g.position.clone(),r0:k.g.rotation.y})),host:f.host};}
/* posicionamento livre (sem grade): só não pode atravessar outro móvel, sair do lab nem ficar em cima de um desnível do piso */
function pegada(f,x,z,rot){const b=bbLocal(f),c=Math.cos(rot),s_=Math.sin(rot);const t=.06;/* margem: móvel encostado na parede ou na borda do degrau conta como dentro */const pts=[[b.min.x+t,b.min.z+t],[b.max.x-t,b.min.z+t],[b.min.x+t,b.max.z-t],[b.max.x-t,b.max.z-t]].map(([a,e])=>[x+a*c+e*s_,z-a*s_+e*c]);
 const bx=new THREE.Box3(new THREE.Vector3(Math.min(...pts.map(p=>p[0])),b.min.y,Math.min(...pts.map(p=>p[1]))),new THREE.Vector3(Math.max(...pts.map(p=>p[0])),b.max.y,Math.max(...pts.map(p=>p[1]))));return {pts,bx};}
function cabe(f,x,z,rot,d,cl){const {pts,bx}=pegada(f,x,z,rot);
 if(cl!=='topo'){const y0=fyW(x,z);for(const [px,pz] of pts){if(!inLab(f.d.lab,px,pz,0))return false;if(Math.abs(fyW(px,pz)-y0)>.02)return false;}}
 if(cl==='topo')return true;const b=bx.clone();b.min.y+=f.g.position.y;b.max.y+=f.g.position.y;b.expandByScalar(-.03);const ig=d.antes,kids=new Set(d.kids.map(k=>k.f));
 for(const g of F){if(g===f||!g.bb||g.d.lab!==f.d.lab||ig.has(g)||kids.has(g))continue;if(cl&&(ACEITA[g.d.tipo]||[]).includes(cl))continue;if(classeMovel(g.d)==='topo')continue;if(g.d.tipo==='lugar')continue;if(g.bb.intersectsBox(b))return false;}
 return true;}
export function arrasta(d,hit){const f=d.f,cl=classeMovel(f.d);let x=hit.x-d.ox,z=hit.z-d.oz,y=null,rot=f.g.rotation.y,host=null;
 if(cl){const e=encaixe(f,x,z);if(!e)return;x=e.x;z=e.z;rot=e.rot;host=e.host;if(cl==='topo')y=e.y;}
 if(!cabe(f,x,z,rot,d,cl))return;
 f.g.position.set(x,y!=null?y:fyW(x,z),z);f.g.rotation.y=rot;d.host=host;
 const dx=f.g.position.x-d.p0.x,dy=f.g.position.y-d.p0.y,dz=f.g.position.z-d.p0.z,dr=rot-d.r0;
 for(const k of d.kids){const v=k.p0.clone().sub(d.p0);v.applyAxisAngle(new THREE.Vector3(0,1,0),dr);k.f.g.position.set(d.p0.x+dx+v.x,k.p0.y+dy,d.p0.z+dz+v.z);k.f.g.rotation.y=(k.r0??(k.r0=k.f.g.rotation.y))+dr;}
 d.moved=true;wake(400);}
export function soltaArrasto(d){const f=d.f;f.d.pos=[f.g.position.x,f.g.position.y,f.g.position.z];f.d.rot=f.g.rotation.y;measure(f);
 for(const k of d.kids){k.f.d.pos=[k.f.g.position.x,k.f.g.position.y,k.f.g.position.z];k.f.d.rot=k.f.g.rotation.y;measure(k.f);}relaciona();
 const h=f.host;log(h?`${f.d.nome}: agora ${ondeTxt(h).toLowerCase()} ${h.f.d.nome}`:`${f.d.nome}: posição alterada`);
 if(S.mv)$('#mvTxt').innerHTML=mvTxt(f);refreshCards();}
const mvTxt=f=>`Movendo <b>${f.d.nome}</b>${f.host?` · ${ondeTxt(f.host).toLowerCase()} ${f.host.f.d.nome}`:''}`;
export function startMove(f){closeStack(true);focusLab(f.d.lab);S.mv=f;S.sel=f;app.dataset.mv='1';$('#mvTxt').innerHTML=mvTxt(f);home();
 toast(classeMovel(f.d)==='topo'?'Arraste o gaveteiro: ele fica em cima dos tampos e encaixa no centro.':'Arraste o gaveteiro: perto de uma bancada ele encaixa embaixo do lado curto.',null,3200);wake(800);}
export function endMove(){if(!S.mv)return;const f=S.mv;S.mv=null;S.sel=null;app.dataset.mv='0';home();openStack([{t:'m',f}]);}
$('#mvDone').onclick=endMove;
/* edição do Admin: leva o móvel (e o que está encaixado nele) para o outro laboratório, no lugar livre mais perto do centro de lá */
$('#labBtn').onclick=()=>{const f=S.sel;if(!f)return toast('Selecione um móvel primeiro',null,1800);const de=f.d.lab,para=de==='man'?'ele':'man',L=LABS.find(l=>l.id===para);
 const kids=descendentes(f).map(k=>({f:k,p0:k.g.position.clone(),r0:k.g.rotation.y}));const d={antes:new Set(),kids};const cl=classeMovel(f.d)==='topo'?null:classeMovel(f.d);
 f.d.lab=para;const cand=[];for(const [x0,x1,z0,z1] of PLANTA_R[para])for(let x=x0+.2;x<=x1-.2;x+=.25)for(let z=z0+.2;z<=z1-.2;z+=.25)cand.push([x+OFF.x,z+OFF.z]);
 cand.sort((a,b)=>Math.hypot(a[0]-L.c.x,a[1]-L.c.z)-Math.hypot(b[0]-L.c.x,b[1]-L.c.z));const ok=cand.find(([x,z])=>cabe(f,x,z,f.g.rotation.y,d,cl));f.d.lab=de;
 if(!ok)return toast(`Não achei espaço livre para <b>${f.d.nome}</b> no outro laboratório`,null,2600);
 const p0=f.g.position.clone(),p1=new THREE.Vector3(ok[0],fyW(ok[0],ok[1]),ok[1]);mudaLab(f,para);for(const k of kids)mudaLab(k.f,para);applyStyle();
 tween({ms:650,ease:'spring',update:p=>{f.g.position.lerpVectors(p0,p1,p);for(const k of kids)k.f.g.position.copy(k.p0).add(f.g.position).sub(p0);},
  done:()=>{f.d.pos=[p1.x,p1.y,p1.z];measure(f);for(const k of kids){k.f.d.pos=[k.f.g.position.x,k.f.g.position.y,k.f.g.position.z];measure(k.f);}relaciona();refreshBadges();log(`${f.d.nome}: levado para o ${L.nome}`);}});};
$('#mvRot').onclick=()=>{const f=S.mv;if(!f||classeMovel(f.d)==='topo'&&false)return;const r0=f.g.rotation.y;tween({ms:380,ease:'spring',update:p=>f.g.rotation.y=r0+p*Math.PI/2,done:()=>{f.d.rot=f.g.rotation.y;measure(f);relaciona();log(`${f.d.nome}: girado 90°`);}});};
addEventListener('keydown',ev=>{if(ev.key==='Escape'&&S.mv)endMove();});
/* móveis não se atravessam: vale a caixa de cada um; o que já se tocava antes de mexer (armário suspenso sobre bancada) continua podendo */
export function tocando(f,bb){const r=new Set();const b=bb.clone().expandByScalar(-.03);for(const g of F)if(g!==f&&g.bb&&g.d.lab===f.d.lab&&g.bb.intersectsBox(b))r.add(g);return r;}
export function colide(f,bb0,dx,dz,antes){const b=bb0.clone().translate(new THREE.Vector3(dx,0,dz));for(const g of tocando(f,b))if(!antes.has(g))return g;return null;}
$('#origBtn').onclick=()=>{const f=S.sel;if(!f)return toast('Selecione um móvel primeiro',null,1800);const d=f.d;if(!d.pos0)return;
 const p0=f.g.position.clone(),r0=f.g.rotation.y,p1=new THREE.Vector3(...d.pos0),r1=d.rot0||0;if(p0.distanceTo(p1)<.01&&Math.abs(r0-r1)<.01)return toast(`<b>${d.nome}</b> já está na posição original`,null,1800);
 tween({ms:520,ease:'spring',update:p=>{f.g.position.lerpVectors(p0,p1,p);f.g.rotation.y=r0+(r1-r0)*p;},done:()=>{d.pos=[...d.pos0];d.rot=r1;measure(f);relaciona();log(`${d.nome}: voltou à posição original`);}});};
$('#rotBtn').onclick=()=>{const f=S.sel;if(!f)return toast('Selecione um móvel primeiro',null,1800);const r0=f.g.rotation.y;const antes=tocando(f,f.bb);
 f.g.rotation.y=r0+Math.PI/2;f.g.updateMatrixWorld(true);const bb=new THREE.Box3();f.g.traverse(o=>{if(o.isMesh&&o.userData.base)bb.expandByObject(o);});f.g.rotation.y=r0;f.g.updateMatrixWorld(true);
 const g=[...tocando(f,bb)].find(x=>!antes.has(x));if(g)return toast(`Girando, <b>${f.d.nome}</b> bateria em <b>${g.d.nome}</b>. Afaste antes.`,null,2400);
 tween({ms:420,ease:'spring',update:p=>f.g.rotation.y=r0+p*Math.PI/2,done:()=>{f.d.rot=f.g.rotation.y;measure(f);log(`${f.d.nome}: girado 90°`);}});};
export function home(){$('#home').classList.toggle('hide',!!(S.stack.length||S.carry||S.vist||S.edit||S.mv||S.oc||S.loc));}
$('#gBtn').onclick=ev=>openPalette('guardar',{},ev.currentTarget);
$('#searchBtn').onclick=ev=>openPalette('buscar',{},ev.currentTarget);
addEventListener('keydown',ev=>{if(ev.target.matches('input,textarea')&&ev.key!=='Escape')return;
 if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='k'){ev.preventDefault();S.pal?closePalette():openPalette('buscar');return;}
 if(S.oc&&(ev.key==='ArrowLeft'||ev.key==='ArrowRight')){ocEl.querySelector(`[data-o="${ev.key==='ArrowLeft'?'prev':'next'}"]`).click();return;}
 if(ev.key==='Escape'){if(pop.classList.contains('on'))return closePop();if(modalEl.classList.contains('on'))return closeModal();if(S.pal)return closePalette();if(S.oc)return closeOC();
  if(S.carry)return S.carry.stage==='confirm'?carryBack():cancelCarry();if(S.edit)return endEdit();if(S.stack.length>1)return popTo(S.stack.length-2);if(S.stack.length)return closeStack();if(S.sel)return deselect();if(S.lab)return focusLab(null);}});
q.addEventListener('keydown',ev=>ev.stopPropagation());


/* ================= destaque de parte (card ↔ 3D) ================= */
export function setHoverPart(h,src){const prev=S.hoverPart;if(prev&&h&&prev.f===h.f&&prev.pid===h.pid)return;S.hoverPart=h;wake(900);
 document.querySelectorAll('.sub.hov').forEach(s=>s.classList.remove('hov'));
 if(h&&src!=='card'){const top=S.stack[S.stack.length-1];if(top&&top.t==='m'&&top.f===h.f){const s=top.el.querySelector(`.sub[data-part="${h.pid}"]`);s&&s.classList.add('hov');}}
 if(h&&src==='card'){const s=document.querySelector(`.scard:last-child .sub[data-part="${h.pid}"]`);s&&s.classList.add('hov');}}

/* ================= ponteiro ================= */
export const ndc=new THREE.Vector2();export let down=null,needPick=false,ptr={in:false,x:0,y:0},drag=null,udrag=null;
export const cvs=renderer.domElement;export const tip=$('#tip');
export const setNdc=ev=>{const r=cvs.getBoundingClientRect();ptr={in:true,x:ev.clientX-r.left,y:ev.clientY-r.top};ndc.set(ptr.x/r.width*2-1,-(ptr.y/r.height)*2+1);};
export const activeLab=o=>!S.lab||o.userData.lab===S.lab||(o.userData.f&&o.userData.f.d.lab===S.lab);
export function pickF(){if(!S.lab&&!S.carry&&!S.vist&&!S.edit)return null;ray.setFromCamera(ndc,camera);for(const h of ray.intersectObjects(pick,false)){if(activeLab(h.object)){if(atrasDeParede(h.distance))return null;return h.object.userData.f;}}return null;}
export function pickPart(){ray.setFromCamera(ndc,camera);const hs=ray.intersectObjects(halos,false).filter(h=>{const d=h.object.userData.halo;return !S.lab||d.f.d.lab===S.lab;});if(hs[0]&&atrasDeParede(hs[0].distance))return null;return hs[0]?hs[0].object.userData.halo:null;}
export function pickLab(){ray.setFromCamera(ndc,camera);const fl=[];for(const L of LABS)labG[L.id].traverse(o=>{if(o.userData.labFloor)fl.push(o);});const h=ray.intersectObjects(fl,false)[0];return h?h.object.userData.labFloor:null;}
export function pickOrg(f,pid){ray.setFromCamera(ndc,camera);const ms=[];f.parts[pid].content.traverse(o=>{if(o.isMesh&&o.userData.org)ms.push(o);});const h=ray.intersectObjects(ms,false)[0];return h?f.d.partes.find(p=>p.id===pid).orgs.find(o=>o.id===h.object.userData.org):null;}
cvs.addEventListener('pointermove',ev=>{setNdc(ev);needPick=true;
 if(drag){ray.setFromCamera(ndc,camera);const hit=new THREE.Vector3();if(ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-drag.py),hit))arrasta(drag,hit);}});
cvs.addEventListener('pointerleave',()=>{ptr.in=false;setHover(null);tip.classList.remove('on');});
cvs.addEventListener('pointerdown',ev=>{down={x:ev.clientX,y:ev.clientY};setNdc(ev);
 if(S.mv){const f=S.mv,py=f.g.position.y;ray.setFromCamera(ndc,camera);const hit=new THREE.Vector3();if(ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-py),hit)&&Math.hypot(hit.x-f.center.x,hit.z-f.center.z)<.75){drag=iniciaArrasto(f,hit,py);controls.enabled=false;cvs.setPointerCapture(ev.pointerId);}return;}
 if(S.edit){const f=pickF();if(f){S.sel=f;applyStyle();ray.setFromCamera(ndc,camera);const py=f.g.position.y;const hit=new THREE.Vector3();ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-py),hit);
  drag=iniciaArrasto(f,hit,py);controls.enabled=false;cvs.setPointerCapture(ev.pointerId);}}});
cvs.addEventListener('pointerup',ev=>{if(drag){const d=drag;drag=null;controls.enabled=true;if(d.moved)soltaArrasto(d);down=null;return;}if(S.mv){down=null;return;}
 if(!down)return;const mv=Math.hypot(ev.clientX-down.x,ev.clientY-down.y);down=null;if(mv>6||ev.button!==0)return;setNdc(ev);click();});
cvs.addEventListener('dblclick',()=>{if(S.carry||S.edit||S.vist||S.oc)return;const f=pickF();if(f)openStack([{t:'m',f}]);});
export function setHover(f){if(S.hover===f)return;const p=S.hover;S.hover=f;if(p)tween({ms:130,key:p.d.id+'h',update:t=>p.v.hover=1-t});if(f)tween({ms:130,key:f.d.id+'h',update:t=>f.v.hover=t});}
export function hoverTick(){if(S.carry){if(S.carry.stage==='part'){const h=pickPart();const ok=h&&validTarget(h.f,h.pid);const nh=ok?h:null;
   if((nh&&(!S.carry.hover||S.carry.hover.f!==nh.f||S.carry.hover.pid!==nh.pid))||(!nh&&S.carry.hover)){S.carry.hover=nh;setHoverPart(nh);showGuide();placeGhost();}
   cvs.style.cursor=h?(ok?'copy':'not-allowed'):'';tipShow(h&&!ok?'Parte cheia':null);}
  else{const t=S.carry.target;const isItem=!(S.carry.kind==='org'||S.carry.kind==='neworg');const o=isItem?pickOrg(t.f,t.p.id):null;S.carry.hoverOrg=o;cvs.style.cursor=o?'copy':'';}return;}
 if(S.oc||S.loc){cvs.style.cursor='';return;}
 const top=S.stack[S.stack.length-1];
 if(top&&top.t==='m'){const h=pickPart();if(h&&h.f===top.f){setHoverPart(h,'3d');cvs.style.cursor='pointer';setHover(null);tipShow(partName(h.f.d,h.f.d.partes.find(p=>p.id===h.pid)));return;}else if(S.hoverPart)setHoverPart(null);}
 const f=pickF();setHover(f);if(f){cvs.style.cursor=S.edit?'grab':'pointer';tipShow(S.sel===f&&!S.stack.length?null:f.d.nome);return;}
 const L=!S.edit&&!S.stack.length&&pickLab();S.labHover=!S.lab?L:null;cvs.style.cursor=L&&L!==S.lab?'pointer':'';tipShow(L&&L!==S.lab&&S.lab?byLab(L).nome:null);}
export function tipShow(t){if(t){tip.textContent=t;tip.classList.add('on');}else tip.classList.remove('on');}
export function click(){if(S.edit||S.oc||S.loc)return;
 if(S.carry){const c=S.carry;if(c.stage==='part'){if(c.hover)chooseTarget(c.hover.f,c.hover.pid);return;}
  const o=c.hoverOrg;c.target.org=o||null;placeGhost();showGuide();return;}
 if(S.vist){const f=pickF();if(f){const i=S.vist.route.indexOf(f);if(i>=0){setOpen(S.vist.route[S.vist.i],null);S.vist.i=i;S.vist.open=null;vistGo();}}return;}
 const top=S.stack[S.stack.length-1];if(top&&top.t==='m'){const h=pickPart();if(h&&h.f===top.f){const p=h.f.d.partes.find(x=>x.id===h.pid);setHoverPart(null);pushCard({t:'p',f:h.f,p});return;}}
 const f=pickF();
 if(!f){if(S.stack.length)return closeStack();if(S.sel)return deselect();const L=pickLab();if(L&&L!==S.lab)return focusLab(L);if(!L&&S.lab)return focusLab(null);return;}
 if(S.stack.length){if(f!==S.stack[0].f){setOpen(S.stack[0].f,null);openStack([{t:'m',f}]);}return;}
 if(S.sel===f)openStack([{t:'m',f}]);else select(f);}
/* arrastar uma unidade para outro lugar */
stackEl.addEventListener('pointerdown',ev=>{const uc=ev.target.closest('.uc[data-u]');if(!uc||!can())return;udrag={uc,x:ev.clientX,y:ev.clientY};});
addEventListener('pointermove',ev=>{if(!udrag)return;if(Math.hypot(ev.clientX-udrag.x,ev.clientY-udrag.y)>10){const row=udrag.uc.closest('.irow');const x=locE(row.dataset.item);const u=x.e.units.find(k=>k.n===+udrag.uc.dataset.u);udrag=null;closePop();startCarry({kind:'unit',x,u});toast(`Unidade ${u.n} de <b>${IT(x.e).nome}</b>: escolha o novo lugar no 3D`,null,2600);}});
addEventListener('pointerup',()=>{udrag=null;});

/* ================= sobreposições ================= */
export const v3=new THREE.Vector3();
export function project(p){v3.copy(p).project(camera);return [(v3.x+1)/2*app.clientWidth,(1-v3.y)/2*app.clientHeight];}
export function refreshBadges(){save();for(const f of F){const n=stats(f.d).al;f.badge.innerHTML=`${IC.alert}${n}`;f.badge.dataset.n=n;}}
export function placeOverlays(){for(const f of F){const n=+f.badge.dataset.n;const show_=n&&!S.edit&&!S.oc&&!S.loc&&S.lab===f.d.lab&&f.cut<.5&&(!S.stack.length||S.stack[0].f===f)&&!(S.sel===f&&acard.classList.contains('on'));
  let vis=show_,x=0,y=0;if(show_){[x,y]=project(f.anchor);const W=app.clientWidth,H=app.clientHeight;if(y<74||y>H-8||x<8||x>W-8)vis=false;if(S.stack.length&&(mob()?y>H-(S.sheetH||H*.56)-6:x>W-450))vis=false;}
  f.badge.style.opacity=vis?1:0;if(vis){f.badge.style.left=x+'px';f.badge.style.top=y+'px';}}
 if(S.sel&&acard.classList.contains('on')&&!mob()){const [x,y]=project(S.sel.anchor);let l=x+26,t=y-30;if(l+350>app.clientWidth-12)l=x-26-340;t=Math.max(70,Math.min(t,app.clientHeight-acard.offsetHeight-20));acard.style.left=l+'px';acard.style.top=t+'px';}
 if(tip.classList.contains('on')){tip.style.left=ptr.x+'px';tip.style.top=ptr.y+'px';tip.style.transform=(ptr.x>app.clientWidth-(S.stack.length&&!mob()?640:200))?'translate(calc(-100% - 14px),-130%)':'';}}
refreshBadges();

/* ================= navegação entre laboratórios ================= */
export const LT=LABS.map(L=>{const el=document.createElement('button');el.className='labtag';app.appendChild(el);el.onclick=()=>focusLab(L.id);el.onmouseenter=()=>S.labHover=L.id;el.onmouseleave=()=>S.labHover=null;return {L,el};});
export function labTags(){const on=viewMode()==='over'&&!S.edit;for(const {L,el} of LT){if(!on){el.classList.remove('vis');continue;}
  const fs=F.filter(f=>f.d.lab===L.id);let u=0,al=0;for(const f of fs){const st=stats(f.d);u+=st.u;al+=st.al;}
  const h=`<b>${L.nome.replace('Laboratório de ','')}</b><span class="cnts"><span class="cnt" title="unidades guardadas">${IC.stack}${u} <small>${u===1?'unidade':'unidades'}</small></span><span class="cnt" title="móveis">${IC.open}${fs.length} <small>móveis</small></span>${al?`<span class="cnt w" title="alertas">${IC.alert}${al}</span>`:''}</span><i>Entrar${IC.next}</i>`;if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h;}
  let [x,y]=project(L.c.clone().add(new THREE.Vector3(0,3.1,0)));x=Math.max(130,Math.min(app.clientWidth-130,x));y=Math.max(mob()?150:120,y);el.style.left=x+'px';el.style.top=y+'px';el.classList.add('vis');el.classList.toggle('on',S.labHover===L.id);}
 if(on){const vs=LT.filter(t=>t.el.classList.contains('vis')).map(t=>({el:t.el,r:t.el.getBoundingClientRect()})).sort((a,b)=>a.r.top-b.r.top);
  for(let i=1;i<vs.length;i++){const a=vs[i-1].r,b=vs[i].r;if(a.left<b.right+6&&b.left<a.right+6&&a.top<b.bottom+6&&b.top<a.bottom+6){const dy=a.bottom-b.top+8;vs[i].el.style.top=(parseFloat(vs[i].el.style.top)+dy)+'px';}}}}
/* ================= laço ================= */
export let last=performance.now(),pickT=0;export const blue=new THREE.Color(0x2f8cff);
export function focusedKey(){const top=S.stack[S.stack.length-1];if(top&&(top.t==='p'||top.t==='o'||top.t==='i'||top.t==='ed'))return top.f.d.id+'/'+top.p?.id;if(S.carry&&S.carry.stage==='confirm')return S.carry.target.f.d.id+'/'+S.carry.target.p.id;return null;}
let ultVM='',ultTw=0;
/* celular (sem pós-processamento): o outro lab vira segundo plano de verdade. Desenha ele primeiro (já desbotado),
   limpa a profundidade e desenha o lab escolhido por cima: nenhum móvel de lá fica na frente dos daqui. Custo ~igual a um passe só. */
function renderDuplo(){const other=WL.lab==='man'?'ele':'man';const keep=new Set([labG[other],...F.filter(f=>f.d.lab===other).map(f=>f.g)]);
 const hid=[];for(const c of scene.children){if(c.isLight||keep.has(c)||!c.visible)continue;c.visible=false;hid.push(c);}
 const au=renderer.shadowMap.autoUpdate;renderer.shadowMap.autoUpdate=false;renderer.render(scene,camera);renderer.shadowMap.autoUpdate=au;hid.forEach(c=>c.visible=true);
 const hid2=[];for(const c of keep)if(c.visible){c.visible=false;hid2.push(c);}
 const ac=renderer.autoClear,bg=scene.background;renderer.autoClear=false;scene.background=null;renderer.clearDepth();renderer.render(scene,camera);
 renderer.autoClear=ac;scene.background=bg;hid2.forEach(c=>c.visible=true);}
export function loop(now){const dt=Math.min(100,now-last);last=now;runTweens(now);
 if(FADE===1){/* celular: o outro lab desbota e volta aos poucos (~0,4 s) */const alvo=S.lab&&!S.edit?1:0;if(S.lab&&S.lab!==WL.lab){if(WL.lab&&WL.k>.01){WL.k=0;}WL.lab=S.lab;}
  if(Math.abs(alvo-WL.k)>.002){WL.k+=(alvo-WL.k)*Math.min(1,dt*.009);if(Math.abs(alvo-WL.k)<.02)WL.k=alvo;applyStyle();wake(200);}}
 {const vm=viewMode();if(vm!==ultVM){ultVM=vm;wake(1500);occAgora();}if(ultTw&&!tweens.size){wake(900);occAgora();}ultTw=tweens.size;}/* câmera acabou de parar: mais alguns quadros para as paredes decidirem *//* mudou a visão (geral/lab/zoom): paredes precisam de alguns quadros para cair ou subir */
 if(parado(now)&&!tweens.size){requestAnimationFrame(loop);return;}
 if(needPick&&ptr.in&&!down&&!drag&&now-pickT>40){needPick=false;pickT=now;hoverTick();}
 controls.enableRotate=!S.oc;controls.enablePan=viewMode()==='lab';
 {const want=(S.stack.length||S.oc)?(mob()?[0,S.stack.length?(S.sheetH||app.clientHeight*.56)/2:app.clientHeight*.24]:[220,0]):[0,0];S.vo=S.vo||[0,0];const kk=Math.min(1,dt*.008);S.vo[0]+=(want[0]-S.vo[0])*kk;S.vo[1]+=(want[1]-S.vo[1])*kk;
  const W=app.clientWidth,Hh=app.clientHeight;if(Math.abs(S.vo[0])>.5||Math.abs(S.vo[1])>.5)camera.setViewOffset(W,Hh,S.vo[0],S.vo[1],W,Hh);else if(camera.view&&camera.view.enabled)camera.clearViewOffset();}
 const camMoveu=controls.update();if(camMoveu||tweens.size||S.carry||S.oc||S.loc||Math.abs(S.vo[1]-(want_y()))>1)wake(900);
 roomTick(dt);updateCut();
 const pulse=.5+.5*Math.sin(now*.005);const fk=focusedKey();const hp=S.hoverPart||(S.carry&&S.carry.hover);
 for(const f of F){f.cut+=((f.cutT||0)-f.cut)*Math.min(1,dt*.012);f.g.scale.y=Math.max(.04,1-.96*f.cut);
  for(const [pid,pt] of Object.entries(f.parts)){const on=hp&&hp.f===f&&hp.pid===pid?1:(S.carry&&S.carry.stage==='confirm'&&S.carry.target.f===f&&S.carry.target.p.id===pid?.6:0);
   pt.hl+=(on-pt.hl)*Math.min(1,dt*.015);pt.mark.visible=pt.hl>.02;pt.mark.material.opacity=.26*pt.hl;pt.mark.userData.line.material.opacity=pt.hl;if(pt.obj)pt.obj.position.z=Math.max(pt.open*.36,pt.hl*.1);if(pt.slide)pt.slide.o.position.x=pt.slide.dx*Math.max(pt.open,pt.hl*.92);}
  if(f.doors){const dp=pid=>pid&&(f.d.doorParts?f.d.doorParts.includes(pid):/^P/.test(pid));const c=S.carry;
   const quer=(S.stack[0]&&S.stack[0].f===f)||(S.vist&&S.vist.route[S.vist.i]===f)||(S.loc&&S.loc.f===f&&dp(S.loc.pid))||(c&&c.stage==='confirm'&&c.target.f===f&&dp(c.target.p.id))||(hp&&hp.f===f&&dp(hp.pid))?1:0;
   f.doors.open+=(quer-f.doors.open)*Math.min(1,dt*.008);f.doors.l.rotation.y=-f.doors.open*1.9;f.doors.r.rotation.y=f.doors.open*1.9;}
  const alOn=S.vist||(S.stack[0]&&S.stack[0].f===f);
  for(const m of f.meshes){const mt=m.material;if(!mt.emissive||Object.values(f.parts).some(pt=>pt.board===m))continue;mt.emissive.setRGB(0,0,0);if(f.v.hover&&!post)mt.emissive.setRGB(.05*f.v.hover,.1*f.v.hover,.16*f.v.hover);if(m.userData.alert&&alOn)mt.emissive.setRGB(.55*pulse,.36*pulse,0);}
  for(const s of f.sprites){if(s.parent.userData.num===s)s.visible=fk===f.d.id+'/'+s.userData.part;}
  f.ringO+=((S.carry&&S.carry.stage==='part'&&(!S.lab||f.d.lab===S.lab)&&f.d.partes.some(p=>!p.cheia)?(S.carry.hover&&S.carry.hover.f===f?1:.4):0)-f.ringO)*.2;f.ring.material.opacity=f.ringO;f.ring.visible=f.ringO>.01;f.ring.rotation.y=now*.0003;}
 if(S.carry&&S.carry.ghost&&S.carry.ghost.visible){const g=S.carry.ghost;const t=ghostTarget();if(t)g.position.lerp(t.add(new THREE.Vector3(0,.03*Math.sin(now*.004),0)),Math.min(1,dt*.012));}
 for(const id in LABGLOW){const g=LABGLOW[id];const t=(viewMode()==='over'&&!S.edit&&S.labHover===id)?1:0;g.a+=(t-g.a)*Math.min(1,dt*.012);g.frame.visible=g.fill.visible=g.a>.01;g.frame.material.opacity=.95*g.a;g.fill.material.opacity=.07*g.a;}
 updateShow(now);
 const gh=ghostPre(dt);
 if(post){const sel=[];const top=S.stack[S.stack.length-1];
  const peca=pp=>pp.obj||(pp.slide&&pp.slide.o)||pp.board||pp.halo;
  if(hp)sel.push(peca(hp.f.parts[hp.pid]));
  else if(S.carry&&S.carry.stage==='confirm'){const t=S.carry.target;const og=(S.carry.hoverOrg||t.org)&&t.f.parts[t.p.id].orgG.find(g=>g.userData.org===(S.carry.hoverOrg||t.org).id);sel.push(og||peca(t.f.parts[t.p.id]));}
  else if(top&&top.t==='o'){const g=top.f.parts[top.p.id].orgG?.find(x=>x.userData.org===top.o.id);g&&sel.push(g);}
  else if(S.sel&&!S.stack.length&&!S.carry)sel.push(S.sel.g);
  else if(S.hover&&!S.stack.length&&!S.carry&&!S.edit)sel.push(S.hover.g);
  post.outline.selectedObjects=sel;
  const focused=S.stack.length>0||!!S.vist||!!S.oc||(S.carry&&S.carry.stage==='confirm');S.focusAmt+=((focused?1:0)-S.focusAmt)*.08;
  post.bokeh.enabled=S.focusAmt>.02&&!S.edit;post.bokeh.uniforms.focus.value=S.oc?1.5:focoProf();post.bokeh.uniforms.aperture.value=(S.oc?.012:.004)*S.focusAmt;post.bokeh.uniforms.maxblur.value=.009;post.c.render();}
 else if(FADE===1&&WL.lab&&WL.k>.01&&!S.edit)renderDuplo();
 else renderer.render(scene,camera);
 ghostPost(gh);
 placeOverlays();labTags();requestAnimationFrame(loop);}
/* foco do desfoque: profundidade (no espaço da câmera) do móvel ou da parte em foco, qualquer que seja a distância, o giro ou o zoom */
const fv=new THREE.Vector3();
export function focoProf(){const top=S.stack[S.stack.length-1];let f=null,pid=null;
 if(top){f=top.f;pid=top.t==='p'||top.t==='o'?top.p.id:null;}else if(S.vist)f=S.vist.route[S.vist.i];else if(S.carry&&S.carry.target){f=S.carry.target.f;pid=S.carry.target.p.id;}
 if(!f)return camera.position.distanceTo(controls.target);
 if(pid&&f.parts[pid])fv.copy(partW(f,pid));else fv.copy(f.center);
 fv.applyMatrix4(camera.matrixWorldInverse);return Math.max(.5,-fv.z);}
export function want_y(){return (S.stack.length||S.oc)&&mob()?(S.stack.length?(S.sheetH||app.clientHeight*.56)/2:app.clientHeight*.24):0;}
/* parado: só conta o tempo e espera; o alerta pulsante do móvel aberto continua no modo completo */
/* transições em curso (desfoque do outro lab, desbotado do celular) não deixam a cena dormir, por mais lento que seja o quadro */
/* card aberto: só segue desenhando se o móvel em foco tem alerta pulsando; o resto (hover, portas, foco) acorda a cena quando muda */
const pulsa=()=>{const f=S.stack[0]&&S.stack[0].f;return !!f&&f.meshes.some(m=>m.userData.alert);};
export function parado(now){return now>RENDER.ate&&!(S.stack.length&&!LITE&&pulsa())&&!S.vist&&!GH.anda&&!(FADE===1&&Math.abs((S.lab&&!S.edit?1:0)-WL.k)>.002);}
wake(4000);requestAnimationFrame(loop);

setRole('mem');
/* prévias (artefato): VITE_LAB=ele abre direto num lab */
if(import.meta.env&&import.meta.env.VITE_LAB)setTimeout(()=>focusLab(import.meta.env.VITE_LAB),900);
if(location.hash.includes('dbg')){window.__S=S;window.__post=()=>post;window.__scene=scene;window.__cam=camera;window.__ray=ray;window.__F=F;window.__OCC=OCC;window.__dbg={RENDER,wake,inLab,fyW,encaixe,cabe,bbLocal,iniciaArrasto,arrasta,soltaArrasto,startMove,endMove,camTo,openStack,byId,pushCard,startCarry,locE,openPalette,localizar,startVist,select,applyStyle,openOrgCreator,openItemCreator,chooseTarget,commitCarry,focusLab,setHoverPart,walk,openCompras,setRole};}


/* o foco num campo perto da borda não pode rolar a tela inteira */
app.addEventListener('scroll',()=>{app.scrollTop=0;app.scrollLeft=0;});

import { CFG, LIVE } from '../config.js';
import { TABS, INC, OFFCOL, OFFVAL, applyOp, dataTxt, dataMs } from '../data/schema.js';
import { MOVEL_ID } from '../data/mapa.js';
import { $, F, S, app, wake } from './state.js';
import { IC, P } from './icons.js';
import { BUY, CL, COMPRADOS, ESTADOS, ETQ, HOOK, ITEMS, LOG, M, NIVEIS, OT, PESSOAS, RECADO, SEM, SPECK, SUG, TIPOEMP, allLoc, etqOf, log, norm, save, uid } from './data.js';
import { toast } from './html.js';
import { setRecado } from './room.js';
import { buildContents, measure } from './furniture.js';
import { closeModal, modal, refreshBadges, refreshCards, setRole } from './ui.js';
import { admClick, admListH } from './mobile.js';
import { mob } from './state.js';

/* ================= planilha: banco local, fila de envio e login =================
   O app nunca espera a planilha para responder. Cada ação muda o estado na hora; o que mudou vira uma lista de
   operações (por diferença), que vai para uma fila guardada neste aparelho e é enviada em lote. A planilha devolve
   o que os outros mudaram desde a última conversa, e o app aplica por cima.
   Base = o que a planilha confirmou · fila = o que este aparelho mudou e ainda não foi confirmado · tela = base + fila. */

export const CHAVE = 'aerorio-inventario-v1';
export const MODO = { unidades: 'Unidades', contavel: 'Contável', conjunto: 'Conjunto' };
export const MODO_IN = { unidades: 'unidades', 'contável': 'contavel', contavel: 'contavel', conjunto: 'conjunto' };
export const PAPEL = { Admin: 'admin', Membro: 'mem', Visitante: 'vis' };
export const ABAS_APP = ['MOVEIS', 'PARTES', 'ORGANIZADORES', 'ITENS', 'ESTOQUE', 'UNIDADES', 'COMPRAS', 'ETIQUETAS', 'CONFIG'];
export const r3 = v => Math.round((+v || 0) * 1000) / 1000;
export const grau = r => ((Math.round(r * 180 / Math.PI / 90) * 90) % 360 + 360) % 360;
export const txt = v => (v == null ? '' : String(v));

export let ST = { rev: 0, base: null, fila: [], sessao: '', eu: null, hist: [], meus: [] };
export let sombra = null, ocupado = false, falhas = 0, tFila = 0, tSalva = 0, adiado = false, estado = 'ok', ultimoErro = '';

/* ---------------- guardar neste aparelho ---------------- */
export function carrega() { try { const d = JSON.parse(localStorage.getItem(CHAVE) || 'null'); if (d && d.v === 1) ST = Object.assign(ST, d); } catch (e) { } }
export function grava() { try { localStorage.setItem(CHAVE, JSON.stringify({ v: 1, ...ST })); } catch (e) { console.warn('inventário: não consegui guardar neste aparelho', e); } }
/* a fila é gravada na hora (é o que não pode se perder); o resto pode esperar um instante */
export function persiste(ja) { clearTimeout(tSalva); if (ja) grava(); else tSalva = setTimeout(grava, 250); }

/* ---------------- conversa com a planilha ---------------- */
export async function api(corpo, ms = 30000) {
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(CFG.script, { method: 'POST', body: JSON.stringify(corpo), redirect: 'follow', signal: ac.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

/* ---------------- app → linhas da planilha ---------------- */
export const etqTxt = id => { const e = id && etqOf(id); return e ? e.t : ''; };
export const specTxt = s => Object.entries(s || {}).filter(([k, v]) => k && v).map(([k, v]) => `${k}: ${v}`).join('; ');
export const identTxt = i => i && i.ops && i.ops.length ? `${i.nome}: ${i.ops.map(o => o.c ? `${o.n}=${o.c}` : o.n).join(', ')}` : '';
export const tiposTxt = t => (t || []).map(x => x.n + (x.aus ? ' (falta)' : '')).join('; ');
export const sidM = m => m.sid || MOVEL_ID[m.id] || m.id;
export const sidP = (m, p) => `${sidM(m)}.${p.id}`;

export function achata() {
  const db = {}; ABAS_APP.forEach(t => db[t] = {});
  for (const m of M) {
    db.MOVEIS[sidM(m)] = { x: r3(m.pos[0]), y: r3(m.pos[1]), z: r3(m.pos[2]), rotacao: grau(m.rot || 0), etiqueta: etqTxt(m.etq) };
    for (const p of m.partes) {
      db.PARTES[sidP(m, p)] = { nome: p.etqNome ? '' : txt(p.nomeP), etiqueta: etqTxt(p.etq), cheia: p.cheia ? 'Sim' : '', conferido_em: p.conf ? dataTxt(p.conf.em) : '', conferido_por: p.conf ? txt(p.conf.por) : '' };
      for (const o of p.orgs) db.ORGANIZADORES[o.id] = org(o, sidP(m, p));
    }
  }
  for (const o of (SEM.orgs || [])) db.ORGANIZADORES[o.id] = org(o, '');
  for (const [id, it] of Object.entries(ITEMS)) {
    db.ITENS[id] = { nome: txt(it.nome), classe: CL[it.cl] ? CL[it.cl].n : 'Diversos', modo: MODO[it.modo] || 'Contável', unidade: txt(it.un), minimo: +it.min || 0, descricao: txt(it.desc), especificacao: specTxt(it.spec), identificador: identTxt(it.ident), modelo_3d: txt(it.model), observacoes: txt(it.obs), estado: 'Ativo', criado_em: txt(it.criado) };
  }
  for (const x of allLoc()) {
    const e = x.e, it = ITEMS[e.ref]; if (!it) continue;
    const local = x.o ? x.o.id : x.p ? sidP(x.m, x.p) : '';
    db.ESTOQUE[e.id] = { item: e.ref, local, quantidade: it.modo === 'contavel' ? (+e.qtd || 0) : '', nivel: it.modo === 'conjunto' ? (NIVEIS[e.nivel] || '') : '', tipos: it.modo === 'conjunto' ? tiposTxt(e.tipos) : '', aberto_em: e.aberto ? dataTxt(e.aberto) : '', nao_encontrado: e.nf ? 'Sim' : '', guardado_em: dataTxt(e.t), estado: 'Ativo' };
    if (it.modo === 'unidades') for (const u of (e.units || [])) {
      if (!u.id) u.id = 'U' + uid();
      db.UNIDADES[u.id] = { item: e.ref, estoque: e.id, numero: +u.n || 0, identificador: txt(u.v), estado: (ESTADOS[u.estado] || ESTADOS.boa)[0], com_quem: u.emp ? txt(u.emp.para) : '', tipo_emprestimo: u.emp ? (TIPOEMP[u.emp.tipo] || '') : '', desde: u.emp ? dataTxt(u.emp.desde) : '', prazo: u.emp && u.emp.prazo ? dataTxt(u.emp.prazo) : '', situacao: 'Ativa' };
    }
  }
  for (const b of BUY) {
    if (!b.id) { b.id = 'C' + uid(); b.em = b.em || Date.now(); b.por = b.por || S.me || ''; }
    db.COMPRAS[b.id] = { item: b.x.e.ref, estoque: b.x.e.id, quantidade: +b.q || 1, motivo: txt(b.why), status: 'Na lista', pedido_em: dataTxt(b.em), pedido_por: txt(b.por), comprado_em: '' };
  }
  for (const b of COMPRADOS) if (b.id) db.COMPRAS[b.id] = { item: b.x.e.ref, estoque: b.x.e.id, quantidade: +b.q || 1, motivo: txt(b.why), status: 'Comprado', pedido_em: dataTxt(b.em), pedido_por: txt(b.por), comprado_em: dataTxt(Date.now()) };
  for (const e of ETQ) db.ETIQUETAS[e.id] = { texto: txt(e.t), estado: 'Ativa' };
  db.CONFIG.recado = { valor: RECADO.linhas.join(' | ') };
  return db;
}
export const org = (o, local) => ({ nome: txt(o.nome), tipo: OT[o.tipo] ? OT[o.tipo].n : txt(o.tipo), cor: txt(o.cor), tamanho: txt(o.tam), etiqueta: etqTxt(o.etq), local, estado: 'Ativo' });

/* diferença entre o que a tela mostrava e o que mostra agora → operações */
export function diferenca(a, b) {
  const ops = [];
  for (const t of ABAS_APP) {
    const A = a[t] || {}, B = b[t] || {}, soma = INC[t] || [];
    for (const id in B) {
      const nv = B[id], ve = A[id];
      if (!ve) { ops.push({ t, id, f: { ...nv } }); continue; }
      const f = {}, i = {};
      for (const k in nv) {
        if (txt(nv[k]) === txt(ve[k])) continue;
        if (soma.includes(k) && typeof nv[k] === 'number' && typeof ve[k] === 'number') i[k] = Math.round((nv[k] - ve[k]) * 1000) / 1000;
        else f[k] = nv[k];
      }
      if (Object.keys(f).length || Object.keys(i).length) ops.push({ t, id, ...(Object.keys(f).length ? { f } : {}), ...(Object.keys(i).length ? { i } : {}) });
    }
    if (OFFCOL[t]) for (const id in A) if (!B[id]) ops.push({ t, id, f: { [OFFCOL[t]]: OFFVAL[t] } });
  }
  return ops;
}

/* ---------------- linhas da planilha → app (reaproveitando os objetos que a tela já usa) ---------------- */
export const ativo = (t, r) => !OFFCOL[t] || !(['Removido', 'Removida', 'Baixada', 'Inativa', 'Inativo', 'Comprado'].includes(txt(r[OFFCOL[t]])));
export const parseSpec = s => { const o = {}; txt(s).split(/;\s*/).forEach(p => { const i = p.indexOf(':'); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); }); return o; };
export const parseIdent = s => { s = txt(s); const i = s.indexOf(':'); if (i < 1) return null; const ops = s.slice(i + 1).split(',').map(x => x.trim()).filter(Boolean).map(x => { const [n, c] = x.split('='); return c ? { n: n.trim(), c: c.trim() } : { n: n.trim() }; }); return ops.length ? { nome: s.slice(0, i).trim(), tipo: ops.some(o => o.c) ? 'cor' : 'texto', ops } : null; };
export const parseTipos = s => txt(s).split(/;\s*/).map(x => x.trim()).filter(Boolean).map(x => /\(falta\)$/.test(x) ? { n: x.replace(/\s*\(falta\)$/, ''), aus: true } : { n: x });
export const chaveDe = (mapa, nome, padrao) => { const n = norm(nome); for (const [k, v] of Object.entries(mapa)) if (norm(Array.isArray(v) ? v[0] : (v.n || v)) === n) return k; return padrao; };
export function reusa(mapa, id, novo) { const o = mapa.get(id) || {}; for (const k of Object.keys(o)) if (!(k in novo)) delete o[k]; Object.assign(o, novo); return o; }

export function hidrata(db) {
  const R = { e: new Map(), o: new Map(), u: new Map() };
  for (const x of allLoc()) { R.e.set(x.e.id, x.e); for (const u of (x.e.units || [])) if (u.id) R.u.set(u.id, u); }
  for (const m of M) for (const p of m.partes) for (const o of p.orgs) R.o.set(o.id, o);
  for (const o of (SEM.orgs || [])) R.o.set(o.id, o);
  const rows = t => Object.values(db[t] || {});
  // classes (ícone e cor vêm da planilha)
  const cls = rows('CLASSES');
  if (cls.length) {
    for (const k of Object.keys(CL)) delete CL[k];
    for (const k of Object.keys(SPECK)) delete SPECK[k];
    SUG.length = 0;
    for (const c of cls) {
      CL[c.id] = { n: txt(c.nome), i: P[c.icone] ? c.icone : 'dots', c: txt(c.cor) || '#7A8794', m: MODO_IN[norm(c.modo_padrao)] || 'contavel' };
      SPECK[c.id] = txt(c.campos).split(/;\s*/).map(s => s.trim()).filter(Boolean);
      if (txt(c.palavras).trim()) try { SUG.push([new RegExp(norm(c.palavras)), c.id]); } catch (e) { }
    }
    if (!CL.div) CL.div = { n: 'Diversos', i: 'dots', c: '#7A8794', m: 'contavel' };
  }
  // etiquetas
  ETQ.length = 0;
  for (const r of rows('ETIQUETAS')) if (ativo('ETIQUETAS', r) && txt(r.texto)) ETQ.push({ id: r.id, t: txt(r.texto) });
  const etqId = t => { t = txt(t).trim(); if (!t) return null; let e = ETQ.find(x => x.t === t); if (!e) { e = { id: 'ETQ-' + uid(), t }; ETQ.push(e); } return e.id; };
  // recado do quadro
  const rc = db.CONFIG && db.CONFIG.recado;
  if (rc) { const l = txt(rc.valor).split('|').map(s => s.trim()).filter(Boolean); if (l.join('|') !== RECADO.linhas.join('|')) { RECADO.linhas = l; try { setRecado(l); } catch (e) { } } }
  // móveis e partes
  const porModelo = {}; for (const r of rows('MOVEIS')) if (r.modelo) porModelo[r.modelo] = r;
  const partes = {};
  for (const m of M) {
    const r = porModelo[m.id];
    if (r) {
      m.sid = r.id; if (txt(r.nome)) m.nome = txt(r.nome); if (txt(r.numero)) m.cod = txt(r.numero);
      if (r.x !== '' && r.x != null && r.z !== '' && r.z != null) m.pos = [+r.x, +r.y || 0, +r.z];
      if (r.rotacao !== '' && r.rotacao != null) m.rot = (+r.rotacao || 0) * Math.PI / 180;
      m.etq = etqId(r.etiqueta); m.inativo = r.estado === 'Inativo';
    } else m.sid = sidM(m);
    for (const p of m.partes) {
      const pr = (db.PARTES || {})[sidP(m, p)];
      if (pr) { if (!p.etqNome) p.nomeP = txt(pr.nome); p.etq = etqId(pr.etiqueta); p.cheia = pr.cheia === 'Sim'; p.conf = pr.conferido_em ? { em: dataMs(pr.conferido_em), por: txt(pr.conferido_por) } : null; }
      p.itens = []; p.orgs = [];
      partes[sidP(m, p)] = p;
    }
  }
  // catálogo
  for (const k of Object.keys(ITEMS)) delete ITEMS[k];
  for (const r of rows('ITENS')) {
    if (!ativo('ITENS', r) || !txt(r.nome)) continue;
    const cl = cls.length ? (cls.find(c => norm(c.nome) === norm(r.classe)) || { id: 'div' }).id : chaveDe(CL, r.classe, 'div');
    const modo = MODO_IN[norm(r.modo)] || (CL[cl] && CL[cl].m) || 'contavel';
    const it = { id: r.id, nome: txt(r.nome), cl, modo, un: txt(r.unidade) || 'un.', min: +r.minimo || 0, desc: txt(r.descricao), spec: parseSpec(r.especificacao), obs: txt(r.observacoes), criado: txt(r.criado_em) };
    const id_ = parseIdent(r.identificador); if (id_) it.ident = id_;
    if (txt(r.modelo_3d)) it.model = txt(r.modelo_3d);
    ITEMS[r.id] = it;
  }
  // organizadores
  const orgs = {};
  SEM.orgs = [];
  for (const r of rows('ORGANIZADORES')) {
    if (!ativo('ORGANIZADORES', r)) continue;
    const o = reusa(R.o, r.id, { id: r.id, tipo: chaveDe(OT, r.tipo, OT[r.tipo] ? r.tipo : 'caixaTrava'), cor: txt(r.cor) || '#c6cbce', tam: ['P', 'M', 'G'].includes(r.tamanho) ? r.tamanho : 'M', nome: txt(r.nome), etq: etqId(r.etiqueta), itens: [] });
    orgs[r.id] = o;
    const p = partes[r.local];
    if (p) p.orgs.push(o); else SEM.orgs.push(o);
  }
  // estoque
  const ents = {};
  SEM.itens = [];
  for (const r of rows('ESTOQUE')) {
    if (!ativo('ESTOQUE', r)) continue;
    const it = ITEMS[r.item]; if (!it) continue;
    const nu = { id: r.id, ref: r.item, nf: r.nao_encontrado === 'Sim', t: dataMs(r.guardado_em) || Date.now() };
    if (it.modo === 'unidades') nu.units = [];
    else if (it.modo === 'contavel') nu.qtd = +r.quantidade || 0;
    else { const n = NIVEIS.findIndex(x => norm(x) === norm(r.nivel)); nu.nivel = n < 0 ? 2 : n; nu.tipos = parseTipos(r.tipos); }
    if (r.aberto_em) nu.aberto = dataMs(r.aberto_em);
    const e = reusa(R.e, r.id, nu);
    ents[r.id] = e;
    const dest = orgs[r.local] ? orgs[r.local].itens : partes[r.local] ? partes[r.local].itens : SEM.itens;
    dest.push(e);
  }
  // unidades
  for (const r of rows('UNIDADES')) {
    if (!ativo('UNIDADES', r)) continue;
    const e = ents[r.estoque]; if (!e || !e.units) continue;
    const est = Object.keys(ESTADOS).find(k => norm(ESTADOS[k][0]) === norm(r.estado)) || 'boa';
    const emp = txt(r.com_quem) ? { para: txt(r.com_quem), tipo: Object.keys(TIPOEMP).find(k => TIPOEMP[k] === r.tipo_emprestimo) || 'equipe', desde: dataMs(r.desde) || Date.now(), ...(r.prazo ? { prazo: dataMs(r.prazo) } : {}) } : null;
    e.units.push(reusa(R.u, r.id, { id: r.id, n: +r.numero || 0, estado: est, emp, v: txt(r.identificador) || null }));
  }
  for (const e of Object.values(ents)) if (e.units) e.units.sort((a, b) => a.n - b.n);
  // lista de compras
  BUY.length = 0; COMPRADOS.length = 0;
  for (const r of rows('COMPRAS')) {
    if (!ativo('COMPRAS', r)) continue;
    const x = allLoc().find(y => y.e.id === r.estoque); if (!x) continue;
    BUY.push({ id: r.id, x, why: txt(r.motivo), q: +r.quantidade || 1, em: dataMs(r.pedido_em), por: txt(r.pedido_por) });
  }
  // nomes conhecidos para empréstimo
  const nomes = new Set(rows('UNIDADES').map(r => txt(r.com_quem).trim()).filter(Boolean));
  PESSOAS.length = 0; PESSOAS.push(...[...nomes].slice(0, 12));
}

/* ---------------- tela = base + fila ---------------- */
export function vista() {
  const v = structuredClone(ST.base || {});
  for (const lote of ST.fila) for (const op of lote.ops) applyOp(v, op);
  return v;
}
export const assinatura = p => JSON.stringify([p.itens.map(e => [e.id, e.qtd, e.nivel, (e.units || []).length, e.ref]), p.orgs.map(o => [o.id, o.tipo, o.cor, o.tam, o.itens.map(e => [e.id, e.qtd, e.nivel, (e.units || []).length])])]);
export function aplicaNaTela() {
  if (S.carry || S.oc || document.querySelector('#modal.on')) { adiado = true; return; }
  adiado = false;
  const antes = new Map(), pos = new Map();
  for (const f of F) { pos.set(f, [...f.d.pos, f.d.rot]); for (const p of f.d.partes) antes.set(p, assinatura(p)); }
  hidrata(vista());
  for (const f of F) {
    const [x, y, z, r] = pos.get(f), m = f.d;
    if (x !== m.pos[0] || y !== m.pos[1] || z !== m.pos[2] || r !== m.rot) { f.g.position.set(m.pos[0], m.pos[1], m.pos[2]); f.g.rotation.y = m.rot; try { measure(f); } catch (e) { } }
    for (const p of m.partes) if (antes.get(p) !== assinatura(p)) try { buildContents(f, p.id); } catch (e) { console.warn(e); }
  }
  sombra = achata(); wake(1500);
  try { refreshCards(); } catch (e) { console.warn(e); }
  try { refreshBadges(); } catch (e) { }
  historicoNaTela();
}
export function historicoNaTela() {
  LOG.length = 0;
  for (const h of ST.hist.slice(0, 300)) LOG.push({ h: txt(h.data).slice(5, 16).replace(/^(\d\d)-(\d\d) /, '$2/$1 '), t: h.resumo + (h.email ? ' · ' + h.email.split('@')[0] : ''), ref: h.ref || h.id });
}

/* ---------------- gravar: tela → fila → planilha ---------------- */
export function aoMudar() {
  if (!sombra || !ST.base) return;
  if (S.carry) { clearTimeout(tFila); tFila = setTimeout(aoMudar, 800); return; }
  const agora = achata();
  const ops = diferenca(sombra, agora);
  sombra = agora;
  COMPRADOS.length = 0;
  const res = HOOK.resumo.splice(0);
  if (!ops.length) return;
  if (S.role === 'vis') { toast('Seu acesso é só de leitura. A mudança não foi salva.', null, 3000); ST.fila.length = 0; aplicaNaTela(); return; }
  const lote = 'L' + uid();
  ST.fila.push({ lote, ops, resumo: res.map(r => r.t).join(' · ').slice(0, 400), ref: (res[0] && res[0].ref) || '' });
  ST.meus.push(lote); if (ST.meus.length > 300) ST.meus.splice(0, ST.meus.length - 300);
  for (const r of res) ST.hist.unshift({ data: dataTxt(Date.now()), email: S.me || '', resumo: r.t, ref: r.ref, local: true });
  persiste(true); marca();
  clearTimeout(tFila); tFila = setTimeout(envia, 700);
}
export async function envia() {
  if (ocupado) { clearTimeout(tFila); tFila = setTimeout(envia, 600); return; }
  if (!ST.fila.length || !ST.sessao) { marca(); return; }
  if (!navigator.onLine) { marca(); return; }
  ocupado = true; marca();
  const l = ST.fila[0];
  try {
    const r = await api({ a: 'push', s: ST.sessao, since: ST.rev, lote: l.lote, ops: l.ops, resumo: l.resumo, ref: l.ref });
    if (!r.ok) {
      if (r.code === 'sessao' || r.code === 'bloqueado') { ocupado = false; return sair(r.erro, true); }
      if (r.code === 'permissao' || r.code === 'dados') {
        ST.fila.shift(); persiste(); toast(r.erro + ' A mudança foi desfeita.', null, 4200);
        ocupado = false; return snap();
      }
      throw new Error(r.erro || 'falha');
    }
    if (ST.fila[0] === l) { ST.fila.shift(); persiste(true); }
    falhas = 0; ultimoErro = '';
    recebe(r);
  } catch (e) {
    falhas++; ultimoErro = String(e.message || e);
    setTimeout(envia, Math.min(60000, 2000 * Math.pow(2, falhas)));
  } finally { ocupado = false; marca(); }
  if (ST.fila.length && !falhas) envia();
}
export function recebe(r) {
  if (r.eu) defineEu(r.eu);
  if (r.recarregar) return snap();
  let alheio = false;
  for (const op of (r.ops || [])) {
    if (op.rev <= ST.rev) continue;
    applyOp(ST.base, op);
    const meu = ST.meus.includes(op.lote);
    if (!meu) alheio = true;
    if (op.resumo && !meu) ST.hist.unshift({ data: op.data, email: op.email, resumo: op.resumo, ref: op.ref || op.id });
  }
  ST.hist = ST.hist.filter(h => !h.local || ST.fila.length).slice(0, 300);
  if (typeof r.rev === 'number') ST.rev = Math.max(ST.rev, r.rev);
  persiste();
  if (alheio) aplicaNaTela();
}
export async function puxa() {
  if (!ST.sessao || !ST.base || ocupado || document.hidden) return;
  if (ST.fila.length) return envia();
  try { ocupado = true; marca(); const r = await api({ a: 'pull', s: ST.sessao, since: ST.rev }); ocupado = false; if (!r.ok) { if (r.code === 'sessao' || r.code === 'bloqueado') return sair(r.erro, true); throw new Error(r.erro); } falhas = 0; recebe(r); }
  catch (e) { ultimoErro = String(e.message || e); falhas++; }
  finally { ocupado = false; marca(); }
}
export async function snap(primeira) {
  const c = $('#carrega'); if (primeira && c) c.classList.add('on');
  try {
    const r = await api({ a: 'snap', s: ST.sessao }, 45000);
    if (!r.ok) { if (r.code === 'sessao' || r.code === 'bloqueado') return sair(r.erro, true); throw new Error(r.erro); }
    ST.base = {};
    for (const [t, rows] of Object.entries(r.tabs)) { ST.base[t] = {}; const k = TABS[t].k; for (const row of rows) ST.base[t][row[k]] = row; }
    ST.rev = r.rev; ST.hist = (r.hist || []).map(h => ({ ...h, ref: h.ref || h.id }));
    defineEu(r.eu, r.pendentes); falhas = 0; ultimoErro = '';
    persiste(); aplicaNaTela();
    if (ST.fila.length) envia();
  } catch (e) {
    ultimoErro = String(e.message || e); falhas++;
    if (!ST.base) { const m = $('#carrega .msg'); if (m) m.textContent = 'Não consegui falar com a planilha. Tentando de novo…'; setTimeout(() => snap(primeira), 4000); }
  } finally { if (ST.base && c) c.classList.remove('on'); marca(); }
}

/* ---------------- quem está usando ---------------- */
export function defineEu(eu, pendentes) {
  if (!eu) return;
  const antes = ST.eu && ST.eu.papel + ST.eu.status;
  ST.eu = eu; S.me = eu.email;
  if (pendentes !== undefined) ST.pendentes = pendentes;
  const papel = eu.status === 'Ativo' ? (PAPEL[eu.papel] || 'vis') : 'vis';
  if (S.role !== papel || antes !== eu.papel + eu.status) setRole(papel);
  app.classList.toggle('pendente', eu.status === 'Pendente');
  marca();
}

/* ---------------- interface: login, conta, estado de gravação ---------------- */
export function montaUI() {
  app.classList.add('live');
  const top = $('.ui.top');
  top.insertAdjacentHTML('beforeend', `<button class="acct glass" id="acct" aria-label="Conta"><span class="av"></span><span class="dot"></span></button>`);
  app.insertAdjacentHTML('beforeend', `
  <div class="ui acctpop glass" id="acctpop"></div>
  <div class="ui banner glass" id="banner">Seu acesso está aguardando a aprovação de um Admin. Por enquanto você só vê.</div>
  <div class="login" id="login"><div class="lbox glass">
    <div class="lmark">AR</div>
    <h1>Inventário AeroRio</h1>
    <p>Entre com a conta Google que você usa na equipe.</p>
    <div id="gbtn" class="gbtn"></div>
    <p class="lerr" id="lerr" role="alert"></p>
    <a href="#demo" class="ldemo" id="ldemo">Ver a demonstração sem entrar</a>
  </div></div>
  <div class="carrega" id="carrega"><div class="lbox glass"><div class="spin"></div><p class="msg">Carregando o inventário…</p></div></div>`);
  $('#ldemo').onclick = ev => { ev.preventDefault(); location.hash = 'demo'; location.reload(); };
  $('#acct').onclick = ev => { ev.stopPropagation(); const p = $('#acctpop'); if (p.classList.contains('on')) return p.classList.remove('on'); contaPop(); p.classList.add('on'); };
  document.addEventListener('pointerdown', ev => { const p = $('#acctpop'); if (p.classList.contains('on') && !ev.target.closest('#acctpop,#acct')) p.classList.remove('on'); });
  const rs = $('#resetBtn'); if (rs) rs.remove();
  const adm = $('.admbar'); if (adm) adm.insertAdjacentHTML('afterbegin', `<button class="pill sm" id="pplBtn">Pessoas</button>`);
  $('#pplBtn').onclick = abrePessoas;
  window.addEventListener('online', () => { marca(); envia(); });
  window.addEventListener('offline', marca);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) puxa(); });
  window.addEventListener('focus', puxa);
  /* conversa periódica: a cada 45 s com alguém usando; a cada 3 min com a tela parada */
  let mexeu = Date.now(), ultimaPuxada = Date.now();
  ['pointerdown', 'keydown', 'wheel'].forEach(t => app.addEventListener(t, () => { mexeu = Date.now(); }, { passive: true }));
  setInterval(() => { if (document.hidden) return; const int = Date.now() - mexeu > 300000 ? 180000 : 45000; if (Date.now() - ultimaPuxada >= int) { ultimaPuxada = Date.now(); puxa(); } }, 15000);
  setInterval(() => { if (adiado) aplicaNaTela(); }, 1200);
  // rede de segurança: alguma mudança que não passou por log() também é gravada
  setInterval(() => { if (!S.carry && ST.base && sombra) aoMudar(); }, 5000);
  window.addEventListener('pagehide', grava);
}
export function marca() {
  const el = $('#acct'); if (!el) return;
  const n = ST.fila.reduce((a, l) => a + l.ops.length, 0);
  estado = !navigator.onLine ? 'offline' : falhas > 1 ? 'erro' : (n || ocupado) ? 'salvando' : 'ok';
  el.dataset.s = estado;
  const ini = ST.eu ? (ST.eu.nome || ST.eu.email).split(/[\s@.]/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('') : '';
  el.querySelector('.av').textContent = ini || '';
  if (!ini) el.querySelector('.av').innerHTML = IC.user;
  el.classList.toggle('badge', !!(ST.pendentes && S.role === 'admin'));
  if ($('#acctpop').classList.contains('on')) contaPop();
}
export function situacao() {
  const n = ST.fila.reduce((a, l) => a + l.ops.length, 0);
  if (estado === 'offline') return n ? `Sem conexão. ${n} alteraç${n > 1 ? 'ões guardadas' : 'ão guardada'} neste aparelho; envio quando voltar.` : 'Sem conexão. Mostrando a última versão salva neste aparelho.';
  if (estado === 'erro') return `A planilha não respondeu (${ultimoErro || 'erro'}). ${n ? n + ' alteraç' + (n > 1 ? 'ões' : 'ão') + ' na fila.' : ''} Tentando de novo.`;
  if (estado === 'salvando') return n ? `Salvando ${n} alteraç${n > 1 ? 'ões' : 'ão'}…` : 'Conferindo a planilha…';
  return 'Tudo salvo na planilha.';
}
export function contaPop() {
  const eu = ST.eu || {}, p = $('#acctpop');
  const papel = eu.status === 'Pendente' ? 'Aguardando aprovação' : eu.status === 'Ativo' ? eu.papel : eu.status;
  p.innerHTML = `<div class="who"><b>${eu.nome || ''}</b><span>${eu.email || ''}</span><em>${papel || ''}</em></div>
   <div class="sst" data-s="${estado}"><i></i>${situacao()}</div>
   <div class="row stl">${[['a', 'Noturno'], ['b', 'Claro'], ['c', 'Ilustrado']].map(([k, n]) => `<button data-st="${k}" class="${S.style === k ? 'on' : ''}"><span class="sw" data-v="${k}"></span>${n}</button>`).join('')}</div>
   ${S.role === 'admin' ? `<button class="it" data-ac="ppl">${IC.people}Pessoas${ST.pendentes ? `<b class="nb">${ST.pendentes}</b>` : ''}</button>` : ''}
   ${S.role === 'admin' && mob() ? `<div class="tl">Ferramentas</div><div class="ilist">${admListH(['pplBtn'])}</div>` : ''}
   <div class="sep"></div>
   <button class="it" data-ac="sync">${IC.sync}Atualizar agora</button>
   <button class="it" data-ac="out">${IC.out}Sair</button>`;
  p.onclick = ev => {
    const st = ev.target.closest('[data-st]'); if (st) { const sw = document.querySelector(`#styles .sw[data-v="${st.dataset.st}"]`); if (sw) sw.click(); contaPop(); return; }
    if (admClick(ev)) { p.classList.remove('on'); return; }
    const a = ev.target.closest('[data-ac]'); if (!a) return;
    p.classList.remove('on');
    if (a.dataset.ac === 'ppl') abrePessoas();
    if (a.dataset.ac === 'sync') { if (ST.fila.length) envia(); else snap(); toast('Atualizando com a planilha…', null, 1600); }
    if (a.dataset.ac === 'out') sair();
  };
}
export function sair(msg, manterFila) {
  ST.sessao = ''; ST.eu = null;
  if (!manterFila) { ST.base = null; ST.fila = []; ST.hist = []; ST.rev = 0; try { google.accounts.id.disableAutoSelect(); } catch (e) { } }
  persiste();
  mostraLogin(msg || '');
}
export function mostraLogin(msg) {
  const L = $('#login'); L.classList.add('on'); $('#lerr').textContent = msg || '';
  carregaGIS().then(() => {
    try {
      google.accounts.id.initialize({ client_id: CFG.client, callback: aoEntrar, auto_select: true, itp_support: true, use_fedcm_for_prompt: true });
      google.accounts.id.renderButton($('#gbtn'), { theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', locale: 'pt-BR', width: 260 });
    } catch (e) { $('#lerr').textContent = 'Não consegui carregar o login do Google. Confira a conexão e recarregue.'; }
  }).catch(() => { $('#lerr').textContent = 'Não consegui carregar o login do Google. Confira a conexão e recarregue.'; });
}
export let gis = null;
export function carregaGIS() {
  if (gis) return gis;
  gis = new Promise((ok, no) => { if (window.google && google.accounts) return ok(); const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = ok; s.onerror = () => { gis = null; no(); }; document.head.appendChild(s); });
  return gis;
}
export async function aoEntrar(resp) {
  $('#lerr').textContent = 'Entrando…';
  try {
    const r = await api({ a: 'auth', idToken: resp.credential });
    if (!r.ok) { $('#lerr').textContent = r.erro || 'Não foi possível entrar.'; return; }
    ST.sessao = r.sessao; defineEu(r.eu); persiste();
    $('#login').classList.remove('on');
    if (r.eu.status === 'Pendente') toast('Cadastro feito. Um Admin precisa aprovar seu acesso; até lá você só vê.', null, 5000);
    await snap(!ST.base);
  } catch (e) { $('#lerr').textContent = 'A planilha não respondeu. Tente de novo em instantes.'; }
}

/* ---------------- Admin › Pessoas ---------------- */
export async function abrePessoas() {
  modal(`<h4>Pessoas</h4><div class="ppl" id="ppl"><p class="muted">Carregando…</p></div><div class="mf"><button class="pill" data-mclose>Fechar</button></div>`, true);
  const m = $('#modal');
  m.onclick = ev => { if (ev.target.closest('[data-mclose]')) closeModal(); };
  let r;
  try { r = await api({ a: 'pessoas', s: ST.sessao }); } catch (e) { r = { ok: false, erro: 'A planilha não respondeu.' }; }
  desenhaPessoas(r);
}
export function desenhaPessoas(r) {
  const el = $('#ppl'); if (!el) return;
  if (!r.ok) { el.innerHTML = `<p class="muted">${r.erro}</p>`; return; }
  const ord = { Pendente: 0, Ativo: 1, Bloqueado: 2 };
  const ps = r.pessoas.sort((a, b) => (ord[a.status] - ord[b.status]) || txt(a.nome).localeCompare(txt(b.nome)));
  ST.pendentes = ps.filter(p => p.status === 'Pendente').length; marca();
  el.innerHTML = ps.map(p => `<div class="pr ${p.status === 'Pendente' ? 'pend' : ''}" data-em="${p.email}">
   <div class="pn"><b>${p.nome || p.email}</b><span>${p.email}</span></div>
   ${p.status === 'Pendente' ? `<button class="pill sm pri" data-ap="Membro">Aprovar como Membro</button><button class="pill sm" data-ap="Visitante">Só leitura</button><button class="pill sm" data-ap="Bloqueado">Recusar</button>`
      : `<select data-pp aria-label="Papel de ${p.nome || p.email}">${['Admin', 'Membro', 'Visitante'].map(x => `<option ${x === p.papel ? 'selected' : ''}>${x}</option>`).join('')}</select><select data-ps aria-label="Situação de ${p.nome || p.email}">${['Ativo', 'Bloqueado'].map(x => `<option ${x === p.status ? 'selected' : ''}>${x}</option>`).join('')}</select>`}</div>`).join('') || '<p class="muted">Ninguém cadastrado ainda.</p>';
  const muda = async (email, papel, status) => {
    el.style.opacity = .5;
    let r2; try { r2 = await api({ a: 'definirPessoa', s: ST.sessao, email, papel, status }); } catch (e) { r2 = { ok: false, erro: 'A planilha não respondeu.' }; }
    el.style.opacity = 1;
    if (!r2.ok) { toast(r2.erro, null, 3000); return abrePessoas(); }
    desenhaPessoas(r2);
  };
  el.onclick = ev => { const b = ev.target.closest('[data-ap]'); if (!b) return; const em = b.closest('[data-em]').dataset.em; const v = b.dataset.ap; muda(em, v === 'Bloqueado' ? 'Visitante' : v, v === 'Bloqueado' ? 'Bloqueado' : 'Ativo'); };
  el.onchange = ev => { const row = ev.target.closest('[data-em]'); if (!row) return; muda(row.dataset.em, row.querySelector('[data-pp]').value, row.querySelector('[data-ps]').value); };
}

/* ---------------- partida ---------------- */
export function iniciaPlanilha() {
  HOOK.live = true;
  HOOK.save = () => { clearTimeout(tFila); tFila = setTimeout(aoMudar, 350); };
  montaUI();
  carrega();
  // nada da demonstração aparece com a planilha ligada
  for (const m of M) for (const p of m.partes) { p.itens = []; p.orgs = []; }
  SEM.itens = []; BUY.length = 0; LOG.length = 0;
  if (ST.base) { if (ST.eu) defineEu(ST.eu); aplicaNaTela(); }
  else { hidrata({}); sombra = null; for (const f of F) for (const p of f.d.partes) try { buildContents(f, p.id); } catch (e) { } }
  if (!ST.sessao) return mostraLogin();
  if (ST.base) { if (ST.fila.length) envia(); else puxa(); }
  else snap(true);
}
if (LIVE) iniciaPlanilha();
/* para os testes */
export const __sync = { ITEMS, SEM, M, BUY, allLoc, log, save, get fila() { return ST.fila; }, get sombra() { return sombra; }, get ST() { return ST; }, set ST(v) { ST = v; }, achata, diferenca, hidrata, vista, aoMudar, envia, puxa, snap, recebe, aplicaNaTela };

if (/dbg/.test(location.hash)) window.__sync = __sync;

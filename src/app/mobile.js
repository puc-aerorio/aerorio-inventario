import { S, UIH, app, mob, wake } from './state.js';
import { IC } from './icons.js';
import { closeStack, stackEl } from './ui.js';

/* ================= celular: folha de cards, menu compacto, desenho sob demanda ================= */

/* Folha de baixo: três alturas (espiada, metade, cheia). Arrastar pela alça ou pelo topo do card; puxar para baixo fecha. */
export const SHEET = { k: .56, drag: null };
export const ALT = () => { const H = app.clientHeight; return { peek: Math.round(H * .36), half: Math.round(H * .58), full: H - 70 }; };
export function sheetPx() { return Math.round(app.clientHeight * SHEET.k); }
export function setSheet(px, anim = true) {
  const H = app.clientHeight; px = Math.max(80, Math.min(H - 64, px)); SHEET.k = px / H;
  stackEl.classList.toggle('drag', !anim); stackEl.style.setProperty('--sh', px + 'px'); S.sheetH = px; wake();
}
export const grab = document.createElement('div'); grab.className = 'sgrab'; grab.setAttribute('aria-hidden', 'true'); stackEl.appendChild(grab);
export function inicio(ev) {
  if (!mob() || !S.stack.length) return;
  const hd = ev.target.closest('.sgrab') || (ev.target.closest('.scard .hd, .scard .crumb') && !ev.target.closest('button,input,select,textarea,a,[data-act],[data-tag]'));
  if (!hd) return;
  SHEET.drag = { y0: ev.clientY, h0: sheetPx(), t0: performance.now(), y: ev.clientY, t: performance.now(), v: 0, moveu: false };
  stackEl.setPointerCapture?.(ev.pointerId);
}
stackEl.addEventListener('pointerdown', inicio);
stackEl.addEventListener('pointermove', ev => {
  const d = SHEET.drag; if (!d) return;
  const now = performance.now(); d.v = (ev.clientY - d.y) / Math.max(1, now - d.t); d.y = ev.clientY; d.t = now;
  const dy = ev.clientY - d.y0; if (Math.abs(dy) > 4) d.moveu = true;
  if (d.moveu) setSheet(d.h0 - dy, false);
});
export function fim() {
  const d = SHEET.drag; if (!d) return; SHEET.drag = null;
  if (!d.moveu) { stackEl.classList.remove('drag'); return; }
  const a = ALT(), h = sheetPx() - d.v * 220; // o arremesso conta
  if (h < a.peek - 70) { setSheet(a.peek); closeStack(); return; }
  const alvo = [a.peek, a.half, a.full].reduce((b, x) => Math.abs(x - h) < Math.abs(b - h) ? x : b);
  setSheet(alvo); try { navigator.vibrate && navigator.vibrate(6); } catch (e) { }
}
stackEl.addEventListener('pointerup', fim); stackEl.addEventListener('pointercancel', fim);
/* abrir um card no celular volta para a metade; card de item/organizador pede mais espaço */
UIH.sheetFor = t => sheetFor(t);
export function sheetFor(t) { if (!mob()) return; const a = ALT(); setSheet(t === 'm' ? a.half : Math.max(a.half, Math.min(a.full, Math.round(app.clientHeight * .64)))); }
addEventListener('resize', () => { if (mob()) setSheet(sheetPx()); });

/* menu do celular na demonstração: papéis e estilos saem da barra e vão para cá */
if (!document.querySelector('#acct')) {
  const top = document.querySelector('.ui.top');
  top.insertAdjacentHTML('beforeend', `<button class="acct glass more" id="moreBtn" aria-label="Mais opções"><span class="av">${IC.user}</span></button>`);
  app.insertAdjacentHTML('beforeend', `<div class="ui acctpop glass" id="morePop"></div>`);
  const pop = document.querySelector('#morePop');
  const desenha = () => {
    pop.innerHTML = `<div class="who"><b>Demonstração</b><span>Dados de exemplo, guardados só neste navegador.</span></div>
    <div class="tl">Ver como</div><div class="row stl">${[['vis', 'Visitante'], ['mem', 'Membro'], ['admin', 'Admin']].map(([k, n]) => `<button data-r="${k}" class="${S.role === k ? 'on' : ''}">${n}</button>`).join('')}</div>
    <div class="tl">Estilo</div><div class="row stl">${[['a', 'Noturno'], ['b', 'Claro'], ['c', 'Ilustrado']].map(([k, n]) => `<button data-st="${k}" class="${S.style === k ? 'on' : ''}"><span class="sw" data-v="${k}"></span>${n}</button>`).join('')}</div>`;
  };
  document.querySelector('#moreBtn').onclick = ev => { ev.stopPropagation(); if (pop.classList.toggle('on')) desenha(); };
  pop.onclick = ev => {
    const r = ev.target.closest('[data-r]'); if (r) { document.querySelector(`#roles [data-r="${r.dataset.r}"]`).click(); desenha(); return; }
    const st = ev.target.closest('[data-st]'); if (st) { document.querySelector(`#styles .sw[data-v="${st.dataset.st}"]`).click(); desenha(); }
  };
  document.addEventListener('pointerdown', ev => { if (pop.classList.contains('on') && !ev.target.closest('#morePop,#moreBtn')) pop.classList.remove('on'); });
}

/* desenho sob demanda: parado, a cena não é redesenhada (bateria e calor no celular) */
['pointerdown', 'pointermove', 'wheel', 'keydown', 'touchstart', 'touchmove'].forEach(t => app.addEventListener(t, () => wake(), { passive: true }));
addEventListener('resize', () => wake(1500));
document.addEventListener('visibilitychange', () => wake());

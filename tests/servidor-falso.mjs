// Planilha falsa para testar o site de ponta a ponta: o Apps Script de verdade (Codigo.gs) rodando sobre a simulação.
import http from 'http'; import { criaGas } from './gas-mock.mjs';
const porta = +process.argv[2] || 4175;
const g = criaGas({ clientId: 'teste' });
g.ctx.instalar();
let atraso = 0, fora = false;
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let b = ''; req.on('data', c => b += c); req.on('end', () => {
    if (req.url.startsWith('/ctl')) {
      const u = new URL(req.url, 'http://x'); if (u.searchParams.has('atraso')) atraso = +u.searchParams.get('atraso'); if (u.searchParams.has('fora')) fora = u.searchParams.get('fora') === '1';
      if (u.searchParams.has('sessao')) { const r = g.post({ a: 'auth', idToken: 'tok:' + u.searchParams.get('sessao') + ':teste' }); return res.end(JSON.stringify(r)); }
      if (u.searchParams.has('aprova')) { const adm = g.post({ a: 'auth', idToken: 'tok:aerorio2024@gmail.com:teste' }); return res.end(JSON.stringify(g.post({ a: 'definirPessoa', s: adm.sessao, email: u.searchParams.get('aprova'), papel: 'Membro', status: 'Ativo' }))); }
      if (u.searchParams.has('aba')) { const sh = g.ss.getSheetByName(u.searchParams.get('aba')); return res.end(JSON.stringify(sh.getDataRange().getValues())); }
      return res.end('ok');
    }
    if (fora) { res.statusCode = 503; return res.end('fora'); }
    setTimeout(() => { try { res.setHeader('Content-Type', 'application/json'); res.end(g.ctx.doPost({ postData: { contents: b } }).s); } catch (e) { res.statusCode = 500; res.end(String(e)); } }, atraso);
  });
}).listen(porta, () => console.log('planilha falsa em', porta));

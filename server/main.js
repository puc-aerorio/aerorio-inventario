/* ===================== AeroRio · Inventário · servidor =====================
   Este arquivo vive em Extensões › Apps Script da planilha "AeroRio | Inventário".
   Ele é gerado por `npm run gs` a partir de server/main.js e src/data/schema.js. Não edite o Codigo.gs à mão:
   edite os fontes no repositório e gere de novo.
   Passo a passo de instalação: SETUP.md no repositório. */

const CLIENT_ID = ''; // ID do cliente OAuth do Google Cloud. Também pode ser definido em Inventário › Configurar login.
const ORIGEM_V2 = '18nnMwZ-tkshcNx-mvvQBCbvU7l9ihCHyYS4MIseDGtY'; // Central de Inventário v2, de onde vem a importação
const SESSAO_DIAS = 60;
const PULL_MAX = 1500; // acima disso o app recarrega tudo

/* ---------------- utilidades ---------------- */
const props_ = () => PropertiesService.getScriptProperties();
const clientId_ = () => CLIENT_ID || props_().getProperty('CLIENT_ID') || '';
const ss_ = () => SpreadsheetApp.getActiveSpreadsheet();
const agora_ = () => dataTxt(Date.now());
const json_ = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const erro_ = (code, msg) => { const e = new Error(msg); e.code = code; return e; };

function normVal_(tab, col, v) {
  if (v instanceof Date) return isNaN(v) ? '' : dataTxt(v.getTime());
  if (v === null || v === undefined) return '';
  const T = TABS[tab];
  if (T && T.num && T.num.indexOf(col) >= 0) return v === '' ? '' : (isNaN(+v) ? '' : +v);
  return typeof v === 'string' ? v : String(v);
}

/* lê uma aba inteira: cabeçalho, linhas e mapa id → índice */
function lerAba_(nome) {
  const sh = ss_().getSheetByName(nome);
  if (!sh) throw erro_('estrutura', 'Aba ' + nome + ' não existe. Rode Inventário › Instalar ou atualizar estrutura.');
  const vals = sh.getDataRange().getValues();
  const hdr = (vals[0] || []).map(h => String(h).trim());
  const T = TABS[nome], k = T.k, ki = hdr.indexOf(k);
  const linhas = [], idx = {};
  for (let r = 1; r < vals.length; r++) {
    const id = String(vals[r][ki] == null ? '' : vals[r][ki]).trim();
    if (!id) continue;
    const o = {};
    hdr.forEach((h, c) => { if (h) o[h] = normVal_(nome, h, vals[r][c]); });
    o[k] = id;
    idx[id] = linhas.length;
    linhas.push({ r: r + 1, o });
  }
  return { sh, hdr, linhas, idx, nome };
}

/* ---------------- sessão ---------------- */
function segredo_() {
  let s = props_().getProperty('SEGREDO');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props_().setProperty('SEGREDO', s); }
  return s;
}
function assina_(txt) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(txt, segredo_())); }
function criaSessao_(email) {
  const p = Utilities.base64EncodeWebSafe(JSON.stringify({ e: email, x: Date.now() + SESSAO_DIAS * 864e5 }));
  return p + '.' + assina_(p);
}
function lerSessao_(s) {
  if (!s || typeof s !== 'string' || s.indexOf('.') < 0) throw erro_('sessao', 'Entre de novo.');
  const [p, sig] = s.split('.');
  if (assina_(p) !== sig) throw erro_('sessao', 'Sessão inválida. Entre de novo.');
  const o = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(p)).getDataAsString());
  if (!o.x || o.x < Date.now()) throw erro_('sessao', 'Sessão expirada. Entre de novo.');
  return o.e;
}

/* ---------------- pessoas ---------------- */
function usuarios_() {
  const c = CacheService.getScriptCache(), hit = c.get('usuarios');
  if (hit) return JSON.parse(hit);
  const a = lerAba_('USUARIOS'), m = {};
  a.linhas.forEach(l => { m[l.o.email.toLowerCase()] = l.o; });
  c.put('usuarios', JSON.stringify(m), 60);
  return m;
}
function eu_(sessao) {
  const email = lerSessao_(sessao).toLowerCase();
  const u = usuarios_()[email];
  if (!u) throw erro_('sessao', 'Cadastro não encontrado. Entre de novo.');
  if (u.status === 'Bloqueado') throw erro_('bloqueado', 'Seu acesso foi bloqueado por um Admin.');
  const papel = u.status === 'Ativo' ? (u.papel || 'Visitante') : 'Visitante';
  return { email, nome: u.nome, papel, status: u.status || 'Pendente' };
}
function acaoAuth_(b) {
  const cid = clientId_();
  if (!cid) throw erro_('config', 'Login ainda não configurado na planilha (Inventário › Configurar login).');
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(b.idToken || ''), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw erro_('auth', 'Não foi possível confirmar o login com o Google. Tente de novo.');
  const t = JSON.parse(res.getContentText());
  if (t.aud !== cid) throw erro_('auth', 'Login de outro aplicativo.');
  if (String(t.email_verified) !== 'true') throw erro_('auth', 'E-mail do Google não verificado.');
  const email = String(t.email).toLowerCase();
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const a = lerAba_('USUARIOS');
    const i = a.idx[email];
    if (i === undefined) {
      const algumAdmin = a.linhas.some(l => l.o.papel === 'Admin' && l.o.status === 'Ativo');
      const o = { email, nome: limpa(t.name || email.split('@')[0]), papel: algumAdmin ? 'Membro' : 'Admin', status: algumAdmin ? 'Pendente' : 'Ativo', criado_em: agora_(), ultimo_acesso: agora_() };
      a.sh.appendRow(a.hdr.map(h => o[h] !== undefined ? o[h] : ''));
    } else {
      const c = a.hdr.indexOf('ultimo_acesso');
      if (c >= 0) a.sh.getRange(a.linhas[i].r, c + 1).setValue(agora_());
    }
    CacheService.getScriptCache().remove('usuarios');
  } finally { lock.releaseLock(); }
  const sessao = criaSessao_(email);
  return { sessao, eu: eu_(sessao) };
}

/* ---------------- leitura ---------------- */
function rev_() { const sh = ss_().getSheetByName('MOVIMENTOS'); return Math.max(0, sh.getLastRow() - 1); }

function acaoSnap_(b, eu) {
  const tabs = {};
  SYNC.forEach(n => { tabs[n] = lerAba_(n).linhas.map(l => l.o); });
  const out = { rev: rev_(), tabs, eu, hist: historico_(300), v: SCHEMA_V };
  if (eu.papel === 'Admin') out.pendentes = Object.values(usuarios_()).filter(u => u.status === 'Pendente').length;
  return out;
}
function historico_(n) {
  const sh = ss_().getSheetByName('MOVIMENTOS'), last = sh.getLastRow();
  if (last < 2) return [];
  const de = Math.max(2, last - n * 3 + 1);
  const vals = sh.getRange(de, 1, last - de + 1, TABS.MOVIMENTOS.c.length).getValues();
  const out = [];
  for (let i = vals.length - 1; i >= 0 && out.length < n; i--) {
    const [rev, data, email, tabela, id, op, dados, resumo] = vals[i];
    if (resumo) { let r = ''; try { r = (JSON.parse(dados || '{}').r) || ''; } catch (e) { } out.push({ rev: +rev, data: normVal_('MOVIMENTOS', 'data', data), email, tabela, id: String(id), ref: r || String(id), resumo: String(resumo) }); }
  }
  return out;
}
function opsDesde_(since) {
  const sh = ss_().getSheetByName('MOVIMENTOS'), last = sh.getLastRow(), rev = Math.max(0, last - 1);
  since = Math.max(0, +since || 0);
  if (since > rev) return { recarregar: true, rev };
  if (rev - since > PULL_MAX) return { recarregar: true, rev };
  if (rev === since) return { rev, ops: [] };
  const vals = sh.getRange(since + 2, 1, rev - since, TABS.MOVIMENTOS.c.length).getValues();
  const ops = [];
  for (const v of vals) {
    const [r, data, email, tabela, id, operacao, dados, resumo, lote] = v;
    if (operacao === 'edicao_manual' || operacao === 'estrutura') return { recarregar: true, rev };
    let d = {}; try { d = dados ? JSON.parse(dados) : {}; } catch (e) { return { recarregar: true, rev }; }
    ops.push({ rev: +r, t: tabela, id: String(id), f: d.f, i: d.i, ref: d.r || '', lote: String(lote || ''), resumo: resumo ? String(resumo) : '', email: String(email), data: normVal_('MOVIMENTOS', 'data', data) });
  }
  return { rev, ops };
}
function acaoPull_(b) { return opsDesde_(b.since); }

/* ---------------- escrita ---------------- */
function permitido_(eu, op) {
  const P = PERM[eu.papel];
  if (!P || eu.status !== 'Ativo') return 'Seu papel não permite alterar o inventário.';
  const T = TABS[op.t];
  if (!T || T.log || T.raw || !P[op.t]) return 'Sem permissão para alterar ' + op.t + '.';
  if (typeof op.id !== 'string' || !op.id || op.id.length > 80) return 'Identificador inválido.';
  const cols = [].concat(Object.keys(op.f || {}), Object.keys(op.i || {}));
  const ok = P[op.t] === '*' ? T.app : P[op.t];
  for (const c of cols) if (ok.indexOf(c) < 0) return 'Coluna não permitida: ' + op.t + '.' + c;
  for (const c of Object.keys(op.i || {})) if (!(INC[op.t] || []).includes(c) || typeof op.i[c] !== 'number') return 'Soma não permitida: ' + c;
  const av = ADMIN_VAL[op.t];
  if (av && eu.papel !== 'Admin') for (const c in av) if (op.f && av[c].indexOf(op.f[c]) >= 0) return 'Só um Admin pode fazer isso.';
  return '';
}
function acaoPush_(b, eu) {
  const ops = Array.isArray(b.ops) ? b.ops : [];
  if (ops.length > 400) throw erro_('dados', 'Envio grande demais.');
  for (const op of ops) { const m = permitido_(eu, op); if (m) throw erro_('permissao', m); }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const mov = ss_().getSheetByName('MOVIMENTOS');
    // lote já gravado (reenvio depois de falha de rede): não aplica de novo
    if (b.lote) {
      const c = CacheService.getScriptCache();
      if (c.get('lote:' + b.lote)) return opsDesde_(b.since);
    }
    const abas = {}, sujos = {};
    const db = {};
    const agora = agora_();
    const logs = [];
    ops.forEach((op, k) => {
      if (!abas[op.t]) {
        abas[op.t] = lerAba_(op.t); sujos[op.t] = {};
        db[op.t] = {}; abas[op.t].linhas.forEach(l => { db[op.t][l.o[TABS[op.t].k]] = l.o; });
      }
      const f = {};
      for (const c in (op.f || {})) f[c] = limpa(op.f[c]);
      const T = TABS[op.t];
      if (T.c.indexOf('atualizado_em') >= 0) { f.atualizado_em = agora; f.atualizado_por = eu.email; }
      const o = { t: op.t, id: limpa(op.id), f, i: op.i };
      const novo = applyOp(db, o);
      sujos[op.t][o.id] = true;
      logs.push([null, agora, eu.email, o.t, o.id, novo ? 'criar' : (o.i ? 'somar' : 'alterar'), JSON.stringify(k === 0 && b.ref ? { f: o.f, i: o.i, r: limpa(b.ref) } : { f: o.f, i: o.i }), k === 0 ? limpa(b.resumo || '') : '', limpa(b.lote || '')]);
    });
    // grava as linhas alteradas e anexa as novas
    for (const nome in sujos) {
      const a = abas[nome], novos = [];
      for (const id in sujos[nome]) {
        const o = db[nome][id], linha = a.hdr.map(h => o[h] !== undefined ? o[h] : '');
        const i = a.idx[id];
        if (i !== undefined) a.sh.getRange(a.linhas[i].r, 1, 1, a.hdr.length).setValues([linha]);
        else novos.push(linha);
      }
      if (novos.length) a.sh.getRange(a.sh.getLastRow() + 1, 1, novos.length, a.hdr.length).setValues(novos);
    }
    if (logs.length) {
      const r0 = mov.getLastRow();
      logs.forEach((l, i) => { l[0] = r0 + i; });
      mov.getRange(r0 + 1, 1, logs.length, logs[0].length).setValues(logs);
    }
    SpreadsheetApp.flush();
    if (b.lote) CacheService.getScriptCache().put('lote:' + b.lote, '1', 21600);
    return opsDesde_(b.since);
  } finally { lock.releaseLock(); }
}

/* ---------------- pessoas (Admin) ---------------- */
function acaoPessoas_(b, eu) {
  if (eu.papel !== 'Admin') throw erro_('permissao', 'Só Admin.');
  return { pessoas: lerAba_('USUARIOS').linhas.map(l => l.o) };
}
function acaoDefinirPessoa_(b, eu) {
  if (eu.papel !== 'Admin') throw erro_('permissao', 'Só Admin.');
  const email = String(b.email || '').toLowerCase();
  if (email === eu.email && (b.papel !== 'Admin' || b.status !== 'Ativo')) throw erro_('dados', 'Você não pode tirar o próprio acesso de Admin.');
  if (['Admin', 'Membro', 'Visitante'].indexOf(b.papel) < 0 || ['Ativo', 'Pendente', 'Bloqueado'].indexOf(b.status) < 0) throw erro_('dados', 'Papel ou status inválido.');
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const a = lerAba_('USUARIOS'), i = a.idx[email];
    if (i === undefined) throw erro_('dados', 'Pessoa não encontrada.');
    const o = a.linhas[i].o; o.papel = b.papel; o.status = b.status;
    a.sh.getRange(a.linhas[i].r, 1, 1, a.hdr.length).setValues([a.hdr.map(h => o[h] !== undefined ? o[h] : '')]);
    CacheService.getScriptCache().remove('usuarios');
  } finally { lock.releaseLock(); }
  return acaoPessoas_(b, eu);
}

/* ---------------- entrada HTTP ---------------- */
function doGet() { return json_({ ok: true, app: 'AeroRio Inventário', v: SCHEMA_V, rev: rev_() }); }
function doPost(e) {
  let b = {};
  try {
    b = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (b.a === 'ping') return json_({ ok: true, v: SCHEMA_V });
    if (b.a === 'auth') return json_(Object.assign({ ok: true }, acaoAuth_(b)));
    const eu = eu_(b.s);
    const f = { snap: acaoSnap_, pull: acaoPull_, push: acaoPush_, pessoas: acaoPessoas_, definirPessoa: acaoDefinirPessoa_ }[b.a];
    if (!f) throw erro_('dados', 'Ação desconhecida.');
    const out = f(b, eu);
    out.eu = eu;
    return json_(Object.assign({ ok: true }, out));
  } catch (err) {
    const code = err.code || 'servidor';
    if (code === 'servidor') console.error(err && err.stack || err);
    return json_({ ok: false, code, erro: code === 'servidor' ? 'Erro no servidor da planilha: ' + (err && err.message) : err.message });
  }
}

/* edição feita à mão na planilha: avisa os apps para recarregarem */
function onEdit(e) {
  try {
    const nome = e && e.range && e.range.getSheet().getName();
    if (!nome || !TABS[nome] || TABS[nome].log || nome === 'LEGADO') return;
    const lock = LockService.getDocumentLock();
    if (!lock.tryLock(5000)) return;
    try {
      const mov = ss_().getSheetByName('MOVIMENTOS'), r = mov.getLastRow();
      const email = (Session.getActiveUser && Session.getActiveUser().getEmail()) || '';
      mov.getRange(r + 1, 1, 1, 9).setValues([[r, agora_(), email, nome, '', 'edicao_manual', '', '', '']]);
    } finally { lock.releaseLock(); }
    if (nome === 'USUARIOS') CacheService.getScriptCache().remove('usuarios');
  } catch (err) { console.error(err); }
}

/* ---------------- menu e instalação ---------------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Inventário')
    .addItem('Instalar ou atualizar estrutura', 'instalar')
    .addItem('Configurar login', 'configurarLogin')
    .addItem('Importar da Central v2', 'importarV2')
    .addItem('Fazer cópia de segurança agora', 'copiaDeSeguranca')
    .addToUi();
}
function configurarLogin() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Configurar login', 'Cole o ID do cliente OAuth (termina em .apps.googleusercontent.com):', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const v = r.getResponseText().trim();
  if (!/\.apps\.googleusercontent\.com$/.test(v)) { ui.alert('Esse não parece um ID de cliente OAuth.'); return; }
  props_().setProperty('CLIENT_ID', v);
  ui.alert('Login configurado.');
}

function garanteAba_(nome, ordem) {
  const ss = ss_(), T = TABS[nome];
  let sh = ss.getSheetByName(nome);
  if (!sh) { sh = ss.insertSheet(nome, ordem); }
  if (T.raw) return sh;
  const lastC = Math.max(1, sh.getLastColumn());
  const hdr = sh.getRange(1, 1, 1, lastC).getValues()[0].map(h => String(h).trim());
  const falta = T.c.filter(c => hdr.indexOf(c) < 0);
  const vazio = hdr.every(h => !h);
  const cols = vazio ? T.c : hdr.concat(falta);
  if (vazio || falta.length) sh.getRange(1, 1, 1, cols.length).setValues([cols]);
  const hr = sh.getRange(1, 1, 1, cols.length);
  hr.setFontWeight('bold').setFontColor('#ffffff').setBackground(T.cor || '#0B1B2E');
  cols.forEach((c, i) => { if (T.d && T.d[c]) sh.getRange(1, i + 1).setNote(T.d[c]); });
  sh.setFrozenRows(1);
  // colunas de texto ficam como texto puro, para a planilha não converter datas e números sozinha
  cols.forEach((c, i) => {
    if (T.c.indexOf(c) < 0) return;
    const fmt = (T.num || []).indexOf(c) >= 0 ? '0.###' : '@';
    sh.getRange(2, i + 1, Math.max(1, sh.getMaxRows() - 1), 1).setNumberFormat(fmt);
  });
  sh.setTabColor(T.cor || null);
  return sh;
}
function semeia_(nome, linhas) {
  const sh = ss_().getSheetByName(nome);
  if (sh.getLastRow() > 1 || !linhas.length) return 0;
  const hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  sh.getRange(2, 1, linhas.length, hdr.length).setValues(linhas.map(o => hdr.map(h => o[h] !== undefined ? o[h] : '')));
  return linhas.length;
}
function instalar() {
  const ss = ss_();
  Object.keys(TABS).forEach((n, i) => garanteAba_(n, i));
  // tira a aba vazia padrão
  ss.getSheets().forEach(sh => { if (!TABS[sh.getName()] && sh.getLastRow() === 0 && ss.getSheets().length > 1 && /^(Sheet|Página|Planilha)\s?\d*$/i.test(sh.getName())) ss.deleteSheet(sh); });
  const n = {
    moveis: semeia_('MOVEIS', SEED.moveis.map(m => Object.assign({}, m))),
    partes: semeia_('PARTES', SEED.partes),
    etiquetas: semeia_('ETIQUETAS', SEED.etiquetas),
    classes: semeia_('CLASSES', SEED.classes),
  };
  // configuração: só acrescenta chaves que faltam
  const cfg = lerAba_('CONFIG');
  const novas = SEED.config.filter(c => cfg.idx[c.chave] === undefined);
  if (novas.length) cfg.sh.getRange(cfg.sh.getLastRow() + 1, 1, novas.length, cfg.hdr.length).setValues(novas.map(o => cfg.hdr.map(h => o[h] !== undefined ? o[h] : '')));
  const vi = lerAba_('CONFIG'); if (vi.idx.versao_esquema !== undefined) vi.sh.getRange(vi.linhas[vi.idx.versao_esquema].r, vi.hdr.indexOf('valor') + 1).setValue(String(SCHEMA_V));
  // quem instala é Admin
  const dono = (Session.getEffectiveUser().getEmail() || '').toLowerCase();
  const us = lerAba_('USUARIOS');
  if (dono && us.idx[dono] === undefined) us.sh.appendRow(us.hdr.map(h => ({ email: dono, nome: dono.split('@')[0], papel: 'Admin', status: 'Ativo', criado_em: agora_() })[h] || ''));
  // MOVIMENTOS: protegido com aviso; marca a mudança de estrutura para os apps recarregarem
  const mov = ss.getSheetByName('MOVIMENTOS');
  if (!mov.getProtections(SpreadsheetApp.ProtectionType.SHEET).length) mov.protect().setDescription('Gravado pelo app').setWarningOnly(true);
  const r = mov.getLastRow();
  mov.getRange(r + 1, 1, 1, 9).setValues([[r, agora_(), dono, '', '', 'estrutura', '', 'Estrutura da planilha instalada ou atualizada', '']]);
  segredo_();
  // cópia de segurança semanal
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'copiaAutomatica')) ScriptApp.newTrigger('copiaAutomatica').timeBased().everyDays(1).atHour(4).create();
  let msg = 'Estrutura pronta.';
  const leg = ss.getSheetByName('LEGADO');
  if (leg.getLastRow() < 2) { try { msg += '\n' + importarV2(true); } catch (err) { msg += '\nImportação da v2 não feita: ' + err.message; } }
  try { SpreadsheetApp.getUi().alert(msg + '\nSemeado: ' + JSON.stringify(n)); } catch (e) { console.log(msg, n); }
  return n;
}

/* importa da Central v2: observações dos móveis, endereços antigos, itens reais e o inventário antigo (LEGADO) */
function importarV2(silencioso) {
  const v2 = SpreadsheetApp.openById(ORIGEM_V2);
  const tabV2 = (nome, linhaCab) => {
    const sh = v2.getSheetByName(nome); if (!sh) return { hdr: [], rows: [] };
    const vals = sh.getDataRange().getValues();
    let h = linhaCab; if (h === undefined) h = vals.findIndex(r => r.some(v => String(v).trim() === 'ID' || String(v).trim() === 'ID DESTINO' || String(v).trim() === 'ID ANTIGO'));
    const hdr = vals[h].map(v => String(v).trim());
    return { hdr, rows: vals.slice(h + 1).filter(r => String(r[0]).trim()) };
  };
  const col = (t, nome) => t.hdr.indexOf(nome);
  const out = [];
  // 1. observações e id antigo dos móveis
  const mv = tabV2('MÓVEIS');
  const mov = lerAba_('MOVEIS');
  const mudM = [];
  mv.rows.forEach(r => {
    const id = String(r[col(mv, 'ID')]).trim(), obs = r[col(mv, 'OBSERVAÇÕES')], ant = r[col(mv, 'ID ANTERIOR')];
    const i = mov.idx[id];
    if (i !== undefined) {
      const o = mov.linhas[i].o;
      if (!o.observacoes && obs) { o.observacoes = String(obs); o.id_antigo = String(ant || ''); mudM.push(mov.linhas[i]); }
    } else {
      const o = { id, numero: '', nome: String(r[col(mv, 'NOME LEGÍVEL')]), laboratorio: String(r[col(mv, 'LABORATÓRIO')]), modelo: '', estado: id === 'MAN-008' ? 'Inativo' : 'A confirmar', observacoes: (id === 'MAN-008' ? 'Unido ao MAN-009 no modelo 3D (Estante com armário 10). ' : 'Ainda sem modelo 3D. ') + String(obs || ''), id_antigo: String(ant || '') };
      mov.sh.appendRow(mov.hdr.map(h => o[h] !== undefined ? o[h] : ''));
    }
  });
  mudM.forEach(l => mov.sh.getRange(l.r, 1, 1, mov.hdr.length).setValues([mov.hdr.map(h => l.o[h] !== undefined ? l.o[h] : '')]));
  out.push(mv.rows.length + ' móveis conferidos');
  // 2. endereços antigos nas partes (id + etiqueta antiga)
  const ds = tabV2('DESTINOS'), dmap = {};
  ds.rows.forEach(r => { dmap[String(r[col(ds, 'ID DESTINO')]).trim()] = String(r[col(ds, 'ETIQUETA ANTIGA')] || '').trim(); });
  const pa = lerAba_('PARTES');
  pa.linhas.forEach(l => {
    const pid = String(l.o.destino_antigo || '').split(' ')[0];
    if (pid && dmap[pid] !== undefined && l.o.destino_antigo === pid && dmap[pid]) {
      l.o.destino_antigo = pid + ' · ' + dmap[pid];
      pa.sh.getRange(l.r, pa.hdr.indexOf('destino_antigo') + 1).setValue(l.o.destino_antigo);
    }
  });
  // 3. itens reais da v2 (o "Teste" fica de fora)
  const it = tabV2('_ITENS');
  const cls = lerAba_('CLASSES').linhas.map(l => l.o);
  const classeDe = cat => { cat = String(cat || '').trim(); const c = cls.find(c => String(c.categorias_antigas).split(';').map(s => s.trim()).indexOf(cat) >= 0); return c ? c.nome : 'Diversos'; };
  const parteDe = {}; pa.linhas.forEach(l => { const p = String(l.o.destino_antigo || '').split(' ')[0]; if (p) parteDe[p] = l.o.id; });
  const itens = lerAba_('ITENS'), est = lerAba_('ESTOQUE');
  const novosI = [], novosE = [];
  it.rows.forEach(r => {
    const nome = String(r[col(it, 'ITEM')] || '').trim();
    const idv2 = String(r[col(it, 'ID')]).trim();
    if (!nome || /^teste$/i.test(nome) || itens.idx[idv2] !== undefined) return;
    const qtd = +r[col(it, 'QTD')] || 0;
    const espec = String(r[col(it, 'ESPECIFICAÇÃO')] || '');
    novosI.push({ id: idv2, nome, classe: classeDe(r[col(it, 'CATEGORIA')]), modo: 'Contável', unidade: String(r[col(it, 'UN')] || 'un'), minimo: +r[col(it, 'MÍNIMO')] || 0, descricao: '', especificacao: espec ? 'Especificação: ' + espec : '', observacoes: String(r[col(it, 'OBSERVAÇÃO')] || ''), estado: 'Ativo', criado_em: agora_() });
    novosE.push({ id: 'E-' + idv2, item: idv2, local: parteDe[String(r[col(it, 'DESTINO')]).trim()] || '', quantidade: qtd, estado: 'Ativo', guardado_em: agora_() });
  });
  if (novosI.length) {
    itens.sh.getRange(itens.sh.getLastRow() + 1, 1, novosI.length, itens.hdr.length).setValues(novosI.map(o => itens.hdr.map(h => o[h] !== undefined ? o[h] : '')));
    est.sh.getRange(est.sh.getLastRow() + 1, 1, novosE.length, est.hdr.length).setValues(novosE.map(o => est.hdr.map(h => o[h] !== undefined ? o[h] : '')));
  }
  out.push(novosI.length + ' itens importados');
  // 4. inventário antigo, como está, para triagem
  const lg = tabV2('_LEGADO');
  const leg = ss_().getSheetByName('LEGADO');
  if (leg.getLastRow() < 2 && lg.rows.length) {
    leg.clear();
    leg.getRange(1, 1, 1, lg.hdr.length).setValues([lg.hdr]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#7A8794');
    leg.getRange(2, 1, lg.rows.length, lg.hdr.length).setNumberFormat('@').setValues(lg.rows.map(r => r.map(v => v instanceof Date ? dataTxt(v.getTime()) : String(v))));
    leg.setFrozenRows(1);
    out.push(lg.rows.length + ' registros antigos em LEGADO');
  }
  const mov2 = ss_().getSheetByName('MOVIMENTOS'), r0 = mov2.getLastRow();
  mov2.getRange(r0 + 1, 1, 1, 9).setValues([[r0, agora_(), '', '', '', 'estrutura', '', 'Importação da Central v2: ' + out.join(', '), '']]);
  const msg = 'Importação da Central v2: ' + out.join(', ') + '.';
  if (!silencioso) try { SpreadsheetApp.getUi().alert(msg); } catch (e) { }
  return msg;
}

function copiaDeSeguranca() {
  const f = DriveApp.getFileById(ss_().getId());
  const pasta = f.getParents().hasNext() ? f.getParents().next() : DriveApp.getRootFolder();
  const it = pasta.getFoldersByName('Cópias de segurança do inventário');
  const destino = it.hasNext() ? it.next() : pasta.createFolder('Cópias de segurança do inventário');
  const nome = f.getName() + ' · cópia ' + agora_();
  f.makeCopy(nome, destino);
  props_().setProperty('ULTIMA_COPIA', String(Date.now()));
  return nome;
}
function copiaAutomatica() {
  const cfg = lerAba_('CONFIG'), i = cfg.idx.backup_dias;
  const dias = i !== undefined ? (+cfg.linhas[i].o.valor || 7) : 7;
  const ult = +props_().getProperty('ULTIMA_COPIA') || 0;
  if (Date.now() - ult >= dias * 864e5 - 36e5) copiaDeSeguranca();
}

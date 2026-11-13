// Simulação mínima do Apps Script para testar apps-script/Codigo.gs em Node.
import vm from 'vm'; import fs from 'fs'; import crypto from 'crypto';

class Range {
  constructor(sh, r, c, nr, nc) { Object.assign(this, { sh, r, c, nr, nc }); }
  getValues() { const out = []; for (let i = 0; i < this.nr; i++) { const row = []; for (let j = 0; j < this.nc; j++) { const v = (this.sh.d[this.r - 1 + i] || [])[this.c - 1 + j]; row.push(v === undefined ? '' : v); } out.push(row); } return out; }
  setValues(v) { if (v.length !== this.nr || v.some(r => r.length !== this.nc)) throw new Error(`setValues: tamanho ${v.length}x${v[0] && v[0].length} ≠ ${this.nr}x${this.nc}`); v.forEach((row, i) => row.forEach((x, j) => this.sh.set(this.r + i, this.c + j, this.sh.coerce(this.c + j, x)))); return this; }
  setValue(x) { this.sh.set(this.r, this.c, this.sh.coerce(this.c, x)); return this; }
  setNumberFormat(f) { for (let j = 0; j < this.nc; j++) this.sh.fmt[this.c + j] = f; return this; }
  setFontWeight() { return this; } setFontColor() { return this; } setBackground() { return this; } setNote() { return this; }
}
class Sheet {
  constructor(name) { this.name = name; this.d = []; this.fmt = {}; this.prot = []; }
  getName() { return this.name; }
  set(r, c, v) { while (this.d.length < r) this.d.push([]); const row = this.d[r - 1]; while (row.length < c) row.push(''); row[c - 1] = v; }
  // a planilha de verdade converte texto com cara de data/número quando a célula não é texto puro
  coerce(c, v) { if (this.fmt[c] === '@') return v; if (typeof v === 'string' && /^\d{4}-\d\d-\d\d( \d\d:\d\d)?$/.test(v)) return new Date(v.replace(' ', 'T')); if (typeof v === 'string' && v !== '' && !isNaN(+v) && this.fmt[c] !== '@') return +v; return v; }
  getLastRow() { let n = this.d.length; while (n > 0 && this.d[n - 1].every(v => v === '' || v == null)) n--; return n; }
  getLastColumn() { return Math.max(0, ...this.d.map(r => { let n = r.length; while (n > 0 && (r[n - 1] === '' || r[n - 1] == null)) n--; return n; })); }
  getMaxRows() { return Math.max(1000, this.d.length); }
  getDataRange() { return new Range(this, 1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }
  getRange(r, c, nr = 1, nc = 1) { if (r < 1 || c < 1 || nr < 1 || nc < 1) throw new Error(`getRange inválido ${r},${c},${nr},${nc}`); return new Range(this, r, c, nr, nc); }
  appendRow(a) { const r = this.getLastRow() + 1; a.forEach((v, j) => this.set(r, j + 1, this.coerce(j + 1, v))); return this; }
  setFrozenRows() { return this; } setTabColor() { return this; } clear() { this.d = []; return this; }
  getProtections() { return this.prot; }
  protect() { const p = { setDescription() { return p; }, setWarningOnly() { return p; } }; this.prot.push(p); return p; }
}
class SS {
  constructor(id, name) { this.id = id; this.name = name; this.sheets = [new Sheet('Página1')]; }
  getId() { return this.id; }
  getSheetByName(n) { return this.sheets.find(s => s.name === n) || null; }
  getSheets() { return [...this.sheets]; }
  insertSheet(n, i) { const s = new Sheet(n); this.sheets.splice(i ?? this.sheets.length, 0, s); return s; }
  deleteSheet(s) { this.sheets = this.sheets.filter(x => x !== s); }
}
export function carregaV2() {
  const real = new URL('./v2.json', import.meta.url);
  const j = JSON.parse(fs.readFileSync(fs.existsSync(real) ? real : new URL('./v2-exemplo.json', import.meta.url)));
  const ss = new SS('v2', 'Central v2'); ss.sheets = [];
  for (const [n, rows] of Object.entries(j)) { const sh = new Sheet(n); sh.d = rows.map(r => r.map(v => typeof v === 'string' && /^\d{4}-\d\d-\d\dT/.test(v) ? new Date(v) : v)); ss.sheets.push(sh); }
  return ss;
}
export function criaGas({ clientId = 'cliente-teste.apps.googleusercontent.com', dono = 'aerorio2024@gmail.com' } = {}) {
  const ss = new SS('nova', 'AeroRio | Inventário'), v2 = carregaV2();
  const P = {}, C = {};
  const b64 = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  const ctx = {
    console, JSON, Math, Date, Object, Array, String, Number, isNaN, isFinite, Error, encodeURIComponent, RegExp,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, openById: id => { if (id !== '18nnMwZ-tkshcNx-mvvQBCbvU7l9ihCHyYS4MIseDGtY') throw new Error('sem acesso'); return v2; }, flush() { }, getUi() { throw new Error('sem interface'); }, ProtectionType: { SHEET: 'SHEET' } },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => P[k] ?? null, setProperty: (k, v) => { P[k] = String(v); } }) },
    CacheService: { getScriptCache: () => ({ get: k => C[k] ?? null, put: (k, v) => { C[k] = v; }, remove: k => { delete C[k]; } }) },
    LockService: { getScriptLock: () => ({ waitLock() { }, tryLock: () => true, releaseLock() { } }), getDocumentLock: () => ({ waitLock() { }, tryLock: () => true, releaseLock() { } }) },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      computeHmacSha256Signature: (v, k) => [...crypto.createHmac('sha256', k).update(v).digest()],
      base64EncodeWebSafe: x => b64(typeof x === 'string' ? Buffer.from(x, 'utf8') : Buffer.from(x.map(b => b & 255))),
      base64DecodeWebSafe: s => [...Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')],
      newBlob: bytes => ({ getDataAsString: () => Buffer.from(bytes).toString('utf8') }),
    },
    UrlFetchApp: { fetch: url => { const tok = decodeURIComponent(url.split('id_token=')[1]); if (!tok.startsWith('tok:')) return { getResponseCode: () => 400, getContentText: () => '{}' }; const [, email, aud] = tok.split(':'); return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ aud: aud || clientId, email, email_verified: 'true', name: email.split('@')[0] }) }; } },
    Session: { getEffectiveUser: () => ({ getEmail: () => dono }), getActiveUser: () => ({ getEmail: () => dono }) },
    ContentService: { createTextOutput: s => ({ s, setMimeType() { return this; } }), MimeType: { JSON: 'json' } },
    ScriptApp: { getProjectTriggers: () => [], newTrigger: () => { const t = { timeBased: () => t, everyDays: () => t, atHour: () => t, create: () => t }; return t; } },
    DriveApp: {},
  };
  vm.createContext(ctx);
  const code = fs.readFileSync(new URL('../apps-script/Codigo.gs', import.meta.url), 'utf8').replace("const CLIENT_ID = '';", `const CLIENT_ID = '${clientId}';`);
  vm.runInContext(code, ctx, { filename: 'Codigo.gs' });
  const post = body => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).s);
  return { ctx, ss, v2, post, P, C };
}

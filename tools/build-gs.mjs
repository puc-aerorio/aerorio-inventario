// Gera apps-script/Codigo.gs: esquema compartilhado + seed da planilha + servidor.
import fs from 'fs'; import { execSync } from 'child_process';
const strip = s => s.replace(/^import .*$/gm, '').replace(/^export /gm, '');
const schema = strip(fs.readFileSync('src/data/schema.js', 'utf8'));
const main = fs.readFileSync('server/main.js', 'utf8');
const seed = execSync('node tools/seed.mjs').toString();
const head = main.split('\n').slice(0, 6).join('\n');
const body = main.split('\n').slice(6).join('\n');
const out = `${head}\n\n/* ---------------- esquema (src/data/schema.js) ---------------- */\n${schema}\n/* ---------------- estrutura inicial (gerada do modelo 3D) ---------------- */\nconst SEED = ${seed};\n${body}`;
fs.mkdirSync('apps-script', { recursive: true });
fs.writeFileSync('apps-script/Codigo.gs', out);
console.log('apps-script/Codigo.gs', out.length, 'bytes');

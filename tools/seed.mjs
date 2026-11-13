// Gera o seed da planilha nova a partir do modelo 3D (src/app/data.js) — só estrutura, sem os itens de demonstração.
import { M, ETQ, CARD } from '../src/app/data.js';
import { MOVEL_ID, DESTINO_V2, CLASSES, CONFIG } from '../src/data/mapa.js';
const r3 = v => Math.round(v * 1000) / 1000;
const LABN = { man: 'Manufatura', ele: 'Eletrônica' };
const moveis = [], partes = [];
for (const m of M) {
  const id = MOVEL_ID[m.id]; if (!id) throw new Error('sem id na planilha: ' + m.id);
  moveis.push({ id, numero: m.cod, nome: m.nome, laboratorio: LABN[m.lab], modelo: m.id, x: r3(m.pos[0]), y: r3(m.pos[1]), z: r3(m.pos[2]), rotacao: ((Math.round(m.rot * 180 / Math.PI) % 360) + 360) % 360, etiqueta: m.etq ? ETQ.find(e => e.id === m.etq).t : '', estado: 'Ativo' });
  for (const p of m.partes) {
    const etq = p.etq ? ETQ.find(e => e.id === p.etq).t : '';
    partes.push({ id: `${id}.${p.id}`, movel: id, chave: p.id, nome: p.etqNome ? '' : (p.nomeP || ''), etiqueta: etq, destino_antigo: DESTINO_V2[`${m.id}.${p.id}`] || '' });
  }
}
const etiquetas = [{ id: 'ETQ-001', texto: 'GAVETEIRO AZUL', estado: 'Ativa' }, ...CARD.map((t, i) => ({ id: 'ETQ-' + String(i + 2).padStart(3, '0'), texto: t, estado: 'Ativa' }))];
// as etiquetas do seed precisam existir no catálogo
for (const p of [...moveis, ...partes]) if (p.etiqueta && !etiquetas.some(e => e.texto === p.etiqueta)) throw new Error('etiqueta fora do catálogo: ' + p.etiqueta);
const classes = CLASSES.map(([id, nome, icone, cor, modo_padrao, campos, palavras, categorias_antigas]) => ({ id, nome, icone, cor, modo_padrao, campos, palavras, categorias_antigas }));
const config = CONFIG.map(([chave, valor, descricao]) => ({ chave, valor, descricao }));
const out = { moveis, partes, etiquetas, classes, config, movelV2: Object.fromEntries(Object.entries(MOVEL_ID).map(([k, v]) => [v, k])) };
process.stdout.write(JSON.stringify(out));

import assert from 'assert/strict';
import { criaGas } from './gas-mock.mjs';
const g = criaGas();
const n = g.ctx.instalar();
assert.equal(n.moveis, 19); assert.equal(n.partes, 58); assert.equal(n.classes, 12);
const tab = nome => g.ss.getSheetByName(nome);
const nLeg = g.v2.getSheetByName('_LEGADO').d.slice(6).filter(r => r[0]).length;
assert.equal(tab('LEGADO').getLastRow(), nLeg + 1, 'LEGADO com todos os registros antigos');
assert.ok(!g.ss.getSheetByName('Página1'), 'aba padrão removida');
// móveis da v2 sem modelo entram como A confirmar / Inativo
const mv = tab('MOVEIS').getDataRange().getValues();
assert.ok(mv.some(r => r[0] === 'MAN-016' && r.includes('A confirmar')));
assert.ok(mv.some(r => r[0] === 'MAN-012' && String(r[11]).includes('Oito gavetas')), 'observação importada');
const pa = tab('PARTES').getDataRange().getValues();
assert.ok(pa.some(r => r[0] === 'MAN-012.G1' && String(r[8]).startsWith('P-0019 · Limas')), 'destino antigo com etiqueta');
// instalar de novo não duplica
g.ctx.instalar();
assert.equal(tab('MOVEIS').getLastRow(), 22); assert.equal(tab('PARTES').getLastRow(), 59);

// login
assert.equal(g.post({ a: 'auth', idToken: 'ruim' }).ok, false);
assert.equal(g.post({ a: 'auth', idToken: 'tok:x@y.com:outro-app' }).code, 'auth');
const adm = g.post({ a: 'auth', idToken: 'tok:aerorio2024@gmail.com' });
assert.equal(adm.ok, true); assert.equal(adm.eu.papel, 'Admin');
const novo = g.post({ a: 'auth', idToken: 'tok:fulano@gmail.com' });
assert.equal(novo.eu.status, 'Pendente'); assert.equal(novo.eu.papel, 'Visitante');
assert.equal(g.post({ a: 'snap', s: 'xx.yy' }).code, 'sessao');
const adulterada = novo.sessao.replace(/^./, c => c === 'a' ? 'b' : 'a');
assert.equal(g.post({ a: 'snap', s: adulterada }).code, 'sessao');

// snapshot
const sn = g.post({ a: 'snap', s: adm.sessao });
assert.equal(sn.ok, true); assert.equal(sn.tabs.MOVEIS.length, 21); assert.equal(sn.pendentes, 1);
assert.ok(sn.tabs.CLASSES.find(c => c.id === 'prop'));
const rev0 = sn.rev;

// pendente não grava
const neg = g.post({ a: 'push', s: novo.sessao, since: rev0, lote: 'L0', ops: [{ t: 'ITENS', id: 'I1', f: { nome: 'x' } }] });
assert.equal(neg.code, 'permissao');
// admin aprova como Membro
const pes = g.post({ a: 'definirPessoa', s: adm.sessao, email: 'fulano@gmail.com', papel: 'Membro', status: 'Ativo' });
assert.ok(pes.pessoas.find(p => p.email === 'fulano@gmail.com' && p.status === 'Ativo'));
assert.equal(g.post({ a: 'definirPessoa', s: adm.sessao, email: 'aerorio2024@gmail.com', papel: 'Membro', status: 'Ativo' }).code, 'dados', 'não tira o próprio admin');

// membro cria item + estoque e guarda
const ops1 = [
  { t: 'ITENS', id: 'I1', f: { nome: 'Cola <b>CA</b>', classe: 'Adesivos e químicos', modo: 'Contável', unidade: 'frascos', minimo: 2, estado: 'Ativo', criado_em: '2026-11-12 10:00' } },
  { t: 'ESTOQUE', id: 'E1', f: { item: 'I1', local: 'MAN-010.P1', quantidade: 3, estado: 'Ativo', guardado_em: '2026-11-12 10:00' } },
];
const r1 = g.post({ a: 'push', s: novo.sessao, since: rev0, lote: 'L1', ops: ops1, resumo: 'Cadastrado: Cola CA' });
assert.equal(r1.ok, true, r1.erro); assert.equal(r1.rev, rev0 + 2); assert.equal(r1.ops.length, 2);
assert.equal(r1.ops[0].f.nome, 'Cola bCA/b', 'marcação removida');
// datas continuam texto
const it = tab('ITENS').getDataRange().getValues();
assert.equal(typeof it[1][12], 'string', 'criado_em não virou Date');
// reenvio do mesmo lote não duplica
const r1b = g.post({ a: 'push', s: novo.sessao, since: rev0, lote: 'L1', ops: ops1 });
assert.equal(r1b.rev, rev0 + 2);
// duas pessoas somam ao mesmo tempo (soma, não substitui)
g.post({ a: 'push', s: novo.sessao, since: r1.rev, lote: 'L2', ops: [{ t: 'ESTOQUE', id: 'E1', i: { quantidade: -1 } }] });
const r3 = g.post({ a: 'push', s: adm.sessao, since: r1.rev, lote: 'L3', ops: [{ t: 'ESTOQUE', id: 'E1', i: { quantidade: -1 } }] });
assert.equal(r3.ops.length, 2, 'devolve as operações dos outros também');
const est = tab('ESTOQUE').getDataRange().getValues();
assert.equal(est[1][3], 1, 'quantidade 3 - 1 - 1');
// membro não pode apagar cadastro nem mover móvel
assert.equal(g.post({ a: 'push', s: novo.sessao, since: 0, ops: [{ t: 'ITENS', id: 'I1', f: { estado: 'Removido' } }] }).code, 'permissao');
assert.equal(g.post({ a: 'push', s: novo.sessao, since: 0, ops: [{ t: 'MOVEIS', id: 'MAN-001', f: { x: 1 } }] }).code, 'permissao');
assert.equal(g.post({ a: 'push', s: novo.sessao, since: 0, ops: [{ t: 'MOVEIS', id: 'MAN-001', f: { etiqueta: 'GAVETEIRO AZUL' } }] }).ok, true);
assert.equal(g.post({ a: 'push', s: novo.sessao, since: 0, ops: [{ t: 'ESTOQUE', id: 'E1', f: { atualizado_por: 'x' } }] }).code, 'permissao', 'coluna fora do app');
assert.equal(g.post({ a: 'push', s: adm.sessao, since: 0, ops: [{ t: 'MOVEIS', id: 'MAN-001', f: { x: 1.5, rotacao: 90 } }] }).ok, true);
// pull
const pl = g.post({ a: 'pull', s: novo.sessao, since: rev0 });
assert.equal(pl.ops.length, pl.rev - rev0);
assert.equal(g.post({ a: 'pull', s: novo.sessao, since: pl.rev }).ops.length, 0);
// edição manual força recarregar
g.ctx.onEdit({ range: { getSheet: () => tab('ITENS') } });
assert.equal(g.post({ a: 'pull', s: novo.sessao, since: pl.rev }).recarregar, true);
// histórico vem no snapshot
const sn2 = g.post({ a: 'snap', s: novo.sessao });
assert.ok(sn2.hist.some(h => h.resumo === 'Cadastrado: Cola CA'));
assert.equal(sn2.tabs.ESTOQUE.find(e => e.id === 'E1').quantidade, 1);
assert.equal(typeof sn2.tabs.MOVEIS.find(m => m.id === 'MAN-001').x, 'number');
console.log('servidor: todos os testes passaram · rev', sn2.rev);

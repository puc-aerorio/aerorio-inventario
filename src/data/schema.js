/* Esquema da planilha do inventário.
   Este arquivo é compartilhado: o site usa e o Apps Script recebe uma cópia na hora do build (npm run gs).
   Regra da planilha: abas e cabeçalhos da linha 1 não mudam de nome; colunas extras são livres; nunca apagar linha
   (para tirar de uso, troque estado/situação). */

export const SCHEMA_V = 1;

/* k = coluna-chave · c = colunas na ordem de criação · app = colunas que o site escreve (as outras são só da planilha)
   num = colunas numéricas · d = descrição que vai como nota no cabeçalho */
export const TABS = {
  MOVEIS: {
    k: 'id', cor: '#0B1B2E',
    c: ['id', 'numero', 'nome', 'laboratorio', 'modelo', 'x', 'y', 'z', 'rotacao', 'etiqueta', 'estado', 'observacoes', 'id_antigo', 'atualizado_em', 'atualizado_por'],
    app: ['x', 'y', 'z', 'rotacao', 'etiqueta'],
    num: ['x', 'y', 'z', 'rotacao'],
    d: {
      id: 'Código fixo do móvel. Não mude.',
      numero: 'Número da placa física. Móveis sem placa a partir de 11.',
      nome: 'Nome que aparece no app. Pode editar aqui.',
      modelo: 'Modelo 3D usado no app. Não mude.',
      x: 'Posição em metros, gravada pelo app (Admin › Editar posições).',
      rotacao: 'Graus, múltiplos de 90.',
      estado: 'Ativo, A confirmar ou Inativo.',
    },
  },
  PARTES: {
    k: 'id', cor: '#0B1B2E',
    c: ['id', 'movel', 'chave', 'nome', 'etiqueta', 'cheia', 'conferido_em', 'conferido_por', 'destino_antigo', 'atualizado_em', 'atualizado_por'],
    app: ['nome', 'etiqueta', 'cheia', 'conferido_em', 'conferido_por'],
    num: [],
    d: {
      id: 'Móvel + chave da parte. Não mude.',
      chave: 'Parte no modelo 3D (T tampo, G gaveta, P prateleira, PE/PD portas, U embaixo, A em cima, L lugar).',
      nome: 'Nome da parte. Vazio = nome automático.',
      cheia: '"Sim" quando marcada como cheia no app.',
      destino_antigo: 'Endereço equivalente na Central v2 (só referência).',
    },
  },
  ORGANIZADORES: {
    k: 'id', cor: '#1E9E6A',
    c: ['id', 'nome', 'tipo', 'cor', 'tamanho', 'etiqueta', 'local', 'estado', 'atualizado_em', 'atualizado_por'],
    app: ['nome', 'tipo', 'cor', 'tamanho', 'etiqueta', 'local', 'estado'],
    num: [],
    d: {
      tipo: 'Um dos 9 tipos do app (caixa transparente com travas, maleta rígida...).',
      tamanho: 'P, M ou G.',
      local: 'Id da parte onde está (aba PARTES). Vazio = sem lugar.',
      estado: 'Ativo ou Removido.',
    },
  },
  ITENS: {
    k: 'id', cor: '#E07A1F',
    c: ['id', 'nome', 'classe', 'modo', 'unidade', 'minimo', 'descricao', 'especificacao', 'identificador', 'modelo_3d', 'observacoes', 'estado', 'criado_em', 'atualizado_em', 'atualizado_por'],
    app: ['nome', 'classe', 'modo', 'unidade', 'minimo', 'descricao', 'especificacao', 'identificador', 'modelo_3d', 'observacoes', 'estado', 'criado_em'],
    num: ['minimo'],
    d: {
      id: 'Catálogo: um item é um tipo de coisa. Onde ele está fica na aba ESTOQUE.',
      classe: 'Nome de uma classe da aba CLASSES.',
      modo: 'Unidades (patrimônio numerado), Contável (consumível) ou Conjunto (a granel, kit).',
      especificacao: 'Campo: valor; Campo: valor',
      identificador: 'O que diferencia as unidades. Ex.: Cor: Amarelo=#E0B12E, Vermelho=#C8553D',
      estado: 'Ativo ou Removido.',
    },
  },
  ESTOQUE: {
    k: 'id', cor: '#E07A1F',
    c: ['id', 'item', 'local', 'quantidade', 'nivel', 'tipos', 'aberto_em', 'nao_encontrado', 'guardado_em', 'estado', 'atualizado_em', 'atualizado_por'],
    app: ['item', 'local', 'quantidade', 'nivel', 'tipos', 'aberto_em', 'nao_encontrado', 'guardado_em', 'estado'],
    num: ['quantidade'],
    d: {
      id: 'Uma linha por lugar onde um item está.',
      local: 'Id de uma parte (PARTES) ou de um organizador (ORGANIZADORES). Vazio = sem lugar.',
      quantidade: 'Só para itens Contáveis.',
      nivel: 'Só para Conjunto: Vazio, Pouco, Médio ou Cheio.',
      tipos: 'Só para Conjunto: M3; M4; M5 (falta) ',
      nao_encontrado: '"Sim" quando alguém marcou Não encontrei.',
      estado: 'Ativo ou Removido.',
    },
  },
  UNIDADES: {
    k: 'id', cor: '#E07A1F',
    c: ['id', 'item', 'estoque', 'numero', 'identificador', 'estado', 'com_quem', 'tipo_emprestimo', 'desde', 'prazo', 'situacao', 'atualizado_em', 'atualizado_por'],
    app: ['item', 'estoque', 'numero', 'identificador', 'estado', 'com_quem', 'tipo_emprestimo', 'desde', 'prazo', 'situacao'],
    num: ['numero'],
    d: {
      id: 'Só para itens por Unidades (patrimônio).',
      estoque: 'Id da linha de ESTOQUE onde a unidade está.',
      estado: 'Boa, Desgastada, Quebrada ou Em manutenção.',
      com_quem: 'Preenchido quando emprestada.',
      situacao: 'Ativa ou Baixada.',
    },
  },
  COMPRAS: {
    k: 'id', cor: '#8E5BD0',
    c: ['id', 'item', 'estoque', 'quantidade', 'motivo', 'status', 'fornecedor', 'link', 'preco', 'pedido_em', 'pedido_por', 'comprado_em', 'atualizado_em', 'atualizado_por'],
    app: ['item', 'estoque', 'quantidade', 'motivo', 'status', 'pedido_em', 'pedido_por', 'comprado_em'],
    num: ['quantidade'],
    d: { status: 'Na lista, Comprado ou Removida.', fornecedor: 'Livre, só na planilha.' },
  },
  ETIQUETAS: {
    k: 'id', cor: '#5B6B7F',
    c: ['id', 'texto', 'estado'],
    app: ['texto', 'estado'],
    num: [],
    d: { texto: 'Exatamente o que está escrito no laboratório.', estado: 'Ativa ou Inativa.' },
  },
  CLASSES: {
    k: 'id', cor: '#5B6B7F',
    c: ['id', 'nome', 'icone', 'cor', 'modo_padrao', 'campos', 'palavras', 'categorias_antigas'],
    app: [],
    num: [],
    d: {
      id: 'Código fixo. Não mude.',
      nome: 'Se renomear, renomeie também na coluna classe da aba ITENS.',
      icone: 'Um dos ícones do app: wrench, bolt, ruler, chip, prop, screw, drop, layers, cube, plane, shield, dots.',
      campos: 'Campos sugeridos no cadastro, separados por ;',
      palavras: 'Palavras que fazem o app sugerir esta classe, separadas por |',
      categorias_antigas: 'Categorias da Central v2 e do inventário antigo que viram esta classe.',
    },
  },
  USUARIOS: {
    k: 'email', cor: '#D2483F',
    c: ['email', 'nome', 'papel', 'status', 'criado_em', 'ultimo_acesso'],
    app: [],
    num: [],
    d: { papel: 'Admin, Membro ou Visitante.', status: 'Ativo, Pendente ou Bloqueado. Pendente só vê.' },
  },
  CONFIG: {
    k: 'chave', cor: '#5B6B7F',
    c: ['chave', 'valor', 'descricao'],
    app: ['valor'],
    num: [],
    d: {},
  },
  MOVIMENTOS: {
    log: true, cor: '#7A8794',
    c: ['rev', 'data', 'email', 'tabela', 'id', 'operacao', 'dados', 'resumo', 'lote'],
    num: ['rev'],
    d: { rev: 'Gravado pelo app. Não edite, não ordene e não apague linhas desta aba.' },
  },
  LEGADO: { raw: true, cor: '#7A8794', c: [], d: {} },
};

/* abas que o site carrega */
export const SYNC = ['MOVEIS', 'PARTES', 'ORGANIZADORES', 'ITENS', 'ESTOQUE', 'UNIDADES', 'COMPRAS', 'ETIQUETAS', 'CLASSES', 'CONFIG'];
/* quantidade de contável: enviada como soma, para dois cliques simultâneos não se perderem */
export const INC = { ESTOQUE: ['quantidade'] };
/* o que cada papel pode gravar ('*' = todas as colunas do app) */
export const PERM = {
  Membro: { PARTES: '*', ORGANIZADORES: '*', ITENS: '*', ESTOQUE: '*', UNIDADES: '*', ETIQUETAS: '*', MOVEIS: ['etiqueta'] },
  Admin: { MOVEIS: '*', PARTES: '*', ORGANIZADORES: '*', ITENS: '*', ESTOQUE: '*', UNIDADES: '*', ETIQUETAS: '*', COMPRAS: '*', CONFIG: '*' },
};
/* valores que só o Admin grava */
export const ADMIN_VAL = { ITENS: { estado: ['Removido'] } };
/* o que vale como "fora de uso" em cada aba */
export const OFF = { MOVEIS: ['Inativo'], ORGANIZADORES: ['Removido'], ITENS: ['Removido'], ESTOQUE: ['Removido'], UNIDADES: ['Baixada'], COMPRAS: ['Removida', 'Comprado'], ETIQUETAS: ['Inativa'] };
export const OFFCOL = { MOVEIS: 'estado', ORGANIZADORES: 'estado', ITENS: 'estado', ESTOQUE: 'estado', UNIDADES: 'situacao', COMPRAS: 'status', ETIQUETAS: 'estado' };
export const OFFVAL = { ORGANIZADORES: 'Removido', ITENS: 'Removido', ESTOQUE: 'Removido', UNIDADES: 'Baixada', COMPRAS: 'Removida', ETIQUETAS: 'Inativa' };

/* aplica uma operação num banco {ABA: {id: linha}}. Usado igual no site e no servidor. */
export function applyOp(db, op) {
  const T = db[op.t] || (db[op.t] = {});
  let r = T[op.id];
  const novo = !r;
  if (!r) { r = T[op.id] = {}; r[TABS[op.t].k] = op.id; }
  if (op.f) for (const k in op.f) r[k] = op.f[k];
  if (op.i) for (const k in op.i) r[k] = Math.round(((+r[k] || 0) + op.i[k]) * 1000) / 1000;
  return novo;
}

/* texto vindo de fora nunca carrega marcação */
export function limpa(v) {
  if (typeof v === 'number') return isFinite(v) ? v : '';
  if (v == null) return '';
  return String(v).replace(/[<>]/g, '').slice(0, 2000);
}

/* data local no formato da planilha */
export function dataTxt(ms) {
  if (!ms) return '';
  const d = new Date(ms), z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`;
}
export function dataMs(s) {
  if (!s) return 0;
  if (typeof s === 'number') return s;
  let m = String(s).match(/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d))?/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)).getTime();
  m = String(s).match(/^(\d\d)\/(\d\d)\/(\d{4})(?: (\d\d):(\d\d))?/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0)).getTime();
  const t = Date.parse(s);
  return isNaN(t) ? 0 : t;
}

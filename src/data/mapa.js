/* Ligação entre o modelo 3D (id do móvel no app) e a planilha. Usado pelo seed da planilha nova. */
export const MOVEL_ID = {
  central: 'MAN-001', pc: 'MAN-002', serra: 'MAN-003', s06: 'MAN-004', b06: 'MAN-005', s07: 'MAN-006', b07: 'MAN-007',
  e10: 'MAN-009', colas: 'MAN-010', s09: 'MAN-011', gazul: 'MAN-012', a9: 'MAN-013', flag: 'MAN-014', materiais: 'MAN-015',
  carrinho: 'MAN-017', vao: 'MAN-018', lixo: 'MAN-019', bel: 'ELE-001', est2: 'ELE-002',
};
/* endereço equivalente na Central v2 (aba DESTINOS) */
export const DESTINO_V2 = {
  'central.T': 'P-0001', 'pc.T': 'P-0002', 'serra.T': 'P-0003', 'b06.T': 'P-0004', 'b07.T': 'P-0005',
  's06.PE': 'P-0006', 's07.PE': 'P-0007', 's09.PE': 'P-0008', 'e10.P3': 'P-0009', 'colas.P1': 'P-0010', 'a9.P1': 'P-0011',
  'flag.PE': 'P-0012', 'materiais.L': 'P-0013', 'serra.G1': 'P-0015', 'serra.G2': 'P-0016', 'b06.G1': 'P-0017', 'b06.G2': 'P-0018',
  'gazul.G1': 'P-0019', 'gazul.G2': 'P-0020', 'gazul.G3': 'P-0021', 'gazul.G4': 'P-0022', 'gazul.G5': 'P-0023', 'gazul.G6': 'P-0024',
  'gazul.G7': 'P-0025', 'gazul.G8': 'P-0026', 'e10.P1': 'P-0027', 'e10.P2': 'P-0028',
};
/* classes: une as classes do app (ícone e cor) com as categorias da Central v2 e do inventário antigo */
export const CLASSES = [
  ['ferr', 'Ferramenta manual', 'wrench', '#E07A1F', 'Unidades', 'Marca; Medida', 'broca|chave|lima|estilete|tesoura|alicate|martelo|serrote|grampo|pinca|faca|espatula|torques', 'Ferramentas e máquinas; Ferramentas'],
  ['elet', 'Ferramenta elétrica e máquina', 'bolt', '#D9A400', 'Unidades', 'Marca; Potência', 'furadeira|parafusadeira|dremel|retifica|solda|soprador|tupia|lixadeira|serra de fita|tico|esmeril|impressora', 'Ferramentas e máquinas; Máquinas'],
  ['med', 'Medição', 'ruler', '#1585A3', 'Unidades', 'Faixa; Resolução', 'paquimetro|regua|trena|balanca|micrometro|nivel|multimetro|esquadro|wattimetro|tacometro', ''],
  ['eletro', 'Eletrônica', 'chip', '#1E9E6A', 'Contável', 'Tipo; Especificação', 'resistor|capacitor|conector|placa|arduino|led|sensor|display|gps|regulador|modulo|shield|fonte|fio|cabo|jst|xt60|giroscopio|acelerometro', 'Eletrônica; Componentes Eletrônicos (ELE); Arduino e Compatíveis (ARD); Sensores (SEN); Displays (DIS); Módulos GPS (GPS); Fontes e Módulos de Alimentação (FON); Giroscópios (GIR); Shields e Adaptadores (SHD)'],
  ['prop', 'Propulsão e rádio', 'prop', '#3D63C9', 'Unidades', 'Especificação; Marca', 'motor|helice|servo|esc|bateria|lipo|radio|receptor|transmissor|telemetria|antena|brushless|controlador', 'Servos (SER); Motores (MOT); Hélices (HEL); Baterias (BAT); Controladores (CON); Telemetria e Comunicação (TEL); Antenas (ANT)'],
  ['fix', 'Fixação', 'screw', '#5B6B7F', 'Conjunto', 'Tipos', 'parafuso|porca|arruela|rebite|abracadeira|pino|mola|nylon|presilha', 'Ferragens e fixação'],
  ['quim', 'Adesivos e químicos', 'drop', '#8E5BD0', 'Contável', 'Validade; Rendimento', 'cola|epoxi|resina|tinta|fita|primer|solvente|thinner|lubrificante|alcool|desmoldante', 'Consumíveis'],
  ['mat', 'Materiais e compósitos', 'layers', '#A0703C', 'Contável', 'Dimensão; Espessura', 'balsa|carbono|madeira|espuma|tecido|fibra|chapa|tubo|compensado|depron|isopor|vareta|perfil|monokote|entelagem', 'Materiais e compósitos'],
  ['imp', 'Impressão 3D', 'cube', '#C2448A', 'Contável', 'Material; Cor', 'filamento|pla|abs|petg|tpu|bico|mesa aquecida', 'Impressão 3D'],
  ['aero', 'Estruturas e aeronaves', 'plane', '#4F7F3A', 'Unidades', 'Projeto; Ano', 'asa|fuselagem|empenagem|trem de pouso|aviao|aeronave|longarina|nervura|trofeu|prototipo', 'Estruturas e aeronaves'],
  ['epi', 'EPI e proteção', 'shield', '#D2483F', 'Contável', 'Tamanho', 'luva|oculos|mascara|protetor|avental|respirador|extintor', 'Proteção e apoio; EPI´s'],
  ['div', 'Diversos', 'dots', '#7A8794', 'Contável', 'Especificação', '', 'A classificar; Outros (OUT)'],
];
export const CONFIG = [
  ['versao_esquema', '1', 'Versão da estrutura da planilha. Gravado pelo instalador.'],
  ['recado', 'Reunião quinta 18h | Não deixar a serra ligada', 'Recado do quadro branco. Linhas separadas por |'],
  ['vistoria_dias', '120', 'Uma parte sem conferência há mais que isso entra no roteiro da vistoria.'],
  ['emprestimo_alerta_dias', '30', 'Empréstimo vira alerta vermelho depois desses dias.'],
  ['backup_dias', '7', 'Intervalo da cópia de segurança automática da planilha.'],
];

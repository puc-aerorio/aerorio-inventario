# Relatório de teste de usabilidade e qualidade — Inventário 3D AeroRio

Testador: membro comum (persona), sem conhecimento prévio. Ambiente: site em http://localhost:4186/ + planilha falsa :4185 (estado inicial: 32 móveis, 98 partes, 0 itens, 0 organizadores).
Capturas em `/home/claude/tester/shots/`. Severidade: Crítico / Alto / Médio / Baixo.

## Achados (anexados na ordem em que foram encontrados)

### A. Entrada, visão geral e navegação

**A-01 · Médio · Visão geral — cartões dos labs sem legenda.** Os cartões "Manufatura ▤ 0 ▤ 17 Entrar" mostram dois números só com ícones minúsculos. Um membro novo não sabe que 0 = itens/unidades e 17 = móveis/gavetas. Captura: `shots/01_inicio.png`. Sugestão: "17 móveis · 0 itens" em texto, ou tooltip/aria-label nos ícones.

**A-02 · Baixo · Card pequeno do móvel cobre o próprio móvel e não tem fechar.** Ao clicar na Bancada central o card aparece por cima da metade direita da bancada; não há "×" nem dica de que clicar fora fecha. Captura: `shots/04b_click_central.png`. Sugestão: ancorar o card ao lado do móvel (não sobre ele) e incluir botão de fechar.

**A-03 · Médio · Card do móvel mostra "0 unidades" mesmo quando o conteúdo é por quantidade/conjunto.** O herói do card de móvel/parte é sempre "N unidades". Num tampo com 3 tubos de cola + parafusos "Médio" + 3 paquímetros, o número soma coisas de naturezas diferentes ("unidades"). Captura: `shots/06a_tampo.png`, `shots/08e_paraf.png`. Sugestão: "3 itens" (tipos de item) e, abaixo, o detalhamento; ou "itens" em vez de "unidades".

**A-04 · Baixo · Texto "Nenhum item solto."** Num tampo vazio aparece "Nenhum item solto." — "solto" é jargão interno (item fora de organizador). Sugestão: "Nada guardado aqui ainda. Use + Item ou + Organizador." Captura: `shots/06a_tampo.png`.

**A-05 · Baixo · Chip "Com espaço" não explica que é um botão de alternância.** No card da parte aparece um chip "Com espaço" (na verdade alterna "cheia"). Não há dica do que acontece ao clicar. Sugestão: rótulo de ação "Marcar como cheia" / estado "Cheia — sem espaço" com ícone.

**A-06 · Médio · Desempenho: com qualquer card aberto o 3D nunca para de desenhar.** Com o pós-processamento padrão (sem `#lite`), ao abrir o Tampo da Bancada central cada quadro levou 3,5 s e chegou a 18 s; a página travou (clique e captura de tela davam timeout de 30 s). No código, `parado()` retorna falso sempre que há card aberto (`S.stack.length&&!LITE`), então o laço de desenho com desfoque roda continuamente. Em notebook/celular fraco isso é bateria e aquecimento. (Ambiente de teste usa renderização por software, o que exagera o efeito, mas o laço contínuo é real.) Sugestão: desenhar sob demanda também com card aberto (o desfoque é estático quando a câmera está parada) e cair para o modo leve automaticamente quando o tempo de quadro passar de ~100 ms.

### B. Cadastro de itens (+ Item)

**B-01 · Alto · Cadastrar de novo um item com o mesmo nome NA MESMA PARTE cria uma segunda linha de estoque em vez de somar.** Passos: Bancada central › Tampo › + Item "Paquímetro digital" (3 unidades) › criar; repetir o mesmo cadastro no mesmo Tampo. Toast: "já estava cadastrado. Entrou como mais um lugar do mesmo item." — mas é o MESMO lugar. Resultado: o Tampo mostra duas linhas "Paquímetro digital" (unid. 1–3 e 4–6), duas "Cola epóxi" (3 tubo cada, ambas "Acabando"), dois "Parafuso M3"; a planilha ESTOQUE fica com duas linhas `MAN-001.T` para o mesmo item; o alerta de estoque baixo conta 2 vezes (selo "⚠ 2" na bancada) e cada linha avalia o mínimo separadamente (3 < 5 em cada uma, embora o total seja 6). Captura: `shots/08e_paraf.png`, `shots/08g_tampo_cheio.png`. Esperado: somar à entrada existente (quantidade/unidades) ou perguntar "Já existe aqui. Somar?". O mínimo deveria ser comparado com o total do item.

**B-02 · Médio · O formulário "Novo item" pula de posição enquanto se digita.** O modal é centralizado verticalmente e é re-renderizado quando a classe sugerida muda; ao digitar "Paquímetro…" a classe vira Medição, o modo muda para "Por unidade", aparecem campos novos e o campo Nome sobe ~60 px sob o cursor (compare `shots/07b_semnome.png` e `shots/07c_paq.png`). A cada re-render o cursor é jogado para o fim do texto (`setSelectionRange(99,99)`), atrapalhando corrigir no meio. Sugestão: ancorar o modal no topo, atualizar só a seção afetada, preservar a posição do cursor.

**B-03 · Médio · Classes só por ícone.** A linha "Classe" tem 12 círculos coloridos com ícones sem nome (o nome só aparece no texto cinza acima, depois de escolher, ou no hover). Quem nunca viu não distingue "Fixação" de "Ferramenta manual" ou "Diversos". Captura: `shots/07b_semnome.png`. Sugestão: chips com nome (como aparece "Impressão 3D" ao passar o mouse), ou lista/select com busca.

**B-04 · Médio · Sem classe escolhida, o formulário já assume "Diversos / Por quantidade" sem mostrar.** Com o nome vazio, nenhum ícone está marcado, mas "Por quantidade (consumível)" já está selecionado e o campo "Especificação" (da classe Diversos) aparece. Se o usuário não digitar um nome reconhecível, o item vira "Diversos" silenciosamente. Sugestão: marcar visualmente "Diversos" como padrão ou exigir escolha.

**B-05 · Baixo · Erro "Dê um nome ao item" só como toast, campo não é destacado.** Clicar "Criar e guardar aqui" com nome vazio mostra um toast que some em 1,6 s (atrás/abaixo do modal, nem apareceu na captura `shots/07b_semnome.png`); o campo não fica vermelho. Sugestão: mensagem inline sob o campo + borda de erro; desabilitar o botão até ter nome.

**B-06 · Médio · Com identificador (Cor/Tamanho/Outro), os botões − / + de "Unidades" continuam visíveis mas não fazem nada.** Ao escolher "Cor", o contador vai para 0 e o "+" é ignorado sem aviso (`shots/08a_ident_cor.png`); a quantidade passa a vir dos chips de cor. Sugestão: esconder/desabilitar −/+ e trocar o rótulo para "Unidades (some pelas cores abaixo)".

**B-07 · Baixo · Campos específicos sem exemplo.** "Faixa", "Resolução", "Validade", "Rendimento", "Especificação" aparecem sem placeholder; não fica claro o formato (ex. "0–150 mm", "0,01 mm", "MM/AAAA"). Sugestão: placeholders por campo.

**B-08 · Baixo · Caracteres trocados/removidos silenciosamente no nome.** `"` vira `”` e `<`/`>` são apagados (função `clean`). Ex.: "Cabo 2\"" vira "Cabo 2”"; "Fusível >10A" vira "Fusível 10A". Sem aviso. Sugestão: escapar HTML na exibição em vez de alterar o dado; se precisar remover, avisar.

**B-09 · Baixo · "Mínimo" aceita negativo e decimal; não existe "Mínimo" para itens por unidade.** Campo `type=number` sem `min=0`. Para paquímetros (por unidade) não há como dizer "quero pelo menos 2". Sugestão: `min=0 step=1`; considerar mínimo também para "Por unidade".

### C. Linha do item, unidades e empréstimos

**C-01 · Crítico · Não dá para emprestar a uma pessoa da equipe (lista vazia, sem campo de nome).** Passos: Tampo › linha "Paquímetro digital" › ✋ Emprestar (ou chip da unidade › Emprestar…). "Pessoa da equipe" vem selecionado, mas não aparece nenhum nome nem campo para digitar; o botão "Emprestar" fica desabilitado para sempre. A lista de pessoas é montada só com nomes que JÁ tiveram empréstimo na aba UNIDADES (`sync.js`: `PESSOAS = nomes de com_quem`), então numa planilha nova ela é vazia — e mesmo depois só aparece quem já pegou algo. O caso mais comum (membro leva para casa) é impossível. Captura: `shots/09d_emprestar.png`, `shots/09i_emp_equipe.png`. Sugestão: usar a aba de Pessoas aprovadas (nomes dos membros) + campo livre "Outro nome"; pré-selecionar o próprio usuário ("Eu").

**C-02 · Alto · Empréstimo não tem prazo.** O modal de empréstimo tem só Unidade e Para; não existe campo de prazo (a planilha UNIDADES tem a coluna `prazo`, o site lê mas nunca grava). O "atraso" é um corte fixo de 30 dias (`alertsOf`: vermelho só após 30 dias). Captura: `shots/09d_emprestar.png`. Sugestão: campo opcional "Devolver até" (atalhos: hoje, 1 semana, 1 mês) e alerta quando o prazo vencer.

**C-03 · Médio · Unidade QUEBRADA continua sendo oferecida para empréstimo.** Depois de marcar a unidade 2 como "Quebrada", o modal "Emprestar" lista 2 e 3 como disponíveis (`shots/09i_emp_equipe.png`). Sugestão: esconder ou marcar (cinza + aviso) unidades quebradas/em manutenção.

**C-04 · Médio · Ações da linha são só ícones; no celular não há dica.** Os 6 botões (ⓘ, lápis, cruz, lixeira, lupa, mão) só têm `data-tt` (balão no hover do mouse — `shots/09c_hover_mov.png`). Lupa com "x" = "Não encontrei" é ambíguo (parece "buscar/zoom"; não é "Localizar no mapa"). A lixeira abre "Remover…" mas para membro só faz "Dar baixa". Sugestão: rótulos curtos sob os ícones ou menu "⋯" com texto; trocar o ícone de "Não encontrei" (ex.: ponto de interrogação) e chamar a lixeira de "Dar baixa".

**C-05 · Médio · Linha do item só mostra as ações depois de clicar no nome — não há indicação.** Nada sugere que a linha é clicável (sem chevron/“⋯”). Captura: `shots/09a_tampo_rows.png` vs `shots/09b_row_open.png`.

**C-06 · Baixo · Card de Detalhes não tem ações nem estado das unidades.** O card ⓘ mostra especificações, "Onde está", histórico e observações, mas não mostra quem está com cada unidade, estado (quebrada), nem botões Editar/Mover/Emprestar. Em "Onde está", o mesmo lugar aparece duas vezes (efeito do B-01). Captura: `shots/10a_detalhes.png`.

**C-07 · Baixo · "Localizar" termina com migalha vazia.** Ao localizar, a trilha embaixo mostra "Lab. de Manufatura › Bancada central › Tampo ›" com um "›" sobrando no fim e sem o nome do item; o item localizado não é destacado de forma clara no 3D (o marcador some/volta). Captura: `shots/10b_localizar.png`.

**C-08 · Médio · Editar item: Salvar fica fora da tela e trocar a classe não troca os campos.** O lápis abre o formulário dentro da linha; em 1366×800 os botões Cancelar/Salvar ficam abaixo da dobra do card (é preciso rolar o card para achar — `shots/11b_editar.png`, `shots/11c_editado.png`). Trocando Classe de "Medição" para "Ferramenta manual", os campos continuam "Faixa/Resolução" (deveriam virar "Marca/Medida") e os valores antigos ficam gravados (`shots/12a_troca_classe.png`; planilha manteve `Faixa: 0-150 mm; Resolução: 0,01 mm` na classe nova). Também não dá para editar "Como controlar" nem o identificador (cores) depois de criado. Sugestão: editar num modal igual ao de criação, com rodapé fixo; re-renderizar campos ao trocar classe.

**C-09 · Baixo · "Esgotado" aparece duas vezes na mesma linha.** Cola epóxi com 0: a coluna da quantidade diz "Esgotado" e o selo de alerta também "Esgotado" (texto da linha: "Cola epóxi Esgotado Esgotado − +"). Captura: `shots/11a_cola_zero.png`.

**C-10 · Médio · Não dá para mover só parte da quantidade.** "Mudar de lugar" num item por quantidade move a linha inteira (ex.: 10 tubos). Não existe "levar 2 para a bancada de solda". Para unidades há o "mudar esta unidade", mas não há seleção múltipla. Sugestão: perguntar quantos ao mover itens contáveis.

### D. Mover / Guardar (fluxo de carregar)

**D-01 · Alto · "Mudar de lugar" de dentro do card deixa a câmera colada na peça de origem.** Passos: Tampo › linha › ✥ Mudar de lugar. O card fecha, a barra diz "Passe o mouse sobre as partes dos móveis e clique onde vai guardar", mas a câmera continua no close do tampo — nenhum outro móvel está visível (`shots/13a_carry_inicio.png`). Clicar no chip "‹ Manufatura" durante o carregamento não faz nada (`shots/13a2_carry_chip.png`). Só funciona quem descobrir que precisa rolar a roda do mouse/pinçar para afastar. Esperado: ao iniciar o carregamento, afastar para a vista do lab (e o chip do lab funcionar). Sugestão adicional: oferecer também escolha por lista (móvel › parte) na barra.

**D-02 · Médio · Texto da barra de carregar é só para mouse.** "Passe o mouse sobre as partes dos móveis e clique…" aparece também no celular (toque). Sugestão: "Toque/clique na parte do móvel onde vai guardar".

**D-03 · Baixo · Toast de confirmação omite o móvel.** "Paquímetro digital Mitutoyo guardado em Em cima" — "Em cima" de quê? Sugestão: "guardado em Armário de colas › Em cima".

**D-04 · Baixo · Mirar uma prateleira de armário fechado cai em "Em cima".** Apontando para a altura da prateleira de cima do Armário de colas (portas fechadas), o alvo escolhido foi "Em cima" (`shots/13c_carry_confirm.png`). As portas só abrem depois do clique. Sugestão: abrir as portas no hover durante o carregamento, ou listar as partes num menu ao clicar no móvel.

**D-05 · Alto · Clicar fora do modal "Novo item" descarta tudo o que foi digitado, sem aviso.** Passos: Guardar › Novo item › digitar nome (e qualquer outro campo) › clicar no fundo escurecido (ex. para olhar o 3D). O modal fecha e, ao reabrir, o nome está vazio (`shots/14b_scrim_click.png`; log: "modal on? False", "nome mantido? ''"). O mesmo vale para o modal de empréstimo e de baixa. Sugestão: não fechar por clique no fundo quando há campos preenchidos (ou pedir confirmação), e manter rascunho.

**D-06 · Baixo · "Criar e escolher lugar" + Cancelar = item vai para "Sem lugar" (ok), mas a única forma de descobrir isso é o toast.** Funciona: toast "Multímetro Minipa ficou sem lugar. Aparece em Guardar › Sem lugar." (`shots/14e_cancel.png`). Sugestão: em vez de Cancelar ambíguo, dois botões: "Deixar sem lugar" e "Desistir do cadastro" (hoje não há como desistir do cadastro depois de criado; precisa dar baixa).

**D-07 · Médio · Painel "Guardar" é na verdade uma central (Novo item, Novo organizador, Devolver, Sem lugar, Fora do lugar, Mexidos recentemente) sem título.** O botão se chama "Guardar" mas o painel serve para devolver e mudar de lugar também; um membro procurando "Devolver" não pensa em "Guardar". `shots/14f_guardar_sem.png`. "Mexidos recentemente" lista o mesmo item várias vezes (uma por linha de estoque). Sugestão: título no painel, renomear para "Guardar / devolver" ou dar um botão próprio para Empréstimos.

### E. Busca

**E-01 · Médio · Busca não encontra os "tipos" de um conjunto nem plurais.** "m3x20" → "Nada encontrado" (é um tipo do Parafuso M3); "parafusos" → nada (só "parafuso"). "PARAFUSO" funciona. Sugestão: indexar `tipos`, descrição e especificação; normalizar plural simples (s final) ou busca por prefixo de palavra.

**E-02 · Baixo · Buscar "gaveta" lista dezenas de gavetas genéricas iguais ("Gaveta 1 · Bancada da mesa de empuxo", "Gaveta 1 · Bancada elétrica"…) sem conteúdo nem número de placa.** Útil só se o resultado mostrasse o que tem dentro/quantos itens. Sugestão: mostrar contagem de itens e o número da placa do móvel.

**E-03 · Baixo · Selo de alerta do 3D sobrepõe o ícone do item.** No close do Tampo após buscar "cola" › Enter, o selo "⚠ 1" fica em cima do ícone de chave do paquímetro (`shots/14i_busca_enter.png`). Sugestão: deslocar o selo para o canto do marcador.

### F. Organizadores e etiquetas

**F-01 · Alto · Não existe como remover/descartar um organizador.** O card do organizador só tem "Mudar de lugar", cores e "+ Item" (`shots/15h_broca.png`). Não há "Dar baixa", "Apagar", trocar tipo ou tamanho, nem esvaziar. Uma caixa criada por engano ou quebrada fica para sempre (a planilha tem estado "Removido", mas o site não oferece). Sugestão: menu "⋯" no card com Renomear, Trocar tipo/tamanho, Esvaziar (mover itens para a parte) e Remover.

**F-02 · Médio · Organizador aberto aparece atravessando o tampo e a gaveta fica vazia no 3D.** Bancada da serra › Gaveta 1 › Caixa de brocas: a gaveta abre (vazia) e a maleta laranja aparece "flutuando" acima, cortada pelo tampo da bancada e saindo do topo da tela (`shots/15h_broca.png`). Para quem olha, a caixa não está na gaveta. Sugestão: levantar a caixa acima da gaveta aberta, fora do móvel, com uma linha/sombra ligando à gaveta.

**F-03 · Baixo · Criador de organizador: prévia 3D gigante e cortada; paleta com duas cores quase iguais.** Na tela "Novo organizador", a maleta de prévia ocupa a esquerda e é cortada pela borda; na transição aparece um "fantasma" amarelo do tipo anterior no meio da cena. A paleta tem dois laranjas (o da maleta e o laranja padrão). Botões do rodapé desalinhados (Cancelar mais alto que o principal). Captura: `shots/15c_org_next.png`. Sugestão: prévia num quadro próprio ao lado do formulário; deduplicar cores próximas.

**F-04 · Baixo · Tipo de organizador só por setas (1 de 9).** Para chegar em "Gaveteiro" é preciso clicar → várias vezes sem ver a lista; os pontinhos embaixo não são clicáveis e não têm nome. Sugestão: grade com miniaturas dos 9 tipos.

**F-05 · Baixo · Etiqueta vira MAIÚSCULA sem avisar e "Etiquetas sem uso: Nenhuma livre" logo na primeira vez.** Digitado "brocas a" → "BROCAS A". As 9 etiquetas da planilha já estão todas em uso, então a lista "sem uso" sempre aparece vazia na primeira experiência. Captura: `shots/15d_org_etq.png`. Sugestão: mostrar a prévia em maiúsculas enquanto digita; esconder a seção vazia.

**F-06 · Baixo · Textos de toast com concordância/contexto ruins.** "Caixa de brocas guardado em Gaveta 1" (caixa = feminino; e falta o móvel). "Vai direto para Gaveta 1." no criador também omite o móvel.

### G. Vistoria

**G-01 · Alto · "Próximo móvel" grava o móvel como conferido mesmo sem conferir nada.** Na Bancada central (0/5 conferidos) clicar "Próximo móvel" grava `conferido_em`/`conferido_por` em TODAS as partes do móvel (planilha PARTES: `MAN-001.T … 2026-11-16 01:07 membro.teste`). Móveis vazios ("0/0") também são marcados sem que alguém abra as portas. O dado "conferido" perde o valor. Captura: `shots/16a_vistoria.png`, `shots/16b_0.png`. Sugestão: separar "Pular" de "Tudo confere neste móvel"; gravar conferido só das partes/itens confirmados.

**G-02 · Médio · Vistoria não tem "anterior", e "Sair" perde o progresso sem perguntar.** Só há "Próximo móvel" e "Sair". Ao sair e voltar, recomeça do móvel 1 de 17. Sugestão: botão "‹ Anterior", lista dos móveis com status, e retomar de onde parou.

**G-03 · Médio · Ordem da vistoria só por número de alertas; ignora a data da última conferência e o trajeto.** O código ordena só por `stats().al`; o comentário diz que a data de conferido serve para priorizar, mas não é usada. A câmera pula de um lado da sala para o outro (Bancada central → Armário de colas → Armário suspenso 06 → Bancada da mesa de empuxo). Sugestão: priorizar alertas, depois "não conferido há mais tempo", agrupando por parede/proximidade.

**G-04 · Médio · Vistoria não permite registrar o que foi encontrado e não estava cadastrado, nem conferir organizadores/partes vazias.** A lista mostra só itens cadastrados com "Confere / Corrigir". Num móvel "0/0" não há nada a fazer a não ser "Próximo". Sugestão: botão "+ Achei algo aqui" (abre Novo item com destino na parte) e uma linha por parte ("Gaveta 1: vazia? confere").

**G-05 · Baixo · Vistoria sempre começa pela Manufatura quando iniciada da visão geral.** Sem escolher o lab, `startVist` usa `S.lab||'man'`. Sugestão: perguntar qual lab (ou ambos) ao iniciar fora de um lab.

### H. Card do móvel e das partes

**H-01 · Médio · Parte "Ao lado" da Bancada da serra não aparece na silhueta do card.** A Bancada da serra tem 5 partes (Tampo, Gaveta 1, Gaveta 2, Embaixo, Ao lado), mas a silhueta só desenha Tampo/Embaixo/Gavetas (`shots/17d_etq_pop2.png`). "Ao lado" só é alcançável pelas setas ‹ › do card da parte ou clicando no 3D. No código, `silhH` para mesas só desenha T, T2, U, U2 e G*. Sugestão: renderizar qualquer parte extra numa faixa "Outros lugares" na silhueta.

**H-02 · Médio · Câmera da parte "Ao lado" fica atrás de uma coluna.** Ao abrir "Ao lado" da Bancada da serra, uma coluna/pilar ocupa o centro da tela e esconde quase toda a área destacada (`shots/17f_aolado.png`). O recolhimento de paredes não trata esse pilar. Sugestão: tornar translúcido qualquer objeto entre câmera e parte, ou escolher outro ângulo.

**H-03 · Baixo · Popover de etiqueta cobre o título do card.** Ao clicar na etiqueta do móvel, o popover tapa o nome "Bancada da serra" e o número (`shots/17d_etq_pop2.png`). Não há opção "trocar etiqueta" (só "Remover etiqueta"). Sugestão: abrir abaixo do botão, com "Trocar…" além de "Remover".

**H-04 · Baixo · Renomear parte só por um lápis pequeno ao lado do título (aparece no hover).** Funciona (Enter salva; "Tampo" virou "Gaveta das lâminas" na planilha), mas não há validação: posso dar a um tampo o nome "Gaveta das lâminas", e o blur salva automaticamente (clicar fora = salvar, sem desfazer). Sugestão: Esc cancela (já cancela) e blur também deveria perguntar/cancelar; mostrar o nome automático como sugestão para voltar.

**H-05 · Baixo · Esc fecha todos os cards de uma vez.** Com Móvel › Parte abertos, Esc fecha a pilha inteira (stack 0) em vez de voltar um nível. Sugestão: Esc = voltar um nível; duplo Esc = fechar tudo.

**H-06 · Baixo · Miniatura no canto do card da parte (barrinhas empilhadas) não é explicada.** Ao lado das setas ‹ › aparece um ícone de barras com uma azul (indicando a parte atual na pilha). Sem rótulo, não é óbvio; não é clicável. `shots/17f_aolado.png`.

### I. Eletrônica — mover gaveteiros

**I-01 · Médio · Arrastar o gaveteiro azul pequeno até uma bancada do outro lado do lab não funciona e não diz por quê.** Mover › arrastar da posição atual até o tampo da Bancada de solda: ao soltar, o gaveteiro volta para cima do Gaveteiro fixo, sem mensagem (`shots/20f_azul_solto.png` da 1ª tentativa estava igual ao início; barra continuava "em cima de Gaveteiro fixo"). Para a Mesa da entrada (perto) funciona e encaixa (`shots/20f_azul_solto.png` final, planilha atualizada x=1.98 z=1.661). Durante o arraste, passar sobre outros móveis mostra o nome deles ("Gaveteiro de rodinha 4"), não se o encaixe é possível. Sugestão: realçar em verde/vermelho os tampos válidos durante o arraste e mostrar "Aqui não cabe: …" ao soltar em lugar inválido.

**I-02 · Médio · Mover não tem desfazer nem "cancelar".** A barra tem só "Girar 90°" e "Concluir"; cada arraste já grava. Esc também conclui (`endMove`). Um arraste errado só se desfaz arrastando de volta. Sugestão: "Cancelar" que restaura a posição inicial.

**I-03 · Médio · Gaveta continua aberta no 3D depois de fechar os cards com Esc.** Passos: Mesa da entrada › Móveis encaixados › Gaveteiro de rodinha 1 › Gaveta de cima › Esc. A gaveta de cima do gaveteiro fica aberta para fora de baixo da mesa (`shots/20d_azul.png`, gaveta aberta abaixo da mesa à esquerda). Sugestão: fechar portas/gavetas ao fechar a pilha (como o botão voltar faz).

**I-04 · Baixo · Encaixes aparecem com estilos diferentes e textos estranhos.** No gaveteiro: chip cinza "Dentro de Fundo do lab" (antes) e caixa tracejada "Embaixo de Mesa da entrada" (depois) — `shots/19c_gv1_card.png`, `shots/19g_done.png`. A Mesa da entrada diz "Embaixo de Estante suspensa da entrada" (é a estante que está em cima da mesa; para uma mesa, "Embaixo de estante" confunde). Sugestão: um só componente "Encaixe: …" e frase do ponto de vista certo ("Estante suspensa acima").

**I-05 · Baixo · Funciona bem:** o gaveteiro de rodinha encaixou "embaixo do lado curto" da Mesa da entrada, a Mesa passou a listar "Móveis encaixados › Gaveteiro de rodinha 1", o card do gaveteiro mostra "Embaixo de Mesa da entrada", a posição foi gravada na planilha (MOVEIS x=2.06 z=1.64 rot=90) e persistiu ao recarregar (`shots/20a_mesa_card.png`). Girar 90° também grava.

### J. Áreas sem subníveis (lixo, materiais, vão, fundo do lab)

**J-01 · Médio · "Área do lixo" é só mais um lugar de guardar — não há fluxo de descarte.** Card da Área do lixo: "0 unidades", "Com espaço", "+ Item · + Organizador", "Nenhum item solto." (`shots/21_lixo_card.png`). Pôr algo ali (Guardar aqui) o mantém no estoque contando como existente; não vira baixa nem pede motivo. Para quem quer "jogar fora", o caminho certo (Dar baixa) fica escondido na lixeira da linha. Sugestão: no lixo, texto explicando "O que está aqui vai ser descartado" + botão "Esvaziar lixo (dar baixa em tudo)"; ou levar ao lixo = baixa com motivo.

**J-02 · Baixo · Áreas abrem direto no card da área (bom), mas os textos continuam de móvel.** "Com espaço" e "Nenhum item solto." numa área de chão/lixo soam estranhos; "+ Organizador" no lixo também. Sugestão: textos específicos por tipo de área.

**J-03 · Baixo · "Vão cheio de coisas" é difícil de clicar na visão do lab.** Clicando onde ele está, quem é selecionado é o Armário de colas (o vão fica atrás/entre móveis). Só acessível pela busca ou pelas setas de móvel. Sugestão: rótulo/realce das áreas no chão, ou prioridade de clique para áreas.


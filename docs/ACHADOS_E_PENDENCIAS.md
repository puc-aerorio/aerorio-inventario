# Inventário: achados da rodada de testes (2026-11-16) e o que falta

O relatório completo do testador está em `relatorio_teste_2026-11-16.md`. O teste foi feito com um membro que nunca tinha visto o site, sobre a versão anterior a esta rodada. O teste parou na seção J; as seções K em diante (celular, Admin, compras, temas) ainda não foram testadas.

## Corrigido nesta rodada
- O 3D não mostra mais os itens de demonstração quando os dados vêm da planilha.
- **Criar item:**
  - classes aparecem com nome;
  - modos de controle vêm explicados;
  - o stepper e o campo de quantidade foram refeitos;
  - "Como diferenciar as unidades (opcional)" ganhou paleta de 13 cores nomeadas, seletor de cor livre e nome editável. Opções com 0 unidades não somem mais;
  - especificações agora são opcionais e têm exemplos (Faixa de medição, Resolução…);
  - erros aparecem no próprio formulário;
  - se já existe um item com o mesmo nome, isso é avisado. Criar no mesmo lugar soma ao que já existe (B-01);
  - criar com um critério de diferenciação diferente do item existente é recusado;
  - clicar fora não descarta o formulário (D-05).
- **Editar item:** card próprio com nome, classe, especificações (campos livres incluídos), descrição, identificador (renomear uma opção atualiza as unidades em todos os lugares; uma opção em uso não pode ser apagada), cada unidade com opção, estado e baixa, quantidade/mínimo (contável), nível/tipos (caixa), e "Salvar" sempre visível (C-08).
- **Detalhes:** resumo (total, neste lugar, emprestadas, quebradas), situação das unidades, contagem por opção, empréstimos com prazo, cadastro, onde está, histórico recolhível com rolagem e botão "Editar cadastro" (C-06).
- **Caixa/kit:** duas linhas separadas, "Quanto tem" (nível) e "Tipos dentro" (marcar falta).
- **Nova unidade:** o popover tem seletor de cor e a opção "sem cor".
- **Empréstimo:**
  - campo livre para o nome, com o próprio membro em primeiro na lista (C-01);
  - prazo "Devolver até" (C-02);
  - unidades quebradas ou em manutenção não são oferecidas (C-03).
- **Linha do item:** as ações têm rótulo em texto (C-04) e há uma seta indicando que a linha abre (C-05). "Esgotado" não aparece mais duplicado (C-09).
- **Mover:** ao começar, a câmera afasta para a vista do lab (D-01). O texto é próprio para toque no celular (D-02), e o toast diz o móvel e a parte (D-03, F-06).
- **Busca:** encontra também tipos, descrição, especificações e opções, aceita plural simples e várias palavras (E-01).
- **Organizador:** botão Remover. Os itens de dentro ficam soltos no lugar, e é possível desfazer (F-01).
- **Vistoria:** "Tudo confere · próximo" é o único botão que grava a conferência. "Pular" e "Anterior" não gravam (G-01, G-02 em parte), e móvel vazio pede confirmação.
- **Card do móvel:** partes que o desenho não cobre ("Ao lado"…) aparecem em "Outros lugares" (H-01).
- **Textos:**
  - "itens guardados" no lugar de "unidades" (A-03);
  - os cards dos labs dizem "unidades / móveis" (A-01);
  - "Tem espaço / Cheia" vem com dica (A-05);
  - o texto de lugar vazio está mais claro (A-04).
- **Desempenho:** com card aberto, o 3D só redesenha se houver um alerta piscando ou alguma interação (A-06).

## Pendente (por prioridade)
1. **I-01:** ao arrastar móvel, mostrar onde cabe ou não e dar motivo ao soltar em lugar inválido. **I-02:** "Cancelar" no modo mover, restaurando a posição.
2. **I-03:** gavetas e portas ficam abertas no 3D depois de Esc.
3. **J-01:** a Área do lixo devia ter um fluxo de descarte ("Esvaziar lixo" = baixa com motivo). **J-02:** textos específicos para áreas.
4. **C-10:** mover só parte da quantidade (contável).
5. **G-02/G-03/G-04/G-05:**
   - retomar a vistoria de onde parou;
   - ordenar a rota por data de conferência e proximidade;
   - "+ Achei algo aqui";
   - escolher o lab ao iniciar.
6. **F-02:** organizador aberto atravessa o tampo. **F-03/F-04:** a prévia do criador de organizador e a escolha de tipo em grade. **F-05:** etiqueta em maiúsculas.
7. **H-02:** pilar tapando a parte "Ao lado". **H-03:** o popover da etiqueta cobre o título; falta "Trocar". **H-04:** clicar fora salva o renomear. **H-06:** a miniatura de partes não tem legenda.
8. **D-04:** apontar para a prateleira de um armário fechado cai em "Em cima". **D-06:** depois de criar, não há como desistir do cadastro. **D-07:** o painel "Guardar" não tem título; falta um botão próprio para empréstimos.
9. **E-02:** os resultados de "gaveta" não mostram o conteúdo. **E-03:** o selo de alerta cobre o ícone do item.
10. **A-02:** o card pequeno do móvel cobre o próprio móvel e não tem ×. **B-08:** aspas e `<>` são trocados no nome. **B-09:** não existe mínimo para itens por unidade.
11. **J-03:** o "Vão" é difícil de clicar. **I-04:** a frase do encaixe está ambígua ("Embaixo de Estante…" na mesa).
12. Testar o que faltou: celular inteiro, papel Admin (pessoas, apagar, compras), temas escuro e papel, login real.

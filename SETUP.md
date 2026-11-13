# Pôr o inventário no ar

Tempo total: uns 40 minutos, uma vez só. Faça tudo com a conta da equipe (`aerorio2024@gmail.com`), não com a pessoal: quem instala vira o primeiro Admin, e a planilha, o script e o projeto do Google ficam no nome de quem cria.

## Como funciona, em uma linha por peça

- **Planilha nova "AeroRio | Inventário"**: é o banco. Abas legíveis, uma por tipo de coisa. A Central v2 continua intacta e é só a origem da importação.
- **Apps Script da planilha** (`apps-script/Codigo.gs`): é o servidor. Confere o login, aplica as permissões e grava. Os membros **não** precisam de acesso de edição à planilha.
- **Site no GitHub Pages**: guarda uma cópia do inventário no aparelho, responde na hora e manda as mudanças em lote. Sem internet, guarda a fila e envia quando voltar.
- **Login Google**: só para saber quem é a pessoa. Precisa de um "ID do cliente OAuth" (passo 3), sem nenhuma API paga.

## 1. Criar a planilha

1. No Drive da equipe, abra **5. Reuniões e Laboratório › Inventário**.
2. **Novo › Planilhas Google**. Nome: `AeroRio | Inventário`.

## 2. Colar o servidor

1. Na planilha nova: **Extensões › Apps Script**.
2. Apague tudo o que está em `Código.gs` e cole o conteúdo inteiro de `apps-script/Codigo.gs` deste repositório.
3. Salve (ícone de disquete). Nome do projeto: `Inventário AeroRio`.
4. Volte à planilha e recarregue a página. Aparece o menu **Inventário**.
5. **Inventário › Instalar ou atualizar estrutura**. O Google pede autorização: escolha a conta da equipe, **Avançado › Acessar Inventário AeroRio (não seguro)** e **Permitir**. (O aviso aparece porque o script é seu, não verificado pelo Google.)

O instalador cria as abas, preenche os 19 móveis, as 58 partes, as 12 classes e as etiquetas, importa da Central v2 (observações dos móveis, endereços antigos, itens reais e os 341 registros antigos na aba LEGADO) e põe você como Admin. Pode rodar de novo quando quiser: ele só acrescenta o que falta e nunca apaga.

## 3. Criar o ID do login (Google Cloud)

1. Abra <https://console.cloud.google.com> com a conta da equipe. Aceite os termos se pedir.
2. No topo, **Selecionar projeto › Novo projeto**. Nome: `Inventario AeroRio`. Criar e selecionar.
3. Menu **APIs e serviços › Tela de permissão OAuth** (pode aparecer como "Google Auth Platform"):
   - Tipo de usuário: **Externo**.
   - Nome do app: `Inventário AeroRio`. E-mail de suporte e de contato: o da equipe.
   - Escopos: não acrescente nenhum.
   - Em **Público-alvo**, clique em **Publicar app** (status "Em produção"). Sem isso o login expira a cada 7 dias e só aceita 100 testadores.
4. **APIs e serviços › Credenciais › Criar credenciais › ID do cliente OAuth**:
   - Tipo: **Aplicativo da Web**. Nome: `Site do inventário`.
   - **Origens JavaScript autorizadas**: `https://SUACONTA.github.io` (troque pela conta do GitHub do passo 6, sem barra no fim e sem o nome do repositório) e `http://localhost:5173`.
   - URIs de redirecionamento: deixe vazio.
   - Criar. Copie o **ID do cliente** (termina em `.apps.googleusercontent.com`).
5. Na planilha: **Inventário › Configurar login** e cole o ID.

## 4. Publicar o servidor

1. No Apps Script: **Implantar › Nova implantação**.
2. Engrenagem ao lado de "Selecionar tipo" › **App da Web**.
3. Executar como: **Eu**. Quem pode acessar: **Qualquer pessoa**.
   (Isso não abre os dados: o script só responde a quem entrou com Google e está aprovado na aba USUARIOS.)
4. **Implantar** e copie a **URL do app da Web** (termina em `/exec`).
5. Teste: abra essa URL no navegador. Deve aparecer `{"ok":true,"app":"AeroRio Inventário",...}`.

## 5. Ligar o site à planilha

Os dois valores (URL do passo 4 e ID do passo 3) não são segredo. Escolha um jeito:

- **No GitHub (recomendado)**: no repositório, **Settings › Secrets and variables › Actions › aba Variables › New repository variable**: `VITE_SCRIPT` = URL `/exec`; `VITE_CLIENT` = ID do cliente.
- **No código**: preencha os dois campos em `src/config.js`.

## 6. Publicar o site (GitHub Pages)

1. No GitHub (de preferência numa conta da equipe), crie um repositório **público** chamado `inventario`, sem README.
2. No PC, no Git Bash, dentro da pasta `aerorio-inventario-v3`:
   ```
   mkdir -p .github/workflows && cp ci/deploy.yml .github/workflows/deploy.yml
   git init -b main
   git add .
   git commit -m "Inventário AeroRio v3"
   git remote add origin https://github.com/SUACONTA/inventario.git
   git push -u origin main
   ```
3. No repositório: **Settings › Pages › Source: GitHub Actions**.
4. Aba **Actions**: espere o "Publicar no GitHub Pages" ficar verde (1 a 2 minutos). O site fica em `https://SUACONTA.github.io/inventario/`.

Atualizar depois é só `git push`: o site se publica sozinho em 1 ou 2 minutos.

## 7. Primeiro acesso

1. Abra o site e entre com a conta da equipe. Você já é Admin.
2. Quem entrar depois fica **Pendente** (só vê). Para aprovar: avatar no canto › **Pessoas**, ou a mesma coisa na barra de Admin.
3. Confira na planilha que as abas estão como esperado e só então renomeie a Central v2 para `DEPRECIADO - Central de Inventário v2`.

## Quando o servidor mudar

Se uma versão nova mexer em `apps-script/Codigo.gs`:

1. Cole o arquivo novo no Apps Script e salve.
2. **Inventário › Instalar ou atualizar estrutura** (acrescenta colunas novas, não apaga nada).
3. **Implantar › Gerenciar implantações ›** lápis **› Versão: Nova versão › Implantar**. A URL continua a mesma; não crie uma implantação nova, senão a URL muda.

## Regras da planilha

- Não renomeie abas nem os cabeçalhos da linha 1. Colunas extras no fim são livres.
- Não apague linhas. Para tirar de uso, mude `estado` (ou `situacao` em UNIDADES, `status` em COMPRAS).
- **MOVIMENTOS** é o registro de tudo o que o app gravou. Não edite, não ordene e não apague: o app usa a posição das linhas.
- Editar à mão é permitido (por exemplo, renomear um móvel em MOVEIS). O app percebe e recarrega tudo na próxima conversa com a planilha.
- Cópia de segurança: todo dia às 4h o script confere se a última tem mais de `backup_dias` (aba CONFIG) e faz outra na pasta "Cópias de segurança do inventário". Também dá para fazer na hora pelo menu.

## Abas

| Aba | O que é |
| --- | --- |
| MOVEIS | Os móveis, com número da placa, nome e posição no 3D |
| PARTES | Gavetas, prateleiras, portas, tampos de cada móvel; etiqueta, "cheia", última conferência |
| ORGANIZADORES | Caixas, maletas, cestos: tipo, cor, tamanho e em que parte estão |
| ITENS | Catálogo: o que é cada coisa (classe, modo, mínimo, especificação, identificador) |
| ESTOQUE | Onde cada item está e quanto: uma linha por lugar |
| UNIDADES | Patrimônio numerado: estado, identificador (cor, tamanho), empréstimo |
| COMPRAS | Lista de compras do Admin |
| ETIQUETAS | Texto das etiquetas físicas |
| CLASSES | As 12 classes, com ícone, cor e as categorias antigas que viraram cada uma |
| USUARIOS | Quem entra, papel (Admin, Membro, Visitante) e status |
| CONFIG | Recado do quadro, prazos de vistoria e de empréstimo, intervalo da cópia |
| MOVIMENTOS | Histórico gravado pelo app |
| LEGADO | Os registros do inventário antigo, para triagem |

## Limites que valem saber

- O script roda na conta da equipe. Os papéis do site protegem contra erro, e quem tem acesso de edição à planilha consegue editar direto. Mantenha a planilha compartilhada só com a diretoria.
- Duas pessoas mexendo na mesma coisa ao mesmo tempo: vale a última gravação, e as duas ficam em MOVIMENTOS. Quantidade (− / +) é somada, então dois cliques simultâneos não se perdem.
- O Apps Script responde em 0,5 a 2 segundos. O site não espera: a mudança aparece na hora e o indicador no avatar mostra quando foi salva (verde), está salvando (amarelo), sem conexão (cinza) ou com erro (vermelho).

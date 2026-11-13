# Inventário AeroRio (v3)

Site do inventário dos laboratórios da AeroRio (Manufatura e Eletrônica), com o lugar das coisas mostrado num 3D da sala real.

Base: protótipo v4.1 do chat de design. Plano e decisões: `claude/plano_inventario_site_real.md` e `claude/handoff_inventario_visual_fable.md` no projeto.

## Rodar

```
npm install
npm run dev        # http://localhost:5173 — sem configuração, abre a demonstração
npm test           # gera apps-script/Codigo.gs e testa o servidor numa planilha simulada
npm run build      # gera dist/ (o que vai para o GitHub Pages)
```

`#demo` na URL força a demonstração mesmo com a planilha ligada. `#lite` desliga o pós-processamento; `#full` liga no celular. `#dbg` expõe o estado para testes.

Pôr no ar com a planilha: **SETUP.md**.

## Como os dados andam

O site guarda uma cópia da planilha no aparelho e nunca espera por ela. Cada ação muda a tela na hora; `sync.js` compara o antes e o depois, transforma a diferença em operações (quantidade vai como soma) e põe numa fila gravada no aparelho. A fila sai em lote para o Apps Script, que confere permissão, grava nas abas e devolve o que os outros mudaram. Sem internet, a fila espera.

- Esquema das abas, permissões e a regra que aplica uma operação: `src/data/schema.js` (o mesmo arquivo vai para o servidor).
- Servidor: `server/main.js` → `npm run gs` → `apps-script/Codigo.gs`.
- Ligação entre o modelo 3D e a planilha (ids dos móveis, endereços da v2, classes): `src/data/mapa.js`.
- Testes: `tests/server.test.mjs` (servidor) e `tests/e2e.py` (site + planilha falsa, dois aparelhos; precisa de Playwright e de `npm run planilha-falsa`).

## Estado

Etapa 1 concluída: porte do protótipo, rodada de arestas, celular, planilha, login e papéis. Falta só a configuração do SETUP.md para ir ao ar.

Próximas etapas, nesta ordem: acabamento de marca; ferramentas de Admin (triagem do LEGADO, vistoria por prazo, validade e manutenção, exportação); funcionalidades novas (QR, viagem, fotos).

## Organização

`src/app/` em ordem de dependência (cada módulo só importa dos anteriores):

| Módulo | Conteúdo |
| --- | --- |
| `state.js` | estado da interface, modo leve, registros compartilhados |
| `icons.js` | ícones |
| `data.js` | classes, tipos de organizador, dados de demonstração, consultas e alertas |
| `html.js` | trechos de interface reutilizados (contadores, desenhos de organizador, aviso) |
| `tween.js` | animações |
| `scene.js` | renderizador, câmera, luzes, auxiliares de geometria |
| `room.js` | sala real, medidas, o que recolhe e o que fica translúcido |
| `post.js` | pós-processamento e o passe do lab não selecionado |
| `style.js` | estilos A, B, C e filtro técnico |
| `furniture.js` | móveis, máquinas, organizadores e peças de item |
| `camera.js` | movimentos de câmera e abertura de gavetas e portas |
| `ui.js` | telas, ponteiro, sobreposições e laço de desenho |
| `mobile.js` | folha de cards arrastável, menu do celular, desenho sob demanda |
| `sync.js` | banco no aparelho, fila de envio, login, Pessoas |

`ui.js` ainda é um módulo só, porque as telas se chamam entre si. Ele será dividido conforme as correções passarem por cada parte.

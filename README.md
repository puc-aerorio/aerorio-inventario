# Inventário AeroRio (v3)

Site do inventário dos laboratórios da AeroRio (Manufatura e Eletrônica), com o lugar das coisas mostrado num 3D da sala real.

Base: protótipo v4.1 do chat de design. Plano e decisões: `claude/plano_inventario_site_real.md` e `claude/handoff_inventario_visual_fable.md` no projeto.

## Rodar

```
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/ (o que vai para o GitHub Pages)
```

`#lite` na URL desliga o pós-processamento. `#dbg` expõe o estado em `window.__S` e `window.__dbg`.

## Estado

Etapa 1 em andamento. Feito: porte fiel do protótipo em módulos, Three.js e fontes empacotados, tela cheia, lab não selecionado (apagado por material no modo leve e no celular, desfocado em passe separado no modo completo), rotação com um dedo no celular. Os dados ainda são os de demonstração e ficam em memória.

Falta na etapa 1: as correções listadas no plano (oclusão por peça, colisão de sobreposições, busca de ângulo, escape de texto, edição de posição com nível do piso, desempenho no celular, cor do organizador, recado do quadro) e guardar os dados de demonstração no navegador.

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

`ui.js` ainda é um módulo só, porque as telas se chamam entre si. Ele será dividido conforme as correções passarem por cada parte.

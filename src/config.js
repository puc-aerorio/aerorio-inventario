/* Ligação com a planilha. Os dois valores vêm do SETUP.md (não são segredo: a planilha só responde a quem entra com Google).
   Vazio = modo demonstração, com dados de exemplo guardados só neste navegador. */
const ENV = (import.meta.env || {});
export const CFG = {
  script: ENV.VITE_SCRIPT || '', // URL do app da web do Apps Script (termina em /exec)
  client: ENV.VITE_CLIENT || '', // ID do cliente OAuth do Google Cloud (termina em .apps.googleusercontent.com)
};
/* #demo na URL força a demonstração mesmo com a planilha configurada */
export const LIVE = !!(CFG.script && CFG.client) && !(typeof location !== 'undefined' && /demo/.test(location.hash));

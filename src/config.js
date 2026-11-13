/* Ligação com a planilha. Os dois valores vêm do SETUP.md (não são segredo: a planilha só responde a quem entra com Google).
   Vazio = modo demonstração, com dados de exemplo guardados só neste navegador. */
const ENV = (import.meta.env || {});
export const CFG = {
  script: ENV.VITE_SCRIPT || 'https://script.google.com/macros/s/AKfycbxSUW6COYwiyRQC63jrjiwQOhcnlmSIJe8z2LeMvM0LrXcBD0L_t6HfHRq2rGqToXUP/exec', // URL do app da web do Apps Script (termina em /exec)
  client: ENV.VITE_CLIENT || '77088702443-p0fu45384pan6o5l9gjpo8s6ah6uchk6.apps.googleusercontent.com', // ID do cliente OAuth do Google Cloud (termina em .apps.googleusercontent.com)
};
/* #demo na URL força a demonstração mesmo com a planilha configurada */
export const LIVE = !!(CFG.script && CFG.client) && !(typeof location !== 'undefined' && /demo/.test(location.hash));

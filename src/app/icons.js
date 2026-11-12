
/* ================= ícones ================= */
export const P={
 wrench:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z"/>',
 bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 chip:'<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
 screw:'<path d="M8 4h8l-1 4H9z"/><path d="M12 8v13M9.5 11l5 1.5M9.5 14.5l5 1.5M9.5 18l5 1.5"/>',
 drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
 layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
 ruler:'<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
 dots:'<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>'};
export const svgI=(d,cls='i')=>`<svg class="${cls}" viewBox="0 0 24 24">${d}</svg>`;
export const IC={
 stack:svgI('<path class="f" d="M4 15h16v4H4z"/><rect x="4" y="15" width="16" height="4" rx="1"/><rect x="5" y="10" width="14" height="4" rx="1"/><rect x="6" y="5" width="12" height="4" rx="1"/>'),
 box:svgI('<path class="f" d="M3 8l9-4 9 4v9l-9 4-9-4z"/><path d="M3 8l9-4 9 4v9l-9 4-9-4z"/><path d="M3 8l9 4 9-4M12 12v9"/>'),
 alert:svgI('<path class="f" d="M12 3l10 18H2z"/><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>'),
 tag:svgI('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>'),
 open:svgI('<path class="f" d="M4 14h16v6H4z"/><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16M10 8h4M10 16h4"/>'),
 in:svgI('<path class="f" d="M4 13h16v7H4z"/><path d="M4 13v7h16v-7"/><path d="M12 3v10M8 9l4 4 4-4"/>'),
 back:svgI('<path d="M15 6l-6 6 6 6"/>'),next:svgI('<path d="M9 6l6 6-6 6"/>'),
 move:svgI('<path d="M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4"/>'),
 plus:svgI('<path d="M12 5v14M5 12h14"/>'),check:svgI('<path d="M5 12l5 5 9-10"/>'),
 loc:svgI('<circle cx="12" cy="12" r="6"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>'),
 info:svgI('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
 edit:svgI('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
 trash:svgI('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
 nf:svgI('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5M8.5 8.5l5 5M13.5 8.5l-5 5"/>'),
 hand:svgI('<path class="f" d="M7 11V6a1.5 1.5 0 0 1 3 0v4"/><path d="M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V11M16 11V8a1.5 1.5 0 0 1 3 0v6a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-3-5a1.5 1.5 0 0 1 2.5-1.6L7 13V7a1.5 1.5 0 0 1 3 0"/>'),
 lab:svgI('<path d="M3 20h18M5 20V9l7-5 7 5v11"/><path d="M9 20v-6h6v6"/>'),
 cart:svgI('<circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.4 11h11.2L21 7H6"/>')};


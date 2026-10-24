/** Ícones em SVG (grandes, coloridos e iguais em qualquer aparelho). */

const svg = (body, vb = '0 0 64 64') =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

const STROKE = 'stroke="#4a2a42" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

export const ICONS = {
  coin: svg(`<circle cx="32" cy="32" r="26" fill="#ffcf33" ${STROKE}/><circle cx="32" cy="32" r="18" fill="#ffe27a"/><path d="M32 20 l3.5 7.5 8 1 -6 5.5 1.6 8 -7.1-4 -7.1 4 1.6-8 -6-5.5 8-1z" fill="#ffb800"/>`),
  key: svg(`<circle cx="20" cy="22" r="13" fill="#ffcf33" ${STROKE}/><circle cx="20" cy="22" r="5" fill="#fff6d1" ${STROKE}/><path d="M29 31 L52 54 M42 44 l5-5 M47 49 l5-5" fill="none" stroke="#4a2a42" stroke-width="9" stroke-linecap="round"/><path d="M29 31 L52 54 M42 44 l5-5 M47 49 l5-5" fill="none" stroke="#ffcf33" stroke-width="5" stroke-linecap="round"/>`),
  keyEmpty: svg(`<circle cx="20" cy="22" r="13" fill="#e2d6ec" stroke="#b6a3c4" stroke-width="3"/><circle cx="20" cy="22" r="5" fill="#f6f0fa" stroke="#b6a3c4" stroke-width="3"/><path d="M29 31 L52 54 M42 44 l5-5 M47 49 l5-5" fill="none" stroke="#b6a3c4" stroke-width="9" stroke-linecap="round"/><path d="M29 31 L52 54 M42 44 l5-5 M47 49 l5-5" fill="none" stroke="#e2d6ec" stroke-width="5" stroke-linecap="round"/>`),
  bag: svg(`<path d="M22 22 v-4 a10 10 0 0 1 20 0 v4" fill="none" ${STROKE} stroke-width="4"/><rect x="10" y="22" width="44" height="34" rx="10" fill="#ff8fc8" ${STROKE}/><rect x="22" y="32" width="20" height="12" rx="4" fill="#ffd6ea" ${STROKE}/>`),
  shop: svg(`<rect x="10" y="26" width="44" height="30" rx="5" fill="#fff4d6" ${STROKE}/><path d="M6 26 l6-14 h40 l6 14z" fill="#7fd4ff" ${STROKE}/><path d="M18 12 l-3 14 M32 12 v14 M46 12 l3 14" ${STROKE} fill="none"/><rect x="26" y="38" width="12" height="18" rx="3" fill="#ff8fc8" ${STROKE}/>`),
  home: svg(`<path d="M8 32 L32 10 L56 32" fill="none" ${STROKE} stroke-width="4"/><path d="M14 28 v26 h36 v-26 L32 12z" fill="#ffe28a" ${STROKE}/><rect x="26" y="38" width="12" height="16" rx="3" fill="#ff8fc8" ${STROKE}/>`),
  sound: svg(`<path d="M10 24 h10 l14-12 v40 l-14-12 h-10z" fill="#7fd4ff" ${STROKE}/><path d="M42 22 q8 10 0 20 M48 16 q14 16 0 32" fill="none" ${STROKE} stroke-width="4"/>`),
  mute: svg(`<path d="M10 24 h10 l14-12 v40 l-14-12 h-10z" fill="#c8c8d8" ${STROKE}/><path d="M42 24 l14 16 M56 24 l-14 16" ${STROKE} stroke-width="5" fill="none"/>`),
  hint: svg(`<circle cx="27" cy="27" r="16" fill="#d9f3ff" ${STROKE} stroke-width="4"/><path d="M39 39 L54 54" stroke="#4a2a42" stroke-width="9" stroke-linecap="round"/><path d="M39 39 L54 54" stroke="#ff9ec7" stroke-width="5" stroke-linecap="round"/><path d="M27 18 l2.5 5.5 6 .7 -4.5 4 1.2 6 -5.2-3 -5.2 3 1.2-6 -4.5-4 6-.7z" fill="#ffcf33"/>`),
  back: svg(`<path d="M38 12 L18 32 L38 52" fill="none" stroke="#4a2a42" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 12 L18 32 L38 52" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
  close: svg(`<path d="M16 16 L48 48 M48 16 L16 48" stroke="#4a2a42" stroke-width="11" stroke-linecap="round"/><path d="M16 16 L48 48 M48 16 L16 48" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>`),
  check: svg(`<path d="M12 34 L26 48 L52 18" fill="none" stroke="#4a2a42" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 34 L26 48 L52 18" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`),
  trash: svg(`<rect x="16" y="20" width="32" height="36" rx="6" fill="#ffb3b3" ${STROKE}/><path d="M10 18 h44 M26 12 h12" ${STROKE} stroke-width="4"/><path d="M26 28 v20 M38 28 v20" ${STROKE}/>`),
  edit: svg(`<path d="M14 50 l4-14 L42 12 l10 10 L28 46z" fill="#ffd23f" ${STROKE}/><path d="M14 50 l4-14 10 10z" fill="#ffd6b0" ${STROKE}/><path d="M38 16 l10 10" ${STROKE}/>`),
  plus: svg(`<path d="M32 12 V52 M12 32 H52" stroke="#4a2a42" stroke-width="13" stroke-linecap="round"/><path d="M32 12 V52 M12 32 H52" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>`),
  play: svg(`<path d="M20 12 L52 32 L20 52z" fill="#ffffff" ${STROKE} stroke-width="4"/>`),
  dice: svg(`<rect x="10" y="10" width="44" height="44" rx="10" fill="#ffffff" ${STROKE}/><circle cx="22" cy="22" r="4" fill="#ff6fa5"/><circle cx="42" cy="42" r="4" fill="#ff6fa5"/><circle cx="32" cy="32" r="4" fill="#ff6fa5"/><circle cx="42" cy="22" r="4" fill="#ff6fa5"/><circle cx="22" cy="42" r="4" fill="#ff6fa5"/>`),
  lock: svg(`<path d="M22 28 v-6 a10 10 0 0 1 20 0 v6" fill="none" ${STROKE} stroke-width="4"/><rect x="14" y="28" width="36" height="26" rx="7" fill="#c8c8d8" ${STROKE}/>`),
  sparkle: svg(`<path d="M32 4 C34 24 40 30 60 32 C40 34 34 40 32 60 C30 40 24 34 4 32 C24 30 30 24 32 4z" fill="#ffe066" ${STROKE} stroke-width="2"/>`),
};

/** Ícones das abas do criador. */
export const TAB_ICONS = {
  tipo: svg(`<circle cx="18" cy="24" r="8" fill="#ffd6b0" ${STROKE}/><rect x="11" y="33" width="14" height="22" rx="6" fill="#7fd4ff" ${STROKE}/><circle cx="38" cy="32" r="7" fill="#ffd6b0" ${STROKE}/><rect x="32" y="40" width="12" height="15" rx="5" fill="#ff8fc8" ${STROKE}/><circle cx="53" cy="44" r="6" fill="#ffd6b0" ${STROKE}/><rect x="48" y="50" width="10" height="7" rx="3" fill="#ffe066" ${STROKE}/>`),
  tamanho: svg(`<path d="M32 6 V58 M22 16 L32 6 L42 16 M22 48 L32 58 L42 48" fill="none" ${STROKE} stroke-width="5"/>`),
  pele: svg(`<path d="M32 8 C44 24 50 32 50 40 a18 18 0 0 1-36 0 C14 32 20 24 32 8z" fill="#eab58f" ${STROKE}/>`),
  olhos: svg(`<ellipse cx="32" cy="32" rx="26" ry="16" fill="#ffffff" ${STROKE}/><circle cx="32" cy="32" r="11" fill="#3b82f6" ${STROKE}/><circle cx="32" cy="32" r="5" fill="#1d2a4a"/><circle cx="28" cy="28" r="3" fill="#fff"/>`),
  bochechas: svg(`<circle cx="32" cy="32" r="24" fill="#ffe3cf" ${STROKE}/><ellipse cx="19" cy="38" rx="7" ry="4.5" fill="#ff8fb1"/><ellipse cx="45" cy="38" rx="7" ry="4.5" fill="#ff8fb1"/><circle cx="24" cy="28" r="3" fill="#4a2a42"/><circle cx="40" cy="28" r="3" fill="#4a2a42"/>`),
  cabelo: svg(`<path d="M10 40 C8 14 56 14 54 40 C50 30 44 26 32 28 C20 26 14 30 10 40z" fill="#6b4226" ${STROKE}/><circle cx="32" cy="38" r="14" fill="#ffd6b0" ${STROKE}/>`),
  roupa: svg(`<path d="M22 10 L10 18 L14 30 L20 28 V56 H44 V28 L50 30 L54 18 L42 10 C40 16 24 16 22 10z" fill="#ff8fc8" ${STROKE}/>`),
  nome: svg(`<rect x="8" y="16" width="48" height="32" rx="8" fill="#ffffff" ${STROKE}/><path d="M18 32 h18" ${STROKE} stroke-width="4"/><path d="M44 24 v16" stroke="#ff6fa5" stroke-width="4" stroke-linecap="round"/>`),
};

/** Ícones das abas da mochila. */
export const SLOT_ICONS = {
  roupa: TAB_ICONS.roupa,
  cabeca: svg(`<path d="M10 40 a22 22 0 0 1 44 0z" fill="#ff7aa8" ${STROKE}/><rect x="8" y="38" width="48" height="10" rx="5" fill="#fff" ${STROKE}/><circle cx="32" cy="14" r="6" fill="#fff" ${STROKE}/>`),
  rosto: svg(`<path d="M8 28 h48" ${STROKE}/><circle cx="20" cy="34" r="11" fill="#ffc2dc" ${STROKE}/><circle cx="44" cy="34" r="11" fill="#ffc2dc" ${STROKE}/>`),
  pescoco: svg(`<path d="M12 18 Q32 52 52 18" fill="none" ${STROKE}/>${[0, 1, 2, 3, 4, 5, 6].map((i) => { const t = i / 6; const x = 12 + 40 * t; const y = 18 + 34 * 4 * t * (1 - t) * 0.5 * 1.0; return `<circle cx="${x}" cy="${y}" r="5" fill="#fff8f0" ${STROKE} stroke-width="2"/>`; }).join('')}`),
  pulso: svg(`<ellipse cx="32" cy="32" rx="22" ry="12" fill="none" stroke="#4a2a42" stroke-width="10"/><ellipse cx="32" cy="32" rx="22" ry="12" fill="none" stroke="#ffd23f" stroke-width="6"/><circle cx="32" cy="44" r="6" fill="#ff6fb5" ${STROKE} stroke-width="2"/>`),
};

import { h, button, hiDpiCanvas, iconSpan } from '../dom.js';
import { ICONS } from '../icons.js';
import { renderItemIcon } from '../../character/CharacterRenderer.js';
import { ITEM_BY_ID } from '../../data/catalog.js';
import { CONFIG } from '../../config.js';
import { sfx } from '../../audio/sound.js';
import { confetti } from '../fx.js';

/** Arte do potinho: substitua por /assets/mundo/potinho.png e potinho_tampa.png quando quiser. */
const artPot = import.meta.glob('/assets/mundo/potinho*.{png,webp}', { eager: true, query: '?url', import: 'default' });
const artUrl = (name) => Object.entries(artPot).find(([p]) => p.endsWith(`/${name}.png`) || p.endsWith(`/${name}.webp`))?.[1];

const POT_SVG = `
<svg viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="potg" cx="35%" cy="35%" r="75%">
      <stop offset="0" stop-color="#ffb8e3"/><stop offset="1" stop-color="#b56cff"/>
    </radialGradient>
  </defs>
  <ellipse cx="100" cy="160" rx="70" ry="9" fill="rgba(0,0,0,.18)"/>
  <path d="M40 46 C10 70 14 150 100 156 C186 150 190 70 160 46 Z" fill="url(#potg)" stroke="#4a2a42" stroke-width="5" stroke-linejoin="round"/>
  <path d="M60 80 C56 96 58 116 68 128" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="8" stroke-linecap="round"/>
  <path d="M100 118 C84 104 72 96 80 84 C86 76 96 78 100 88 C104 78 114 76 120 84 C128 96 116 104 100 118Z" fill="#ffcf33" stroke="#4a2a42" stroke-width="4" stroke-linejoin="round"/>
  <rect x="28" y="34" width="144" height="22" rx="11" fill="#ffcf33" stroke="#4a2a42" stroke-width="5"/>
</svg>`;

const LID_SVG = `
<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
  <path d="M34 82 C34 40 166 40 166 82 Z" fill="#c98bff" stroke="#4a2a42" stroke-width="5" stroke-linejoin="round"/>
  <path d="M60 64 C70 54 86 50 98 50" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="6" stroke-linecap="round"/>
  <path d="M100 8 l7 15 16 2 -12 11 3 16 -14-8 -14 8 3-16 -12-11 16-2z" fill="#ffcf33" stroke="#4a2a42" stroke-width="4" stroke-linejoin="round"/>
</svg>`;

export function PotinhoScreen(app, result, onDone) {
  const potArt = artUrl('potinho');
  const lidArt = artUrl('potinho_tampa');
  const pot = h('div', { class: 'pot', html: potArt ? `<img src="${potArt}" alt="">` : POT_SVG });
  const lid = h('div', { class: 'pot-lid', html: lidArt ? `<img src="${lidArt}" alt="">` : LID_SVG });
  const keys = [0, 1, 2].map((i) => h('span', { class: `fly-key fk-${i}`, html: ICONS.key }));
  const rays = h('div', { class: 'rays' });

  const item = result.item ? ITEM_BY_ID[result.item] : null;
  let rewardVisual;
  if (item) {
    const c = hiDpiCanvas(120, 120, 'reward-icon');
    renderItemIcon(c, item.id);
    rewardVisual = c;
  } else {
    rewardVisual = h('div', { class: 'reward-coins' }, iconSpan('coin', 'big-coin'), `+${result.bonus}`);
  }

  const reward = h(
    'div',
    { class: 'reward' },
    h('p', { class: 'reward-title' }, item ? 'Você ganhou:' : 'Você já tem todos os presentes!'),
    rewardVisual,
    item ? h('p', { class: 'reward-name' }, item.nome) : h('p', { class: 'reward-name' }, 'Moedas de bônus'),
    h('p', { class: 'reward-coins-line' }, iconSpan('coin', 'mini-icon'), `${CONFIG.COINS_PER_KEY * CONFIG.KEYS_PER_ROUND} moedas com as 3 chaves`),
    h(
      'div',
      { class: 'reward-actions' },
      item ? button({ icon: 'bag', label: 'Vestir', cls: 'pink', onClick: () => finish(true) }) : null,
      button({ icon: 'check', label: 'Continuar', cls: 'green', onClick: () => finish(false) }),
    ),
  );

  const el = h(
    'div',
    { class: 'overlay-screen potinho' },
    h('h2', { class: 'pot-title' }, 'Potinho Mágico!'),
    h('div', { class: 'pot-stage' }, rays, ...keys, pot, lid),
    reward,
  );

  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  at(50, () => el.classList.add('step-drop'));
  at(700, () => {
    el.classList.add('step-keys');
    sfx.key();
  });
  at(1700, () => {
    el.classList.add('step-shake');
    sfx.magic();
  });
  at(2600, () => {
    el.classList.add('step-open');
    sfx.fanfare();
    confetti(120);
  });
  at(3300, () => el.classList.add('step-reward'));

  let done = false;
  function finish(goToBag) {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    onDone(goToBag);
  }

  return { el, destroy: () => timers.forEach(clearTimeout) };
}

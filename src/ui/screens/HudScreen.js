import { h, button, muteButton, iconSpan, toast } from '../dom.js';
import { ICONS } from '../icons.js';
import { createJoystick } from '../Joystick.js';
import { session } from '../../game/session.js';
import { sfx } from '../../audio/sound.js';
import { bump } from '../fx.js';
import { CONFIG } from '../../config.js';

const isTouch = () => window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;

export function HudScreen(app) {
  const coinValue = h('span', { class: 'hud-value' }, '0');
  const coinPill = h('div', { class: 'pill coins', 'aria-label': 'Moedas' }, iconSpan('coin', 'pill-icon'), coinValue);
  const keyIcons = [];
  for (let i = 0; i < CONFIG.KEYS_PER_ROUND; i++) keyIcons.push(h('span', { class: 'key-slot' }));
  const keyPill = h('div', { class: 'pill keys', 'aria-label': 'Chaves' }, ...keyIcons);

  let lastCoins = null;
  let lastKeys = null;

  function update(ch) {
    if (!ch) return;
    if (lastCoins !== null && ch.moedas > lastCoins) {
      sfx.coin();
      bump(coinPill);
    }
    lastCoins = ch.moedas;
    coinValue.textContent = String(ch.moedas);
    const got = ch.rodada?.pegas.length || 0;
    keyIcons.forEach((k, i) => {
      const has = i < got;
      k.innerHTML = has ? ICONS.key : ICONS.keyEmpty;
      k.classList.toggle('got', has);
      if (lastKeys !== null && has && i >= lastKeys) bump(k);
    });
    lastKeys = got;
  }

  const joy = createJoystick();
  if (!isTouch()) joy.classList.add('hidden');
  const showJoy = () => joy.classList.remove('hidden');
  window.addEventListener('touchstart', showJoy, { once: true, passive: true });

  let hintReady = true;
  const hintBtn = button({
    icon: 'hint',
    cls: 'round blue hud-btn',
    title: 'Dica',
    onClick: () => {
      if (!hintReady) return;
      if (app.hint()) {
        hintReady = false;
        hintBtn.classList.add('cooldown');
        setTimeout(() => {
          hintReady = true;
          hintBtn.classList.remove('cooldown');
        }, CONFIG.HINT_SECONDS * 1000 + 2000);
      }
    },
  });

  const el = h(
    'div',
    { class: 'screen hud' },
    h('div', { class: 'hud-top-left' }, coinPill, keyPill),
    h(
      'div',
      { class: 'hud-top-right' },
      muteButton(),
      button({ icon: 'home', cls: 'round small yellow', title: 'Sair', onClick: () => app.exitWorld() }),
    ),
    h(
      'div',
      { class: 'hud-bottom-right' },
      hintBtn,
      button({ icon: 'shop', cls: 'round hud-btn', title: 'Loja', onClick: () => app.openShop() }),
      button({ icon: 'bag', cls: 'round pink hud-btn', title: 'Mochila', onClick: () => app.openInventory() }),
    ),
    joy,
  );

  const off = session.on('change', update);
  update(session.character);

  const round = session.character?.rodada;
  if (round && round.pegas.length === 0) {
    setTimeout(() => toast(`Ache as <b>3 chaves</b> escondidas!${isTouch() ? '' : '<br><small>Use as setas ou W A S D para andar</small>'}`, 3600), 400);
  }

  return {
    el,
    destroy() {
      off();
      window.removeEventListener('touchstart', showJoy);
    },
    announceNewRound() {
      update(session.character);
      toast('As chaves se esconderam de novo!<br><small>Vamos procurar?</small>', 3200);
    },
  };
}

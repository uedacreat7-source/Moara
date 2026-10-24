/** Ajudantes para montar as telas em HTML. */
import { ICONS } from './icons.js';
import { sfx, setMuted, isMuted } from '../audio/sound.js';
import * as storage from '../data/storage.js';

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Botão grande com ícone e (opcional) texto. */
export function button({ icon, label, cls = '', onClick, sound = 'click', title }) {
  const b = h('button', { class: `btn ${cls}`, type: 'button', 'aria-label': title || label || icon, title: title || label });
  if (icon) b.append(h('span', { class: 'btn-icon', html: ICONS[icon] || icon }));
  if (label) b.append(h('span', { class: 'btn-label' }, label));
  b.addEventListener('click', (e) => {
    if (sound) sfx[sound]?.();
    onClick?.(e);
  });
  return b;
}

export function iconSpan(name, cls = 'icon') {
  return h('span', { class: cls, html: ICONS[name] });
}

export function muteButton(cls = 'round small') {
  const b = button({ icon: isMuted() ? 'mute' : 'sound', cls, title: 'Som', sound: null });
  b.addEventListener('click', () => {
    const m = !isMuted();
    setMuted(m);
    b.querySelector('.btn-icon').innerHTML = ICONS[m ? 'mute' : 'sound'];
    if (!m) sfx.click();
    storage.saveSettings({ muted: m });
  });
  return b;
}

/** Janela de confirmação. Resolve true (sim) ou false (não). */
export function confirmBox(content, { yes = 'check', no = 'close' } = {}) {
  return new Promise((resolve) => {
    const close = (v) => {
      back.classList.add('leaving');
      setTimeout(() => back.remove(), 180);
      resolve(v);
    };
    const back = h(
      'div',
      { class: 'modal-back' },
      h(
        'div',
        { class: 'modal pop-in' },
        h('div', { class: 'modal-content' }, content),
        h(
          'div',
          { class: 'modal-actions' },
          button({ icon: no, cls: 'round red', title: 'Não', onClick: () => close(false) }),
          button({ icon: yes, cls: 'round green', title: 'Sim', onClick: () => close(true) }),
        ),
      ),
    );
    document.getElementById('modals').append(back);
  });
}

/** Mensagem rápida no topo da tela. */
export function toast(html, ms = 2600) {
  const host = document.getElementById('modals');
  const t = h('div', { class: 'toast', html });
  host.append(t);
  setTimeout(() => t.classList.add('leaving'), ms);
  setTimeout(() => t.remove(), ms + 400);
}

/** Canvas que já se ajusta à densidade de pixels da tela. */
export function hiDpiCanvas(cssW, cssH, cls = '') {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const c = h('canvas', { class: cls, width: Math.round(cssW * dpr), height: Math.round(cssH * dpr) });
  c.style.width = `${cssW}px`;
  c.style.height = `${cssH}px`;
  return c;
}

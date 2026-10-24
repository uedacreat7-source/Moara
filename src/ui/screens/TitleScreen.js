import { h, button, muteButton, hiDpiCanvas } from '../dom.js';
import { ICONS } from '../icons.js';
import { unlockAudio, sfx } from '../../audio/sound.js';
import { renderToCanvas } from '../../character/CharacterRenderer.js';

const FRIENDS = [
  { look: { tipo: 'adulto', pele: 'pele_04', olhos: 'castanho', bochechas: 'rosa', cabelo: 'longo', cabeloCor: 'castanho' }, eq: { roupa: 'roupa_vestido_flores', cabeca: 'acess_chapeu_sol' } },
  { look: { tipo: 'crianca', pele: 'pele_02', olhos: 'azul', bochechas: 'rosa', cabelo: 'chuquinhas', cabeloCor: 'ruivo' }, eq: { roupa: 'roupa_vestido_rosa', cabeca: 'acess_coroa' } },
  { look: { tipo: 'bebe', pele: 'pele_06', olhos: 'preto', bochechas: 'coral', cabelo: 'topete', cabeloCor: 'preto' }, eq: { roupa: 'roupa_macacao_ursinho', rosto: 'acess_chupeta' } },
];

export function TitleScreen(app) {
  const friends = h('div', { class: 'title-friends' });
  FRIENDS.forEach((f, i) => {
    const c = hiDpiCanvas(110, 143, `friend friend-${i}`);
    renderToCanvas(c, f.look, f.eq);
    friends.append(c);
  });

  const el = h(
    'div',
    { class: 'screen title-screen' },
    h('div', { class: 'clouds' }, h('i'), h('i'), h('i')),
    h('div', { class: 'top-right' }, muteButton()),
    h(
      'div',
      { class: 'title-box' },
      h('div', { class: 'title-keys' }, ...[0, 1, 2].map((i) => h('span', { class: `tk tk-${i}`, html: ICONS.key }))),
      h('h1', { class: 'title' }, h('span', {}, 'O Segredo'), h('span', { class: 'small' }, 'das'), h('span', {}, 'Três Chaves')),
      h('p', { class: 'byline' }, 'um jogo criado pela Moara'),
      button({
        icon: 'play',
        label: 'Jogar',
        cls: 'big pink play-btn',
        sound: null,
        onClick: () => {
          unlockAudio();
          sfx.pop();
          app.slots();
        },
      }),
    ),
    h('div', { class: 'hills' }, friends),
  );
  return { el };
}

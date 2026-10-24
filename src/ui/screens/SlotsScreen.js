import { h, button, muteButton, confirmBox, hiDpiCanvas, iconSpan } from '../dom.js';
import { renderToCanvas } from '../../character/CharacterRenderer.js';
import * as storage from '../../data/storage.js';
import { CONFIG } from '../../config.js';
import { sfx } from '../../audio/sound.js';

export function SlotsScreen(app, highlightId) {
  const grid = h('div', { class: 'slots-grid' });

  const el = h(
    'div',
    { class: 'screen slots-screen' },
    h(
      'header',
      { class: 'screen-header' },
      button({ icon: 'back', cls: 'round small blue', title: 'Voltar', onClick: () => app.title() }),
      h('h2', {}, 'Quem vai brincar?'),
      muteButton(),
    ),
    grid,
  );

  async function render() {
    const chars = await storage.listCharacters();
    grid.innerHTML = '';
    for (let i = 0; i < CONFIG.MAX_SLOTS; i++) {
      const ch = chars[i];
      if (!ch) {
        grid.append(
          h(
            'button',
            {
              class: 'slot empty',
              type: 'button',
              'aria-label': 'Criar personagem',
              onClick: () => {
                sfx.pop();
                app.creator(null);
              },
            },
            iconSpan('plus', 'slot-plus'),
            h('span', { class: 'slot-name' }, 'Criar'),
          ),
        );
        continue;
      }
      const canvas = hiDpiCanvas(120, 156, 'slot-char');
      renderToCanvas(canvas, ch.look, ch.equipado, { showSize: true });
      const card = h(
        'div',
        { class: `slot filled ${ch.id === highlightId ? 'highlight' : ''}` },
        h(
          'button',
          {
            class: 'slot-play',
            type: 'button',
            'aria-label': `Jogar com ${ch.nome}`,
            onClick: () => {
              sfx.pop();
              app.play(ch.id);
            },
          },
          canvas,
          h('span', { class: 'slot-name' }, ch.nome),
          h('span', { class: 'slot-coins' }, iconSpan('coin', 'mini-icon'), String(ch.moedas)),
        ),
        h(
          'div',
          { class: 'slot-tools' },
          button({ icon: 'edit', cls: 'round tiny yellow', title: 'Editar', onClick: () => app.creator(ch.id) }),
          button({
            icon: 'trash',
            cls: 'round tiny white',
            title: 'Apagar',
            onClick: async () => {
              const pic = hiDpiCanvas(110, 143);
              renderToCanvas(pic, ch.look, ch.equipado);
              const ok = await confirmBox(h('div', { class: 'confirm-delete' }, pic, h('p', {}, `Apagar ${ch.nome}?`)));
              if (ok) {
                sfx.pop();
                await storage.deleteCharacter(ch.id);
                render();
              }
            },
          }),
        ),
      );
      grid.append(card);
    }
  }
  render();

  return { el };
}

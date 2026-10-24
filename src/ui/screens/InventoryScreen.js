import { h, button, hiDpiCanvas } from '../dom.js';
import { SLOT_ICONS } from '../icons.js';
import { renderToCanvas, renderItemIcon } from '../../character/CharacterRenderer.js';
import { SLOTS, ITEM_BY_ID } from '../../data/catalog.js';
import { session } from '../../game/session.js';
import { sfx } from '../../audio/sound.js';

/** Mochila: vestir e trocar os itens que o personagem já tem. */
export function InventoryScreen(app, highlight = []) {
  const ch = session.character;
  const firstNew = highlight.length ? ITEM_BY_ID[highlight[0]]?.slot : null;
  let slot = firstNew || 'roupa';

  const preview = hiDpiCanvas(200, 260, 'inv-preview');
  const tabs = h('div', { class: 'tabs small-tabs' });
  const grid = h('div', { class: 'item-grid' });

  function refreshPreview() {
    renderToCanvas(preview, ch.look, ch.equipado);
    preview.classList.remove('boing');
    void preview.offsetWidth;
    preview.classList.add('boing');
  }

  function renderTabs() {
    tabs.innerHTML = '';
    for (const s of SLOTS) {
      const count = ch.inventario.filter((id) => ITEM_BY_ID[id]?.slot === s.id).length;
      const isNew = highlight.some((id) => ITEM_BY_ID[id]?.slot === s.id);
      tabs.append(
        h(
          'button',
          {
            class: `tab ${slot === s.id ? 'active' : ''}`,
            type: 'button',
            'aria-label': s.nome,
            onClick: () => {
              slot = s.id;
              renderTabs();
              renderGrid();
            },
          },
          h('span', { class: 'tab-icon', html: SLOT_ICONS[s.id] }),
          h('span', { class: 'tab-label' }, s.nome),
          count ? h('span', { class: `tab-count ${isNew ? 'new' : ''}` }, String(count)) : null,
        ),
      );
    }
  }

  function renderGrid() {
    grid.innerHTML = '';
    const items = ch.inventario.filter((id) => ITEM_BY_ID[id]?.slot === slot);
    if (!items.length) {
      grid.append(
        h('div', { class: 'empty-msg' }, h('p', {}, 'Ainda não tem nada aqui.'), h('p', { class: 'small' }, 'Ache as 3 chaves para abrir o potinho ou visite a loja!')),
      );
      return;
    }
    for (const id of items) {
      const it = ITEM_BY_ID[id];
      const c = hiDpiCanvas(76, 76);
      renderItemIcon(c, id);
      const on = ch.equipado[slot] === id;
      grid.append(
        h(
          'button',
          {
            class: `item-card ${on ? 'equipped' : ''} ${highlight.includes(id) ? 'is-new' : ''}`,
            type: 'button',
            'aria-label': it.nome,
            onClick: async () => {
              const changed = await session.toggleEquip(id);
              if (changed) {
                sfx.pop();
                refreshPreview();
                renderGrid();
              }
            },
          },
          c,
          h('span', { class: 'item-name' }, it.nome),
          highlight.includes(id) ? h('span', { class: 'badge-new' }, 'Novo!') : null,
        ),
      );
    }
  }

  const el = h(
    'div',
    { class: 'overlay-screen inventory' },
    h(
      'div',
      { class: 'panel pop-in' },
      h(
        'header',
        { class: 'panel-header pink' },
        h('h2', {}, 'Mochila'),
        button({ icon: 'close', cls: 'round small red', title: 'Fechar', onClick: () => app.closeOverlay() }),
      ),
      h(
        'div',
        { class: 'panel-body inv-body' },
        h('div', { class: 'preview-box small' }, h('div', { class: 'pedestal' }), preview),
        h('div', { class: 'inv-right' }, tabs, grid),
      ),
    ),
  );

  renderTabs();
  renderGrid();
  renderToCanvas(preview, ch.look, ch.equipado);
  return { el };
}

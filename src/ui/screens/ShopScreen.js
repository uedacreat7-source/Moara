import { h, button, hiDpiCanvas, iconSpan, confirmBox } from '../dom.js';
import { renderItemIcon } from '../../character/CharacterRenderer.js';
import { PACKS, ITEM_BY_ID } from '../../data/catalog.js';
import { session } from '../../game/session.js';
import { sfx } from '../../audio/sound.js';
import { confetti, shake, bump } from '../fx.js';

function itemIcons(ids, size = 46) {
  return h(
    'div',
    { class: 'pack-items' },
    ids.map((id) => {
      const c = hiDpiCanvas(size, size, 'pack-item');
      renderItemIcon(c, id);
      c.title = ITEM_BY_ID[id]?.nome || '';
      return c;
    }),
  );
}

/** Loja: troca moedas por pacotes de itens. */
export function ShopScreen(app) {
  const coinValue = h('span', { class: 'hud-value' });
  const coinPill = h('div', { class: 'pill coins' }, iconSpan('coin', 'pill-icon'), coinValue);
  const list = h('div', { class: 'pack-list' });

  function render() {
    const ch = session.character;
    coinValue.textContent = String(ch.moedas);
    list.innerHTML = '';
    for (const p of PACKS) {
      const owned = ch.pacotes.includes(p.id);
      const canBuy = ch.moedas >= p.preco;
      const card = h(
        'div',
        { class: `pack-card ${owned ? 'owned' : ''}`, style: { '--pack': p.cor } },
        h('h3', {}, p.nome),
        itemIcons(p.itens),
        owned
          ? h('div', { class: 'pack-owned' }, iconSpan('check', 'mini-icon'), 'É seu!')
          : button({
            icon: 'coin',
            label: String(p.preco),
            cls: `price ${canBuy ? 'green' : 'locked'}`,
            title: `Comprar ${p.nome}`,
            sound: null,
            onClick: () => buy(p, card),
          }),
      );
      list.append(card);
    }
  }

  async function buy(pack, card) {
    const ch = session.character;
    if (ch.moedas < pack.preco) {
      sfx.error();
      shake(card);
      bump(coinPill);
      const falta = pack.preco - ch.moedas;
      const msg = card.querySelector('.pack-msg') || h('p', { class: 'pack-msg' });
      msg.innerHTML = `Faltam <b>${falta}</b> moedas.<br>Ache mais chaves!`;
      card.append(msg);
      return;
    }
    sfx.pop();
    const ok = await confirmBox(
      h('div', { class: 'confirm-buy' }, h('h3', {}, pack.nome), itemIcons(pack.itens, 54), h('p', { class: 'price-line' }, iconSpan('coin', 'mini-icon'), String(pack.preco))),
    );
    if (!ok) return;
    const res = await session.buy(pack.id);
    if (!res.ok) return;
    sfx.fanfare();
    confetti(90);
    render();
    const wear = await confirmBox(
      h('div', { class: 'confirm-buy' }, h('h3', {}, 'Oba! Agora é seu:'), itemIcons(pack.itens, 54), h('p', { class: 'small' }, 'Vestir agora?')),
      { yes: 'bag', no: 'close' },
    );
    if (wear) app.openInventory(pack.itens);
  }

  const el = h(
    'div',
    { class: 'overlay-screen shop' },
    h(
      'div',
      { class: 'panel pop-in' },
      h(
        'header',
        { class: 'panel-header blue' },
        h('h2', {}, 'Loja'),
        coinPill,
        button({ icon: 'close', cls: 'round small red', title: 'Fechar', onClick: () => app.closeOverlay() }),
      ),
      h('div', { class: 'panel-body' }, list),
    ),
  );

  render();
  return { el };
}

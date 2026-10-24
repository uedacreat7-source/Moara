import { h, button, hiDpiCanvas } from '../dom.js';
import { TAB_ICONS } from '../icons.js';
import { renderToCanvas, renderPortrait, renderItemIcon } from '../../character/CharacterRenderer.js';
import {
  TIPOS, TAMANHOS, PELES, OLHOS, BOCHECHAS, CABELO_ESTILOS, CABELO_CORES, NOMES_SUGERIDOS, DEFAULT_LOOK,
} from '../../character/options.js';
import { ITEM_BY_ID, STARTER_ITEMS } from '../../data/catalog.js';
import * as storage from '../../data/storage.js';
import { newCharacter } from '../../game/rules.js';
import { sfx } from '../../audio/sound.js';
import { confetti } from '../fx.js';

const TABS = [
  { id: 'tipo', nome: 'Tipo' },
  { id: 'tamanho', nome: 'Tamanho' },
  { id: 'pele', nome: 'Pele' },
  { id: 'olhos', nome: 'Olhos' },
  { id: 'bochechas', nome: 'Bochechas' },
  { id: 'cabelo', nome: 'Cabelo' },
  { id: 'roupa', nome: 'Roupa' },
  { id: 'nome', nome: 'Nome' },
];

export function CreatorScreen(app, editId) {
  let ch = null;
  const look = { ...DEFAULT_LOOK };
  let nome = NOMES_SUGERIDOS[Math.floor(Math.random() * NOMES_SUGERIDOS.length)];
  let roupa = STARTER_ITEMS[0];
  let tab = 'tipo';

  const preview = hiDpiCanvas(230, 299, 'creator-preview');
  const nameTag = h('div', { class: 'name-tag' });
  const tabsBar = h('div', { class: 'tabs', role: 'tablist' });
  const options = h('div', { class: 'options' });

  const equipped = () => (ch ? { ...ch.equipado, roupa } : { roupa });

  function refresh(bounce = true) {
    renderToCanvas(preview, look, equipped(), { showSize: true });
    nameTag.textContent = nome || '...';
    if (bounce) {
      preview.classList.remove('boing');
      void preview.offsetWidth;
      preview.classList.add('boing');
    }
  }

  function choose(fn) {
    return () => {
      sfx.pop();
      fn();
      refresh();
      renderOptions();
    };
  }

  function opt(selected, content, onClick, extra = '', label) {
    return h('button', { class: `opt ${extra} ${selected ? 'selected' : ''}`, type: 'button', 'aria-label': label, onClick: choose(onClick) }, content);
  }

  function swatch(color, selected, onClick, label, extra = '') {
    return opt(selected, h('span', { class: 'swatch-dot', style: { background: color || '#ffffff' } }), onClick, `swatch ${extra} ${color ? '' : 'none'}`, label);
  }

  function miniChar(l, eq, opts = {}, w = 74, hgt = 96) {
    const c = hiDpiCanvas(w, hgt);
    renderToCanvas(c, l, eq, opts);
    return c;
  }

  function renderOptions() {
    options.innerHTML = '';
    const grid = h('div', { class: 'opt-grid' });
    options.append(grid);
    switch (tab) {
      case 'tipo':
        for (const t of TIPOS) {
          grid.append(opt(look.tipo === t.id, [miniChar({ ...look, tipo: t.id }, equipped()), h('span', { class: 'opt-label' }, t.nome)], () => { look.tipo = t.id; }, 'card', t.nome));
        }
        break;
      case 'tamanho':
        for (const t of TAMANHOS) {
          grid.append(opt(look.tamanho === t.id, [miniChar({ ...look, tamanho: t.id }, equipped(), { showSize: true }), h('span', { class: 'opt-label' }, t.nome)], () => { look.tamanho = t.id; }, 'card', t.nome));
        }
        break;
      case 'pele':
        for (const p of PELES) grid.append(swatch(p.cor, look.pele === p.id, () => { look.pele = p.id; }, p.id));
        break;
      case 'olhos':
        for (const o of OLHOS) grid.append(swatch(o.cor, look.olhos === o.id, () => { look.olhos = o.id; }, o.id, 'eye'));
        break;
      case 'bochechas':
        for (const b of BOCHECHAS) grid.append(swatch(b.cor, look.bochechas === b.id, () => { look.bochechas = b.id; }, b.id, 'cheek'));
        break;
      case 'cabelo': {
        for (const e of CABELO_ESTILOS) {
          const c = hiDpiCanvas(68, 68);
          renderPortrait(c, { ...look, cabelo: e.id }, {});
          grid.append(opt(look.cabelo === e.id, [c, h('span', { class: 'opt-label' }, e.nome)], () => { look.cabelo = e.id; }, 'card portrait', e.nome));
        }
        const colors = h('div', { class: 'opt-grid colors' });
        for (const c of CABELO_CORES) colors.append(swatch(c.cor, look.cabeloCor === c.id, () => { look.cabeloCor = c.id; }, c.id));
        options.append(colors);
        break;
      }
      case 'roupa': {
        const owned = ch ? ch.inventario.filter((id) => ITEM_BY_ID[id]?.slot === 'roupa') : STARTER_ITEMS;
        for (const id of owned) {
          const c = hiDpiCanvas(70, 70);
          renderItemIcon(c, id);
          grid.append(opt(roupa === id, [c, h('span', { class: 'opt-label' }, ITEM_BY_ID[id].nome)], () => { roupa = id; }, 'card item', ITEM_BY_ID[id].nome));
        }
        break;
      }
      case 'nome': {
        const input = h('input', { class: 'name-input', maxlength: 12, value: nome, 'aria-label': 'Nome', autocomplete: 'off', spellcheck: 'false' });
        input.addEventListener('input', () => {
          nome = input.value.trim();
          refresh(false);
        });
        const dice = button({
          icon: 'dice',
          cls: 'round',
          title: 'Sortear nome',
          sound: 'pop',
          onClick: () => {
            nome = NOMES_SUGERIDOS[Math.floor(Math.random() * NOMES_SUGERIDOS.length)];
            input.value = nome;
            refresh();
          },
        });
        grid.classList.add('name-row');
        grid.append(input, dice);
        break;
      }
      default:
    }
  }

  function renderTabs() {
    tabsBar.innerHTML = '';
    for (const t of TABS) {
      tabsBar.append(
        h(
          'button',
          {
            class: `tab ${tab === t.id ? 'active' : ''}`,
            type: 'button',
            role: 'tab',
            'aria-label': t.nome,
            onClick: () => {
              sfx.click();
              tab = t.id;
              renderTabs();
              renderOptions();
            },
          },
          h('span', { class: 'tab-icon', html: TAB_ICONS[t.id] }),
          h('span', { class: 'tab-label' }, t.nome),
        ),
      );
    }
  }

  async function save() {
    const finalName = (nome || '').trim() || 'Amiguinho';
    let saved;
    if (ch) {
      ch.look = { ...look };
      ch.nome = finalName;
      ch.equipado.roupa = roupa;
      saved = await storage.saveCharacter(ch);
    } else {
      saved = await storage.saveCharacter(newCharacter(look, finalName, roupa));
    }
    sfx.fanfare();
    confetti(60);
    app.slots(saved.id);
  }

  const el = h(
    'div',
    { class: 'screen creator-screen' },
    h(
      'header',
      { class: 'screen-header' },
      button({ icon: 'back', cls: 'round small blue', title: 'Voltar', onClick: () => app.slots() }),
      h('h2', {}, editId ? 'Editar' : 'Criar personagem'),
      h('span', { class: 'header-spacer' }),
    ),
    h(
      'div',
      { class: 'creator-body' },
      h('div', { class: 'preview-box' }, h('div', { class: 'pedestal' }), preview, nameTag),
      h('div', { class: 'creator-panel' }, tabsBar, options),
    ),
    h('footer', { class: 'creator-footer' }, button({ icon: 'check', label: 'Pronto!', cls: 'big green', sound: null, onClick: save })),
  );

  (async () => {
    if (editId) {
      ch = await storage.getCharacter(editId);
      if (ch) {
        Object.assign(look, ch.look);
        nome = ch.nome;
        roupa = ch.equipado.roupa;
      }
    }
    renderTabs();
    renderOptions();
    refresh(false);
  })();

  return { el };
}

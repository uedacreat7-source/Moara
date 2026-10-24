/**
 * Controla o fluxo entre as telas:
 * Início → Personagens → (Criador) → Mundo (+ Mochila, Loja, Potinho)
 */
import { session } from './game/session.js';
import { roundComplete } from './game/rules.js';
import { music, sfx } from './audio/sound.js';
import { TitleScreen } from './ui/screens/TitleScreen.js';
import { SlotsScreen } from './ui/screens/SlotsScreen.js';
import { CreatorScreen } from './ui/screens/CreatorScreen.js';
import { HudScreen } from './ui/screens/HudScreen.js';
import { InventoryScreen } from './ui/screens/InventoryScreen.js';
import { ShopScreen } from './ui/screens/ShopScreen.js';
import { PotinhoScreen } from './ui/screens/PotinhoScreen.js';

let screen = null;
let overlay = null;
let afterOverlay = null;

function show(el) {
  screen?.destroy?.();
  const root = document.getElementById('screens');
  root.innerHTML = '';
  screen = el;
  root.append(el.el);
}

const world = () => app.game?.scene.getScene('World');
const worldRunning = () => app.game?.scene.isActive('World') || app.game?.scene.isPaused('World');

export const app = {
  game: null,

  title() {
    show(TitleScreen(app));
  },

  slots(highlightId) {
    show(SlotsScreen(app, highlightId));
  },

  creator(id = null) {
    show(CreatorScreen(app, id));
  },

  async play(id) {
    await session.start(id);
    music.start();
    show(HudScreen(app));
    document.body.classList.add('in-world');
    const start = () => {
      app.game.scene.start('World');
      // se saiu do jogo logo depois de pegar a 3ª chave, o potinho abre agora
      if (roundComplete(session.character)) setTimeout(() => app.game.events.emit('potinho'), 900);
    };
    if (app.game.registry.get('texturesReady')) start();
    else app.game.events.once('textures-ready', start);
  },

  exitWorld() {
    app.closeOverlay();
    app.game.scene.stop('World');
    document.body.classList.remove('in-world');
    music.stop();
    const id = session.character?.id;
    session.end();
    app.slots(id);
  },

  openOverlay(view) {
    app.closeOverlay(false);
    overlay = view;
    document.getElementById('overlay').append(view.el);
    if (worldRunning()) app.game.scene.pause('World');
  },

  closeOverlay(resume = true) {
    if (!overlay) return;
    overlay.destroy?.();
    overlay.el.remove();
    overlay = null;
    if (resume && app.game?.scene.isPaused('World')) app.game.scene.resume('World');
    if (resume && afterOverlay) {
      const fn = afterOverlay;
      afterOverlay = null;
      setTimeout(fn, 250);
    }
  },

  openInventory(highlight = []) {
    app.openOverlay(InventoryScreen(app, highlight));
  },

  openShop() {
    app.openOverlay(ShopScreen(app));
  },

  hint() {
    return world()?.showHint();
  },

  async potinho() {
    const res = await session.openPotinho();
    if (!res.ok) return;
    app.openOverlay(
      PotinhoScreen(app, res, (goToBag) => {
        app.closeOverlay();
        world()?.spawnKeys(true);
        if (goToBag && res.item) {
          app.openInventory([res.item]);
          afterOverlay = () => screen?.announceNewRound?.();
        } else {
          screen?.announceNewRound?.();
        }
      }),
    );
  },

  init(game) {
    app.game = game;
    game.events.on('potinho', () => {
      sfx.magic();
      app.potinho();
    });
  },
};

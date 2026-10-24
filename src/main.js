import Phaser from 'phaser';
import './ui/ui.css';
import { BootScene } from './scenes/BootScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { preloadCharacterArt } from './character/layers.js';
import { getSettings } from './data/storage.js';
import { setMuted } from './audio/sound.js';
import { app } from './app.js';

/** Nitidez da tela, limitada para não pesar em tablets e computadores (máx. ~2,4 milhões de pixels). */
const dpr = () => {
  const ideal = Math.min(window.devicePixelRatio || 1, 2);
  const area = window.innerWidth * window.innerHeight;
  return Math.max(1, Math.min(ideal, Math.sqrt(2.4e6 / area)));
};

function createGame() {
  const ratio = dpr();
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#9be27a',
    scale: {
      mode: Phaser.Scale.NONE,
      width: window.innerWidth * ratio,
      height: window.innerHeight * ratio,
      zoom: 1 / ratio,
    },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [BootScene, WorldScene],
    banner: false,
    input: { keyboard: true },
  });
  game.registry.set('dpr', ratio);

  const resize = () => {
    const r = dpr();
    game.registry.set('dpr', r);
    game.scale.resize(window.innerWidth * r, window.innerHeight * r);
    game.scale.setZoom(1 / r);
  };
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  return game;
}

async function start() {
  const [settings] = await Promise.all([getSettings(), preloadCharacterArt(), document.fonts?.ready]);
  setMuted(!!settings.muted);
  const game = createGame();
  app.init(game);
  if (import.meta.env.DEV) window.__moara = { app, game };
  app.title();
  document.getElementById('loading')?.remove();
}

// Evita zoom com dois toques e o menu de "segurar" no celular.
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
document.addEventListener('contextmenu', (e) => e.preventDefault());

start();

import Phaser from 'phaser';
import { createWorldTextures } from './worldTextures.js';

/** Artes do mundo feitas depois (Google Flow): /assets/mundo/<nome>.png */
const worldArt = import.meta.glob('/assets/mundo/*.{png,webp}', { eager: true, query: '?url', import: 'default' });

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    for (const [path, url] of Object.entries(worldArt)) {
      const key = path.split('/').pop().replace(/\.(png|webp)$/, '');
      this.load.image(key, url);
    }
  }

  create() {
    createWorldTextures(this);
    this.game.registry.set('texturesReady', true);
    this.game.events.emit('textures-ready');
  }
}

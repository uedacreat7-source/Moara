/**
 * Sessão de jogo: o personagem escolhido + salvar automático.
 * Telas e cena do mundo conversam por aqui (eventos 'change', 'equip').
 */
import * as storage from '../data/storage.js';
import * as rules from './rules.js';

const listeners = new Map();

export const session = {
  character: null,

  on(evt, fn) {
    if (!listeners.has(evt)) listeners.set(evt, new Set());
    listeners.get(evt).add(fn);
    return () => listeners.get(evt).delete(fn);
  },

  emit(evt, data) {
    listeners.get(evt)?.forEach((fn) => fn(data));
  },

  async start(id) {
    this.character = await storage.getCharacter(id);
    rules.ensureRound(this.character);
    await this.save();
    return this.character;
  },

  async save() {
    if (this.character) await storage.saveCharacter(this.character);
    this.emit('change', this.character);
  },

  async collectKey(spotId) {
    const res = rules.collectKey(this.character, spotId);
    if (res.ok) await this.save();
    return res;
  },

  async openPotinho() {
    const res = rules.openPotinho(this.character);
    if (res.ok) await this.save();
    return res;
  },

  async buy(packId) {
    const res = rules.buyPack(this.character, packId);
    if (res.ok) await this.save();
    return res;
  },

  async toggleEquip(itemId) {
    const changed = rules.toggleEquip(this.character, itemId);
    if (changed) {
      await this.save();
      this.emit('equip', this.character);
    }
    return changed;
  },

  end() {
    this.character = null;
  },
};

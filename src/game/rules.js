/**
 * Regras do jogo (funções puras sobre o objeto do personagem).
 * Não salvam nada: quem chama (session.js) decide quando salvar.
 */
import { CONFIG } from '../config.js';
import { STARTER_ITEMS, POTINHO_REWARDS, PACK_BY_ID, ITEM_BY_ID } from '../data/catalog.js';
import { HIDING_SPOTS, zoneOf } from '../data/worldLayout.js';
import { DEFAULT_LOOK } from '../character/options.js';

const uid = () => `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export function newCharacter(look = DEFAULT_LOOK, nome = 'Amiguinho', roupa = STARTER_ITEMS[0]) {
  return {
    id: uid(),
    nome,
    createdAt: Date.now(),
    look: { ...look },
    moedas: 0,
    inventario: [...STARTER_ITEMS],
    equipado: { roupa, cabeca: null, rosto: null, pescoco: null, pulso: null },
    pacotes: [],
    potinhos: 0,
    rodada: null,
  };
}

/** Sorteia 3 esconderijos em regiões diferentes, evitando os da rodada anterior. */
export function pickSpots(previous = [], rand = Math.random) {
  const pool = HIDING_SPOTS.filter((s) => !previous.includes(s.id));
  const shuffled = [...pool].sort(() => rand() - 0.5);
  const chosen = [];
  const zones = new Set();
  for (const s of shuffled) {
    if (chosen.length === CONFIG.KEYS_PER_ROUND) break;
    if (zones.has(zoneOf(s))) continue;
    zones.add(zoneOf(s));
    chosen.push(s.id);
  }
  for (const s of shuffled) {
    if (chosen.length === CONFIG.KEYS_PER_ROUND) break;
    if (!chosen.includes(s.id)) chosen.push(s.id);
  }
  return chosen;
}

export function ensureRound(ch) {
  if (!ch.rodada) ch.rodada = { numero: 1, esconderijos: pickSpots(), pegas: [] };
  return ch.rodada;
}

/** Pega uma chave. Retorna { ok, moedas, completou }. */
export function collectKey(ch, spotId) {
  const r = ensureRound(ch);
  if (!r.esconderijos.includes(spotId) || r.pegas.includes(spotId)) return { ok: false };
  r.pegas.push(spotId);
  ch.moedas += CONFIG.COINS_PER_KEY;
  return { ok: true, moedas: CONFIG.COINS_PER_KEY, completou: r.pegas.length >= r.esconderijos.length };
}

export function roundComplete(ch) {
  const r = ch.rodada;
  return !!r && r.pegas.length >= r.esconderijos.length;
}

/**
 * Abre o potinho mágico (só com as 3 chaves). Dá o próximo presente que o
 * personagem ainda não tem e começa uma rodada nova com esconderijos novos.
 */
export function openPotinho(ch) {
  if (!roundComplete(ch)) return { ok: false };
  const item = POTINHO_REWARDS.find((id) => !ch.inventario.includes(id)) || null;
  let bonus = 0;
  if (item) ch.inventario.push(item);
  else {
    bonus = CONFIG.POTINHO_BONUS_COINS;
    ch.moedas += bonus;
  }
  ch.potinhos += 1;
  const prev = ch.rodada.esconderijos;
  ch.rodada = { numero: ch.rodada.numero + 1, esconderijos: pickSpots(prev), pegas: [] };
  return { ok: true, item, bonus };
}

export function buyPack(ch, packId) {
  const pack = PACK_BY_ID[packId];
  if (!pack) return { ok: false, motivo: 'inexistente' };
  if (ch.pacotes.includes(packId)) return { ok: false, motivo: 'ja_tem' };
  if (ch.moedas < pack.preco) return { ok: false, motivo: 'sem_moedas', faltam: pack.preco - ch.moedas };
  ch.moedas -= pack.preco;
  ch.pacotes.push(packId);
  const novos = pack.itens.filter((id) => !ch.inventario.includes(id));
  ch.inventario.push(...novos);
  return { ok: true, itens: pack.itens };
}

/** Veste o item; se já estiver vestido, tira (a roupa nunca fica vazia). */
export function toggleEquip(ch, itemId) {
  const it = ITEM_BY_ID[itemId];
  if (!it || !ch.inventario.includes(itemId)) return false;
  if (ch.equipado[it.slot] === itemId) {
    if (it.slot === 'roupa') return false;
    ch.equipado[it.slot] = null;
  } else {
    ch.equipado[it.slot] = itemId;
  }
  return true;
}

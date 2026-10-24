// Verifica se nenhum esconderijo de chave ficou dentro de um obstáculo
// e roda alguns testes rápidos das regras do jogo.  Uso: node scripts/check-world.mjs
import { HIDING_SPOTS, colliders, zoneOf } from '../src/data/worldLayout.js';
import { CONFIG } from '../src/config.js';
import * as rules from '../src/game/rules.js';
import assert from 'node:assert/strict';

const PLAYER_R = 18;
let bad = 0;
for (const s of HIDING_SPOTS) {
  // o centro do jogador precisa conseguir chegar a menos de PICKUP_RADIUS da chave
  for (const c of colliders()) {
    let dist;
    if (c.kind === 'circle') dist = Math.hypot(s.x - c.x, s.y - c.y) - c.r;
    else {
      const dx = Math.max(Math.abs(s.x - c.x) - c.w / 2, 0);
      const dy = Math.max(Math.abs(s.y - c.y) - c.h / 2, 0);
      dist = Math.hypot(dx, dy);
    }
    if (dist + CONFIG.PICKUP_RADIUS - 6 < PLAYER_R) {
      console.log('INALCANÇÁVEL?', s.id, 'perto de', c);
      bad++;
    }
  }
  if (s.x < 110 || s.x > 2290 || s.y < 150 || s.y > 1690) { console.log('FORA DOS LIMITES', s.id); bad++; }
}
assert.equal(bad, 0, 'esconderijos com problema');

// regras
const ch = rules.newCharacter();
let prev = [];
for (let i = 0; i < 200; i++) {
  const r = rules.ensureRound(ch);
  assert.equal(new Set(r.esconderijos).size, 3);
  if (i > 0) assert.ok(r.esconderijos.every((id) => !prev.includes(id)), 'repetiu esconderijo');
  const zones = new Set(r.esconderijos.map((id) => zoneOf(HIDING_SPOTS.find((s) => s.id === id))));
  assert.equal(zones.size, 3, 'zonas repetidas');
  assert.equal(rules.openPotinho(ch).ok, false);
  const before = ch.moedas;
  for (const id of r.esconderijos) assert.ok(rules.collectKey(ch, id).ok);
  assert.equal(rules.collectKey(ch, r.esconderijos[0]).ok, false, 'pegou chave duas vezes');
  assert.equal(ch.moedas - before, 30);
  prev = [...r.esconderijos];
  const p = rules.openPotinho(ch);
  assert.ok(p.ok);
}
assert.equal(ch.potinhos, 200);
const ch2 = rules.newCharacter();
assert.equal(rules.buyPack(ch2, 'pacote_roupas').motivo, 'sem_moedas');
ch2.moedas = 25;
assert.ok(rules.buyPack(ch2, 'pacote_roupas').ok);
assert.equal(ch2.moedas, 5);
assert.equal(rules.buyPack(ch2, 'pacote_roupas').motivo, 'ja_tem');
assert.ok(rules.toggleEquip(ch2, 'roupa_jardineira'));
assert.equal(rules.toggleEquip(ch2, 'roupa_jardineira'), false, 'roupa não pode ficar vazia');
assert.equal(rules.toggleEquip(ch2, 'acess_coroa'), false, 'não tem a coroa');
console.log('OK: esconderijos alcançáveis e regras funcionando');

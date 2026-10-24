/**
 * Mapa do mundo (vista de cima). Tudo em pixels do mundo (2400 x 1800).
 * `x, y` de casas, árvores etc. é o ponto da BASE do objeto (onde ele "pisa").
 */

export const HOUSES = [
  { id: 'casa_rosa', x: 520, y: 560, cor: '#ff9ec7', telhado: '#e0598f' },
  { id: 'casa_amarela', x: 900, y: 470, cor: '#ffe28a', telhado: '#f08a3c' },
  { id: 'casa_azul', x: 1600, y: 520, cor: '#9ad8ff', telhado: '#4d7cff' },
  { id: 'casa_menta', x: 1990, y: 560, cor: '#b5f0d0', telhado: '#2fb58b' },
  { id: 'casa_lilas', x: 520, y: 1330, cor: '#dcc7ff', telhado: '#8a63e8' },
  { id: 'casa_laranja', x: 1560, y: 1360, cor: '#ffc89a', telhado: '#e0663d' },
];

const border = [];
for (let x = 60; x <= 2340; x += 115) {
  border.push({ x, y: 120 + (x % 3) * 12, v: x % 2 });
  border.push({ x: x + 40, y: 1790 - (x % 4) * 8, v: (x + 1) % 2 });
}
for (let y = 230; y <= 1700; y += 120) {
  border.push({ x: 50 + (y % 3) * 10, y, v: y % 2 });
  border.push({ x: 2350 - (y % 2) * 12, y, v: (y + 1) % 2 });
}

export const TREES = [
  ...border.map((t) => ({ ...t, borda: true })),
  { x: 1350, y: 320, v: 2, grande: true },
  { x: 300, y: 420, v: 0 },
  { x: 720, y: 1050, v: 1 },
  { x: 1070, y: 1380, v: 0 },
  { x: 2210, y: 720, v: 1 },
  { x: 1300, y: 1600, v: 2 },
  { x: 1100, y: 250, v: 1 },
  { x: 1830, y: 280, v: 0 },
  { x: 260, y: 760, v: 2 },
];

export const BUSHES = [
  { x: 650, y: 640 }, { x: 1700, y: 660 }, { x: 410, y: 1200 }, { x: 1420, y: 1290 },
  { x: 2120, y: 1540 }, { x: 960, y: 800 }, { x: 760, y: 340 }, { x: 2230, y: 1150 },
  { x: 180, y: 1350 }, { x: 1180, y: 610 },
];

export const FLOWERS = [
  { x: 700, y: 720 }, { x: 1050, y: 660 }, { x: 1440, y: 700 }, { x: 1470, y: 1130 },
  { x: 960, y: 1070 }, { x: 330, y: 620 }, { x: 2150, y: 420 }, { x: 700, y: 1520 },
  { x: 1150, y: 1520 }, { x: 1900, y: 1580 }, { x: 2230, y: 990 }, { x: 830, y: 1650 },
  { x: 1700, y: 1050 }, { x: 260, y: 1000 }, { x: 1950, y: 400 }, { x: 1250, y: 1180 },
];

export const PROPS = [
  { id: 'fonte', tipo: 'fonte', x: 1200, y: 930 },
  { id: 'poco', tipo: 'poco', x: 300, y: 1090 },
  { id: 'escorregador', tipo: 'escorregador', x: 860, y: 1280 },
  { id: 'balanco', tipo: 'balanco', x: 1020, y: 1230 },
  { id: 'caixa_correio', tipo: 'caixa_correio', x: 1000, y: 500 },
  { id: 'banco1', tipo: 'banco', x: 1050, y: 760 },
  { id: 'banco2', tipo: 'banco', x: 1350, y: 1060 },
  { id: 'poste1', tipo: 'poste', x: 1010, y: 1040 },
  { id: 'poste2', tipo: 'poste', x: 1390, y: 780 },
  { id: 'horta', tipo: 'horta', x: 1990, y: 790 },
  ...[0, 1, 2, 3, 4, 5].map((i) => ({
    id: `cogumelo${i}`,
    tipo: 'cogumelo',
    x: 300 + Math.cos((i / 6) * Math.PI * 2) * 70,
    y: 1580 + Math.sin((i / 6) * Math.PI * 2) * 40,
  })),
];

export const POND = { x: 1980, y: 1240, rx: 230, ry: 135 };
export const PLAZA = { x: 1200, y: 900, r: 175 };

/** Caminhos de areia: listas de pontos [x, y] e largura. */
export const PATHS = [
  { w: 90, pts: [[150, 900], [2250, 900]] },
  { w: 90, pts: [[1200, 200], [1200, 1650]] },
  ...HOUSES.map((h) => ({
    w: 56,
    pts: h.y < 900 ? [[h.x, h.y - 10], [h.x, 900]] : [[h.x, h.y - 10], [h.x, h.y + 60], [1200, h.y + 60]],
  })),
  { w: 56, pts: [[300, 900], [300, 1040]] },
  { w: 56, pts: [[1200, 1300], [940, 1300]] },
];

/**
 * Obstáculos (o personagem não atravessa).
 * rect: centro (x, y), largura w, altura h  |  circle: centro (x, y), raio r
 */
export function colliders() {
  const list = [];
  for (const h of HOUSES) list.push({ kind: 'rect', x: h.x, y: h.y - 48, w: 196, h: 92 });
  for (const t of TREES) if (!t.borda) list.push({ kind: 'circle', x: t.x, y: t.y - 8, r: t.grande ? 26 : 18 });
  list.push({ kind: 'circle', x: 1200, y: 905, r: 72 });
  list.push({ kind: 'circle', x: 300, y: 1075, r: 44 });
  list.push({ kind: 'rect', x: 1990, y: 770, w: 230, h: 70 });
  list.push({ kind: 'rect', x: 860, y: 1268, w: 110, h: 26 });
  for (const [x, y, r] of [[1840, 1245, 112], [1980, 1240, 128], [2120, 1245, 112]]) list.push({ kind: 'circle', x, y, r });
  return list;
}

/**
 * ESCONDERIJOS possíveis das chaves. A cada rodada são sorteados 3, em regiões
 * diferentes do mapa e diferentes da rodada anterior.
 */
export const HIDING_SPOTS = [
  { id: 'atras_casa_rosa', x: 600, y: 400, nome: 'atrás da casa rosa' },
  { id: 'flores_jardim', x: 712, y: 712, nome: 'no meio das flores' },
  { id: 'poco', x: 372, y: 1100, nome: 'perto do poço' },
  { id: 'parquinho', x: 890, y: 1310, nome: 'no escorregador' },
  { id: 'beira_lago', x: 1770, y: 1395, nome: 'na beira do lago' },
  { id: 'arbusto', x: 1712, y: 642, nome: 'atrás do arbusto' },
  { id: 'horta', x: 2070, y: 735, nome: 'na horta' },
  { id: 'caixa_correio', x: 1035, y: 505, nome: 'na caixa de correio' },
  { id: 'cogumelos', x: 300, y: 1580, nome: 'no círculo de cogumelos' },
  { id: 'atras_casa_azul', x: 1660, y: 360, nome: 'atrás da casa azul' },
  { id: 'fonte', x: 1300, y: 830, nome: 'pertinho da fonte' },
  { id: 'arvore_grande', x: 1392, y: 300, nome: 'na árvore grande' },
  { id: 'banco', x: 1352, y: 1070, nome: 'debaixo do banco' },
  { id: 'atras_casa_lilas', x: 440, y: 1160, nome: 'atrás da casa lilás' },
  { id: 'casa_laranja', x: 1690, y: 1350, nome: 'do lado da casa laranja' },
  { id: 'canto_floresta', x: 2210, y: 280, nome: 'no cantinho da floresta' },
  { id: 'flores_sul', x: 1160, y: 1510, nome: 'nas florzinhas' },
  { id: 'casa_menta', x: 2090, y: 380, nome: 'atrás da casa verde' },
];

export const zoneOf = (s) => Math.min(2, Math.floor(s.x / 800)) + (s.y < 900 ? 0 : 3);

export const START = { x: 1200, y: 1110 };

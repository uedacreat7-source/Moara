/**
 * Monta o personagem em CAMADAS (de trás para a frente):
 *
 *   cabelo (trás) → roupa (trás) → pele → corpo → roupa → pescoço → pulso
 *   → olhos → bochechas → cabelo → rosto → cabeça
 *
 * Cada camada usa a arte de /assets/personagem/ quando ela existe (veja layers.js)
 * e, se não existir, um desenho provisório feito em código.
 *
 * Coordenadas lógicas: quadro de 200 x 260, pés em y≈252.
 */
import { getArt, tinted } from './layers.js';
import { PELES, OLHOS, BOCHECHAS, CABELO_CORES, TAMANHOS, find } from './options.js';
import { ITEM_BY_ID } from '../data/catalog.js';
import {
  OUTLINE, edge, shade, rr, ellipse, circle, star, heart, flower, paint, limb, lerp, RAINBOW,
} from '../gfx.js';

export const FRAME_W = 200;
export const FRAME_H = 260;
const FLOOR = 252;

// Proporções "chibi" (estilo Avatar World): cabeça grande, corpinho pequeno.
const BODY = {
  adulto: { headCy: 86, headR: 50, torsoTop: 134, torsoBot: 200, torsoW: 46, armLen: 56, armW: 12, legW: 15 },
  crianca: { headCy: 104, headR: 56, torsoTop: 156, torsoBot: 210, torsoW: 44, armLen: 44, armW: 12, legW: 15 },
  bebe: { headCy: 138, headR: 58, torsoTop: 190, torsoBot: 232, torsoW: 52, armLen: 30, armW: 14, legW: 18 },
};

export function geometry(tipo) {
  const b = BODY[tipo] || BODY.crianca;
  const cx = 100;
  const g = { ...b, cx, cy: b.headCy, r: b.headR, tipo };
  const sy = b.torsoTop + b.armW * 0.6;
  g.shoulderL = [cx - b.torsoW / 2 + b.armW * 0.45, sy];
  g.shoulderR = [cx + b.torsoW / 2 - b.armW * 0.45, sy];
  g.handL = [cx - b.torsoW / 2 - b.armW * 0.75, sy + b.armLen];
  g.handR = [cx + b.torsoW / 2 + b.armW * 0.75, sy + b.armLen];
  g.legTop = b.torsoBot - 8;
  g.legBot = FLOOR - 7;
  g.legLen = g.legBot - g.legTop;
  g.legXL = cx - (b.legW * 0.6 + 0.5);
  g.legXR = cx + (b.legW * 0.6 + 0.5);
  g.neck = [cx, b.torsoTop + 3];
  // rosto
  g.eyeY = g.cy + g.r * 0.2;
  g.eyeDX = g.r * 0.41;
  g.eyeRX = g.r * (tipo === 'bebe' ? 0.185 : 0.165);
  g.eyeRY = g.r * (tipo === 'bebe' ? 0.2 : 0.215);
  g.mouthY = g.cy + g.r * 0.58;
  return g;
}

const along = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// ---------------------------------------------------------------------------
// Ajudantes para desenhar artes reais
// ---------------------------------------------------------------------------

function drawBodyArt(ctx, img) {
  ctx.drawImage(img, 0, 0, FRAME_W, FRAME_H);
}

function drawHeadArt(ctx, g, img) {
  const side = g.r * 4;
  ctx.drawImage(img, g.cx - side / 2, g.cy - side / 2, side, side);
}

// ---------------------------------------------------------------------------
// Cabeça e rosto provisórios
// ---------------------------------------------------------------------------

/** Rosto redondinho, mais largo nas bochechas e com queixo macio. */
function headPath(ctx, g) {
  const { cx, cy, r } = g;
  ctx.moveTo(cx - r, cy);
  ctx.arc(cx, cy, r, Math.PI, 0);
  ctx.bezierCurveTo(cx + r * 1.01, cy + r * 0.6, cx + r * 0.64, cy + r * 0.93, cx, cy + r * 0.93);
  ctx.bezierCurveTo(cx - r * 0.64, cy + r * 0.93, cx - r * 1.01, cy + r * 0.6, cx - r, cy);
  ctx.closePath();
}

function skinFill(ctx, g, skin) {
  const { cx, cy, r } = g;
  const gr = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.15, r * 0.1, cx, cy + r * 0.1, r * 1.25);
  gr.addColorStop(0, shade(skin, 0.14));
  gr.addColorStop(0.6, skin);
  gr.addColorStop(1, shade(skin, -0.1));
  return gr;
}

function drawHeadPlaceholder(ctx, g, skin) {
  const { cx, cy, r } = g;
  // pescocinho com sombra
  ctx.fillStyle = shade(skin, -0.12);
  ctx.beginPath();
  rr(ctx, cx - r * 0.16, cy + r * 0.7, r * 0.32, g.torsoTop - (cy + r * 0.7) + 6, r * 0.1);
  ctx.fill();
  // orelhas
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ellipse(ctx, cx + s * r * 0.96, cy + r * 0.24, r * 0.15, r * 0.19);
    ctx.fillStyle = skin;
    ctx.fill();
    ctx.strokeStyle = edge(skin);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ellipse(ctx, cx + s * r * 0.97, cy + r * 0.25, r * 0.07, r * 0.1);
    ctx.fillStyle = shade(skin, -0.12);
    ctx.fill();
  }
  ctx.beginPath();
  headPath(ctx, g);
  ctx.fillStyle = skinFill(ctx, g, skin);
  ctx.fill();
  ctx.strokeStyle = edge(skin);
  ctx.lineWidth = 1.8;
  ctx.stroke();
}

function drawNose(ctx, g, skin) {
  const { cx, r } = g;
  const y = g.eyeY + g.r * 0.2;
  ctx.beginPath();
  ctx.arc(cx, y, r * 0.06, Math.PI * 0.15, Math.PI * 0.85);
  ctx.strokeStyle = shade(skin, -0.3);
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawMouth(ctx, g) {
  const { cx, r } = g;
  const y = g.mouthY;
  const w = r * (g.tipo === 'bebe' ? 0.12 : 0.15);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - w, y);
  ctx.quadraticCurveTo(cx, y + w * 0.2, cx + w, y);
  ctx.quadraticCurveTo(cx + w * 0.8, y + w * 1.25, cx, y + w * 1.25);
  ctx.quadraticCurveTo(cx - w * 0.8, y + w * 1.25, cx - w, y);
  ctx.closePath();
  ctx.fillStyle = '#9c2f4a';
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = '#ff7f95';
  ctx.beginPath();
  ellipse(ctx, cx, y + w * 1.25, w * 0.7, w * 0.55);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - w, y - 1, w * 2, w * 0.28);
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(cx - w, y);
  ctx.quadraticCurveTo(cx, y + w * 0.2, cx + w, y);
  ctx.quadraticCurveTo(cx + w * 0.8, y + w * 1.25, cx, y + w * 1.25);
  ctx.quadraticCurveTo(cx - w * 0.8, y + w * 1.25, cx - w, y);
  ctx.strokeStyle = '#7a2238';
  ctx.lineWidth = 1.4;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/** Olhos grandes e brilhantes, com cílios (estilo Avatar World). */
function drawEyes(ctx, g, iris) {
  const { cx } = g;
  const rx = g.eyeRX;
  const ry = g.eyeRY;
  const ey = g.eyeY;
  for (const s of [-1, 1]) {
    const ex = cx + s * g.eyeDX;
    // branco do olho
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ellipse(ctx, ex, ey, rx * 1.05, ry);
    ctx.fill();
    // íris com degradê (mais clara embaixo)
    ctx.save();
    ctx.beginPath();
    ellipse(ctx, ex, ey, rx * 1.05, ry);
    ctx.clip();
    const gr = ctx.createLinearGradient(0, ey - ry, 0, ey + ry);
    gr.addColorStop(0, shade(iris, -0.45));
    gr.addColorStop(0.55, iris);
    gr.addColorStop(1, shade(iris, 0.35));
    ctx.fillStyle = gr;
    ctx.beginPath();
    ellipse(ctx, ex + s * rx * 0.05, ey + ry * 0.08, rx * 0.92, ry * 0.95);
    ctx.fill();
    ctx.fillStyle = shade(iris, -0.7);
    ctx.beginPath();
    ellipse(ctx, ex + s * rx * 0.05, ey + ry * 0.1, rx * 0.46, ry * 0.5);
    ctx.fill();
    ctx.restore();
    // brilhos
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ellipse(ctx, ex - rx * 0.32, ey - ry * 0.34, rx * 0.36, ry * 0.3);
    ctx.fill();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    circle(ctx, ex + rx * 0.38, ey + ry * 0.38, rx * 0.17);
    ctx.fill();
    ctx.globalAlpha = 1;
    // pálpebra de cima grossinha + cílio no canto
    ctx.strokeStyle = '#3a2232';
    ctx.lineCap = 'round';
    ctx.lineWidth = g.tipo === 'bebe' ? 2.4 : 3;
    ctx.beginPath();
    ctx.ellipse(ex, ey + ry * 0.05, rx * 1.12, ry * 1.07, 0, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    if (g.tipo !== 'bebe') {
      const ax = ex + s * rx * 1.08;
      const ay = ey - ry * 0.32;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(ax + s * rx * 0.3, ay - ry * 0.05, ax + s * rx * 0.45, ay - ry * 0.35);
      ctx.stroke();
    }
  }
}

function drawBrows(ctx, g, hair) {
  const { cx, r } = g;
  ctx.strokeStyle = shade(hair, -0.25);
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    const bx = cx + s * g.eyeDX;
    const by = g.eyeY - g.eyeRY - r * 0.13;
    ctx.beginPath();
    ctx.moveTo(bx - r * 0.11, by + r * 0.025);
    ctx.quadraticCurveTo(bx, by - r * 0.04, bx + r * 0.11, by + r * 0.025);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawCheeks(ctx, g, cor) {
  const { cx, r } = g;
  for (const s of [-1, 1]) {
    const x = cx + s * r * 0.62;
    const y = g.eyeY + r * 0.3;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r * 0.2);
    gr.addColorStop(0, cor);
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = gr;
    ctx.beginPath();
    ellipse(ctx, x, y, r * 0.22, r * 0.15);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------------------
// Cabelo provisório (volume + franjinha em mechas + brilho)
// ---------------------------------------------------------------------------

/** Franja em mechas pontudas, da direita para a esquerda. */
function bangs(ctx, g, n, sweep, depth) {
  const { cx, cy, r } = g;
  const x0 = cx + r * 0.84;
  const x1 = cx - r * 0.84;
  const valley = cy - r * 0.36;
  const step = (x0 - x1) / n;
  for (let i = 0; i < n; i++) {
    const xa = x0 - step * i;
    const xb = xa - step;
    const mid = (xa + xb) / 2 - sweep * step;
    const center = 1 - Math.abs((i + 0.5) / n - 0.5) * 0.7;
    const tipY = cy + r * (depth * center - 0.06 * (1 - center));
    ctx.quadraticCurveTo(xa - step * 0.05, tipY - r * 0.08, mid, tipY);
    ctx.quadraticCurveTo(xb + step * 0.2, valley + r * 0.12, xb, valley + (i === n - 1 ? r * 0.25 : 0));
  }
}

const SIDE_LOCK = { longo: 0.72, chuquinhas: 0.34, cacheado: 0.38, curtinho: 0.22, coque: 0.12 };

function hairFrontPath(ctx, g, estilo) {
  const { cx, cy, r } = g;
  const R = r * 1.1;
  const oy = cy - r * 0.04;
  const side = SIDE_LOCK[estilo] ?? 0.3;
  const a0 = Math.PI * 0.96;
  ctx.moveTo(cx + Math.cos(a0) * R, oy + Math.sin(a0) * R);
  ctx.arc(cx, oy, R, a0, Math.PI * 2.04);
  // mecha do lado direito (na frente da orelha)
  ctx.quadraticCurveTo(cx + r * 1.04, cy + r * side, cx + r * 0.9, cy + r * (side + 0.1));
  ctx.quadraticCurveTo(cx + r * 0.84, cy, cx + r * 0.84, cy - r * 0.36);
  // franja
  if (estilo === 'coque') bangs(ctx, g, 3, 0.15, -0.3);
  else if (estilo === 'longo') bangs(ctx, g, 4, 0, -0.06);
  else if (estilo === 'curtinho') bangs(ctx, g, 5, 0.4, -0.08);
  else bangs(ctx, g, 5, 0.15, -0.1);
  // mecha do lado esquerdo
  ctx.quadraticCurveTo(cx - r * 0.84, cy, cx - r * 0.9, cy + r * (side + 0.1));
  ctx.quadraticCurveTo(cx - r * 1.04, cy + r * side, cx + Math.cos(a0) * R, oy + Math.sin(a0) * R);
  ctx.closePath();
}

function hairStroke(ctx, c) {
  ctx.strokeStyle = shade(c, -0.38);
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawHairBack(ctx, g, estilo, c) {
  const { cx, cy, r } = g;
  if (estilo === 'topete' || estilo === 'none') return;
  const back = shade(c, -0.14);
  ctx.fillStyle = back;
  ctx.beginPath();
  if (estilo === 'longo') {
    ctx.moveTo(cx - r * 1.12, cy);
    ctx.arc(cx, cy - r * 0.04, r * 1.12, Math.PI, 0);
    ctx.lineTo(cx + r * 1.16, cy + r * 1.25);
    for (let i = 0; i < 5; i++) {
      const x = cx + r * 1.16 - (i + 0.5) * (r * 2.32) / 5;
      ctx.quadraticCurveTo(x + r * 0.12, cy + r * 1.55, x - r * 0.1, cy + r * 1.3 + (i % 2) * r * 0.08);
    }
    ctx.lineTo(cx - r * 1.16, cy + r * 1.2);
    ctx.closePath();
  } else if (estilo === 'cacheado') {
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (0.82 + (i / 12) * 1.36);
      circle(ctx, cx + Math.cos(a) * r * 1.08, cy - r * 0.02 + Math.sin(a) * r * 1.08, r * 0.3);
    }
    circle(ctx, cx, cy, r * 1.1);
  } else {
    // só até a altura das orelhas (não faz "anel" em volta do queixo)
    ctx.arc(cx, cy - r * 0.04, r * 1.12, Math.PI * 0.86, Math.PI * 2.14);
    ctx.closePath();
  }
  ctx.fill();
  hairStroke(ctx, back);

  if (estilo === 'chuquinhas') {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ellipse(ctx, cx + s * r * 1.28, cy + r * 0.32, r * 0.3, r * 0.5, s * -0.35);
      ctx.fillStyle = c;
      ctx.fill();
      hairStroke(ctx, c);
      ctx.beginPath();
      ctx.arc(cx + s * r * 1.3, cy + r * 0.2, r * 0.18, Math.PI * 1.1, Math.PI * 1.6);
      ctx.strokeStyle = shade(c, 0.45);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      circle(ctx, cx + s * r * 1.08, cy - r * 0.08, r * 0.12);
      ctx.fillStyle = '#ff6fb5';
      ctx.fill();
      ctx.strokeStyle = shade('#ff6fb5', -0.35);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }
  if (estilo === 'coque') {
    ctx.beginPath();
    circle(ctx, cx, cy - r * 1.12, r * 0.42);
    ctx.fillStyle = c;
    ctx.fill();
    hairStroke(ctx, c);
    ctx.beginPath();
    ctx.arc(cx - r * 0.06, cy - r * 1.16, r * 0.26, Math.PI * 1.1, Math.PI * 1.6);
    ctx.strokeStyle = shade(c, 0.45);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    rr(ctx, cx - r * 0.3, cy - r * 0.8, r * 0.6, r * 0.12, r * 0.06);
    ctx.fillStyle = '#ff6fb5';
    ctx.fill();
  }
}

/** Sombrinha do cabelo na testa (dá profundidade). */
function drawHairShadow(ctx, g, estilo, skin) {
  if (estilo === 'topete' || estilo === 'none') return;
  ctx.save();
  ctx.beginPath();
  headPath(ctx, g);
  ctx.clip();
  ctx.translate(0, g.r * 0.07);
  ctx.beginPath();
  hairFrontPath(ctx, g, estilo);
  ctx.fillStyle = shade(skin, -0.16);
  ctx.globalAlpha = 0.55;
  ctx.fill();
  ctx.restore();
}

function drawHairFront(ctx, g, estilo, c) {
  const { cx, cy, r } = g;
  if (estilo === 'none') return;
  if (estilo === 'topete') {
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.18, cy - r * 0.92);
    ctx.quadraticCurveTo(cx - r * 0.05, cy - r * 1.32, cx + r * 0.2, cy - r * 1.12);
    ctx.quadraticCurveTo(cx + r * 0.3, cy - r * 0.95, cx + r * 0.08, cy - r * 0.95);
    ctx.strokeStyle = shade(c, -0.3);
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = c;
    ctx.lineWidth = 4.5;
    ctx.stroke();
    return;
  }
  ctx.beginPath();
  hairFrontPath(ctx, g, estilo);
  const gr = ctx.createLinearGradient(0, cy - r * 1.2, 0, cy + r * 0.6);
  gr.addColorStop(0, shade(c, 0.12));
  gr.addColorStop(1, shade(c, -0.12));
  ctx.fillStyle = gr;
  ctx.fill();
  hairStroke(ctx, c);

  ctx.save();
  ctx.beginPath();
  hairFrontPath(ctx, g, estilo);
  ctx.clip();
  // fios mais escuros
  ctx.strokeStyle = shade(c, -0.22);
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.7;
  for (const i of [-1.5, 0, 1.5]) {
    ctx.beginPath();
    ctx.moveTo(cx + i * r * 0.1, cy - r * 0.9);
    ctx.quadraticCurveTo(cx + i * r * 0.3, cy - r * 0.6, cx + i * r * 0.34, cy - r * 0.32);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // faixa de brilho
  ctx.strokeStyle = shade(c, 0.5);
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = r * 0.09;
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.08, r * 0.84, Math.PI * 1.18, Math.PI * 1.42);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.08, r * 0.84, Math.PI * 1.5, Math.PI * 1.58);
  ctx.stroke();
  ctx.restore();

  if (estilo === 'cacheado') {
    ctx.strokeStyle = shade(c, -0.3);
    ctx.lineWidth = 1.6;
    for (const [dx, dy] of [[-0.62, -0.62], [0.55, -0.7], [0.05, -0.92], [-0.85, -0.1], [0.85, -0.15]]) {
      ctx.beginPath();
      ctx.arc(cx + dx * r, cy + dy * r, r * 0.08, 0, Math.PI * 1.4);
      ctx.stroke();
    }
  }
}

// ---------------------------------------------------------------------------
// Corpo provisório
// ---------------------------------------------------------------------------

function drawBodyPlaceholder(ctx, g, skin, shoeColor) {
  const { cx } = g;
  // pernas
  limb(ctx, g.legXL, g.legTop, g.legXL, g.legBot, g.legW, skin);
  limb(ctx, g.legXR, g.legTop, g.legXR, g.legBot, g.legW, skin);
  // sapatinhos
  for (const x of [g.legXL, g.legXR]) {
    const sx = x + (x < cx ? -2 : 2);
    ctx.beginPath();
    rr(ctx, sx - g.legW * 0.75, FLOOR - 13, g.legW * 1.5, 12, 6);
    ctx.fillStyle = shoeColor;
    ctx.fill();
    ctx.strokeStyle = edge(shoeColor);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    rr(ctx, sx - g.legW * 0.72, FLOOR - 4.5, g.legW * 1.44, 3.5, 1.7);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ellipse(ctx, sx - g.legW * 0.25, FLOOR - 10, 3, 1.6);
    ctx.fill();
  }
  // braços
  limb(ctx, ...g.shoulderL, ...g.handL, g.armW, skin);
  limb(ctx, ...g.shoulderR, ...g.handR, g.armW, skin);
  // tronco
  ctx.beginPath();
  torsoPath(ctx, g);
  ctx.fillStyle = skin;
  ctx.fill();
  ctx.strokeStyle = edge(skin);
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

function torsoPath(ctx, g, grow = 0) {
  const round = g.tipo === 'bebe' ? 0.48 : 0.4;
  rr(ctx, g.cx - g.torsoW / 2 - grow, g.torsoTop - grow, g.torsoW + grow * 2, g.torsoBot - g.torsoTop + grow * 2, g.torsoW * round);
}

function drawHands(ctx, g, skin) {
  ctx.fillStyle = skin;
  ctx.strokeStyle = edge(skin);
  ctx.lineWidth = 1.6;
  for (const h of [g.handL, g.handR]) {
    ctx.beginPath();
    circle(ctx, h[0], h[1], g.armW * 0.66);
    ctx.fill();
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Roupas provisórias
// ---------------------------------------------------------------------------

function sleeves(ctx, g, color, len) {
  limb(ctx, ...g.shoulderL, ...along(g.shoulderL, g.handL, len), g.armW + 4, color);
  limb(ctx, ...g.shoulderR, ...along(g.shoulderR, g.handR, len), g.armW + 4, color);
}

function shirt(ctx, g, color, padrao, cp) {
  paint(ctx, () => torsoPath(ctx, g, 1.5), color, padrao, cp);
}

function pants(ctx, g, color, len, padrao, cp) {
  paint(ctx, () => {
    rr(ctx, g.cx - g.torsoW / 2 + 1, g.torsoBot - 16, g.torsoW - 2, 22, 9);
    for (const x of [g.legXL, g.legXR]) {
      rr(ctx, x - g.legW / 2 - 2.5, g.legTop - 4, g.legW + 5, g.legLen * len + 4, g.legW * 0.45);
    }
  }, color, padrao, cp);
}

function shorts(ctx, g, color) {
  paint(ctx, () => rr(ctx, g.cx - g.torsoW / 2 + 1, g.torsoBot - 14, g.torsoW - 2, g.legLen * 0.32 + 14, 8), color);
}

function skirt(ctx, g, color, len, flare, padrao, cp) {
  const waist = g.torsoBot - 18;
  const hw = g.torsoW / 2 + 1;
  const bw = hw * flare;
  const by = waist + len;
  paint(ctx, () => {
    ctx.moveTo(g.cx - hw, waist);
    ctx.lineTo(g.cx + hw, waist);
    ctx.lineTo(g.cx + bw, by - 5);
    ctx.quadraticCurveTo(g.cx, by + 9, g.cx - bw, by - 5);
    ctx.closePath();
  }, color, padrao, cp);
}

function drawOutfitBack(ctx, g, d) {
  if (!d) return;
  if (d.estilo === 'super') {
    const [lx, ly] = g.shoulderL;
    const [rx] = g.shoulderR;
    paint(ctx, () => {
      ctx.moveTo(lx - 2, ly - 6);
      ctx.lineTo(rx + 2, ly - 6);
      ctx.lineTo(rx + 24, FLOOR - 14);
      ctx.quadraticCurveTo(g.cx, FLOOR - 2, lx - 24, FLOOR - 14);
      ctx.closePath();
    }, d.c2);
  }
  if (d.estilo === 'fantasia') {
    // rabinho
    ctx.beginPath();
    ctx.moveTo(g.cx + g.torsoW * 0.3, g.torsoBot - 14);
    ctx.quadraticCurveTo(g.cx + g.torsoW * 1.05, g.torsoBot - 4, g.cx + g.torsoW * 0.95, g.torsoBot - 28);
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.lineWidth = 6.5;
    ctx.strokeStyle = d.crina ? d.c2 : d.c1;
    ctx.stroke();
    if (d.espinhos) {
      ctx.fillStyle = d.espinhos;
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2;
      for (const s of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          const y = g.torsoTop + 8 + i * ((g.torsoBot - g.torsoTop - 10) / 3);
          const x = g.cx + s * (g.torsoW / 2);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + s * 10, y + 6);
          ctx.lineTo(x, y + 12);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  }
}

function drawOutfit(ctx, g, d) {
  if (!d) return;
  const { c1, c2 = c1, c3 = '#ffffff', padrao } = d;
  switch (d.estilo) {
    case 'camiseta':
      shorts(ctx, g, c2 === c1 ? shade(c1, -0.3) : c2);
      sleeves(ctx, g, c1, 0.38);
      shirt(ctx, g, c1, padrao, c3 || c2);
      break;
    case 'vestido':
      sleeves(ctx, g, c1, 0.32);
      shirt(ctx, g, c1, padrao, c3);
      skirt(ctx, g, c1, g.legLen * 0.62 + 18, 1.55, padrao, c3);
      break;
    case 'macacao':
    case 'pijama':
      pants(ctx, g, c1, 0.92, padrao, c3);
      sleeves(ctx, g, c1, 0.86);
      shirt(ctx, g, c1, padrao, c3);
      if (d.estilo === 'pijama') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        for (let i = 0; i < 3; i++) circle(ctx, g.cx, g.torsoTop + 12 + i * 11, 2.2);
        ctx.fill();
      }
      break;
    case 'jardineira':
      sleeves(ctx, g, c2, 0.36);
      shirt(ctx, g, c2);
      pants(ctx, g, c1, 0.8);
      paint(ctx, () => rr(ctx, g.cx - g.torsoW * 0.32, g.torsoTop + (g.torsoBot - g.torsoTop) * 0.35, g.torsoW * 0.64, (g.torsoBot - g.torsoTop) * 0.6, 5), c1);
      limb(ctx, g.cx - g.torsoW * 0.26, g.torsoTop + 2, g.cx - g.torsoW * 0.26, g.torsoTop + (g.torsoBot - g.torsoTop) * 0.4, 5, c1, false);
      limb(ctx, g.cx + g.torsoW * 0.26, g.torsoTop + 2, g.cx + g.torsoW * 0.26, g.torsoTop + (g.torsoBot - g.torsoTop) * 0.4, 5, c1, false);
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      circle(ctx, g.cx - g.torsoW * 0.22, g.torsoTop + (g.torsoBot - g.torsoTop) * 0.42, 2.4);
      circle(ctx, g.cx + g.torsoW * 0.22, g.torsoTop + (g.torsoBot - g.torsoTop) * 0.42, 2.4);
      ctx.fill();
      break;
    case 'moletom':
      pants(ctx, g, c2, 0.92);
      sleeves(ctx, g, c1, 0.86);
      shirt(ctx, g, c1, padrao, c3);
      paint(ctx, () => rr(ctx, g.cx - g.torsoW * 0.3, g.torsoBot - 24, g.torsoW * 0.6, 13, 5), shade(c1, -0.12));
      break;
    case 'princesa':
      sleeves(ctx, g, c1, 0.2);
      for (const s of [g.shoulderL, g.shoulderR]) {
        paint(ctx, () => circle(ctx, s[0], s[1] + 1, g.armW * 0.75), shade(c1, 0.25));
      }
      shirt(ctx, g, c1, padrao, c3);
      skirt(ctx, g, c1, FLOOR - g.torsoBot + 12, 2.1, padrao, c3);
      paint(ctx, () => rr(ctx, g.cx - g.torsoW / 2, g.torsoBot - 22, g.torsoW, 6, 3), c2);
      break;
    case 'terninho':
      pants(ctx, g, c1, 0.92);
      sleeves(ctx, g, c1, 0.86);
      shirt(ctx, g, '#ffffff');
      for (const s of [-1, 1]) {
        paint(ctx, () => {
          const x0 = g.cx + s * (g.torsoW / 2 + 1.5);
          ctx.moveTo(x0, g.torsoTop + 6);
          ctx.lineTo(g.cx + s * 5, g.torsoTop + 2);
          ctx.lineTo(g.cx + s * 3, g.torsoBot - 8);
          ctx.lineTo(x0, g.torsoBot + 1);
          ctx.closePath();
        }, c1);
      }
      // gravatinha borboleta
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.moveTo(g.cx, g.torsoTop + 7);
      ctx.lineTo(g.cx - 9, g.torsoTop + 1);
      ctx.lineTo(g.cx - 9, g.torsoTop + 13);
      ctx.closePath();
      ctx.moveTo(g.cx, g.torsoTop + 7);
      ctx.lineTo(g.cx + 9, g.torsoTop + 1);
      ctx.lineTo(g.cx + 9, g.torsoTop + 13);
      ctx.closePath();
      ctx.fill();
      break;
    case 'tutu':
      pants(ctx, g, c2, 0.92);
      shirt(ctx, g, c1);
      for (let i = 0; i < 3; i++) {
        paint(ctx, () => ellipse(ctx, g.cx, g.torsoBot - 10 + i * 2, g.torsoW * (0.95 - i * 0.12), 9 - i), i % 2 ? c2 : c1);
      }
      break;
    case 'fantasia':
      pants(ctx, g, c1, 0.92);
      sleeves(ctx, g, c1, 0.86);
      shirt(ctx, g, c1);
      if (d.barriga) {
        paint(ctx, () => ellipse(ctx, g.cx, (g.torsoTop + g.torsoBot) / 2 + 4, g.torsoW * 0.3, (g.torsoBot - g.torsoTop) * 0.36), c2);
      }
      if (d.crina) {
        ctx.fillStyle = RAINBOW[0];
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = RAINBOW[i];
          ctx.beginPath();
          circle(ctx, g.cx + g.torsoW * 0.32, g.torsoTop + 6 + i * 7, 4);
          ctx.fill();
        }
      }
      break;
    case 'super':
      pants(ctx, g, c1, 0.92);
      sleeves(ctx, g, c1, 0.86);
      shirt(ctx, g, c1);
      paint(ctx, () => rr(ctx, g.cx - g.torsoW / 2, g.torsoBot - 18, g.torsoW, 6, 3), c3);
      paint(ctx, () => star(ctx, g.cx, g.torsoTop + (g.torsoBot - g.torsoTop) * 0.38, 10), c3);
      break;
    default:
      shirt(ctx, g, c1, padrao, c3);
  }
}

function shoeColorFor(d, tipo) {
  if (d?.estilo === 'super') return d.c2;
  if (d?.estilo === 'fantasia') return d.c1;
  if (d?.estilo === 'princesa' || d?.estilo === 'tutu') return '#ff8fc8';
  return tipo === 'bebe' ? '#ffffff' : '#7b61ff';
}

// ---------------------------------------------------------------------------
// Acessórios provisórios
// ---------------------------------------------------------------------------

function drawNeck(ctx, g, d) {
  const [nx, ny] = g.neck;
  const w = g.torsoW;
  switch (d.tipo) {
    case 'colar':
    case 'colar_arcoiris': {
      for (let i = 0; i <= 8; i++) {
        const a = Math.PI * (0.12 + (i / 8) * 0.76);
        const x = nx + Math.cos(a) * w * 0.36;
        const y = ny - 4 + Math.sin(a) * 15;
        ctx.beginPath();
        circle(ctx, x, y, 3.4);
        ctx.fillStyle = d.tipo === 'colar' ? d.c1 : RAINBOW[i % RAINBOW.length];
        ctx.fill();
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      break;
    }
    case 'colar_estrela':
    case 'medalha': {
      ctx.beginPath();
      ctx.moveTo(nx - w * 0.3, ny - 2);
      ctx.quadraticCurveTo(nx, ny + 22, nx + w * 0.3, ny - 2);
      ctx.strokeStyle = d.tipo === 'medalha' ? d.c2 : '#d9b44a';
      ctx.lineWidth = d.tipo === 'medalha' ? 5 : 1.8;
      ctx.stroke();
      if (d.tipo === 'medalha') paint(ctx, () => circle(ctx, nx, ny + 15, 8), d.c1);
      paint(ctx, () => star(ctx, nx, ny + 15, d.tipo === 'medalha' ? 5 : 7.5), d.tipo === 'medalha' ? '#fff3b0' : d.c1);
      break;
    }
    case 'cachecol': {
      paint(ctx, () => rr(ctx, nx - w * 0.48, ny - 6, w * 0.96, 12, 6), d.c1, 'listras', d.c2);
      paint(ctx, () => rr(ctx, nx + w * 0.12, ny, 11, 30, 4), d.c1, 'listras', d.c2);
      break;
    }
    case 'babador': {
      paint(ctx, () => {
        ctx.moveTo(nx - w * 0.3, ny - 2);
        ctx.quadraticCurveTo(nx - w * 0.38, ny + 26, nx, ny + 28);
        ctx.quadraticCurveTo(nx + w * 0.38, ny + 26, nx + w * 0.3, ny - 2);
        ctx.closePath();
      }, d.c1);
      paint(ctx, () => heart(ctx, nx, ny + 14, 6), d.c2);
      break;
    }
    default:
  }
}

function drawWrist(ctx, g, d) {
  const [wx, wy] = along(g.shoulderR, g.handR, 0.8);
  switch (d.tipo) {
    case 'pulseira':
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        circle(ctx, wx - 7 + i * 3.5, wy + (i % 2) * 0.6, 2.7);
        ctx.fillStyle = i % 2 ? d.c2 : d.c1;
        ctx.fill();
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      break;
    case 'pulseira_flores':
      paint(ctx, () => rr(ctx, wx - 8, wy - 2.5, 16, 5, 2.5), d.c2);
      flower(ctx, wx, wy, 5, d.c1);
      break;
    case 'relogio':
      paint(ctx, () => rr(ctx, wx - 8.5, wy - 3, 17, 6, 3), d.c1);
      paint(ctx, () => circle(ctx, wx, wy, 5), d.c2);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx, wy - 3.2);
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + 2.4, wy);
      ctx.stroke();
      break;
    default:
  }
}

function drawFace(ctx, g, d) {
  const { cx, cy, r } = g;
  const ey = g.eyeY;
  switch (d.tipo) {
    case 'oculos_coracao':
    case 'oculos_estrela': {
      for (const s of [-1, 1]) {
        const ex = cx + s * g.eyeDX;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        if (d.tipo === 'oculos_coracao') heart(ctx, ex, ey - r * 0.02, r * 0.3);
        else star(ctx, ex, ey, r * 0.33, r * 0.19);
        ctx.fillStyle = d.c2;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = d.c1;
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.12, ey - r * 0.06);
      ctx.quadraticCurveTo(cx, ey - r * 0.14, cx + r * 0.12, ey - r * 0.06);
      ctx.strokeStyle = d.c1;
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }
    case 'chupeta': {
      const my = g.mouthY + r * 0.06;
      paint(ctx, () => ellipse(ctx, cx, my, r * 0.24, r * 0.14), d.c1);
      ctx.beginPath();
      ctx.arc(cx, my + r * 0.16, r * 0.12, 0, Math.PI * 2);
      ctx.strokeStyle = d.c2;
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }
    case 'mascara': {
      ctx.beginPath();
      rr(ctx, cx - r * 0.86, ey - r * 0.3, r * 1.72, r * 0.56, r * 0.26);
      for (const s of [-1, 1]) ellipse(ctx, cx + s * g.eyeDX, ey, g.eyeRX * 1.15, g.eyeRY * 1.1);
      ctx.fillStyle = d.c1;
      ctx.fill('evenodd');
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }
    default:
  }
}

function drawHead(ctx, g, d) {
  const { cx, cy, r } = g;
  const top = cy - r;
  switch (d.tipo) {
    case 'toquinha':
      paint(ctx, () => {
        ctx.arc(cx, cy - r * 0.12, r * 1.1, Math.PI, Math.PI * 2);
        ctx.closePath();
      }, d.c1, 'listras', shade(d.c1, -0.15));
      paint(ctx, () => rr(ctx, cx - r * 1.14, cy - r * 0.32, r * 2.28, r * 0.3, r * 0.15), d.c2);
      paint(ctx, () => circle(ctx, cx, cy - r * 1.24, r * 0.24), d.c2);
      break;
    case 'touca_urso':
      for (const s of [-1, 1]) {
        paint(ctx, () => circle(ctx, cx + s * r * 0.78, top + r * 0.12, r * 0.3), d.c1);
        paint(ctx, () => circle(ctx, cx + s * r * 0.78, top + r * 0.12, r * 0.16), d.c2);
      }
      paint(ctx, () => {
        ctx.arc(cx, cy, r * 1.12, Math.PI * 0.86, Math.PI * 2.14);
        ctx.quadraticCurveTo(cx + r * 0.7, cy - r * 0.45, cx, cy - r * 0.5);
        ctx.quadraticCurveTo(cx - r * 0.7, cy - r * 0.45, cx - r * 1.12 * Math.cos(Math.PI * 0.14), cy + r * 1.12 * Math.sin(Math.PI * 0.14));
        ctx.closePath();
      }, d.c1);
      break;
    case 'laco':
      for (const s of [-1, 1]) {
        paint(ctx, () => {
          const bx = cx + r * 0.5;
          const by = top + r * 0.18;
          ctx.moveTo(bx, by);
          ctx.quadraticCurveTo(bx + s * r * 0.5, by - r * 0.45, bx + s * r * 0.52, by);
          ctx.quadraticCurveTo(bx + s * r * 0.5, by + r * 0.42, bx, by);
          ctx.closePath();
        }, d.c1);
      }
      paint(ctx, () => circle(ctx, cx + r * 0.5, top + r * 0.18, r * 0.12), d.c2);
      break;
    case 'coroa':
      paint(ctx, () => {
        const w = r * 0.62;
        const b = top + r * 0.22;
        ctx.moveTo(cx - w, b);
        ctx.lineTo(cx - w, b - r * 0.45);
        ctx.lineTo(cx - w * 0.5, b - r * 0.2);
        ctx.lineTo(cx, b - r * 0.58);
        ctx.lineTo(cx + w * 0.5, b - r * 0.2);
        ctx.lineTo(cx + w, b - r * 0.45);
        ctx.lineTo(cx + w, b);
        ctx.closePath();
      }, d.c1);
      paint(ctx, () => circle(ctx, cx, top + r * 0.02, r * 0.09), d.c2);
      break;
    case 'tiara_gato':
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.02, Math.PI * 1.12, Math.PI * 1.88);
      ctx.strokeStyle = d.c1;
      ctx.lineWidth = 4.5;
      ctx.stroke();
      for (const s of [-1, 1]) {
        const ex = cx + s * r * 0.62;
        const ey = cy - r * 0.78;
        paint(ctx, () => {
          ctx.moveTo(ex - r * 0.26, ey + r * 0.1);
          ctx.lineTo(ex + s * r * 0.1, ey - r * 0.5);
          ctx.lineTo(ex + r * 0.26, ey + r * 0.04);
          ctx.closePath();
        }, d.c1);
        paint(ctx, () => {
          ctx.moveTo(ex - r * 0.12, ey + r * 0.02);
          ctx.lineTo(ex + s * r * 0.07, ey - r * 0.3);
          ctx.lineTo(ex + r * 0.12, ey);
          ctx.closePath();
        }, d.c2);
      }
      break;
    case 'coroa_flores':
      for (let i = 0; i < 7; i++) {
        const a = Math.PI * (1.08 + (i / 6) * 0.84);
        flower(ctx, cx + Math.cos(a) * r * 0.98, cy + Math.sin(a) * r * 0.98, r * 0.16, i % 2 ? d.c1 : '#ffffff', d.c2);
      }
      break;
    case 'borboleta': {
      const bx = cx - r * 0.68;
      const by = top + r * 0.32;
      paint(ctx, () => { ellipse(ctx, bx - r * 0.16, by - r * 0.1, r * 0.17, r * 0.13, -0.5); ellipse(ctx, bx + r * 0.16, by - r * 0.1, r * 0.17, r * 0.13, 0.5); }, d.c1);
      paint(ctx, () => { ellipse(ctx, bx - r * 0.12, by + r * 0.1, r * 0.11, r * 0.09, 0.4); ellipse(ctx, bx + r * 0.12, by + r * 0.1, r * 0.11, r * 0.09, -0.4); }, d.c2);
      paint(ctx, () => ellipse(ctx, bx, by, r * 0.04, r * 0.16), '#4a3a5a');
      break;
    }
    case 'chapeu_sol':
      paint(ctx, () => ellipse(ctx, cx, cy - r * 0.5, r * 1.6, r * 0.36), d.c1);
      paint(ctx, () => {
        ctx.arc(cx, cy - r * 0.55, r * 0.82, Math.PI, Math.PI * 2);
        ctx.closePath();
      }, d.c1);
      paint(ctx, () => rr(ctx, cx - r * 0.82, cy - r * 0.78, r * 1.64, r * 0.2, r * 0.08), d.c2);
      flower(ctx, cx + r * 0.62, cy - r * 0.7, r * 0.17, '#ffffff', '#ffe066');
      break;
    case 'chifre':
      paint(ctx, () => {
        ctx.moveTo(cx - r * 0.17, top + r * 0.12);
        ctx.lineTo(cx + r * 0.04, top - r * 0.72);
        ctx.lineTo(cx + r * 0.17, top + r * 0.12);
        ctx.closePath();
      }, d.c1);
      ctx.strokeStyle = shade(d.c1, -0.25);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 1; i < 4; i++) {
        const y = top + r * 0.12 - i * r * 0.2;
        const hw = r * 0.17 * (1 - i / 4.2);
        ctx.moveTo(cx - hw, y + r * 0.05);
        ctx.lineTo(cx + hw, y - r * 0.03);
      }
      ctx.stroke();
      flower(ctx, cx - r * 0.3, top + r * 0.14, r * 0.12, d.c2, '#fff');
      flower(ctx, cx + r * 0.3, top + r * 0.14, r * 0.12, d.c2, '#fff');
      break;
    default:
  }
}

// ---------------------------------------------------------------------------
// Montagem
// ---------------------------------------------------------------------------

/**
 * Desenha o personagem no contexto (já posicionado no quadro lógico 200x260).
 * @param look  aparência (tipo, pele, olhos, bochechas, cabelo, cabeloCor)
 * @param equipped  { roupa, cabeca, rosto, pescoco, pulso } -> ids do catálogo
 */
export function drawCharacter(ctx, look, equipped = {}) {
  const tipo = look.tipo || 'crianca';
  const g = geometry(tipo);
  const skin = look.peleCor || find(PELES, look.pele).cor;
  const iris = find(OLHOS, look.olhos).cor;
  const cheek = find(BOCHECHAS, look.bochechas).cor;
  const hair = find(CABELO_CORES, look.cabeloCor).cor;
  const estilo = look.cabelo || 'curtinho';

  const item = (slot) => ITEM_BY_ID[equipped[slot]] || null;
  const roupa = item('roupa');
  const art = (folder, id, sufixos = []) =>
    getArt(...sufixos.map((s) => `${folder}/${id}${s}`), `${folder}/${id}`);

  ctx.save();
  ctx.lineJoin = 'round';

  // 1. cabelo (trás)
  const hairBackArt = getArt(`cabelo/cabelo_${estilo}_tras`);
  if (hairBackArt) drawHeadArt(ctx, g, tinted(hairBackArt, hair));
  else if (!getArt(`cabelo/cabelo_${estilo}`)) drawHairBack(ctx, g, estilo, hair);

  // 2. roupa (trás)
  if (roupa) {
    const back = getArt(`roupa/${roupa.id}_tras_${tipo}`, `roupa/${roupa.id}_tras`);
    if (back) drawBodyArt(ctx, back);
    else if (!art('roupa', roupa.id, [`_${tipo}`])) drawOutfitBack(ctx, g, roupa.desenho);
  }

  // 3. pele + 4. corpo
  const peleArt = getArt(`pele/pele_${tipo}`);
  const corpoArt = getArt(`corpo/corpo_${tipo}`);
  if (peleArt) drawBodyArt(ctx, tinted(peleArt, skin));
  else drawBodyPlaceholder(ctx, g, skin, shoeColorFor(roupa?.desenho, tipo));
  if (corpoArt) drawBodyArt(ctx, corpoArt);

  // 5. roupa
  if (roupa) {
    const front = art('roupa', roupa.id, [`_${tipo}`]);
    if (front) drawBodyArt(ctx, front);
    else drawOutfit(ctx, g, roupa.desenho);
  }
  if (!peleArt) drawHands(ctx, g, skin);

  // 6. pescoço e 7. pulso
  for (const slot of ['pescoco', 'pulso']) {
    const it = item(slot);
    if (!it) continue;
    const a = art('acessorios', it.id, [`_${tipo}`]);
    if (a) drawBodyArt(ctx, a);
    else if (slot === 'pescoco') drawNeck(ctx, g, it.desenho);
    else drawWrist(ctx, g, it.desenho);
  }

  // cabeça (provisória, quando não há arte de pele)
  if (!peleArt) drawHeadPlaceholder(ctx, g, skin);
  if (!corpoArt) {
    drawNose(ctx, g, skin);
    drawMouth(ctx, g);
  }
  if (!getArt(`cabelo/cabelo_${estilo}`)) drawHairShadow(ctx, g, estilo, skin);

  // 8. olhos
  const olhosArt = getArt(`olhos/olhos_${look.olhos}`);
  if (olhosArt) drawHeadArt(ctx, g, olhosArt);
  else drawEyes(ctx, g, iris);

  // 9. bochechas
  if (cheek) {
    const bArt = getArt(`bochechas/bochechas_${look.bochechas}`);
    if (bArt) drawHeadArt(ctx, g, bArt);
    else drawCheeks(ctx, g, cheek);
  }

  // 10. cabelo (frente)
  const hairArt = getArt(`cabelo/cabelo_${estilo}`);
  if (hairArt) drawHeadArt(ctx, g, tinted(hairArt, hair));
  else drawHairFront(ctx, g, estilo, hair);
  if (!olhosArt && estilo !== 'none') drawBrows(ctx, g, hair);

  // 11. rosto e 12. cabeça
  for (const slot of ['rosto', 'cabeca']) {
    const it = item(slot);
    if (!it) continue;
    const a = getArt(`acessorios/${it.id}`);
    if (a) drawHeadArt(ctx, g, a);
    else if (slot === 'rosto') drawFace(ctx, g, it.desenho);
    else drawHead(ctx, g, it.desenho);
  }

  ctx.restore();
}

/**
 * Desenha o personagem num canvas, centralizado e encostado embaixo.
 * @param opts.showSize  se true, aplica a escala do tamanho (pequeno/médio/grande)
 */
export function renderToCanvas(canvas, look, equipped, opts = {}) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const fit = Math.min(canvas.width / FRAME_W, canvas.height / FRAME_H);
  const sizeScale = opts.showSize ? find(TAMANHOS, look.tamanho).escala / 1.14 : 1;
  const s = fit * sizeScale;
  const ox = (canvas.width - FRAME_W * s) / 2;
  const oy = canvas.height - FRAME_H * s;
  ctx.setTransform(s, 0, 0, s, ox, oy);
  drawCharacter(ctx, look, equipped);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return canvas;
}

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** Retrato (só cabeça e ombros) para os slots. */
export function renderPortrait(canvas, look, equipped) {
  const g = geometry(look.tipo);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const box = g.r * 3.6;
  const s = canvas.width / box;
  ctx.setTransform(s, 0, 0, s, -(g.cx - box / 2) * s, -(g.cy - box * 0.52) * s);
  drawCharacter(ctx, look, equipped);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return canvas;
}

const MANNEQUIN = {
  tipo: 'crianca', pele: 'pele_01', peleCor: '#f1e8fb', olhos: 'preto', bochechas: 'sem', cabelo: 'none', cabeloCor: 'preto',
};

/** Ícone de um item (desenhado num manequim clarinho e recortado na região do item). */
export function renderItemIcon(canvas, itemId) {
  const it = ITEM_BY_ID[itemId];
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!it) return canvas;
  const g = geometry('crianca');
  let box;
  if (it.slot === 'roupa') {
    const s0 = FLOOR - g.torsoTop + 22;
    box = { x: g.cx - s0 / 2, y: g.torsoTop - 14, s: s0 };
  }
  else if (it.slot === 'cabeca' || it.slot === 'rosto') box = { x: g.cx - g.r * 1.6, y: g.cy - g.r * 1.85, s: g.r * 3.2 };
  else if (it.slot === 'pescoco') box = { x: g.cx - 42, y: g.torsoTop - 34, s: 84 };
  else {
    const [wx, wy] = along(g.shoulderR, g.handR, 0.8);
    box = { x: wx - 34, y: wy - 40, s: 64 };
  }
  const s = canvas.width / box.s;
  ctx.setTransform(s, 0, 0, s, -box.x * s, -box.y * s);
  ctx.globalAlpha = 1;
  drawCharacter(ctx, MANNEQUIN, { [it.slot]: it.id });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return canvas;
}

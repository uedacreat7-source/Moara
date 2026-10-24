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
  OUTLINE, shade, rr, ellipse, circle, star, heart, flower, paint, limb, lerp, RAINBOW,
} from '../gfx.js';

export const FRAME_W = 200;
export const FRAME_H = 260;
const FLOOR = 252;

const BODY = {
  adulto: { headCy: 84, headR: 44, torsoTop: 124, torsoBot: 198, torsoW: 58, armLen: 64, armW: 15, legW: 20 },
  crianca: { headCy: 110, headR: 48, torsoTop: 154, torsoBot: 208, torsoW: 54, armLen: 50, armW: 14, legW: 19 },
  bebe: { headCy: 148, headR: 50, torsoTop: 192, torsoBot: 234, torsoW: 62, armLen: 34, armW: 15, legW: 22 },
};

export function geometry(tipo) {
  const b = BODY[tipo] || BODY.crianca;
  const cx = 100;
  const g = { ...b, cx, cy: b.headCy, r: b.headR, tipo };
  const sy = b.torsoTop + b.armW * 0.55;
  g.shoulderL = [cx - b.torsoW / 2 + b.armW * 0.45, sy];
  g.shoulderR = [cx + b.torsoW / 2 - b.armW * 0.45, sy];
  g.handL = [cx - b.torsoW / 2 - b.armW * 0.7, sy + b.armLen];
  g.handR = [cx + b.torsoW / 2 + b.armW * 0.7, sy + b.armLen];
  g.legTop = b.torsoBot - 10;
  g.legBot = FLOOR - 8;
  g.legLen = g.legBot - g.legTop;
  g.legXL = cx - (b.legW * 0.62 + 1);
  g.legXR = cx + (b.legW * 0.62 + 1);
  g.neck = [cx, b.torsoTop + 3];
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
// Cabelo provisório
// ---------------------------------------------------------------------------

function hairCap(ctx, g, c, bumps = 4, part = false) {
  const { cx, cy, r } = g;
  const R = r * 1.08;
  const fy = cy - r * 0.3;
  ctx.beginPath();
  ctx.arc(cx, cy, R, Math.PI * 0.98, Math.PI * 2.02);
  ctx.lineTo(cx + r * 0.84, cy - r * 0.02);
  const x0 = cx + r * 0.84;
  const x1 = cx - r * 0.84;
  const step = (x0 - x1) / bumps;
  for (let i = 0; i < bumps; i++) {
    const xa = x0 - step * i;
    const xb = xa - step;
    const drop = part && i === 1 ? r * 0.02 : r * 0.2;
    ctx.quadraticCurveTo((xa + xb) / 2, fy + drop, xb, fy - (i === bumps - 1 ? -r * 0.3 : 0));
  }
  ctx.closePath();
  ctx.fillStyle = c;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();
  // brilho
  ctx.beginPath();
  ctx.arc(cx - r * 0.1, cy - r * 0.1, r * 0.82, Math.PI * 1.15, Math.PI * 1.4);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawHairBack(ctx, g, estilo, c) {
  const { cx, cy, r } = g;
  ctx.fillStyle = c;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  if (estilo === 'longo') {
    ctx.beginPath();
    rr(ctx, cx - r * 1.14, cy - r * 0.7, r * 2.28, r * 2.15, r * 0.9);
    ctx.fill();
    ctx.stroke();
  } else if (estilo === 'chuquinhas') {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      circle(ctx, cx + s * r * 1.12, cy - r * 0.12, r * 0.42);
      ctx.fillStyle = c;
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      circle(ctx, cx + s * r * 0.86, cy - r * 0.22, r * 0.12);
      ctx.fillStyle = '#ff6fb5';
      ctx.fill();
    }
  } else if (estilo === 'coque') {
    ctx.beginPath();
    circle(ctx, cx, cy - r * 1.05, r * 0.42);
    ctx.fill();
    ctx.stroke();
  } else if (estilo === 'cacheado') {
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI * (0.9 + (i / 10) * 1.2);
      circle(ctx, cx + Math.cos(a) * r * 1.02, cy - r * 0.05 + Math.sin(a) * r * 1.02, r * 0.3);
    }
    ctx.fill();
    ctx.stroke();
  }
}

function drawHairFront(ctx, g, estilo, c) {
  const { cx, cy, r } = g;
  if (estilo === 'none') return;
  if (estilo === 'topete') {
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx + r * 0.06, cy - r * 0.98, r * 0.17, Math.PI * 0.6, Math.PI * 2.3);
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.strokeStyle = c;
    ctx.lineWidth = 5;
    ctx.stroke();
    return;
  }
  if (estilo === 'cacheado') {
    hairCap(ctx, g, c, 5);
    ctx.fillStyle = c;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) circle(ctx, cx - r * 0.6 + i * r * 0.3, cy - r * 0.32, r * 0.17);
    ctx.fill();
    return;
  }
  hairCap(ctx, g, c, estilo === 'longo' ? 3 : 4, estilo === 'longo');
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
  ctx.fillStyle = shoeColor;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  for (const x of [g.legXL, g.legXR]) {
    ctx.beginPath();
    ellipse(ctx, x + (x < cx ? -2 : 2), FLOOR - 5, g.legW * 0.78, 7.5);
    ctx.fill();
    ctx.stroke();
  }
  // braços
  limb(ctx, ...g.shoulderL, ...g.handL, g.armW, skin);
  limb(ctx, ...g.shoulderR, ...g.handR, g.armW, skin);
  // tronco
  ctx.beginPath();
  torsoPath(ctx, g);
  ctx.fillStyle = skin;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function torsoPath(ctx, g, grow = 0) {
  const round = g.tipo === 'bebe' ? 0.48 : 0.34;
  rr(ctx, g.cx - g.torsoW / 2 - grow, g.torsoTop - grow, g.torsoW + grow * 2, g.torsoBot - g.torsoTop + grow * 2, g.torsoW * round);
}

function drawHands(ctx, g, skin) {
  ctx.fillStyle = skin;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  for (const h of [g.handL, g.handR]) {
    ctx.beginPath();
    circle(ctx, h[0], h[1], g.armW * 0.62);
    ctx.fill();
    ctx.stroke();
  }
}

function drawHeadPlaceholder(ctx, g, skin) {
  const { cx, cy, r } = g;
  ctx.fillStyle = skin;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    circle(ctx, cx + s * r * 0.98, cy + r * 0.12, r * 0.2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  circle(ctx, cx, cy, r);
  ctx.fill();
  ctx.stroke();
}

function drawMouth(ctx, g) {
  const { cx, cy, r } = g;
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.36, r * 0.13, Math.PI * 0.15, Math.PI * 0.85);
  ctx.strokeStyle = '#8a3b4b';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawEyes(ctx, g, iris) {
  const { cx, cy, r } = g;
  const k = g.tipo === 'bebe' ? 1.06 : 1;
  const rx = r * 0.16 * k;
  const ry = r * 0.21 * k;
  for (const s of [-1, 1]) {
    const ex = cx + s * r * 0.38;
    const ey = cy + r * 0.08;
    ctx.fillStyle = shade(iris, -0.55);
    ctx.beginPath();
    ellipse(ctx, ex, ey, rx, ry);
    ctx.fill();
    ctx.fillStyle = iris;
    ctx.beginPath();
    ellipse(ctx, ex, ey + ry * 0.12, rx * 0.78, ry * 0.76);
    ctx.fill();
    ctx.fillStyle = shade(iris, -0.6);
    ctx.beginPath();
    ellipse(ctx, ex, ey + ry * 0.1, rx * 0.42, ry * 0.46);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    circle(ctx, ex - rx * 0.32, ey - ry * 0.36, rx * 0.38);
    circle(ctx, ex + rx * 0.36, ey + ry * 0.32, rx * 0.17);
    ctx.fill();
  }
}

function drawCheeks(ctx, g, cor) {
  const { cx, cy, r } = g;
  ctx.fillStyle = cor;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ellipse(ctx, cx - r * 0.62, cy + r * 0.36, r * 0.17, r * 0.105);
  ellipse(ctx, cx + r * 0.62, cy + r * 0.36, r * 0.17, r * 0.105);
  ctx.fill();
  ctx.globalAlpha = 1;
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
  const ey = cy + r * 0.08;
  switch (d.tipo) {
    case 'oculos_coracao':
    case 'oculos_estrela': {
      for (const s of [-1, 1]) {
        const ex = cx + s * r * 0.38;
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
      const my = cy + r * 0.42;
      paint(ctx, () => ellipse(ctx, cx, my, r * 0.26, r * 0.15), d.c1);
      ctx.beginPath();
      ctx.arc(cx, my + r * 0.16, r * 0.12, 0, Math.PI * 2);
      ctx.strokeStyle = d.c2;
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }
    case 'mascara': {
      ctx.beginPath();
      rr(ctx, cx - r * 0.82, ey - r * 0.24, r * 1.64, r * 0.46, r * 0.22);
      for (const s of [-1, 1]) ellipse(ctx, cx + s * r * 0.38, ey, r * 0.13, r * 0.16);
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
  if (!corpoArt) drawMouth(ctx, g);

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
  if (it.slot === 'roupa') box = { x: 18, y: 138, s: 122 };
  else if (it.slot === 'cabeca' || it.slot === 'rosto') box = { x: g.cx - g.r * 1.75, y: g.cy - g.r * 2.05, s: g.r * 3.5 };
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

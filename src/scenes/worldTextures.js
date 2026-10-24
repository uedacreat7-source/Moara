/**
 * Texturas provisórias do mundo, desenhadas em código.
 * Se existir /assets/mundo/<nome>.png (ex.: casa_rosa.png, arvore_0.png, chave.png),
 * a arte é carregada pelo BootScene e o desenho provisório daquele nome é pulado.
 */
import { HOUSES } from '../data/worldLayout.js';
import { OUTLINE, shade, rr, ellipse, circle, star, heart, flower } from '../gfx.js';

const mk = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  return [c, ctx];
};

function fillStroke(ctx, fill, lw = 3) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = lw;
  ctx.stroke();
}

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function softShadow(ctx, x, y, rx, ry) {
  ctx.fillStyle = 'rgba(40, 80, 30, 0.18)';
  ctx.beginPath();
  ellipse(ctx, x, y, rx, ry);
  ctx.fill();
}

// ---------------------------------------------------------------------------

function house({ cor, telhado }) {
  const [c, ctx] = mk(250, 260);
  softShadow(ctx, 125, 246, 112, 14);
  // chaminé
  ctx.beginPath();
  rr(ctx, 168, 34, 26, 56, 5);
  fillStroke(ctx, '#d98b6a');
  ctx.beginPath();
  rr(ctx, 164, 28, 34, 12, 4);
  fillStroke(ctx, '#b86b4e');
  // paredes
  ctx.beginPath();
  rr(ctx, 34, 112, 182, 132, 16);
  fillStroke(ctx, cor);
  // telhado
  ctx.beginPath();
  ctx.moveTo(12, 128);
  ctx.quadraticCurveTo(8, 118, 18, 110);
  ctx.lineTo(116, 26);
  ctx.quadraticCurveTo(125, 18, 134, 26);
  ctx.lineTo(232, 110);
  ctx.quadraticCurveTo(242, 118, 238, 128);
  ctx.closePath();
  fillStroke(ctx, telhado);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = shade(telhado, 0.18);
  for (let row = 0; row < 6; row++) {
    for (let i = -1; i < 14; i++) {
      ctx.beginPath();
      ctx.arc(i * 22 + (row % 2) * 11, 46 + row * 16, 9, 0, Math.PI);
      ctx.fill();
    }
  }
  ctx.restore();
  // janelinha redonda no telhado
  ctx.beginPath();
  circle(ctx, 125, 80, 17);
  fillStroke(ctx, '#fff6d6');
  ctx.beginPath();
  heart(ctx, 125, 81, 9);
  ctx.fillStyle = '#ff6fa5';
  ctx.fill();
  // porta
  ctx.beginPath();
  ctx.moveTo(103, 244);
  ctx.lineTo(103, 182);
  ctx.arc(125, 182, 22, Math.PI, 0);
  ctx.lineTo(147, 244);
  ctx.closePath();
  fillStroke(ctx, '#c98252');
  ctx.beginPath();
  circle(ctx, 139, 214, 3.5);
  ctx.fillStyle = '#ffd23f';
  ctx.fill();
  // janelas
  for (const x of [52, 160]) {
    ctx.beginPath();
    rr(ctx, x, 146, 40, 40, 10);
    fillStroke(ctx, '#bfe9ff');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 20, 148);
    ctx.lineTo(x + 20, 184);
    ctx.moveTo(x + 2, 166);
    ctx.lineTo(x + 38, 166);
    ctx.stroke();
    ctx.beginPath();
    rr(ctx, x - 4, 186, 48, 12, 4);
    fillStroke(ctx, '#a0613d', 2);
    for (let i = 0; i < 4; i++) flower(ctx, x + 4 + i * 11, 185, 5, ['#ff6fa5', '#ffd23f', '#ffffff', '#c79bff'][i]);
  }
  // degrau
  ctx.beginPath();
  rr(ctx, 96, 240, 58, 10, 5);
  fillStroke(ctx, '#e8d3b0', 2);
  return c;
}

function tree(v) {
  const [c, ctx] = mk(170, 210);
  softShadow(ctx, 85, 198, 52, 11);
  ctx.beginPath();
  rr(ctx, 72, 118, 26, 82, 10);
  fillStroke(ctx, '#a8693f');
  const leaf = ['#5cc46a', '#4fb85f', '#7bd88a'][v] || '#5cc46a';
  const top = v === 2 ? '#ffb3d1' : leaf;
  ctx.beginPath();
  for (const [x, y, r] of [[85, 60, 50], [45, 92, 38], [125, 92, 38], [62, 128, 30], [108, 128, 30], [85, 106, 44]]) circle(ctx, x, y, r);
  fillStroke(ctx, top);
  ctx.fillStyle = shade(top, 0.22);
  ctx.beginPath();
  circle(ctx, 66, 52, 16);
  circle(ctx, 40, 86, 10);
  ctx.fill();
  const r = seeded(17 + v);
  if (v === 1) {
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      circle(ctx, 40 + r() * 90, 50 + r() * 85, 7);
      fillStroke(ctx, '#ff5a5f', 2);
    }
  }
  if (v === 2) {
    for (let i = 0; i < 10; i++) flower(ctx, 35 + r() * 100, 40 + r() * 100, 6, '#ffffff', '#ff7aa8');
  }
  return c;
}

function bush() {
  const [c, ctx] = mk(110, 80);
  softShadow(ctx, 55, 70, 46, 8);
  ctx.beginPath();
  for (const [x, y, r] of [[34, 46, 24], [58, 34, 28], [80, 48, 22], [56, 54, 24]]) circle(ctx, x, y, r);
  fillStroke(ctx, '#4fb85f');
  ctx.fillStyle = '#6fd27a';
  ctx.beginPath();
  circle(ctx, 50, 26, 10);
  ctx.fill();
  const r = seeded(5);
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    circle(ctx, 24 + r() * 64, 24 + r() * 36, 4.5);
    fillStroke(ctx, '#ff6fa5', 1.5);
  }
  return c;
}

function flowerPatch(seed) {
  const [c, ctx] = mk(140, 80);
  const r = seeded(seed);
  ctx.strokeStyle = '#3fa34d';
  ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    const x = 14 + r() * 112;
    const y = 30 + r() * 42;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r() - 0.5) * 6, y + 12);
    ctx.stroke();
    flower(ctx, x, y, 7 + r() * 3, ['#ff6fa5', '#ffd23f', '#ffffff', '#c79bff', '#ff9a76', '#7fd4ff'][i % 6]);
  }
  return c;
}

function fountain() {
  const [c, ctx] = mk(200, 180);
  softShadow(ctx, 100, 160, 92, 16);
  ctx.beginPath();
  ellipse(ctx, 100, 128, 88, 38);
  fillStroke(ctx, '#d8d2e8');
  ctx.beginPath();
  ellipse(ctx, 100, 124, 74, 28);
  fillStroke(ctx, '#7fd4ff', 2);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ellipse(ctx, 76, 118, 18, 5);
  ellipse(ctx, 126, 130, 12, 4);
  ctx.fill();
  ctx.beginPath();
  rr(ctx, 90, 64, 20, 62, 8);
  fillStroke(ctx, '#e9e4f5');
  ctx.beginPath();
  ellipse(ctx, 100, 66, 36, 13);
  fillStroke(ctx, '#d8d2e8');
  ctx.beginPath();
  ellipse(ctx, 100, 63, 28, 8);
  fillStroke(ctx, '#7fd4ff', 2);
  ctx.strokeStyle = '#bfe9ff';
  ctx.lineWidth = 5;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(100, 34);
    ctx.quadraticCurveTo(100 + s * 34, 20, 100 + s * 44, 110);
    ctx.stroke();
  }
  ctx.beginPath();
  circle(ctx, 100, 30, 9);
  fillStroke(ctx, '#bfe9ff', 2);
  return c;
}

function well() {
  const [c, ctx] = mk(120, 150);
  softShadow(ctx, 60, 138, 52, 10);
  ctx.strokeStyle = OUTLINE;
  for (const x of [22, 98]) {
    ctx.beginPath();
    rr(ctx, x - 5, 30, 10, 90, 4);
    fillStroke(ctx, '#a8693f');
  }
  ctx.beginPath();
  ctx.moveTo(6, 40);
  ctx.lineTo(60, 8);
  ctx.lineTo(114, 40);
  ctx.closePath();
  fillStroke(ctx, '#e0598f');
  ctx.beginPath();
  ctx.moveTo(60, 40);
  ctx.lineTo(60, 76);
  ctx.strokeStyle = '#8a6b4a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  rr(ctx, 50, 74, 20, 16, 4);
  fillStroke(ctx, '#7fd4ff', 2);
  ctx.beginPath();
  rr(ctx, 10, 96, 100, 40, 16);
  fillStroke(ctx, '#cfc8de');
  ctx.fillStyle = '#b9b0cc';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    rr(ctx, 16 + i * 19, 108 + (i % 2) * 10, 14, 8, 3);
    ctx.fill();
  }
  ctx.beginPath();
  ellipse(ctx, 60, 98, 48, 10);
  fillStroke(ctx, '#4d6d9a', 2);
  return c;
}

function slide() {
  const [c, ctx] = mk(160, 160);
  softShadow(ctx, 80, 148, 70, 10);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  // escada
  for (const x of [22, 46]) {
    ctx.beginPath();
    rr(ctx, x - 4, 30, 8, 116, 4);
    fillStroke(ctx, '#7fd4ff');
  }
  for (let y = 46; y < 140; y += 18) {
    ctx.beginPath();
    rr(ctx, 20, y, 30, 6, 3);
    fillStroke(ctx, '#ffd23f', 2);
  }
  // plataforma
  ctx.beginPath();
  rr(ctx, 14, 24, 52, 14, 5);
  fillStroke(ctx, '#ff8fc8');
  // escorregador
  ctx.beginPath();
  ctx.moveTo(60, 26);
  ctx.quadraticCurveTo(110, 40, 150, 140);
  ctx.lineTo(126, 146);
  ctx.quadraticCurveTo(96, 62, 58, 46);
  ctx.closePath();
  fillStroke(ctx, '#ffd23f');
  return c;
}

function swing() {
  const [c, ctx] = mk(180, 150);
  softShadow(ctx, 90, 140, 80, 9);
  ctx.lineWidth = 3;
  for (const x of [16, 164]) {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x + s * 12, 140);
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 9;
      ctx.stroke();
      ctx.strokeStyle = '#ff8fc8';
      ctx.lineWidth = 6;
      ctx.stroke();
    }
  }
  ctx.beginPath();
  rr(ctx, 8, 14, 164, 12, 6);
  fillStroke(ctx, '#c79bff');
  for (const x of [60, 120]) {
    ctx.strokeStyle = '#8a6b4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 12, 26);
    ctx.lineTo(x - 12, 100);
    ctx.moveTo(x + 12, 26);
    ctx.lineTo(x + 12, 100);
    ctx.stroke();
    ctx.beginPath();
    rr(ctx, x - 17, 98, 34, 10, 4);
    fillStroke(ctx, x < 90 ? '#ffd23f' : '#7fd4ff', 2);
  }
  return c;
}

function mailbox() {
  const [c, ctx] = mk(60, 90);
  softShadow(ctx, 30, 84, 18, 5);
  ctx.beginPath();
  rr(ctx, 25, 40, 10, 46, 3);
  fillStroke(ctx, '#a8693f', 2);
  ctx.beginPath();
  ctx.moveTo(8, 46);
  ctx.lineTo(8, 26);
  ctx.arc(30, 26, 22, Math.PI, 0);
  ctx.lineTo(52, 46);
  ctx.closePath();
  fillStroke(ctx, '#7fd4ff', 2.5);
  ctx.beginPath();
  heart(ctx, 30, 30, 8);
  ctx.fillStyle = '#ff6fa5';
  ctx.fill();
  ctx.beginPath();
  rr(ctx, 50, 8, 5, 26, 2);
  fillStroke(ctx, '#ff4d6d', 1.5);
  ctx.beginPath();
  rr(ctx, 50, 8, 14, 9, 2);
  fillStroke(ctx, '#ff4d6d', 1.5);
  return c;
}

function bench() {
  const [c, ctx] = mk(120, 70);
  softShadow(ctx, 60, 62, 52, 7);
  for (const x of [20, 92]) {
    ctx.beginPath();
    rr(ctx, x, 36, 8, 26, 3);
    fillStroke(ctx, '#7a5a8a', 2);
  }
  ctx.beginPath();
  rr(ctx, 8, 10, 104, 14, 6);
  fillStroke(ctx, '#ffa94d', 2.5);
  ctx.beginPath();
  rr(ctx, 6, 30, 108, 12, 5);
  fillStroke(ctx, '#ffb86b', 2.5);
  return c;
}

function lamp() {
  const [c, ctx] = mk(50, 150);
  softShadow(ctx, 25, 144, 14, 4);
  ctx.beginPath();
  rr(ctx, 21, 34, 8, 110, 4);
  fillStroke(ctx, '#6b6b8a', 2);
  ctx.beginPath();
  circle(ctx, 25, 26, 15);
  fillStroke(ctx, '#fff3a8', 2.5);
  ctx.beginPath();
  rr(ctx, 12, 6, 26, 8, 4);
  fillStroke(ctx, '#6b6b8a', 2);
  return c;
}

function garden() {
  const [c, ctx] = mk(260, 160);
  ctx.beginPath();
  rr(ctx, 14, 30, 232, 118, 14);
  fillStroke(ctx, '#b07a52');
  for (let row = 0; row < 3; row++) {
    const y = 58 + row * 34;
    ctx.fillStyle = '#9a6844';
    ctx.beginPath();
    rr(ctx, 26, y - 6, 208, 14, 7);
    ctx.fill();
    for (let i = 0; i < 7; i++) {
      const x = 40 + i * 30;
      if (row === 1 && i % 2) {
        // abóbora
        ctx.beginPath();
        ellipse(ctx, x, y + 2, 11, 9);
        fillStroke(ctx, '#ffa94d', 2);
        continue;
      }
      ctx.fillStyle = '#5cc46a';
      for (const a of [-0.5, 0, 0.5]) {
        ctx.beginPath();
        ellipse(ctx, x + a * 10, y - 12, 4, 9, a);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 4);
      ctx.lineTo(x + 6, y - 4);
      ctx.lineTo(x, y + 12);
      ctx.closePath();
      fillStroke(ctx, '#ff8c42', 2);
    }
  }
  // cerquinha
  ctx.strokeStyle = OUTLINE;
  for (let x = 8; x <= 252; x += 22) {
    ctx.beginPath();
    rr(ctx, x - 4, 16, 9, 30, 3);
    fillStroke(ctx, '#ffffff', 2);
  }
  ctx.beginPath();
  rr(ctx, 4, 26, 252, 7, 3);
  fillStroke(ctx, '#ffffff', 2);
  return c;
}

function mushroom() {
  const [c, ctx] = mk(48, 48);
  ctx.beginPath();
  rr(ctx, 18, 22, 12, 22, 5);
  fillStroke(ctx, '#fff6e6', 2);
  ctx.beginPath();
  ctx.moveTo(4, 26);
  ctx.quadraticCurveTo(4, 4, 24, 4);
  ctx.quadraticCurveTo(44, 4, 44, 26);
  ctx.closePath();
  fillStroke(ctx, '#ff5a5f', 2);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  circle(ctx, 16, 14, 3.5);
  circle(ctx, 30, 11, 3);
  circle(ctx, 36, 20, 2.5);
  ctx.fill();
  return c;
}

function key() {
  const [c, ctx] = mk(72, 72);
  ctx.save();
  ctx.translate(36, 36);
  ctx.rotate(-Math.PI / 4);
  ctx.beginPath();
  heart(ctx, 0, -14, 17);
  fillStroke(ctx, '#ffcf33', 3);
  ctx.beginPath();
  heart(ctx, 0, -14, 7);
  ctx.fillStyle = '#fff6d1';
  ctx.fill();
  ctx.beginPath();
  rr(ctx, -4, -4, 8, 36, 4);
  rr(ctx, 4, 18, 10, 6, 2);
  rr(ctx, 4, 26, 7, 6, 2);
  fillStroke(ctx, '#ffcf33', 3);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  circle(ctx, 22, 20, 3);
  ctx.fill();
  return c;
}

function sparkle() {
  const [c, ctx] = mk(32, 32);
  ctx.beginPath();
  star(ctx, 16, 16, 15, 4, 4);
  ctx.fillStyle = '#fff6b0';
  ctx.fill();
  ctx.beginPath();
  circle(ctx, 16, 16, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  return c;
}

function glow() {
  const [c, ctx] = mk(96, 96);
  const g = ctx.createRadialGradient(48, 48, 2, 48, 48, 48);
  g.addColorStop(0, 'rgba(255,240,150,0.9)');
  g.addColorStop(1, 'rgba(255,240,150,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 96, 96);
  return c;
}

function shadow() {
  const [c, ctx] = mk(64, 24);
  ctx.fillStyle = 'rgba(30,60,30,0.25)';
  ctx.beginPath();
  ellipse(ctx, 32, 12, 30, 10);
  ctx.fill();
  return c;
}

function duck() {
  const [c, ctx] = mk(56, 44);
  ctx.beginPath();
  ellipse(ctx, 26, 30, 20, 11);
  fillStroke(ctx, '#ffe066', 2.5);
  ctx.beginPath();
  circle(ctx, 40, 16, 10);
  fillStroke(ctx, '#ffe066', 2.5);
  ctx.beginPath();
  ellipse(ctx, 52, 18, 6, 3.5);
  fillStroke(ctx, '#ff9a3c', 2);
  ctx.fillStyle = '#2b2b33';
  ctx.beginPath();
  circle(ctx, 42, 13, 2);
  ctx.fill();
  return c;
}

function butterfly(color) {
  const [c, ctx] = mk(34, 26);
  ctx.beginPath();
  ellipse(ctx, 10, 9, 8, 7);
  ellipse(ctx, 24, 9, 8, 7);
  fillStroke(ctx, color, 1.5);
  ctx.beginPath();
  ellipse(ctx, 11, 19, 5, 4.5);
  ellipse(ctx, 23, 19, 5, 4.5);
  fillStroke(ctx, shade(color, 0.3), 1.5);
  ctx.beginPath();
  ellipse(ctx, 17, 13, 2, 9);
  ctx.fillStyle = '#4a2a42';
  ctx.fill();
  return c;
}

function arrow() {
  const [c, ctx] = mk(72, 72);
  ctx.beginPath();
  ctx.moveTo(66, 36);
  ctx.lineTo(34, 8);
  ctx.lineTo(34, 24);
  ctx.lineTo(8, 24);
  ctx.quadraticCurveTo(4, 36, 8, 48);
  ctx.lineTo(34, 48);
  ctx.lineTo(34, 64);
  ctx.closePath();
  fillStroke(ctx, '#ff6fa5', 4);
  return c;
}

function grass() {
  const [c, ctx] = mk(128, 128);
  ctx.fillStyle = '#9be27a';
  ctx.fillRect(0, 0, 128, 128);
  const r = seeded(42);
  for (let i = 0; i < 26; i++) {
    const x = r() * 128;
    const y = r() * 128;
    ctx.strokeStyle = r() > 0.5 ? '#86d468' : '#b2ec92';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y - 7);
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 6, y - 8);
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    circle(ctx, r() * 128, r() * 128, 2.2);
    ctx.fill();
  }
  return c;
}

/** Cria todas as texturas que ainda não existirem (arte real tem prioridade). */
export function createWorldTextures(scene) {
  const add = (key, fn) => {
    if (!scene.textures.exists(key)) scene.textures.addCanvas(key, fn());
  };
  for (const h of HOUSES) add(h.id, () => house(h));
  [0, 1, 2].forEach((v) => add(`arvore_${v}`, () => tree(v)));
  add('arbusto', bush);
  [0, 1, 2, 3].forEach((v) => add(`flores_${v}`, () => flowerPatch(v * 13 + 3)));
  add('fonte', fountain);
  add('poco', well);
  add('escorregador', slide);
  add('balanco', swing);
  add('caixa_correio', mailbox);
  add('banco', bench);
  add('poste', lamp);
  add('horta', garden);
  add('cogumelo', mushroom);
  add('chave', key);
  add('brilho', sparkle);
  add('luz', glow);
  add('sombra', shadow);
  add('pato', duck);
  add('borboleta_0', () => butterfly('#ff9ec7'));
  add('borboleta_1', () => butterfly('#9ad8ff'));
  add('borboleta_2', () => butterfly('#ffe066'));
  add('seta', arrow);
  add('grama', grass);
}

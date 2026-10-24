/** Pequenos ajudantes de desenho (Canvas 2D) usados nos desenhos provisórios. */

export const OUTLINE = 'rgba(74, 42, 66, 0.55)';

/** Contorno suave: a própria cor, mais escura (em vez de preto). */
export const edge = (color) => (typeof color === 'string' ? shade(color, -0.38) : OUTLINE);

function rgbOf(color) {
  if (color.startsWith('rgb')) {
    const [r, g, b] = color.match(/[\d.]+/g).map(Number);
    return [r, g, b];
  }
  let c = color.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const n = parseInt(c, 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

/** Clareia (amt > 0) ou escurece (amt < 0) uma cor. */
export function shade(color, amt) {
  let [r, g, b] = rgbOf(color);
  if (amt < 0) {
    r *= 1 + amt;
    g *= 1 + amt;
    b *= 1 + amt;
  } else {
    r += (255 - r) * amt;
    g += (255 - g) * amt;
    b += (255 - b) * amt;
  }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

export function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function ellipse(ctx, x, y, rx, ry, rot = 0) {
  ctx.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot));
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
}

export function circle(ctx, x, y, r) {
  ctx.moveTo(x + r, y);
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

export function star(ctx, x, y, R, r = R * 0.45, n = 5, rot = -Math.PI / 2) {
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = rot + (i * Math.PI) / n;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function heart(ctx, x, y, s) {
  ctx.moveTo(x, y + s * 0.6);
  ctx.bezierCurveTo(x - s * 1.05, y - s * 0.05, x - s * 0.5, y - s * 0.9, x, y - s * 0.32);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 0.9, x + s * 1.05, y - s * 0.05, x, y + s * 0.6);
  ctx.closePath();
}

/** Florzinha de 5 pétalas. */
export function flower(ctx, x, y, s, petal, center = '#ffe066') {
  ctx.fillStyle = petal;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * s * 0.62, y + Math.sin(a) * s * 0.62, s * 0.5);
  }
  ctx.fill();
  ctx.fillStyle = center;
  ctx.beginPath();
  circle(ctx, x, y, s * 0.38);
  ctx.fill();
}

/** Preenche um caminho com cor + estampa opcional + contorno. */
export function paint(ctx, pathFn, fill, padrao, corPadrao, area) {
  ctx.beginPath();
  pathFn();
  ctx.fillStyle = fill;
  ctx.fill();
  if (padrao && padrao !== 'nenhum') {
    ctx.save();
    ctx.beginPath();
    pathFn();
    ctx.clip();
    drawPattern(ctx, padrao, corPadrao || '#ffffff', area || { x: 0, y: 0, w: 200, h: 260 });
    ctx.restore();
  }
  // sombrinha suave em baixo e brilho em cima (volume)
  ctx.save();
  ctx.beginPath();
  pathFn();
  ctx.clip();
  const a = area || { x: 0, y: 0, w: 200, h: 260 };
  const gr = ctx.createLinearGradient(0, a.y, 0, a.y + a.h);
  gr.addColorStop(0, 'rgba(255,255,255,0.16)');
  gr.addColorStop(0.55, 'rgba(255,255,255,0)');
  gr.addColorStop(1, 'rgba(60,20,60,0.14)');
  ctx.fillStyle = gr;
  ctx.fillRect(a.x, a.y, a.w, a.h);
  ctx.restore();
  ctx.beginPath();
  pathFn();
  ctx.strokeStyle = edge(fill);
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

export const RAINBOW = ['#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa'];

export function drawPattern(ctx, padrao, cor, { x, y, w, h }) {
  ctx.fillStyle = cor;
  if (padrao === 'arcoiris') {
    let i = 0;
    for (let yy = y; yy < y + h; yy += 7) {
      ctx.fillStyle = RAINBOW[i++ % RAINBOW.length];
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, yy, w, 7);
    }
    ctx.globalAlpha = 1;
    return;
  }
  if (padrao === 'listras') {
    ctx.globalAlpha = 0.7;
    for (let yy = y; yy < y + h; yy += 10) ctx.fillRect(x, yy, w, 4);
    ctx.globalAlpha = 1;
    return;
  }
  const step = { bolinhas: 11, estrelas: 15, coracoes: 15, flores: 16, brilhos: 18 }[padrao] || 12;
  let row = 0;
  for (let yy = y; yy < y + h; yy += step, row++) {
    for (let xx = x + (row % 2 ? step / 2 : 0); xx < x + w; xx += step) {
      ctx.beginPath();
      if (padrao === 'bolinhas') {
        circle(ctx, xx, yy, 2.6);
        ctx.fill();
      } else if (padrao === 'estrelas') {
        star(ctx, xx, yy, 3.8);
        ctx.fill();
      } else if (padrao === 'coracoes') {
        heart(ctx, xx, yy, 4);
        ctx.fill();
      } else if (padrao === 'flores') {
        flower(ctx, xx, yy, 4, cor, '#ffffff');
      } else if (padrao === 'brilhos') {
        star(ctx, xx, yy, 3.6, 1, 4);
        ctx.fill();
      }
    }
  }
}

/** "Membro" arredondado com contorno (braços, pernas, mangas). */
export function limb(ctx, x1, y1, x2, y2, w, color, outline = true) {
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  if (outline) {
    ctx.strokeStyle = edge(color);
    ctx.lineWidth = w + 2.6;
    ctx.stroke();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.stroke();
}

export const lerp = (a, b, t) => a + (b - a) * t;

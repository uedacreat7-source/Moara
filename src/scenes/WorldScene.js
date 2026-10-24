import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import {
  HOUSES, TREES, BUSHES, FLOWERS, PROPS, POND, PLAZA, PATHS, HIDING_SPOTS, START, colliders,
} from '../data/worldLayout.js';
import { session } from '../game/session.js';
import { renderToCanvas, makeCanvas, FRAME_W, FRAME_H } from '../character/CharacterRenderer.js';
import { TAMANHOS, find } from '../character/options.js';
import { joystick } from '../ui/Joystick.js';
import { sfx } from '../audio/sound.js';
import { circle, ellipse, flower } from '../gfx.js';

const { WORLD_W: W, WORLD_H: H } = CONFIG;
const SPOT_BY_ID = Object.fromEntries(HIDING_SPOTS.map((s) => [s.id, s]));
const TEX_RES = 1.3;

/** Origem (ponto da base) de cada textura: fração da altura onde o objeto "pisa". */
const BASE = {
  casa: 244 / 260, arvore: 196 / 210, arbusto: 68 / 80, flores: 0.8, fonte: 150 / 180, poco: 134 / 150,
  escorregador: 144 / 160, balanco: 140 / 150, caixa_correio: 84 / 90, banco: 60 / 70, poste: 144 / 150,
  horta: 140 / 160, cogumelo: 0.92,
};

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('World');
  }

  create() {
    this.keys = [];
    this.texVersion = 0;
    this.walkPhase = 0;
    this.hint = null;

    this.physics.world.setBounds(110, 175, W - 220, H - 300);
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.setBackgroundColor('#9be27a');

    this.add.tileSprite(0, 0, W, H, 'grama').setOrigin(0).setDepth(-1000);
    this.buildGround();
    this.buildObjects();
    this.buildColliders();
    this.createPlayer();
    this.createAmbient();
    this.spawnKeys(false);

    this.kb = this.input.keyboard.addKeys(
      { up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT', w: 'W', a: 'A', s: 'S', d: 'D' },
      false,
    );

    this.fitCamera();
    this.scale.on('resize', this.fitCamera, this);
    const off = session.on('equip', () => this.refreshPlayerTexture());
    this.events.once('shutdown', () => {
      off();
      this.scale.off('resize', this.fitCamera, this);
    });
    this.events.on('resume', () => joystick.reset());
  }

  fitCamera() {
    const dpr = this.game.registry.get('dpr') || 1;
    const w = this.scale.width / dpr;
    const h = this.scale.height / dpr;
    const zoom = Phaser.Math.Clamp(Math.min(w, h) / 560, 0.62, 1.5) * dpr;
    this.cameras.main.setZoom(zoom);
  }

  // ------------------------------------------------------------------ chão

  buildGround() {
    const k = 0.5;
    const c = document.createElement('canvas');
    c.width = W * k;
    c.height = H * k;
    const ctx = c.getContext('2d');
    ctx.scale(k, k);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // lago
    ctx.fillStyle = '#e9d6a6';
    ctx.beginPath();
    ellipse(ctx, POND.x, POND.y, POND.rx + 18, POND.ry + 16);
    ctx.fill();
    const g = ctx.createRadialGradient(POND.x - 40, POND.y - 30, 20, POND.x, POND.y, POND.rx);
    g.addColorStop(0, '#a8e4ff');
    g.addColorStop(1, '#5cb8ec');
    ctx.fillStyle = g;
    ctx.beginPath();
    ellipse(ctx, POND.x, POND.y, POND.rx, POND.ry);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 6;
    for (const [dx, dy, r] of [[-80, -40, 40], [60, 30, 30], [-20, 60, 22]]) {
      ctx.beginPath();
      ctx.arc(POND.x + dx, POND.y + dy, r, Math.PI * 1.1, Math.PI * 1.6);
      ctx.stroke();
    }
    for (const [dx, dy] of [[-150, 10], [120, -60], [150, 50], [-60, -90]]) {
      ctx.fillStyle = '#5cc46a';
      ctx.beginPath();
      ctx.moveTo(POND.x + dx, POND.y + dy);
      ctx.arc(POND.x + dx, POND.y + dy, 22, 0.4, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      flower(ctx, POND.x + dx + 6, POND.y + dy - 4, 7, '#ffb3d1');
    }

    // caminhos (borda e depois o meio)
    for (const pass of [0, 1]) {
      ctx.strokeStyle = pass ? '#f6e4b8' : '#e2c68c';
      ctx.fillStyle = ctx.strokeStyle;
      for (const p of PATHS) {
        ctx.lineWidth = p.w + (pass ? 0 : 12);
        ctx.beginPath();
        p.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
      ctx.beginPath();
      circle(ctx, PLAZA.x, PLAZA.y, PLAZA.r + (pass ? 0 : 6));
      ctx.fill();
    }
    // pedrinhas da praça
    ctx.fillStyle = '#ecd6a4';
    for (let ring = 1; ring < 4; ring++) {
      const n = ring * 9;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        ctx.beginPath();
        circle(ctx, PLAZA.x + Math.cos(a) * ring * 42, PLAZA.y + Math.sin(a) * ring * 42, 9);
        ctx.fill();
      }
    }

    this.textures.addCanvas('chao', c);
    this.add.image(0, 0, 'chao').setOrigin(0).setScale(1 / k).setDepth(-900);
  }

  // ------------------------------------------------------------------ objetos

  placed(x, y, key, base, scale = 1) {
    return this.add.image(x, y, key).setOrigin(0.5, base).setScale(scale).setDepth(y);
  }

  buildObjects() {
    for (const h of HOUSES) this.placed(h.x, h.y, h.id, BASE.casa);
    for (const t of TREES) this.placed(t.x, t.y, `arvore_${t.v}`, BASE.arvore, t.grande ? 1.35 : 1);
    for (const b of BUSHES) this.placed(b.x, b.y, 'arbusto', BASE.arbusto);
    FLOWERS.forEach((f, i) => this.placed(f.x, f.y, `flores_${i % 4}`, BASE.flores));
    for (const p of PROPS) this.placed(p.x, p.y, p.tipo, BASE[p.tipo] ?? 0.9);

    // gotinhas da fonte
    this.add.particles(1200, 820, 'brilho', {
      speed: { min: 20, max: 60 },
      angle: { min: 200, max: 340 },
      gravityY: 120,
      lifespan: 900,
      scale: { start: 0.35, end: 0 },
      alpha: { start: 0.9, end: 0 },
      tint: 0xbfe9ff,
      frequency: 160,
    }).setDepth(940);
  }

  buildColliders() {
    this.walls = this.physics.add.staticGroup();
    for (const c of colliders()) {
      if (c.kind === 'rect') {
        const z = this.add.zone(c.x, c.y, c.w, c.h);
        this.walls.add(z);
      } else {
        const z = this.add.zone(c.x, c.y, c.r * 2, c.r * 2);
        this.walls.add(z);
        z.body.setCircle(c.r);
      }
    }
  }

  // ------------------------------------------------------------------ personagem

  createPlayer() {
    this.player = this.add.zone(START.x, START.y, 36, 36);
    this.physics.add.existing(this.player);
    this.player.body.setCircle(18);
    this.player.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);

    this.playerShadow = this.add.image(0, 0, 'sombra').setScale(0.9, 0.9);
    this.playerImg = this.add.image(0, 0, '__WHITE').setOrigin(0.5, 252 / FRAME_H);
    this.playerView = this.add.container(START.x, START.y, [this.playerShadow, this.playerImg]);
    this.refreshPlayerTexture();

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
  }

  refreshPlayerTexture() {
    const ch = session.character;
    if (!ch) return;
    const canvas = makeCanvas(Math.round(FRAME_W * TEX_RES), Math.round(FRAME_H * TEX_RES));
    renderToCanvas(canvas, ch.look, ch.equipado);
    const old = this.playerTexKey;
    this.playerTexKey = `heroi_${++this.texVersion}`;
    this.textures.addCanvas(this.playerTexKey, canvas);
    this.playerImg.setTexture(this.playerTexKey);
    const escala = find(TAMANHOS, ch.look.tamanho).escala;
    this.playerImg.setScale((CONFIG.PLAYER_HEIGHT * escala) / canvas.height);
    if (old) this.textures.remove(old);
  }

  // ------------------------------------------------------------------ chaves

  spawnKeys(withPoof) {
    for (const k of this.keys) k.destroy();
    this.keys = [];
    const r = session.character?.rodada;
    if (!r) return;
    for (const id of r.esconderijos) {
      if (r.pegas.includes(id)) continue;
      const s = SPOT_BY_ID[id];
      if (!s) continue;
      this.keys.push(this.createKey(s, withPoof));
    }
  }

  createKey(spot, withPoof) {
    const glow = this.add.image(0, -14, 'luz').setBlendMode(Phaser.BlendModes.ADD).setScale(0.9);
    const img = this.add.image(0, 0, 'chave').setOrigin(0.5, 0.75).setScale(0.75);
    const c = this.add.container(spot.x, spot.y, [glow, img]).setDepth(spot.y);
    c.spot = spot;
    this.tweens.add({ targets: img, y: -7, angle: { from: -8, to: 8 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: glow, alpha: { from: 0.35, to: 0.9 }, scale: { from: 0.7, to: 1.05 }, duration: 1100, yoyo: true, repeat: -1 });
    // brilhinhos que aparecem por cima de tudo (mesmo atrás das casas)
    c.sparkles = this.add.particles(spot.x, spot.y - 20, 'brilho', {
      speed: { min: 8, max: 30 },
      angle: { min: 230, max: 310 },
      lifespan: 1100,
      scale: { start: 0.55, end: 0 },
      alpha: { start: 1, end: 0 },
      frequency: 650,
      x: { min: -14, max: 14 },
    }).setDepth(50000);
    c.once('destroy', () => c.sparkles.destroy());
    if (withPoof) {
      c.setScale(0);
      this.tweens.add({ targets: c, scale: 1, duration: 500, ease: 'Back.out', delay: 200 + Math.random() * 400 });
    }
    return c;
  }

  async collectKey(k) {
    k.collected = true;
    this.keys = this.keys.filter((o) => o !== k);
    sfx.key();
    this.burst(k.x, k.y - 20);
    k.sparkles.stop();
    k.setDepth(60000);
    this.tweens.add({
      targets: k,
      y: k.y - 90,
      scale: 1.6,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.out',
      onComplete: () => k.destroy(),
    });
    this.floatText(k.x, k.y - 60, `+${CONFIG.COINS_PER_KEY}`);
    const res = await session.collectKey(k.spot.id);
    if (res.completou) {
      this.time.delayedCall(1000, () => this.game.events.emit('potinho'));
    }
  }

  burst(x, y) {
    const e = this.add.particles(x, y, 'brilho', {
      speed: { min: 120, max: 260 },
      lifespan: 700,
      scale: { start: 0.9, end: 0 },
      tint: [0xffe066, 0xff9ec7, 0x9ad8ff, 0xffffff],
      emitting: false,
    }).setDepth(60001);
    e.explode(26);
    this.time.delayedCall(900, () => e.destroy());
  }

  floatText(x, y, text) {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '40px',
      fontStyle: '700',
      color: '#ffcf33',
      stroke: '#7a4a12',
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(60002);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 1300, ease: 'Cubic.out', onComplete: () => t.destroy() });
  }

  /** Mostra uma setinha apontando para a chave mais perto. */
  showHint() {
    if (!this.keys.length) return false;
    const p = this.player;
    const nearest = this.keys.reduce((a, b) =>
      Phaser.Math.Distance.Between(p.x, p.y, a.x, a.y) < Phaser.Math.Distance.Between(p.x, p.y, b.x, b.y) ? a : b);
    this.hint?.arrow.destroy();
    const arrow = this.add.image(p.x, p.y, 'seta').setDepth(70000).setScale(0.9);
    this.hint = { arrow, target: nearest, until: this.time.now + CONFIG.HINT_SECONDS * 1000 };
    this.tweens.add({ targets: arrow, scale: 1.1, duration: 350, yoyo: true, repeat: -1 });
    nearest.list[1] && this.tweens.add({ targets: nearest, scale: 1.4, duration: 300, yoyo: true, repeat: 3 });
    return true;
  }

  // ------------------------------------------------------------------ vida no mundo

  createAmbient() {
    this.ducks = [0, 1, 2].map((i) => ({
      img: this.add.image(POND.x, POND.y, 'pato').setDepth(POND.y - 200).setScale(0.9),
      a: (i / 3) * Math.PI * 2,
      speed: 0.00018 + i * 0.00004,
      rx: POND.rx * (0.45 + i * 0.12),
      ry: POND.ry * (0.4 + i * 0.12),
    }));
    this.butterflies = [0, 1, 2, 3, 4, 5].map((i) => {
      const f = FLOWERS[(i * 3) % FLOWERS.length];
      return { img: this.add.image(f.x, f.y, `borboleta_${i % 3}`).setDepth(45000), base: f, t: i * 1000 };
    });
  }

  updateAmbient(time) {
    for (const d of this.ducks) {
      d.a += d.speed * this.game.loop.delta;
      d.img.x = POND.x + Math.cos(d.a) * d.rx;
      d.img.y = POND.y + Math.sin(d.a) * d.ry + Math.sin(time * 0.004 + d.a) * 2;
      d.img.setFlipX(Math.sin(d.a) > 0);
    }
    for (const b of this.butterflies) {
      const t = (time + b.t) * 0.001;
      b.img.x = b.base.x + Math.sin(t * 0.9) * 70 + Math.sin(t * 2.3) * 20;
      b.img.y = b.base.y - 50 + Math.cos(t * 1.3) * 35;
      b.img.scaleX = 0.4 + Math.abs(Math.sin(t * 14)) * 0.6;
    }
  }

  // ------------------------------------------------------------------ loop

  update(time, delta) {
    let vx = 0;
    let vy = 0;
    const k = this.kb;
    if (k.left.isDown || k.a.isDown) vx -= 1;
    if (k.right.isDown || k.d.isDown) vx += 1;
    if (k.up.isDown || k.w.isDown) vy -= 1;
    if (k.down.isDown || k.s.isDown) vy += 1;
    if (joystick.active) {
      vx += joystick.x;
      vy += joystick.y;
    }
    const len = Math.hypot(vx, vy);
    if (len > 1) {
      vx /= len;
      vy /= len;
    }
    this.player.body.setVelocity(vx * CONFIG.PLAYER_SPEED, vy * CONFIG.PLAYER_SPEED);

    const moving = len > 0.1;
    if (moving) {
      this.walkPhase += delta * 0.016;
      this.playerImg.y = -Math.abs(Math.sin(this.walkPhase)) * 7;
      this.playerImg.angle = Math.sin(this.walkPhase) * 4;
      if (vx < -0.15) this.playerImg.setFlipX(true);
      else if (vx > 0.15) this.playerImg.setFlipX(false);
    } else {
      this.playerImg.y *= 0.7;
      this.playerImg.angle *= 0.7;
    }
    this.playerView.setPosition(this.player.x, this.player.y);
    this.playerView.setDepth(this.player.y);

    for (const key of this.keys) {
      if (!key.collected && Phaser.Math.Distance.Between(this.player.x, this.player.y, key.x, key.y) < CONFIG.PICKUP_RADIUS) {
        this.collectKey(key);
        break;
      }
    }

    if (this.hint) {
      const { arrow, target, until } = this.hint;
      if (time > until || !this.keys.includes(target)) {
        arrow.destroy();
        this.hint = null;
      } else {
        const a = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        arrow.setPosition(this.player.x + Math.cos(a) * 95, this.player.y - 50 + Math.sin(a) * 95);
        arrow.setRotation(a);
      }
    }

    this.updateAmbient(time);
  }
}

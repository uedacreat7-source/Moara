/**
 * Sons e musiquinha gerados pelo próprio navegador (Web Audio), sem arquivos.
 * Para usar arquivos de áudio no futuro, basta trocar as funções de `sfx` e `music`.
 */

let ctx = null;
let master = null;
let muted = false;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Chame num toque/clique do usuário para liberar o áudio no celular. */
export function unlockAudio() {
  audio();
}

export function setMuted(m) {
  muted = m;
  if (master) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.05);
}

export const isMuted = () => muted;

function tone(freq, start, dur, { type = 'sine', vol = 0.2, slide = 0, dest } = {}) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(dest || master);
  o.start(start);
  o.stop(start + dur + 0.05);
}

const now = () => (audio() ? ctx.currentTime : 0);
const N = (n) => 440 * 2 ** ((n - 69) / 12);

export const sfx = {
  click() {
    tone(880, now(), 0.08, { type: 'triangle', vol: 0.15, slide: 1.4 });
  },
  pop() {
    tone(520, now(), 0.12, { type: 'sine', vol: 0.2, slide: 2 });
  },
  key() {
    const t = now();
    [76, 79, 84, 88].forEach((n, i) => tone(N(n), t + i * 0.07, 0.25, { type: 'triangle', vol: 0.18 }));
  },
  coin() {
    const t = now();
    tone(N(83), t, 0.08, { type: 'square', vol: 0.06 });
    tone(N(88), t + 0.07, 0.25, { type: 'square', vol: 0.06 });
  },
  fanfare() {
    const t = now();
    const notes = [72, 76, 79, 84, 79, 84, 88];
    notes.forEach((n, i) => tone(N(n), t + i * 0.12, i === notes.length - 1 ? 0.8 : 0.22, { type: 'triangle', vol: 0.18 }));
    [60, 64, 67].forEach((n) => tone(N(n), t + 0.72, 0.9, { type: 'sine', vol: 0.1 }));
  },
  magic() {
    const t = now();
    for (let i = 0; i < 10; i++) tone(N(84 + ((i * 5) % 12)), t + i * 0.05, 0.3, { type: 'sine', vol: 0.08 });
  },
  error() {
    const t = now();
    tone(330, t, 0.15, { type: 'triangle', vol: 0.15 });
    tone(262, t + 0.15, 0.25, { type: 'triangle', vol: 0.15 });
  },
  step() {
    tone(180 + Math.random() * 40, now(), 0.05, { type: 'sine', vol: 0.03 });
  },
};

// ---------------- Musiquinha em loop ----------------

const BPM = 96;
const BEAT = 60 / BPM;
// Dó - Lá menor - Fá - Sol
const CHORDS = [
  [48, 60, 64, 67],
  [45, 57, 60, 64],
  [41, 57, 60, 65],
  [43, 59, 62, 67],
];
const MELODY = [
  [76, 1], [79, 1], [81, 1], [79, 1], [76, 2], [72, 2],
  [74, 1], [76, 1], [77, 2], [76, 1], [74, 1], [72, 2],
  [72, 1], [74, 1], [76, 1], [79, 1], [81, 2], [79, 2],
  [77, 1], [76, 1], [74, 2], [71, 2], [72, 2],
];

let musicGain = null;
let timer = null;
let nextBar = 0;
let bar = 0;
let melodyTime = 0;
let melodyIdx = 0;

function scheduleMusic() {
  const a = audio();
  if (!a) return;
  while (nextBar < a.currentTime + 1.5) {
    const chord = CHORDS[bar % CHORDS.length];
    tone(N(chord[0]), nextBar, BEAT * 3.5, { type: 'sine', vol: 0.12, dest: musicGain });
    for (let i = 0; i < 8; i++) {
      const n = chord[1 + (i % 3)] + (i >= 4 ? 12 : 0);
      tone(N(n), nextBar + i * (BEAT / 2), BEAT * 0.6, { type: 'triangle', vol: 0.04, dest: musicGain });
    }
    nextBar += BEAT * 4;
    bar++;
  }
  while (melodyTime < a.currentTime + 1.5) {
    const [n, d] = MELODY[melodyIdx % MELODY.length];
    tone(N(n), melodyTime, BEAT * d * 0.9, { type: 'sine', vol: 0.07, dest: musicGain });
    melodyTime += BEAT * d;
    melodyIdx++;
  }
}

export const music = {
  start() {
    const a = audio();
    if (!a || timer) return;
    musicGain = a.createGain();
    musicGain.gain.value = 0.55;
    musicGain.connect(master);
    nextBar = a.currentTime + 0.1;
    melodyTime = nextBar + BEAT * 8;
    bar = 0;
    melodyIdx = 0;
    scheduleMusic();
    timer = setInterval(scheduleMusic, 250);
  },
  stop() {
    clearInterval(timer);
    timer = null;
    if (musicGain) {
      const g = musicGain;
      g.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      setTimeout(() => g.disconnect(), 1000);
      musicGain = null;
    }
  },
};

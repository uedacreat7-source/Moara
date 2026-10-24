/** Efeitos de comemoração em HTML (confete, textos flutuantes). */

const COLORS = ['#ff6fa5', '#ffd23f', '#7fd4ff', '#8be38b', '#c79bff', '#ffa94d'];

export function confetti(count = 80, host = document.body) {
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  host.appendChild(layer);
  const w = window.innerWidth;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    const size = 8 + Math.random() * 10;
    p.style.width = `${size}px`;
    p.style.height = `${size * (Math.random() > 0.5 ? 1 : 0.5)}px`;
    p.style.background = COLORS[i % COLORS.length];
    p.style.left = `${Math.random() * w}px`;
    p.style.borderRadius = Math.random() > 0.6 ? '50%' : '3px';
    layer.appendChild(p);
    const drift = (Math.random() - 0.5) * 200;
    p.animate(
      [
        { transform: 'translate(0, -40px) rotate(0deg)', opacity: 1 },
        { transform: `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${Math.random() * 720}deg)`, opacity: 1 },
      ],
      { duration: 1800 + Math.random() * 1600, delay: Math.random() * 500, easing: 'cubic-bezier(.25,.6,.4,1)', fill: 'forwards' },
    );
  }
  setTimeout(() => layer.remove(), 4200);
}

export function floatText(html, x, y, host = document.body) {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.innerHTML = html;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  host.appendChild(el);
  el.animate(
    [
      { transform: 'translate(-50%, 0) scale(.6)', opacity: 0 },
      { transform: 'translate(-50%, -30px) scale(1.15)', opacity: 1, offset: 0.25 },
      { transform: 'translate(-50%, -90px) scale(1)', opacity: 0 },
    ],
    { duration: 1400, easing: 'ease-out', fill: 'forwards' },
  ).onfinish = () => el.remove();
}

export function bump(el) {
  el?.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
    { duration: 380, easing: 'ease-out' },
  );
}

export function shake(el) {
  el?.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(0)' }],
    { duration: 380 },
  );
}

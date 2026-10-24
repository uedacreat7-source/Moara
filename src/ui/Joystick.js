/** Joystick virtual para celular/tablet. O mundo lê `joystick.x / joystick.y` (-1 a 1). */

export const joystick = {
  x: 0,
  y: 0,
  active: false,
  reset() {
    this.x = 0;
    this.y = 0;
    this.active = false;
  },
};

export function createJoystick() {
  const base = document.createElement('div');
  base.className = 'joystick';
  base.innerHTML = '<div class="joystick-knob"></div>';
  const knob = base.firstChild;
  let pointerId = null;

  const move = (e) => {
    const r = base.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const max = r.width * 0.36;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const len = Math.hypot(dx, dy);
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    const dead = 0.15;
    const m = Math.min(len / max, 1);
    joystick.active = m > dead;
    joystick.x = joystick.active ? dx / max : 0;
    joystick.y = joystick.active ? dy / max : 0;
  };

  const end = () => {
    pointerId = null;
    knob.style.transform = 'translate(-50%, -50%)';
    base.classList.remove('on');
    joystick.reset();
  };

  base.addEventListener('pointerdown', (e) => {
    pointerId = e.pointerId;
    base.setPointerCapture(e.pointerId);
    base.classList.add('on');
    move(e);
  });
  base.addEventListener('pointermove', (e) => e.pointerId === pointerId && move(e));
  base.addEventListener('pointerup', end);
  base.addEventListener('pointercancel', end);
  base.addEventListener('lostpointercapture', end);

  return base;
}

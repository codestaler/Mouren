/* bosses-lujuria.js — Día 2: LA LUJURIA
 * Mecánica: es la única que de verdad VUELA por todo el escenario, en
 * zigzag y a distintas alturas, se teletransporta y lanza un hechizo
 * dirigido que invierte los controles de Mouri unos segundos (no hace
 * daño directo, pero desorienta). */
import { orb } from "./helpers";

export function update(mb, w, dt) {
  mb.teleT -= dt;
  if (mb.teleT <= 0) {
    mb.x = 120 + Math.random() * (w._CW - 240);
    // vuela a una altura que SÍ alcanzan los disparos de Mouri:
    // el disparo recto va a y≈24 y el ondulante sube hasta y≈58, y la
    // hitbox contra el jefe cubre ±58, así que la mantenemos en 20-95.
    mb.y = 20 + Math.random() * 75;
    mb.teleT = 2.3; w.flash = .08;
  } else {
    // mientras no teletransporta, aletea en el aire (vuelo real)
    mb.y += Math.sin(Date.now() / 260) * 40 * dt;
  }
  mb.atkT -= dt;
  if (mb.atkT <= 0) {
    const dx = w.mouri.x - mb.x, dy = (w.mouri.y + 20) - mb.y, L = Math.hypot(dx, dy) || 1;
    orb(w, mb.x, mb.y, (dx / L) * 120, (dy / L) * 120, { hechizo: true });
    mb.atkT = mb.ataque;
  }
}

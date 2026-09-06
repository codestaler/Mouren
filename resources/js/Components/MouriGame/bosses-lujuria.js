/* bosses-lujuria.js — Día 2: LA LUJURIA
 * Mecánica: es la única que de verdad VUELA por todo el escenario, en
 * zigzag y a distintas alturas, se teletransporta y lanza un hechizo
 * dirigido que invierte los controles de Mouri unos segundos (no hace
 * daño directo, pero desorienta).
 *
 * 🆕 FASE DE FURIA: al bajar de la mitad de su vida, se teletransporta
 * más seguido, aletea más rápido y errático, y lanza DOS hechizos en
 * abanico en vez de uno solo. */
import { orb } from "./helpers";

export function update(mb, w, dt) {
  if (!mb.enrage && mb.hp <= mb.hpMax * 0.5) {
    mb.enrage = true;
    w.shake = 0.3;
    w.flash = 0.15;
  }

  mb.teleT -= dt;
  if (mb.teleT <= 0) {
    mb.x = 120 + Math.random() * (w._CW - 240);
    // vuela a una altura que SÍ alcanzan los disparos de Mouri:
    // el disparo recto va a y≈24 y el ondulante sube hasta y≈58, y la
    // hitbox contra el jefe cubre ±58, así que la mantenemos en 20-95.
    mb.y = 20 + Math.random() * 75;
    mb.teleT = mb.enrage ? 1.5 : 2.3; // 🆕 se teletransporta más seguido en furia
    w.flash = .08;
  } else {
    // mientras no teletransporta, aletea en el aire (vuelo real);
    // en furia el aleteo es más rápido y errático
    const periodo = mb.enrage ? 170 : 260;
    const amplitud = mb.enrage ? 55 : 40;
    mb.y += Math.sin(Date.now() / periodo) * amplitud * dt;
  }

  mb.atkT -= dt;
  if (mb.atkT <= 0) {
    const dx = w.mouri.x - mb.x, dy = (w.mouri.y + 20) - mb.y, L = Math.hypot(dx, dy) || 1;
    const ang = Math.atan2(dy, dx);
    orb(w, mb.x, mb.y, Math.cos(ang) * 120, Math.sin(ang) * 120, { hechizo: true });
    if (mb.enrage) {
      // 🆕 en furia lanza un segundo hechizo, ligeramente desviado
      const desvio = 0.35;
      orb(w, mb.x, mb.y, Math.cos(ang + desvio) * 120, Math.sin(ang + desvio) * 120, { hechizo: true });
    }
    mb.atkT = mb.enrage ? mb.ataque * 0.7 : mb.ataque;
  }
}

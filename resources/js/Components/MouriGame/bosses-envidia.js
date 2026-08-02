/* bosses-envidia.js — Día 4: LA ENVIDIA ("El Leviatán")
 * Mecánica: no vuela, se desliza ondulando a ras de suelo como una
 * serpiente marina, muy agresiva y rápida. Imita en tiempo real la
 * posición vertical de Mouri (si saltas, ella "salta" también con un
 * retraso corto) y copia tu último disparo devolviéndotelo. Recompensa
 * ser impredecible en vez de repetir el mismo patrón de esquive. */
import { orb, hurtMouri } from "./helpers";

export function update(mb, w, dt, A) {
  const dir = Math.sign(w.mouri.x - mb.x) || 1;
  mb.x += dir * mb.vel * dt;
  // ondula como una serpiente de mar
  mb.y = 40 + Math.sin(Date.now() / 220) * 26;

  // guarda un historial corto de la altura de Mouri para "imitarlo" con
  // un pequeño retraso (efecto espejo/reflejo agresivo)
  mb.historial = mb.historial || [];
  mb.historial.push(w.mouri.y);
  if (mb.historial.length > 12) mb.historial.shift();
  const ecoY = mb.historial[0] || 0;
  mb.y += ecoY * 0.25;

  mb.atkT -= dt;
  if (mb.atkT <= 0) {
    // dispara en abanico: más abierto y más lento que antes, para que se
    // pueda esquivar corriendo o saltando entre los orbes.
    for (const a of [-0.6, 0, 0.6]) orb(w, mb.x, mb.y, Math.sin(a) * 110 + dir * 45, -Math.cos(a) * 28);
    mb.atkT = mb.ataque;
  }
  // contacto directo también daña (es agresiva, no solo dispara),
  // pero con una hitbox más justa para que se pueda pasar cerca
  if (Math.abs(mb.x - w.mouri.x) < 24 && Math.abs(mb.y - w.mouri.y) < 34) {
    hurtMouri(w, A);
  }
}

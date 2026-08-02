/* bosses-gula.js — Día 1: LA GULA
 * Mecánica: se queda plantada AL FONDO, A UN LADO (no persigue a Mouri).
 * Se arrastra lentamente entre las flores tratando de tragarse la más
 * sana, mordiéndola de forma directa (daño real, no "necesidad"). Cada
 * mordisco la cura un poco, así que conviene matarla rápido. Solo lanza
 * un ataque a distancia ocasional para no ser un saco de boxeo pasivo. */
import { alive, orb, clamp } from "./helpers";
import { T } from "./config";

export function update(mb, w, dt, A) {
  // se queda pegada al fondo, muy abajo, moviéndose apenas
  mb.y = 24;
  const objetivo = alive(w).sort((a, b) => b.health - a.health)[0];
  if (objetivo) {
    const dir = Math.sign(objetivo.x - mb.x) || 1;
    if (Math.abs(objetivo.x - mb.x) > 45) mb.x += dir * mb.vel * dt;
    else {
      objetivo.health = clamp(objetivo.health - 24 * dt, 0, T.flowerMax);
      mb.hp = clamp(mb.hp + 4 * dt, 0, mb.hpMax); // se fortalece mordiendo
    }
  }
  mb.atkT -= dt;
  if (mb.atkT <= 0) { orb(w, mb.x, mb.y + 20, 0, -130); mb.atkT = mb.ataque; }
}

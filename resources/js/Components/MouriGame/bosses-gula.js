/* bosses-gula.js — Día 1: LA GULA
 * Mecánica: se queda plantada AL FONDO, A UN LADO (no persigue a Mouri).
 * Se arrastra lentamente entre las flores tratando de tragarse la más
 * sana, mordiéndola de forma directa (daño real, no "necesidad"). Cada
 * mordisco la cura un poco, así que conviene matarla rápido. Solo lanza
 * un ataque a distancia ocasional para no ser un saco de boxeo pasivo.
 *
 * 🆕 FASE DE FURIA: al bajar de la mitad de su vida, la Gula se pone
 * agresiva de verdad — se mueve más rápido, muerde con más fuerza, y en
 * vez de un solo orbe dispara un abanico de 3. Antes era el jefe más
 * simple del juego (se plantaba y mordía sin más); ahora tiene una
 * segunda mitad de pelea claramente distinta a la primera.             */
import { alive, orb, clamp } from "./helpers";
import { T } from "./config";

export function update(mb, w, dt, A) {
  // se queda pegada al fondo, muy abajo, moviéndose apenas
  mb.y = 24;

  // 🆕 al cruzar la mitad de su vida, entra en furia (una sola vez)
  if (!mb.enrage && mb.hp <= mb.hpMax * 0.5) {
    mb.enrage = true;
    mb.velBase = mb.velBase || mb.vel;
    mb.vel = mb.velBase * 1.7;
    w.shake = 0.35;
    w.flash = 0.2;
  }

  const objetivo = alive(w).sort((a, b) => b.health - a.health)[0];
  if (objetivo) {
    const dir = Math.sign(objetivo.x - mb.x) || 1;
    if (Math.abs(objetivo.x - mb.x) > 45) mb.x += dir * mb.vel * dt;
    else {
      objetivo.health = clamp(objetivo.health - (mb.enrage ? 34 : 24) * dt, 0, T.flowerMax);
      mb.hp = clamp(mb.hp + (mb.enrage ? 6 : 4) * dt, 0, mb.hpMax); // se fortalece mordiendo
    }
  }

  mb.atkT -= dt;
  if (mb.atkT <= 0) {
    if (mb.enrage) {
      // en furia dispara un abanico de 3, en vez de un solo orbe
      orb(w, mb.x, mb.y + 20, -70, -140);
      orb(w, mb.x, mb.y + 20, 0, -150);
      orb(w, mb.x, mb.y + 20, 70, -140);
      mb.atkT = mb.ataque * 0.65; // y ataca más seguido
    } else {
      orb(w, mb.x, mb.y + 20, 0, -130);
      mb.atkT = mb.ataque;
    }
  }
}

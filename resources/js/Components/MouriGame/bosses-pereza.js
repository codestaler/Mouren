/* bosses-pereza.js — Día 3: LA PEREZA
 * Mecánica "igual de perezosa": casi no se mueve (vel muy baja) y sus
 * ataques tienen un aviso larguísimo (telegraph) antes de salir. El
 * castigo por confiarse es que, cuando por fin ataca, cubre una zona
 * ancha y hace bastante daño. Recompensa la paciencia, no los reflejos. */
import { orb } from "./helpers";

export function update(mb, w, dt) {
  // se arrastra apenitas de un lado a otro
  mb.x += mb.dir * mb.vel * dt;
  if (mb.x < 90) { mb.x = 90; mb.dir = 1; }
  if (mb.x > w._CW - 90) { mb.x = w._CW - 90; mb.dir = -1; }
  mb.y = 30;

  // aviso largo antes de atacar (telegraph): se pone roja/tiembla
  mb.avisando = mb.atkT < 1.1;
  mb.atkT -= dt;
  if (mb.atkT <= 0) {
    // ataque ancho y lento, barre el suelo hacia ambos lados.
    // Va lento (72) para que se pueda correr o saltar por encima.
    for (const dx of [-1, 1]) orb(w, mb.x, 20, dx * 72, 0);
    // orbe que cae desde arriba justo sobre la Pereza: basta con no
    // quedarse debajo de ella (o saltar) para esquivarlo.
    orb(w, mb.x, 140, 0, -60, { gravity: true });
    mb.atkT = mb.ataque; mb.avisando = false;
  }
}

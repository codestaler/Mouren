/* bosses-pereza.js — Día 3: LA PEREZA
 * Mecánica "igual de perezosa": casi no se mueve (vel muy baja) y sus
 * ataques tienen un aviso larguísimo (telegraph) antes de salir. El
 * castigo por confiarse es que, cuando por fin ataca, cubre una zona
 * ancha y hace bastante daño. Recompensa la paciencia, no los reflejos.
 *
 * 🆕 FASE DE FURIA: al bajar de la mitad de su vida, "se despierta" un
 * poco — el aviso antes de atacar es más corto (menos tiempo para
 * reaccionar) y suma un tercer proyectil directo hacia Mouri, además
 * del barrido ancho de siempre. */
import { orb } from "./helpers";

export function update(mb, w, dt) {
  if (!mb.enrage && mb.hp <= mb.hpMax * 0.5) {
    mb.enrage = true;
    w.shake = 0.25;
  }

  // se arrastra apenitas de un lado a otro
  mb.x += mb.dir * mb.vel * dt;
  if (mb.x < 90) { mb.x = 90; mb.dir = 1; }
  if (mb.x > w._CW - 90) { mb.x = w._CW - 90; mb.dir = -1; }
  mb.y = 30;

  // aviso largo antes de atacar (telegraph): se pone roja/tiembla.
  // 🆕 en furia el aviso dura menos (0.75s en vez de 1.1s)
  const avisoUmbral = mb.enrage ? 0.75 : 1.1;
  mb.avisando = mb.atkT < avisoUmbral;
  mb.atkT -= dt;
  if (mb.atkT <= 0) {
    // ataque ancho y lento, barre el suelo hacia ambos lados.
    // Va lento (72) para que se pueda correr o saltar por encima.
    for (const dx of [-1, 1]) orb(w, mb.x, 20, dx * 72, 0);
    // orbe que cae desde arriba justo sobre la Pereza: basta con no
    // quedarse debajo de ella (o saltar) para esquivarlo.
    orb(w, mb.x, 140, 0, -60, { gravity: true });
    if (mb.enrage) {
      // 🆕 en furia suma un disparo directo hacia donde está Mouri
      const dx = w.mouri.x - mb.x;
      orb(w, mb.x, 20, Math.sign(dx || 1) * 95, 0);
    }
    mb.atkT = mb.ataque; mb.avisando = false;
  }
}

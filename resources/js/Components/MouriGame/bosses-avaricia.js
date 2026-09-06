/* bosses-avaricia.js — Día 5: LA AVARICIA
 * Mecánica: se PLANTA fija del lado derecho del escenario y jamás se
 * mueve de ahí. A cambio, ataca sin parar (ritmo alto) y "roba" salud
 * de la flor más cercana a distancia, convirtiéndola en monedas que la
 * hacen más fuerte. Hay que acercarse a distraerla/dañarla sin dejar
 * que drene demasiado tiempo seguido.
 *
 * 🆕 FASE DE FURIA: al bajar de la mitad de su vida, roba salud más
 * rápido y en mayor cantidad, y dispara DOS proyectiles apuntados en
 * vez de uno solo, con más cadencia. */
import { orb, alive, clamp } from "./helpers";
import { T } from "./config";

export function update(mb, w, dt) {
  mb.x = w._CW - 130; // fija a la derecha, siempre
  mb.y = 60 + Math.sin(Date.now() / 500) * 10;

  if (!mb.enrage && mb.hp <= mb.hpMax * 0.5) {
    mb.enrage = true;
    w.shake = 0.25;
  }

  // roba salud de la flor más cercana a su rincón, a distancia
  mb.robTimer = (mb.robTimer ?? 1) - dt;
  const cercana = alive(w).sort((a, b) => Math.abs(a.x - mb.x) - Math.abs(b.x - mb.x))[0];
  if (mb.robTimer <= 0 && cercana) {
    cercana.health = clamp(cercana.health - (mb.enrage ? 9 : 6), 0, T.flowerMax);
    mb.hp = clamp(mb.hp + (mb.enrage ? 4 : 3), 0, mb.hpMax);
    mb.monedas = (mb.monedas || 0) + 1;
    mb.robTimer = mb.enrage ? 1.0 : 1.4;
  }

  // ataque rápido y constante (no se mueve, pero no da respiro)
  mb.atkT -= dt;
  if (mb.atkT <= 0) {
    const dx = w.mouri.x - mb.x, dy = (w.mouri.y + 20) - mb.y, L = Math.hypot(dx, dy) || 1;
    const ang = Math.atan2(dy, dx);
    orb(w, mb.x, mb.y, Math.cos(ang) * 150, Math.sin(ang) * 150);
    if (mb.enrage) {
      // 🆕 en furia suma un segundo disparo, ligeramente desviado
      const desvio = 0.3;
      orb(w, mb.x, mb.y, Math.cos(ang + desvio) * 150, Math.sin(ang + desvio) * 150);
    }
    mb.atkT = mb.enrage ? mb.ataque * 0.7 : mb.ataque;
  }
}

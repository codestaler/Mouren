/* bosses-avaricia.js — Día 5: LA AVARICIA
 * Mecánica: se PLANTA fija del lado derecho del escenario y jamás se
 * mueve de ahí. A cambio, ataca sin parar (ritmo alto) y "roba" salud
 * de la flor más cercana a distancia, convirtiéndola en monedas que la
 * hacen más fuerte. Hay que acercarse a distraerla/dañarla sin dejar
 * que drene demasiado tiempo seguido. */
import { orb, alive, clamp } from "./helpers";
import { T } from "./config";

export function update(mb, w, dt) {
  mb.x = w._CW - 130; // fija a la derecha, siempre
  mb.y = 60 + Math.sin(Date.now() / 500) * 10;

  // roba salud de la flor más cercana a su rincón, a distancia
  mb.robTimer = (mb.robTimer ?? 1) - dt;
  const cercana = alive(w).sort((a, b) => Math.abs(a.x - mb.x) - Math.abs(b.x - mb.x))[0];
  if (mb.robTimer <= 0 && cercana) {
    cercana.health = clamp(cercana.health - 6, 0, T.flowerMax);
    mb.hp = clamp(mb.hp + 3, 0, mb.hpMax);
    mb.monedas = (mb.monedas || 0) + 1;
    mb.robTimer = 1.4;
  }

  // ataque rápido y constante (no se mueve, pero no da respiro)
  mb.atkT -= dt;
  if (mb.atkT <= 0) {
    const dx = w.mouri.x - mb.x, dy = (w.mouri.y + 20) - mb.y, L = Math.hypot(dx, dy) || 1;
    orb(w, mb.x, mb.y, (dx / L) * 150, (dy / L) * 150);
    mb.atkT = mb.ataque;
  }
}

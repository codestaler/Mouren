/* bosses-envidia.js — Día 4: LA ENVIDIA ("El Leviatán")
 * Mecánica: no vuela, se desliza ondulando a ras de suelo como una
 * serpiente marina, muy agresiva y rápida. Imita en tiempo real la
 * posición vertical de Mouri (si saltas, ella "salta" también con un
 * retraso corto).
 *
 * 🆕 CICLO DE SALTO: cada cierto tiempo interrumpe el deslizamiento,
 * salta fuera del suelo, se queda un instante arriba disparando una
 * lluvia de proyectiles hacia abajo, y luego se hunde bajo el suelo
 * para reaparecer en otro punto y retomar la ondulación normal.
 * Mientras sube, está arriba o baja NO se puede tocar (solo hay
 * contacto cuando está ondulando a ras de suelo o en el instante en
 * que está arriba, expuesta).
 *
 * FASE DE FURIA: al bajar de la mitad de su vida, todo el ciclo se
 * acelera ~30-35%, ondula más agitada y el abanico de disparos pasa
 * de 3 a 5 proyectiles (7 en la lluvia de arriba). El contacto directo
 * sigue igual de "justo" que antes (no le achicamos la hitbox al
 * jugador, solo la volvimos más agresiva). */
import { orb, hurtMouri } from "./helpers";

// Duración (segundos) de cada fase del ciclo, normal vs. en furia
const DURACIONES = {
  ondula:  { normal: 2.2, furia: 1.4 },
  sube:    { normal: 0.28, furia: 0.2 },
  arriba:  { normal: 0.55, furia: 0.4 },
  baja:    { normal: 0.32, furia: 0.22 },
  hundida: { normal: 1.0, furia: 0.65 },
};

const dur = (mb, fase) => (mb.enrage ? DURACIONES[fase].furia : DURACIONES[fase].normal);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn = (t) => t * t * t;

export function update(mb, w, dt, A) {
  if (!mb.enrage && mb.hp <= mb.hpMax * 0.5) {
    mb.enrage = true;
    mb.velBase = mb.velBase || mb.vel;
    mb.vel = mb.velBase * 1.35;
    w.shake = 0.3;
    w.flash = 0.15;
  }

  const Y_RAS = 40;              // altura "a ras de suelo" de siempre
  const Y_ARRIBA = Y_RAS - 130;  // qué tan alto salta
  const Y_HUNDIDA = Y_RAS + 110; // qué tan hundida queda bajo el suelo

  mb.fase = mb.fase || "ondula";
  mb.faseT = mb.faseT ?? dur(mb, "ondula");
  mb.atkT = mb.atkT ?? mb.ataque;

  const dir = Math.sign(w.mouri.x - mb.x) || 1;
  mb.faseT -= dt;

  switch (mb.fase) {
    case "ondula": {
      mb.x += dir * mb.vel * dt;

      const periodo = mb.enrage ? 160 : 220;
      const amplitud = mb.enrage ? 34 : 26;
      let y = Y_RAS + Math.sin(Date.now() / periodo) * amplitud;

      // eco: imita la altura de Mouri con un pequeño retraso
      mb.historial = mb.historial || [];
      mb.historial.push(w.mouri.y);
      if (mb.historial.length > 12) mb.historial.shift();
      y += (mb.historial[0] || 0) * 0.25;
      mb.y = y;

      // abanico normal, igual que antes
      mb.atkT -= dt;
      if (mb.atkT <= 0) {
        const angulos = mb.enrage ? [-0.9, -0.3, 0, 0.3, 0.9] : [-0.6, 0, 0.6];
        for (const a of angulos) {
          orb(w, mb.x, mb.y, Math.sin(a) * 110 + dir * 45, -Math.cos(a) * 28);
        }
        mb.atkT = mb.enrage ? mb.ataque * 0.75 : mb.ataque;
      }

      if (mb.faseT <= 0) {
        mb.fase = "sube";
        mb.faseT = dur(mb, "sube");
        mb.yInicio = mb.y;
      }
      break;
    }

    case "sube": {
      // salta hacia arriba (ease-out) sin dejar de avanzar en x
      mb.x += dir * mb.vel * 0.6 * dt;
      const t = 1 - Math.max(mb.faseT, 0) / dur(mb, "sube");
      mb.y = mb.yInicio + (Y_ARRIBA - mb.yInicio) * easeOut(t);

      if (mb.faseT <= 0) {
        mb.y = Y_ARRIBA;
        mb.fase = "arriba";
        mb.faseT = dur(mb, "arriba");
        mb.disparoArriba = false;
        w.shake = Math.max(w.shake || 0, 0.15);
      }
      break;
    }

    case "arriba": {
      // pausa breve arriba, expuesta, y descarga una lluvia de
      // proyectiles hacia abajo
      mb.x += dir * mb.vel * 0.3 * dt;
      if (!mb.disparoArriba) {
        const n = mb.enrage ? 7 : 5;
        for (let i = 0; i < n; i++) {
          const offset = (i - (n - 1) / 2) * 30;
          orb(w, mb.x + offset, mb.y, offset * 0.6, 150);
        }
        mb.disparoArriba = true;
      }

      if (mb.faseT <= 0) {
        mb.fase = "baja";
        mb.faseT = dur(mb, "baja");
        mb.yInicio = mb.y;
      }
      break;
    }

    case "baja": {
      // desciende (ease-in) hacia bajo el nivel del suelo
      mb.x += dir * mb.vel * 0.6 * dt;
      const t = 1 - Math.max(mb.faseT, 0) / dur(mb, "baja");
      mb.y = mb.yInicio + (Y_HUNDIDA - mb.yInicio) * easeIn(t);

      if (mb.faseT <= 0) {
        mb.y = Y_HUNDIDA;
        mb.fase = "hundida";
        mb.faseT = dur(mb, "hundida");
      }
      break;
    }

    case "hundida": {
      // bajo tierra: se reposiciona rápido e impredecible, intocable
      mb.x += dir * mb.vel * 1.4 * dt;
      mb.y = Y_HUNDIDA;

      if (mb.faseT <= 0) {
        mb.fase = "ondula";
        mb.faseT = dur(mb, "ondula");
        mb.historial = [];
      }
      break;
    }
  }

  // contacto directo: solo puede dañar cuando está visible sobre el
  // suelo (ondulando) o en el instante en que está arriba, expuesta.
  // Mientras sube, baja o está hundida es intocable — esa es la
  // "ventana segura" para reposicionarte o respirar.
  const expuesta = mb.fase === "ondula" || mb.fase === "arriba";
  if (
    expuesta &&
    Math.abs(mb.x - w.mouri.x) < 24 &&
    Math.abs(mb.y - w.mouri.y) < 34
  ) {
    hurtMouri(w, A);
  }
}

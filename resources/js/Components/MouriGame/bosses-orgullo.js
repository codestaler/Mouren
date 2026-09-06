/* bosses-orgullo.js — Día 7: EL ORGULLO — JEFE FINAL
 *
 * 🆕 AHORA TIENE 3 FASES DE DOS TIPOS DISTINTOS:
 *  - Fase 1 "El Reflejo" (memoria): EXACTAMENTE la misma mecánica de
 *    siempre — el Orgullo muestra una secuencia de símbolos que hay que
 *    repetir. Nada de esto cambió.
 *  - Fase 2 "La Máscara" (combate — disparo normal): el Orgullo tiene
 *    HP de verdad. Mouri puede moverse, saltar y disparar con sus
 *    controles normales (← → ↑ ESPACIO) para bajarle la vida, mientras
 *    esquiva los orbes que el Orgullo lanza.
 *  - Fase 3 "El Espejo Roto" (combate — increíble/final): más HP, se
 *    mueve más rápido y ataca con un abanico de orbes + un tiro directo
 *    apuntado a Mouri. La fase más difícil de las tres.
 *
 * Las vidas del jugador usan el HP normal de Mouri (w.mouri.hp), el
 * mismo que en el jardín — así las fases de memoria y de combate
 * comparten una sola barra de vida continua, sin reiniciarse entre
 * fases (igual que antes).                                             */
import { T, ORGULLO_FASES } from "./config";
import { orb } from "./helpers";

export const SIMBOLOS = ["left", "right", "up", "shoot"];
export const SIMBOLO_ICONO = { left: "◀", right: "▶", up: "▲", shoot: "✨" };

function faseCfg(n) {
  return ORGULLO_FASES[n - 1] || ORGULLO_FASES[ORGULLO_FASES.length - 1];
}

function rand() { return SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)]; }

export function initOrgullo(w) {
  const f1 = faseCfg(1);
  w.orbs = [];
  w.bullets = [];
  w.orgullo = {
    fase: 1,
    tipo: f1.tipo, // "memoria" | "combate" — así el resto del código no repite ORGULLO_FASES[...] por todos lados
    // --- estado de la fase de memoria ---
    ronda: 1,
    secuencia: [rand()],
    mostrando: true,
    mostrarIdx: 0,
    mostrarT: 0,
    jugadaIdx: 0,
    corazas: f1.rondas,
    flashCorrecto: 0,
    flashError: 0,
    // --- estado de las fases de combate (se llenan al entrar a ellas) ---
    x: T.CW * 0.5,
    y: 190,
    dir: 1,
    hp: 0,
    hpMax: 0,
    hitT: 0,
    atkT: 1.2,
    // --- compartido ---
    mensaje: "Observa con atención...",
    terminado: null,       // "victoria" | "derrota" | null
    faseCompletada: null,  // número de fase recién superada, o null
    entradaT: 1.2,
  };
}

/** Prepara la siguiente fase. Se llama desde MiniJuegoMouri.jsx justo
 * después de mostrar el diálogo de transición entre fases. */
export function avanzarFaseOrgullo(w) {
  const o = w.orgullo;
  const siguiente = o.fase + 1;
  if (siguiente > ORGULLO_FASES.length) { o.terminado = "victoria"; return; }
  const f = faseCfg(siguiente);

  o.fase = siguiente;
  o.tipo = f.tipo;
  o.faseCompletada = null;
  o.entradaT = 1.0;
  w.orbs = [];
  w.bullets = [];

  if (f.tipo === "memoria") {
    o.ronda = 1;
    o.corazas = f.rondas;
    o.secuencia = [rand()];
    o.mostrando = true;
    o.mostrarIdx = 0;
    o.mostrarT = f.tiempoPorSimbolo;
    o.jugadaIdx = 0;
    o.mensaje = "Observa con atención...";
  } else {
    o.hp = f.hp;
    o.hpMax = f.hp;
    o.x = T.CW * 0.5;
    o.y = 190;
    o.dir = 1;
    o.atkT = 1.2; // un pequeño respiro antes del primer ataque
    o.mensaje = "¡Esquiva y dispara!";
  }
}

/* ---------------- Fase de memoria (Fase 1, sin cambios de mecánica) ---------------- */
export function tickOrgullo(w, dt, inputSimbolo, A) {
  const o = w.orgullo;
  if (!o || o.terminado || o.faseCompletada || o.tipo !== "memoria") return;
  const f = faseCfg(o.fase);
  if (o.flashCorrecto > 0) o.flashCorrecto -= dt;
  if (o.flashError > 0) o.flashError -= dt;
  if (o.entradaT > 0) o.entradaT = Math.max(0, o.entradaT - dt);

  if (o.mostrando) {
    o.mostrarT -= dt;
    if (o.mostrarT <= 0) {
      o.mostrarIdx += 1;
      o.mostrarT = f.tiempoPorSimbolo;
      if (o.mostrarIdx >= o.secuencia.length) {
        o.mostrando = false;
        o.jugadaIdx = 0;
        o.mensaje = "¡Ahora repite la secuencia!";
      }
    }
    return;
  }

  if (!inputSimbolo) return;
  const esperado = o.secuencia[o.jugadaIdx];
  if (inputSimbolo === esperado) {
    o.jugadaIdx += 1;
    o.flashCorrecto = 0.25;
    A.playSfx("correcto");
    if (o.jugadaIdx >= o.secuencia.length) {
      o.corazas -= 1;
      A.playSfx("especial");
      if (o.corazas <= 0) {
        if (o.fase >= ORGULLO_FASES.length) { o.terminado = "victoria"; return; }
        o.faseCompletada = o.fase;
        return;
      }
      o.ronda += 1;
      o.secuencia = [...o.secuencia, rand()];
      o.mostrando = true; o.mostrarIdx = 0; o.mostrarT = f.tiempoPorSimbolo;
      o.mensaje = "Observa con atención...";
    }
  } else {
    o.flashError = 0.35;
    A.playSfx("error");
    w.mouri.hp -= 1;
    if (w.mouri.hp <= 0) { o.terminado = "derrota"; return; }
    o.secuencia = o.secuencia.slice(0, Math.max(1, o.secuencia.length - 1));
    o.mostrando = true; o.mostrarIdx = 0; o.mostrarT = f.tiempoPorSimbolo;
    o.mensaje = "Casi... vuelve a mirar.";
  }
}

/* ---------------- Fases de combate (Fase 2 y 3: disparo + esquive) ---------------- */
export function tickOrgulloCombate(w, dt, A) {
  const o = w.orgullo;
  if (!o || o.terminado || o.faseCompletada || o.tipo !== "combate") return;
  const f = faseCfg(o.fase);

  if (o.hitT > 0) o.hitT -= dt;
  if (o.entradaT > 0) o.entradaT = Math.max(0, o.entradaT - dt);

  // Mouri se quedó sin vidas (los orbes del Orgullo ya le hicieron daño vía tickOrbs)
  if (w.mouri.hp <= 0) { o.terminado = "derrota"; return; }

  // se desliza de un lado a otro del salón para no ser un blanco fácil
  o.x += o.dir * f.velMovimiento * dt;
  if (o.x < 140) { o.x = 140; o.dir = 1; }
  if (o.x > T.CW - 140) { o.x = T.CW - 140; o.dir = -1; }

  // ataque: patrones distintos según la fase
  o.atkT -= dt;
  if (o.atkT <= 0) {
    if (o.fase === 2) {
      // Fase 2 — disparo normal: un solo orbe recto hacia abajo
      orb(w, o.x, o.y, 0, -190);
    } else {
      // Fase 3 — increíble/final: abanico de 3 + un tiro directo apuntado a Mouri
      orb(w, o.x, o.y, -95, -210);
      orb(w, o.x, o.y, 0, -230);
      orb(w, o.x, o.y, 95, -210);
      const dirAlMouri = Math.sign(w.mouri.x - o.x) || 1;
      orb(w, o.x, o.y, dirAlMouri * 70, -260);
    }
    o.atkT = f.cadenciaAtaque;
  }

  // balas de Mouri contra el Orgullo (mismo patrón que los demás jefes)
  const hitR = 54;
  for (const b of w.bullets) {
    if (!b.dead && Math.abs(b.x - o.x) < hitR && Math.abs(b.y - o.y) < 60) {
      b.dead = true;
      o.hp -= 1;
      o.hitT = 0.18;
      A.playSfx("golpe");
    }
  }
  w.bullets = w.bullets.filter((b) => !b.dead);

  if (o.hp <= 0) {
    if (o.fase >= ORGULLO_FASES.length) { o.terminado = "victoria"; return; }
    o.faseCompletada = o.fase;
  }
}

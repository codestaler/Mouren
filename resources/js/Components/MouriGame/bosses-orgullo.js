/* bosses-orgullo.js — Día 7: EL ORGULLO — JEFE FINAL DE INTELIGENCIA
 * Mecánica: no se vence a golpes. El Orgullo muestra una secuencia de
 * símbolos (flechas) que crece cada ronda; Mouri debe repetirla en el
 * orden correcto usando ← → ↑ (y ESPACIO como cuarto símbolo). Acertar
 * una ronda completa le quita una "coraza" de soberbia; fallar te quita
 * una vida y reduce la secuencia (para no frustrar demasiado). Ganas
 * cuando superas todas las rondas (T.orgulloRondas).                    */
import { T, ASSETS } from "./config";

export const SIMBOLOS = ["left", "right", "up", "shoot"];
export const SIMBOLO_ICONO = { left: "◀", right: "▶", up: "▲", shoot: "✨" };

export function initOrgullo(w) {
  w.orgullo = {
    ronda: 1,
    secuencia: [rand()],
    mostrando: true,
    mostrarIdx: 0,
    mostrarT: 0,
    jugadaIdx: 0,
    vidas: T.mouriMaxHP,
    corazas: T.orgulloRondas,
    mensaje: "Observa con atención...",
    terminado: null, // "victoria" | "derrota" | null
    flashCorrecto: 0,
    flashError: 0,
    entradaT: 1.2, // segundos de animación de entrada al aparecer el jefe final
  };
}

function rand() { return SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)]; }

export function tickOrgullo(w, dt, inputSimbolo, A) {
  const o = w.orgullo;
  if (!o || o.terminado) return;
  if (o.flashCorrecto > 0) o.flashCorrecto -= dt;
  if (o.flashError > 0) o.flashError -= dt;
  if (o.entradaT > 0) o.entradaT = Math.max(0, o.entradaT - dt);

  if (o.mostrando) {
    o.mostrarT -= dt;
    if (o.mostrarT <= 0) {
      o.mostrarIdx += 1;
      o.mostrarT = T.orgulloTiempoPorSimbolo;
      if (o.mostrarIdx >= o.secuencia.length) {
        o.mostrando = false;
        o.jugadaIdx = 0;
        o.mensaje = "¡Ahora repite la secuencia!";
      }
    }
    return;
  }

  // esperando input del jugador
  if (!inputSimbolo) return;
  const esperado = o.secuencia[o.jugadaIdx];
  if (inputSimbolo === esperado) {
    o.jugadaIdx += 1;
    o.flashCorrecto = 0.25;
    A.playSfx("correcto");
    if (o.jugadaIdx >= o.secuencia.length) {
      // ronda completada
      o.corazas -= 1;
      A.playSfx("especial");
      if (o.corazas <= 0) { o.terminado = "victoria"; return; }
      o.ronda += 1;
      o.secuencia = [...o.secuencia, rand()];
      o.mostrando = true; o.mostrarIdx = 0; o.mostrarT = T.orgulloTiempoPorSimbolo;
      o.mensaje = "Observa con atención...";
    }
  } else {
    o.flashError = 0.35;
    A.playSfx("error");
    o.vidas -= 1;
    if (o.vidas <= 0) { o.terminado = "derrota"; return; }
    // se acorta un poco la secuencia para dar respiro, pero sigue exigiendo memoria
    o.secuencia = o.secuencia.slice(0, Math.max(1, o.secuencia.length - 1));
    o.mostrando = true; o.mostrarIdx = 0; o.mostrarT = T.orgulloTiempoPorSimbolo;
    o.mensaje = "Casi... vuelve a mirar.";
  }
}

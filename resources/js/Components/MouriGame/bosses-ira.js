/* bosses-ira.js — Día 6: LA IRA — CARRERA DE AUTOS
 * Mecánica: aquí el juego cambia por completo. En vez de flores y
 * disparos, Mouri maneja un auto en 3 carriles (← → para cambiar de
 * carril). Aparecen obstáculos que hay que esquivar; si chocas pierdes
 * una vida y la Ira (que viene detrás, pegada) se acerca un poco más.
 * Si la Ira te alcanza del todo, pierdes. Sobrevive el tiempo del día
 * para ganar. Es la única mecánica del juego basada en reflejos puros
 * de movimiento lateral, sin disparo.                                  */
import { T } from "./config";
import { clamp } from "./helpers";

const CARRILES = [0.28, 0.5, 0.72]; // posiciones relativas de los 3 carriles

export function initIra(w) {
  w.ira = {
    carril: 1,           // 0,1,2
    carrilVisual: CARRILES[1] * T.CW,
    distanciaIra: 260,    // qué tan lejos viene la Ira detrás (más chico = más peligro)
    obstaculos: [],
    spawnT: 1.1,
    vel: T.iraVelBase,
    timer: 0,
    vidas: T.mouriMaxHP,
    invuln: 0,
    nextId: 1,
    terminado: null, // "victoria" | "derrota" | null
  };
}

export function tickIra(w, dt, keys, A) {
  const r = w.ira;
  if (!r || r.terminado) return;

  r.timer += dt;
  if (r.invuln > 0) r.invuln -= dt;

  // cambiar de carril con ← →
  if (keys.left && !r._lockL) { r.carril = clamp(r.carril - 1, 0, 2); r._lockL = true; }
  if (!keys.left) r._lockL = false;
  if (keys.right && !r._lockR) { r.carril = clamp(r.carril + 1, 0, 2); r._lockR = true; }
  if (!keys.right) r._lockR = false;

  const objetivo = CARRILES[r.carril] * T.CW;
  r.carrilVisual += (objetivo - r.carrilVisual) * Math.min(1, dt * 10);

  // la Ira se acerca lentamente con el tiempo (sube la tensión)
  r.distanciaIra = Math.max(60, r.distanciaIra - 4 * dt);

  // obstáculos
  r.spawnT -= dt;
  if (r.spawnT <= 0) {
    const carrilObs = Math.floor(Math.random() * 3);
    r.obstaculos.push({ id: r.nextId++, carril: carrilObs, z: 900 });
    r.spawnT = Math.max(0.55, 1.15 - r.timer / 90);
  }
  for (const o of r.obstaculos) o.z -= r.vel * dt;

  // colisión: obstáculo llega a la zona de Mouri (z bajo) y mismo carril
  for (const o of r.obstaculos) {
    if (!o.pasado && o.z < 70 && o.z > -40 && o.carril === r.carril) {
      o.pasado = true;
      if (r.invuln <= 0) {
        r.vidas -= 1; r.invuln = 1.1; r.distanciaIra = Math.max(50, r.distanciaIra - 70);
        A.playSfx("choque");
      }
    }
  }
  r.obstaculos = r.obstaculos.filter((o) => o.z > -60);

  if (r.distanciaIra <= 40 || r.vidas <= 0) r.terminado = "derrota";
  else if (r.timer >= T.iraDur) r.terminado = "victoria";
}

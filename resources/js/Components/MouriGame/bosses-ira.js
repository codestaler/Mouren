/* bosses-ira.js — Día 6: LA IRA — CARRERA DE AUTOS
 * Mecánica: aquí el juego cambia por completo. En vez de flores y
 * disparos, Mouri maneja un auto en 3 carriles (← → para cambiar de
 * carril). Aparecen obstáculos que hay que esquivar; si chocas pierdes
 * una vida y la Ira (que viene detrás, pegada) se acerca un poco más.
 * Si la Ira te alcanza del todo, pierdes. Sobrevive el tiempo del día
 * para ganar.
 *
 * 🆕 AHORA TIENE 2 FASES:
 *  - Fase 1 (primera mitad del tiempo): igual de exigente que antes,
 *    un obstáculo por carril.
 *  - Fase 2 (segunda mitad): la Ira acelera, y además de los obstáculos
 *    normales aparecen "muros" que bloquean DOS carriles a la vez —
 *    solo queda uno libre para pasar.
 *
 * 🆕 HITBOX ARREGLADO: antes todos los obstáculos se dibujaban del MISMO
 * tamaño sin importar qué tan lejos estuvieran, así que era imposible
 * calcular a ojo cuándo iban a llegar (el choque se sentía "random").
 * Ahora crecen y se aclaran a medida que se acercan (ver el tamaño/opacidad
 * que se calcula en MiniJuegoMouri.jsx a partir de o.z), y la ventana de
 * colisión quedó alineada con el punto exacto donde se ve el auto.        */
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
    fase: 1,
    avisoT: 0,
    avisoTexto: "",
    terminado: null, // "victoria" | "derrota" | null
  };
}

export function tickIra(w, dt, keys, A) {
  const r = w.ira;
  if (!r || r.terminado) return;

  r.timer += dt;
  if (r.invuln > 0) r.invuln -= dt;
  if (r.avisoT > 0) r.avisoT -= dt;

  // 🆕 a mitad de camino, sube a fase 2: más velocidad y muros dobles
  if (r.fase === 1 && r.timer >= T.iraDur * 0.5) {
    r.fase = 2;
    r.vel *= 1.22;
    r.avisoT = 3;
    r.avisoTexto = "¡FASE 2! La Ira acelera y aparecen muros dobles.";
    A.playMusica?.("iraFase2");
  }

  // cambiar de carril con ← →
  if (keys.left && !r._lockL) { r.carril = clamp(r.carril - 1, 0, 2); r._lockL = true; }
  if (!keys.left) r._lockL = false;
  if (keys.right && !r._lockR) { r.carril = clamp(r.carril + 1, 0, 2); r._lockR = true; }
  if (!keys.right) r._lockR = false;

  const objetivo = CARRILES[r.carril] * T.CW;
  r.carrilVisual += (objetivo - r.carrilVisual) * Math.min(1, dt * 10);

  // la Ira se acerca lentamente con el tiempo (sube la tensión), un poco más rápido en fase 2
  r.distanciaIra = Math.max(60, r.distanciaIra - (r.fase === 2 ? 5.5 : 4) * dt);

  // obstáculos
  r.spawnT -= dt;
  if (r.spawnT <= 0) {
    if (r.fase === 2 && Math.random() < 0.32) {
      // 🆕 muro: bloquea 2 de los 3 carriles, deja uno libre al azar
      const libre = Math.floor(Math.random() * 3);
      const carriles = [0, 1, 2].filter((c) => c !== libre);
      r.obstaculos.push({ id: r.nextId++, carriles, muro: true, z: 900 });
    } else {
      const carrilObs = Math.floor(Math.random() * 3);
      r.obstaculos.push({ id: r.nextId++, carril: carrilObs, z: 900 });
    }
    const base = r.fase === 2 ? 1.0 : 1.15;
    const piso = r.fase === 2 ? 0.48 : 0.55;
    r.spawnT = Math.max(piso, base - r.timer / 90);
  }
  for (const o of r.obstaculos) o.z -= r.vel * dt;

  // colisión: obstáculo llega a la zona de Mouri (z bajo) y mismo carril
  // (ventana alineada con el auto, ver render en MiniJuegoMouri.jsx)
  for (const o of r.obstaculos) {
    if (o.pasado) continue;
    const enZonaGolpe = o.z < 62 && o.z > -30;
    const mismoCarril = o.muro ? o.carriles.includes(r.carril) : o.carril === r.carril;
    if (enZonaGolpe && mismoCarril) {
      o.pasado = true;
      if (r.invuln <= 0) {
        r.vidas -= 1; r.invuln = 1.1; r.distanciaIra = Math.max(50, r.distanciaIra - 70);
        A.playSfx("choque");
      }
    } else if (o.z <= -30) {
      o.pasado = true; // pasó de largo sin golpear
    }
  }
  r.obstaculos = r.obstaculos.filter((o) => o.z > -60);

  if (r.distanciaIra <= 40 || r.vidas <= 0) r.terminado = "derrota";
  else if (r.timer >= T.iraDur) r.terminado = "victoria";
}

/* minibosses.js — despacha cada mini-jefe (días 1 a 5) a su propio
 * archivo de comportamiento (bosses-gula.js, bosses-lujuria.js, etc.),
 * y comparte la lógica común: aparición, balas de Mouri contra él, y
 * derrota. Los días 6 (Ira) y 7 (Orgullo) NO pasan por aquí: tienen su
 * propia escena completa (ver bosses-ira.js / bosses-orgullo.js y
 * MiniJuegoMouri.jsx).                                                  */
import { MINI_JEFES, T, DIALOGOS } from "./config";
import * as Gula from "./bosses-gula";
import * as Lujuria from "./bosses-lujuria";
import * as Pereza from "./bosses-pereza";
import * as Envidia from "./bosses-envidia";
import * as Avaricia from "./bosses-avaricia";

const COMPORTAMIENTOS = {
  gula: Gula.update,
  lujuria: Lujuria.update,
  pereza: Pereza.update,
  envidia: Envidia.update,
  avaricia: Avaricia.update,
};

export function spawnMiniBoss(w, id, A, startDialog, rerender) {
  const d = MINI_JEFES[id];
  w.mini = {
    ...d, hpMax: d.hp, hp: d.hp,
    x: T.CW * 0.5, y: 150, dir: 1, atkT: 1.2, hitT: 0, scale: 1,
    teleT: 1.5, robTimer: 1, historial: [],
    entradaT: 0.9, // segundos de animación de entrada al aparecer
  };
  A.playMusica(id); // CAMBIO: cada mini-jefe tiene su propia música (ver config.js -> MUSICA)
  A.playSfx("aparicion");
  w.shake = .5;
  startDialog(DIALOGOS.miniJefe[id] || [], () => {});
  rerender();
}

export function runMiniBoss(w, dt, A, startDialog, rerender, dayCfg) {
  const mb = w.mini;
  if (!mb) return;
  if (mb.hitT > 0) mb.hitT -= dt;
  if (mb.entradaT > 0) mb.entradaT = Math.max(0, mb.entradaT - dt);

  w._CW = T.CW; // pequeño atajo para que los módulos de jefe no tengan que importar T aparte
  const comportamiento = COMPORTAMIENTOS[mb.id];
  if (comportamiento) comportamiento(mb, w, dt, A);

  // balas de Mouri contra el mini-jefe (igual para todos)
  const hitR = 50;
  for (const b of w.bullets) {
    if (!b.dead && Math.abs(b.x - mb.x) < hitR && Math.abs(b.y - mb.y) < 58) {
      b.dead = true;
      mb.hp -= 1;
      mb.hitT = .18;
      A.playSfx("golpe");
    }
  }
  w.bullets = w.bullets.filter((b) => !b.dead);

  if (mb.hp <= 0) {
    w.mini = null; w.miniDone = true; w.darkness = 0; w.score += 120; w.flash = .5; w.shake = .4;
    w.orbs = [];
    A.playMusica(dayCfg(w.day).night ? "noche" : "dia");
    startDialog(DIALOGOS.miniJefeVencido, () => {});
    rerender();
  }
}

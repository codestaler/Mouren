/* almas-engine.js — lógica pura del modo CELULAR: "Mouri, guía de almas".
 * Mouri vuela hacia el amanecer llevando el alma de una mascota.
 * Un solo dedo: desliza para volar, toca para graznar.
 * Sin React ni dibujo (eso está en MouriAlmas.jsx / almas-render.js).   */
import { CAPITULOS_ALMAS } from "./config-avion";
import { vibrar } from "./helpers";

export const M = { W: 360, H: 640, yMin: 250, yMax: 590, luces: 4 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);

export function crearCapitulo(idx) {
  const cfg = CAPITULOS_ALMAS[idx];
  const { W } = M;
  return {
    idx, cfg, t: 0, dur: cfg.dur, fase: "vuelo", cierreT: 0,
    m: { x: W / 2, y: 470, tx: W / 2, ty: 470, invuln: 1.0 },
    alma: { x: W / 2, y: 540, trail: [] },
    luces: M.luces, recogidos: 0, generados: 0, proxLuz: 6,
    obst: [], rec: [], fx: [], rayos: [],
    graznar: { cd: 0, t: 0 },
    viento: { estado: 0, dir: 1, t: 0, prox: 7 },
    windX: 0,
    niebla: 0, nieblaObj: 0, nieblaT: 9,
    spawnT: 2, sigueT: 5, recT: 1.2, rayoT: 6, muroT: 14,
    shake: 0, flash: 0, nextId: 1, mem: null, aviso: null, memIdx: 0,
    cawReq: false, terminado: null,
  };
}

function nuevoId(a) { return a.nextId++; }

function chispas(a, x, y, color, n = 8) {
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2, v = rnd(30, 140);
    a.fx.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, t: 0, life: rnd(0.4, 0.9), color, r: rnd(2, 4) });
  }
}

function golpe(a, A) {
  const m = a.m;
  if (m.invuln > 0 || a.fase !== "vuelo") return;
  a.luces -= 1; m.invuln = 1.5; a.shake = 0.3; a.flash = 0.25;
  chispas(a, m.x, m.y, "#6d4dff", 12);
  A && A.playSfx("choque");
  vibrar(60);
  if (a.luces <= 0) { a.luces = 0; a.terminado = "derrota"; }
}

function graznar(a, A) {
  const g = a.graznar;
  if (g.cd > 0 || a.fase !== "vuelo") return;
  g.cd = 3.2; g.t = 0.5;
  A && A.playSfx("especial");
  vibrar(25);
  const R = 165;
  for (const o of a.obst) {
    if (o.tipo === "rayoPieza") continue;
    if (Math.hypot(o.x - a.m.x, o.y - a.m.y) < R) { o.dead = true; chispas(a, o.x, o.y, "#d9c8ff", 8); }
  }
  for (const r of a.rec) if (Math.hypot(r.x - a.m.x, r.y - a.m.y) < R + 40) r.pull = true;
}

export function crearSombra(a, x, y, tipo = "sombra", o = {}) {
  a.obst.push({ id: nuevoId(a), tipo, x, y, vx: 0, vy: a.cfg.vel * rnd(0.72, 1.0), r: 18, t: 0, fase: rnd(0, 6), amp: rnd(8, 26), ...o });
}

export function actualizar(a, dt, input, A) {
  if (a.terminado) return;
  const cfg = a.cfg, { W, H } = M, m = a.m, ob = cfg.obst;
  a.t += dt;
  if (m.invuln > 0) m.invuln -= dt;
  if (a.shake > 0) a.shake -= dt;
  if (a.flash > 0) a.flash -= dt;
  if (a.graznar.cd > 0) a.graznar.cd -= dt;
  if (a.graznar.t > 0) a.graznar.t -= dt;
  if (a.mem) { a.mem.t -= dt; if (a.mem.t <= 0) a.mem = null; }
  if (a.aviso) { a.aviso.t -= dt; if (a.aviso.t <= 0) a.aviso = null; }

  /* ---- ayuda inicial ---- */
  if (!a._ayuda && a.t > 0.8) { a._ayuda = true; a.aviso = { texto: cfg.ayuda, t: 5.5 }; }

  /* ---- mover a Mouri ---- */
  if (input.target) { m.tx = input.target.x; m.ty = input.target.y; }
  // viento: empuja suavemente el objetivo (hay que compensar con el dedo)
  const v = a.viento;
  if (ob.viento) {
    v.t -= dt;
    if (v.estado === 0) { v.prox -= dt; if (v.prox <= 0 && a.fase === "vuelo" && a.t < a.dur - 6) { v.estado = 1; v.t = 1.0; v.dir = Math.random() < 0.5 ? -1 : 1; a.aviso = { texto: v.dir > 0 ? "💨 Viento hacia la derecha" : "💨 Viento hacia la izquierda", t: 1.8 }; } }
    else if (v.estado === 1 && v.t <= 0) { v.estado = 2; v.t = 2.2; }
    else if (v.estado === 2) { a.windX = clamp(a.windX + v.dir * 150 * dt, -110, 110); if (v.t <= 0) { v.estado = 0; v.prox = rnd(7, 11); } }
  }
  if (v.estado !== 2) a.windX *= Math.max(0, 1 - dt * 1.4);
  if (a.fase === "cierre") { m.tx = W / 2; m.ty = 300; }
  const wx = a.fase === "vuelo" ? a.windX : 0;
  const k = Math.min(1, dt * 12);
  m.x += (clamp(m.tx + wx, 26, W - 26) - m.x) * k;
  m.y += (clamp(m.ty, a.fase === "cierre" ? 120 : M.yMin, M.yMax) - m.y) * k;

  // el alma sigue a Mouri con retraso
  const s = a.alma;
  s.x += (m.x - s.x) * Math.min(1, dt * 5);
  s.y += ((m.y + 62) - s.y) * Math.min(1, dt * 5);
  s.trail.push({ x: s.x, y: s.y }); if (s.trail.length > 14) s.trail.shift();

  if (input.tap && a.fase === "vuelo") { graznar(a, A); }
  input.tap = false;

  /* ---- cierre (llegada al amanecer) ---- */
  if (a.fase === "vuelo" && a.t >= a.dur) {
    a.fase = "cierre"; a.cierreT = 3.4; a.obst = []; a.rayos = [];
    a.aviso = { texto: "¡El amanecer!", t: 2.2 };
  }
  if (a.fase === "cierre") {
    a.cierreT -= dt;
    s.y -= 20 * dt;
    if (a.cierreT <= 0) { a.terminado = "victoria"; return; }
  }

  /* ---- niebla ---- */
  if (ob.niebla && a.fase === "vuelo") {
    a.nieblaT -= dt;
    if (a.nieblaT <= 0) { a.nieblaObj = a.nieblaObj > 0.2 ? 0 : 0.7; a.nieblaT = a.nieblaObj > 0 ? 7 : 6; }
  } else a.nieblaObj = 0;
  a.niebla += (a.nieblaObj - a.niebla) * Math.min(1, dt * 0.7);

  /* ---- generación ---- */
  if (a.fase === "vuelo" && a.t < a.dur - 3) {
    const prog = a.t / a.dur;
    a.spawnT -= dt;
    if (a.spawnT <= 0) {
      a.spawnT = ob.sombra * (1 - 0.35 * prog) * rnd(0.8, 1.2);
      crearSombra(a, rnd(30, W - 30), -24);
      if (prog > 0.55 && Math.random() < 0.3) crearSombra(a, rnd(30, W - 30), -60);
    }
    if (ob.sigue > 0) {
      a.sigueT -= dt;
      if (a.sigueT <= 0) { a.sigueT = (ob.sigue * 5.5) * (1 - 0.3 * prog) * rnd(0.85, 1.15); crearSombra(a, rnd(40, W - 40), -24, "sigue", { vy: cfg.vel * 0.55 }); }
    }
    a.recT -= dt;
    if (a.recT <= 0) {
      a.recT = rnd(1.1, 1.6);
      const x0 = rnd(50, W - 50), n = Math.random() < 0.35 ? 3 : 1;
      for (let i = 0; i < n; i++) { a.rec.push({ id: nuevoId(a), x: clamp(x0 + (i - (n - 1) / 2) * 34, 24, W - 24), y: -20 - i * 22, vy: cfg.vel * 0.85, r: 13, t: 0 }); a.generados++; }
    }
    if (ob.rayos && a.t > 6) {
      a.rayoT -= dt;
      if (a.rayoT <= 0) {
        a.rayoT = rnd(4.6, 6.4) * (1 - 0.25 * prog);
        const x = rnd(50, W - 50), dos = prog > 0.5 && Math.random() < 0.5;
        a.rayos.push({ x, w: 54, t: 0, warn: 1.25, act: 0.28 });
        if (dos) a.rayos.push({ x: clamp(x + (Math.random() < 0.5 ? -130 : 130), 40, W - 40), w: 54, t: 0, warn: 1.25, act: 0.28 });
      }
    }
    if (ob.muro && prog > 0.45) {
      a.muroT -= dt;
      if (a.muroT <= 0) {
        a.muroT = rnd(6.5, 8);
        const gap = rnd(90, W - 90), gw = 118;
        for (let x = 20; x < W; x += 38) if (Math.abs(x - gap) > gw / 2) crearSombra(a, x, -30, "muro", { vy: cfg.vel * 0.82, r: 19, amp: 0 });
        a.aviso = { texto: "🌑 ¡Un muro del Olvido! Busca el hueco o grazna", t: 2.2 };
      }
    }
  }

  /* ---- mover y chocar ---- */
  for (const o of a.obst) {
    o.t += dt;
    if (o.tipo === "sigue") { o.vx += Math.sign(m.x - o.x) * 90 * dt; o.vx = clamp(o.vx, -55, 55); }
    o.x += o.vx * dt + (o.amp ? Math.cos(o.t * 2 + o.fase) * o.amp * dt : 0);
    o.y += o.vy * dt;
    if (Math.hypot(o.x - m.x, o.y - m.y) < 11 + o.r * 0.72) { golpe(a, A); if (m.invuln > 1.4) o.dead = true; }
    if (o.y > H + 40) o.dead = true;
  }
  for (const r of a.rec) {
    r.t += dt;
    if (r.pull) { const d = Math.hypot(m.x - r.x, m.y - r.y) || 1; r.x += ((m.x - r.x) / d) * 420 * dt; r.y += ((m.y - r.y) / d) * 420 * dt; }
    else r.y += r.vy * dt;
    if (Math.hypot(r.x - m.x, r.y - m.y) < 28) {
      r.dead = true; a.recogidos++;
      const txt = cfg.recuerdos[a.memIdx % cfg.recuerdos.length]; a.memIdx++;
      a.mem = { texto: txt, t: 2.4 };
      chispas(a, r.x, r.y, "#ffe08a", 10);
      A && A.playSfx("curar");
      if (a.recogidos >= a.proxLuz) { a.proxLuz += 6; if (a.luces < M.luces) { a.luces++; a.aviso = { texto: "✨ ¡Recuperas una luz!", t: 1.6 }; a.flash = 0.18; } }
    }
    if (r.y > H + 30) r.dead = true;
  }
  for (const z of a.rayos) {
    z.t += dt;
    if (z.t >= z.warn && z.t < z.warn + z.act && Math.abs(m.x - z.x) < z.w / 2 + 8) golpe(a, A);
  }
  a.rayos = a.rayos.filter((z) => z.t < z.warn + z.act + 0.1);

  for (const f of a.fx) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= 0.96; f.vy *= 0.96; }
  a.fx = a.fx.filter((f) => f.t < f.life);
  a.obst = a.obst.filter((o) => !o.dead);
  a.rec = a.rec.filter((r) => !r.dead);
}

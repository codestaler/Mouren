/* avion-engine.js — lógica pura del modo avioncito (sin React ni dibujo).
 * El componente (MouriAvion.jsx) crea una etapa con crearEtapa(), la
 * avanza con actualizar() y la dibuja con avion-render.js.             */
import { AV, ETAPAS } from "./config-avion";
import {
  clamp, rnd, pick, DOWN, ebala, aimAng, abanico, chispas, golpearJugador,
  soltarPickup, crearEnemigo, aviso, titulo,
} from "./avion-util";
import { JEFES } from "./config-avion";
import { crearJefe, actualizarJefe, hpAgotado, recibirBalas, saltarFaseOrgullo } from "./avion-bosses";

const W = AV.W, H = AV.H;

export function crearEtapa(dia, carry = {}) {
  const cfg = ETAPAS[dia - 1];
  const bend = carry.bend || {};
  return {
    dia, cfg, W, H, t: 0, fase: "olas", // "olas" -> "jefe"
    p: {
      x: W / 2, y: H - 130, hp: carry.hp ?? AV.vidas, maxHp: AV.vidas, invuln: 1.2,
      power: carry.power || 1, fireCd: 0, hechizo: 0, hitR: 6,
    },
    pb: [], eb: [], en: [], pk: [], fx: [], zones: [], beams: [], hist: [],
    decoys: [], rastros: [], nubes: [], paredes: { w: 0, target: 0 }, titulo: null,
    corriente: null, evtT: 7,
    score: carry.score || 0, special: carry.special || 0,
    nextId: 1, spawnT: 1.2, shake: 0, flash: 0, dark: 0, hitSfxT: 0,
    bend,
    dmgMul: bend.girasol ? 1.25 : 1,
    fireMul: bend.margarita ? 0.8 : 1,
    bulletMul: bend.lavanda ? 0.85 : 1,
    boss: null, aviso: null, pendingDialog: null, terminado: null,
    killCount: 0, bombFx: 0,
    saltarAJefe: !!carry.saltarAJefe, debugFase: carry.debugFase || 0,
  };
}

/* ------------------------------ oleadas ------------------------------ */
function generarOleada(s) {
  const n = s.cfg.n;
  const pat = pick(s.cfg.patrones);
  switch (pat) {
    case "fila": {
      const k = 3 + Math.min(3, n >> 1), gap = (W - 80) / (k - 1);
      for (let i = 0; i < k; i++) crearEnemigo(s, "sombra", 40 + i * gap, -20, { vy: 100 + n * 8 });
      break;
    }
    case "v": {
      const cx = rnd(130, W - 130);
      for (let i = 0; i < 5; i++) {
        const off = i - 2;
        crearEnemigo(s, "sombra", cx + off * 46, -20 - Math.abs(off) * 34, { vy: 105 + n * 7 });
      }
      break;
    }
    case "zig": {
      const base = rnd(130, W - 130), amp = rnd(60, 95);
      for (let i = 0; i < 5; i++) crearEnemigo(s, "zig", base, -20 - i * 52, { vy: 100 + n * 6, amp, freq: 2.2 });
      break;
    }
    case "tirador": {
      const k = n >= 4 ? 2 : 1;
      for (let i = 0; i < k; i++) crearEnemigo(s, "tirador", rnd(80, W - 80), -20 - i * 30, { vy: 140, yHold: rnd(110, 200), hold: 4.2 });
      break;
    }
    case "kamikaze": {
      const k = 2 + (n >= 6 ? 1 : 0);
      for (let i = 0; i < k; i++) crearEnemigo(s, "kamikaze", rnd(60, W - 60), -20 - i * 60, { vy: 95 });
      break;
    }
    case "grande": crearEnemigo(s, "grande", rnd(100, W - 100), -30, { vy: 55 }); break;
    case "anillo": {
      // 6 enemigos que giran en círculo mientras bajan
      const cx = rnd(130, W - 130), vyC = 70 + n * 5, dir = Math.random() < 0.5 ? 1 : -1;
      for (let i = 0; i < 6; i++) crearEnemigo(s, "orbital", cx, -60, { cx, cy: -60, ang: (Math.PI * 2 * i) / 6, rad: 62, vyC, dir });
      break;
    }
    case "bombardero": {
      const izq = Math.random() < 0.5, y = rnd(110, 230);
      crearEnemigo(s, "bombardero", izq ? -30 : W + 30, y, { vx: izq ? 135 : -135, vy: 0, bomT: 0.5 });
      if (n >= 5) crearEnemigo(s, "bombardero", izq ? W + 30 : -30, y + 70, { vx: izq ? -135 : 135, vy: 0, bomT: 0.9 });
      break;
    }
    case "lluvia": {
      const k = 6 + n;
      for (let i = 0; i < k; i++) crearEnemigo(s, "sombra", rnd(30, W - 30), -20 - rnd(0, 360), { vy: 125 + n * 8 });
      break;
    }
    default:
  }
}

function matarEnemigo(s, e) {
  e.dead = true;
  const pts = { sombra: 10, zig: 15, kamikaze: 20, tirador: 30, grande: 50 }[e.tipo] || 10;
  s.score += pts;
  s.special = clamp(s.special + (e.tipo === "grande" ? 4 : 2), 0, 100);
  s.killCount++;
  chispas(s, e.x, e.y, s.cfg.color, 9, 190);
  const r = Math.random();
  if (r < 0.07) soltarPickup(s, e.x, e.y, "perla");
  else if (r < 0.15) soltarPickup(s, e.x, e.y, "luz");
  else if (r < 0.175 && s.p.hp < s.p.maxHp) soltarPickup(s, e.x, e.y, "corazon");
}

function actualizarEnemigo(s, e, dt) {
  e.t += dt;
  switch (e.tipo) {
    case "sombra": e.y += e.vy * dt; break;
    case "zig": e.y += e.vy * dt; e.x = e.x0 + Math.sin(e.t * e.freq) * e.amp; break;
    case "grande":
      e.y += e.vy * dt; e.sh -= dt;
      if (e.sh <= 0 && e.y > 20) { e.sh = 2.2; ebala(s, e.x, e.y + 10, aimAng(s, e.x, e.y), 170, { kind: "sombra", r: 7 }); }
      break;
    case "tirador":
      if (e.estado === 0) { e.y += e.vy * dt; if (e.y >= e.yHold) { e.estado = 1; e.vy = 0; } }
      else if (e.estado === 1) {
        e.hold -= dt; e.sh -= dt;
        if (e.sh <= 0) { e.sh = 1.5; abanico(s, e.x, e.y + 10, 3, 0.7, aimAng(s, e.x, e.y), 175, { kind: "sombra", r: 6 }); }
        if (e.hold <= 0) e.estado = 2;
      } else e.y -= 150 * dt;
      break;
    case "kamikaze":
      if (e.estado === 0) { e.y += e.vy * dt; if (e.y >= 110) { e.estado = 1; e.lockT = 0.55; } }
      else if (e.estado === 1) {
        e.lockT -= dt; e.x += Math.sin(e.t * 30) * 30 * dt;
        if (e.lockT <= 0) { const a = aimAng(s, e.x, e.y); e.vx = Math.cos(a) * 340; e.vy = Math.sin(a) * 340; e.estado = 2; }
      } else { e.x += e.vx * dt; e.y += e.vy * dt; }
      break;
    case "alimento": {
      // la comida de la Gula vuela de regreso a su boca (la cura si llega)
      const b = s.boss;
      if (!b || b.muriendo > 0) { e.y += 120 * dt; break; }
      const dx = b.x - e.x, dy = b.y - e.y, d = Math.hypot(dx, dy) || 1;
      e.x += (dx / d) * 165 * dt; e.y += (dy / d) * 165 * dt;
      if (d < 38) {
        e.dead = true; b.hp = Math.min(b.hpMax, b.hp + 4);
        s.fx.push({ k: "texto", x: b.x, y: b.y - 50, vy: -40, texto: "¡ñam! +vida", t: 0, life: 1, color: "#ffb36b" });
      }
      break;
    }
    case "orbital":
      e.cy += e.vyC * dt; e.ang += 1.8 * e.dir * dt;
      e.x = e.cx + Math.cos(e.ang) * e.rad; e.y = e.cy + Math.sin(e.ang) * e.rad;
      break;
    case "bombardero":
      e.x += e.vx * dt; e.bomT -= dt;
      if (e.bomT <= 0 && e.x > 10 && e.x < W - 10) { e.bomT = 0.75; ebala(s, e.x, e.y + 14, DOWN, 190, { kind: "sombra", r: 7 }); }
      break;
    default:
  }
}

/* ------------------------------ eventos del día ------------------------------ */
function eventoDelDia(s) {
  const d = s.cfg.n, p = s.p;
  const lineaLuz = (tipo) => { const x0 = rnd(90, W - 90); for (let i = 0; i < 5; i++) s.pk.push({ id: s.nextId++, x: clamp(x0 + Math.sin(i * 0.9) * 55, 30, W - 30), y: -20 - i * 34, tipo, vy: 95, t: 0 }); };
  const nube = () => s.nubes.push({ x: rnd(90, W - 90), y: rnd(300, 560), r: 78, t: 0, life: 7 });
  const corriente = () => { const dir = Math.random() < 0.5 ? -1 : 1; s.corriente = { dir, warn: 1.1, act: 2.0, t: 0 }; aviso(s, dir > 0 ? "🌊 ¡Corriente hacia la derecha!" : "🌊 ¡Corriente hacia la izquierda!", 1.6); };
  const geiser = () => { for (let i = 0; i < 2; i++) s.zones.push({ x: rnd(50, W - 50), w: 64, warn: 1.3, act: 0.9, t: 0, abajo: true, h: 330 }); aviso(s, "🔥 ¡Géiseres de lava!", 1.4); };
  const monedas = () => { const x0 = rnd(90, W - 90); for (let i = 0; i < 6; i++) s.pk.push({ id: s.nextId++, x: clamp(x0 + (i % 2 ? 22 : -22), 30, W - 30), y: -20 - i * 30, tipo: "moneda", vy: 110, t: 0 }); };
  switch (d) {
    case 1: lineaLuz("luz"); break;
    case 2: lineaLuz("perla"); break;
    case 3: nube(); break;
    case 4: corriente(); break;
    case 5: monedas(); break;
    case 6: geiser(); break;
    default: pick([geiser, corriente, nube])();
  }
  s.evtT = { 1: 9, 2: 11, 3: 9, 4: 11, 5: 7, 6: 8, 7: 9 }[d] * rnd(0.85, 1.15);
}

/* ------------------------------ especial ------------------------------ */
function segmentosRayo(ox, oy, ang, rebota) {
  const segs = [];
  let x = ox, y = oy, dx = Math.cos(ang), dy = Math.sin(ang), restante = 1500;
  for (let k = 0; k < (rebota ? 3 : 1); k++) {
    let t = restante;
    let pared = null;
    if (dx > 1e-6) { const tx = (W - x) / dx; if (tx < t) { t = tx; pared = "x"; } }
    else if (dx < -1e-6) { const tx = (0 - x) / dx; if (tx < t) { t = tx; pared = "x"; } }
    if (dy > 1e-6) { const ty = (H - y) / dy; if (ty < t) { t = ty; pared = "y"; } }
    else if (dy < -1e-6) { const ty = (0 - y) / dy; if (ty < t) { t = ty; pared = "y"; } }
    segs.push({ x1: x, y1: y, x2: x + dx * t, y2: y + dy * t });
    restante -= t;
    if (!rebota || pared !== "x" || restante <= 0) break;
    x += dx * t; y += dy * t; dx = -dx;
  }
  return segs;
}

function distPuntoSegmento(px, py, sg) {
  const vx = sg.x2 - sg.x1, vy = sg.y2 - sg.y1, l2 = vx * vx + vy * vy || 1;
  const t = clamp(((px - sg.x1) * vx + (py - sg.y1) * vy) / l2, 0, 1);
  return Math.hypot(px - (sg.x1 + vx * t), py - (sg.y1 + vy * t));
}

export function usarEspecial(s, A) {
  if (s.terminado || s.special < 100) return false;
  s.special = 0; s.flash = 0.6; s.shake = 0.5; s.bombFx = 0.9;
  s.eb = [];
  for (const e of s.en) { e.hp -= 12; if (e.hp <= 0 && !e.dead) matarEnemigo(s, e); }
  const b = s.boss;
  if (b && !b.inv && !b.muriendo && !b.trans && b.entrada <= 0) { b.hp -= b.hpMax * 0.08 + 6; b.hitT = 0.3; }
  s.p.invuln = Math.max(s.p.invuln, 1.0);
  A && A.playSfx("especial");
  aviso(s, "¡Rayo del Recuerdo!", 1.4);
  return true;
}

/* ------------------------------ bucle ------------------------------ */
export function actualizar(s, dt, input, A) {
  if (s.terminado) return;
  const p = s.p;
  s.t += dt;
  if (p.invuln > 0) p.invuln -= dt;
  if (s.shake > 0) s.shake -= dt;
  if (s.flash > 0) s.flash -= dt;
  if (s.bombFx > 0) s.bombFx -= dt;
  if (s.hitSfxT > 0) s.hitSfxT -= dt;
  if (p.hechizo > 0) p.hechizo -= dt;
  if (s.aviso) { s.aviso.t -= dt; if (s.aviso.t <= 0) s.aviso = null; }
  if (s.titulo) { s.titulo.t -= dt; if (s.titulo.t <= 0) s.titulo = null; }

  /* --- nubes de sueño (ralentizan) y corrientes (empujan) --- */
  let lento = false;
  for (const nb of s.nubes) { nb.t += dt; if (Math.hypot(p.x - nb.x, p.y - nb.y) < nb.r) lento = true; }
  s.nubes = s.nubes.filter((nb) => nb.t < nb.life);
  p.lento = lento;
  const cr = s.corriente;
  if (cr) {
    cr.t += dt;
    if (cr.t >= cr.warn && cr.t < cr.warn + cr.act) p.x += cr.dir * 150 * dt;
    if (cr.t >= cr.warn + cr.act) s.corriente = null;
  }

  // historial de posición (lo usa la Envidia para copiarte)
  s.hist.push({ t: s.t, x: p.x, y: p.y });
  while (s.hist.length > 2 && s.hist[0].t < s.t - 3) s.hist.shift();

  /* --- mover a Mouri --- */
  const vel = (p.hechizo > 0 ? 0.5 : 1) * (p.lento ? 0.45 : 1);
  if (input.target) {
    const dx = input.target.x - p.x, dy = input.target.y - p.y, d = Math.hypot(dx, dy);
    if (d > 0.5) { const step = Math.min(d, 1500 * vel * dt); p.x += (dx / d) * step; p.y += (dy / d) * step; }
  }
  if (input.kx || input.ky) {
    const n = Math.hypot(input.kx, input.ky) || 1;
    p.x += (input.kx / n) * AV.velTeclado * vel * dt;
    p.y += (input.ky / n) * AV.velTeclado * vel * dt;
  }
  p.x = clamp(p.x, 20, W - 20);
  p.y = clamp(p.y, 90, H - 34);

  /* --- disparo automático --- */
  p.fireCd -= dt;
  if (p.fireCd <= 0) {
    p.fireCd = AV.cadencia * s.fireMul;
    const dmg = s.dmgMul, y = p.y - 22, v = AV.velBala;
    const add = (dx, vx) => s.pb.push({ id: s.nextId++, x: p.x + dx, y, vx, vy: -v, dmg });
    if (p.power <= 1) add(0, 0);
    else if (p.power === 2) { add(-9, 0); add(9, 0); }
    else { add(0, 0); add(-14, -130); add(14, 130); }
  }

  if (input.bomb) usarEspecial(s, A);

  // carga pasiva del especial
  s.special = clamp(s.special + 1.6 * dt, 0, 100);

  /* --- balas de Mouri --- */
  for (const b of s.pb) { b.x += b.vx * dt; b.y += b.vy * dt; if (b.y < -20 || b.x < -20 || b.x > W + 20) b.dead = true; }

  /* --- oleadas / entrada del jefe --- */
  if (s.saltarAJefe && s.fase === "olas") { s.t = Math.max(s.t, s.cfg.dur); s.saltarAJefe = false; }
  if (s.fase === "olas") {
    if (s.t < s.cfg.dur) {
      s.spawnT -= dt;
      if (s.spawnT <= 0) { generarOleada(s); s.spawnT = s.cfg.ritmo * rnd(0.85, 1.15); }
      if (s.t > 6 && s.t < s.cfg.dur - 5) { s.evtT -= dt; if (s.evtT <= 0) eventoDelDia(s); }
    } else if (s.en.length === 0 || s.t > s.cfg.dur + 6) {
      s.fase = "jefe";
      s.boss = crearJefe(s.cfg.id, s);
      titulo(s, JEFES[s.cfg.id].nombre.toUpperCase(), s.cfg.id === "orgullo" ? "El último pecado" : "Pecado de la " + JEFES[s.cfg.id].pecado, 2.8);
      if (s.debugFase > 1 && s.cfg.id === "orgullo") saltarFaseOrgullo(s.boss, s, s.debugFase);
      s.pendingDialog = { clave: "jefe" };
      s.shake = 0.5;
      A && A.playSfx("aparicion");
    }
  }

  /* --- enemigos --- */
  for (const e of s.en) {
    if (e.dead) continue;
    actualizarEnemigo(s, e, dt);
    for (const b of s.pb) {
      if (b.dead) continue;
      if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + 6) {
        b.dead = true; e.hp -= b.dmg;
        chispas(s, b.x, b.y, "#fff3b0", 2, 80);
        if (e.hp <= 0) { matarEnemigo(s, e); break; }
      }
    }
    if (e.dead) continue;
    if (Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.hitR) {
      if (golpearJugador(s, A) && e.tipo !== "grande") { e.dead = true; chispas(s, e.x, e.y, s.cfg.color, 9, 190); }
    }
    const fuera = e.y > H + 60 || e.x < -80 || e.x > W + 80 || (e.tipo === "tirador" && e.estado === 2 && e.y < -60);
    if (fuera) e.dead = true;
  }

  /* --- copias falsas (Lujuria) --- */
  for (const d of s.decoys) {
    d.t += dt; d.sh -= dt;
    if (d.sh <= 0) { d.sh = 1.5; ebala(s, d.x, d.y + 10, aimAng(s, d.x, d.y), 150, { kind: "corazon", r: 7 }); }
    for (const b of s.pb) {
      if (!b.dead && Math.abs(b.x - d.x) < 34 && Math.abs(b.y - d.y) < 34) { b.dead = true; d.dead = true; chispas(s, d.x, d.y, "#ff7fb0", 14, 200); break; }
    }
    if (d.t >= d.life) d.dead = true;
  }
  s.decoys = s.decoys.filter((d) => !d.dead);

  /* --- tu sombra te persigue (Envidia) --- */
  for (const r of s.rastros) {
    r.t += dt;
    if (r.fase === 0) {
      r.i += dt * 60 * 1.7;
      const k = Math.floor(r.i);
      if (k >= r.pts.length) { r.fase = 1; r.t = 0; } else { r.x = r.pts[k].x; r.y = r.pts[k].y; }
    } else {
      const dx = p.x - r.x, dy = p.y - r.y, d = Math.hypot(dx, dy) || 1;
      r.x += (dx / d) * 140 * dt; r.y += (dy / d) * 140 * dt;
      if (r.t > 2.2) r.dead = true;
    }
    for (const b of s.pb) {
      if (!b.dead && Math.hypot(b.x - r.x, b.y - r.y) < 20) { b.dead = true; r.hp--; chispas(s, r.x, r.y, "#4fd1c0", 3, 80); if (r.hp <= 0) { r.dead = true; chispas(s, r.x, r.y, "#4fd1c0", 14, 200); } }
    }
    if (!r.dead && Math.hypot(r.x - p.x, r.y - p.y) < 14) { golpearJugador(s, A); r.dead = true; }
  }
  s.rastros = s.rastros.filter((r) => !r.dead);

  /* --- paredes de fuego (Ira) --- */
  const pw = s.paredes;
  pw.w += clamp(pw.target - pw.w, -30 * dt, 30 * dt);
  if (pw.w > 4 && (p.x < pw.w || p.x > W - pw.w)) golpearJugador(s, A);

  /* --- jefe --- */
  const boss = s.boss;
  if (boss) {
    actualizarJefe(boss, s, dt, A);
    recibirBalas(boss, s, A);
    if (boss.hp <= 0 && !boss.muerto && !boss.trans && boss.muriendo <= 0 && boss.entrada <= 0) {
      if (hpAgotado(boss, s)) {
        boss.muerto = true;
        s.score += 500;
        for (let i = 0; i < 4; i++) soltarPickup(s, boss.x + rnd(-60, 60), boss.y, i === 0 ? "corazon" : "luz");
      }
    }
    if (boss.muerto && boss.muriendo <= 0) { s.terminado = "victoria"; }
  }

  /* --- columnas (Pereza) --- */
  for (const z of s.zones) {
    z.t += dt;
    if (z.t >= z.warn && z.t < z.warn + z.act && Math.abs(p.x - z.x) < z.w / 2 + 4 && (!z.abajo || p.y > H - z.h)) golpearJugador(s, A);
  }
  s.zones = s.zones.filter((z) => z.t < z.warn + z.act + 0.1);

  /* --- rayos barredores (Espejo Roto): pueden REBOTAR en las paredes --- */
  for (const bm of s.beams) {
    bm.t += dt;
    const activo = bm.t >= bm.warn && bm.t < bm.warn + bm.dur;
    bm.ang = bm.a0 + (bm.a1 - bm.a0) * clamp((bm.t - bm.warn) / bm.dur, 0, 1);
    bm.activo = activo;
    bm.segs = segmentosRayo(bm.ox, bm.oy, bm.t < bm.warn ? bm.a0 : bm.ang, bm.rebota);
    if (activo) {
      for (const sg of bm.segs) {
        if (distPuntoSegmento(p.x, p.y, sg) < 15) { golpearJugador(s, A); break; }
      }
    }
  }
  s.beams = s.beams.filter((bm) => bm.t < bm.warn + bm.dur);

  /* --- balas enemigas --- */
  for (const b of s.eb) {
    b.t += dt; b.life -= dt;
    if (b.curve) { const c = Math.cos(b.curve * dt), sn = Math.sin(b.curve * dt); const vx = b.vx * c - b.vy * sn; b.vy = b.vx * sn + b.vy * c; b.vx = vx; }
    if (b.grav) b.vy += b.grav * dt;
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.suelo > 0 && b.y > H - 10 && b.vy > 0) { b.vy = -b.vy * 0.72; b.suelo--; b.y = H - 10; }
    if (b.bounce > 0 && (b.x < 8 || b.x > W - 8)) { b.vx *= -1; b.bounce--; b.x = clamp(b.x, 8, W - 8); }
    if (b.x < -30 || b.x > W + 30 || b.y > H + 30 || b.y < -80 || b.life <= 0) { b.dead = true; continue; }
    if (p.invuln > 0) continue;
    if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + p.hitR) {
      b.dead = true;
      if (b.kind === "hechizo") { p.hechizo = 2.6; s.flash = 0.2; aviso(s, "💘 ¡Hechizada! Te mueves más lento", 1.6); }
      else if (b.kind === "robo") { if (golpearJugador(s, A)) s.special = Math.max(0, s.special - 50); }
      else golpearJugador(s, A);
    }
  }

  /* --- objetos que caen (pickups) --- */
  for (const k of s.pk) {
    k.t += dt;
    const d = Math.hypot(k.x - p.x, k.y - p.y);
    if (d < 90) { k.x += ((p.x - k.x) / (d || 1)) * 260 * dt; k.y += ((p.y - k.y) / (d || 1)) * 260 * dt; }
    else k.y += k.vy * dt;
    if (d < 26) {
      k.dead = true;
      if (k.tipo === "perla") {
        if (p.power < 3) { p.power++; s.fx.push({ k: "texto", x: p.x, y: p.y - 30, vy: -40, texto: "¡Disparo mejorado!", t: 0, life: 1.1, color: "#fff3b0" }); }
        else { s.score += 50; s.special = clamp(s.special + 10, 0, 100); }
      } else if (k.tipo === "moneda") {
        s.score += 25; s.special = clamp(s.special + 4, 0, 100);
        s.fx.push({ k: "texto", x: p.x, y: p.y - 30, vy: -40, texto: "+25", t: 0, life: 0.7, color: "#ffd24a" });
      } else if (k.tipo === "memoria") {
        const b = s.boss;
        if (b && b.id === "orgullo") {
          b.recuerdos = Math.min(4, (b.recuerdos || 0) + 1);
          s.flash = 0.25;
          const txt = b.recuerdos >= 4 ? "¡Mouri recuerda todo!" : `¡Recuerdo ${b.recuerdos}/4!`;
          aviso(s, txt + (b.recuerdos >= 4 ? " Daño máximo" : ""), 2);
          s.fx.push({ k: "texto", x: p.x, y: p.y - 30, vy: -40, texto: k.emoji, t: 0, life: 1.2, color: "#fff" });
        }
      } else if (k.tipo === "luz") { s.special = clamp(s.special + 25, 0, 100); s.fx.push({ k: "texto", x: p.x, y: p.y - 30, vy: -40, texto: "+Recuerdo", t: 0, life: 0.9, color: "#ffe08a" }); }
      else if (k.tipo === "corazon") { p.hp = Math.min(p.maxHp, p.hp + 1); s.fx.push({ k: "texto", x: p.x, y: p.y - 30, vy: -40, texto: "+1 ❤", t: 0, life: 1, color: "#ff8aa0" }); }
      A && A.playSfx("curar");
    } else if (k.y > H + 30) k.dead = true;
  }

  /* --- efectos --- */
  for (const f of s.fx) {
    f.t += dt;
    if (f.k === "chispa") { f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= 0.96; f.vy *= 0.96; }
    else if (f.k === "texto") f.y += f.vy * dt;
    if (f.t >= f.life) f.dead = true;
  }
  if (s.fx.length > 260) s.fx.splice(0, s.fx.length - 260);

  /* --- limpieza --- */
  s.pb = s.pb.filter((b) => !b.dead);
  s.eb = s.eb.filter((b) => !b.dead);
  s.en = s.en.filter((e) => !e.dead);
  s.pk = s.pk.filter((k) => !k.dead);
  s.fx = s.fx.filter((f) => !f.dead);
}

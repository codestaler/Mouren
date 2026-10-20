/* avion-util.js — utilidades compartidas por el motor del avioncito y sus jefes. */
import { AV } from "./config-avion";
import { vibrar } from "./helpers";

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rnd = (a, b) => a + Math.random() * (b - a);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const DOWN = Math.PI / 2; // ángulo "hacia abajo" (y crece hacia abajo)

/** Dispara una bala enemiga. `ang` en radianes (DOWN = hacia abajo). */
export function ebala(s, x, y, ang, vel, o = {}) {
  const v = vel * s.bulletMul;
  s.eb.push({
    id: s.nextId++, x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v,
    r: o.r || 6, kind: o.kind || "orb", color: o.color || s.cfg.color,
    bounce: o.bounce || 0, curve: o.curve || 0, t: 0, life: o.life ?? 14,
  });
}

export function aimAng(s, x, y) { return Math.atan2(s.p.y - y, s.p.x - x); }

export function abanico(s, x, y, n, spread, base, vel, o) {
  if (n === 1) { ebala(s, x, y, base, vel, o); return; }
  for (let i = 0; i < n; i++) ebala(s, x, y, base - spread / 2 + (spread * i) / (n - 1), vel, o);
}

export function anillo(s, x, y, n, offset, vel, o) {
  for (let i = 0; i < n; i++) ebala(s, x, y, offset + (Math.PI * 2 * i) / n, vel, o);
}

export function aviso(s, texto, t = 2) { s.aviso = { texto, t }; }

/** Título grande en pantalla (ej. "FASE 2" + subtítulo). */
export function titulo(s, texto, sub = "", t = 2.5) { s.titulo = { texto, sub, t }; }

export function chispas(s, x, y, color, n = 8, vel = 160) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = rnd(40, vel);
    s.fx.push({ k: "chispa", x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: rnd(0.3, 0.7), color, r: rnd(2, 4) });
  }
}

/** Golpe al jugador. Devuelve true si realmente hirió. */
export function golpearJugador(s, A, dano = 1) {
  const p = s.p;
  if (p.invuln > 0 || s.terminado) return false;
  p.hp -= dano;
  p.invuln = AV.invulnerable;
  s.flash = 0.25; s.shake = 0.3;
  p.power = Math.max(1, p.power - 1);
  // pequeña "piedad": al ser golpeado se borran las balas cercanas
  s.eb = s.eb.filter((b) => Math.hypot(b.x - p.x, b.y - p.y) > 90);
  chispas(s, p.x, p.y, "#ff6b6b", 14, 220);
  A && A.playSfx("choque");
  vibrar(70);
  if (p.hp <= 0) { p.hp = 0; s.terminado = "derrota"; }
  return true;
}

const TIPOS_ENEMIGO = {
  sombra: { hp: 1, r: 15 },
  grande: { hp: 6, r: 24 },
  zig: { hp: 2, r: 16 },
  tirador: { hp: 3, r: 18 },
  kamikaze: { hp: 2, r: 16 },
};

export function crearEnemigo(s, tipo, x, y, o = {}) {
  const d = TIPOS_ENEMIGO[tipo];
  s.en.push({
    id: s.nextId++, tipo, x, y, x0: x, y0: y, vx: 0, vy: 110, hp: d.hp, hpMax: d.hp, r: d.r,
    t: 0, sh: rnd(0.8, 1.8), estado: 0, amp: 70, freq: 2, hold: 4, ...o,
  });
}

export function soltarPickup(s, x, y, tipo) {
  s.pk.push({ id: s.nextId++, x, y, tipo, vy: 70, t: 0 });
}

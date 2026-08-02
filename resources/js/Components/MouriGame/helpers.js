/* mouri-game.helpers.js — utilidades compartidas por todo el juego:
 * estado del mundo, física de Mouri, flores, necesidades, sombras y orbes.
 * Los archivos de cada jefe (bosses-*.js) importan de aquí lo que necesiten. */
import { T } from "./config";

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const NEEDS = {
  agua: { icon: "💧", label: "Necesita agua" },
  luz: { icon: "☀️", label: "Necesita luz" },
  carino: { icon: "💗", label: "Necesita cariño" },
  proteccion: { icon: "🛡️", label: "Necesita protección" },
};
export const NEED_KEYS = Object.keys(NEEDS);

export const FLOWER_DEFS = [
  { id: "girasol", type: "girasol", xr: 0.12, name: "Girasol", pasivo: "Cura a las flores vecinas", combate: "Tus disparos hacen más daño" },
  { id: "rosa", type: "rosa", xr: 0.37, name: "Rosa", pasivo: "Regenera todo el jardín", combate: "Mouri recupera corazones" },
  { id: "lavanda", type: "lavanda", xr: 0.62, name: "Lavanda", pasivo: "Ralentiza a las sombras", combate: "Ralentiza los ataques enemigos" },
  { id: "margarita", type: "margarita", xr: 0.87, name: "Margarita", pasivo: "Las necesidades tardan más", combate: "Disparas y cargas el Especial más rápido" },
];

export const healthy = (w) => w.flowers.filter((f) => f.health > 50).length;
export const alive = (w) => w.flowers.filter((f) => f.health > 0);
export const has = (w, type) => w.flowers.some((f) => f.type === type && f.health > 0);
export const gardenLight = (w) => w.flowers.reduce((s, f) => s + Math.max(0, f.health), 0) / (T.flowerMax * w.flowers.length);

export const canShoot = (w) => w.day >= 2 || w.scene === "boss" || !!w.mini;
export const canJump = (w) => w.day >= 3 || w.scene === "boss";
export const canSpecial = (w) => w.day >= 5 || w.scene === "boss";

export function makeWorld() {
  return {
    scene: "intro",  // intro|title|dialog|dayIntro|playing|dayClear|carrera|orgullo|victory|gameover|creditos
    prevScene: null,
    dialog: null,
    introIdx: 0,
    day: 1,
    mouri: { x: T.CW / 2, y: 0, vy: 0, onGround: true, facing: "right", moving: false, hp: T.mouriMaxHP, invuln: 0, hechizado: 0 },
    bullets: [], shadows: [], orbs: [], beams: [],
    flowers: FLOWER_DEFS.map((f) => ({ ...f, x: f.xr * T.CW, health: T.flowerMax, need: null })),
    score: 0, special: 0, fireCd: 0, fireCd2: 0,
    dayTimer: 0, needTimer: 3, shadowTimer: 3, nextId: 1,
    mini: null, miniDone: false,
    escudoActivo: false, escudoCd: 0,
    message: "", msgTimer: 0, flash: 0, darkness: 0, shake: 0, badge: false,
    creditoIdx: 0,
    _rosaCd: 6, _sumCd: 3,
    // estado exclusivo de la carrera de autos (Ira) — ver bosses-ira.js
    ira: null,
    // estado exclusivo del jefe final (Orgullo) — ver bosses-orgullo.js
    orgullo: null,
  };
}

export const say = (w, text, secs = 3.5) => { w.message = text; w.msgTimer = secs; };
export function orb(w, x, y, vx, vy, extra = {}) { w.orbs.push({ id: w.nextId++, x, y, vx, vy, ...extra }); }
export function setScene(w, s) { w.scene = s; w.prevScene = null; }

/* ---------------- física compartida (jardín + peleas de jefe) ---------------- */
export function movePhysics(w, dt, keys, A) {
  const m = w.mouri;
  if (m.hechizado > 0) m.hechizado = Math.max(0, m.hechizado - dt);
  const hechizado = m.hechizado > 0;
  const presionaIzq = hechizado ? keys.right : keys.left;
  const presionaDer = hechizado ? keys.left : keys.right;
  if (presionaIzq) { m.x -= T.mouriSpeed * dt; m.facing = "left"; m.moving = true; }
  else if (presionaDer) { m.x += T.mouriSpeed * dt; m.facing = "right"; m.moving = true; }
  else m.moving = false;
  m.x = clamp(m.x, 40, T.CW - 40);
  m.vy -= T.gravity * dt; m.y += m.vy * dt;
  if (m.y <= 0) { m.y = 0; m.vy = 0; m.onGround = true; }
  if (m.invuln > 0) m.invuln -= dt;

  if (w.fireCd > 0) w.fireCd -= dt;
  if (w.fireCd2 > 0) w.fireCd2 -= dt;
  const fast = has(w, "margarita");
  if (keys.shoot && canShoot(w) && w.fireCd <= 0) {
    const startX = m.x + (m.facing === "left" ? -20 : 20);
    const startY = m.y + 24;
    // Disparo recto: va siempre en línea horizontal, sin auto-apuntado.
    w.bullets.push({ id: w.nextId++, x: startX, y: startY, dir: m.facing === "left" ? -1 : 1, vy: 0 });
    w.fireCd = T.fireRate * (fast ? 0.62 : 1);
    A.playSfx("disparo");
  }
  if (keys.shoot2 && canShoot(w) && w.fireCd2 <= 0) {
    const startX = m.x + (m.facing === "left" ? -20 : 20);
    const startY = m.y + 24;
    // Disparo ondulante: viaja en una onda senoidal, más lento pero cubre más
    // altura y puede golpear enemigos que el disparo recto no alcanza.
    w.bullets.push({
      id: w.nextId++, x: startX, y: startY, baseY: startY,
      dir: m.facing === "left" ? -1 : 1, vy: 0,
      wave: true, waveT: 0, waveAmp: 34, waveFreq: 7,
    });
    w.fireCd2 = (T.fireRate * 2.4) * (fast ? 0.62 : 1);
    A.playSfx("disparo");
  }
  for (const b of w.bullets) {
    b.x += b.dir * T.bulletSpeed * (b.wave ? 0.72 : 1) * dt;
    if (b.wave) { b.waveT += dt; b.y = b.baseY + Math.sin(b.waveT * b.waveFreq) * b.waveAmp; }
    else b.y += (b.vy || 0) * dt;
  }
  w.bullets = w.bullets.filter((b) => b.x > -20 && b.x < T.CW + 20 && b.y > -20 && b.y < 500);

  if (canSpecial(w)) {
    const rate = 3 + healthy(w) * 2.2;
    w.special = clamp(w.special + rate * (fast ? 1.4 : 1) * dt, 0, 100);
  }
}

export function flowerPassives(w, dt) {
  if (has(w, "rosa")) for (const f of w.flowers) if (f.health > 0) f.health += T.regenRosaGarden * dt;
  if (has(w, "girasol")) {
    const g = w.flowers.find((f) => f.type === "girasol");
    for (const f of w.flowers) if (f !== g && f.health > 0 && Math.abs(f.x - g.x) < 360) f.health += T.regenGirasol * dt;
  }
  for (const f of w.flowers) f.health = clamp(f.health, 0, T.flowerMax);
}

export function tickNeeds(w, dt, needRate, needDecay) {
  const slow = has(w, "margarita") ? 1.5 : 1;
  w.needTimer -= dt;
  if (w.needTimer <= 0) {
    const cand = alive(w).filter((f) => !f.need);
    if (cand.length) rand(cand).need = rand(NEED_KEYS);
    w.needTimer = Math.max(1.4, needRate * slow);
  }
  for (const f of w.flowers) if (f.health > 0 && f.need) f.health -= needDecay * dt;
}

export function spawnShadow(w, hp = 1, big = false) {
  const a = alive(w); if (!a.length) return;
  const t = rand(a), left = Math.random() < 0.5;
  w.shadows.push({ id: w.nextId++, x: left ? 0 : T.CW, targetId: t.id, hp, big });
}

export function tickShadows(w, dt, speed, A) {
  const slow = has(w, "lavanda") ? 0.6 : 1;
  for (const s of w.shadows) {
    let tf = w.flowers.find((f) => f.id === s.targetId);
    if (!tf || tf.health <= 0) { const a = alive(w)[0]; if (a) { s.targetId = a.id; tf = a; } else break; }
    if (!tf) continue;
    if (Math.abs(s.x - tf.x) > 8) s.x += Math.sign(tf.x - s.x) * speed * slow * dt;
    else tf.health -= T.shadowDmg * dt;
  }
  for (const b of w.bullets) for (const s of w.shadows) {
    if (b.y < 55 && Math.abs(b.x - s.x) < 30) {
      s.hp -= has(w, "girasol") ? 2 : 1; b.dead = true;
      if (s.hp <= 0 && !s.dead) { s.dead = true; w.score += 12; A.playSfx("sombra"); }
    }
  }
  w.bullets = w.bullets.filter((b) => !b.dead);
  w.shadows = w.shadows.filter((s) => !s.dead);
  if (alive(w).length === 0) w.shadows = [];
}

export function hurtMouri(w, A) {
  const m = w.mouri;
  if (m.invuln > 0) return false;
  if (w.escudoActivo) {
    w.escudoActivo = false; w.escudoCd = 10;
    m.invuln = 0.5; w.flash = .3; w.shake = .15;
    A.playSfx("curar");
    return true;
  }
  m.hp -= 1; m.invuln = T.invulnTime; w.flash = .25; w.shake = .25;
  A.playSfx("golpe");
  return true;
}

export function tickOrbs(w, dt, A) {
  const m = w.mouri;
  for (const o of w.orbs) {
    o.x += o.vx * dt; o.y += o.vy * dt;
    if (o.gravity) o.vy -= 420 * dt;
    // hitboxes más justas: antes eran muy grandes y golpeaban aunque
    // pasaras cerca sin tocar de verdad.
    const r = o.big ? 34 : 22;
    const toca = Math.abs(o.x - m.x) < r && o.y > m.y - 4 && o.y < m.y + 38;
    if (!toca) continue;
    if (o.perla) { w.special = clamp(w.special + 18, 0, 100); w.flash = .15; A.playSfx("curar"); o.dead = true; }
    else if (o.hechizo) { if (m.invuln <= 0) { m.hechizado = 3; w.flash = .2; A.playSfx("aparicion"); } o.dead = true; }
    else if (hurtMouri(w, A)) { o.dead = true; }
  }
  w.orbs = w.orbs.filter((o) => !o.dead && o.x > -40 && o.x < T.CW + 40 && o.y > -60 && o.y < 620);
}

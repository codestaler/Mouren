/* avion-bosses.js — los 7 jefes del avioncito.
 *   Gula     : se queda arriba, abanicos de comida y ASPIRA a Mouri hacia su boca.
 *   Lujuria  : desaparece, reaparece en otro lado, espirales y hechizo (te ralentiza).
 *   Pereza   : casi no se mueve; columnas con aviso largo y anillos lentos.
 *   Envidia  : te copia con retraso y dispara a donde ESTUVISTE.
 *   Avaricia : se esconde tras monedas que giran y bloquean tus disparos.
 *   Ira      : se pone roja, avisa y se lanza en picada.
 *   Orgullo  : JEFE FINAL de 4 fases (Reflejo, Máscara, Espejo Roto, Olvido).
 *
 * Los jefes 1-6 tienen "furia" al bajar de la mitad de su vida.        */
import { AV, JEFES } from "./config-avion";
import {
  clamp, rnd, pick, DOWN, ebala, aimAng, abanico, anillo, aviso, chispas,
  golpearJugador, soltarPickup, crearEnemigo, titulo,
} from "./avion-util";

const W = AV.W, H = AV.H;
const ECOS = ["gula", "lujuria", "pereza", "envidia", "avaricia", "ira"];
const NOMBRE_ECO = { gula: "Gula", lujuria: "Lujuria", pereza: "Pereza", envidia: "Envidia", avaricia: "Avaricia", ira: "Ira" };

export function histX(s, atras) {
  const target = s.t - atras;
  let x = s.p.x;
  for (let i = s.hist.length - 1; i >= 0; i--) {
    if (s.hist[i].t <= target) { x = s.hist[i].x; break; }
    if (i === 0) x = s.hist[0].x;
  }
  return x;
}

export function crearJefe(id, s) {
  const d = JEFES[id];
  const hp = d.fases ? d.fases[0].hp : d.hp;
  const b = {
    id, nombre: d.nombre, x: W / 2, y: -90, yBase: id === "orgullo" ? 145 : 130,
    hp, hpMax: hp, hitW: d.ancho, hitH: d.alto, t: 0, entrada: 1.8, furia: false,
    alpha: 1, inv: true, atk: 1.4, ciclo: 0, estado: 0, hitT: 0, muriendo: 0,
    color: d.color, fase: 1, trans: false,
  };
  if (id === "gula") { b.tragar = 0; b.tragT = 0; b.minionT = 4; }
  if (id === "lujuria") { b.est = 2.5; b.fireT = 0.5; b.ang = 0; b.estado = 0; b.tx = W / 2; b.ty = 130; }
  if (id === "pereza") { b.aimT = 1.6; }
  if (id === "envidia") { b.rafaga = 0; b.rafT = 0; }
  if (id === "avaricia") {
    b.monedas = [0, 1, 2, 3].map((i) => ({ a: (Math.PI * 2 * i) / 4, hp: 6, vivo: true, rep: 0, x: 0, y: 0 }));
    b.lluviaT = 1.2; b.roboT = 3.5; b.espT = 0; b.espA = 0;
  }
  if (id === "ira") { b.lockX = W / 2; b.tele = 0; b.vyD = 0; b.dashes = 0; b.embT = 0; }
  if (id === "orgullo") { b.recuerdos = 0; iniciarFaseOrgullo(b, s, 1); }
  b.rastroT = 5; b.nubeT = 3; b.geiserT = 4; b.arcoT = 3;
  return b;
}

/* ------------------------------------------------------------------ */
export function actualizarJefe(b, s, dt, A) {
  b.t += dt;
  if (b.hitT > 0) b.hitT -= dt;

  if (b.muriendo > 0) {
    b.muriendo -= dt;
    if (Math.random() < dt * 14) chispas(s, b.x + rnd(-40, 40), b.y + rnd(-40, 40), b.color, 6, 180);
    return;
  }
  if (b.entrada > 0) {
    b.entrada -= dt;
    const k = 1 - clamp(b.entrada / 1.8, 0, 1);
    b.y = -90 + (b.yBase + 90) * (1 - (1 - k) * (1 - k));
    if (b.entrada <= 0) b.inv = false;
    return;
  }
  if (b.trans) return; // transición de fase (hay diálogo en pantalla)

  if (b.id !== "orgullo" && !b.furia && b.hp <= b.hpMax * 0.5) {
    b.furia = true; s.flash = 0.35; s.shake = 0.5; s.eb = [];
    aviso(s, "¡FURIA!", 2);
  }
  switch (b.id) {
    case "gula": return gula(b, s, dt);
    case "lujuria": return lujuria(b, s, dt);
    case "pereza": return pereza(b, s, dt);
    case "envidia": return envidia(b, s, dt);
    case "avaricia": return avaricia(b, s, dt);
    case "ira": return ira(b, s, dt, A);
    case "orgullo": return orgullo(b, s, dt, A);
    default:
  }
}

/** Solo para pruebas (?dia=7&fase=3): salta directo a una fase del Orgullo. */
export function saltarFaseOrgullo(b, s, n) {
  b.fase = n;
  iniciarFaseOrgullo(b, s, n);
}

/** Se llama cuando hp <= 0. Devuelve true si el jefe muere de verdad. */
export function hpAgotado(b, s) {
  if (b.id === "orgullo" && b.fase < 4) {
    b.trans = true; b.inv = true; b.hp = 0;
    s.eb = []; s.zones = []; s.beams = []; s.dark = 0; s.flash = 0.5; s.shake = 0.6;
    s.decoys = []; s.rastros = []; s.nubes = []; s.pk = s.pk.filter((k) => k.tipo !== "memoria");
    const faseTerminada = b.fase;
    s.pendingDialog = {
      clave: "orgulloFase", n: faseTerminada,
      despues: () => {
        b.fase = faseTerminada + 1;
        iniciarFaseOrgullo(b, s, b.fase);
        b.trans = false; b.inv = false;
      },
    };
    return false;
  }
  b.muriendo = 2.4; b.inv = true; s.eb = []; s.zones = []; s.beams = []; s.dark = 0;
  s.decoys = []; s.rastros = []; s.nubes = []; s.paredes.target = 0; s.en = s.en.filter((e) => e.tipo !== "alimento");
  s.flash = 0.6; s.shake = 0.8;
  titulo(s, b.id === "orgullo" ? "¡EL ORGULLO CAYÓ!" : `¡${b.nombre.toUpperCase()} VENCIDO!`, "", 2.4);
  return true;
}

/* Balas de Mouri contra el jefe (y contra lo que lo protege). */
export function recibirBalas(b, s, A) {
  if (b.muriendo > 0 || b.trans) return;
  for (const pb of s.pb) {
    if (pb.dead) continue;
    if (b.monedas) {
      for (const c of b.monedas) {
        if (c.vivo && Math.hypot(pb.x - c.x, pb.y - c.y) < 21) {
          pb.dead = true; c.hp -= pb.dmg; chispas(s, pb.x, pb.y, "#ffd24a", 3, 90);
          if (c.hp <= 0) { c.vivo = false; c.rep = 7; chispas(s, c.x, c.y, "#ffd24a", 12, 200); if (Math.random() < 0.6) soltarPickup(s, c.x, c.y, "luz"); }
          break;
        }
      }
      if (pb.dead) continue;
    }
    if (Math.abs(pb.x - b.x) < b.hitW && Math.abs(pb.y - b.y) < b.hitH) {
      pb.dead = true;
      if (b.inv || b.entrada > 0) { chispas(s, pb.x, pb.y, "#ffffff", 2, 60); continue; }
      const mult = b.id === "orgullo" && b.fase === 4 ? 0.3 + 0.7 * ((b.recuerdos || 0) / 4) : 1;
      b.hp -= pb.dmg * mult; b.hitT = 0.1; s.score += 1;
      s.special = clamp(s.special + 0.32 * (s.bend.margarita ? 1.35 : 1), 0, 100);
      if (s.hitSfxT <= 0) { A && A.playSfx("golpe"); s.hitSfxT = 0.15; }
    }
  }
}

/* ============================ GULA ============================ */
function gula(b, s, dt) {
  const f = b.furia;
  b.x = W / 2 + Math.sin(b.t * (f ? 1.1 : 0.7)) * 150;
  b.y = 130 + Math.sin(b.t * 1.3) * 10;
  if (b.tragar > 0) {
    b.tragar -= dt;
    const p = s.p;
    const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1;
    p.x = clamp(p.x + (dx / d) * 75 * dt, 20, W - 20);
    p.y = clamp(p.y + (dy / d) * 60 * dt, 90, H - 30);
    b.tragT -= dt;
    if (b.tragT <= 0) { b.tragT = 0.38; ebala(s, b.x + rnd(-30, 30), b.y + 30, DOWN + rnd(-0.6, 0.6), 175, { kind: "comida", r: 8 }); }
    if (b.tragar <= 0) { // al terminar de aspirar... ¡eructo!
      anillo(s, b.x, b.y + 20, f ? 28 : 22, rnd(0, 6), 125, { kind: "comida", r: 9 });
      aviso(s, "¡BURP!", 1.0); s.shake = 0.3; b.atk = 1.1;
    }
    return;
  }
  b.atk -= dt;
  if (b.atk <= 0) {
    b.ciclo++;
    const m = b.ciclo % 3;
    if (m === 1) abanico(s, b.x, b.y + 30, f ? 5 : 3, f ? 1.3 : 0.95, DOWN, 190, { kind: "comida", r: 8 });
    else if (m === 2) { const n = f ? 10 : 7; for (let i = 0; i < n; i++) ebala(s, rnd(30, W - 30), -10, DOWN, rnd(150, 220), { kind: "comida", r: 8 }); }
    else { b.tragar = 2.0; b.tragT = 0.2; aviso(s, "¡Aspira! Aléjate de su boca", 1.4); }
    b.atk = f ? 1.1 : 1.6;
  }
  if (f) {
    b.minionT -= dt;
    if (b.minionT <= 0) {
      // su comida vuela de regreso a su boca y lo CURA: ¡dispárale antes!
      crearEnemigo(s, "alimento", rnd(40, W - 40), H - 50, {});
      if (!b.avisoComida) { b.avisoComida = true; aviso(s, "¡Su comida lo cura! Dispárale a la comida 🍗", 2.2); }
      b.minionT = 3.6;
    }
  }
}

/* ============================ LUJURIA ============================ */
function lujuria(b, s, dt) {
  const f = b.furia;
  b.est -= dt;
  if (b.estado === 0) {
    b.alpha = Math.min(1, b.alpha + dt * 3.5);
    b.inv = b.alpha < 0.6;
    b.x += Math.sin(b.t * (f ? 3 : 2)) * 45 * dt;
    b.x = clamp(b.x, 50, W - 50);
    b.fireT -= dt;
    if (b.fireT <= 0 && b.est > 1.1) {
      b.fireT = 0.12; b.ang += 0.5;
      ebala(s, b.x, b.y + 20, b.ang, 165, { kind: "corazon", r: 7 });
      if (f) ebala(s, b.x, b.y + 20, b.ang + Math.PI, 165, { kind: "corazon", r: 7 });
    }
    if (b.est <= 0) { b.estado = 1; b.est = 0.4; }
  } else {
    b.alpha = Math.max(0, b.alpha - dt * 4);
    b.inv = true;
    if (b.est <= 0) {
      b.x = rnd(90, W - 90); b.y = rnd(95, 240);
      b.estado = 0; b.est = f ? 2.7 : 3.3; b.fireT = 0.3;
      const a = aimAng(s, b.x, b.y);
      ebala(s, b.x, b.y, a, 135, { kind: "hechizo", r: 10 });
      if (f) { ebala(s, b.x, b.y, a + 0.32, 135, { kind: "hechizo", r: 10 }); ebala(s, b.x, b.y, a - 0.32, 135, { kind: "hechizo", r: 10 }); }
      abanico(s, b.x, b.y, 5, 1.0, DOWN, 170, { kind: "corazon", r: 7 });
      // copias falsas: solo el verdadero tiene el aura de corazones
      const n = f ? 3 : 2;
      for (let i = 0; i < n; i++) s.decoys.push({ id: s.nextId++, x: rnd(70, W - 70), y: rnd(95, 260), t: 0, life: b.est + 0.5, sh: rnd(0.6, 1.4) });
      if (!b.avisoCopias) { b.avisoCopias = true; aviso(s, "💋 ¡Copias falsas! El verdadero tiene corazones a su alrededor", 2.6); }
    }
  }
}

/* ============================ PEREZA ============================ */
function pereza(b, s, dt) {
  const f = b.furia;
  b.x = W / 2 + Math.sin(b.t * 0.35) * 110;
  b.y = 130;
  b.atk -= dt;
  if (b.atk <= 0) {
    b.ciclo++;
    if (b.ciclo % 3 === 0) {
      // nubes de sueño (te ralentizan) + ronquidos que giran
      for (let i = 0; i < (f ? 2 : 1); i++) s.nubes.push({ x: rnd(90, W - 90), y: rnd(320, 600), r: 82, t: 0, life: 7 });
      for (let k = 0; k < 9; k++) ebala(s, b.x, b.y + 20, (Math.PI * 2 * k) / 9, 95, { kind: "zzz", r: 8, curve: f ? 1.1 : 0.8, life: 9 });
      aviso(s, "😴 Nubes de sueño: te harán lento", 1.8);
    } else if (b.ciclo % 3 === 1) {
      const n = f ? 3 : 2, warn = f ? 1.0 : 1.6;
      const xs = [];
      for (let i = 0; i < n; i++) {
        let x, tries = 0;
        do { x = rnd(60, W - 60); tries++; } while (tries < 8 && xs.some((o) => Math.abs(o - x) < 110));
        xs.push(x);
        s.zones.push({ x, w: 74, warn, act: 0.8, t: 0 });
      }
      aviso(s, "¡Columnas! Sal de las franjas brillantes", 1.4);
    } else {
      anillo(s, b.x, b.y + 20, f ? 16 : 12, rnd(0, 6), 105, { kind: "bruma", r: 9 });
    }
    b.atk = f ? 2.1 : 2.8;
  }
  if (f) {
    b.aimT -= dt;
    if (b.aimT <= 0) { b.aimT = 1.7; ebala(s, b.x, b.y + 20, aimAng(s, b.x, b.y), 170, { kind: "bruma", r: 8 }); }
  }
}

/* ============================ ENVIDIA ============================ */
function envidia(b, s, dt) {
  const f = b.furia;
  const hx = histX(s, f ? 0.4 : 0.75);
  b.x += (clamp(hx, 50, W - 50) - b.x) * Math.min(1, dt * (f ? 7 : 5));
  b.y = 125 + Math.sin(b.t * 2) * 8;
  if (b.rafaga > 0) {
    b.rafT -= dt;
    if (b.rafT <= 0) { ebala(s, b.x, b.y + 30, DOWN, 285, { kind: "ola", r: 7 }); b.rafaga--; b.rafT = 0.09; }
  }
  b.rastroT -= dt;
  if (b.rastroT <= 0) {
    b.rastroT = f ? 5.2 : 7;
    const pts = s.hist.filter((h) => h.t > s.t - 2.4).map((h) => ({ x: h.x, y: h.y }));
    if (pts.length > 10) {
      s.rastros.push({ id: s.nextId++, pts, i: 0, t: 0, fase: 0, x: pts[0].x, y: pts[0].y, hp: 4 });
      aviso(s, "🐍 ¡Tu propia sombra te persigue! Puedes dispararle", 2.2);
    }
  }
  b.atk -= dt;
  if (b.atk <= 0) {
    b.rafaga = f ? 6 : 4; b.atk = f ? 1.1 : 1.5; b.ciclo++;
    if (b.ciclo % 3 === 0) abanico(s, b.x, b.y + 20, f ? 5 : 3, 1.1, DOWN, 170, { kind: "ola", r: 7 });
  }
}

/* ============================ AVARICIA ============================ */
function avaricia(b, s, dt) {
  const f = b.furia;
  b.x = W / 2 + Math.sin(b.t * 0.4) * 60;
  b.y = 140;
  for (const c of b.monedas) {
    if (c.vivo) c.a += dt * (f ? 2.2 : 1.4);
    else { c.rep -= dt; if (c.rep <= 0) { c.vivo = true; c.hp = 6; } }
    c.x = b.x + Math.cos(c.a) * 98;
    c.y = b.y + Math.sin(c.a) * 66;
  }
  b.lluviaT -= dt;
  if (b.lluviaT <= 0) {
    const n = f ? 4 : 3;
    for (let i = 0; i < n; i++) ebala(s, rnd(30, W - 30), -10, DOWN + rnd(-0.15, 0.15), rnd(170, 230), { kind: "moneda", r: 8 });
    b.lluviaT = f ? 0.9 : 1.2;
  }
  b.roboT -= dt;
  if (b.roboT <= 0) { ebala(s, b.x, b.y + 20, aimAng(s, b.x, b.y), 200, { kind: "robo", r: 10 }); b.roboT = f ? 3 : 4.2; }
  b.arcoT -= dt;
  if (b.arcoT <= 0) {
    // lanza monedas hacia arriba: suben, caen y REBOTAN en el suelo
    b.arcoT = f ? 2.6 : 3.6;
    for (let i = 0; i < (f ? 7 : 5); i++) ebala(s, b.x, b.y, -Math.PI / 2 + (i - (f ? 3 : 2)) * 0.34, 330, { kind: "moneda", r: 8, grav: 520, suelo: 1, life: 9 });
  }
  if (f) {
    b.espT -= dt;
    if (b.espT <= 0) { b.espA += 0.35; ebala(s, b.x, b.y + 10, b.espA, 160, { kind: "moneda", r: 7 }); b.espT = 0.14; }
  }
}

/* ============================ IRA ============================ */
function ira(b, s, dt, A) {
  const f = b.furia;
  const p = s.p;
  if (f && s.paredes.target < 52) { s.paredes.target = 52; aviso(s, "🔥 ¡Las paredes de fuego se cierran!", 2.2); }
  b.geiserT -= dt;
  if (b.geiserT <= 0 && b.estado === 0) {
    b.geiserT = f ? 4.5 : 6;
    for (let i = 0; i < (f ? 3 : 2); i++) s.zones.push({ x: rnd(70, W - 70), w: 62, warn: 1.2, act: 0.9, t: 0, abajo: true, h: 330 });
  }
  if (b.estado === 0) { // acechando
    b.x += (clamp(p.x, 60, W - 60) - b.x) * Math.min(1, dt * 1.2);
    b.y += (b.yBase - b.y) * Math.min(1, dt * 4);
    b.atk -= dt;
    if (b.atk <= 0) {
      b.ciclo++;
      if (b.ciclo % 3 === 0) { b.estado = 1; b.tele = f ? 0.7 : 1.0; b.lockX = p.x; aviso(s, "¡Se prepara para embestir!", 1.0); }
      else { abanico(s, b.x, b.y + 30, f ? 5 : 3, 0.9, aimAng(s, b.x, b.y), 195, { kind: "llama", r: 8 }); b.atk = f ? 0.9 : 1.3; }
    }
  } else if (b.estado === 1) { // aviso (se pone roja)
    b.x += (b.lockX - b.x) * Math.min(1, dt * 6);
    b.tele -= dt;
    if (b.tele <= 0) { b.estado = 2; b.vyD = 0; }
  } else if (b.estado === 2) { // embestida
    b.vyD = Math.min(1100, b.vyD + 2600 * dt);
    b.y += b.vyD * dt;
    if (Math.abs(p.x - b.x) < 46 && Math.abs(p.y - b.y) < 54) golpearJugador(s, A);
    if (b.y >= H - 80) {
      b.y = H - 80; b.estado = 3; s.shake = 0.4; b.dashes++;
      anillo(s, b.x, b.y, f ? 14 : 10, 0, 150, { kind: "llama", r: 7 });
    }
  } else { // regreso dejando brasas
    b.y -= 430 * dt;
    b.embT -= dt;
    if (b.embT <= 0) { b.embT = 0.13; ebala(s, b.x, b.y, rnd(0, Math.PI * 2), 90, { kind: "llama", r: 5 }); }
    if (b.y <= b.yBase) {
      b.y = b.yBase;
      if (f && b.dashes % 2 === 1) { b.estado = 1; b.tele = 0.5; b.lockX = p.x; }
      else { b.estado = 0; b.atk = f ? 0.6 : 1.0; }
    }
  }
}

/* ============================ ORGULLO (jefe final) ============================ */
const MASCARA_EMOJI = { gula: "🐷", lujuria: "💋", pereza: "🌫️", envidia: "🐍", avaricia: "🪙", ira: "🔥" };
const FLORES = ["🌻", "🌹", "💜", "🌼"];

function iniciarFaseOrgullo(b, s, n) {
  const f = JEFES.orgullo.fases[n - 1];
  b.hp = f.hp; b.hpMax = f.hp; b.color = f.color; b.fase = n;
  b.ciclo = 0; b.atk = 1.2; b.sub = 0; b.subT = 3.2; b.ang = 0; b.hitT = 0; b.fireT = 0; b.rondas = 0;
  b.x = W / 2; b.y = b.yBase; b.dirx = 1; b.clon = null; b.clonT = 0;
  b.slots = null; b.ecoIdx = 0; b.mascara = null; b.ecoT = 0;
  b.curT = 1.0; b.gap = W / 2; b.hojaT = 1.8; b.anilloT = 2.0; b.rainT = 2.5; b.memT = 0.4;
  b.dash = null;
  s.zones = []; s.beams = []; s.decoys = []; s.rastros = []; s.nubes = [];
  titulo(s, `FASE ${n}`, f.nombre, 2.8);
  if (n === 4) {
    s.dark = 0.85; b.recuerdos = 0;
    s.p.hp = Math.min(s.p.maxHp, s.p.hp + 2);
    aviso(s, "El Olvido te protege: recoge los recuerdos 🌻🌹💜🌼 para herirlo", 3.4);
  } else if (n > 1) {
    s.p.hp = Math.min(s.p.maxHp, s.p.hp + 1);
    aviso(s, "+1 corazón", 1.6);
  }
}

function orgullo(b, s, dt, A) {
  switch (b.fase) {
    case 1: return orgulloReflejo(b, s, dt);
    case 2: return orgulloMascara(b, s, dt, A);
    case 3: return orgulloEspejo(b, s, dt);
    default: return orgulloOlvido(b, s, dt);
  }
}

/* Fase 1 — El Reflejo: espiral de 3 brazos + un CLON-ESPEJO de Mouri que dispara en simetría */
function orgulloReflejo(b, s, dt) {
  const mitad = b.hp <= b.hpMax * 0.5;
  b.x = W / 2 + Math.sin(b.t * 0.5) * 100;
  b.y = b.yBase;
  b.clon = { x: W - s.p.x, y: 185 };
  b.subT -= dt;
  if (b.sub === 0) { // espiral (y en la mitad, una espiral inversa desde el clon)
    b.fireT -= dt;
    if (b.fireT <= 0) {
      b.fireT = mitad ? 0.07 : 0.09;
      for (let k = 0; k < 3; k++) ebala(s, b.x, b.y + 10, b.ang + (k * Math.PI * 2) / 3, 150, { kind: "cristal", r: 6 });
      if (mitad) ebala(s, b.clon.x, b.clon.y + 10, -b.ang * 1.3, 130, { kind: "espejo", r: 6 });
      b.ang += 0.22;
    }
    if (b.subT <= 0) { b.sub = 1; b.subT = 0.9; }
  } else if (b.sub === 1) { // pausa
    if (b.subT <= 0) { b.sub = 2; b.subT = 0.55; b.rondas = 3; }
  } else if (b.sub === 2) { // anillos desde el jefe Y desde el clon (pinza)
    if (b.subT <= 0) {
      anillo(s, b.x, b.y + 10, 14, rnd(0, 6), 135, { kind: "cristal", r: 7 });
      anillo(s, b.clon.x, b.clon.y, 10, rnd(0, 6), 120, { kind: "espejo", r: 6 });
      b.rondas--; b.subT = 0.6;
      if (b.rondas <= 0) { b.sub = 3; b.subT = 0.9; }
    }
  } else if (b.subT <= 0) { b.sub = 0; b.subT = 3.2; b.fireT = 0; }

  b.clonT -= dt;
  if (b.clonT <= 0) {
    b.clonT = 0.55;
    ebala(s, b.clon.x, b.clon.y + 20, DOWN, 235, { kind: "espejo", r: 6 });
    if (mitad) abanico(s, b.clon.x, b.clon.y + 20, 3, 0.6, aimAng(s, b.clon.x, b.clon.y), 190, { kind: "espejo", r: 6 });
  }
}

/* Fase 2 — La Máscara: canaliza los pecados vencidos (¡y dos a la vez en la segunda mitad!) */
function crearSlot(id, b, s) {
  const sl = { id, fireT: 0, ang: 0, n: 0, dash: null };
  if (id === "pereza") {
    for (let i = 0; i < 3; i++) s.zones.push({ x: 70 + i * 170 + rnd(-30, 30), w: 70, warn: 1.2, act: 0.8, t: 0 });
    s.nubes.push({ x: rnd(90, W - 90), y: rnd(380, 600), r: 80, t: 0, life: 6 });
  }
  if (id === "lujuria") ebala(s, b.x, b.y, aimAng(s, b.x, b.y), 135, { kind: "hechizo", r: 10 });
  if (id === "ira") sl.dash = { e: 1, t: 0.9, lock: s.p.x, vy: 0 };
  if (id === "envidia") {
    const pts = s.hist.filter((h) => h.t > s.t - 2.4).map((h) => ({ x: h.x, y: h.y }));
    if (pts.length > 10) s.rastros.push({ id: s.nextId++, pts, i: 0, t: 0, fase: 0, x: pts[0].x, y: pts[0].y, hp: 4 });
  }
  if (id === "avaricia") for (let i = 0; i < 5; i++) ebala(s, b.x, b.y, -Math.PI / 2 + (i - 2) * 0.34, 330, { kind: "moneda", r: 8, grav: 520, suelo: 1, life: 9 });
  return sl;
}

function tickSlot(sl, b, s, dt, A) {
  sl.fireT -= dt;
  switch (sl.id) {
    case "gula":
      if (sl.fireT <= 0) {
        sl.fireT = 0.6; sl.n++;
        abanico(s, b.x, b.y + 30, 5, 1.2, DOWN, 185, { kind: "comida", r: 8 });
        if (sl.n % 4 === 0) anillo(s, b.x, b.y + 20, 16, rnd(0, 6), 120, { kind: "comida", r: 9 });
      }
      break;
    case "lujuria":
      if (sl.fireT <= 0) { sl.fireT = 0.1; sl.ang += 0.5; ebala(s, b.x, b.y + 10, sl.ang, 160, { kind: "corazon", r: 7 }); ebala(s, b.x, b.y + 10, sl.ang + Math.PI, 160, { kind: "corazon", r: 7 }); }
      break;
    case "pereza":
      if (sl.fireT <= 0) { sl.fireT = 1.5; anillo(s, b.x, b.y + 10, 12, rnd(0, 6), 105, { kind: "bruma", r: 9 }); for (let k = 0; k < 6; k++) ebala(s, b.x, b.y + 10, (Math.PI * 2 * k) / 6, 90, { kind: "zzz", r: 8, curve: 0.9, life: 8 }); }
      break;
    case "envidia":
      if (sl.fireT <= 0) { sl.fireT = 0.42; ebala(s, clamp(histX(s, 0.5), 20, W - 20), -8, DOWN, 295, { kind: "ola", r: 7 }); }
      break;
    case "avaricia":
      if (sl.fireT <= 0) { sl.fireT = 0.55; for (let i = 0; i < 4; i++) ebala(s, rnd(30, W - 30), -10, DOWN, rnd(170, 230), { kind: "moneda", r: 8 }); }
      break;
    case "ira": {
      const d = sl.dash;
      if (!d) break;
      if (d.e === 1) {
        b.x += (d.lock - b.x) * Math.min(1, dt * 6); d.t -= dt;
        if (d.t <= 0) { d.e = 2; d.vy = 0; }
      } else if (d.e === 2) {
        d.vy = Math.min(1100, d.vy + 2600 * dt); b.y += d.vy * dt;
        if (Math.abs(s.p.x - b.x) < 46 && Math.abs(s.p.y - b.y) < 54) golpearJugador(s, A);
        if (b.y >= H - 80) {
          b.y = H - 80; d.e = 3; s.shake = 0.4; anillo(s, b.x, b.y, 12, 0, 150, { kind: "llama", r: 7 });
          for (let i = 0; i < 3; i++) s.zones.push({ x: rnd(70, W - 70), w: 62, warn: 1.1, act: 0.9, t: 0, abajo: true, h: 330 });
        }
      } else {
        b.y -= 430 * dt;
        if (sl.fireT <= 0) { sl.fireT = 0.14; ebala(s, b.x, b.y, rnd(0, Math.PI * 2), 90, { kind: "llama", r: 5 }); }
        if (b.y <= b.yBase) { b.y = b.yBase; sl.dash = null; }
      }
      break;
    }
    default:
  }
}

function orgulloMascara(b, s, dt, A) {
  const mitad = b.hp <= b.hpMax * 0.5;
  if (!b.slots) {
    const id = ECOS[b.ecoIdx % ECOS.length];
    b.slots = [crearSlot(id, b, s)];
    let txt = `Eco de la ${NOMBRE_ECO[id]}`;
    if (mitad && id !== "ira") {
      const otros = ECOS.filter((e) => e !== "ira" && e !== id);
      const alt = otros[b.ecoIdx % otros.length];
      b.slots.push(crearSlot(alt, b, s));
      txt += ` + ${NOMBRE_ECO[alt]}`;
    }
    aviso(s, txt, 1.8);
    b.mascara = MASCARA_EMOJI[id];
    b.ecoT = 5;
  }
  const dashing = b.slots.some((sl) => sl.dash);
  if (!dashing) {
    b.x = W / 2 + Math.sin(b.t * 0.6) * 130;
    b.y += (b.yBase - b.y) * Math.min(1, dt * 4);
  }
  b.ecoT -= dt;
  for (const sl of b.slots) tickSlot(sl, b, s, dt, A);
  if (b.ecoT <= 0 && !b.slots.some((sl) => sl.dash)) { b.slots = null; b.ecoIdx++; }
}

/* Fase 3 — El Espejo Roto: esquirlas que rebotan, lluvia de cristales y RAYOS QUE REBOTAN en las paredes */
function orgulloEspejo(b, s, dt) {
  const mitad = b.hp <= b.hpMax * 0.5;
  const rayoActivo = s.beams.length > 0;
  if (!rayoActivo) {
    b.x += b.dirx * (mitad ? 230 : 185) * dt;
    if (b.x < 80) { b.x = 80; b.dirx = 1; }
    if (b.x > W - 80) { b.x = W - 80; b.dirx = -1; }
  }
  b.y = b.yBase;
  b.fireT -= dt;
  if (b.fireT <= 0 && !rayoActivo) {
    b.fireT = mitad ? 0.38 : 0.5;
    ebala(s, b.x, b.y + 20, aimAng(s, b.x, b.y) + rnd(-0.45, 0.45), 235, { kind: "esquirla", r: 6, bounce: 1 });
  }
  b.anilloT -= dt;
  if (b.anilloT <= 0 && !rayoActivo) {
    b.anilloT = 2.6;
    abanico(s, b.x, b.y + 20, 7, 1.7, DOWN, 190, { kind: "esquirla", r: 6, bounce: 1 });
  }
  b.rainT -= dt;
  if (b.rainT <= 0) {
    b.rainT = mitad ? 2.4 : 3.4;
    for (let i = 0; i < 6; i++) ebala(s, rnd(20, W - 20), -10 - i * 14, DOWN, rnd(210, 270), { kind: "cristal", r: 6 });
  }
  b.atk -= dt;
  if (b.atk <= 0 && !rayoActivo) {
    b.atk = mitad ? 6.5 : 7.5;
    const a0 = 0.25, a1 = Math.PI - 0.25;
    s.beams.push({ ox: b.x, oy: b.y, a0, a1, warn: 1.1, dur: 2.4, t: 0, rebota: true });
    if (mitad) s.beams.push({ ox: b.x, oy: b.y, a0: a1, a1: a0, warn: 1.1, dur: 2.4, t: 0, rebota: true });
    aviso(s, "¡Rayo rebotante! Busca el hueco", 1.6);
  }
}

/* Fase 4 — El Olvido: está protegido hasta que Mouri RECUERDA (recoge 4 flores-recuerdo);
 * cada recuerdo devuelve luz y le quita protección. */
function orgulloOlvido(b, s, dt) {
  const rec = b.recuerdos || 0;
  const bajo = b.hp <= b.hpMax * 0.4;
  s.dark = Math.max(0.1, 0.85 - 0.18 * rec);
  b.x = W / 2 + Math.sin(b.t * 0.4) * 70;
  b.y = 115;
  b.curT -= dt;
  if (b.curT <= 0) {
    b.curT = bajo ? 1.25 : 1.55;
    b.gap = clamp(b.gap + rnd(-150, 150), 90, W - 90);
    const gw = bajo ? 118 : 132;
    for (let x = 18; x < W; x += 34) if (Math.abs(x - b.gap) > gw / 2) ebala(s, x, -10, DOWN, bajo ? 175 : 150, { kind: "olvido", r: 6 });
  }
  b.anilloT -= dt;
  if (b.anilloT <= 0) { b.anilloT = bajo ? 1.9 : 2.4; anillo(s, b.x, b.y + 10, 16, rnd(0, 6), 95, { kind: "olvido", r: 7 }); }
  b.hojaT -= dt;
  if (b.hojaT <= 0) {
    b.hojaT = bajo ? 1.2 : 2.0;
    ebala(s, b.x, b.y + 10, aimAng(s, b.x, b.y), 185, { kind: "olvido", r: 7 });
  }
  b.memT -= dt;
  if (b.memT <= 0) {
    b.memT = 3.2;
    const enPantalla = s.pk.filter((k) => k.tipo === "memoria").length;
    if (rec + enPantalla < 4) {
      s.pk.push({ id: s.nextId++, x: rnd(60, W - 60), y: -10, tipo: "memoria", emoji: FLORES[(rec + enPantalla) % 4], vy: 62, t: 0 });
    }
  }
}

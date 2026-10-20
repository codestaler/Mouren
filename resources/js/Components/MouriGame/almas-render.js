/* almas-render.js — dibuja el modo celular ("Mouri, guía de almas") en un canvas.
 * Todo está dibujado con formas y degradados, así que funciona sin ninguna
 * imagen. Mouri usa tu sprite (ASSETS.mouriVolador) si existe.              */
import { ASSETS } from "./config";
import { M } from "./almas-engine";
import { sprite } from "./avion-render";

const { W, H } = M;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function glow(ctx, x, y, r, color, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = alpha; ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
}

function envolver(ctx, texto, maxW) {
  const palabras = texto.split(" "), lineas = []; let cur = "";
  for (const p of palabras) {
    const t = cur ? cur + " " + p : p;
    if (ctx.measureText(t).width > maxW && cur) { lineas.push(cur); cur = p; } else cur = t;
  }
  if (cur) lineas.push(cur);
  return lineas;
}

function sombra(ctx, o, t) {
  const r = o.r, x = o.x, y = o.y, pulso = 1 + Math.sin(t * 5 + o.fase) * 0.06;
  const g = ctx.createRadialGradient(x, y, 2, x, y, r * 1.5 * pulso);
  const col = o.tipo === "sigue" ? "40,10,40" : "20,10,45";
  g.addColorStop(0, `rgba(${col},.95)`); g.addColorStop(0.65, `rgba(${col},.75)`); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.5 * pulso, 0, Math.PI * 2); ctx.fill();
  // colita de humo hacia arriba
  ctx.fillStyle = "rgba(25,12,50,.45)";
  ctx.beginPath(); ctx.ellipse(x, y - r * 1.2, r * 0.45, r * 0.9, 0, 0, Math.PI * 2); ctx.fill();
  // ojos
  ctx.fillStyle = o.tipo === "sigue" ? "#ff6a8a" : "#d9c8ff";
  const e = r * 0.28;
  ctx.beginPath(); ctx.arc(x - e, y - 2, 2.6, 0, Math.PI * 2); ctx.arc(x + e, y - 2, 2.6, 0, Math.PI * 2); ctx.fill();
}

export function dibujarAlmas(ctx, a, R) {
  const cfg = a.cfg, m = a.m, t = a.t;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (a.shake > 0) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);

  // cielo
  const cielo = ctx.createLinearGradient(0, 0, 0, H);
  cielo.addColorStop(0, cfg.cielo[0]); cielo.addColorStop(0.55, cfg.cielo[1]); cielo.addColorStop(1, cfg.cielo[2]);
  ctx.fillStyle = cielo; ctx.fillRect(-10, -10, W + 20, H + 20);

  // luz del amanecer que crece arriba
  const prog = clamp(t / a.dur, 0, 1);
  const amanecer = a.fase === "cierre" ? 1 : clamp((prog - 0.6) / 0.4, 0, 1) * 0.85;
  if (amanecer > 0) {
    glow(ctx, W / 2, -20, 120 + amanecer * 420, "rgba(255,226,160,.95)", 0.35 + amanecer * 0.65);
    glow(ctx, W / 2, -20, 80 + amanecer * 200, "rgba(255,255,255,.95)", amanecer * 0.9);
  }

  // estrellas en dos capas (sensación de subir)
  if (!a._stars) a._stars = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 0.2 + Math.random() * 0.8, r: 0.6 + Math.random() * 1.5 }));
  ctx.fillStyle = "#fff";
  for (const s of a._stars) {
    ctx.globalAlpha = (0.25 + s.r * 0.25) * (1 - amanecer * 0.7);
    ctx.fillRect(s.x, (s.y + t * cfg.vel * s.v * 0.5) % H, s.r, s.r * 2.2);
  }
  ctx.globalAlpha = 1;

  // nubes suaves
  if (!a._nubes) a._nubes = Array.from({ length: 6 }, () => ({ x: Math.random() * W, y: Math.random() * H, w: 90 + Math.random() * 120, v: 0.35 + Math.random() * 0.4 }));
  for (const n of a._nubes) {
    const y = (n.y + t * cfg.vel * n.v * 0.7) % (H + 80) - 40;
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.beginPath(); ctx.ellipse(n.x, y, n.w, n.w * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  }

  // viento: aviso y rayas
  const v = a.viento;
  if (v.estado === 1) {
    ctx.globalAlpha = 0.4 + Math.abs(Math.sin(t * 12)) * 0.5;
    ctx.fillStyle = "#cfe8ff"; ctx.font = "bold 34px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(v.dir > 0 ? "➡" : "⬅", v.dir > 0 ? W - 30 : 30, H * 0.45); ctx.globalAlpha = 1;
  } else if (v.estado === 2) {
    ctx.strokeStyle = "rgba(220,240,255,.35)"; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const y = (i * 71 + t * 90) % H, x = ((t * 420 * v.dir + i * 97) % (W + 160) + W + 160) % (W + 160) - 80;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 56 * v.dir, y + 4); ctx.stroke();
    }
  }

  // rayos (columnas)
  for (const z of a.rayos) {
    const activo = z.t >= z.warn;
    ctx.globalAlpha = activo ? 0.95 : 0.15 + (z.t / z.warn) * 0.3 + Math.abs(Math.sin(z.t * 18)) * 0.12;
    const g = ctx.createLinearGradient(z.x - z.w / 2, 0, z.x + z.w / 2, 0);
    const c = activo ? "255,255,255" : "255,236,120";
    g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(0.5, `rgba(${c},.95)`); g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g; ctx.fillRect(z.x - z.w / 2, 0, z.w, H);
  }
  ctx.globalAlpha = 1;

  // recuerdos
  for (const r of a.rec) {
    const p = 1 + Math.sin(r.t * 6) * 0.15;
    glow(ctx, r.x, r.y, 26 * p, "rgba(255,224,138,.95)", 0.85);
    ctx.fillStyle = "#fffbe0"; ctx.beginPath(); ctx.arc(r.x, r.y, 5.5 * p, 0, Math.PI * 2); ctx.fill();
  }

  // sombras
  for (const o of a.obst) sombra(ctx, o, t);

  // alma + estela
  const al = a.alma;
  a.alma.trail.forEach((p, i) => {
    ctx.globalAlpha = (i / a.alma.trail.length) * 0.35;
    ctx.fillStyle = cfg.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 3 + i * 0.5, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  glow(ctx, al.x, al.y, 44, cfg.color, 0.6 + Math.sin(t * 4) * 0.1 + (a.luces < 2 ? Math.sin(t * 18) * 0.15 : 0));
  ctx.font = "28px \"Apple Color Emoji\",\"Segoe UI Emoji\",\"Noto Color Emoji\",serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = 0.95;
  ctx.fillText(cfg.emoji, al.x, al.y);
  ctx.globalAlpha = 1;

  // Mouri
  if (!(m.invuln > 0 && Math.floor(m.invuln * 14) % 2)) {
    glow(ctx, m.x, m.y, 50, "rgba(255,227,154,.35)", 1);
    sprite(ctx, R, ASSETS.mouriVolador, m.x, m.y, 72, "🐦");
  }

  // graznido
  const g = a.graznar;
  if (g.t > 0) {
    const k = 1 - g.t / 0.5;
    ctx.strokeStyle = `rgba(255,248,210,${1 - k})`; ctx.lineWidth = 5 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(m.x, m.y, 20 + k * 150, 0, Math.PI * 2); ctx.stroke();
  }
  // recarga del graznido (anillo chiquito alrededor de Mouri)
  if (g.cd > 0) {
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(m.x, m.y, 38, -Math.PI / 2, -Math.PI / 2 + (1 - g.cd / 3.2) * Math.PI * 2); ctx.stroke();
  }

  for (const f of a.fx) {
    ctx.globalAlpha = clamp(1 - f.t / f.life, 0, 1); ctx.fillStyle = f.color;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // niebla (tapa el cielo menos alrededor de Mouri)
  if (a.niebla > 0.02) {
    const gn = ctx.createRadialGradient(m.x, m.y, 40, m.x, m.y, 230);
    gn.addColorStop(0, "rgba(170,185,205,0)"); gn.addColorStop(0.5, `rgba(150,165,190,${a.niebla * 0.55})`); gn.addColorStop(1, `rgba(120,135,165,${a.niebla})`);
    ctx.fillStyle = gn; ctx.fillRect(-10, -10, W + 20, H + 20);
  }
  ctx.restore();

  if (a.flash > 0) { ctx.fillStyle = `rgba(255,240,200,${clamp(a.flash, 0, 0.4)})`; ctx.fillRect(0, 0, W, H); }
  if (a.fase === "cierre") { ctx.fillStyle = `rgba(255,248,225,${clamp(1 - a.cierreT / 3.4, 0, 1) * 0.9})`; ctx.fillRect(0, 0, W, H); }

  // recuerdo recogido (texto)
  ctx.textBaseline = "alphabetic";
  if (a.mem) {
    ctx.globalAlpha = clamp(a.mem.t * 2, 0, 1);
    ctx.font = "italic 15px system-ui,sans-serif"; ctx.textAlign = "center";
    const lin = envolver(ctx, "✨ " + a.mem.texto, W - 70);
    ctx.fillStyle = "rgba(0,0,0,.5)";
    const hh = lin.length * 20 + 14;
    ctx.fillRect(28, 64, W - 56, hh);
    ctx.fillStyle = "#fff3c4";
    lin.forEach((l, i) => ctx.fillText(l, W / 2, 88 + i * 20));
    ctx.globalAlpha = 1;
  }
  if (a.aviso) {
    ctx.globalAlpha = clamp(a.aviso.t * 2, 0, 1);
    ctx.font = "bold 14px system-ui,sans-serif"; ctx.textAlign = "center";
    const lin = envolver(ctx, a.aviso.texto, W - 80);
    const hh = lin.length * 19 + 14, y0 = H - 118 - hh;
    ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillRect(30, y0, W - 60, hh);
    ctx.fillStyle = "#ffffff";
    lin.forEach((l, i) => ctx.fillText(l, W / 2, y0 + 22 + i * 19));
    ctx.globalAlpha = 1;
  }
}

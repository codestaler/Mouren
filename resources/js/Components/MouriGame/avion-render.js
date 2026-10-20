/* avion-render.js — dibuja una etapa del avioncito en un <canvas> 2D.
 * Todo se dibuja en coordenadas lógicas (AV.W x AV.H); el componente se
 * encarga de escalar el canvas.                                         */
import { AV, JEFES, ETAPAS } from "./config-avion";
import { ASSETS } from "./config";

const W = AV.W, H = AV.H;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function emoji(ctx, ch, x, y, size) {
  ctx.font = `${Math.round(size)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(ch, x, y);
}

/** Dibuja un recurso de config.js: ruta de imagen o emoji. */
export function sprite(ctx, R, asset, x, y, size, respaldo, volteado) {
  if (typeof asset === "string" && asset.includes("/")) {
    const im = R.img(asset);
    if (im) {
      const ar = im.naturalWidth / (im.naturalHeight || 1) || 1;
      const w = ar >= 1 ? size : size * ar, h = ar >= 1 ? size / ar : size;
      ctx.save();
      ctx.translate(x, y);
      if (volteado) ctx.scale(-1, 1);
      ctx.drawImage(im, -w / 2, -h / 2, w, h);
      ctx.restore();
      return;
    }
    asset = respaldo || "🐦";
  }
  emoji(ctx, asset, x, y, size * 0.9);
}

function glow(ctx, x, y, r, color, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

const ESTILO_BALA = {
  orb: { c: null }, comida: { e: "🍖" }, corazon: { e: "💗" }, hechizo: { e: "💘" },
  moneda: { e: "🪙" }, robo: { e: "💰" }, llama: { e: "🔥" },
  bruma: { c: "#cbd9e6", soft: true }, ola: { c: "#4fd1c0", alarg: true },
  cristal: { c: "#8fe3ff", rombo: true }, espejo: { c: "#ffffff", rombo: true },
  esquirla: { c: "#ff9a9a", rombo: true }, olvido: { c: "#f3ecd8", oscuro: true },
  sombra: { c: "#9b6bd6" }, zzz: { e: "💤" },
};

function dibujarBalaEnemiga(ctx, b, colorEtapa) {
  const st = ESTILO_BALA[b.kind] || ESTILO_BALA.orb;
  if (st.e) { emoji(ctx, st.e, b.x, b.y, b.r * 2.4); return; }
  const c = st.c || b.color || colorEtapa;
  if (st.rombo) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
    ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(0, -b.r * 1.7); ctx.lineTo(b.r * 0.9, 0); ctx.lineTo(0, b.r * 1.7); ctx.lineTo(-b.r * 0.9, 0); ctx.closePath(); ctx.fill();
    ctx.restore(); return;
  }
  if (st.alarg) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
    ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.ellipse(0, 0, b.r * 0.8, b.r * 1.9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); return;
  }
  ctx.save();
  ctx.shadowColor = c; ctx.shadowBlur = st.soft ? 4 : 10;
  ctx.fillStyle = st.oscuro ? "#15121f" : c;
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = st.oscuro ? c : "#ffffff";
  ctx.globalAlpha = st.soft ? 0.5 : 0.9;
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function dibujarJefe(ctx, R, s, b) {
  const d = JEFES[b.id];
  const size = b.id === "orgullo" ? 120 : 104;
  ctx.save();
  ctx.globalAlpha = clamp(b.alpha, 0, 1) * (b.hitT > 0 && Math.floor(b.hitT * 40) % 2 ? 0.55 : 1);

  // aura
  const pulso = 0.6 + Math.sin(s.t * 4) * 0.15;
  glow(ctx, b.x, b.y, size * (b.furia ? 1.1 : 0.85), b.furia ? "rgba(255,70,50,.55)" : hex(b.color, 0.45), pulso);

  if (b.id === "gula" && b.tragar > 0) {
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const a = s.t * 3 + (i * Math.PI) / 3, r = 120 - ((s.t * 120 + i * 20) % 100);
      ctx.beginPath(); ctx.arc(b.x, b.y + 20, r, a, a + 1.1); ctx.stroke();
    }
  }
  if (b.id === "ira" && b.estado === 1) {
    ctx.globalAlpha = 0.25 + Math.abs(Math.sin(s.t * 18)) * 0.3;
    const g = ctx.createLinearGradient(0, b.y, 0, H);
    g.addColorStop(0, "rgba(255,40,20,.7)"); g.addColorStop(1, "rgba(255,40,20,0)");
    ctx.fillStyle = g; ctx.fillRect(b.lockX - 36, b.y, 72, H - b.y);
    ctx.globalAlpha = clamp(b.alpha, 0, 1);
    glow(ctx, b.x, b.y, 90, "rgba(255,30,10,.8)", 0.8);
  }
  if (b.id === "orgullo") {
    // halo giratorio + grietas según la fase
    ctx.strokeStyle = b.color; ctx.lineWidth = 3; ctx.globalAlpha *= 0.8;
    for (let i = 0; i < 3; i++) {
      const a = s.t * (0.8 + i * 0.3) * (i % 2 ? -1 : 1);
      ctx.beginPath(); ctx.arc(b.x, b.y, 72 + i * 14, a, a + 2.0); ctx.stroke();
    }
    if (b.fase >= 3) {
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 + 0.4;
        ctx.beginPath(); ctx.moveTo(b.x + Math.cos(a) * 18, b.y + Math.sin(a) * 18); ctx.lineTo(b.x + Math.cos(a + 0.2) * 70, b.y + Math.sin(a + 0.2) * 70); ctx.stroke();
      }
    }
    ctx.globalAlpha = clamp(b.alpha, 0, 1) * (b.hitT > 0 && Math.floor(b.hitT * 40) % 2 ? 0.55 : 1);
  }
  sprite(ctx, R, d.sprite, b.x, b.y, size, d.respaldo);
  if (b.id === "orgullo" && b.fase === 2 && b.mascara) {
    ctx.globalAlpha = clamp(b.alpha, 0, 1);
    glow(ctx, b.x, b.y - 4, 56, "rgba(255,255,255,.35)", 0.8);
    emoji(ctx, b.mascara, b.x, b.y - 4, 56);
  }
  if (b.id === "orgullo" && b.fase === 4 && (b.recuerdos || 0) < 4) {
    // escudo del Olvido: se debilita con cada recuerdo
    const f = 1 - (b.recuerdos || 0) / 4;
    ctx.globalAlpha = 0.25 + f * 0.5;
    ctx.strokeStyle = "#bba7ff"; ctx.lineWidth = 5; ctx.setLineDash([14, 8]);
    ctx.beginPath(); ctx.arc(b.x, b.y, 88, s.t * 0.6, s.t * 0.6 + Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();

  if (b.monedas) {
    for (const c of b.monedas) {
      if (!c.vivo) continue;
      glow(ctx, c.x, c.y, 30, "rgba(255,210,70,.5)", 0.9);
      emoji(ctx, "🪙", c.x, c.y, 34);
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(c.x, c.y, 20, -Math.PI / 2, -Math.PI / 2 + (c.hp / 6) * Math.PI * 2); ctx.stroke();
    }
  }
}

function hex(c, a) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c);
  if (!m) return `rgba(255,255,255,${a})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
}

/* ===================================================================== */
export function dibujar(ctx, s, R) {
  const p = s.p, cfg = s.cfg;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 9 * Math.min(1, s.shake * 3), (Math.random() - 0.5) * 9 * Math.min(1, s.shake * 3));

  // estrellas / polvo que bajan (sensación de vuelo)
  if (!s._stars) s._stars = Array.from({ length: 56 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 40 + Math.random() * 170, r: 0.6 + Math.random() * 1.6 }));
  ctx.fillStyle = "#ffffff";
  for (const st of s._stars) {
    ctx.globalAlpha = 0.18 + st.r * 0.15;
    ctx.fillRect(st.x, (st.y + s.t * st.v) % H, st.r, st.r * 2.4);
  }
  ctx.globalAlpha = 1;

  // nubes de sueño (ralentizan a Mouri)
  for (const nb of s.nubes) {
    const a = clamp(Math.min(nb.t / 0.6, (nb.life - nb.t) / 0.8), 0, 1);
    glow(ctx, nb.x, nb.y, nb.r * 1.15, "rgba(170,160,235,.55)", a * 0.9);
    glow(ctx, nb.x - 26, nb.y + 10, nb.r * 0.7, "rgba(200,195,255,.45)", a * 0.8);
    ctx.globalAlpha = a; emoji(ctx, "💤", nb.x + Math.sin(s.t * 2) * 6, nb.y - 4, 30); ctx.globalAlpha = 1;
  }

  // corriente de agua que empuja
  if (s.corriente) {
    const cr = s.corriente, act = cr.t >= cr.warn;
    ctx.save();
    ctx.globalAlpha = act ? 0.5 : 0.15 + Math.abs(Math.sin(cr.t * 10)) * 0.2;
    ctx.strokeStyle = "#7fe0d4"; ctx.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      const y = 120 + i * 78, off = ((s.t * 260 * cr.dir) % 160 + 160) % 160;
      for (let x = -160 + off; x < W + 160; x += 160) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 20 * cr.dir, y - 10, x + 44 * cr.dir, y); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // paredes de fuego de la Ira (furia)
  if (s.paredes && s.paredes.w > 3) {
    const w = s.paredes.w;
    for (const izq of [true, false]) {
      const x0 = izq ? 0 : W - w;
      const g = ctx.createLinearGradient(izq ? 0 : W, 0, izq ? w : W - w, 0);
      g.addColorStop(0, "rgba(255,90,20,.9)"); g.addColorStop(1, "rgba(255,40,10,0)");
      ctx.fillStyle = g; ctx.fillRect(x0, 0, w, H);
      for (let y = 20; y < H; y += 60) emoji(ctx, "🔥", izq ? w * 0.35 : W - w * 0.35, y + Math.sin(s.t * 6 + y) * 6, 24);
    }
  }

  // columnas de la Pereza / géiseres de lava (Ira)
  for (const z of s.zones) {
    const activa = z.t >= z.warn;
    const k = activa ? 1 : clamp(z.t / z.warn, 0, 1);
    ctx.globalAlpha = activa ? 0.75 : 0.18 + k * 0.3 + Math.abs(Math.sin(z.t * 14)) * 0.12;
    const g = ctx.createLinearGradient(z.x - z.w / 2, 0, z.x + z.w / 2, 0);
    const c = z.abajo ? (activa ? "255,150,60" : "255,110,60") : (activa ? "255,255,255" : "190,215,240");
    g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(0.5, `rgba(${c},.9)`); g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g;
    const y0 = z.abajo ? H - z.h : 0;
    ctx.fillRect(z.x - z.w / 2, y0, z.w, H - y0);
  }
  ctx.globalAlpha = 1;

  // rayos barredores
  for (const bm of s.beams) {
    const aviso_ = bm.t < bm.warn;
    const segs = bm.segs || [{ x1: bm.ox, y1: bm.oy, x2: bm.ox + Math.cos(bm.a0) * 1100, y2: bm.oy + Math.sin(bm.a0) * 1100 }];
    ctx.save(); ctx.lineCap = "round";
    segs.forEach((sg, i) => {
      if (aviso_) {
        ctx.globalAlpha = (0.25 + Math.abs(Math.sin(bm.t * 16)) * 0.35) / (1 + i * 0.4);
        ctx.strokeStyle = "#ff8a8a"; ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]);
        ctx.beginPath(); ctx.moveTo(sg.x1, sg.y1); ctx.lineTo(sg.x2, sg.y2); ctx.stroke();
      } else {
        ctx.setLineDash([]);
        ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 18; ctx.globalAlpha = 1;
        ctx.strokeStyle = "rgba(255,200,200,.35)"; ctx.lineWidth = 30;
        ctx.beginPath(); ctx.moveTo(sg.x1, sg.y1); ctx.lineTo(sg.x2, sg.y2); ctx.stroke();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(sg.x1, sg.y1); ctx.lineTo(sg.x2, sg.y2); ctx.stroke();
      }
    });
    ctx.restore();
  }

  // objetos que caen
  for (const k of s.pk) {
    if (k.tipo === "memoria") {
      glow(ctx, k.x, k.y, 34 + Math.sin(k.t * 5) * 5, "rgba(255,240,170,.95)", 0.95);
      emoji(ctx, k.emoji || "🌻", k.x, k.y, 30);
      continue;
    }
    if (k.tipo === "moneda") { glow(ctx, k.x, k.y, 20, "rgba(255,210,70,.6)", 0.8); emoji(ctx, "🪙", k.x, k.y, 22); continue; }
    const col = k.tipo === "perla" ? "rgba(255,243,176,.9)" : k.tipo === "corazon" ? "rgba(255,138,160,.9)" : "rgba(255,224,138,.9)";
    glow(ctx, k.x, k.y, 24 + Math.sin(k.t * 6) * 3, col, 0.8);
    emoji(ctx, k.tipo === "perla" ? "✨" : k.tipo === "corazon" ? "💗" : "💡", k.x, k.y, 22);
  }

  // enemigos
  for (const e of s.en) {
    const size = e.r * 2.3;
    if (e.tipo === "grande") glow(ctx, e.x, e.y, e.r * 1.8, "rgba(120,60,180,.5)", 0.8);
    if (e.tipo === "tirador") { ctx.strokeStyle = "rgba(255,120,120,.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 4, 0, Math.PI * 2); ctx.stroke(); }
    if (e.tipo === "kamikaze" && e.estado === 1) glow(ctx, e.x, e.y, e.r * 2.2, "rgba(255,60,40,.8)", 0.9);
    ctx.save();
    if (e.hp < e.hpMax) ctx.globalAlpha = 0.85;
    if (e.tipo === "alimento") { glow(ctx, e.x, e.y, e.r * 2, "rgba(255,170,90,.6)", 0.8); emoji(ctx, "🍖", e.x, e.y, size); }
    else emoji(ctx, cfg.skin, e.x, e.y, size);
    ctx.restore();
  }

  // copias falsas de la Lujuria (¡dispárales para deshacerlas!)
  for (const d of s.decoys) {
    const a = clamp(Math.min(d.t / 0.4, (d.life - d.t) / 0.4), 0, 1);
    ctx.save(); ctx.globalAlpha = a * 0.75;
    glow(ctx, d.x, d.y, 60, "rgba(255,120,190,.5)", 0.9);
    sprite(ctx, R, JEFES.lujuria.sprite, d.x, d.y, 88, JEFES.lujuria.respaldo);
    ctx.restore();
  }
  // tu sombra (Envidia)
  for (const r of s.rastros) {
    ctx.save(); ctx.globalAlpha = r.fase === 0 ? 0.4 : 0.7;
    glow(ctx, r.x, r.y, 36, "rgba(60,210,190,.6)", 0.9);
    sprite(ctx, R, ASSETS.mouriVolador, r.x, r.y, 56, "🐦");
    ctx.restore();
    ctx.strokeStyle = "rgba(79,209,192,.8)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(r.x, r.y, 24, 0, Math.PI * 2); ctx.stroke();
  }

  // balas enemigas
  for (const b of s.eb) dibujarBalaEnemiga(ctx, b, cfg.color);

  // oscuridad (fase 4 del Orgullo): solo se ve alrededor de Mouri
  if (s.dark > 0) {
    const g = ctx.createRadialGradient(p.x, p.y, 40, p.x, p.y, 260);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.55, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(3,2,12,${s.dark})`);
    ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
  }

  // jefe + clon-espejo
  const boss = s.boss;
  if (boss) {
    if (boss.clon) {
      ctx.save(); ctx.globalAlpha = 0.55;
      glow(ctx, boss.clon.x, boss.clon.y, 50, "rgba(160,220,255,.6)", 0.9);
      sprite(ctx, R, ASSETS.mouriVolador, boss.clon.x, boss.clon.y, 64, "🐦", true);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.2; ctx.strokeStyle = "#bfe8ff"; ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(W / 2, 90); ctx.lineTo(W / 2, H - 20); ctx.stroke(); ctx.restore();
    }
    dibujarJefe(ctx, R, s, boss);
  }

  // balas de Mouri
  for (const b of s.pb) {
    ctx.save();
    ctx.shadowColor = "#ffe08a"; ctx.shadowBlur = 10;
    ctx.fillStyle = "#fff3b0";
    ctx.beginPath(); ctx.ellipse(b.x, b.y, 3.2, 10, Math.atan2(b.vx, -b.vy) * -1 * -1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Mouri
  if (!(p.invuln > 0 && Math.floor(p.invuln * 14) % 2)) {
    glow(ctx, p.x, p.y, 46, "rgba(255,227,154,.35)", 1);
    sprite(ctx, R, ASSETS.mouriVolador, p.x, p.y, 66, "🐦");
  }
  if (p.hechizo > 0) emoji(ctx, "💘", p.x, p.y - 44, 22);
  // el puntito de golpe (solo esto puede ser alcanzado)
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#ff5a5a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // efectos
  for (const f of s.fx) {
    const k = 1 - f.t / f.life;
    if (f.k === "chispa") { ctx.globalAlpha = clamp(k, 0, 1); ctx.fillStyle = f.color; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * k + 0.5, 0, Math.PI * 2); ctx.fill(); }
    else if (f.k === "texto") {
      ctx.globalAlpha = clamp(k * 1.5, 0, 1); ctx.fillStyle = f.color; ctx.font = "bold 15px system-ui,sans-serif"; ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(0,0,0,.6)"; ctx.lineWidth = 3; ctx.strokeText(f.texto, f.x, f.y); ctx.fillText(f.texto, f.x, f.y);
    }
  }
  ctx.globalAlpha = 1;

  // Rayo del Recuerdo
  if (s.bombFx > 0) {
    const k = 1 - s.bombFx / 0.9;
    glow(ctx, p.x, p.y, 60 + k * 620, "rgba(255,240,170,.9)", clamp(1 - k, 0, 1) * 0.8);
    ctx.strokeStyle = `rgba(255,255,255,${clamp(1 - k, 0, 1)})`; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(p.x, p.y, k * 640, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();

  if (s.flash > 0) { ctx.fillStyle = `rgba(255,246,204,${clamp(s.flash, 0, 0.5)})`; ctx.fillRect(0, 0, W, H); }
  if (p.invuln > 1.2 && s.p.hp > 0) { ctx.fillStyle = `rgba(255,60,60,${clamp((p.invuln - 1.2) * 0.4, 0, 0.18)})`; ctx.fillRect(0, 0, W, H); }

  // barra del jefe
  if (boss && boss.entrada <= 0.9 && !boss.muerto) {
    const d = JEFES[boss.id];
    const bw = W - 60, bx = 30, by = 14;
    ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(bx - 3, by - 3, bw + 6, 16);
    ctx.fillStyle = boss.color; ctx.fillRect(bx, by, bw * clamp(boss.hp / boss.hpMax, 0, 1), 10);
    ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.5; ctx.strokeRect(bx - 3, by - 3, bw + 6, 16);
    ctx.font = "bold 12px system-ui,sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#fff";
    ctx.strokeStyle = "rgba(0,0,0,.7)"; ctx.lineWidth = 3;
    const etiqueta = boss.id === "orgullo"
      ? `${d.nombre} — Fase ${boss.fase}/4 · ${d.fases[boss.fase - 1].nombre}`
      : `${d.pecado} — ${d.nombre}`;
    ctx.strokeText(etiqueta, bx, by + 30); ctx.fillText(etiqueta, bx, by + 30);
  }

  // recuerdos del Olvido (fase 4)
  if (boss && boss.id === "orgullo" && boss.fase === 4 && !boss.muerto) {
    const FL = ["🌻", "🌹", "💜", "🌼"], n = boss.recuerdos || 0;
    const y = 62;
    ctx.fillStyle = "rgba(0,0,0,.45)";
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(W / 2 - 92, y - 17, 184, 34, 17) : ctx.rect(W / 2 - 92, y - 17, 184, 34); ctx.fill();
    FL.forEach((f, i) => { ctx.globalAlpha = i < n ? 1 : 0.28; emoji(ctx, f, W / 2 - 66 + i * 44, y, 22); });
    ctx.globalAlpha = 1;
  }

  // cartel de entrada de jefe / fase
  if (s.titulo) {
    const t = s.titulo, k = t.t / t.dur;
    const a = clamp(Math.min(k * 4, (1 - k) * 6), 0, 1);
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(0, H * 0.4 - 52, W, 112);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "900 34px system-ui,sans-serif"; ctx.lineWidth = 5; ctx.strokeStyle = "rgba(0,0,0,.8)";
    ctx.strokeText(t.texto, W / 2, H * 0.4 - 10); ctx.fillStyle = "#fff3b0"; ctx.fillText(t.texto, W / 2, H * 0.4 - 10);
    if (t.sub) { ctx.font = "italic 700 18px system-ui,sans-serif"; ctx.lineWidth = 4; ctx.strokeText(t.sub, W / 2, H * 0.4 + 28); ctx.fillStyle = "#ffffff"; ctx.fillText(t.sub, W / 2, H * 0.4 + 28); }
    ctx.restore();
  }

  // aviso central
  if (s.aviso) {
    ctx.globalAlpha = clamp(s.aviso.t * 2, 0, 1);
    ctx.font = "bold 18px system-ui,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const tw = ctx.measureText(s.aviso.texto).width + 28;
    ctx.fillStyle = "rgba(0,0,0,.55)";
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(W / 2 - tw / 2, H * 0.3 - 18, tw, 36, 18) : ctx.rect(W / 2 - tw / 2, H * 0.3 - 18, tw, 36); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(s.aviso.texto, W / 2, H * 0.3);
    ctx.globalAlpha = 1;
  }
}

/* MouriAvion.jsx — MODO PC / TABLET: "el jardín desde el cielo".
 * Mouri vuela, dispara solo y se mueve con el dedo o el mouse.
 * 7 días = 7 pecados, el último (Orgullo) con 4 fases.
 * Toda la lógica está en avion-engine.js / avion-bosses.js; aquí solo hay
 * pantalla, control táctil/mouse/teclado y el flujo de diálogos.        */
import { useState, useEffect, useRef, useCallback } from "react";
import { ASSETS, DAY_BG, MUSICA, INTRO_SLIDES, CREDITOS_IMAGENES } from "./config";
import { AV, ETAPAS, JEFES, DIALOGOS_AV, BENDICIONES, TUTORIAL_AV, PERSONAJES_AV } from "./config-avion";
import { crearAudio } from "./audio";
import IntroScreen from "./IntroScreen";
import { Sprite, Overlay, PixelBtn, DialogBox, CreditsOverlay, TutorialOverlay, crearCargadorImagenes, MARRON } from "./ui-comunes";
import { crearEtapa, actualizar, usarEspecial } from "./avion-engine";
import { dibujar } from "./avion-render";

const CARRY_INICIAL = () => ({ hp: AV.vidas, score: 0, power: 1, special: 0, bend: {} });

function mundoNuevo() {
  return {
    scene: INTRO_SLIDES.length ? "intro" : "title",
    prevScene: null, dialog: null, introIdx: 0, creditoIdx: 0,
    day: 1, s: null, carry: CARRY_INICIAL(), carryInicio: CARRY_INICIAL(), carryNext: null,
    handled: false, finT: 0, paused: false,
  };
}

export default function MouriAvion({ onGameComplete }) {
  const mundo = useRef(mundoNuevo());
  const input = useRef({ target: null, kx: 0, ky: 0, bomb: false, drag: null });
  const teclas = useRef({ left: false, right: false, up: false, down: false });
  const audio = useRef(null);
  if (!audio.current) audio.current = crearAudio();
  const A = audio.current;

  const wrapRef = useRef(null);
  const campoRef = useRef(null);
  const canvasRef = useRef(null);
  const imgsRef = useRef(null);
  const loaderRef = useRef(null);
  const sizeRef = useRef({ scale: 1, w: AV.W, h: AV.H });
  const completed = useRef(false);

  const [, setFrame] = useState(0);
  const rerender = useCallback(() => setFrame((f) => (f + 1) % 1e6), []);
  const [size, setSize] = useState({ scale: 1, w: AV.W, h: AV.H });
  const [mute, setMute] = useState(false);
  const [tutAbierto, setTutAbierto] = useState(false);
  const [tutPaso, setTutPaso] = useState(0);

  useEffect(() => () => window.dispatchEvent(new CustomEvent("sidebar:abrir")), []);
  useEffect(() => { A.setMute(mute); }, [mute, A]);
  useEffect(() => () => A.stop(), [A]);

  /* ---------- tamaño del campo (se adapta a PC, tablet y pantallas chicas) ---------- */
  useEffect(() => {
    const calc = () => {
      const el = wrapRef.current; if (!el) return;
      const aw = el.clientWidth || AV.W;
      const ah = Math.min(Math.max(360, window.innerHeight - 150), 900);
      const scale = Math.max(0.35, Math.min(aw / AV.W, ah / AV.H));
      const sz = { scale, w: Math.floor(AV.W * scale), h: Math.floor(AV.H * scale) };
      sizeRef.current = sz; setSize(sz);
    };
    calc();
    let ro;
    if (typeof ResizeObserver !== "undefined" && wrapRef.current) { ro = new ResizeObserver(calc); ro.observe(wrapRef.current); }
    window.addEventListener("resize", calc);
    window.addEventListener("orientationchange", calc);
    return () => { ro && ro.disconnect(); window.removeEventListener("resize", calc); window.removeEventListener("orientationchange", calc); };
  }, []);

  useEffect(() => { loaderRef.current = crearCargadorImagenes(imgsRef.current); }, []);

  /* ---------- diálogos ---------- */
  const startDialog = useCallback((lines, then) => {
    const m = mundo.current;
    if (!lines || !lines.length) { then && then(); return; }
    m.prevScene = m.scene; m.scene = "dialog"; m.dialog = { lines, i: 0, then };
    input.current.drag = null;
  }, []);

  const advanceDialog = useCallback(() => {
    const m = mundo.current;
    if (m.scene !== "dialog" || !m.dialog) return;
    m.dialog.i += 1;
    if (m.dialog.i >= m.dialog.lines.length) {
      const then = m.dialog.then;
      m.dialog = null; m.scene = m.prevScene || "playing";
      then && then();
    }
    rerender();
  }, [rerender]);

  const advanceIntro = useCallback(() => {
    const m = mundo.current; m.introIdx += 1;
    if (m.introIdx >= INTRO_SLIDES.length) m.scene = "title";
    rerender();
  }, [rerender]);

  const advanceCreditos = useCallback(() => {
    const m = mundo.current; m.creditoIdx += 1;
    if (m.creditoIdx >= CREDITOS_IMAGENES.length) m.scene = "victory";
    rerender();
  }, [rerender]);

  /* ---------- flujo ---------- */
  const musicaSegura = useCallback((key) => { if (MUSICA[key]) A.playMusica(key); }, [A]);

  const beginStage = useCallback((n, carry) => {
    const m = mundo.current;
    m.day = n; m.carry = carry; m.carryInicio = carry;
    m.s = crearEtapa(n, carry);
    m.handled = false; m.finT = 0; m.paused = false; m.scene = "stageIntro";
    input.current.target = null; input.current.drag = null;
    rerender();
  }, [rerender]);

  const iniciarJuego = useCallback(() => {
    window.dispatchEvent(new CustomEvent("sidebar:cerrar"));
    A.playMusica("menu");
    // Atajo para probar: agrega ?dia=7 (y &jefe=1, &fase=3) a la dirección de la página.
    let dia = 1, carry = CARRY_INICIAL();
    try {
      const q = new URLSearchParams(window.location.search);
      dia = Math.max(1, Math.min(ETAPAS.length, parseInt(q.get("dia") || "1", 10) || 1));
      for (let d = 1; d < dia; d++) if (BENDICIONES[d]) carry.bend[BENDICIONES[d].id] = true;
      if (q.get("jefe") === "1") carry.saltarAJefe = true;
      carry.debugFase = parseInt(q.get("fase") || "0", 10) || 0;
    } catch (e) { /* sin atajos */ }
    startDialog(DIALOGOS_AV.intro, () => beginStage(dia, carry));
    rerender();
  }, [A, startDialog, beginStage, rerender]);

  const entrarEtapa = useCallback(() => {
    const m = mundo.current;
    const cfg = ETAPAS[m.day - 1];
    A.playMusica(cfg.musica);
    m.scene = "playing";
    startDialog(DIALOGOS_AV.dia[m.day] || [], () => {});
    rerender();
  }, [A, startDialog, rerender]);

  const reiniciarTodo = useCallback(() => {
    A.stop();
    window.dispatchEvent(new CustomEvent("sidebar:abrir"));
    completed.current = false;
    const nuevo = mundoNuevo();
    nuevo.scene = "title"; // no repetir el video de intro
    mundo.current = nuevo;
    rerender();
  }, [A, rerender]);

  const siguienteDia = useCallback(() => {
    const m = mundo.current;
    beginStage(m.day + 1, m.carryNext || m.carry);
  }, [beginStage]);

  const eventoDeEtapa = useCallback((pd) => {
    const m = mundo.current, s = m.s;
    if (pd.clave === "jefe") {
      const lines = s.cfg.id === "orgullo" ? DIALOGOS_AV.orgulloIntro : DIALOGOS_AV.jefe[s.cfg.id];
      startDialog(lines, () => {});
    } else if (pd.clave === "orgulloFase") {
      startDialog(DIALOGOS_AV.orgulloFase[pd.n], () => {
        pd.despues && pd.despues();
        musicaSegura(pd.n === 1 ? "orgulloFase2" : pd.n === 2 ? "orgulloFase3" : "orgulloFase3");
      });
    }
  }, [startDialog, musicaSegura]);

  const victoriaDeEtapa = useCallback(() => {
    const m = mundo.current, s = m.s;
    const ultimo = m.day >= ETAPAS.length;
    // lo que Mouri se lleva al día siguiente
    const bend = { ...s.bend };
    const b = BENDICIONES[m.day];
    if (b) bend[b.id] = true;
    m.carryNext = {
      hp: Math.min(AV.vidas, s.p.hp + 1 + (bend.rosa ? 2 : 0)),
      score: s.score, power: s.p.power, special: 0, bend,
    };
    const lineas = ultimo ? DIALOGOS_AV.orgulloVictoria : DIALOGOS_AV.jefeVencido;
    startDialog(lineas, () => {
      if (!ultimo) { m.scene = "stageClear"; rerender(); return; }
      A.playMusica("victoria");
      startDialog(DIALOGOS_AV.victoria, () => {
        m.creditoIdx = 0;
        if (CREDITOS_IMAGENES.length > 0) { m.scene = "creditos"; A.playMusica("creditos"); } else m.scene = "victory";
        rerender();
      });
    });
  }, [A, startDialog, rerender]);

  /* ---------- teclado ---------- */
  useEffect(() => {
    const down = (e) => {
      const m = mundo.current, k = e.key;
      const enter = k === "Enter" || k === " " || e.code === "Space";
      if (m.scene === "intro") { if (enter) { e.preventDefault(); advanceIntro(); } return; }
      if (m.scene === "dialog") { if (enter) { e.preventDefault(); advanceDialog(); } return; }
      if (m.scene === "creditos") { if (enter) { e.preventDefault(); advanceCreditos(); } return; }
      if (m.scene === "playing") {
        const t = teclas.current;
        if (k === "ArrowLeft" || k === "a" || k === "A") { t.left = true; e.preventDefault(); }
        else if (k === "ArrowRight" || k === "d" || k === "D") { t.right = true; e.preventDefault(); }
        else if (k === "ArrowUp" || k === "w" || k === "W") { t.up = true; e.preventDefault(); }
        else if (k === "ArrowDown" || k === "s" || k === "S") { t.down = true; e.preventDefault(); }
        else if (k === " " || e.code === "Space" || k === "c" || k === "C" || k === "x" || k === "X" || k === "Shift") { if (!e.repeat) input.current.bomb = true; e.preventDefault(); }
        else if (k === "p" || k === "P" || k === "Escape") { m.paused = !m.paused; rerender(); }
        return;
      }
      if (k === "Enter") {
        e.preventDefault();
        if (m.scene === "title") iniciarJuego();
        else if (m.scene === "stageIntro") entrarEtapa();
        else if (m.scene === "stageClear") siguienteDia();
        else if (m.scene === "gameover") beginStage(m.day, m.carryInicio);
        else if (m.scene === "victory") reiniciarTodo();
      }
    };
    const up = (e) => {
      const t = teclas.current, k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") t.left = false;
      if (k === "ArrowRight" || k === "d" || k === "D") t.right = false;
      if (k === "ArrowUp" || k === "w" || k === "W") t.up = false;
      if (k === "ArrowDown" || k === "s" || k === "S") t.down = false;
    };
    const oculto = () => { if (document.hidden && mundo.current.scene === "playing") { mundo.current.paused = true; } };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    document.addEventListener("visibilitychange", oculto);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); document.removeEventListener("visibilitychange", oculto); };
  }, [advanceDialog, advanceIntro, advanceCreditos, iniciarJuego, entrarEtapa, siguienteDia, beginStage, reiniciarTodo, rerender]);

  /* ---------- bucle principal (física + dibujo) ---------- */
  useEffect(() => {
    let raf, last = performance.now(), acc = 0, hudT = 0;
    const STEP = 1 / 60;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const m = mundo.current, s = m.s;

      if (s && m.scene === "playing" && !m.paused) {
        const inp = input.current, t = teclas.current;
        inp.kx = (t.right ? 1 : 0) - (t.left ? 1 : 0);
        inp.ky = (t.down ? 1 : 0) - (t.up ? 1 : 0);
        if (inp.kx || inp.ky) inp.target = null; // el teclado manda si se usa
        acc += dt;
        let n = 0;
        while (acc >= STEP && n < 4) {
          actualizar(s, STEP, inp, A);
          inp.bomb = false; acc -= STEP; n++;
          if (s.pendingDialog || s.terminado) break;
        }
        if (n >= 4) acc = 0;

        if (s.pendingDialog) {
          const pd = s.pendingDialog; s.pendingDialog = null;
          eventoDeEtapa(pd); rerender();
        } else if (s.terminado === "victoria" && !m.handled) {
          m.handled = true; victoriaDeEtapa(); rerender();
        } else if (s.terminado === "derrota") {
          if (!m.handled) { m.handled = true; m.finT = 1.1; A.playMusica("derrota"); }
          m.finT -= dt;
          if (m.finT <= 0) { m.scene = "dialogDerrota"; startDialog(DIALOGOS_AV.derrota, () => { m.scene = "gameover"; rerender(); }); rerender(); }
        }
      } else acc = 0;

      // dibujo
      const cv = canvasRef.current;
      if (cv && s) {
        const sz = sizeRef.current, dpr = Math.min(2, window.devicePixelRatio || 1);
        const pw = Math.floor(sz.w * dpr), ph = Math.floor(sz.h * dpr);
        if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
        const ctx = cv.getContext("2d");
        if (ctx) {
          ctx.setTransform(sz.scale * dpr, 0, 0, sz.scale * dpr, 0, 0);
          try {
            dibujar(ctx, s, { img: (src) => (loaderRef.current ? loaderRef.current(src) : null) });
          } catch (err) { /* un fallo de dibujo nunca debe tumbar la página */ }
        }
      } else if (cv) {
        const ctx = cv.getContext("2d"); if (ctx) ctx.clearRect(0, 0, cv.width, cv.height);
      }

      hudT += dt;
      if (hudT > 0.1) { hudT = 0; rerender(); }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [A, eventoDeEtapa, victoriaDeEtapa, startDialog, rerender]);

  /* ---------- fin del juego ---------- */
  useEffect(() => {
    const m = mundo.current;
    if (m.scene === "victory" && !completed.current) {
      completed.current = true;
      if (typeof onGameComplete === "function") onGameComplete();
    }
  });

  /* ---------- mouse / dedo ---------- */
  const aLogico = (e) => {
    const r = campoRef.current.getBoundingClientRect();
    const sc = sizeRef.current.scale;
    return { x: (e.clientX - r.left) / sc, y: (e.clientY - r.top) / sc };
  };
  const onPointerDown = (e) => {
    const m = mundo.current;
    if (m.scene !== "playing" || !m.s || m.paused) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const pt = aLogico(e), p = m.s.p;
    if (e.pointerType === "mouse") input.current.target = pt;
    else { input.current.drag = { px: pt.x, py: pt.y, sx: p.x, sy: p.y }; input.current.target = { x: p.x, y: p.y }; }
  };
  const onPointerMove = (e) => {
    const m = mundo.current;
    if (m.scene !== "playing" || !m.s || m.paused) return;
    const pt = aLogico(e);
    if (e.pointerType === "mouse") { input.current.target = pt; return; }
    const d = input.current.drag; if (!d) return;
    input.current.target = { x: d.sx + (pt.x - d.px) * AV.sensibilidadDedo, y: d.sy + (pt.y - d.py) * AV.sensibilidadDedo };
  };
  const onPointerUp = (e) => {
    if (e.pointerType !== "mouse") { input.current.drag = null; input.current.target = null; }
  };

  /* ====================== RENDER ====================== */
  const m = mundo.current, s = m.s;
  const cfg = ETAPAS[Math.min(m.day, ETAPAS.length) - 1];
  const bgImg = DAY_BG[m.day];
  const hpTotal = AV.vidas;
  const enJuego = m.scene === "playing";
  const usable = s && s.special >= 100;
  const bendS = (s && s.bend) || m.carry.bend || {};

  return (
    <div ref={wrapRef} style={{ width: "100%", fontFamily: "system-ui, sans-serif", userSelect: "none", WebkitUserSelect: "none" }}>
      <style>{`
        @keyframes av-pulse{0%,100%{box-shadow:0 0 6px #ffcf4a}50%{box-shadow:0 0 22px #ffcf4a}}
        @keyframes av-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      `}</style>
      <div ref={imgsRef} aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0.01, pointerEvents: "none" }} />

      {m.scene !== "intro" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", gap: 10, flexWrap: "wrap", color: "#4E3A25", fontWeight: 700, fontSize: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>🌱 El Jardín de los Recuerdos</span>
            <span>⭐ {s ? s.score : 0}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {s && enJuego && <span>{Array.from({ length: hpTotal }).map((_, i) => <span key={i} style={{ opacity: i < s.p.hp ? 1 : 0.2 }}>❤️</span>)}</span>}
            {["stageIntro", "playing", "stageClear", "gameover", "dialog"].includes(m.scene) && <span>📅 Día {m.day}/7 — {cfg.nombre}</span>}
            {enJuego && <button onClick={() => { m.paused = !m.paused; rerender(); }} style={{ background: "#FFF8E8", border: `2px solid ${MARRON}`, borderRadius: 10, padding: "2px 10px", cursor: "pointer" }}>{m.paused ? "▶" : "⏸"}</button>}
            <button onClick={() => setMute((v) => !v)} style={{ background: "#FFF8E8", border: `2px solid ${MARRON}`, borderRadius: 10, padding: "2px 10px", cursor: "pointer" }}>{mute ? "🔇" : "🔊"}</button>
          </div>
        </div>
      )}

      {/* barra de Recuerdos + bendiciones */}
      {s && enJuego && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px 6px", maxWidth: size.w + 24, margin: "0 auto" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#4E3A25" }}>Recuerdos</span>
          <div style={{ flex: 1, height: 10, background: "#0000002a", border: `2px solid ${MARRON}`, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${s.special}%`, height: "100%", background: usable ? "#ffd24a" : "#c9a24a" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: usable ? "#e0a500" : "#4E3A25" }}>{usable ? "¡LISTO!" : `${Math.floor(s.special)}%`}</span>
          <span style={{ fontSize: 16 }}>{Object.keys(bendS).map((k) => ({ girasol: "🌻", rosa: "🌹", lavanda: "💜", margarita: "🌼" }[k])).join("")}</span>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", background: "#0e0f1c", borderTop: `4px solid ${MARRON}`, borderBottom: `4px solid ${MARRON}`, backgroundImage: bgImg ? `linear-gradient(rgba(5,5,15,.6),rgba(5,5,15,.6)), url(${bgImg})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div
          ref={campoRef}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          style={{
            position: "relative", width: size.w, height: size.h, overflow: "hidden", touchAction: "none",
            cursor: enJuego ? "none" : "default",
            backgroundColor: "#0b0d1e",
            backgroundImage: bgImg
              ? `linear-gradient(rgba(6,6,18,.38),rgba(6,6,18,.38)), url(${bgImg})`
              : `linear-gradient(180deg,#0b0d1e 0%,${cfg.color}55 100%)`,
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        >
          {m.scene === "intro" && <IntroScreen slide={INTRO_SLIDES[m.introIdx]} index={m.introIdx} total={INTRO_SLIDES.length} onNext={advanceIntro} />}
          <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: m.scene === "intro" ? "none" : "block" }} />

          {enJuego && (
            <button
              onPointerDown={(e) => { e.stopPropagation(); input.current.bomb = true; }}
              aria-label="Rayo del Recuerdo"
              style={{
                position: "absolute", right: 10, bottom: 10, width: 62, height: 62, borderRadius: "50%",
                background: usable ? "#FFE39A" : "rgba(255,248,232,.55)", border: "3px solid #786F49", fontSize: 28,
                cursor: "pointer", touchAction: "none", animation: usable ? "av-pulse 1s infinite" : "none",
              }}
            >⚡</button>
          )}

          {enJuego && m.paused && (
            <Overlay bg="rgba(10,10,20,.7)" z={35}>
              <h2 style={{ color: "#FFF8E8", margin: 0 }}>⏸ Pausa</h2>
              <PixelBtn onClick={() => { m.paused = false; rerender(); }}>▶ Continuar</PixelBtn>
            </Overlay>
          )}

          {m.scene === "title" && (
            <Overlay bg="rgba(20,30,40,.7)">
              <div style={{ fontSize: 80, animation: "av-float 2.4s infinite" }}><Sprite asset={ASSETS.mouriVolador} size={90} /></div>
              <h2 style={{ margin: "6px 0", color: "#FFF8E8", fontSize: 26 }}>El Jardín de los Recuerdos</h2>
              <p style={{ color: "#e8e0cc", fontSize: 14, maxWidth: 360, margin: "4px auto" }}>Siete días, siete pecados. Ahora Mouri vuela: tú lo guías con el dedo o el mouse.</p>
              <div style={{ fontSize: 12, marginTop: 6, color: "#d8d0bc", lineHeight: 1.7 }}>
                <div>👆 Arrastra el dedo / mueve el mouse · flechas o WASD</div>
                <div>✨ Dispara solo · <b>ESPACIO</b> o ⚡ = Rayo del Recuerdo</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <PixelBtn onClick={iniciarJuego}>▶ Comenzar</PixelBtn>
                <PixelBtn onClick={() => { setTutPaso(0); setTutAbierto(true); }}>❔ Cómo jugar</PixelBtn>
              </div>
            </Overlay>
          )}

          {m.scene === "stageIntro" && (
            <Overlay bg={cfg.id === "orgullo" ? "rgba(15,12,25,.85)" : "rgba(20,30,40,.7)"}>
              <p style={{ color: "#ffd88a", fontSize: 13, letterSpacing: 3, margin: 0 }}>DÍA {cfg.n} DE 7</p>
              <h2 style={{ margin: "4px 0", color: "#FFF8E8", fontSize: 24 }}>{cfg.nombre}</h2>
              <div style={{ fontSize: 56, margin: "6px 0" }}><Sprite asset={JEFES[cfg.id].sprite} size={60} /></div>
              {cfg.id === "orgullo"
                ? <p style={{ color: "#e6b8b8", fontSize: 13, maxWidth: 300 }}>⚠ Jefe final: 4 fases. Tus corazones NO se reinician entre fases.</p>
                : <p style={{ color: "#e8e0cc", fontSize: 13 }}>Jefe: {JEFES[cfg.id].pecado} — {JEFES[cfg.id].nombre}</p>}
              {BENDICIONES[cfg.n - 1] && <div style={{ display: "inline-block", background: "#FFE39A", color: "#5C4A2C", fontWeight: 700, fontSize: 12, borderRadius: 999, padding: "4px 12px", margin: "6px 0" }}>{BENDICIONES[cfg.n - 1].icono} {BENDICIONES[cfg.n - 1].nombre}: {BENDICIONES[cfg.n - 1].texto}</div>}
              <PixelBtn onClick={entrarEtapa}>{cfg.id === "orgullo" ? "👁️ ¡Enfrentar al Orgullo!" : "▶ ¡A volar!"}</PixelBtn>
            </Overlay>
          )}

          {m.scene === "stageClear" && (
            <Overlay bg="rgba(255,240,200,.9)">
              <div style={{ fontSize: 46 }}>🌷✨</div>
              <h2 style={{ margin: "4px 0", color: "#4E3A25" }}>¡Día {m.day} completado!</h2>
              <p style={{ color: "#5C4A2C", fontSize: 14 }}>Puntos: {s ? s.score : 0}</p>
              {BENDICIONES[m.day] && (
                <div style={{ display: "inline-block", background: "#FFF8E8", border: `2px solid ${MARRON}`, color: "#5C4A2C", fontWeight: 700, fontSize: 13, borderRadius: 16, padding: "8px 14px", margin: "6px 0", maxWidth: 300 }}>
                  {BENDICIONES[m.day].icono} Flor recuperada: {BENDICIONES[m.day].nombre}<br /><span style={{ fontWeight: 500 }}>{BENDICIONES[m.day].texto}</span>
                </div>
              )}
              <p style={{ color: "#5C4A2C", fontSize: 13 }}>Corazones para mañana: {m.carryNext ? m.carryNext.hp : "-"}/{AV.vidas}</p>
              <PixelBtn onClick={siguienteDia}>▶ Continuar al Día {m.day + 1}</PixelBtn>
            </Overlay>
          )}

          {m.scene === "creditos" && <CreditsOverlay img={CREDITOS_IMAGENES[m.creditoIdx]} onNext={advanceCreditos} step={m.creditoIdx + 1} total={CREDITOS_IMAGENES.length} />}

          {m.scene === "victory" && (
            <Overlay bg="rgba(255,242,205,.94)">
              <div style={{ fontSize: 52 }}>🌸✨🌼</div>
              <h2 style={{ margin: "6px 0", color: "#4E3A25" }}>¡Salvaste el Jardín de los Recuerdos!</h2>
              <div style={{ display: "inline-flex", gap: 8, background: "#FFF8E8", border: `2px solid ${MARRON}`, color: "#5C4A2C", fontWeight: 700, borderRadius: 999, padding: "8px 16px", margin: "8px 0" }}>🏅 Insignia obtenida: Guardián del Jardín</div>
              <p style={{ color: "#5C4A2C", fontSize: 13 }}>Puntos finales: {s ? s.score : 0}</p>
              <PixelBtn onClick={reiniciarTodo}>↺ Jugar de nuevo</PixelBtn>
            </Overlay>
          )}

          {m.scene === "gameover" && (
            <Overlay bg="rgba(18,15,28,.9)">
              <div style={{ fontSize: 48 }}>🥀</div>
              <h2 style={{ margin: "6px 0", color: "#FFF8E8" }}>El jardín se apagó...</h2>
              <p style={{ color: "#bcae9a", fontSize: 13 }}>Llegaste al Día {m.day}. Puntos: {s ? s.score : 0}</p>
              <PixelBtn onClick={() => beginStage(m.day, m.carryInicio)}>↺ Reintentar este día</PixelBtn>
              <PixelBtn onClick={reiniciarTodo} small>Empezar de nuevo</PixelBtn>
            </Overlay>
          )}

          {m.scene === "dialog" && m.dialog && (
            <DialogBox line={m.dialog.lines[m.dialog.i]} onNext={advanceDialog} step={m.dialog.i + 1} total={m.dialog.lines.length} personajes={PERSONAJES_AV} />
          )}
        </div>
      </div>

      {tutAbierto && (
        <TutorialOverlay pasos={TUTORIAL_AV} indice={tutPaso}
          onAnterior={() => setTutPaso((p) => Math.max(0, p - 1))}
          onSiguiente={() => setTutPaso((p) => Math.min(TUTORIAL_AV.length - 1, p + 1))}
          onCerrar={() => setTutAbierto(false)} />
      )}
    </div>
  );
}

/* MouriAlmas.jsx — MODO CELULAR: "Mouri, guía de almas".
 * Otra historia de Mouri el cuervo: acompaña el alma de cinco mascotas
 * por la noche hasta el amanecer. Se juega con UN dedo: desliza para
 * volar, toca para graznar. Sin botones.                                */
import { useState, useEffect, useRef, useCallback } from "react";
import { ASSETS, MUSICA } from "./config";
import { ALMAS, CAPITULOS_ALMAS, DIALOGOS_ALMAS, PERSONAJES_ALMAS, TUTORIAL_ALMAS } from "./config-avion";
import { crearAudio } from "./audio";
import { Sprite, Overlay, PixelBtn, DialogBox, TutorialOverlay, crearCargadorImagenes, MARRON } from "./ui-comunes";
import { M, crearCapitulo, actualizar } from "./almas-engine";
import { dibujarAlmas } from "./almas-render";

function mundoNuevo() {
  return { scene: "title", prevScene: null, dialog: null, cap: 0, a: null, totRec: 0, totGen: 0, handled: false, finT: 0, paused: false, resultado: null };
}

export default function MouriAlmas({ onGameComplete }) {
  const mundo = useRef(mundoNuevo());
  const input = useRef({ target: null, tap: false, drag: null });
  const audio = useRef(null);
  if (!audio.current) audio.current = crearAudio();
  const A = audio.current;

  const wrapRef = useRef(null);
  const campoRef = useRef(null);
  const canvasRef = useRef(null);
  const imgsRef = useRef(null);
  const loaderRef = useRef(null);
  const sizeRef = useRef({ scale: 1, w: M.W, h: M.H });
  const horizRef = useRef(false);
  const completed = useRef(false);

  const [, setFrame] = useState(0);
  const rerender = useCallback(() => setFrame((f) => (f + 1) % 1e6), []);
  const [size, setSize] = useState({ scale: 1, w: M.W, h: M.H });
  const [horizontal, setHorizontal] = useState(false);
  const [mute, setMute] = useState(false);
  const [tutAbierto, setTutAbierto] = useState(false);
  const [tutPaso, setTutPaso] = useState(0);

  useEffect(() => () => window.dispatchEvent(new CustomEvent("sidebar:abrir")), []);
  useEffect(() => { A.setMute(mute); }, [mute, A]);
  useEffect(() => () => A.stop(), [A]);
  useEffect(() => { loaderRef.current = crearCargadorImagenes(imgsRef.current); }, []);

  /* ---------- tamaño (vertical; si se gira, pedimos volver a vertical) ---------- */
  useEffect(() => {
    const calc = () => {
      const el = wrapRef.current; if (!el) return;
      const aw = el.clientWidth || M.W;
      const ah = Math.max(300, window.innerHeight - 60);
      const horiz = window.innerWidth > window.innerHeight * 1.15 && window.innerHeight < 560;
      horizRef.current = horiz; setHorizontal(horiz);
      const scale = Math.max(0.4, Math.min(aw / M.W, ah / M.H));
      const sz = { scale, w: Math.floor(M.W * scale), h: Math.floor(M.H * scale) };
      sizeRef.current = sz; setSize(sz);
    };
    calc();
    let ro;
    if (typeof ResizeObserver !== "undefined" && wrapRef.current) { ro = new ResizeObserver(calc); ro.observe(wrapRef.current); }
    window.addEventListener("resize", calc);
    window.addEventListener("orientationchange", calc);
    return () => { ro && ro.disconnect(); window.removeEventListener("resize", calc); window.removeEventListener("orientationchange", calc); };
  }, []);

  /* ---------- diálogos ---------- */
  const startDialog = useCallback((lines, then) => {
    const m = mundo.current;
    if (!lines || !lines.length) { then && then(); return; }
    m.prevScene = m.scene; m.scene = "dialog"; m.dialog = { lines, i: 0, then };
    input.current.drag = null; input.current.target = null;
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

  const musica = useCallback((key) => { if (MUSICA[key]) A.playMusica(key); }, [A]);

  /* ---------- flujo ---------- */
  const beginCap = useCallback((i) => {
    const m = mundo.current;
    m.cap = i; m.a = crearCapitulo(i); m.handled = false; m.finT = 0; m.paused = false; m.scene = "capIntro";
    input.current.target = null; input.current.drag = null;
    rerender();
  }, [rerender]);

  const iniciar = useCallback(() => {
    window.dispatchEvent(new CustomEvent("sidebar:cerrar"));
    musica("menu");
    const m = mundo.current;
    m.totRec = 0; m.totGen = 0;
    // Atajo para probar: agrega ?alma=5 a la dirección de la página.
    let idx = 0;
    try { idx = Math.max(0, Math.min(CAPITULOS_ALMAS.length - 1, (parseInt(new URLSearchParams(window.location.search).get("alma") || "1", 10) || 1) - 1)); } catch (e) { /* sin atajo */ }
    startDialog(DIALOGOS_ALMAS.intro, () => beginCap(idx));
    rerender();
  }, [musica, startDialog, beginCap, rerender]);

  const volar = useCallback(() => {
    const m = mundo.current, cfg = CAPITULOS_ALMAS[m.cap];
    musica("noche");
    m.scene = "playing";
    startDialog(cfg.intro, () => {});
    rerender();
  }, [musica, startDialog, rerender]);

  const reiniciarTodo = useCallback(() => {
    A.stop();
    window.dispatchEvent(new CustomEvent("sidebar:abrir"));
    completed.current = false;
    mundo.current = mundoNuevo();
    rerender();
  }, [A, rerender]);

  const capitulo_completo = useCallback(() => {
    const m = mundo.current, a = m.a, cfg = a.cfg;
    const ratio = a.recogidos / Math.max(1, a.generados);
    m.totRec += a.recogidos; m.totGen += a.generados;
    m.resultado = { rec: a.recogidos, gen: a.generados, completo: ratio >= 0.45 };
    startDialog(m.resultado.completo ? cfg.fin : cfg.finParcial, () => { m.scene = "capClear"; rerender(); });
  }, [startDialog, rerender]);

  const siguiente = useCallback(() => {
    const m = mundo.current;
    if (m.cap + 1 < CAPITULOS_ALMAS.length) { beginCap(m.cap + 1); return; }
    musica("victoria");
    startDialog(DIALOGOS_ALMAS.victoria, () => { m.scene = "victory"; rerender(); });
    rerender();
  }, [beginCap, musica, startDialog, rerender]);

  /* ---------- teclado (para probar en computador) ---------- */
  useEffect(() => {
    const down = (e) => {
      const m = mundo.current, k = e.key;
      const enter = k === "Enter" || k === " " || e.code === "Space";
      if (m.scene === "dialog" && enter) { e.preventDefault(); advanceDialog(); }
      else if (m.scene === "title" && k === "Enter") iniciar();
      else if (m.scene === "capIntro" && k === "Enter") volar();
      else if (m.scene === "capClear" && k === "Enter") siguiente();
      else if (m.scene === "playing" && (k === " " || e.code === "Space")) { e.preventDefault(); input.current.tap = true; }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [advanceDialog, iniciar, volar, siguiente]);

  /* ---------- bucle ---------- */
  useEffect(() => {
    let raf, last = performance.now(), acc = 0, hudT = 0;
    const STEP = 1 / 60;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const m = mundo.current, a = m.a;

      if (a && m.scene === "playing" && !m.paused && !horizRef.current) {
        acc += dt;
        let n = 0;
        while (acc >= STEP && n < 4) { actualizar(a, STEP, input.current, A); acc -= STEP; n++; if (a.terminado) break; }
        if (n >= 4) acc = 0;
        if (a.terminado === "victoria" && !m.handled) { m.handled = true; capitulo_completo(); rerender(); }
        else if (a.terminado === "derrota") {
          if (!m.handled) { m.handled = true; m.finT = 0.9; }
          m.finT -= dt;
          if (m.finT <= 0) { m.scene = "pre"; startDialog(DIALOGOS_ALMAS.derrota, () => { m.scene = "gameover"; rerender(); }); rerender(); }
        }
      } else acc = 0;

      const cv = canvasRef.current;
      if (cv) {
        const sz = sizeRef.current, dpr = Math.min(2, window.devicePixelRatio || 1);
        const pw = Math.floor(sz.w * dpr), ph = Math.floor(sz.h * dpr);
        if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
        const ctx = cv.getContext("2d");
        if (ctx) {
          ctx.setTransform(sz.scale * dpr, 0, 0, sz.scale * dpr, 0, 0);
          if (a) { try { dibujarAlmas(ctx, a, { img: (src) => (loaderRef.current ? loaderRef.current(src) : null) }); } catch (err) { /* no tumbar la página */ } }
          else {
            // fondo de la pantalla de título
            const g = ctx.createLinearGradient(0, 0, 0, M.H);
            ALMAS.fondoTitulo.forEach((c, i) => g.addColorStop(i / (ALMAS.fondoTitulo.length - 1), c));
            ctx.fillStyle = g; ctx.fillRect(0, 0, M.W, M.H);
            ctx.fillStyle = "#fff";
            for (let i = 0; i < 50; i++) { ctx.globalAlpha = 0.25 + ((i * 37) % 10) / 20; ctx.fillRect((i * 97) % M.W, (i * 53 + now * 0.01 * (1 + (i % 3))) % M.H, 1.5, 3); }
            ctx.globalAlpha = 1;
          }
        }
      }
      hudT += dt;
      if (hudT > 0.1) { hudT = 0; rerender(); }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [A, capitulo_completo, startDialog, rerender]);

  useEffect(() => {
    const m = mundo.current;
    if (m.scene === "victory" && !completed.current) {
      completed.current = true;
      if (typeof onGameComplete === "function") onGameComplete();
    }
  });

  /* ---------- un dedo: deslizar = volar, toque corto = graznar ---------- */
  const aLogico = (e) => {
    const sc = sizeRef.current.scale;
    return { x: e.clientX / sc, y: e.clientY / sc };
  };
  const onPointerDown = (e) => {
    const m = mundo.current;
    if (m.scene !== "playing" || !m.a || m.paused) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const pt = aLogico(e), mo = m.a.m;
    input.current.drag = { px: pt.x, py: pt.y, sx: mo.x, sy: mo.y, t0: performance.now(), moved: 0 };
    input.current.target = { x: mo.x, y: mo.y };
  };
  const onPointerMove = (e) => {
    const m = mundo.current, d = input.current.drag;
    if (m.scene !== "playing" || !d) return;
    const pt = aLogico(e);
    const dx = pt.x - d.px, dy = pt.y - d.py;
    d.moved = Math.max(d.moved, Math.hypot(dx, dy));
    input.current.target = { x: d.sx + dx * 1.35, y: d.sy + dy * 1.35 };
  };
  const onPointerUp = () => {
    const d = input.current.drag;
    if (d && performance.now() - d.t0 < 260 && d.moved < 10) input.current.tap = true;
    input.current.drag = null;
  };

  /* ====================== RENDER ====================== */
  const m = mundo.current, a = m.a;
  const cfg = CAPITULOS_ALMAS[Math.min(m.cap, CAPITULOS_ALMAS.length - 1)];
  const enJuego = m.scene === "playing";
  const prog = a ? Math.min(1, a.t / a.dur) : 0;
  const hud = a && ["playing", "dialog", "capIntro", "capClear", "gameover", "pre"].includes(m.scene);

  return (
    <div ref={wrapRef} style={{ width: "100%", fontFamily: "system-ui, sans-serif", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}>
      <style>{`
        @keyframes al-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes al-pulso{0%,100%{opacity:.5}50%{opacity:1}}
      `}</style>
      <div ref={imgsRef} aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0.01, pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "center", background: "#07091a" }}>
        <div
          ref={campoRef}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          style={{ position: "relative", width: size.w, height: size.h, overflow: "hidden", touchAction: "none", overscrollBehavior: "contain", background: "#07091a" }}
        >
          <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />

          {/* HUD dentro del campo */}
          {hud && (
            <div style={{ position: "absolute", top: 8, left: 10, right: 10, display: "flex", alignItems: "center", gap: 8, pointerEvents: "none", zIndex: 5 }}>
              <div style={{ display: "flex", gap: 2, fontSize: 16 }}>
                {Array.from({ length: M.luces }).map((_, i) => <span key={i} style={{ opacity: i < a.luces ? 1 : 0.2, filter: i < a.luces ? "none" : "grayscale(1)" }}>🕯️</span>)}
              </div>
              <div style={{ flex: 1, position: "relative", height: 8, background: "rgba(255,255,255,.18)", borderRadius: 999 }}>
                <div style={{ width: `${prog * 100}%`, height: "100%", background: cfg.color, borderRadius: 999, opacity: 0.8 }} />
                <span style={{ position: "absolute", left: `calc(${prog * 100}% - 9px)`, top: -8, fontSize: 18 }}>{cfg.emoji}</span>
                <span style={{ position: "absolute", right: -4, top: -9, fontSize: 18 }}>🌅</span>
              </div>
              <button
                onPointerDown={(e) => e.stopPropagation()} onClick={() => setMute((v) => !v)}
                style={{ pointerEvents: "auto", background: "rgba(0,0,0,.35)", border: "none", color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: 14 }}
              >{mute ? "🔇" : "🔊"}</button>
            </div>
          )}

          {m.scene === "title" && (
            <Overlay bg="rgba(0,0,0,.15)">
              <div style={{ animation: "al-float 2.6s infinite" }}><Sprite asset={ASSETS.mouriVolador} size={96} /></div>
              <h2 style={{ margin: "8px 0 2px", color: "#FFF8E8", fontSize: 26, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{ALMAS.titulo}</h2>
              <p style={{ color: "#d9d2ee", fontSize: 14, maxWidth: 280, margin: "4px auto 10px" }}>{ALMAS.subtitulo}</p>
              <div style={{ color: "#c9c2e0", fontSize: 12, lineHeight: 1.7 }}>
                <div>👆 Desliza el dedo para volar</div>
                <div>🔔 Toca la pantalla para graznar</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
                <PixelBtn onClick={iniciar}>▶ Comenzar</PixelBtn>
                <PixelBtn onClick={() => { setTutPaso(0); setTutAbierto(true); }}>❔ Cómo jugar</PixelBtn>
              </div>
            </Overlay>
          )}

          {m.scene === "capIntro" && (
            <Overlay bg="rgba(5,6,20,.72)">
              <p style={{ color: "#ffd88a", fontSize: 12, letterSpacing: 3, margin: 0 }}>ALMA {m.cap + 1} DE {CAPITULOS_ALMAS.length}</p>
              <div style={{ fontSize: 70, margin: "10px 0", filter: `drop-shadow(0 0 18px ${cfg.color})`, animation: "al-float 2.6s infinite" }}>{cfg.emoji}</div>
              <h2 style={{ margin: "2px 0 8px", color: "#FFF8E8", fontSize: 22 }}>{cfg.nombre}</h2>
              <p style={{ color: "#d9d2ee", fontSize: 13, maxWidth: 260, lineHeight: 1.5 }}>{cfg.ayuda}</p>
              <PixelBtn onClick={volar}>🕊️ ¡A volar!</PixelBtn>
            </Overlay>
          )}

          {m.scene === "capClear" && m.resultado && (
            <Overlay bg="rgba(255,244,214,.92)">
              <div style={{ fontSize: 56 }}>{cfg.emoji}🌅</div>
              <h2 style={{ margin: "6px 0", color: "#4E3A25", fontSize: 20 }}>{cfg.nombre.split(",")[0]} llegó a la luz</h2>
              <p style={{ color: "#5C4A2C", fontSize: 14 }}>Recuerdos recogidos: <b>{m.resultado.rec}</b> de {m.resultado.gen}</p>
              <p style={{ color: "#8A7A63", fontSize: 12, maxWidth: 260 }}>{m.resultado.completo ? "Su historia quedó completa. 💛" : "Algunos recuerdos se quedaron en la noche, pero lo importante viaja con ella."}</p>
              <PixelBtn onClick={siguiente}>{m.cap + 1 < CAPITULOS_ALMAS.length ? "▶ Siguiente alma" : "🌅 Ver el amanecer"}</PixelBtn>
            </Overlay>
          )}

          {m.scene === "victory" && (
            <Overlay bg="rgba(255,238,190,.94)">
              <div style={{ fontSize: 52 }}>🌅🕊️✨</div>
              <h2 style={{ margin: "6px 0", color: "#4E3A25", fontSize: 21 }}>Todas llegaron al amanecer</h2>
              <div style={{ display: "inline-flex", gap: 8, background: "#FFF8E8", border: `2px solid ${MARRON}`, color: "#5C4A2C", fontWeight: 700, borderRadius: 999, padding: "8px 16px", margin: "8px 0", fontSize: 13 }}>🏅 Insignia: Guardián del Jardín</div>
              <p style={{ color: "#5C4A2C", fontSize: 13 }}>Recuerdos salvados: {m.totRec} de {m.totGen}</p>
              <PixelBtn onClick={reiniciarTodo}>↺ Volver a volar</PixelBtn>
            </Overlay>
          )}

          {m.scene === "gameover" && (
            <Overlay bg="rgba(10,8,22,.9)">
              <div style={{ fontSize: 48 }}>🕯️</div>
              <h2 style={{ margin: "6px 0", color: "#FFF8E8", fontSize: 20 }}>La luz de Mouri se apagó...</h2>
              <p style={{ color: "#bcae9a", fontSize: 13 }}>{cfg.nombre} aún te espera.</p>
              <PixelBtn onClick={() => beginCap(m.cap)}>↺ Intentarlo otra vez</PixelBtn>
              <PixelBtn onClick={reiniciarTodo} small>Volver al inicio</PixelBtn>
            </Overlay>
          )}

          {m.scene === "dialog" && m.dialog && (
            <DialogBox line={m.dialog.lines[m.dialog.i]} onNext={advanceDialog} step={m.dialog.i + 1} total={m.dialog.lines.length} personajes={PERSONAJES_ALMAS} />
          )}

          {horizontal && (
            <Overlay bg="rgba(5,6,20,.92)" z={80}>
              <div style={{ fontSize: 46, animation: "al-pulso 1.4s infinite" }}>📱↻</div>
              <p style={{ color: "#FFF8E8", fontWeight: 700 }}>Gira tu celular a vertical</p>
              <p style={{ color: "#bcb6d6", fontSize: 12 }}>Mouri vuela mejor de pie.</p>
            </Overlay>
          )}
        </div>
      </div>

      {tutAbierto && (
        <TutorialOverlay pasos={TUTORIAL_ALMAS} indice={tutPaso}
          onAnterior={() => setTutPaso((p) => Math.max(0, p - 1))}
          onSiguiente={() => setTutPaso((p) => Math.min(TUTORIAL_ALMAS.length - 1, p + 1))}
          onCerrar={() => setTutAbierto(false)} />
      )}
    </div>
  );
}

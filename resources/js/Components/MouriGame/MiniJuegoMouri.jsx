import { useState, useEffect, useRef, useCallback } from "react";
import {
  ASSETS, FLOOR_IMG, DAY_BG, DIALOGOS, TUTORIAL_PASOS, T,
  INTRO_SLIDES, CREDITOS_IMAGENES, DAYS, PERSONAJES, FINAL_IMG,
} from "./config";
import { crearAudio } from "./audio";
import {
  clamp, makeWorld, say, setScene, movePhysics, flowerPassives, tickNeeds,
  spawnShadow, tickShadows, tickOrbs, alive, has, healthy, gardenLight,
  canShoot, canJump, canSpecial,
} from "./helpers";
import { spawnMiniBoss, runMiniBoss } from "./minibosses";
import { initIra, tickIra } from "./bosses-ira";
import { initOrgullo, tickOrgullo, SIMBOLO_ICONO } from "./bosses-orgullo";
import IntroScreen from "./IntroScreen";

const dayCfg = (n) => DAYS.find((d) => d.n === n);
const brown = "#786F49";

export default function MiniJuegoMouri({ onGameComplete }) {
  const world = useRef(makeWorld());
  const keys = useRef({ left: false, right: false, shoot: false, shoot2: false });
  const audio = useRef(null);
  if (!audio.current) audio.current = crearAudio();
  const [, setFrame] = useState(0);
  const [mute, setMute] = useState(false);
  const [tutorialAbierto, setTutorialAbierto] = useState(false);
  const [tutPaso, setTutPaso] = useState(0);
  const completed = useRef(false);
  const rerender = useCallback(() => setFrame((f) => (f + 1) % 1e6), []);
  const A = audio.current;

  useEffect(() => {
    return () => window.dispatchEvent(new CustomEvent("sidebar:abrir"));
  }, []);

  /* ---------- diálogos ---------- */
  const startDialog = useCallback((lines, then) => {
    const w = world.current;
    if (!lines || !lines.length) { then && then(); return; }
    w.prevScene = w.scene;
    w.scene = "dialog";
    w.dialog = { lines, i: 0, then };
  }, []);

  const advanceDialog = useCallback(() => {
    const w = world.current;
    if (w.scene !== "dialog" || !w.dialog) return;
    w.dialog.i += 1;
    if (w.dialog.i >= w.dialog.lines.length) {
      const then = w.dialog.then;
      w.dialog = null;
      w.scene = w.prevScene || "playing";
      then && then();
    }
    rerender();
  }, [rerender]);

  const advanceCreditos = useCallback(() => {
    const w = world.current;
    w.creditoIdx += 1;
    if (w.creditoIdx >= CREDITOS_IMAGENES.length) setScene(w, "victory");
    rerender();
  }, [rerender]);

  const advanceIntro = useCallback(() => {
    const w = world.current;
    w.introIdx += 1;
    if (w.introIdx >= INTRO_SLIDES.length) w.scene = "title";
    rerender();
  }, [rerender]);

  /* ---------- acciones ---------- */
  const doJump = useCallback(() => {
    const w = world.current;
    if (w.scene !== "playing" || !canJump(w)) return;
    if (w.mouri.onGround) { w.mouri.vy = T.jumpV; w.mouri.onGround = false; }
  }, []);

  const doCare = useCallback(() => {
    const w = world.current;
    if (w.scene !== "playing") return;
    let best = null, bd = Infinity;
    for (const f of w.flowers) { const d = Math.abs(f.x - w.mouri.x); if (d < T.reach && d < bd) { bd = d; best = f; } }
    if (!best) return;
    if (best.health <= 0) { best.health = T.reviveHealth; best.need = null; w.score += 25; A.playSfx("curar"); }
    else if (best.need) { best.need = null; best.health = clamp(best.health + 28, 0, T.flowerMax); w.score += 30; A.playSfx("curar"); }
    else if (best.health < T.flowerMax) { best.health = clamp(best.health + 18, 0, T.flowerMax); w.score += 5; A.playSfx("curar"); }
  }, [A]);

  const doSpecial = useCallback(() => {
    const w = world.current;
    if (w.scene !== "playing" || !canSpecial(w)) return;
    if (w.special < 100) return;
    const h = healthy(w);
    w.special = 0; w.flash = 0.5; w.shadows = []; w.orbs = [];
    A.playSfx("especial");
    if (w.mini) { w.mini.hp -= 12 + h * 3; say(w, "¡Rayo del Recuerdo!", 2); }
    else { for (const f of w.flowers) if (f.health > 0) f.health = clamp(f.health + 25, 0, T.flowerMax); say(w, "¡Rayo del Recuerdo! El jardín brilla.", 2); }
  }, [A]);

  /* ---------- flujo de días ---------- */
  const beginDayFlow = useCallback((n) => {
    const w = world.current;
    if (n > 7) { toVictory(w, A, startDialog, rerender); return; }
    beginDay(w, n);
    rerender();
  }, [A, rerender]);

  const iniciarJuego = useCallback(() => {
    window.dispatchEvent(new CustomEvent("sidebar:cerrar"));
    A.playMusica("menu");
    startDialog(DIALOGOS.intro, () => beginDayFlow(1));
    rerender();
  }, [A, startDialog, beginDayFlow, rerender]);

  const enterDay = useCallback(() => {
    const w = world.current;
    const cfg = dayCfg(w.day);
    if (cfg.carrera) {
      initIra(w);
      w.scene = "carrera";
      A.playMusica("ira");
      startDialog(DIALOGOS.iraIntro, () => {});
    } else if (cfg.orgullo) {
      initOrgullo(w);
      w.scene = "orgullo";
      A.playMusica("orgullo");
      startDialog(DIALOGOS.orgulloIntro, () => {});
    } else {
      w.scene = "playing";
      A.playMusica(cfg.night ? "noche" : "dia");
      startDialog(DIALOGOS.dia[w.day] || [], () => {});
    }
    rerender();
  }, [A, rerender, startDialog]);

  /* ---------- teclado ---------- */
  useEffect(() => {
    const down = (e) => {
      const w = world.current, k = e.key;
      if (w.scene === "intro") {
        if (k === "Enter" || k === " " || e.code === "Space") { e.preventDefault(); advanceIntro(); }
        return;
      }
      if (w.scene === "dialog") {
        if (k === "Enter" || k === " " || e.code === "Space") { e.preventDefault(); advanceDialog(); }
        return;
      }
      if (w.scene === "creditos") {
        if (k === "Enter" || k === " " || e.code === "Space") { e.preventDefault(); advanceCreditos(); }
        return;
      }
      if (w.scene === "orgullo" && w.orgullo && !w.orgullo.terminado) {
        if (k === "ArrowLeft") { e.preventDefault(); tickOrgullo(w, 0, "left", A); }
        else if (k === "ArrowRight") { e.preventDefault(); tickOrgullo(w, 0, "right", A); }
        else if (k === "ArrowUp") { e.preventDefault(); tickOrgullo(w, 0, "up", A); }
        else if (k === " " || e.code === "Space") { e.preventDefault(); tickOrgullo(w, 0, "shoot", A); }
        return;
      }
      if (k === "ArrowLeft") { keys.current.left = true; e.preventDefault(); }
      else if (k === "ArrowRight") { keys.current.right = true; e.preventDefault(); }
      else if (k === "ArrowUp" || k === "w" || k === "W") { if (!e.repeat) doJump(); e.preventDefault(); }
      else if (k === " " || e.code === "Space") { keys.current.shoot = true; e.preventDefault(); }
      else if (k === "z" || k === "Z") { keys.current.shoot2 = true; e.preventDefault(); }
      else if (k === "x" || k === "X") { if (!e.repeat) doCare(); }
      else if (k === "c" || k === "C") { if (!e.repeat) doSpecial(); }
      else if (k === "Enter") {
        e.preventDefault();
        if (w.scene === "title") { A.playSfx("aparicion"); iniciarJuego(); }
        else if (w.scene === "dayIntro") enterDay();
        else if (w.scene === "dayClear") beginDayFlow(w.day + 1);
        else if (w.scene === "victory" || w.scene === "gameover") {
          world.current = makeWorld(); A.stop();
          window.dispatchEvent(new CustomEvent("sidebar:abrir"));
          rerender();
        }
      }
    };
    const up = (e) => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
      if (e.key === " " || e.code === "Space") keys.current.shoot = false;
      if (e.key === "z" || e.key === "Z") keys.current.shoot2 = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [advanceDialog, advanceIntro, advanceCreditos, doJump, doCare, doSpecial, enterDay, beginDayFlow, startDialog, rerender, A, iniciarJuego]);

  /* ---------- bucle ---------- */
  useEffect(() => {
    const dt = T.tickMs / 1000;
    const id = setInterval(() => {
      const w = world.current;
      if (w.msgTimer > 0) w.msgTimer -= dt;
      if (w.flash > 0) w.flash -= dt;
      if (w.shake > 0) w.shake -= dt;

      if (w.scene === "playing") runGarden(w, dt, keys.current, A, startDialog, rerender);
      else if (w.scene === "carrera") {
        tickIra(w, dt, keys.current, A);
        if (w.ira.terminado === "victoria" && !w.ira._handled) {
          w.ira._handled = true;
          startDialog(DIALOGOS.iraVictoria, () => { beginDayFlow(w.day + 1); });
        } else if (w.ira.terminado === "derrota" && !w.ira._handled) {
          w.ira._handled = true;
          startDialog(DIALOGOS.iraDerrota, () => { toGameOver(w, A, startDialog, rerender); });
        }
      } else if (w.scene === "orgullo") {
        tickOrgullo(w, dt, null, A);
        if (w.orgullo.terminado === "victoria" && !w.orgullo._handled) {
          w.orgullo._handled = true;
          startDialog(DIALOGOS.orgulloVictoria, () => { toVictory(w, A, startDialog, rerender); });
        } else if (w.orgullo.terminado === "derrota" && !w.orgullo._handled) {
          w.orgullo._handled = true;
          startDialog(DIALOGOS.derrota, () => { toGameOver(w, A, startDialog, rerender); });
        }
      }
      rerender();
    }, T.tickMs);
    return () => clearInterval(id);
  }, [A, startDialog, rerender, beginDayFlow]);

  useEffect(() => {
    const w = world.current;
    if (w.scene === "victory" && !completed.current) {
      completed.current = true; w.badge = true;
      if (typeof onGameComplete === "function") onGameComplete();
    }
    if (w.scene === "title") completed.current = false;
  });

  useEffect(() => { A.setMute(mute); }, [mute, A]);
  useEffect(() => () => A.stop(), [A]);

  /* ====================== RENDER ====================== */
  const w = world.current;
  const cfg = w.day <= 7 ? dayCfg(w.day) : null;
  const isNight = cfg && cfg.night;
  const pct = (x) => `${(x / T.CW) * 100}%`;
  const bgImg = DAY_BG[w.day];

  const skyStyle = bgImg
    ? { background: "#000" }
    : isNight
      ? { background: "linear-gradient(180deg,#2a3358 0%,#4a5a7a 60%,#6a7a5a 100%)" }
      : { background: "linear-gradient(180deg,#bfe6ff 0%,#dff3d6 60%,#cfe9b8 100%)" };

  let carePrompt = null;
  if (w.scene === "playing") {
    const nf = w.flowers.filter((f) => Math.abs(f.x - w.mouri.x) < T.reach)
      .sort((a, b) => Math.abs(a.x - w.mouri.x) - Math.abs(b.x - w.mouri.x))[0];
    if (nf && nf.health <= 0) carePrompt = "X: revivir esta flor";
    else if (nf && nf.need) carePrompt = "X: cuidar (necesidad)";
    else if (nf && nf.health < T.flowerMax) carePrompt = "X: cuidar";
  }

  const topBarPct = cfg && cfg.dur ? (w.dayTimer / cfg.dur) * 100 : 0;
  const shakeX = w.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  const shakeY = w.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  const recienGolpeado = w.mouri.invuln > (T.invulnTime - 0.3);

  return (
    <div style={{ width: "100%", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes m-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes m-shake{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        @keyframes m-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes m-pulse{0%,100%{opacity:.55}50%{opacity:1}}
        @keyframes m-hitring{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.3);opacity:0}}
        @keyframes m-bossenter{0%{transform:scale(.15) rotate(-8deg);opacity:0;filter:brightness(2.4)}60%{transform:scale(1.15) rotate(3deg);opacity:1;filter:brightness(1.6)}100%{transform:scale(1) rotate(0deg);opacity:1;filter:brightness(1)}}
      `}</style>

      {w.scene !== "intro" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 18px", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700, color: "#4E3A25" }}>
            <span>🌱 El Jardín de los Recuerdos</span>
            <span>⭐ {w.score}</span>
            {w.scene !== "carrera" && w.scene !== "orgullo" && (
              <span>{Array.from({ length: T.mouriMaxHP }).map((_, i) => (
                <span key={i} style={{ opacity: i < w.mouri.hp ? 1 : 0.2 }}>❤️</span>))}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700, color: "#4E3A25" }}>
            <span>{cfg ? `📅 Día ${w.day}/7 — ${cfg.name}` : ""}</span>
            <button onClick={() => setMute((m) => !m)}
              style={{ background: "#FFF8E8", border: `2px solid ${brown}`, borderRadius: 10, padding: "2px 10px", cursor: "pointer" }}>
              {mute ? "🔇" : "🔊"}
            </button>
          </div>
        </div>
      )}

      {w.scene === "playing" && (
        <div style={{ padding: "0 18px 6px", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ height: 12, background: "#0000002a", border: `2px solid ${brown}`, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${topBarPct}%`, height: "100%", background: "#7CB342", transition: "width .15s" }} />
          </div>
          {canSpecial(w) && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#4E3A25" }}>Recuerdos</span>
              <div style={{ flex: 1, height: 9, background: "#0000002a", border: `2px solid ${brown}`, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${w.special}%`, height: "100%", background: w.special >= 100 ? "#ffd24a" : "#c9a24a" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: w.special >= 100 ? "#e0a500" : "#4E3A25" }}>
                {w.special >= 100 ? "¡C = LISTO!" : `${Math.floor(w.special)}%`}
              </span>
            </div>
          )}
          {w.mini && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: w.mini.color }}>
                {w.mini.sprite} {w.mini.pecado ? `${w.mini.pecado} — ` : ""}{w.mini.nombre}
              </span>
              <div style={{ flex: 1, height: 9, background: "#0000002a", border: `2px solid ${brown}`, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${(w.mini.hp / w.mini.hpMax) * 100}%`, height: "100%", background: w.mini.color }} />
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{
        position: "relative", width: "100%", height: "min(62vh, 520px)", overflow: "hidden",
        borderTop: `4px solid ${brown}`, borderBottom: `4px solid ${brown}`,
        transform: `translate(${shakeX}px,${shakeY}px)`, ...skyStyle, transition: "background .8s",
      }}>
        {w.scene === "intro" && (
          <IntroScreen slide={INTRO_SLIDES[w.introIdx]} index={w.introIdx} total={INTRO_SLIDES.length} onNext={advanceIntro} />
        )}

        {w.scene !== "intro" && bgImg && <img src={bgImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}

        {w.darkness > 0 && <div style={{ position: "absolute", inset: 0, background: "#0a0a14", opacity: clamp(w.darkness, 0, 0.72), pointerEvents: "none" }} />}
        {w.flash > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff6cc", opacity: clamp(w.flash, 0, 0.6), pointerEvents: "none" }} />}

        {w.scene === "playing" && (
          <>
            <div style={{
              position: "absolute", bottom: 0, left: 0, width: "100%", height: T.base,
              background: FLOOR_IMG ? `url(${FLOOR_IMG})` : "#8bbf5a", zIndex: 2,
              backgroundSize: "cover", backgroundRepeat: "repeat-x", transition: "background .8s",
            }} />

            {w.mini && (
              <div style={{ position: "absolute", left: pct(w.mini.x), bottom: T.base + w.mini.y, transform: `translateX(-50%) scale(${w.mini.scale || 1})` }}>
                <div style={{
                  fontSize: 62,
                  animation: w.mini.entradaT > 0 ? "m-bossenter .9s ease-out" : "m-float 2s infinite",
                  opacity: w.mini.hitT > 0 && Math.floor(w.mini.hitT * 20) % 2 ? 0.35 : 1,
                  filter: `drop-shadow(0 0 12px ${w.mini.color}) ${w.mini.avisando ? "brightness(1.6)" : ""}`,
                }}>
                  <Sprite asset={w.mini.sprite} size={62} />
                </div>
              </div>
            )}

            {w.flowers.map((f) => <Flower key={f.id} f={f} left={pct(f.x)} isNight={isNight} />)}

            {w.shadows.map((s) => (
              <div key={s.id} style={{ position: "absolute", left: pct(s.x), bottom: T.base, transform: "translateX(-50%)", fontSize: s.big ? 42 : 32, filter: "grayscale(1) brightness(.4)", opacity: .9 }}>
                <Sprite asset={s.big ? ASSETS.sombraGrande : ASSETS.sombra} size={s.big ? 42 : 32} />
              </div>
            ))}

            {w.bullets.map((b) => (
              <div key={b.id} style={{
                position: "absolute", left: pct(b.x), bottom: T.base + b.y, transform: "translate(-50%,50%)", fontSize: 18,
                filter: b.wave ? "hue-rotate(120deg) saturate(1.6)" : "none",
              }}>
                <Sprite asset={ASSETS.bala} size={b.wave ? 30 : 26} />
              </div>
            ))}

            {w.orbs.map((o) => (
              <div key={o.id} style={{ position: "absolute", left: pct(o.x), bottom: T.base + o.y, transform: "translate(-50%,50%)", fontSize: o.big ? 74 : 40, filter: "hue-rotate(250deg) saturate(1.5)" }}>
                <Sprite asset={ASSETS.orbe} size={o.big ? 74 : 40} />
              </div>
            ))}

            <div style={{
              position: "absolute", left: pct(w.mouri.x), bottom: T.base + w.mouri.y, transform: "translateX(-50%)",
              opacity: w.mouri.invuln > 0 && Math.floor(w.mouri.invuln * 12) % 2 ? 0.35 : 1,
            }}>
              <div style={{
                fontSize: 70, animation: w.mouri.moving && w.mouri.onGround ? "m-bob .3s infinite" : "none",
                transform: (w.mouri.facing === "left" && !ASSETS.mouriIzquierda) ? "scaleX(-1)" : "scaleX(1)",
                transformOrigin: "center",
              }}>
                <Sprite asset={(w.mouri.facing === "left" && ASSETS.mouriIzquierda) ? ASSETS.mouriIzquierda : ASSETS.mouri} size={70} />
              </div>
              {recienGolpeado && (
                <div style={{ position: "absolute", left: "50%", top: "50%", width: 90, height: 90, marginLeft: -45, marginTop: -45, borderRadius: "50%", border: "4px solid #ff4d4d", pointerEvents: "none", animation: "m-hitring .3s ease-out" }} />
              )}
              {w.mouri.hechizado > 0 && (
                <div style={{ position: "absolute", left: "50%", top: -26, transform: "translateX(-50%)", fontSize: 20 }}>
                  <Sprite asset={ASSETS.hechizo} size={20} />
                </div>
              )}
            </div>

            {carePrompt && (
              <div style={{ position: "absolute", left: pct(w.mouri.x), bottom: T.base + w.mouri.y + 56, transform: "translateX(-50%)", whiteSpace: "nowrap", background: "rgba(255,255,255,.92)", border: `2px solid ${brown}`, color: "#5C4A2C", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>
                {carePrompt}
              </div>
            )}

            {w.msgTimer > 0 && (
              <div style={{ position: "absolute", bottom: 14, right: 16, maxWidth: 280, zIndex: 20 }}>
                <div style={{ background: "#FFF8E8", border: `2px solid ${brown}`, borderRadius: 16, padding: "8px 12px" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#4E3A25" }}>{w.message}</p>
                </div>
              </div>
            )}
          </>
        )}

        {w.scene === "carrera" && <CarreraIra w={w} pct={pct} />}
        {w.scene === "orgullo" && <OrgulloView w={w} />}

        {w.scene === "title" && (
          <Overlay bg="rgba(20,30,20,.62)">
            <div style={{ fontSize: 90 }}><Sprite asset={ASSETS.mouriVolador} size={90} /></div>
            <h2 style={{ margin: "6px 0", color: "#FFF8E8", fontSize: 26 }}>El Jardín de los Recuerdos</h2>
            <p style={{ color: "#e8e0cc", fontSize: 14, maxWidth: 560, margin: "4px auto" }}>
              Siete días, siete pecados. Cada uno se juega distinto: vuelo, carrera de autos, memoria y más.
            </p>
            <Controls />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <PixelBtn onClick={iniciarJuego}>▶ Comenzar</PixelBtn>
              <PixelBtn onClick={() => { setTutPaso(0); setTutorialAbierto(true); }}>❔ Cómo jugar</PixelBtn>
            </div>
          </Overlay>
        )}

        {w.scene === "dayIntro" && cfg && (
          <Overlay bg={cfg.carrera || cfg.orgullo ? "rgba(15,12,25,.85)" : "rgba(20,30,20,.65)"}>
            <p style={{ color: "#ffd88a", fontSize: 13, letterSpacing: 3, margin: 0 }}>DÍA {cfg.n} DE 7</p>
            <h2 style={{ margin: "4px 0", color: "#FFF8E8", fontSize: 24 }}>{cfg.name}</h2>
            {cfg.unlock && <div style={{ display: "inline-block", background: "#FFE39A", color: "#5C4A2C", fontWeight: 700, fontSize: 13, borderRadius: 999, padding: "4px 12px", margin: "6px 0" }}>⭐ {cfg.unlock}</div>}
            {cfg.carrera && <p style={{ color: "#e6b8b8", fontSize: 13 }}>⚠ Hoy manejamos: la Ira nos persigue en la carretera.</p>}
            {cfg.orgullo && <p style={{ color: "#e6b8b8", fontSize: 13 }}>⚠ Jefe final: se vence con inteligencia, no a golpes.</p>}
            <PixelBtn onClick={enterDay}>{cfg.orgullo ? "👁️ ¡Enfrentar al Orgullo!" : cfg.carrera ? "🚗 ¡Arrancar!" : "▶ Empezar el día"}</PixelBtn>
          </Overlay>
        )}

        {w.scene === "dayClear" && (
          <Overlay bg="rgba(255,240,200,.86)">
            <div style={{ fontSize: 46 }}>🌷✨</div>
            <h2 style={{ margin: "4px 0", color: "#4E3A25" }}>¡Día {w.day} completado!</h2>
            <p style={{ color: "#5C4A2C", fontSize: 14 }}>Flores vivas: {alive(w).length}/4 · Puntos: {w.score}</p>
            <PixelBtn onClick={() => beginDayFlow(w.day + 1)}>▶ Continuar al Día {w.day + 1}</PixelBtn>
          </Overlay>
        )}

        {w.scene === "creditos" && (
          <CreditsOverlay img={CREDITOS_IMAGENES[w.creditoIdx]} onNext={advanceCreditos} step={w.creditoIdx + 1} total={CREDITOS_IMAGENES.length} />
        )}

        {w.scene === "victory" && (
          <>
            {FINAL_IMG && (
              <img src={FINAL_IMG} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 29 }} />
            )}
            <Overlay bg={FINAL_IMG ? "rgba(0,0,0,.38)" : "rgba(255,242,205,.92)"}>
              <div style={{ fontSize: 52 }}>🌸✨🌼</div>
              <h2 style={{ margin: "6px 0", color: FINAL_IMG ? "#FFF8E8" : "#4E3A25", textShadow: FINAL_IMG ? "0 2px 10px rgba(0,0,0,.6)" : "none" }}>¡Salvaste el Jardín de los Recuerdos!</h2>
              <div style={{ display: "inline-flex", gap: 8, background: "#FFF8E8", border: `2px solid ${brown}`, color: "#5C4A2C", fontWeight: 700, borderRadius: 999, padding: "8px 16px", margin: "8px 0" }}>
                🏅 Insignia obtenida: Guardián del Jardín
              </div>
              <div><PixelBtn onClick={() => { world.current = makeWorld(); A.stop(); window.dispatchEvent(new CustomEvent("sidebar:abrir")); rerender(); }}>↺ Jugar de nuevo</PixelBtn></div>
            </Overlay>
          </>
        )}

        {w.scene === "gameover" && (
          <Overlay bg="rgba(18,15,28,.88)">
            <div style={{ fontSize: 48 }}><Sprite asset={ASSETS.marchita} size={48} /></div>
            <h2 style={{ margin: "6px 0", color: "#FFF8E8" }}>El jardín se apagó...</h2>
            <p style={{ color: "#bcae9a", fontSize: 13 }}>Llegaste al Día {w.day}. Puntos: {w.score}</p>
            <PixelBtn onClick={() => { world.current = makeWorld(); A.stop(); window.dispatchEvent(new CustomEvent("sidebar:abrir")); rerender(); }}>↺ Volver a intentarlo</PixelBtn>
          </Overlay>
        )}

        {w.scene === "dialog" && w.dialog && (
          <DialogBox line={w.dialog.lines[w.dialog.i]} onNext={advanceDialog} step={w.dialog.i + 1} total={w.dialog.lines.length} />
        )}
      </div>

      {w.scene === "playing" && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 18px", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Hold onDown={() => (keys.current.left = true)} onUp={() => (keys.current.left = false)}>←</Hold>
            <Hold onDown={() => (keys.current.right = true)} onUp={() => (keys.current.right = false)}>→</Hold>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {canShoot(w) && <Hold onDown={() => (keys.current.shoot = true)} onUp={() => (keys.current.shoot = false)}>✨</Hold>}
            {canShoot(w) && <Hold onDown={() => (keys.current.shoot2 = true)} onUp={() => (keys.current.shoot2 = false)}>🌊</Hold>}
            {canJump(w) && <Tap onTap={doJump}>⤴</Tap>}
            <Tap onTap={doCare}>🌱</Tap>
            {canSpecial(w) && <Tap onTap={doSpecial} glow={w.special >= 100}>⚡</Tap>}
          </div>
        </div>
      )}

      {w.scene === "carrera" && (
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 18px", gap: 8 }}>
          <Hold onDown={() => (keys.current.left = true)} onUp={() => (keys.current.left = false)}>←</Hold>
          <Hold onDown={() => (keys.current.right = true)} onUp={() => (keys.current.right = false)}>→</Hold>
        </div>
      )}

      {w.scene === "orgullo" && w.orgullo && (
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 18px", gap: 8 }}>
          <Tap onTap={() => tickOrgullo(w, 0, "left", A)}>◀</Tap>
          <Tap onTap={() => tickOrgullo(w, 0, "up", A)}>▲</Tap>
          <Tap onTap={() => tickOrgullo(w, 0, "shoot", A)}>✨</Tap>
          <Tap onTap={() => tickOrgullo(w, 0, "right", A)}>▶</Tap>
        </div>
      )}

      {w.scene === "playing" && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 20px", padding: "4px 18px 14px", fontSize: 12, color: "#5C4A2C" }}>
          {w.flowers.map((f) => (
            <span key={f.id}><Sprite asset={ASSETS[f.type]} size={15} /> <b>{f.name}:</b> {f.pasivo}</span>
          ))}
        </div>
      )}

      {tutorialAbierto && (
        <TutorialOverlay
          paso={TUTORIAL_PASOS[tutPaso]} indice={tutPaso} total={TUTORIAL_PASOS.length}
          onAnterior={() => setTutPaso((p) => Math.max(0, p - 1))}
          onSiguiente={() => setTutPaso((p) => Math.min(TUTORIAL_PASOS.length - 1, p + 1))}
          onCerrar={() => setTutorialAbierto(false)}
        />
      )}
    </div>
  );
}

/* ====================================================================== */
function beginDay(w, n) {
  w.day = n;
  const cfg = dayCfg(n);
  w.mouri = { x: T.CW / 2, y: 0, vy: 0, onGround: true, facing: "right", moving: false, hp: T.mouriMaxHP, invuln: 0, hechizado: 0 };
  w.bullets = []; w.shadows = []; w.orbs = [];
  w.dayTimer = 0; w.needTimer = 3; w.shadowTimer = (cfg.shadowRate || 0) + 2; w.fireCd = 0; w.fireCd2 = 0;
  w.mini = null; w.miniDone = false; w.darkness = 0;
  w.ira = null; w.orgullo = null;
  for (const f of w.flowers) { f.health = Math.max(f.health, 60); f.need = null; }
  w.scene = "dayIntro"; w.msgTimer = 0;
}

function toVictory(w, A, startDialog, rerender) {
  A.playMusica("victoria");
  w.scene = "playing";
  startDialog(DIALOGOS.victoria, () => {
    w.creditoIdx = 0;
    if (CREDITOS_IMAGENES.length > 0) { setScene(w, "creditos"); A.playMusica("creditos"); }
    else setScene(w, "victory");
    rerender();
  });
  rerender();
}

function toGameOver(w, A, startDialog, rerender) {
  A.playMusica("derrota");
  w.scene = "playing";
  startDialog(DIALOGOS.derrota, () => { setScene(w, "gameover"); rerender(); });
}

/* ====================================================================== */
function runGarden(w, dt, keys, A, startDialog, rerender) {
  const cfg = dayCfg(w.day);
  movePhysics(w, dt, keys, A);
  tickNeeds(w, dt, cfg.needRate, cfg.needDecay);

  if (cfg.shadowRate > 0) {
    w.shadowTimer -= dt;
    if (w.shadowTimer <= 0) { spawnShadow(w, cfg.shadowHP, cfg.shadowHP >= 2); w.shadowTimer = cfg.shadowRate; }
    tickShadows(w, dt, cfg.shadowSpeed, A);
  }

  if (cfg.miniJefe && !w.mini && !w.miniDone && w.dayTimer >= cfg.miniJefeEn) {
    spawnMiniBoss(w, cfg.miniJefe, A, startDialog, rerender);
    return;
  }
  if (w.mini) runMiniBoss(w, dt, A, startDialog, rerender, dayCfg);
  tickOrbs(w, dt, A);
  flowerPassives(w, dt);

  if (w.flowers.every((f) => f.health <= 0) || w.mouri.hp <= 0) { toGameOver(w, A, startDialog, rerender); return; }

  w.dayTimer += dt;
  if (w.dayTimer >= cfg.dur && !w.mini) {
    w.scene = "dayClear";
    startDialog(DIALOGOS.finDia, () => { w.scene = "dayClear"; rerender(); });
  }
}

/* ====================================================================== */
/*  VISTA: carrera de autos (Ira)                                         */
function CarreraIra({ w, pct }) {
  const r = w.ira;
  if (!r) return null;
  const CARRILES_X = [0.28, 0.5, 0.72];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: T.base + 40, background: "#3a3a3f" }} />
      {CARRILES_X.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: `${c * 100}%`, bottom: 0, width: 3, height: T.base + 40, background: "rgba(255,255,255,.35)" }} />
      ))}
      {r.obstaculos.map((o) => (
        <div key={o.id} style={{ position: "absolute", left: `${CARRILES_X[o.carril] * 100}%`, bottom: T.base - 10 + (o.z * 0.35), transform: "translateX(-50%)", fontSize: 34, opacity: clamp(o.z / 300, 0.2, 1) }}>
          <Sprite asset={ASSETS.obstaculo} size={34} />
        </div>
      ))}
      <div style={{ position: "absolute", left: `${(r.carrilVisual / T.CW) * 100}%`, bottom: T.base - 4, transform: "translateX(-50%)", fontSize: 54, opacity: r.invuln > 0 && Math.floor(r.invuln * 12) % 2 ? .35 : 1 }}>
        <Sprite asset={ASSETS.mouriAuto || ASSETS.auto} size={54} />
      </div>
      <div style={{ position: "absolute", left: `${(r.carrilVisual / T.CW) * 100}%`, bottom: T.base - 4 - clamp(300 - r.distanciaIra, 0, 260), transform: "translateX(-50%)", fontSize: 46 }}>
        <Sprite asset={ASSETS.autoIra} size={46} />
      </div>
      <div style={{ position: "absolute", top: 12, left: 18, right: 18, display: "flex", justifyContent: "space-between", color: "#fff", fontWeight: 700, fontSize: 13 }}>
        <span>{Array.from({ length: T.mouriMaxHP }).map((_, i) => (<span key={i} style={{ opacity: i < r.vidas ? 1 : .2 }}>❤️</span>))}</span>
        <span>La Ira se acerca: {Math.round(clamp(100 - (r.distanciaIra / 260) * 100, 0, 100))}%</span>
        <span>{Math.max(0, Math.ceil(T.iraDur - r.timer))}s</span>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*  VISTA: El Orgullo (patrón de memoria)                                 */
function OrgulloView({ w }) {
  const o = w.orgullo;
  if (!o) return null;
  const simboloActual = o.mostrando ? o.secuencia[o.mostrarIdx] : null;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <div style={{
        fontSize: 90, filter: "drop-shadow(0 0 24px #7fd6ff)",
        animation: o.entradaT > 0 ? "m-bossenter 1.2s ease-out" : "none",
      }}>👁️</div>
      <div style={{ display: "flex", gap: 10 }}>
        {o.secuencia.map((s, i) => (
          <div key={i} style={{
            width: 46, height: 46, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800,
            background: o.mostrando ? (i === o.mostrarIdx ? "#ffe08a" : "#2a2140") : (i < o.jugadaIdx ? "#8fe08a" : "#2a2140"),
            color: o.mostrando ? (i === o.mostrarIdx ? "#4E3A25" : "#c9bfa2") : (i < o.jugadaIdx ? "#1c3d1a" : "#c9bfa2"),
            border: "2px solid #786F49", transition: "background .15s",
          }}>
            {(o.mostrando ? i <= o.mostrarIdx : true) ? SIMBOLO_ICONO[s] : "?"}
          </div>
        ))}
      </div>
      <p style={{ color: o.flashError > 0 ? "#ff8a8a" : o.flashCorrecto > 0 ? "#8fe08a" : "#f3ecd8", fontSize: 15, fontWeight: 700 }}>{o.mensaje}</p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#c9bfa2", fontSize: 13 }}>
        <span>❤️ x{o.vidas}</span>
        <span>·</span>
        <span>Corazas del Orgullo: {o.corazas}</span>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*  SUBCOMPONENTES                                                        */
function Flower({ f, left, isNight }) {
  const wilted = f.health <= 0;
  const hp = f.health / T.flowerMax;
  return (
    <div style={{ position: "absolute", left, bottom: T.base, transform: "translateX(-50%)", textAlign: "center" }}>
      <div style={{ fontSize: 40, filter: wilted ? "grayscale(1) brightness(.7)" : isNight ? `brightness(${0.65 + 0.35 * hp})` : "none", transform: wilted ? "rotate(8deg)" : "none" }}>
        <Sprite asset={wilted ? ASSETS.marchita : ASSETS[f.type]} size={40} />
      </div>
      <div style={{ width: 42, height: 5, margin: "2px auto 0", background: "#0000002a", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${hp * 100}%`, height: "100%", background: hp > .5 ? "#57b846" : hp > .2 ? "#e0a520" : "#d84343" }} />
      </div>
    </div>
  );
}

function Sprite({ asset, size = 40 }) {
  const isImg = typeof asset === "string" && asset.includes("/");
  if (isImg) return <img src={asset} alt="" style={{ width: size, height: size, imageRendering: "pixelated", display: "inline-block", verticalAlign: "middle", objectFit: "contain", flexShrink: 0 }} />;
  return <span>{asset}</span>;
}

function DialogBox({ line, onNext, step, total }) {
  const p = PERSONAJES[line.quien] || PERSONAJES.narrador;
  return (
    <div onClick={onNext} style={{ position: "absolute", inset: 0, zIndex: 40, background: "rgba(8,8,14,.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", cursor: "pointer", padding: 18 }}>
      <div style={{ width: "min(760px, 100%)", background: p.fondo, border: "4px solid #786F49", borderRadius: 18, padding: "14px 18px", boxShadow: "0 8px 30px rgba(0,0,0,.4)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {p.retrato && <div style={{ fontSize: 44, lineHeight: 1 }}><Sprite asset={p.retrato} size={44} /></div>}
          <div style={{ flex: 1 }}>
            {p.nombre && <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1, color: p.color, opacity: .75, marginBottom: 2 }}>{p.nombre}</div>}
            <div style={{ fontSize: 16, lineHeight: 1.45, color: p.color, fontStyle: p.nombre ? "normal" : "italic" }}>{line.texto}</div>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: p.color, opacity: .6, marginTop: 6 }}>{step}/{total} · clic o ENTER ▸</div>
      </div>
    </div>
  );
}

function CreditsOverlay({ img, onNext, step, total }) {
  return (
    <div onClick={onNext} style={{ position: "absolute", inset: 0, zIndex: 40, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 16 }}>
      {img ? <img src={img} alt="" style={{ maxWidth: "92%", maxHeight: "78%", objectFit: "contain", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,.6)" }} /> : <div style={{ color: "#e8e0cc", fontSize: 14 }}>✨</div>}
      <div style={{ color: "#e8e0cc", fontSize: 12, marginTop: 14, opacity: .8 }}>{step}/{total} · clic o ENTER para continuar ▸</div>
    </div>
  );
}

function TutorialOverlay({ paso, indice, total, onAnterior, onSiguiente, onCerrar }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(10,10,16,.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div style={{ width: "min(520px,100%)", background: "#FFF8E8", border: "4px solid #786F49", borderRadius: 24, padding: "22px 24px", boxShadow: "0 12px 40px rgba(0,0,0,.5)", textAlign: "center" }}>
        <div style={{ fontSize: 46, marginBottom: 6 }}>{paso.icono}</div>
        <h3 style={{ margin: "4px 0 10px", color: "#4E3A25", fontSize: 18 }}>{paso.titulo}</h3>
        <p style={{ color: "#5C4A2C", fontSize: 13, lineHeight: 1.6, margin: "0 0 18px" }}>{paso.texto}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <PixelBtn onClick={onAnterior}>◀ Atrás</PixelBtn>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#8A7A63" }}>{indice + 1} / {total}</span>
          {indice < total - 1 ? <PixelBtn onClick={onSiguiente}>Siguiente ▶</PixelBtn> : <PixelBtn onClick={onCerrar}>Entendido ✓</PixelBtn>}
        </div>
        <button onClick={onCerrar} style={{ marginTop: 14, background: "none", border: "none", color: "#8A7A63", fontSize: 11, fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>Cerrar tutorial</button>
      </div>
    </div>
  );
}

function Overlay({ children, bg }) {
  return <div style={{ position: "absolute", inset: 0, zIndex: 30, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 16 }}>{children}</div>;
}

function Controls() {
  return (
    <div style={{ fontSize: 12, marginTop: 6, color: "#d8d0bc", lineHeight: 1.7 }}>
      <div>← → mover · ↑ saltar · <b>ESPACIO</b> disparo recto · <b>Z</b> disparo ondulante</div>
      <div><b>X</b> cuidar flor · <b>C</b> Rayo del Recuerdo · <b>ENTER</b> avanzar diálogos</div>
    </div>
  );
}

function PixelBtn({ children, onClick }) {
  return <button onClick={onClick} style={{ background: "#FFE39A", border: "3px solid #786F49", color: "#4E3A25", borderRadius: 16, padding: "10px 22px", fontWeight: 700, marginTop: 10, cursor: "pointer", fontSize: 15 }}>{children}</button>;
}

function Hold({ children, onDown, onUp }) {
  return <button style={{ background: "#FFF8E8", border: "3px solid #786F49", color: "#4E3A25", borderRadius: 16, padding: "12px 18px", fontWeight: 700, fontSize: 18, minWidth: 56, touchAction: "none", userSelect: "none" }}
    onMouseDown={onDown} onMouseUp={onUp} onMouseLeave={onUp}
    onTouchStart={(e) => { e.preventDefault(); onDown(); }} onTouchEnd={(e) => { e.preventDefault(); onUp(); }}>{children}</button>;
}

function Tap({ children, onTap, glow }) {
  return <button onClick={onTap} onTouchStart={(e) => { e.preventDefault(); onTap(); }}
    style={{ background: glow ? "#FFE39A" : "#FFF8E8", border: "3px solid #786F49", color: "#4E3A25", borderRadius: 16, padding: "12px 18px", fontWeight: 700, fontSize: 18, minWidth: 56, touchAction: "none", userSelect: "none", boxShadow: glow ? "0 0 14px #ffcf4a" : "none" }}>{children}</button>;
}

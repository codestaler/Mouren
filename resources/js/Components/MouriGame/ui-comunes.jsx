/* ui-comunes.jsx — piezas de interfaz compartidas por los modos nuevos
 * (avioncito PC/tablet y celular "guía de almas"). Mismos colores y
 * estilo que el juego original.                                        */
import { useState } from "react";
import { PERSONAJES } from "./config";

export const MARRON = "#786F49";

export function Sprite({ asset, size = 40 }) {
  const isImg = typeof asset === "string" && asset.includes("/");
  const [falla, setFalla] = useState(false);
  if (isImg && !falla) {
    return <img src={asset} alt="" onError={() => setFalla(true)} style={{ width: size, height: size, imageRendering: "pixelated", display: "inline-block", verticalAlign: "middle", objectFit: "contain", flexShrink: 0 }} />;
  }
  return <span style={{ fontSize: Math.round(size * 0.9), lineHeight: 1 }}>{isImg ? "🐦" : asset}</span>;
}

export function Overlay({ children, bg, z = 30 }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: z, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 16, overflowY: "auto" }}>
      {children}
    </div>
  );
}

export function PixelBtn({ children, onClick, small }) {
  return (
    <button onClick={onClick} style={{
      background: "#FFE39A", border: "3px solid #786F49", color: "#4E3A25", borderRadius: 16,
      padding: small ? "6px 14px" : "10px 22px", fontWeight: 700, marginTop: 10, cursor: "pointer",
      fontSize: small ? 12 : 15, touchAction: "manipulation",
    }}>{children}</button>
  );
}

export function DialogBox({ line, onNext, step, total, personajes }) {
  const mapa = { ...PERSONAJES, ...(personajes || {}) };
  const p = mapa[line.quien] || mapa.narrador;
  return (
    <div onClick={onNext} style={{ position: "absolute", inset: 0, zIndex: 40, background: "rgba(8,8,14,.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", cursor: "pointer", padding: 14 }}>
      <div style={{ width: "min(760px, 100%)", background: p.fondo, border: "4px solid #786F49", borderRadius: 18, padding: "12px 16px", boxShadow: "0 8px 30px rgba(0,0,0,.4)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {p.retrato && <div style={{ fontSize: 40, lineHeight: 1 }}><Sprite asset={p.retrato} size={44} /></div>}
          <div style={{ flex: 1 }}>
            {p.nombre && <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1, color: p.color, opacity: 0.75, marginBottom: 2 }}>{p.nombre}</div>}
            <div style={{ fontSize: 15, lineHeight: 1.45, color: p.color, fontStyle: p.nombre ? "normal" : "italic" }}>{line.texto}</div>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: p.color, opacity: 0.6, marginTop: 6 }}>{step}/{total} · toca o ENTER ▸</div>
      </div>
    </div>
  );
}

export function CreditsOverlay({ img, onNext, step, total }) {
  return (
    <div onClick={onNext} style={{ position: "absolute", inset: 0, zIndex: 40, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 16 }}>
      {img ? <img src={img} alt="" style={{ maxWidth: "92%", maxHeight: "78%", objectFit: "contain", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,.6)" }} /> : <div style={{ color: "#e8e0cc", fontSize: 14 }}>✨</div>}
      <div style={{ color: "#e8e0cc", fontSize: 12, marginTop: 14, opacity: 0.8 }}>{step}/{total} · toca o ENTER para continuar ▸</div>
    </div>
  );
}

export function TutorialOverlay({ pasos, indice, onAnterior, onSiguiente, onCerrar }) {
  const paso = pasos[indice];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(10,10,16,.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div style={{ width: "min(520px,100%)", background: "#FFF8E8", border: "4px solid #786F49", borderRadius: 24, padding: "22px 24px", boxShadow: "0 12px 40px rgba(0,0,0,.5)", textAlign: "center" }}>
        <div style={{ fontSize: 46, marginBottom: 6 }}>{paso.icono}</div>
        <h3 style={{ margin: "4px 0 10px", color: "#4E3A25", fontSize: 18 }}>{paso.titulo}</h3>
        <p style={{ color: "#5C4A2C", fontSize: 13, lineHeight: 1.6, margin: "0 0 18px" }}>{paso.texto}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <PixelBtn onClick={onAnterior} small>◀ Atrás</PixelBtn>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#8A7A63" }}>{indice + 1} / {pasos.length}</span>
          {indice < pasos.length - 1 ? <PixelBtn onClick={onSiguiente} small>Siguiente ▶</PixelBtn> : <PixelBtn onClick={onCerrar} small>Entendido ✓</PixelBtn>}
        </div>
        <button onClick={onCerrar} style={{ marginTop: 14, background: "none", border: "none", color: "#8A7A63", fontSize: 11, fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>Cerrar tutorial</button>
      </div>
    </div>
  );
}

/** Hook-less helper: precarga de imágenes con <img> ocultas dentro del DOM
 * (así los .gif siguen animados al dibujarlos en un canvas). */
export function crearCargadorImagenes(contenedor) {
  const cache = new Map();
  return (src) => {
    let rec = cache.get(src);
    if (!rec) {
      const im = document.createElement("img");
      rec = { im, ok: false, fail: false };
      im.onload = () => { rec.ok = true; };
      im.onerror = () => { rec.fail = true; };
      im.src = src;
      if (contenedor) contenedor.appendChild(im);
      cache.set(src, rec);
    }
    return rec.ok && !rec.fail && rec.im.naturalWidth > 0 ? rec.im : null;
  };
}

/* MiniJuegoMouri.jsx — punto de entrada del juego (el mismo nombre de siempre,
 * así que en tu proyecto NO hay que cambiar ningún import).
 *
 * Elige solo el modo según el aparato:
 *   - Celular            -> MouriAlmas   ("Mouri, guía de almas", un dedo)
 *   - PC / Tablet        -> MouriAvion   (avioncito: Mouri vuela y dispara solo)
 *   - Clásico (respaldo) -> MiniJuegoJardin (tu juego anterior, intacto)
 *
 * Para probar cada modo desde el computador puedes usar los botoncitos de
 * abajo, o agregar ?modo=celular / ?modo=pc / ?modo=clasico a la dirección.
 * Para ocultar los botoncitos: MOSTRAR_SELECTOR_MODO = false en config-avion.js */
import { useState } from "react";
import MouriAvion from "./MouriAvion";
import MouriAlmas from "./MouriAlmas";
import MiniJuegoJardin from "./MiniJuegoJardin";
import { MOSTRAR_SELECTOR_MODO } from "./config-avion";

const MODOS = [
  { id: "pc", etiqueta: "🖥️ PC / Tablet" },
  { id: "celular", etiqueta: "📱 Celular" },
  { id: "clasico", etiqueta: "🌱 Clásico" },
];

function detectarModo() {
  try {
    const q = new URLSearchParams(window.location.search).get("modo");
    if (q === "pc" || q === "celular" || q === "clasico") return q;
    const tactil = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const ladoCorto = Math.min(window.screen.width || 9999, window.screen.height || 9999);
    if (tactil && ladoCorto < 600) return "celular";
  } catch (e) { /* si algo falla, modo PC */ }
  return "pc";
}

export default function MiniJuegoMouri(props) {
  const [modo, setModo] = useState(detectarModo);
  return (
    <div style={{ width: "100%" }}>
      {modo === "celular" && <MouriAlmas key="celular" {...props} />}
      {modo === "pc" && <MouriAvion key="pc" {...props} />}
      {modo === "clasico" && <MiniJuegoJardin key="clasico" {...props} />}
      {MOSTRAR_SELECTOR_MODO && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center", flexWrap: "wrap", padding: "8px 10px", fontSize: 12, color: "#8A7A63" }}>
          <span>Modo de juego:</span>
          {MODOS.map((o) => (
            <button key={o.id} onClick={() => setModo(o.id)}
              style={{ background: modo === o.id ? "#FFE39A" : "#FFF8E8", border: "2px solid #786F49", color: "#4E3A25", borderRadius: 10, padding: "3px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {o.etiqueta}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

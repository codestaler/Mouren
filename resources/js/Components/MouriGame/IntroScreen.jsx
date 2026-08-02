/* IntroScreen.jsx — Pantalla(s) de introducción, ANTES del título.
 * Se controla 100% desde config.js -> INTRO_SLIDES (arreglo de
 * { imagen, texto }). Si está vacío, este componente no se muestra y el
 * juego pasa directo al título (eso ya lo maneja MiniJuegoMouri.jsx). */
export default function IntroScreen({ slide, index, total, onNext }) {
  if (!slide) return null;
  return (
    <div
      onClick={onNext}
      style={{
        position: "absolute", inset: 0, zIndex: 50, background: "#000",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", padding: 20, textAlign: "center",
      }}
    >
      {slide.imagen && (
        <img
          src={slide.imagen} alt=""
          style={{ maxWidth: "92%", maxHeight: "62%", objectFit: "contain", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,.6)", marginBottom: 22 }}
        />
      )}
      {slide.texto && (
        <p style={{ color: "#f3ecd8", fontSize: 17, lineHeight: 1.6, maxWidth: 620, margin: 0 }}>
          {slide.texto}
        </p>
      )}
      <div style={{ color: "#c9bfa2", fontSize: 12, marginTop: 22, opacity: .8 }}>
        {index + 1}/{total} · clic o ENTER para continuar ▸
      </div>
    </div>
  );
}

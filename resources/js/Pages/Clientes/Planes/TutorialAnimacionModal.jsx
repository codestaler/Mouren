import { useState } from "react";

/* ============================================================
 *  TUTORIAL ANIMACIÓN — estilo "hoja de animación" de videojuego
 *  ============================================================
 *  Pega tus imágenes y textos aquí. Cada "frame" es un paso de tu
 *  tutorial (una imagen + un tiempo/etiqueta opcional + un nombre).
 *
 *  imagen     -> ruta a tu imagen (pixel art, screenshot, lo que sea)
 *  tiempo     -> texto corto arriba a la derecha del frame (opcional,
 *                ej: "0.05", "Paso 1", "2 seg"...). Déjalo "" si no
 *                quieres mostrar nada ahí.
 *  etiqueta   -> texto debajo del frame (ej: "STANCE", "HIT"...)
 *  destacado  -> true = el frame se resalta con borde rojo/dorado
 * ============================================================ */
const FRAMES_EJEMPLO = [
  // { imagen: "/images/tutoriales/paso1.png", tiempo: "0.05", etiqueta: "Postura", destacado: false },
  // { imagen: "/images/tutoriales/paso2.png", tiempo: "0.1", etiqueta: "Preparación", destacado: true },
  // { imagen: "/images/tutoriales/paso3.png", tiempo: "0.05", etiqueta: "Golpe", destacado: false },
];

export default function TutorialAnimacionModal({
  abierto,
  onClose,
  numero = "01",
  titulo = "Tutorial",
  subtitulo = "",
  frames = FRAMES_EJEMPLO,
  notaFinal = "Mantén presionado para más impacto",
  autor = "",
}) {
  if (!abierto) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#E7DCC6] rounded-[28px] border-4 border-[#3B2E22] shadow-2xl p-5"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Botón cerrar (círculo, esquina superior izquierda) */}
        <button
          onClick={onClose}
          className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[#3B2E22] text-white flex items-center justify-center text-lg font-black shadow-md hover:scale-105 hover:bg-[#4E3D2B] transition"
          aria-label="Cerrar tutorial"
        >
          ✕
        </button>

        {/* Botón "..." decorativo (esquina superior derecha) */}
        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[#3B2E22] text-white flex items-center justify-center text-lg font-black shadow-md">
          •••
        </div>

        {/* Encabezado tipo "cápsula" café */}
        <div className="bg-[#5A4632] text-white rounded-2xl px-4 py-2 mb-4 inline-flex items-center gap-2 shadow-sm">
          <span className="font-black text-xs tracking-wide">{numero} — {titulo}</span>
        </div>

        {subtitulo && (
          <p className="text-[#5A4632] font-black text-sm uppercase tracking-wide mb-4 -mt-1">
            {subtitulo}
          </p>
        )}

        {/* Vista principal (opcional): primer frame en grande, como ejemplo del movimiento completo 
        {frames[0]?.imagen && (
          <div className="bg-[#F4EEDF] border-2 border-[#3B2E22]/70 rounded-2xl p-3 mb-4 flex items-center justify-center">
            <img
              src={frames[0].imagen}
              alt=""
              className="max-h-40 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        )}*/}

        {/* Cuadrícula de frames — la "hoja de animación" */}
        {frames.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {frames.map((f, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`relative w-full aspect-square bg-[#F4EEDF] border-2 rounded-xl overflow-hidden flex items-center justify-center
                    ${f.destacado ? "border-[#C0392B]" : "border-[#3B2E22]/40"}`}
                >
                  {f.tiempo && (
                    <span
                      className={`absolute top-1 right-1.5 text-[11px] font-black ${f.destacado ? "text-[#C0392B]" : "text-[#3B2E22]"
                        }`}
                    >
                      {f.tiempo}
                    </span>
                  )}
                  {f.imagen ? (
                    <img
                      src={f.imagen}
                      alt={f.etiqueta || `Paso ${i + 1}`}
                      className="w-full h-full object-contain p-1"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">sin imagen</span>
                  )}
                </div>
                <div className="mt-2 text-center w-full">
                  <p
                    className={`text-[10px] font-black uppercase ${f.destacado
                        ? "text-[#8A6A3A]"
                        : "text-[#5A4632]"
                      }`}
                  >
                    {f.etiqueta}
                  </p>

                  {f.nota && (
                    <p className="text-[9px] text-[#7A6A57] leading-tight mt-1 px-1">
                      {f.nota}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] italic text-[#5A4632]/60 text-center py-6">
            Todavía no hay pasos cargados para este tutorial.
          </p>
        )}

        {/* Pie: nota + autor, estilo capsula café como el header */}
        <div className="mt-5 bg-[#5A4632] text-white rounded-2xl px-4 py-2 flex items-center justify-between gap-3">
          {notaFinal && (
            <span className="text-[10px] font-bold uppercase tracking-wide">{notaFinal}</span>
          )}
          {autor && (
            <span className="text-[9px] opacity-70 whitespace-nowrap">{autor}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 *  BOTÓN + ESTADO LISTOS PARA USAR
 *  ============================================================
 *  Si quieres el botón de disparo ya armado (con su propio
 *  useState), puedes usar este componente en vez de manejar el
 *  estado tú mismo: <BotonTutorial frames={...} titulo="..." />
 * ============================================================ */
export function BotonTutorial({ children = "📖 Ver tutorial", className = "", ...props }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className={
          className ||
          "px-4 py-2 rounded-xl bg-[#5A4632] text-white text-[10px] font-black uppercase tracking-wide shadow-sm hover:bg-[#6E5540] hover:scale-105 transition-all"
        }
      >
        {children}
      </button>
      <TutorialAnimacionModal abierto={abierto} onClose={() => setAbierto(false)} {...props} />
    </>
  );
}

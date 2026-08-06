import { useState } from "react";
/* ============================================================
 *  GUÍA DE PERSONALIZACIÓN (estilo "tutorial de videojuego")
 *  ============================================================
 *  Acá pones, por cada servicio personalizable (por su id), una
 *  nota corta y/o los pasos con imagen + texto. Si un servicio no
 *  tiene guía definida, simplemente no le aparece el botón.
 *
 *  nota  -> texto corto que aparece arriba de los pasos (opcional)
 *  pasos -> arreglo de { imagen, texto }. "imagen" es la ruta a tu
 *           imagen (puedes dejarla null si un paso es solo texto).
 * ============================================================ */
const GUIAS_PERSONALIZACION = {
  11: {
    nota: "Así puedes personalizar este servicio en pocos pasos.",
    pasos: [
       { imagen: "/images/elementos_dashboard/detalles_plan/guia_servicios/1.jpg", texto: "Elige la cromática que más se ajuste al homenaje." },
       { imagen: "/images/elementos_dashboard/detalles_plan/guia_servicios/2.jpg", texto: "Selecciona el tipo de arreglo floral." },
       { imagen: "/images/elementos_dashboard/detalles_plan/guia_servicios/3.jpg", texto: "Agrega una observación si necesitas algo especial." },
    ],
  },
  25: {
    nota: "Guía rápida para configurar este servicio.",
    pasos: [
      // { imagen: "/images/tutoriales/servicio25_paso1.png", texto: "..." },
    ],
  },
};
export default function ServiciosExtrasPanel({
  serviciosExtras = [],
  abrirModal,
  abrirConfiguradorEstetico,
  quitarExtraGabinete
}) {
  // controla qué tarjeta tiene la guía abierta y en qué paso va
  const [guiaAbiertaId, setGuiaAbiertaId] = useState(null);
  const [pasoActual, setPasoActual] = useState(0);
  // 🆕 controla qué tarjeta tiene el despliegue de detalles abierto (solo UI)
  const [detallesAbiertoId, setDetallesAbiertoId] = useState(null);
  const toggleGuia = (id) => {
    if (guiaAbiertaId === id) {
      setGuiaAbiertaId(null);
    } else {
      setGuiaAbiertaId(id);
      setPasoActual(0);
    }
  };
  const toggleDetalles = (id) => {
    setDetallesAbiertoId((actual) => (actual === id ? null : id));
  };
  return (
    <div className="bg-white dark:bg-[#2E2720] p-4 sm:p-6 rounded-[28px] border border-[#A68966]/15 dark:border-white/10 shadow-md">
      {/* HEADER */}
      <div className="flex flex-wrap gap-3 justify-between items-center border-b border-[#A68966]/15 dark:border-white/10 pb-3 mb-5">
        <h3 className="font-black text-[11px] uppercase tracking-widest text-[#5D4E3F] dark:text-[#EDE4D3] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5D4E3F] dark:bg-[#A68966]"></span>
          Decoración &amp; Extras
        </h3>
        <button
          onClick={() => abrirModal("CATALOGO_COMPLETO_SERVICIOS")}
          className="bg-[#5D4E3F] dark:bg-[#A68966] hover:bg-[#4A3E32] dark:hover:bg-[#8e7253] transition text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap"
        >
          + Añadir catálogo
        </button>
      </div>
      <div className="space-y-3">
        {serviciosExtras.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-3xl mb-2">🌿</div>
            <p className="text-xs italic text-gray-400 dark:text-[#8F8368]">
              No has añadido decoración complementaria
            </p>
          </div>
        ) : (
          serviciosExtras.map((item) => {
            // 🆕 Ahora leemos el campo real `personalizable` del servicio (viene de la BD),
            // en vez de una lista de ids escrita a mano. Boolean(Number(...)) cubre
            // true/false, 1/0 y "1"/"0" sin importar cómo llegue serializado.
            const esPersonalizable = Boolean(Number(item.personalizable));
            const guia = GUIAS_PERSONALIZACION[item.id];
            const tieneGuia = esPersonalizable && guia && (guia.nota || (guia.pasos && guia.pasos.length > 0));
            const guiaAbierta = guiaAbiertaId === item.id;
            const detallesAbierto = detallesAbiertoId === item.id;
            const pasos = guia?.pasos || [];
            const paso = pasos[pasoActual];
            return (
              <div
                key={item.id}
                className={`
                  relative overflow-hidden rounded-[20px] bg-white dark:bg-[#221D17] shadow-sm hover:shadow-md transition
                  ${esPersonalizable
                    ? "border-2 border-[#FFD97D] shadow-[0_0_18px_-4px_rgba(255,217,125,0.55)]"
                    : "border border-[#A68966]/15 dark:border-white/10"
                  }
                `}
              >
                {/* franja lateral: dorada si es personalizable, café si no */}
                <div
                  className={`absolute top-0 left-0 h-full w-1.5 ${
                    esPersonalizable ? "bg-[#FFD97D]" : "bg-[#5D4E3F] dark:bg-[#A68966]"
                  }`}
                />

                <div className="p-4 pl-5">
                  {/* ---------- Fila 1: nombre + badge personalizable ---------- */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="font-black text-xs tracking-wide text-[#5D4E3F] dark:text-[#EDE4D3] uppercase flex items-center gap-2 min-w-0 flex-1">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${esPersonalizable ? "bg-[#FFD97D]" : "bg-[#A68966]"}`}></span>
                      <span className="break-words">{item.nombre}</span>
                    </span>
                    {esPersonalizable && (
                      <span className="bg-[#FFD97D] text-[#5A4020] px-2 py-1 rounded-full text-[9px] font-black uppercase shadow-sm flex items-center gap-1 whitespace-nowrap shrink-0">
                        ✨ Personalizable
                      </span>
                    )}
                  </div>

                  {/* ---------- Fila 2: precio ---------- */}
                  <div className="mt-2">
                    <span className="inline-block text-[11px] font-black text-[#8C6F4F] dark:text-[#FFD97D] bg-[#F4EDE6] dark:bg-[#3A322A] px-2.5 py-1 rounded-full whitespace-nowrap">
                      + ${Number(item.precio || item.pivot?.precio_pagado || 0).toLocaleString("es-CO")} COP
                    </span>
                  </div>

                  {/* ---------- Fila 3: acciones (envuelven en móvil) ---------- */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {esPersonalizable ? (
                      <button
                        onClick={() => abrirConfiguradorEstetico(item)}
                        className="px-3 py-1.5 rounded-lg bg-[#F4EDE6] dark:bg-[#3A322A] text-[#5D4E3F] dark:text-[#EDE4D3] text-[9px] font-black uppercase shadow-sm hover:bg-[#EAD9BE] dark:hover:bg-[#4A4033] hover:scale-105 transition whitespace-nowrap"
                      >
                        Configurar
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 dark:text-[#8F8368] italic">
                        No personalizable
                      </span>
                    )}
                    {tieneGuia && (
                      <button
                        onClick={() => toggleGuia(item.id)}
                        className={`
                          px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm transition flex items-center gap-1 whitespace-nowrap
                          ${guiaAbierta
                            ? "bg-[#5D4E3F] dark:bg-[#A68966] text-white"
                            : "bg-[#FFD97D] text-[#5A4020] hover:bg-[#FFC94D]"
                          }
                        `}
                      >
                        📖 Guía
                        <span className={`transition-transform ${guiaAbierta ? "rotate-180" : ""}`}>▾</span>
                      </button>
                    )}
                    {/* botón de despliegue de detalles (solo si hay personalización) */}
                    {item.personalizacion && (
                      <button
                        onClick={() => toggleDetalles(item.id)}
                        className={`
                          px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm transition flex items-center gap-1 whitespace-nowrap
                          ${detallesAbierto
                            ? "bg-[#5D4E3F] dark:bg-[#A68966] text-white"
                            : "bg-[#F4EDE6] dark:bg-[#3A322A] text-[#5D4E3F] dark:text-[#EDE4D3] hover:bg-[#EAD9BE] dark:hover:bg-[#4A4033]"
                          }
                        `}
                      >
                        Detalles
                        <span className={`transition-transform ${detallesAbierto ? "rotate-180" : ""}`}>▾</span>
                      </button>
                    )}
                    {/* empujamos la X al final */}
                    <button
                      onClick={() => quitarExtraGabinete(item.id)}
                      className="ml-auto text-rose-500 hover:text-rose-700 font-black px-2 text-sm transition hover:scale-110 shrink-0"
                      aria-label="Quitar servicio"
                    >
                      ✕
                    </button>
                  </div>

                  {/* ---------- Despliegue de personalización ---------- */}
                  {item.personalizacion && (
                    <div
                      className={`
                        grid transition-all duration-300 ease-out
                        ${detallesAbierto ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}
                      `}
                    >
                      <div className="overflow-hidden">
                        <div className="p-3 rounded-xl bg-[#F4EDE6] dark:bg-[#3A322A] text-[11px] text-[#5D4E3F] dark:text-[#EDE4D3] space-y-1.5 border border-[#A68966]/20 dark:border-white/10">
                          <p className="flex gap-2">
                            <span className="text-[#A68966] font-black shrink-0">●</span>
                            <span><span className="font-semibold">Cromática:</span> {item.personalizacion?.configuracion?.colorNombre}</span>
                          </p>
                          <p className="flex gap-2">
                            <span className="text-[#A68966] font-black shrink-0">●</span>
                            <span><span className="font-semibold">Arreglo:</span> {item.personalizacion?.configuracion?.florNombre}</span>
                          </p>
                          {item.personalizacion?.configuracion?.observacion && (
                            <p className="italic text-[#8C7A67] dark:text-[#C2B49A] border-l-2 border-[#FFD97D] pl-2 ml-1">
                              {item.personalizacion.configuracion.observacion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ================= GUÍA DESPLEGABLE ESTILO TUTORIAL ================= */}
                <div
                  className={`
                    grid transition-all duration-300 ease-out
                    ${guiaAbierta ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
                  `}
                >
                  <div className="overflow-hidden">
                    <div className="mx-3 sm:mx-4 mb-4 mt-1 rounded-2xl border border-[#FFD97D]/60 bg-[#FFFBF0] dark:bg-[#3A322A] dark:border-[#A68966]/30 p-3 sm:p-4">
                      {guia?.nota && (
                        <p className="text-[11px] text-[#5D4E3F] dark:text-[#EDE4D3] font-semibold mb-3 flex items-start gap-2">
                          <span>💡</span> <span>{guia.nota}</span>
                        </p>
                      )}
                      {pasos.length > 0 ? (
                        <div className="space-y-3">
                          {/* barra de progreso tipo "nivel completado" */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-[#F4EDE6] dark:bg-[#221D17] overflow-hidden">
                              <div
                                className="h-full bg-[#5D4E3F] dark:bg-[#A68966] transition-all duration-300"
                                style={{ width: `${((pasoActual + 1) / pasos.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-black text-[#8A6B22] dark:text-[#FFD97D] whitespace-nowrap">
                              Paso {pasoActual + 1} / {pasos.length}
                            </span>
                          </div>
                          {/* tarjeta del paso actual */}
                          <div className="rounded-xl border border-[#A68966]/20 dark:border-white/10 bg-white dark:bg-[#221D17] p-3 flex flex-col sm:flex-row gap-3 items-center">
                            {paso?.imagen && (
                              <img
                                src={paso.imagen}
                                alt={`Paso ${pasoActual + 1}`}
                                className="w-full sm:w-40 h-32 object-cover rounded-lg border border-[#A68966]/20 dark:border-white/10 shadow-sm shrink-0"
                              />
                            )}
                            <p className="text-[12px] text-[#5D4E3F] dark:text-[#EDE4D3] leading-relaxed">
                              {paso?.texto}
                            </p>
                          </div>
                          {/* navegación tipo videojuego */}
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <button
                              onClick={() => setPasoActual((p) => Math.max(0, p - 1))}
                              disabled={pasoActual === 0}
                              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition whitespace-nowrap
                                bg-[#F4EDE6] dark:bg-[#3A322A] text-[#5D4E3F] dark:text-[#EDE4D3] disabled:opacity-30 disabled:cursor-not-allowed
                                hover:bg-[#EAD9BE] dark:hover:bg-[#4A4033]"
                            >
                              ◀ Anterior
                            </button>
                            <div className="flex gap-1 flex-wrap justify-center">
                              {pasos.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setPasoActual(i)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    i === pasoActual ? "bg-[#5D4E3F] dark:bg-[#A68966] w-4" : "bg-[#A68966]/30"
                                  }`}
                                  aria-label={`Ir al paso ${i + 1}`}
                                />
                              ))}
                            </div>
                            <button
                              onClick={() => setPasoActual((p) => Math.min(pasos.length - 1, p + 1))}
                              disabled={pasoActual === pasos.length - 1}
                              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition whitespace-nowrap
                                bg-[#5D4E3F] dark:bg-[#A68966] text-white disabled:opacity-30 disabled:cursor-not-allowed
                                hover:bg-[#4A3E32] dark:hover:bg-[#8e7253]"
                            >
                              Siguiente ▶
                            </button>
                          </div>
                        </div>
                      ) : (
                        !guia?.nota && (
                          <p className="text-[11px] text-gray-400 dark:text-[#8F8368] italic">
                            Todavía no hay pasos cargados para esta guía.
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

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
       { imagen: "/images/elementos_dashboard/detalles_plan/guia_servicios/1.png", texto: "Elige la cromática que más se ajuste al homenaje." },
       { imagen: "/images/elementos_dashboard/detalles_plan/guia_servicios/2.gif", texto: "Selecciona el tipo de arreglo floral." },
       { imagen: "/images/elementos_dashboard/detalles_plan/guia_servicios/3.gif", texto: "Agrega una observación si necesitas algo especial." },
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

  const serviciosPersonalizables = [11, 25];

  // controla qué tarjeta tiene la guía abierta y en qué paso va
  const [guiaAbiertaId, setGuiaAbiertaId] = useState(null);
  const [pasoActual, setPasoActual] = useState(0);

  const toggleGuia = (id) => {
    if (guiaAbiertaId === id) {
      setGuiaAbiertaId(null);
    } else {
      setGuiaAbiertaId(id);
      setPasoActual(0);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[30px] border border-[#E6D7C3] shadow-md">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-[#E9DDC8] pb-3 mb-5">

        <h3 className="font-black text-[11px] uppercase tracking-widest text-[#5A4634] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5A4632]"></span>
          Decoración & Extras
        </h3>

        <button
          onClick={() => abrirModal("CATALOGO_COMPLETO_SERVICIOS")}
          className="bg-[#5A4632] hover:bg-[#6E5540] transition text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm"
        >
          + Añadir catálogo
        </button>
      </div>

      <div className="space-y-3">

        {serviciosExtras.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-3xl mb-2">🌿</div>
            <p className="text-xs italic text-gray-400">
              No has añadido decoración complementaria
            </p>
          </div>
        ) : (
          serviciosExtras.map((item) => {
            const esPersonalizable = serviciosPersonalizables.includes(item.id);
            const guia = GUIAS_PERSONALIZACION[item.id];
            const tieneGuia = esPersonalizable && guia && (guia.nota || (guia.pasos && guia.pasos.length > 0));
            const guiaAbierta = guiaAbiertaId === item.id;
            const pasos = guia?.pasos || [];
            const paso = pasos[pasoActual];

            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-[22px] bg-white border border-[#E8D9C2] shadow-sm hover:shadow-md transition"
              >
                {/* franja lateral, igual que en Miembros Protegidos */}
                <div className="absolute top-0 left-0 h-full w-1.5 bg-[#5A4632]" />

                <div className="p-4 pl-5 flex flex-col md:flex-row justify-between gap-3">

                  <div className="space-y-1">

                    <span className="font-black text-xs tracking-wide text-[#5A4634] uppercase flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B08A63]"></span>
                      {item.nombre}
                    </span>

                    {/* badge precio */}
                    <span className="inline-block text-[11px] font-black text-[#7A4E2A] bg-[#F3E2C8] px-2 py-[2px] rounded-full">
                      + ${Number(item.precio || item.pivot?.precio_pagado || 0).toLocaleString("es-CO")} COP
                    </span>

                    {/* personalización */}
                    {item.personalizacion && (
                      <div className="mt-2 p-2 rounded-xl bg-[#F6EDDB] text-[10px] text-[#5A4634] space-y-0.5 border border-[#E8D7BE]">

                        <p>
                          <span className="text-[#8A6B22] font-black">●</span> Cromática:{" "}
                          {item.personalizacion?.configuracion?.colorNombre}
                        </p>

                        <p>
                          <span className="text-[#8A6B22] font-black">●</span> Arreglo:{" "}
                          {item.personalizacion?.configuracion?.florNombre}
                        </p>

                        {item.personalizacion?.configuracion?.observacion && (
                          <p className="italic text-gray-600 border-l-2 border-[#E8C468] pl-2">
                            {item.personalizacion.configuracion.observacion}
                          </p>
                        )}

                      </div>
                    )}

                  </div>

                  {/* acciones */}
                  <div className="flex items-center gap-2 md:self-center">

                    {esPersonalizable ? (
                      <button
                        onClick={() => abrirConfiguradorEstetico(item)}
                        className="px-3 py-1 rounded-lg bg-[#EAD9BE] text-[#5A4634] text-[9px] font-black uppercase shadow-sm hover:bg-[#E2C9A6] hover:scale-105 transition"
                      >
                        Configurar
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">
                        No personalizable
                      </span>
                    )}

                    {tieneGuia && (
                      <button
                        onClick={() => toggleGuia(item.id)}
                        className={`
                          px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-sm transition flex items-center gap-1
                          ${guiaAbierta
                            ? "bg-[#5A4632] text-white"
                            : "bg-[#E8C468] text-[#5A4020] hover:bg-[#E2BB50]"
                          }
                        `}
                      >
                        📖 Guía
                        <span className={`transition-transform ${guiaAbierta ? "rotate-180" : ""}`}>▾</span>
                      </button>
                    )}

                    <button
                      onClick={() => quitarExtraGabinete(item.id)}
                      className="text-rose-500 hover:text-rose-700 font-black px-2 text-sm transition hover:scale-110"
                    >
                      ✕
                    </button>

                  </div>

                </div>

                {/* ================= GUÍA DESPLEGABLE ESTILO TUTORIAL ================= */}
                <div
                  className={`
                    grid transition-all duration-300 ease-out
                    ${guiaAbierta ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
                  `}
                >
                  <div className="overflow-hidden">
                    <div className="mx-4 mb-4 mt-1 rounded-2xl border border-[#E8C468] bg-[#FFFBF0] p-4">

                      {guia?.nota && (
                        <p className="text-[11px] text-[#5A4634] font-semibold mb-3 flex items-center gap-2">
                          <span>💡</span> {guia.nota}
                        </p>
                      )}

                      {pasos.length > 0 ? (
                        <div className="space-y-3">

                          {/* barra de progreso tipo "nivel completado" */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-[#F3E2C8] overflow-hidden">
                              <div
                                className="h-full bg-[#5A4632] transition-all duration-300"
                                style={{ width: `${((pasoActual + 1) / pasos.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-black text-[#8A6B22] whitespace-nowrap">
                              Paso {pasoActual + 1} / {pasos.length}
                            </span>
                          </div>

                          {/* tarjeta del paso actual */}
                          <div className="rounded-xl border border-[#E8D9C2] bg-white p-3 flex flex-col md:flex-row gap-3 items-center">
                            {paso?.imagen && (
                              <img
                                src={paso.imagen}
                                alt={`Paso ${pasoActual + 1}`}
                                className="w-full md:w-40 h-32 object-cover rounded-lg border border-[#E8D9C2] shadow-sm"
                              />
                            )}
                            <p className="text-[12px] text-[#5A4634] leading-relaxed">
                              {paso?.texto}
                            </p>
                          </div>

                          {/* navegación tipo videojuego */}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => setPasoActual((p) => Math.max(0, p - 1))}
                              disabled={pasoActual === 0}
                              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition
                                bg-[#F3E2C8] text-[#5A4634] disabled:opacity-30 disabled:cursor-not-allowed
                                hover:bg-[#EAD9BE]"
                            >
                              ◀ Anterior
                            </button>

                            <div className="flex gap-1">
                              {pasos.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setPasoActual(i)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    i === pasoActual ? "bg-[#5A4632] w-4" : "bg-[#E8D9C2]"
                                  }`}
                                  aria-label={`Ir al paso ${i + 1}`}
                                />
                              ))}
                            </div>

                            <button
                              onClick={() => setPasoActual((p) => Math.min(pasos.length - 1, p + 1))}
                              disabled={pasoActual === pasos.length - 1}
                              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition
                                bg-[#5A4632] text-white disabled:opacity-30 disabled:cursor-not-allowed
                                hover:bg-[#6E5540]"
                            >
                              Siguiente ▶
                            </button>
                          </div>
                        </div>
                      ) : (
                        !guia?.nota && (
                          <p className="text-[11px] text-gray-400 italic">
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
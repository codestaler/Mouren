export default function ServiciosExtrasPanel({
  serviciosExtras = [],
  abrirModal,
  abrirConfiguradorEstetico,
  quitarExtraGabinete
}) {

  const serviciosPersonalizables = [11, 25];

  return (
    <div className="bg-gradient-to-br from-[#ffffff] via-[#FFFBF4] to-[#F6EFE3] p-6 rounded-[30px] border border-[#E6D7C3] shadow-md">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-[#E9DDC8] pb-3 mb-5">

        <h3 className="font-black text-[11px] uppercase tracking-widest text-[#5A4634] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-700"></span>
          Decoración & Extras
        </h3>

        <button
          onClick={() => abrirModal("CATALOGO_COMPLETO_SERVICIOS")}
          className="bg-gradient-to-r from-[#8B6F52] to-[#A78662] hover:opacity-90 transition text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm"
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
          serviciosExtras.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden p-4 rounded-[22px] bg-gradient-to-r from-[#FFF9EF] via-white to-[#F7F0E4] border border-[#E8D9C2] shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-3"
            >

              {/* glow decorativo */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl"></div>

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
                  <div className="mt-2 p-2 rounded-xl bg-gradient-to-r from-[#F3E7D3] to-[#EFE0C4] text-[10px] text-[#5A4634] space-y-0.5 border border-[#E8D7BE]">

                    <p>
                      <span className="text-amber-800 font-black">●</span> Cromática:{" "}
                      {item.personalizacion?.configuracion?.colorNombre}
                    </p>

                    <p>
                      <span className="text-amber-800 font-black">●</span> Arreglo:{" "}
                      {item.personalizacion?.configuracion?.florNombre}
                    </p>

                    {item.personalizacion?.configuracion?.observacion && (
                      <p className="italic text-gray-600 border-l-2 border-amber-300 pl-2">
                        {item.personalizacion.configuracion.observacion}
                      </p>
                    )}

                  </div>
                )}

              </div>

              {/* acciones */}
              <div className="flex items-center gap-2 md:self-center">

                {serviciosPersonalizables.includes(item.id) ? (
                  <button
                    onClick={() => abrirConfiguradorEstetico(item)}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#EAD9BE] to-[#E2C9A6] text-[#5A4634] text-[9px] font-black uppercase shadow-sm hover:scale-105 transition"
                  >
                    Configurar
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-400 italic">
                    No personalizable
                  </span>
                )}

                <button
                  onClick={() => quitarExtraGabinete(item.id)}
                  className="text-rose-500 hover:text-rose-700 font-black px-2 text-sm transition hover:scale-110"
                >
                  ✕
                </button>

              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}
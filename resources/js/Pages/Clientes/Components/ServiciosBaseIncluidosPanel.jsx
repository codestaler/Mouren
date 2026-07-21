import { useState } from "react";

/* ============================================================
 *  IMÁGENES DEL CARRUSEL POR SERVICIO
 *  ============================================================
 *  Pon aquí, por id de servicio, las rutas de las imágenes que
 *  quieras mostrar en su carrusel. Si un servicio no tiene
 *  imágenes cargadas, simplemente no le aparece el carrusel.
 * ============================================================ */
const IMAGENES_SERVICIO = {
  // 1: [
  //   "/images/servicios_base/servicio1_foto1.jpg",
  //   "/images/servicios_base/servicio1_foto2.jpg",
  //   "/images/servicios_base/servicio1_foto3.jpg",
  // ],
  // 2: [
  //   "/images/servicios_base/servicio2_foto1.jpg",
  // ],
};

function CarruselServicio({ imagenes }) {
  const [idx, setIdx] = useState(0);

  if (!imagenes || imagenes.length === 0) return null;

  const anterior = () => setIdx((i) => (i === 0 ? imagenes.length - 1 : i - 1));
  const siguiente = () => setIdx((i) => (i === imagenes.length - 1 ? 0 : i + 1));

  return (
    <div className="mt-2 rounded-xl border border-[#EAE4D5] bg-white overflow-hidden">
      <div className="relative w-full h-32">
        <img
          src={imagenes[idx]}
          alt=""
          className="w-full h-full object-cover"
        />

        {imagenes.length > 1 && (
          <>
            <button
              onClick={anterior}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#5A4632]/85 text-white text-xs font-black flex items-center justify-center hover:bg-[#5A4632] transition"
              aria-label="Anterior"
            >
              ◀
            </button>
            <button
              onClick={siguiente}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#5A4632]/85 text-white text-xs font-black flex items-center justify-center hover:bg-[#5A4632] transition"
              aria-label="Siguiente"
            >
              ▶
            </button>

            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
              {imagenes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === idx ? "w-4 bg-[#E8C468]" : "w-1.5 bg-white/70"
                  }`}
                  aria-label={`Ir a la imagen ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ServiciosBaseIncluidosPanel({ serviciosBaseFijos = [] }) {
  return (
    <div className="bg-white p-6 rounded-[30px] border border-[#E6D7C3] shadow-md">
      <h3 className="font-black text-xs uppercase tracking-wider text-[#5A4634] border-b border-[#E9DDC8] pb-2 mb-3">
        Servicios Base Incluidos (Amparados por Plan Base)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {serviciosBaseFijos.length === 0 ? (
          <p className="text-xs italic text-gray-400 col-span-2 py-2">
            No se encontraron coberturas fijas.
          </p>
        ) : (
          serviciosBaseFijos.map((sb) => (
            <div
              key={sb.id}
              className="relative overflow-hidden p-3 pl-4 bg-white rounded-xl border border-[#EAE4D5] flex gap-2 items-start"
            >
              {/* franja lateral, igual que en los otros paneles */}
              <div className="absolute top-0 left-0 h-full w-1.5 bg-[#5A4632]" />

              <span className="text-[#8A6B22] font-black text-xs">✔</span>

              <div className="flex-1">
                <h4 className="text-[11px] font-black text-[#5A4634] uppercase">
                  {sb.nombre}
                </h4>
                <p className="text-[10px] text-gray-500 italic mt-0.5">
                  {sb.descripcion || "Servicio amparado por el plan."}
                </p>

                <CarruselServicio imagenes={IMAGENES_SERVICIO[sb.id]} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
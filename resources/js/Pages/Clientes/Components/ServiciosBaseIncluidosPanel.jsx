import { useState } from "react";
import VistaPrevia3DCofre from "./VistaPrevia3DCofre";
import VistaPrevia3DFloral from "./VistaPrevia3DFloral";

/* ============================================================
 *  IMÁGENES DEL CARRUSEL POR SERVICIO
 * ============================================================ */
const IMAGENES_SERVICIO = {
  // 1: [ "/images/servicios_base/servicio1_foto1.jpg" ],
};

// El cofre 3D solo tiene sentido para el Ataúd Personalizado.
const esServicioAtaud = (nombre) => {
  const n = (nombre || '').toLowerCase();
  return n.includes('ataúd') || n.includes('ataud') || n.includes('cofre');
};

// 🆕 La corona floral 3D, para servicios de decoración floral.
const esServicioFloral = (nombre) => {
  const n = (nombre || '').toLowerCase();
  return n.includes('floral') || n.includes('flores');
};

function CarruselServicio({ imagenes }) {
  const [idx, setIdx] = useState(0);
  if (!imagenes || imagenes.length === 0) return null;
  const anterior = () => setIdx((i) => (i === 0 ? imagenes.length - 1 : i - 1));
  const siguiente = () => setIdx((i) => (i === imagenes.length - 1 ? 0 : i + 1));
  return (
    <div className="mt-2 rounded-xl border border-[#A68966]/15 dark:border-white/10 bg-white dark:bg-[#221D17] overflow-hidden">
      <div className="relative w-full h-32">
        <img src={imagenes[idx]} alt="" className="w-full h-full object-cover" />
        {imagenes.length > 1 && (
          <>
            <button onClick={anterior} className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#5D4E3F]/85 text-white text-xs font-black flex items-center justify-center hover:bg-[#5D4E3F] transition" aria-label="Anterior">◀</button>
            <button onClick={siguiente} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#5D4E3F]/85 text-white text-xs font-black flex items-center justify-center hover:bg-[#5D4E3F] transition" aria-label="Siguiente">▶</button>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
              {imagenes.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-[#FFD97D]" : "w-1.5 bg-white/70"}`} aria-label={`Ir a la imagen ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DescripcionServicio({ texto }) {
  const [expandido, setExpandido] = useState(false);
  const esLarga = (texto || "").length > 110;
  return (
    <div>
      <p className={`text-[10px] text-gray-500 dark:text-[#C2B49A] italic mt-0.5 ${!expandido && esLarga ? "line-clamp-3" : ""}`}>
        {texto || "Servicio amparado por el plan."}
      </p>
      {esLarga && (
        <button onClick={() => setExpandido((v) => !v)} className="text-[9px] font-black uppercase text-[#A68966] hover:text-[#5D4E3F] dark:hover:text-[#EDE4D3] mt-1 transition">
          {expandido ? "Ver menos ▲" : "Ver más ▾"}
        </button>
      )}
    </div>
  );
}

// 🆕 Tarjeta completa — la usamos SOLO para los servicios personalizables,
// que ahora van destacados arriba de todo, con su propio bloque.
function TarjetaServicioDestacado({ sb, abrirConfiguradorEstetico, detallesAbierto, toggleDetalles }) {
  const esAtaud = esServicioAtaud(sb.nombre);
  const esFloral = esServicioFloral(sb.nombre);
  return (
    <div className="relative overflow-hidden p-3 pl-4 bg-white dark:bg-[#221D17] rounded-xl border-2 border-[#FFD97D] shadow-[0_0_14px_-4px_rgba(255,217,125,0.5)] flex gap-2 items-start transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="absolute top-0 left-0 h-full w-1.5 bg-[#FFD97D]" />
      <span className="text-[#A68966] font-black text-xs shrink-0">✔</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[11px] font-black text-[#5D4E3F] dark:text-[#EDE4D3] uppercase break-words">{sb.nombre}</h4>
          <span className="bg-[#FFD97D] text-[#5A4020] px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-sm shrink-0 whitespace-nowrap">✨ Personalizable</span>
        </div>
        <DescripcionServicio texto={sb.descripcion} />
        <CarruselServicio imagenes={IMAGENES_SERVICIO[sb.id]} />

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button onClick={() => abrirConfiguradorEstetico?.(sb)} className="px-3 py-1.5 rounded-lg bg-[#F4EDE6] dark:bg-[#3A322A] text-[#5D4E3F] dark:text-[#EDE4D3] text-[9px] font-black uppercase shadow-sm hover:bg-[#EAD9BE] dark:hover:bg-[#4A4033] hover:scale-105 transition whitespace-nowrap">
            Configurar
          </button>
          {sb.personalizacion && (
            <button
              onClick={() => toggleDetalles(sb.id)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm transition flex items-center gap-1 whitespace-nowrap ${
                detallesAbierto ? 'bg-[#5D4E3F] dark:bg-[#A68966] text-white' : 'bg-[#F4EDE6] dark:bg-[#3A322A] text-[#5D4E3F] dark:text-[#EDE4D3] hover:bg-[#EAD9BE] dark:hover:bg-[#4A4033]'
              }`}
            >
              Detalles
              <span className={`transition-transform ${detallesAbierto ? 'rotate-180' : ''}`}>▾</span>
            </button>
          )}
        </div>

        {sb.personalizacion && (
          <div className={`grid transition-all duration-300 ease-out ${detallesAbierto ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-3 rounded-xl bg-[#F4EDE6] dark:bg-[#3A322A] border border-[#A68966]/20 dark:border-white/10 flex flex-col sm:flex-row gap-3 items-center">
                {esAtaud && (
                  <div className="w-28 h-28 shrink-0 rounded-lg bg-white dark:bg-[#221D17] flex items-center justify-center overflow-hidden">
                    <VistaPrevia3DCofre colorNombre={sb.personalizacion?.configuracion?.colorNombre} florNombre={sb.personalizacion?.configuracion?.florNombre} size={110} />
                  </div>
                )}
                {esFloral && (
                  <div className="w-28 h-28 shrink-0 rounded-lg bg-white dark:bg-[#221D17] flex items-center justify-center overflow-hidden">
                    <VistaPrevia3DFloral colorNombre={sb.personalizacion?.configuracion?.colorNombre} florNombre={sb.personalizacion?.configuracion?.florNombre} size={110} />
                  </div>
                )}
                <div className="text-[11px] text-[#5D4E3F] dark:text-[#EDE4D3] space-y-1.5">
                  <p><span className="font-semibold">Cromática:</span> {sb.personalizacion?.configuracion?.colorNombre}</p>
                  <p><span className="font-semibold">Arreglo:</span> {sb.personalizacion?.configuracion?.florNombre}</p>
                  {sb.personalizacion?.configuracion?.observacion && (
                    <p className="italic text-[#8C7A67] dark:text-[#C2B49A] border-l-2 border-[#FFD97D] pl-2">{sb.personalizacion.configuracion.observacion}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 🆕 Fila compacta — para el resto de servicios base (los no-personalizables).
// Una sola línea por defecto; si tiene descripción larga o imágenes, se puede
// expandir con un clic. Esto es lo que evita que el panel se vea "larguísimo"
// cuando hay muchos servicios base.
function FilaCompacta({ sb, expandido, toggleExpandido }) {
  const tieneExtra = (sb.descripcion && sb.descripcion.length > 0) || IMAGENES_SERVICIO[sb.id];
  return (
    <div className="rounded-lg border border-[#A68966]/10 dark:border-white/5 bg-[#FAF7F2] dark:bg-[#221D17]/60 overflow-hidden">
      <button
        type="button"
        onClick={() => tieneExtra && toggleExpandido(sb.id)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-left ${tieneExtra ? 'cursor-pointer hover:bg-[#F4EDE6] dark:hover:bg-white/5' : 'cursor-default'} transition`}
      >
        <span className="text-[#A68966] font-black text-[10px] shrink-0">✔</span>
        <span className="text-[10px] font-bold text-[#5D4E3F] dark:text-[#EDE4D3] uppercase truncate flex-1">{sb.nombre}</span>
        {tieneExtra && (
          <span className={`shrink-0 text-[#A68966] text-[9px] transition-transform ${expandido ? 'rotate-180' : ''}`}>▾</span>
        )}
      </button>
      {tieneExtra && (
        <div className={`grid transition-all duration-300 ease-out ${expandido ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden px-3 pb-3">
            <DescripcionServicio texto={sb.descripcion} />
            <CarruselServicio imagenes={IMAGENES_SERVICIO[sb.id]} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServiciosBaseIncluidosPanel({ serviciosBaseFijos = [], abrirConfiguradorEstetico }) {
  const [detallesAbiertoId, setDetallesAbiertoId] = useState(null);
  const [compactaAbiertaId, setCompactaAbiertaId] = useState(null);

  const toggleDetalles = (id) => setDetallesAbiertoId((actual) => (actual === id ? null : id));
  const toggleCompacta = (id) => setCompactaAbiertaId((actual) => (actual === id ? null : id));

  // 🆕 Separamos: los personalizables van destacados arriba con su propia
  // tarjeta completa; el resto va en una lista compacta debajo — así no se
  // "pierden" entre muchos servicios, y el panel no se ve tan largo.
  const personalizables = serviciosBaseFijos.filter((sb) => Boolean(Number(sb.personalizable)));
  const resto = serviciosBaseFijos.filter((sb) => !Boolean(Number(sb.personalizable)));

  return (
    <div className="bg-white dark:bg-[#2E2720] p-5 sm:p-6 rounded-[28px] border border-[#A68966]/15 dark:border-white/10 shadow-md">
      <h3 className="font-black text-xs uppercase tracking-wider text-[#5D4E3F] dark:text-[#EDE4D3] border-b border-[#A68966]/15 dark:border-white/10 pb-2 mb-3">
        Servicios Base Incluidos (Amparados por Plan Base)
      </h3>

      {serviciosBaseFijos.length === 0 ? (
        <p className="text-xs italic text-gray-400 dark:text-[#8F8368] py-2">No se encontraron coberturas fijas.</p>
      ) : (
        <div className="space-y-4">
          {/* Personalizables, destacados arriba */}
          {personalizables.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {personalizables.map((sb) => (
                <TarjetaServicioDestacado
                  key={sb.id}
                  sb={sb}
                  abrirConfiguradorEstetico={abrirConfiguradorEstetico}
                  detallesAbierto={detallesAbiertoId === sb.id}
                  toggleDetalles={toggleDetalles}
                />
              ))}
            </div>
          )}

          {/* El resto, en lista compacta con scroll propio si hay muchos */}
          {resto.length > 0 && (
            <div>
              {personalizables.length > 0 && (
                <p className="text-[9px] uppercase tracking-wider font-black text-[#A68966]/70 mb-2 px-1">
                  Otras coberturas incluidas
                </p>
              )}
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar-base-servicios">
                {resto.map((sb) => (
                  <FilaCompacta
                    key={sb.id}
                    sb={sb}
                    expandido={compactaAbiertaId === sb.id}
                    toggleExpandido={toggleCompacta}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .custom-scrollbar-base-servicios::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-base-servicios::-webkit-scrollbar-thumb { background: #A68966; border-radius: 10px; }
      `}</style>
    </div>
  );
}

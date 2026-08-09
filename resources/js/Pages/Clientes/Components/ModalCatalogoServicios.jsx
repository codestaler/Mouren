import { useState, useMemo } from 'react';

export default function ModalCatalogoServicios({
    visible,
    todosLosServicios,
    agregarExtraCatalogo,
    cerrarModal,
    tipoPlan, // 'humano' | 'mascota' — si no se pasa, no filtra (compatibilidad hacia atrás)
    serviciosBase = [] // 🆕 servicios que ya vienen incluidos en el plan base, para excluirlos del catálogo
}) {
    const [busqueda, setBusqueda] = useState('');

    const serviciosFiltrados = useMemo(() => {
        let lista = todosLosServicios || [];

        // 🆕 Excluimos lo que ya está incluido en el plan base (evita duplicados)
        if (serviciosBase && serviciosBase.length > 0) {
            const idsBase = new Set(serviciosBase.map(s => Number(s.id)));
            lista = lista.filter(s => !idsBase.has(Number(s.id)));
        }

        if (tipoPlan) {
            lista = lista.filter(s => !s.aplica_a || s.aplica_a === 'ambos' || s.aplica_a === tipoPlan);
        }

        if (busqueda.trim()) {
            const q = busqueda.trim().toLowerCase();
            lista = lista.filter(s => s.nombre.toLowerCase().includes(q));
        }

        return lista;
    }, [todosLosServicios, tipoPlan, busqueda, serviciosBase]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#FDFBF7] rounded-[28px] max-w-md w-full border-2 border-[#60533E] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">

                {/* CABECERA */}
                <div className="p-5 sm:p-6 pb-4 border-b border-[#E3D9BC]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-black text-sm uppercase text-[#60533E] tracking-wide">
                            🌿 Catálogo de Servicios
                        </h3>
                        <button
                            onClick={cerrarModal}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4EDE6] hover:bg-[#E3D9BC] text-[#60533E] transition"
                        >
                            ✕
                        </button>
                    </div>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar servicio..."
                        className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs font-bold text-[#60533E] placeholder:opacity-50 focus:ring-2 focus:ring-[#A68966]/40 outline-none"
                    />
                </div>

                {/* LISTA */}
                <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
                    {serviciosFiltrados.length === 0 && (
                        <p className="text-center text-[11px] text-gray-400 italic py-10">
                            No hay servicios que coincidan con tu búsqueda.
                        </p>
                    )}

                    {serviciosFiltrados.map((serv) => {
                        const esPersonalizable = Boolean(Number(serv.personalizable));

                        return (
                            <button
                                key={serv.id}
                                type="button"
                                onClick={() => agregarExtraCatalogo(serv)}
                                className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                                    esPersonalizable
                                        ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 hover:shadow-md'
                                        : 'bg-white border-[#E3D9BC] hover:border-[#A68966] hover:bg-[#F4EDE6] hover:shadow-sm'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-black text-[11px] uppercase text-[#5D4E3F] truncate">
                                                {serv.nombre}
                                            </span>
                                            {esPersonalizable && (
                                                <span className="bg-amber-400 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase shrink-0">
                                                    ✨ Personalizable
                                                </span>
                                            )}
                                        </div>
                                        {serv.descripcion && (
                                            <p className="text-[10px] text-[#8C7A67] mt-1 line-clamp-2">
                                                {serv.descripcion}
                                            </p>
                                        )}
                                    </div>
                                    <span className="bg-[#5D4E3F] text-white font-black px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap shrink-0">
                                        ${Number(serv.precio).toLocaleString('es-CO')}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* PIE */}
                <div className="p-4 border-t border-[#E3D9BC]">
                    <button
                        onClick={cerrarModal}
                        className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl text-[10px] font-black uppercase text-gray-600 transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

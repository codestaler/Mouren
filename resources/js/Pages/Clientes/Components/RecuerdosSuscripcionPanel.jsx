export default function RecuerdosSuscripcionPanel({ recuerdos = [], abrirModal }) {
    // "recuerdos" aquí es la colección de la relación suscripcion.recuerdos()
    // (cada uno con su pivot.costo_unitario, según guarda tu SuscripcionMascotaController)
    const total = recuerdos.reduce(
        (sum, r) => sum + Number(r.pivot?.costo_unitario ?? r.precio_adicional ?? 0),
        0
    );

    return (
        <div className="bg-white dark:bg-[#2E2720] p-5 sm:p-6 rounded-[28px] border border-[#A68966]/15 dark:border-white/10 shadow-md">
            <div className="flex justify-between items-center border-b border-[#A68966]/15 dark:border-white/10 pb-3 mb-5">
                <h3 className="font-black text-[11px] uppercase tracking-widest text-[#5D4E3F] dark:text-[#EDE4D3] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5D4E3F] dark:bg-[#A68966]"></span>
                    Recuerdos de la Suscripción
                </h3>

                {abrirModal && (
                    <button
                        onClick={() => abrirModal("CATALOGO_RECUERDOS_MASCOTA")}
                        className="bg-[#5D4E3F] dark:bg-[#A68966] hover:bg-[#4A3E32] dark:hover:bg-[#8e7253] transition text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm"
                    >
                        + Añadir
                    </button>
                )}
            </div>

            {recuerdos.length === 0 ? (
                <div className="py-8 text-center">
                    <div className="text-3xl mb-2">🎁</div>
                    <p className="text-xs italic text-gray-400 dark:text-[#8F8368]">
                        Aún no has añadido recuerdos a esta suscripción
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {recuerdos.map((r) => (
                        <div
                            key={r.id}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-[#F4EDE6] dark:bg-[#3A322A] border border-[#A68966]/15 dark:border-white/10"
                        >
                            <img
                                src={`/images/planes/recuerdos/${r.imagen || 'default.png'}`}
                                alt={r.nombre}
                                className="w-10 h-10 object-contain shrink-0"
                                onError={(e) => { e.target.src = "/images/planes/recuerdos/default.png"; }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-[#5D4E3F] dark:text-[#EDE4D3] truncate">
                                    {r.nombre}
                                </p>
                            </div>
                            <p className="text-[11px] font-black text-[#A68966] shrink-0">
                                +${Number(r.pivot?.costo_unitario ?? r.precio_adicional ?? 0).toLocaleString('es-CO')}
                            </p>
                        </div>
                    ))}

                    <div className="pt-3 mt-3 border-t border-[#A68966]/15 dark:border-white/10 flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase text-[#5D4E3F] dark:text-[#EDE4D3]">
                            Total recuerdos
                        </span>
                        <span className="text-[15px] font-black text-[#A68966]">
                            ${total.toLocaleString('es-CO')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RecuerdoPanel({
    afiliados = [],
    todosLosRecuerdos = []
}) {
    // Cada afiliado trae su propio recuerdo (embebido en afi.recuerdo, o solo el id en afi.recuerdo_id)
    const filas = afiliados
        .map(afi => {
            const recuerdo =
                afi.recuerdo ||
                todosLosRecuerdos.find(r => r.id == afi.recuerdo_id);
            return recuerdo ? { nombre: afi.nombre, recuerdo } : null;
        })
        .filter(Boolean);

    const total = filas.reduce(
        (sum, f) => sum + Number(f.recuerdo.precio_adicional || 0),
        0
    );

    return (
        <div
            className="
                bg-white
                p-6
                rounded-[34px]
                border
                border-[#ECE4D8]
                shadow-[0_8px_25px_rgba(88,62,44,0.08)]
            "
        >
            <h3 className="text-[17px] font-black text-[#4A3428] leading-tight mb-6">
                Recuerdos
                <br />
                Asignados
            </h3>

            {filas.length === 0 ? (
                <p className="text-[#8A6B51] text-sm leading-relaxed">
                    Aún no le has asignado un recuerdo a ningún protegido. Edita a cada uno desde
                    "Miembros Protegidos" para elegir el suyo.
                </p>
            ) : (
                <div className="space-y-3">
                    {filas.map((f, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-[#FBF7F1] border border-[#EFE6D3]"
                        >
                            <img
                                src={`/images/planes/recuerdos/${f.recuerdo.imagen || 'default.png'}`}
                                alt={f.recuerdo.nombre}
                                className="w-10 h-10 object-contain shrink-0"
                                onError={(e) => {
                                    e.target.src = "/images/planes/recuerdos/default.png";
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-[#4A3428] truncate">
                                    {f.nombre}
                                </p>
                                <p className="text-[10px] text-[#8A6B51] truncate">
                                    {f.recuerdo.nombre}
                                </p>
                            </div>
                            <p className="text-[11px] font-black text-[#B15E3D] shrink-0">
                                +${Number(f.recuerdo.precio_adicional).toLocaleString('es-CO')}
                            </p>
                        </div>
                    ))}

                    <div className="pt-3 mt-3 border-t border-[#EFE6D3] flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase text-[#4A3428]">
                            Total recuerdos
                        </span>
                        <span className="text-[15px] font-black text-[#B15E3D]">
                            ${total.toLocaleString('es-CO')}
                        </span>
                    </div>
                </div>
            )}

            <p className="text-[9px] text-[#A68966] mt-4 italic">
                Para cambiar el recuerdo de un protegido, edítalo desde "Miembros Protegidos".
            </p>
        </div>
    );
}

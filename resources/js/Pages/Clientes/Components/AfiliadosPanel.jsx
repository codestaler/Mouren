export default function AfiliadosPanel({
    afiliados,
    canciones,
    maxAfiliadosIncluidos,
    cantidadAfiliadosExtras,
    iniciarEdicionAfiliado,
    ventanaConfirmarQuitar,
    abrirModal,
    setFormAfiliado
}) {
    return (
        <div
            className="
                bg-gradient-to-br
                from-[#FFFDF8]
                via-[#FFF9F0]
                to-[#FAF4EA]
                p-6
                rounded-[32px]
                border
                border-[#E8DFC8]
                shadow-lg
            "
        >
            {/* Header */}

            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E8DFC8]">
                <div>
                    <h3 className="font-black text-[16px] tracking-[0.2px] text-[#5A4632]">
                        Miembros Protegidos
                    </h3>

                    <p className="text-[11px] text-[#B6781D] font-bold mt-1">
                        ✨ Afiliados extra: {cantidadAfiliadosExtras}
                    </p>
                </div>

                <button
                    onClick={() => {
                        setFormAfiliado({
                            id: null,
                            nombre: '',
                            parentesco: '',
                            observacion_funeraria: '',
                            cancion_id: ''
                        });

                        abrirModal('FORMULARIO_AFILIADO');
                    }}
                    className="
                        px-4
                        py-2
                        rounded-2xl
                        bg-gradient-to-r
                        from-[#5A4632]
                        to-[#7A6145]
                        text-white
                        text-[11px]
                        font-black
                        uppercase
                        shadow-md
                        hover:scale-105
                        hover:shadow-xl
                        transition-all
                        duration-300
                    "
                >
                    + Inscribir Miembro
                </button>
            </div>

            {/* Cards */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {afiliados.map((afi, idx) => {
                    const esExtra =
                        idx >= maxAfiliadosIncluidos;

                    const dataFuneraria =
                        afi.servicio_funerario || {};

                    const cancion =
                        canciones.find(
                            c => c.id == dataFuneraria.cancion_id
                        )?.titulo || 'Sin canción';

                    return (
                        <div
                            key={afi.id}
                            className={`
                                relative
                                overflow-hidden
                                rounded-[26px]
                                border
                                p-4
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-xl

                                ${
                                    esExtra
                                        ? `
                                            bg-gradient-to-br
                                            from-[#FFF4D8]
                                            to-[#FFE9C4]
                                            border-[#E8B44D]
                                          `
                                        : `
                                            bg-white/80
                                            backdrop-blur-sm
                                            border-[#EFE6D3]
                                          `
                                }
                            `}
                        >
                            {/* Mancha artística */}

                            <div
                                className="
                                    absolute
                                    -top-10
                                    -right-10
                                    w-28
                                    h-28
                                    rounded-full
                                    bg-[#6F9FCF]/10
                                "
                            />

                            <div
                                className="
                                    absolute
                                    -bottom-8
                                    -left-8
                                    w-24
                                    h-24
                                    rounded-full
                                    bg-[#D96C4F]/10
                                "
                            />

                            {esExtra && (
                                <div
                                    className="
                                        absolute
                                        top-3
                                        right-3
                                        bg-[#E8B44D]
                                        text-white
                                        px-2
                                        py-1
                                        rounded-full
                                        text-[9px]
                                        font-black
                                        uppercase
                                    "
                                >
                                    Extra
                                </div>
                            )}

                            <div className="relative flex gap-4">
                                {/* Avatar */}

                                <div
                                    className="
                                        w-14
                                        h-14
                                        rounded-full
                                        flex
                                        items-center
                                        justify-center
                                        bg-gradient-to-br
                                        from-[#E8B44D]
                                        via-[#D96C4F]
                                        to-[#6F9FCF]
                                        shadow-md
                                        p-2
                                    "
                                >
                                    <img
                                        src="/images/elementos_dashboard/detalles_plan/iconos_afiliados.png"
                                        alt=""
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <div className="flex-1">
                                    <h4
                                        className="
                                            text-sm
                                            font-black
                                            uppercase
                                            text-[#5A4632]
                                        "
                                    >
                                        {afi.nombre}
                                    </h4>

                                    <p
                                        className="
                                            text-[11px]
                                            text-[#8C7A67]
                                            font-semibold
                                        "
                                    >
                                        {afi.parentesco}
                                    </p>

                                    <div className="mt-3 space-y-2">
                                        <div
                                            className="
                                                flex
                                                items-start
                                                gap-2
                                                text-[11px]
                                            "
                                        >
                                            <span>📝</span>

                                            <span className="text-[#6A5A48]">
                                                {dataFuneraria.observaciones ||
                                                    'Sin observaciones'}
                                            </span>
                                        </div>

                                        <div
                                            className="
                                                flex
                                                items-start
                                                gap-2
                                                text-[11px]
                                            "
                                        >
                                            <span>🎵</span>

                                            <span className="text-[#6A5A48]">
                                                {cancion}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}

                            <div
                                className="
                                    mt-4
                                    pt-3
                                    border-t
                                    border-[#EFE6D3]
                                    flex
                                    justify-end
                                    gap-3
                                "
                            >
                                <button
                                    onClick={() =>
                                        iniciarEdicionAfiliado(afi)
                                    }
                                    className="
                                        px-3
                                        py-1.5
                                        rounded-xl
                                        bg-[#6F9FCF]/15
                                        text-[#4D78A3]
                                        font-bold
                                        text-[11px]
                                        hover:bg-[#6F9FCF]/25
                                        transition
                                    "
                                >
                                    Editar
                                </button>

                                {afi.parentesco?.toLowerCase() !==
                                    'titular' && (
                                    <button
                                        onClick={() =>
                                            ventanaConfirmarQuitar(afi)
                                        }
                                        className="
                                            px-3
                                            py-1.5
                                            rounded-xl
                                            bg-[#D96C4F]/15
                                            text-[#C24D35]
                                            font-bold
                                            text-[11px]
                                            hover:bg-[#D96C4F]/25
                                            transition
                                        "
                                    >
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
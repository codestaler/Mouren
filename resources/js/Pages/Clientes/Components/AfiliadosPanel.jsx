export default function AfiliadosPanel({
    afiliados,
    canciones,
    todosLosRecuerdos = [],
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
                bg-[#FFFFFF]
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
                            cancion_id: '',
                            recuerdo_id: '',
                            genero_id: '',
                            tipo_documento_id: '',
                            cedula: '',
                            fecha_nacimiento: ''
                        });

                        abrirModal('FORMULARIO_AFILIADO');
                    }}
                    className="
                        px-4
                        py-2
                        rounded-2xl
                        bg-[#5A4632]
                        text-white
                        text-[11px]
                        font-black
                        uppercase
                        shadow-md
                        hover:bg-[#6E5540]
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

                    const esFallecido = afi.estado?.toLowerCase() === 'fallecido';

                    const dataFuneraria =
                        afi.servicio_funerario || {};

                    const cancionIdActual = afi.cancion_id ?? dataFuneraria.cancion_id;
                    const observacionesActuales = afi.observacion_funeraria ?? dataFuneraria.observaciones;

                    const cancion =
                        canciones.find(
                            c => c.id == cancionIdActual
                        )?.titulo || 'Sin canción';

                    // Recuerdo propio de ESTE afiliado (viene embebido o lo buscamos por id)
                    const recuerdoIdActual = afi.recuerdo_id ?? dataFuneraria.recuerdo_id;
                    const recuerdoNombre =
                        afi.recuerdo?.nombre ||
                        todosLosRecuerdos.find(r => r.id == recuerdoIdActual)?.nombre ||
                        'Sin recuerdo asignado';

                    return (
                        <div
                            key={afi.id}
                            className={`
                                group
                                relative
                                overflow-hidden
                                rounded-[26px]
                                border
                                p-4
                                bg-white
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-xl

                               ${
                                    esFallecido
                                        ? 'border-[#E8C468] hover:shadow-[0_0_25px_-5px_rgba(232,196,104,0.6)]'
                                        : esExtra
                                        ? 'border-[#5A4632]'
                                        : 'border-[#EFE6D3]'
                                }
                            `}
                        >
                            {/* Franja lateral de color según estado, en vez de manchas degradadas */}

                            <div
                                className={`
                                    absolute
                                    top-0
                                    left-0
                                    h-full
                                    w-1.5
                                    ${esFallecido ? 'bg-[#E8C468]' : 'bg-[#5A4632]'}
                                `}
                            />

                            {esExtra && !esFallecido && (
                                <div
                                    className="
                                        absolute
                                        top-3
                                        right-3
                                        bg-[#5A4632]
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

                            {esFallecido && !esExtra && (
                                <div
                                    className="
                                        absolute
                                        top-3
                                        right-3
                                        bg-[#E8C468]
                                        text-[#5A4020]
                                        px-2
                                        py-1
                                        rounded-full
                                        text-[9px]
                                        font-black
                                        uppercase
                                    "
                                >
                                    En memoria
                                </div>
                            )}

                            {/* Overlay de homenaje al hacer hover, solo para fallecidos */}
                            {esFallecido && (
                                <div
                                    className="
                                        absolute inset-0 z-20
                                        flex flex-col items-center justify-center gap-2
                                        bg-[#FFF8E1]
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity duration-500
                                        text-center px-6
                                    "
                                >
                                    <span className="text-2xl">🕯️✨</span>
                                    <p className="text-[12px] font-black text-[#8A6B22] uppercase tracking-wide">
                                        En memoria de {afi.nombre}
                                    </p>
                                    <p className="text-[10px] italic text-[#8A6B22]/80 leading-snug">
                                        Su recuerdo permanece protegido y en paz.
                                    </p>
                                </div>
                            )}

                            <div className="relative flex gap-4 pl-2">
                                {/* Avatar */}

                                <div
                                    className={`
                                        w-14
                                        h-14
                                        rounded-full
                                        flex
                                        items-center
                                        justify-center
                                        shadow-md
                                        p-2
                                        ${esFallecido
                                            ? 'bg-[#E8C468]'
                                            : 'bg-[#5A4632]'
                                        }
                                    `}
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

                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                        esFallecido
                                            ? 'bg-[#E8C468] text-[#5A4020]'
                                            : afi.estado?.toLowerCase() === 'activo'
                                            ? 'bg-[#5A4632] text-white'
                                            : 'bg-red-100 text-red-600'
                                    }`}>
                                        {esFallecido ? '🕯️ ' : ''}{afi.estado || 'Sin estado'}
                                    </span>

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
                                                {observacionesActuales ||
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

                                        <div
                                            className="
                                                flex
                                                items-start
                                                gap-2
                                                text-[11px]
                                            "
                                        >
                                            <span>🎁</span>

                                            <span className="text-[#6A5A48]">
                                                {recuerdoNombre}
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
                                    justify-between
                                    items-center
                                    gap-3
                                    relative
                                    pl-2
                                "
                            >
                                {esFallecido ? (
                                    <p className="text-[10px] italic text-[#8A6B22] font-bold">
                                        🕊️ Registro conservado, sin cambios permitidos
                                    </p>
                                ) : (
                                    <div />
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() =>
                                            iniciarEdicionAfiliado(afi)
                                        }
                                        disabled={esFallecido}
                                        className={`
                                            px-3
                                            py-1.5
                                            rounded-xl
                                            font-bold
                                            text-[11px]
                                            transition
                                            ${esFallecido
                                                ? 'bg-[#E8C468]/30 text-[#8A6B22]/50 cursor-not-allowed'
                                                : 'bg-[#5A4632] text-white hover:bg-[#6E5540]'
                                            }
                                        `}
                                    >
                                        Editar
                                    </button>

                                    {afi.parentesco?.toLowerCase() !== 'titular' && (
                                        <button
                                            onClick={() =>
                                                ventanaConfirmarQuitar(afi)
                                            }
                                            disabled={esFallecido}
                                            className={`
                                                px-3
                                                py-1.5
                                                rounded-xl
                                                font-bold
                                                text-[11px]
                                                transition
                                                ${esFallecido
                                                    ? 'bg-[#E8C468]/30 text-[#8A6B22]/50 cursor-not-allowed'
                                                    : 'bg-[#D96C4F]/15 text-[#C24D35] hover:bg-[#D96C4F]/25'
                                                }
                                            `}
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

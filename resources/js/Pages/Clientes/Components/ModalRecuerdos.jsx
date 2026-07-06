export default function ModalRecuerdos({
    visible,
    todosLosRecuerdos,
    setRecuerdosSeleccionados,
    cerrarModal
}) {
    if (!visible) return null;

    return (
        <div
            className="
                fixed inset-0
                bg-black/60
                backdrop-blur-sm
                z-50
                flex
                items-center
                justify-center
                p-4
            "
        >
            <div
                className="
                    relative
                    overflow-hidden
                    bg-gradient-to-br
                    from-[#FFFDF8]
                    via-[#FFF8EF]
                    to-[#FAF2E6]
                    p-6
                    rounded-[32px]
                    max-w-md
                    w-full
                    border
                    border-[#E8DFC8]
                    shadow-[0_20px_60px_rgba(0,0,0,.18)]
                "
            >
                {/* Decoraciones */}

                <div
                    className="
                        absolute
                        -top-16
                        -right-16
                        w-40
                        h-40
                        rounded-full
                        bg-[#6F9FCF]/10
                    "
                />

                <div
                    className="
                        absolute
                        -bottom-16
                        -left-16
                        w-40
                        h-40
                        rounded-full
                        bg-[#D96C4F]/10
                    "
                />

                {/* Header */}

                <div className="relative mb-5">
                    <h4
                        className="
                            font-black
                            text-sm
                            uppercase
                            tracking-[2px]
                            text-[#5A4632]
                        "
                    >
                        🎨 Catálogo de Recuerdos
                    </h4>

                    <p
                        className="
                            text-[11px]
                            text-[#8B7355]
                            mt-1
                        "
                    >
                        Elige el recuerdo que mejor represente la historia y el legado.
                    </p>

                    <div className="mt-3 h-px bg-gradient-to-r from-[#E8B44D] via-[#D96C4F] to-[#6F9FCF]" />
                </div>

                {/* Catálogo */}

                <div
                    className="
                        relative
                        space-y-3
                        max-h-[380px]
                        overflow-y-auto
                        pr-1
                    "
                >
                    {todosLosRecuerdos.length === 0 ? (
                        <div
                            className="
                                py-10
                                text-center
                                text-[#9B8B76]
                                italic
                            "
                        >
                            No hay recuerdos registrados.
                        </div>
                    ) : (
                        todosLosRecuerdos.map((rec) => (
                            <div
                                key={rec.id}
                                onClick={() => {
                                    setRecuerdosSeleccionados(rec);
                                    cerrarModal();
                                }}
                                className="
                                    group
                                    relative
                                    cursor-pointer
                                    rounded-[22px]
                                    border
                                    border-[#EFE6D3]
                                    bg-white/80
                                    backdrop-blur-sm
                                    p-3
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:shadow-xl
                                    hover:border-[#E8B44D]
                                "
                            >
                                <div className="flex gap-3">
                                    {/* Imagen */}

                                    <div
                                        className="
                                            relative
                                            w-16
                                            h-16
                                            rounded-2xl
                                            overflow-hidden
                                            border-2
                                            border-[#F1E5CC]
                                            bg-white
                                            shrink-0
                                        "
                                    >
                                        <img
                                            src={`/images/planes/recuerdos/${
                                                rec.imagen || 'default.png'
                                            }`}
                                            alt={rec.nombre}
                                            className="
                                                w-full
                                                h-full
                                                object-cover
                                                transition
                                                duration-500
                                                group-hover:scale-110
                                            "
                                        />
                                    </div>

                                    {/* Información */}

                                    <div className="flex-1">
                                        <h5
                                            className="
                                                font-black
                                                uppercase
                                                text-[12px]
                                                text-[#5A4632]
                                            "
                                        >
                                            {rec.nombre}
                                        </h5>

                                        <p
                                            className="
                                                text-[10px]
                                                text-[#8A7B68]
                                                mt-1
                                            "
                                        >
                                            Recuerdo conmemorativo disponible
                                            para personalizar la experiencia.
                                        </p>
                                    </div>
                                </div>

                                {/* Precio */}

                                <div
                                    className="
                                        absolute
                                        top-3
                                        right-3
                                        bg-gradient-to-r
                                        from-[#E8B44D]
                                        to-[#D89C2B]
                                        text-white
                                        px-2.5
                                        py-1
                                        rounded-full
                                        text-[10px]
                                        font-black
                                        shadow-md
                                    "
                                >
                                    $
                                    {Number(
                                        rec.precio_adicional || 0
                                    ).toLocaleString("es-CO")}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}

                <button
                    onClick={cerrarModal}
                    className="
                        w-full
                        mt-5
                        py-3
                        rounded-2xl
                        bg-gradient-to-r
                        from-[#5A4632]
                        to-[#7A6145]
                        text-white
                        text-[11px]
                        font-black
                        uppercase
                        tracking-wide
                        hover:scale-[1.02]
                        transition-all
                    "
                >
                    Cerrar Catálogo
                </button>
            </div>
        </div>
    );
}
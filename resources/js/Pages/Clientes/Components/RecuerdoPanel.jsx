export default function RecuerdoPanel({
    recuerdosSeleccionados,
    abrirModal
}) {
    return (
        <div
            className="
                group
                relative
                bg-white
                p-6
                rounded-[34px]
                border
                border-[#ECE4D8]
                min-h-[520px]
                flex
                flex-col
                text-center
                overflow-hidden
                shadow-[0_8px_25px_rgba(88,62,44,0.08)]
                hover:shadow-[
                    -15px_-15px_35px_rgba(255,179,179,0.35),
                    15px_-15px_35px_rgba(184,216,255,0.35),
                    0px_18px_35px_rgba(255,233,168,0.35)
                ]
                hover:-translate-y-1
                transition-all
                duration-700
            "
        >
            {/* halos hover */}
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[#FFB3B3] blur-3xl opacity-0 group-hover:opacity-40 transition-all duration-700" />
            <div className="absolute top-0 -right-10 w-32 h-32 rounded-full bg-[#B8D8FF] blur-3xl opacity-0 group-hover:opacity-40 transition-all duration-700" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-[#FFE9A8] blur-3xl opacity-0 group-hover:opacity-40 transition-all duration-700" />

            {/* decoración café */}
            <div className="absolute top-[-50px] right-[-50px] w-36 h-36 bg-[#F4E5D6] rounded-full blur-2xl opacity-50" />
            <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-[#EAD9C3] rounded-full blur-2xl opacity-40" />

            {/* título */}
            <div className="relative z-10 mb-8">
                <h3 className="text-[17px] font-black text-[#4A3428] leading-tight">
                    Recuerdo
                    <br />
                    Seleccionado
                </h3>
            </div>

            {recuerdosSeleccionados ? (
                <div className="relative z-10 flex flex-col items-center flex-1">

                    {/* zona artística */}
                    <div className="relative w-[240px] h-[220px] mb-10">

                        {/* fondo suave */}
                        <div className="absolute inset-0 rounded-[24px] bg-[#F8EFEF]" />

                        {/* capa amarilla con forma del recuerdo */}
                        <div
                            className="absolute"
                            style={{
                                width: "140px",
                                height: "220px",
                                top: "20px",
                                left: "90px",
                                transform: "rotate(14deg)",
                                backgroundColor: "#D9BF45",
                                WebkitMaskImage: `url(/images/planes/recuerdos/${recuerdosSeleccionados.imagen})`,
                                maskImage: `url(/images/planes/recuerdos/${recuerdosSeleccionados.imagen})`,
                                WebkitMaskRepeat: "no-repeat",
                                maskRepeat: "no-repeat",
                                WebkitMaskSize: "contain",
                                maskSize: "contain",
                                WebkitMaskPosition: "center",
                                maskPosition: "center",
                                filter: "drop-shadow(0 6px 10px rgba(0,0,0,.15))"
                            }}
                        />

                        {/* capa café con forma del recuerdo */}
                        <div
                            className="absolute"
                            style={{
                                width: "140px",
                                height: "220px",
                                top: "5px",
                                left: "65px",
                                opacity:40,
                                transform: "rotate(11deg)",
                                backgroundColor: "#867869",
                                WebkitMaskImage: `url(/images/planes/recuerdos/${recuerdosSeleccionados.imagen})`,
                                maskImage: `url(/images/planes/recuerdos/${recuerdosSeleccionados.imagen})`,
                                WebkitMaskRepeat: "no-repeat",
                                maskRepeat: "no-repeat",
                                WebkitMaskSize: "contain",
                                maskSize: "contain",
                                WebkitMaskPosition: "center",
                                maskPosition: "center",
                                filter: "drop-shadow(0 8px 12px rgba(0,0,0,.18))"
                            }}
                        />

                        {/* sombra del recuerdo */}
                        <img
                            src={`/images/planes/recuerdos/${recuerdosSeleccionados.imagen}`}
                            alt=""
                            aria-hidden="true"
                            className="
                                absolute
                                w-[140px]
                                h-[220px]
                                object-contain
                                rotate-[11deg]
                                left-[50px]
                                top-[12px]
                                opacity-20
                                blur-md
                                pointer-events-none
                            "
                        />

                        {/* recuerdo principal */}
                        <img
                            src={`/images/planes/recuerdos/${recuerdosSeleccionados.imagen}`}
                            alt={recuerdosSeleccionados.nombre}
                            className="
                                absolute
                                w-[160px]
                                h-[240px]
                                object-contain
                                rotate-[11deg]
                                left-[40px]
                                -top-[20px]
                                drop-shadow-[0_22px_18px_rgba(0,0,0,0.20)]
                                group-hover:scale-105
                                group-hover:rotate-[10deg]
                                transition-all
                                duration-700
                            "
                            onError={(e) => {
                                e.target.src =
                                    "/images/planes/recuerdos/default.png";
                            }}
                        />
                    </div>

                    {/* nombre */}
                    <h4 className="text-[18px] font-black text-[#4A3428] leading-tight">
                        {recuerdosSeleccionados.nombre}
                    </h4>

                    {/* descripción */}
                    <p className="mt-4 text-[15px] leading-relaxed text-[#8A6B51] max-w-[260px]">
                        {recuerdosSeleccionados.descripcion}
                    </p>

                    {/* precio */}
                    <div className="mt-6 px-5 py-2.5 mb-4 rounded-full bg-[#F4E7D7] border border-[#E8D9C6] text-[#B15E3D] font-black text-lg shadow-sm">
                        + $
                        {Number(
                            recuerdosSeleccionados.precio_adicional ||
                            recuerdosSeleccionados.pivot?.costo_unitario ||
                            0
                        ).toLocaleString("es-CO")}
                        {" "}COP
                    </div>

                    {/* botón */}
                    <button
                        onClick={() => abrirModal("SELECHAIN_RECUERDO_BD")}
                        className="
                            mt-auto
                            w-full
                            max-w-[260px]
                            py-4
                            rounded-[18px]
                            bg-[#5A3F30]
                            text-white
                            text-xs
                            font-black
                            uppercase
                            tracking-wider
                            shadow-lg
                            hover:bg-[#C47A5A]
                            transition-all
                            duration-300
                        "
                    >
                        Cambiar Recuerdo
                    </button>
                </div>
            ) : (
                <div className="flex flex-col flex-1 items-center justify-center">
                    <div className="w-40 h-40 rounded-[24px] bg-[#F8F5F1] border border-[#E7DDD1] shadow-lg mb-6" />

                    <p className="text-[#8A6B51] text-sm max-w-[240px] mb-6">
                        Aún no has seleccionado un recuerdo para esta experiencia.
                    </p>

                    <button
                        onClick={() => abrirModal("SELECHAIN_RECUERDO_BD")}
                        className="px-6 py-3 rounded-[18px] bg-[#5A3F30] text-white uppercase text-xs font-black tracking-wider"
                    >
                        Explorar Catálogo
                    </button>
                </div>
            )}
        </div>
    );
}
export default function ResumenCards({
    cuotaTotalDinamica,
    cantidadAfiliados,
    cantidadAfiliadosExtras,
    cantidadServiciosTotales
}) {

    const getEstadoServicios = () => {
        if (cantidadServiciosTotales === 0) return "Sin actividad aún";
        if (cantidadServiciosTotales < 3) return "Iniciando experiencia";
        if (cantidadServiciosTotales < 6) return "Actividad en crecimiento";
        return "Sistema completamente activo";
    };

    const getColorServicios = () => {
        if (cantidadServiciosTotales === 0) return "bg-[#C9A18A]";
        if (cantidadServiciosTotales < 3) return "bg-[#D9BF45]";
        if (cantidadServiciosTotales < 6) return "bg-[#7FB7A3]";
        return "bg-[#5E7F72]";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 relative z-20">

            {/* ================= CUOTA ================= */}
            <div className="
    relative overflow-visible
    bg-gradient-to-br from-[#3E3428] via-[#5A4A36] to-[#7A6650]
    text-white p-6 rounded-[28px]
    min-h-[125px]
    flex flex-col justify-between
    shadow-[0_20px_40px_rgba(0,0,0,0.25)]
    hover:-translate-y-1 hover:scale-[1.02]
    transition-all duration-300 group
">

                {/* textura */}
                <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('/images/texturas/papel_grano.png')]" />

                {/* glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFC107] blur-3xl opacity-20 rounded-full" />

                {/* imagen decorativa */}
                <img
                    src="/images/elementos_dashboard/detalles_plan/flores_esquinas_tarjetas.webp"
                    className="absolute top-[-15px] right-[-10px] w-44 opacity-70 rotate-6 group-hover:scale-110 transition"
                />

                {/* título */}
                <span className="text-[12px] uppercase tracking-[0.2em] font-black text-[#FFD36A] z-30">
                    Cuota Total <br />Dinámica
                </span>

                {/* valor */}
                <span className="text-3xl font-black text-left relative z-10">
                    {Number(cuotaTotalDinamica || 0).toLocaleString("es-CO")}
                    <span className="text-[10px] ml-1 opacity-80">COP</span>
                </span>

                {/* ================= TOOLTIP (ESPACIO LIBRE PARA TI) ================= */}
                {/* Burbuja informativa */}
                <div
                    className="
        absolute
        -top-28
        left-1/2
        -translate-x-1/2

        w-[260px]

        opacity-0
        scale-95
        translate-y-2

        group-hover:opacity-100
        group-hover:scale-100
        group-hover:translate-y-0

        transition-all
        duration-300

        pointer-events-none
        z-50
    "
                >
                    <div
                        className="
            relative

            bg-[#FFF9F2]
            text-[#4A3428]

            rounded-[24px]

            px-5
            py-4

            border-2
            border-[#E8D9C6]

            shadow-[0_15px_30px_rgba(0,0,0,0.15)]
        "
                    >
                        {/* comillas decorativas */}
                        <span
                            className="
                absolute
                top-2
                left-3

                text-4xl
                leading-none

                text-[#D9BF45]
                opacity-40
                font-black
            "
                        >
                            "
                        </span>

                        <p
                            className="
                text-[12px]
                leading-relaxed
                pl-4
            "
                        >
                            Aquí puedes escribir una explicación larga sobre cómo se calcula
                            esta cuota, qué servicios influyen en el valor final y cualquier
                            detalle que quieras compartir con el usuario.
                        </p>

                        {/* piquito tipo comic */}
                        <div
                            className="
                absolute
                -bottom-3
                left-1/2
                -translate-x-1/2

                w-6
                h-6

                bg-[#FFF9F2]

                border-r-2
                border-b-2
                border-[#E8D9C6]

                rotate-45
            "
                        />
                    </div>
                </div>

            </div>

            {/* ================= AFILIADOS ================= */}
            <div className="
                relative overflow-visible
                bg-gradient-to-br from-[#4A3D2F] via-[#6B5642] to-[#A07C8A]
                text-white p-6 rounded-[28px]
                min-h-[125px]
                flex flex-col justify-between
                shadow-[0_20px_40px_rgba(0,0,0,0.25)]
                hover:-translate-y-1 hover:scale-[1.02]
                transition-all duration-300 group
            ">

                <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('/images/texturas/papel_grano.png')]" />

                <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#C49A6C] blur-3xl opacity-20 rounded-full" />

                <img
                    src="/images/elementos_dashboard/detalles_plan/flores_centro.png"
                    className="absolute bottom-[-12px] right-[-22px] w-44 opacity-80 "
                />

                <span className="text-[13px] uppercase tracking-[0.2em] font-black z-30"> 
                    Miembros Registrados
                </span>

                <span className="text-3xl font-black text-left z-30">
                    {cantidadAfiliados}

                    {cantidadAfiliadosExtras > 0 && (
                        <span className="block text-xs text-[#FFE3A3] mt-1">
                            +{cantidadAfiliadosExtras} extras
                        </span>
                    )}
                </span>
            </div>

            {/* ================= SERVICIOS ================= */}
            <div className="
                relative overflow-visible
                bg-gradient-to-br from-[#4B3D2F] via-[#6C5A45] to-[#5E7F72]
                text-white p-6 rounded-[28px]
                min-h-[125px]
                flex flex-col justify-between
                shadow-[0_20px_40px_rgba(0,0,0,0.25)]
                hover:-translate-y-1 hover:scale-[1.02]
                transition-all duration-300 group
            ">

                {/* textura */}
                <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('/images/texturas/papel_grano.png')]" />

                {/* energía visual */}
                <div className="absolute -top-10 -left-10 w-44 h-44 bg-[#7FB7A3] blur-3xl opacity-20 rounded-full" />
                <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-[#C9B37E] blur-3xl opacity-20 rounded-full" />

                <img
                    src="/images/elementos_dashboard/detalles_plan/lirios_colgantes.png"
                    className="absolute top-[-30px] right-[-15px] w-40 opacity-60 "
                />

                <span className="text-[13px] uppercase tracking-[0.2em] font-black z-30">
                    Servicios Activos
                </span>

                {/* número + estado */}
                <div className="text-left relative z-10">
                    <span className="text-3xl font-black block">
                        {cantidadServiciosTotales}
                    </span>

                    <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${getColorServicios()}`}
                    >
                        {getEstadoServicios()}
                    </span>
                </div>

            </div>

        </div>
    );
}
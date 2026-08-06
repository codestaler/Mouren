export default function ResumenCardsMascota({
    cuotaTotalDinamica,
    cantidadMascotas,
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
        if (cantidadServiciosTotales < 3) return "bg-[#D9B44A]";
        if (cantidadServiciosTotales < 6) return "bg-[#8C6F4F]";
        return "bg-[#5D4E3F]";
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-20">

            {/* ================= CUOTA ================= */}
            <div className="
                relative overflow-visible
                bg-gradient-to-br from-[#302A1D] via-[#5D4E3F] to-[#8C6F4F]
                text-white p-5 rounded-[22px]
                min-h-[100px]
                flex flex-col justify-between
                shadow-[0_15px_30px_rgba(0,0,0,0.2)]
                hover:-translate-y-1 hover:scale-[1.02]
                transition-all duration-300 group
            ">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#FFD97D] blur-3xl opacity-20 rounded-full pointer-events-none" />

                <span className="text-[10px] uppercase tracking-[0.15em] font-black text-[#FFD97D] relative z-10">
                    Cuota Total Dinámica
                </span>

                <span className="text-2xl font-black text-left relative z-10">
                    ${Number(cuotaTotalDinamica || 0).toLocaleString("es-CO")}
                    <span className="text-[9px] ml-1 opacity-80 font-normal">COP</span>
                </span>
            </div>

            {/* ================= MASCOTAS ================= */}
            <div className="
                relative overflow-hidden
                bg-gradient-to-br from-[#4A3E32] via-[#6E5540] to-[#A68966]
                text-white p-5 rounded-[22px]
                min-h-[100px]
                flex flex-col justify-between
                shadow-[0_15px_30px_rgba(0,0,0,0.2)]
                hover:-translate-y-1 hover:scale-[1.02]
                transition-all duration-300 group
            ">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FFD97D] blur-3xl opacity-15 rounded-full pointer-events-none" />

                <span className="text-[10px] uppercase tracking-[0.15em] font-black relative z-10">
                    🐾 Mascotas Protegidas
                </span>

                <span className="text-2xl font-black text-left relative z-10">
                    {cantidadMascotas}
                </span>
            </div>

            {/* ================= SERVICIOS ================= */}
            <div className="
                relative overflow-hidden
                bg-gradient-to-br from-[#302A1D] via-[#4A3E32] to-[#5D4E3F]
                text-white p-5 rounded-[22px]
                min-h-[100px]
                flex flex-col justify-between
                shadow-[0_15px_30px_rgba(0,0,0,0.2)]
                hover:-translate-y-1 hover:scale-[1.02]
                transition-all duration-300 group
            ">
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#8C6F4F] blur-3xl opacity-20 rounded-full pointer-events-none" />

                <span className="text-[10px] uppercase tracking-[0.15em] font-black relative z-10">
                    Servicios Activos
                </span>

                <div className="text-left relative z-10">
                    <span className="text-2xl font-black block">
                        {cantidadServiciosTotales}
                    </span>
                    <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white ${getColorServicios()}`}>
                        {getEstadoServicios()}
                    </span>
                </div>
            </div>

        </div>
    );
}

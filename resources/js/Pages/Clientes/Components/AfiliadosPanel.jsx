import { useState } from "react";

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
    // 🆕 Estado puramente visual: qué tarjeta está expandida mostrando el detalle completo
    // (observaciones, canción, botones editar/eliminar). No toca ninguna lógica del padre.
    const [expandidoId, setExpandidoId] = useState(null);

    const toggleExpandido = (id) => {
        setExpandidoId(prev => (prev === id ? null : id));
    };

    return (
        <div className="bg-white dark:bg-[#2E2720] p-5 sm:p-6 rounded-[28px] border border-[#A68966]/15 dark:border-white/10 shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-start gap-3 mb-5 pb-4 border-b border-[#A68966]/15 dark:border-white/10">
                <div className="min-w-0">
                    <h3 className="font-black text-[15px] tracking-[0.2px] text-[#5D4E3F] dark:text-[#EDE4D3]">
                        Miembros Protegidos
                    </h3>
                    <p className="text-[10px] text-[#A68966] font-bold mt-1">
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
                    className="shrink-0 px-3 py-2 rounded-xl bg-[#5D4E3F] dark:bg-[#A68966] text-white text-[10px] font-black uppercase shadow-md hover:bg-[#4A3E32] dark:hover:bg-[#8e7253] hover:scale-105 transition-all duration-300"
                >
                    + Inscribir
                </button>
            </div>

            {/* Lista compacta, una fila por afiliado */}
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar-afiliados">
                {afiliados.map((afi, idx) => {
                    const esExtra = idx >= maxAfiliadosIncluidos;
                    const esFallecido = afi.estado?.toLowerCase() === 'fallecido';
                    const esTitular = afi.parentesco?.toLowerCase() === 'titular';
                    const expandido = expandidoId === afi.id;

                    const dataFuneraria = afi.servicio_funerario || {};
                    const cancionIdActual = afi.cancion_id ?? dataFuneraria.cancion_id;
                    const observacionesActuales = afi.observacion_funeraria ?? dataFuneraria.observaciones;
                    const cancion = canciones.find(c => c.id == cancionIdActual)?.titulo || 'Sin canción';

                    // 🆕 Recuerdo propio de este afiliado, con imagen + valor, mostrado directo en la fila
                    const recuerdoIdActual = afi.recuerdo_id ?? dataFuneraria.recuerdo_id;
                    const recuerdo = afi.recuerdo || todosLosRecuerdos.find(r => r.id == recuerdoIdActual);

                    return (
                        <div
                            key={afi.id}
                            className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                                esFallecido
                                    ? 'border-[#FFD97D]/60 bg-[#FFFBF0] dark:bg-[#3A322A]'
                                    : esExtra
                                    ? 'border-[#5D4E3F]/40 dark:border-[#A68966]/40 bg-white dark:bg-[#221D17]'
                                    : 'border-[#A68966]/15 dark:border-white/10 bg-white dark:bg-[#221D17]'
                            }`}
                        >
                            {/* franja lateral de estado */}
                            <div className={`absolute top-0 left-0 h-full w-1 ${esFallecido ? 'bg-[#FFD97D]' : 'bg-[#5D4E3F] dark:bg-[#A68966]'}`} />

                            {/* FILA PRINCIPAL: clic para expandir/colapsar */}
                            <button
                                type="button"
                                onClick={() => toggleExpandido(afi.id)}
                                className="w-full flex items-center gap-3 p-3 pl-4 text-left"
                            >
                                {/* Avatar */}
                                <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center shadow-sm p-2 ${esFallecido ? 'bg-[#FFD97D]' : 'bg-[#5D4E3F] dark:bg-[#A68966]'}`}>
                                    <img
                                        src="/images/elementos_dashboard/detalles_plan/iconos_afiliados.png"
                                        alt=""
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[12px] font-black uppercase text-[#5D4E3F] dark:text-[#EDE4D3] truncate">
                                            {afi.nombre}
                                        </h4>
                                        {esExtra && !esFallecido && (
                                            <span className="shrink-0 bg-[#5D4E3F] dark:bg-[#A68966] text-white px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase">Extra</span>
                                        )}
                                        {esFallecido && (
                                            <span className="shrink-0 bg-[#FFD97D] text-[#5A4020] px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase">En memoria</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-[#8C7A67] dark:text-[#C2B49A] font-semibold truncate">
                                        {afi.parentesco} {afi.estado ? `• ${afi.estado}` : ''}
                                    </p>

                                    {/* 🆕 Recuerdo + valor, visible directo en la fila (sin tener que expandir) */}
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {recuerdo ? (
                                            <>
                                                <img
                                                    src={`/images/planes/recuerdos/${recuerdo.imagen || 'default.png'}`}
                                                    alt=""
                                                    className="w-4 h-4 object-contain shrink-0"
                                                    onError={(e) => { e.target.src = "/images/planes/recuerdos/default.png"; }}
                                                />
                                                <span className="text-[9px] text-[#6A5A48] dark:text-[#C2B49A] truncate">{recuerdo.nombre}</span>
                                                <span className="text-[9px] font-black text-[#A68966] shrink-0">
                                                    +${Number(recuerdo.precio_adicional || 0).toLocaleString('es-CO')}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-[9px] text-[#8C7A67] dark:text-[#8F8368] italic">Sin recuerdo asignado</span>
                                        )}
                                    </div>
                                </div>

                                <span className={`shrink-0 text-[#A68966] text-xs transition-transform duration-300 ${expandido ? 'rotate-180' : ''}`}>▾</span>
                            </button>

                            {/* DETALLE EXPANDIBLE: observaciones, canción, editar/eliminar */}
                            <div className={`grid transition-all duration-300 ease-out ${expandido ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="px-4 pb-4 pt-1 space-y-2 border-t border-[#A68966]/10 dark:border-white/10 ml-1">
                                        {esFallecido ? (
                                            <p className="text-[10px] italic text-[#8A6B22] dark:text-[#FFD97D] font-bold flex items-center gap-1.5 pt-2">
                                                🕊️ Registro conservado, sin cambios permitidos
                                            </p>
                                        ) : (
                                            <>
                                                <div className="flex items-start gap-2 text-[10px] pt-2">
                                                    <span>📝</span>
                                                    <span className="text-[#6A5A48] dark:text-[#C2B49A]">{observacionesActuales || 'Sin observaciones'}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-[10px]">
                                                    <span>🎵</span>
                                                    <span className="text-[#6A5A48] dark:text-[#C2B49A]">{cancion}</span>
                                                </div>
                                            </>
                                        )}

                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => iniciarEdicionAfiliado(afi)}
                                                disabled={esFallecido}
                                                className={`flex-1 px-3 py-1.5 rounded-xl font-bold text-[10px] transition ${
                                                    esFallecido
                                                        ? 'bg-[#FFD97D]/20 text-[#8A6B22] dark:text-[#FFD97D]/50 cursor-not-allowed'
                                                        : 'bg-[#5D4E3F] dark:bg-[#A68966] text-white hover:bg-[#4A3E32] dark:hover:bg-[#8e7253]'
                                                }`}
                                            >
                                                Editar
                                            </button>

                                            {!esTitular && (
                                                <button
                                                    onClick={() => ventanaConfirmarQuitar(afi)}
                                                    disabled={esFallecido}
                                                    className={`flex-1 px-3 py-1.5 rounded-xl font-bold text-[10px] transition ${
                                                        esFallecido
                                                            ? 'bg-[#FFD97D]/20 text-[#8A6B22] dark:text-[#FFD97D]/50 cursor-not-allowed'
                                                            : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                                                    }`}
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .custom-scrollbar-afiliados::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-afiliados::-webkit-scrollbar-thumb { background: #A68966; border-radius: 10px; }
            `}</style>
        </div>
    );
}

import React from 'react';

// 🌸 Pétalos cayendo continuamente por toda la tarjeta — puramente decorativo.
function PetalosCayendo() {
    const petalos = [
        { left: '8%', delay: '0s', duracion: '7s' },
        { left: '22%', delay: '1.5s', duracion: '9s' },
        { left: '38%', delay: '3s', duracion: '6.5s' },
        { left: '55%', delay: '0.8s', duracion: '8s' },
        { left: '70%', delay: '2.2s', duracion: '7.5s' },
        { left: '85%', delay: '4s', duracion: '9.5s' },
    ];
    return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {petalos.map((p, i) => (
                <span
                    key={i}
                    className="absolute top-0 text-lg sm:text-xl petalo-cae-sereno"
                    style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duracion }}
                >
                    🌸
                </span>
            ))}
        </div>
    );
}

// 🕯️ Velitas con brillo cálido, repartidas por la tarjeta
function VelitasBrillantes() {
    const velitas = [
        { top: '10%', left: '6%' },
        { top: '65%', left: '92%' },
        { top: '85%', left: '12%' },
    ];
    return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {velitas.map((v, i) => (
                <span
                    key={i}
                    className="absolute rounded-full velita-brillo-sereno"
                    style={{
                        top: v.top, left: v.left, width: 12, height: 12,
                        background: 'radial-gradient(circle, #FFE9A8 0%, #FFC600 45%, transparent 75%)',
                        boxShadow: '0 0 14px 4px rgba(255,198,0,0.45)',
                        animationDelay: `${i * 0.8}s`,
                    }}
                />
            ))}
        </div>
    );
}

// 🕯️ Informe de Descanso Sereno — "Jardín de tu Protección".
// Útil de verdad: muestra qué protegidos ya tienen canción + objeto de
// memoria elegidos, y cuáles todavía no. Solo lee props, no toca datos.
export default function InformeSereno({
    afiliados = [],
    serviciosExtras = [],
    todosLosRecuerdos = [],
    canciones = [],
    cuotaTotalDinamica = 0,
    onVolver,
}) {
    const totalAfiliados = afiliados.length;
    const completos = afiliados.filter(a => a.recuerdo_id && a.cancion_id).length;
    const incompletos = totalAfiliados - completos;

    const nombreRecuerdo = (a) => a.recuerdo?.nombre || todosLosRecuerdos.find(r => r.id === a.recuerdo_id)?.nombre;
    const nombreCancion = (a) => canciones.find(c => c.id === a.cancion_id)?.titulo;

    return (
        <div className="relative bg-[#F4F1ED] dark:bg-[#3A322A] text-[#5D4E3F] dark:text-[#EDE4D3] p-4 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] shadow-sm border border-[#5D4E3F]/5 dark:border-white/10 overflow-hidden min-h-full">
            {/* 🆕 Pétalos cayendo y velitas brillando de verdad */}
            <PetalosCayendo />
            <VelitasBrillantes />

            <div className="flex items-center gap-3 mb-6 sm:mb-8 relative z-10">
                <button
                    onClick={onVolver}
                    className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-black/20 border border-[#5D4E3F]/10 dark:border-white/10 shadow-sm flex items-center justify-center hover:scale-105 transition"
                    aria-label="Volver a mi gabinete"
                >
                    ←
                </button>
                <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-black italic flex items-center gap-2 truncate">🕯️ Jardín de tu Protección</h3>
                    <p className="text-[9px] sm:text-[10px] opacity-60 italic">Un vistazo tranquilo a quienes cuidas</p>
                </div>
            </div>

            {/* KPIs suaves */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6 relative z-10">
                <div className="bg-white dark:bg-black/20 rounded-2xl p-3 sm:p-4 text-center border border-[#5D4E3F]/10 dark:border-white/10">
                    <p className="text-lg sm:text-2xl font-black">{totalAfiliados}</p>
                    <p className="text-[8px] sm:text-[9px] uppercase font-bold text-[#A68966] tracking-wide">Protegidos</p>
                </div>
                <div className="bg-white dark:bg-black/20 rounded-2xl p-3 sm:p-4 text-center border border-[#5D4E3F]/10 dark:border-white/10">
                    <p className="text-lg sm:text-2xl font-black text-emerald-600">{completos}</p>
                    <p className="text-[8px] sm:text-[9px] uppercase font-bold text-[#A68966] tracking-wide">En paz 🌸</p>
                </div>
                <div className="bg-white dark:bg-black/20 rounded-2xl p-3 sm:p-4 text-center border border-[#5D4E3F]/10 dark:border-white/10">
                    <p className="text-lg sm:text-2xl font-black text-amber-600">{incompletos}</p>
                    <p className="text-[8px] sm:text-[9px] uppercase font-bold text-[#A68966] tracking-wide">Por florecer 🌱</p>
                </div>
            </div>

            {/* Mensaje sereno, útil según el estado real */}
            <div className="bg-[#5D4E3F] dark:bg-[#221D17] text-white rounded-[24px] p-4 sm:p-6 mb-6 shadow-lg relative z-10">
                <p className="text-[9px] uppercase tracking-[2px] font-bold text-[#FFD97D] mb-2 italic">🌙 Mensaje sereno</p>
                <p className="text-[11px] sm:text-[12px] leading-relaxed opacity-90">
                    {totalAfiliados === 0
                        ? 'Aún no has agregado protegidos a tu jardín.'
                        : incompletos === 0
                            ? 'Todos tus protegidos ya tienen su canción y objeto de memoria elegidos. Tu jardín está completo.'
                            : `${incompletos} de tus ${totalAfiliados} protegido${totalAfiliados > 1 ? 's' : ''} aún no tiene canción y/o objeto de memoria elegido. Puedes completarlo desde su tarjeta a la derecha cuando quieras.`}
                </p>
            </div>

            {/* El jardín: una tarjetita por afiliado */}
            <div className="bg-white dark:bg-black/20 rounded-[24px] p-4 sm:p-5 border border-[#5D4E3F]/10 dark:border-white/10 relative z-10">
                <p className="text-[9px] uppercase tracking-wider font-black text-[#A68966] mb-4">Tu jardín</p>
                {afiliados.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {afiliados.map((a, i) => {
                            const completo = a.recuerdo_id && a.cancion_id;
                            return (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-[#F4F1ED] dark:bg-white/5 border border-[#5D4E3F]/5 dark:border-white/10">
                                    <span className={`text-2xl shrink-0 ${completo ? 'flor-abierta-sereno' : ''}`}>{completo ? '🌸' : '🌱'}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-black truncate">{a.nombre}</p>
                                        <p className="text-[9px] opacity-60">{a.parentesco}</p>
                                        {nombreCancion(a) ? (
                                            <p className="text-[9px] mt-1 opacity-70 truncate">🎵 {nombreCancion(a)}</p>
                                        ) : (
                                            <p className="text-[9px] mt-1 text-amber-600 italic">Sin canción todavía</p>
                                        )}
                                        {nombreRecuerdo(a) ? (
                                            <p className="text-[9px] opacity-70 truncate">🕊️ {nombreRecuerdo(a)}</p>
                                        ) : (
                                            <p className="text-[9px] text-amber-600 italic">Sin recuerdo todavía</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-[11px] italic opacity-50 py-6 text-center">Aún no has agregado protegidos.</p>
                )}
            </div>

            {/* Cuota, con calma */}
            <div className="mt-6 text-center relative z-10">
                <p className="text-[9px] uppercase tracking-widest opacity-50 font-bold">Tu cuota mensual</p>
                <p className="text-xl sm:text-2xl font-black text-[#5D4E3F] dark:text-[#EDE4D3]">${Number(cuotaTotalDinamica).toLocaleString()}</p>
            </div>

            <style>{`
                @keyframes petaloCaeSereno {
                    0% { transform: translateY(-10%) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.7; }
                    90% { opacity: 0.7; }
                    100% { transform: translateY(650%) rotate(280deg); opacity: 0; }
                }
                .petalo-cae-sereno { animation: petaloCaeSereno linear infinite; }
                @keyframes velitaBrilloSereno {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.3); }
                }
                .velita-brillo-sereno { animation: velitaBrilloSereno 2.4s ease-in-out infinite; }
                @keyframes florAbiertaSereno {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
                .flor-abierta-sereno { display: inline-block; animation: florAbiertaSereno 3s ease-in-out infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .petalo-cae-sereno, .velita-brillo-sereno, .flor-abierta-sereno { animation: none !important; }
                }
            `}</style>
        </div>
    );
}

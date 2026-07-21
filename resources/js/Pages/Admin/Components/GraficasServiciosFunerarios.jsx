import React from 'react';
import { usePage } from '@inertiajs/react';

const TEXTOS = {
    es: {
        distribucionEtapa: 'Distribución por Etapa',
        sinDatos: 'Sin datos por ahora.',
        finalizadosMeses: 'Finalizados (últimos 6 meses)',
        salasMasUsadas: 'Salas Más Usadas',
        serviciosPorTipo: 'Servicios por Tipo',
        personas: 'Personas',
        mascotas: 'Mascotas',
        etapasDemora: 'Etapas con Más Demora (horas prom.)',
        tiempoPromedio: 'Tiempo Promedio de Servicio',
        desdeHasta: 'Desde el fallecimiento hasta finalizar',
    },
    en: {
        distribucionEtapa: 'Distribution by Stage',
        sinDatos: 'No data yet.',
        finalizadosMeses: 'Completed (last 6 months)',
        salasMasUsadas: 'Most Used Rooms',
        serviciosPorTipo: 'Services by Type',
        personas: 'People',
        mascotas: 'Pets',
        etapasDemora: 'Stages With Most Delay (avg. hours)',
        tiempoPromedio: 'Average Service Time',
        desdeHasta: 'From death to completion',
    },
};

export default function GraficasServiciosFunerarios({ estadisticas = {} }) {
    const { auth } = usePage().props;
    const idioma = auth?.user?.idioma || 'es';
    const t = TEXTOS[idioma] || TEXTOS.es;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Distribución por Etapa */}
            <div className="group bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[#F4EDE6] dark:bg-[#221D17] flex items-center justify-center text-sm">📊</span>
                    <h3 className="text-xs font-black uppercase text-[#8F7E54] dark:text-[#D9B44A] tracking-wide">{t.distribucionEtapa}</h3>
                </div>

                <div className="space-y-3">
                    {Object.entries(estadisticas.conteoPorEtapa || {}).length === 0 ? (
                        <p className="text-[10px] italic text-gray-400 py-2">{t.sinDatos}</p>
                    ) : (
                        Object.entries(estadisticas.conteoPorEtapa || {}).map(([etapa, total]) => (
                            <div key={etapa} className="flex items-center gap-2">
                                <span className="text-[10px] font-bold w-28 sm:w-32 truncate text-[#56473A] dark:text-[#EDE4D3]">{etapa}</span>
                                <div className="flex-1 bg-[#F4EDE6] dark:bg-[#221D17] h-4 rounded-full overflow-hidden">
                                    <div
                                        className="bg-[#D9B44A] h-full rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${Math.min(total * 15, 100)}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-[#56473A] dark:text-[#EDE4D3] w-5 text-right">{total}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Finalizados últimos 6 meses */}
            <div className="group bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[#F4EDE6] dark:bg-[#221D17] flex items-center justify-center text-sm">📈</span>
                    <h3 className="text-xs font-black uppercase text-[#8F7E54] dark:text-[#D9B44A] tracking-wide">{t.finalizadosMeses}</h3>
                </div>

                <div className="flex items-end justify-between gap-1 sm:gap-2 h-32">
                    {(estadisticas.finalizadosPorMes || []).length === 0 ? (
                        <p className="text-[10px] italic text-gray-400 py-2 mx-auto">{t.sinDatos}</p>
                    ) : (
                        (estadisticas.finalizadosPorMes || []).map((m, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 group/bar">
                                <span className="text-[9px] font-black mb-1 text-[#56473A] dark:text-[#EDE4D3] group-hover/bar:text-[#D9B44A] transition-colors">
                                    {m.total}
                                </span>
                                <div
                                    className="bg-[#56473A] dark:bg-[#4A4033] w-full rounded-t-md transition-all duration-700 ease-out group-hover/bar:bg-[#D9B44A]"
                                    style={{ height: `${Math.max(m.total * 20, 4)}px` }}
                                />
                                <span className="text-[9px] text-gray-500 dark:text-[#C2B49A] mt-1">{m.mes}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Salas más usadas */}
            <div className="group bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[#F4EDE6] dark:bg-[#221D17] flex items-center justify-center text-sm">🏛️</span>
                    <h3 className="text-xs font-black uppercase text-[#8F7E54] dark:text-[#D9B44A] tracking-wide">{t.salasMasUsadas}</h3>
                </div>

                <div className="space-y-3">
                    {(estadisticas.salasMasUsadas || []).length === 0 ? (
                        <p className="text-[10px] italic text-gray-400 py-2">{t.sinDatos}</p>
                    ) : (
                        (estadisticas.salasMasUsadas || []).map((s, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-[10px] font-bold w-20 sm:w-24 truncate text-[#56473A] dark:text-[#EDE4D3]">{s.sala}</span>
                                <div className="flex-1 bg-[#F4EDE6] dark:bg-[#221D17] h-4 rounded-full overflow-hidden">
                                    <div
                                        className="bg-[#6F9FCF] h-full rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${Math.min(s.total * 15, 100)}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-[#56473A] dark:text-[#EDE4D3] w-5 text-right">{s.total}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Servicios por Tipo */}
            <div className="group bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[#F4EDE6] dark:bg-[#221D17] flex items-center justify-center text-sm">🧾</span>
                    <h3 className="text-xs font-black uppercase text-[#8F7E54] dark:text-[#D9B44A] tracking-wide">{t.serviciosPorTipo}</h3>
                </div>

                <div className="flex gap-6">
                    <div className="flex flex-col items-center transition-transform duration-300 hover:scale-110">
                        <span className="text-2xl mb-1">👤</span>
                        <p className="text-2xl font-black text-[#56473A] dark:text-[#EDE4D3]">{estadisticas.serviciosPorTipo?.personas || 0}</p>
                        <p className="text-[9px] text-gray-500 dark:text-[#C2B49A] uppercase font-bold tracking-wide">{t.personas}</p>
                    </div>
                    <div className="w-px bg-[#E9DDC8] dark:bg-[#4A4033]" />
                    <div className="flex flex-col items-center transition-transform duration-300 hover:scale-110">
                        <span className="text-2xl mb-1">🐾</span>
                        <p className="text-2xl font-black text-[#D9B44A]">{estadisticas.serviciosPorTipo?.mascotas || 0}</p>
                        <p className="text-[9px] text-gray-500 dark:text-[#C2B49A] uppercase font-bold tracking-wide">{t.mascotas}</p>
                    </div>
                </div>
            </div>

            {/* Etapas con más demora */}
            <div className="group bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[#F4EDE6] dark:bg-[#221D17] flex items-center justify-center text-sm">⏱️</span>
                    <h3 className="text-xs font-black uppercase text-[#8F7E54] dark:text-[#D9B44A] tracking-wide">{t.etapasDemora}</h3>
                </div>

                <div className="space-y-2.5">
                    {Object.entries(estadisticas.demoraPromedioPorEtapa || {}).length === 0 ? (
                        <p className="text-[10px] italic text-gray-400 py-2">{t.sinDatos}</p>
                    ) : (
                        Object.entries(estadisticas.demoraPromedioPorEtapa || {}).map(([etapa, horas]) => (
                            <div key={etapa} className="flex justify-between items-center gap-2 text-[10px] border-b border-[#F4EDE6] dark:border-[#4A4033] pb-2 last:border-0 last:pb-0">
                                <span className="font-bold truncate text-[#56473A] dark:text-[#EDE4D3]">{etapa}</span>
                                <span className="font-black text-[#A68966] bg-[#F4EDE6] dark:bg-[#221D17] px-2 py-0.5 rounded-full whitespace-nowrap">{horas}h</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Tiempo Promedio de Servicio — tarjeta destacada */}
            <div className="relative overflow-hidden bg-[#56473A] dark:bg-[#3A322A] text-white rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center items-center text-center">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#D9B44A]/10" />
                <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-white/5" />

                <span className="relative text-2xl mb-1">⌛</span>
                <p className="relative text-[10px] uppercase font-bold text-[#D9B44A] mb-2 tracking-widest">
                    {t.tiempoPromedio}
                </p>
                <p className="relative text-4xl font-black">
                    {estadisticas.tiempoPromedioHoras || 0}<span className="text-lg">h</span>
                </p>
                <p className="relative text-[9px] opacity-70 mt-2">
                    {t.desdeHasta}
                </p>
            </div>
        </div>
    );
}

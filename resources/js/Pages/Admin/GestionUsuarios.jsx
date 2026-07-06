import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminSidebar from './AdminSidebar';

export default function GestionUsuarios({ datosUsuarios }) {
    const { auth } = usePage().props;
    const nombreUsuario = auth?.user?.nombre || 'Mario Solar';

    // Valores por defecto basados en image_554140.png fusionados con lo que mande el backend
    const info = {
        totalAfiliados: 12345,
        personasAtendidas: 7340,
        nuevosAfiliadosMes: 140,
        fallecimientosHuellaEterna: { gatos: 25, perros: 70, otros: 5 },
        fallecimientosGenero: { mujeres: 55, hombres: 42, noEspecificado: 3 },
        planesMasElegidos: [
            { nombre: 'Descanso Sereno', pct: 19, color: 'bg-[#F2E394]' },
            { nombre: 'Plan familiar', pct: 28, color: 'bg-[#A26D4F]' },
            { nombre: 'Eternidad', pct: 23, color: 'bg-[#D9B44A]' },
            { nombre: 'Plan S.E.N.A', pct: 10, color: 'bg-[#4CD97B]' },
            { nombre: 'Plan Empresarial', pct: 12, color: 'bg-[#94B2F2]' },
            { nombre: 'Huella Eterna', pct: 8, color: 'bg-[#E28494]' }
        ],
        rangosEdad: [
            { etiqueta: 'Niños (0 - 12 años)', pct: 4, color: 'bg-[#FFF9E6]' },
            { etiqueta: 'Adolescentes (13 - 17 años)', pct: 8, color: 'bg-[#F5E6CC]' },
            { etiqueta: 'Jóvenes adultos (18 - 29 años)', pct: 15, color: 'bg-[#EAD4B3]' },
            { etiqueta: 'Adultos (30 - 49 años)', pct: 25, color: 'bg-[#DFBF99]' },
            { etiqueta: 'Adultos mayores (50 - 69 años)', pct: 29, color: 'bg-[#D4AA80]' },
            { etiqueta: 'Personas longevas (70+ años)', pct: 19, color: 'bg-[#C99566]' }
        ],
        afiliadosTipo: { personas: 80, mascotas: 20 },

        // Aquí se sobreescriben los valores reales de la BD dinámicamente
        ...datosUsuarios
    };

    return (
        <div className="min-h-screen bg-[#F4EDE6] font-['Hepta_Slab'] flex relative text-[#5D4E3F]">
            <Head title="Gestión de Usuarios - Mouren" />

            {/* BARRA LATERAL */}
            <AdminSidebar />

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 p-8 content-shift transition-all duration-700">

                {/* ENCABEZADO SUPERIOR */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#5D4E3F]">
                            Bienvenido, <span className="font-black text-[#8F7E54]">{nombreUsuario}</span>
                        </h1>
                        <p className="text-xs text-[#5D4E3F]/70 italic mt-1">Para que descanses mejor que en vida</p>
                    </div>

                    {/* BARRA DE BÚSQUEDA POR CÉDULA */}
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full lg:w-96">
                            <input
                                type="text"
                                placeholder="Por favor ingresa la cedula del usuario"
                                className="w-full bg-[#D1C4B4] placeholder-[#5D4E3F]/50 text-[#5D4E3F] text-xs font-medium px-5 py-2.5 rounded-full pr-10 border-none focus:ring-2 focus:ring-[#5D4E3F]/30 shadow-inner"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D4E3F]/70 hover:text-[#5D4E3F]">
                                🔍
                            </button>
                        </div>
                    </div>
                </header>

                {/* CUADRÍCULA DE BLOQUES (Siguiendo la disposición de image_554140.png) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* SECCIÓN: ESTADO DE PLANES */}
                    <div className="lg:col-span-8 bg-white border border-[#A68966]/20 rounded-[30px] p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h3 className="text-md font-black text-[#8F7E54]">Estado de Planes</h3>
                                <p className="text-[11px] text-[#5D4E3F]/60 font-bold">Resumen rápido de afiliaciones</p>
                            </div>
                            <button className="bg-[#BCAAA4] text-[#5D4E3F] text-[11px] font-black px-4 py-1.5 rounded-xl shadow-sm hover:brightness-95 transition">
                                Descargar
                            </button>
                        </div>

                        {/* 🌟 TARJETAS MÉTRICAS CON EFECTO 3D ESCALONADO REAL (Fieles a image_56353d.png) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-4">

                            {/* TARJETA 1: Total de usuarios afiliados */}
                            <div className="relative group cursor-pointer h-[105px]">
                                {/* Capas inferiores escalonadas del fondo en 3D */}
                                <div className="absolute inset-0 bg-[#A68966]/30 rounded-[22px] translate-y-4 scale-[0.96] z-0 transition-transform duration-300 group-hover:translate-y-5"></div>
                                <div className="absolute inset-0 bg-[#5D4E3F]/30 rounded-[22px] translate-y-2 scale-[0.98] z-0 transition-transform duration-300 group-hover:translate-y-3"></div>

                                {/* Contenedor frontal interactivo */}
                                <div className="absolute inset-0 z-10 bg-[#56473A] text-[#F4EDE6] p-4 rounded-[22px] flex items-center gap-3 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#4E4034] active:translate-y-1">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-[#56473A] shadow">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black tracking-tight">{info.totalAfiliados.toLocaleString()}</h4>
                                        <p className="text-[10px] font-bold opacity-80 leading-tight">Total de usuarios afiliados.</p>
                                    </div>
                                </div>
                            </div>

                            {/* TARJETA 2: Personas atendidas */}
                            <div className="relative group cursor-pointer h-[105px]">
                                {/* Capas inferiores escalonadas del fondo en 3D */}
                                <div className="absolute inset-0 bg-[#A68966]/30 rounded-[22px] translate-y-4 scale-[0.96] z-0 transition-transform duration-300 group-hover:translate-y-5"></div>
                                <div className="absolute inset-0 bg-[#5D4E3F]/30 rounded-[22px] translate-y-2 scale-[0.98] z-0 transition-transform duration-300 group-hover:translate-y-3"></div>

                                {/* Contenedor frontal interactivo */}
                                <div className="absolute inset-0 z-10 bg-[#56473A] text-[#F4EDE6] p-4 rounded-[22px] flex items-center gap-3 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#4E4034] active:translate-y-1">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-[#56473A] relative shadow">
                                        {/* Aureola decorativa sobre el avatar */}
                                        <div className="absolute top-1.5 w-5 h-1 border border-[#D9B44A] rounded-full bg-[#D9B44A]/20"></div>
                                        <svg className="w-6 h-6 mt-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black tracking-tight">{info.personasAtendidas.toLocaleString()}</h4>
                                        <p className="text-[10px] font-bold opacity-80 leading-tight">Personas atendidas.</p>
                                    </div>
                                </div>
                            </div>

                            {/* TARJETA 3: Nuevos afiliados en el mes */}
                            <div className="relative group cursor-pointer h-[105px]">
                                {/* Capas inferiores escalonadas del fondo en 3D */}
                                <div className="absolute inset-0 bg-[#A68966]/30 rounded-[22px] translate-y-4 scale-[0.96] z-0 transition-transform duration-300 group-hover:translate-y-5"></div>
                                <div className="absolute inset-0 bg-[#5D4E3F]/30 rounded-[22px] translate-y-2 scale-[0.98] z-0 transition-transform duration-300 group-hover:translate-y-3"></div>

                                {/* Contenedor frontal interactivo */}
                                <div className="absolute inset-0 z-10 bg-[#56473A] text-[#F4EDE6] p-4 rounded-[22px] flex items-center gap-3 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#4E4034] active:translate-y-1">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-[#56473A] relative shadow">
                                        {/* Medalla amarilla con signo más (+), idéntica al mock */}
                                        <span className="absolute top-0.5 right-0.5 bg-[#FFC600] text-[#56473A] text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                                            +
                                        </span>
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black tracking-tight">{info.nuevosAfiliadosMes}</h4>
                                        <p className="text-[10px] font-bold opacity-80 leading-tight">Nuevos afiliados en el mes.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* SECCIÓN: FALLECIMIENTOS HUELLA ETERNA */}
                    <div className="lg:col-span-4 bg-white border border-[#A68966]/20 rounded-[30px] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <h3 className="text-xs font-black text-[#8F7E54] uppercase tracking-wide">Fallecimientos Huella Eterna</h3>

                        <div className="flex flex-col gap-3 my-4 z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-[#F4EDE6] h-6 rounded-md overflow-hidden relative border border-[#A68966]/10">
                                    <div className="bg-[#C2A67D] h-full transition-all duration-500" style={{ width: `${info.fallecimientosHuellaEterna.gatos}%` }}></div>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black">{info.fallecimientosHuellaEterna.gatos}%</span>
                                </div>
                                <span className="text-[10px] font-bold text-[#A26D4F] w-14">🐈 Gatos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-[#F4EDE6] h-6 rounded-md overflow-hidden relative border border-[#A68966]/10">
                                    <div className="bg-[#8E6E4E] h-full transition-all duration-500" style={{ width: `${info.fallecimientosHuellaEterna.perros}%` }}></div>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black text-white">{info.fallecimientosHuellaEterna.perros}%</span>
                                </div>
                                <span className="text-[10px] font-bold text-[#A26D4F] w-14">🐕 Perros</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-[#F4EDE6] h-6 rounded-md overflow-hidden relative border border-[#A68966]/10">
                                    <div className="bg-[#D9B44A] h-full transition-all duration-500" style={{ width: `${info.fallecimientosHuellaEterna.otros}%` }}></div>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black">{info.fallecimientosHuellaEterna.otros}%</span>
                                </div>
                                <span className="text-[10px] font-bold text-[#A26D4F] w-14">🐾 Otros</span>
                            </div>
                        </div>

                        <div className="absolute right-2 bottom-2 w-20 h-20 opacity-10 pointer-events-none">
                            <img src="/images/Admin/Panel_principal/mouri_informe1.png" className="w-full h-full object-contain" alt="Watermark" />
                        </div>
                    </div>

                    {/* SECCIÓN: FALLECIMIENTOS POR GÉNERO */}
                    <div className="lg:col-span-4 bg-[#56473A] text-[#F4EDE6] rounded-[30px] p-6 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-4 w-1/2">
                            <h3 className="text-sm font-black tracking-tight leading-tight">Fallecimientos por género</h3>

                            <div className="flex flex-col gap-1.5 text-[10px] font-bold">
                                <span className="bg-[#A27B5C] text-white px-2 py-1 rounded-md text-center">
                                    Mujeres ({info.fallecimientosGenero.mujeres}%)
                                </span>
                                <span className="bg-[#8D7B68] text-white px-2 py-1 rounded-md text-center">
                                    Hombres ({info.fallecimientosGenero.hombres}%)
                                </span>
                                <span className="bg-[#3E3227] text-white/70 px-2 py-1 rounded-md text-center">
                                    No especificado ({info.fallecimientosGenero.noEspecificado}%)
                                </span>
                            </div>
                        </div>

                        {/* GRÁFICO DE DONA DINÁMICO */}
                        <div className="w-28 h-28 relative flex items-center justify-center">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                {/* Fondo base o Base del Gráfico (Hombres ocupa el fondo inicial) */}
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8D7B68" strokeWidth="4" />

                                {/* Arco de Mujeres */}
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="15.915"
                                    fill="none"
                                    stroke="#A27B5C"
                                    strokeWidth="4"
                                    strokeDasharray={`${info.fallecimientosGenero.mujeres} 100`}
                                    strokeDashoffset="0"
                                />

                                {/* Arco de No Especificado (Se posiciona justo después de Mujeres) */}
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="15.915"
                                    fill="none"
                                    stroke="#3E3227"
                                    strokeWidth="4"
                                    strokeDasharray={`${info.fallecimientosGenero.noEspecificado} 100`}
                                    strokeDashoffset={`-${info.fallecimientosGenero.mujeres}`}
                                />
                            </svg>

                            {/* ETIQUETAS FLOTANTES DE PORCENTAJES (Se ocultan si el porcentaje es cero para que no se amontonen) */}
                            {info.fallecimientosGenero.mujeres > 0 && (
                                <div className="absolute top-3 right-3 bg-white text-[#5D4E3F] text-[9px] font-black px-1 rounded shadow-sm">
                                    {info.fallecimientosGenero.mujeres}%
                                </div>
                            )}
                            {info.fallecimientosGenero.hombres > 0 && (
                                <div className="absolute bottom-4 left-2 bg-white text-[#5D4E3F] text-[9px] font-black px-1 rounded shadow-sm">
                                    {info.fallecimientosGenero.hombres}%
                                </div>
                            )}
                            {info.fallecimientosGenero.noEspecificado > 0 && (
                                <div className="absolute top-4 left-6 bg-white text-[#5D4E3F] text-[9px] font-black px-1 rounded shadow-sm">
                                    {info.fallecimientosGenero.noEspecificado}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN: PLANES MÁS ELEGIDOS POR USUARIOS */}
                    <div className="lg:col-span-8 bg-white border border-[#A68966]/20 rounded-[30px] p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 flex flex-col justify-between">
                            <h3 className="text-sm font-black text-[#8F7E54] mb-4">Planes más elegidos por usuarios</h3>

                            <div className="flex items-end justify-between gap-2 h-40 pt-4 border-b border-[#5D4E3F]/20 px-2">
                                {info.planesMasElegidos.map((plan, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1 group relative">
                                        <span className="text-[10px] font-black mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 bg-[#5D4E3F] text-white px-1 rounded">
                                            {plan.pct}%
                                        </span>
                                        <span className="text-[11px] font-bold text-[#5D4E3F]/80 mb-1">{plan.pct}%</span>
                                        <div
                                            className={`${plan.color} w-full rounded-t-md transition-all duration-700 shadow-sm group-hover:brightness-95`}
                                            style={{ height: `${plan.pct * 1.3}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col justify-center gap-1.5 min-w-[140px] text-[11px] font-black">
                            {info.planesMasElegidos.map((plan, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${plan.color} flex-shrink-0`} />
                                    <span className="text-[#A68966] truncate">{plan.nombre}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECCIÓN INFERIOR IZQUIERDA: RANGOS DE EDAD */}
                    <div className="lg:col-span-8 bg-[#56473A] text-[#F4EDE6] rounded-[30px] p-6 shadow-sm">
                        <h3 className="text-sm font-black mb-6">Fallecimientos por rangos de edad</h3>

                        <div className="flex flex-col md:flex-row justify-between gap-8 items-center">
                            <div className="flex items-end justify-between gap-4 w-full md:w-3/5 h-44 bg-[#41352A] p-4 rounded-2xl border border-white/10">
                                {info.rangosEdad.map((rango, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end relative group">
                                        <div className="w-6 bg-white/10 h-full rounded-full flex flex-col justify-end overflow-hidden border border-white/5">
                                            <div
                                                className={`${rango.color} w-full rounded-b-full transition-all duration-700`}
                                                style={{ height: `${rango.pct}%` }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-black text-white mt-1.5">{rango.pct}%</span>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full md:w-2/5 flex flex-col gap-1.5 text-[10px] font-bold">
                                {info.rangosEdad.map((rango, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-sm ${rango.color}`} />
                                        <span className="opacity-80">{rango.etiqueta}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN INFERIOR DERECHA: AFILIADOS POR TIPO */}
                    <div className="lg:col-span-4 bg-[#41352A] text-[#F4EDE6] rounded-[30px] p-6 shadow-sm flex flex-col justify-between items-center text-center">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#D9B44A]">Afiliados por tipo</h3>

                        <div className="w-32 h-32 relative flex items-center justify-center my-4">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C2A67D" strokeWidth="5" />
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeDasharray="80 100" strokeDashoffset="0" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-xl font-black text-[#5D4E3F]">80%</span>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full">
                            <div className="flex-1 bg-white text-[#5D4E3F] text-[11px] font-black py-1.5 rounded-md shadow">
                                personas
                            </div>
                            <div className="flex-1 bg-[#C2A67D] text-[#5D4E3F] text-[11px] font-black py-1.5 rounded-md shadow">
                                Mascotas
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
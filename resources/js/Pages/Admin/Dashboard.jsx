import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AdminSidebar from './AdminSidebar';

// Diccionario de titulos y etiquetas principales (no traduce datos dinamicos como
// nombres de personas, salas o mensajes de Mouri, que vienen de la BD).
const TEXTOS = {
    es: {
        bienvenido: 'Bienvenido,',
        subtitulo: 'Para que descanses mejor que en vida',
        dia: 'Día', semana: 'Semana', mes: 'Mes', anio: 'Año',
        totalUsuarios: 'Total de Usuarios Registrados',
        usuariosSufijo: 'usuarios',
        personas: 'Personas',
        mascotas: 'Mascotas',
        agendaCeremonias: 'Agenda de ceremonias',
        diasSemana: ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab'],
        ocupacionSalas: 'Ocupacion de salas de velacion',
        salasOcupadas: 'Salas ocupadas',
        ingresosVsMeta: 'Ingresos del mes vs Meta',
        completado: 'Completado',
        mouriStatus: 'Mouri-Status: Clima Operativo',
        topPlan: 'Top Plan',
        serviciosEnProceso: 'Servicios en Proceso',
        activos: 'activos',
        homenajeado: 'Homenajeado',
        ubicacion: 'Ubicación',
        noAsignada: 'No asignada',
        inicio: 'Inicio',
        sinServicios: 'No hay servicios funerarios en proceso en este momento.',
        ceremoniasDelDia: 'Ceremonias del Día',
        de: 'de',
        entendido: 'Entendido',
    },
    en: {
        bienvenido: 'Welcome,',
        subtitulo: "So you rest better than you did in life",
        dia: 'Day', semana: 'Week', mes: 'Month', anio: 'Year',
        totalUsuarios: 'Total Registered Users',
        usuariosSufijo: 'users',
        personas: 'People',
        mascotas: 'Pets',
        agendaCeremonias: 'Ceremony schedule',
        diasSemana: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        ocupacionSalas: 'Wake room occupancy',
        salasOcupadas: 'Rooms occupied',
        ingresosVsMeta: 'Monthly income vs Goal',
        completado: 'Completed',
        mouriStatus: 'Mouri-Status: Operating climate',
        topPlan: 'Top Plan',
        serviciosEnProceso: 'Services in Progress',
        activos: 'active',
        homenajeado: 'Honoree',
        ubicacion: 'Location',
        noAsignada: 'Not assigned',
        inicio: 'Start',
        sinServicios: 'There are no funeral services in progress at the moment.',
        ceremoniasDelDia: 'Ceremonies for Day',
        de: 'of',
        entendido: 'Got it',
    },
};

export default function Dashboard({ metricas, ceremoniasIniciales, serviciosEnProceso, filtros }) {
    const { auth } = usePage().props;
    const nombreUsuario = auth?.user?.nombre || 'Administrador';
    const idioma = auth?.user?.idioma || 'es';
    const t = TEXTOS[idioma] || TEXTOS.es;

    const [mesActivo, setMesActivo] = useState(filtros?.mes || new Date().getMonth() + 1);
    const [anioActivo, setAnioActivo] = useState(filtros?.anio || new Date().getFullYear());

    const [ceremonias, setCeremonias] = useState(ceremoniasIniciales || []);
    const [diaSeleccionado, setDiaSeleccionado] = useState(null);
    const [eventosDelDia, setEventosDelDia] = useState([]);
    const [modoOscuro, setModoOscuro] = useState(
        () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    );


    useEffect(() => {
        setCeremonias(ceremoniasIniciales);
    }, [ceremoniasIniciales]);

    useEffect(() => {
        const html = document.documentElement;
        const actualizarModo = () => setModoOscuro(html.classList.contains('dark'));

        actualizarModo();

        const observer = new MutationObserver(actualizarModo);
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const fechaObjeto = new Date(anioActivo, mesActivo - 1, 1);
    const localeIntl = idioma === 'en' ? 'en-US' : 'es-ES';
    const nombreMes = fechaObjeto.toLocaleString(localeIntl, { month: 'long' });
    const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

    const cambiarMes = (direccion) => {
        let nuevoMes = mesActivo + direccion;
        let nuevoAnio = anioActivo;

        if (nuevoMes > 12) {
            nuevoMes = 1;
            nuevoAnio += 1;
        } else if (nuevoMes < 1) {
            nuevoMes = 12;
            nuevoAnio -= 1;
        }

        setMesActivo(nuevoMes);
        setAnioActivo(nuevoAnio);

        router.get(window.location.pathname, { mes: nuevoMes, anio: nuevoAnio }, {
            preserveState: true,
            preserveScroll: true,
            only: ['ceremoniasIniciales', 'filtros']
        });
    };

    const obtenerDiasCalendario = () => {
        const dias = [];
        const primerDiaSemana = new Date(anioActivo, mesActivo - 1, 1).getDay();
        const totalDiasMes = new Date(anioActivo, mesActivo, 0).getDate();
        const totalDiasMesPrevio = new Date(anioActivo, mesActivo - 1, 0).getDate();

        for (let i = primerDiaSemana - 1; i >= 0; i--) {
            dias.push({ tipo: 'prev', num: totalDiasMesPrevio - i });
        }

        for (let i = 1; i <= totalDiasMes; i++) {
            dias.push({ tipo: 'curr', num: i });
        }

        return dias;
    };

    const diasMes = obtenerDiasCalendario();

    const porcentajeIngresos = Math.min(Math.round((metricas?.ingresosMes / metricas?.metaMes) * 100), 100) || 0;
    const porcentajeSalas = Math.round((metricas?.salasOcupadas / metricas?.totalSalas) * 100) || 0;

    const tieneCeremonia = (numDia) => ceremonias.some(c => c.dia === numDia);
    const obtenerCeremoniasDelDia = (numDia) => ceremonias.filter(c => c.dia === numDia);

    const manejarClickDia = (numDia) => {
        const eventos = obtenerCeremoniasDelDia(numDia);
        if (eventos.length > 0) {
            setDiaSeleccionado(numDia);
            setEventosDelDia(eventos);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4EDE6] dark:bg-[#221D17] font-['Hepta_Slab'] flex relative transition-colors duration-500">
            <Head title="Panel Administrativo - Mouren" />

            <AdminSidebar />

            <main className="flex-1 content-shift p-8 transition-all duration-700 text-[#5D4E3F] dark:text-[#EDE4D3]">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                            {t.bienvenido} <span className="font-black text-[#8F7E54] dark:text-[#D9B44A]">{nombreUsuario}</span>
                        </h1>
                        <p className="text-xs text-[#5D4E3F]/70 dark:text-[#C2B49A] italic mt-1">{t.subtitulo}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-[#5D4E3F] dark:bg-[#3A322A] text-[#F4EDE6] px-4 py-2 rounded-full text-xs font-bold flex gap-2 shadow-inner cursor-pointer">
                            <span className="opacity-60 hover:opacity-100">{t.dia}</span> |
                            <span className="opacity-60 hover:opacity-100">{t.semana}</span> |
                            <span className="border-b-2 border-[#FFC600]">{t.mes}</span> |
                            <span className="opacity-60 hover:opacity-100">{t.anio}</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-6 bg-gradient-to-tr from-[#9C8468] to-[#826D58] dark:from-[#4A3E32] dark:to-[#3A322A] border border-[#A68966]/40 dark:border-[#4A4033] rounded-[35px] p-8 relative overflow-visble flex justify-between items-center shadow-sm min-h-[220px]">
                        <div className="z-10 flex flex-col gap-2">
                            <h3 className="text-2xl font-bold max-w-[280px] leading-tight text-[#FFFFFF] drop-shadow-sm mb-3">
                                {t.totalUsuarios}
                            </h3>
                            <p className="text-3xl font-black text-white tracking-tight mb-2">
                                {metricas?.totalUsuarios?.toLocaleString() || '0'} {t.usuariosSufijo}
                            </p>
                            <div className="flex flex-col gap-2 w-full max-w-[190px]">
                                <div className="bg-[#5E4F40] dark:bg-[#2E2720] text-[#F4EDE6] text-xs px-4 py-2 rounded-full font-bold shadow-sm text-center">
                                    {metricas?.totalPersonas?.toLocaleString() || '0'} {t.personas}
                                </div>
                                <div className="bg-[#5E4F40] dark:bg-[#2E2720] text-[#F4EDE6] text-xs px-4 py-2 rounded-full font-bold shadow-sm text-center">
                                    {metricas?.totalMascotas?.toLocaleString() || '0'} {t.mascotas}
                                </div>
                            </div>
                        </div>
                        <div className="w-66 h-66 flex justify-center items-center absolute right-[-10px] bottom-0 pointer-events-none overflow-visible ">
                            <img
                                src={modoOscuro ? "/images/Admin/Panel_principal/mouri_informe2.png" : "/images/Admin/Panel_principal/mouri_informe1.1.png"}
                                className={`object-contain max-w-full max-h-full drop-shadow-md overflow-visible ${modoOscuro ? 'w-[320px] h-[320px] mb-[-14px] ' : 'w-[350px] h-[350px] mb-[-34px] ml-[15px]'}`}
                                alt="Mouri Mascot"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-6 bg-[#5D4E3F] dark:bg-[#2E2720] text-[#F4EDE6] rounded-[35px] p-6 shadow-sm flex flex-col justify-between min-h-[240px] border border-transparent dark:border-[#4A4033]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-md font-bold tracking-tight">{t.agendaCeremonias}</h3>

                            <div className="flex items-center gap-2 bg-[#A68966]/40 dark:bg-[#4A4033] px-3 py-1 rounded-full select-none">
                                <button onClick={() => cambiarMes(-1)} className="hover:text-[#FFC600] font-black text-xs px-1 transition">◀</button>
                                <span className="text-xs font-bold min-w-[75px] text-center">
                                    {mesCapitalizado}
                                </span>
                                <button onClick={() => cambiarMes(1)} className="hover:text-[#FFC600] font-black text-xs px-1 transition">▶</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-y-3 text-center text-xs font-medium">
                            {t.diasSemana.map((d) => <span key={d} className="opacity-40">{d}</span>)}

                            {diasMes.map((dia, idx) => {
                                const tieneEvento = dia.tipo === 'curr' && tieneCeremonia(dia.num);
                                return (
                                    <span
                                        key={idx}
                                        onClick={() => dia.tipo === 'curr' && manejarClickDia(dia.num)}
                                        className={`flex items-center justify-center mx-auto w-6 h-6 text-xs transition-all ${dia.tipo === 'prev' ? 'opacity-20 pointer-events-none' : 'cursor-pointer rounded-full hover:bg-[#F4EDE6]/10'
                                            } ${tieneEvento ? 'bg-[#FFC600] text-[#5D4E3F] font-black rounded-full shadow-md hover:scale-125' : ''
                                            }`}
                                    >
                                        {dia.num}
                                    </span>
                                );
                            })}
                        </div>
                        <div className="text-right mt-2">
                            <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">{anioActivo}</span>
                        </div>
                    </div>

                    <div className="lg:col-span-6 flex flex-col gap-6">

                        <div className="bg-white dark:bg-[#2E2720] rounded-[30px] p-6 flex justify-between items-center shadow-sm border border-[#A68966]/20 dark:border-[#4A4033]">
                            <div className="flex flex-col gap-2">
                                <h4 className="text-sm font-bold leading-tight max-w-[150px] text-[#5D4E3F] dark:text-[#EDE4D3]">{t.ocupacionSalas}</h4>
                                <span className="text-xs bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400 px-3 py-1 rounded-full font-bold w-fit mt-2 flex items-center gap-1">
                                    ✓ {metricas?.salasOcupadas || 0} {t.salasOcupadas}
                                </span>
                            </div>

                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-gray-200 dark:text-[#4A4033]" strokeWidth="3px" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path
                                        className="text-[#A68966]"
                                        strokeDasharray={`${porcentajeSalas}, 100`}
                                        strokeWidth="3.5px"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-sm font-black text-[#5D4E3F] dark:text-[#EDE4D3]">{porcentajeSalas}%</span>
                                    <span className="text-[9px] opacity-60 text-[#5D4E3F] dark:text-[#C2B49A]">{metricas?.salasOcupadas || 0}/{metricas?.totalSalas || 5}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#2E2720] rounded-[30px] p-6 flex flex-col justify-between shadow-sm border border-[#A68966]/20 dark:border-[#4A4033]">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold max-w-[140px] leading-tight text-[#5D4E3F] dark:text-[#EDE4D3]">{t.ingresosVsMeta}</h4>
                                <div className="text-right">
                                    <span className="text-sm font-black block text-[#5D4E3F] dark:text-[#EDE4D3]">{porcentajeIngresos}%</span>
                                    <span className="text-[10px] text-green-700 dark:text-green-400 opacity-80 font-bold">{t.completado}</span>
                                </div>
                            </div>

                            <div className="mt-6 relative">
                                <div className="w-full bg-gray-200 dark:bg-[#4A4033] h-3 rounded-full overflow-hidden">
                                    <div className="bg-[#A68966] h-full rounded-full transition-all duration-500" style={{ width: `${porcentajeIngresos}%` }}></div>
                                </div>
                                <div
                                    className="absolute -top-7 bg-[#5D4E3F] dark:bg-[#3A322A] text-white font-bold text-[9px] px-2 py-0.5 rounded shadow whitespace-nowrap transition-all duration-500"
                                    style={{ left: `${Math.min(porcentajeIngresos, 85)}%` }}
                                >
                                    {metricas?.ingresosMes?.toLocaleString() || '0'}
                                </div>
                                <div className="flex justify-between text-[10px] opacity-60 mt-1 text-[#5D4E3F] dark:text-[#C2B49A]">
                                    <span>0</span>
                                    <span>{metricas?.metaMes?.toLocaleString() || '2.500.000'}</span>
                                </div>
                            </div>
                        </div>

                        {(() => {
                            const salasOcupadas = metricas?.salasOcupadas || 0;
                            let mouriImagen = "/images/login/mouri_error.png";
                            let mouriTitulo = "Día tranquilo en el más allá";
                            let mouriMensaje = "No hay ceremonias en curso. Buen momento para organizar archivos y revisar inventario.";
                            let colorBorde = "border-[#A68966]/30";
                            let colorBadge = "bg-[#A68966]/20 text-[#FFC600]";

                            if (salasOcupadas >= 1 && salasOcupadas <= 2) {
                                mouriImagen = "/images/Admin/Panel_principal/mouri_informe1.png";
                                mouriTitulo = "Operación bajo control";
                                mouriMensaje = `Tenemos ${salasOcupadas} sala(s) activa(s). El ambiente está sereno y el personal está asistiendo a las familias.`;
                                colorBorde = "border-blue-500/30";
                                colorBadge = "bg-blue-500/20 text-blue-300";
                            } else if (salasOcupadas >= 3) {
                                mouriImagen = "/images/login/mouri_error.png";
                                mouriTitulo = "¡Día de alta actividad!";
                                mouriMensaje = `¡Atención! ${salasOcupadas} salas ocupadas simultáneamente. Asegura que el stock de la sala VIP esté completo.`;
                                colorBorde = "border-amber-500/40";
                                colorBadge = "bg-amber-500/20 text-[#FFC600] animate-pulse";
                            }

                            return (
                                <div className={`bg-[#5D4E3F] dark:bg-[#2E2720] text-[#F4EDE6] rounded-[30px] p-5 flex justify-between items-center relative overflow-hidden shadow-md min-h-[130px] border ${colorBorde} group transition-all duration-300 hover:shadow-lg`}>

                                    <div className="flex items-center gap-5 z-10 max-w-[70%]">
                                        <div className="w-16 h-16 flex-shrink-0 bg-[#4A3E32] dark:bg-[#221D17] rounded-2xl flex items-center justify-center p-1 border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner">
                                            <img
                                                src={mouriImagen}
                                                className="w-full h-full object-contain filter brightness-110 drop-shadow"
                                                alt="Mouri Status"
                                            />
                                        </div>

                                        <div>
                                            <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full ${colorBadge}`}>
                                                {t.mouriStatus}
                                            </span>
                                            <h3 className="text-md font-black tracking-tight text-white drop-shadow-sm mt-1 transition-colors duration-300 group-hover:text-[#FFC600]">
                                                {mouriTitulo}
                                            </h3>
                                            <p className="text-[11px] opacity-80 leading-snug mt-1 italic font-medium">
                                                "{mouriMensaje}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-black/10 flex flex-col justify-center items-center p-3 text-center transition-all duration-300 group-hover:bg-black/20">
                                        <span className="text-[8px] opacity-50 uppercase tracking-wider font-bold">{t.topPlan}</span>
                                        <span className="text-xs font-black text-[#FFC600] mt-1 line-clamp-2">
                                            {metricas?.planMasElegido || 'Descanso Sereno'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}

                    </div>

                    <div className="lg:col-span-6 bg-white dark:bg-[#2E2720] rounded-[35px] p-6 shadow-sm border border-[#A68966]/20 dark:border-[#4A4033] flex flex-col h-full max-h-[470px]">
                        <div className="flex justify-between items-center mb-4 border-b border-[#5D4E3F]/10 dark:border-[#4A4033] pb-2">
                            <h3 className="text-sm font-black tracking-tight text-[#5D4E3F] dark:text-[#EDE4D3]">
                                ⏳ {t.serviciosEnProceso}
                            </h3>
                            <span className="bg-[#5D4E3F] dark:bg-[#3A322A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {serviciosEnProceso?.length || 0} {t.activos}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar flex-1">
                            {serviciosEnProceso && serviciosEnProceso.length > 0 ? (
                                serviciosEnProceso.map((servicio, idx) => (
                                    <a
                                        href={`/admin/servicios-funerarios?destacar=${servicio.id}`}
                                        key={idx}
                                        className="block bg-[#F4EDE6]/50 dark:bg-[#221D17]/60 border border-[#A68966]/30 dark:border-[#4A4033] rounded-2xl p-3.5 flex flex-col gap-1.5 transition-all hover:bg-[#F4EDE6] dark:hover:bg-[#221D17] hover:shadow-md hover:scale-[1.02] cursor-pointer"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black text-[#5D4E3F] dark:text-[#EDE4D3] truncate max-w-[180px]">
                                                🕊️ {servicio.nombre || t.homenajeado}
                                            </span>
                                            <span className="text-[9px] bg-[#8F7E54]/20 dark:bg-[#D9B44A]/20 text-[#5D4E3F] dark:text-[#D9B44A] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {servicio.tipo || 'Funerario'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:justify-between text-[11px] text-[#5D4E3F]/80 dark:text-[#C2B49A] font-medium">
                                            <span>📍 {t.ubicacion}: <strong className="text-[#5D4E3F] dark:text-[#EDE4D3]">{servicio.sala || t.noAsignada}</strong></span>
                                            <span className="text-[10px] opacity-70 mt-0.5 sm:mt-0">⏱️ {t.inicio}: {servicio.hora_inicio || '--:--'}</span>
                                        </div>

                                        <div className="w-full bg-gray-200 dark:bg-[#4A4033] h-1.5 rounded-full overflow-hidden mt-1">
                                            <div className="bg-[#8F7E54] h-full rounded-full animate-pulse" style={{ width: '65%' }}></div>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center py-12 opacity-50 italic text-xs gap-2 text-[#5D4E3F] dark:text-[#C2B49A]">
                                    <span>{t.sinServicios}</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            {diaSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[#F4EDE6] dark:bg-[#2E2720] border-2 border-[#5D4E3F] dark:border-[#4A4033] rounded-[30px] w-full max-w-md p-6 shadow-2xl text-[#5D4E3F] dark:text-[#EDE4D3] relative">

                        <div className="flex justify-between items-center border-b-2 border-[#5D4E3F]/20 dark:border-[#4A4033] pb-3 mb-4">
                            <div>
                                <h4 className="text-lg font-black tracking-tight">{t.ceremoniasDelDia} {diaSeleccionado}</h4>
                                <p className="text-[10px] opacity-70 uppercase tracking-wider font-bold">{mesCapitalizado} {t.de} {anioActivo}</p>
                            </div>
                            <button
                                onClick={() => setDiaSeleccionado(null)}
                                className="w-8 h-8 rounded-full bg-[#5D4E3F] dark:bg-[#3A322A] text-white font-bold flex items-center justify-center hover:bg-red-800 transition shadow"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                            {eventosDelDia.map((evento, idx) => (
                                <div key={idx} className="bg-white/80 dark:bg-[#221D17]/60 border border-[#A68966]/30 dark:border-[#4A4033] rounded-2xl p-4 shadow-sm flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="bg-[#FFC600] text-[#5D4E3F] font-black text-[10px] px-2.5 py-1 rounded-full shadow-inner">
                                            🕒 {evento.hora}
                                        </span>
                                        <span className="text-[10px] font-bold text-[#A68966] uppercase tracking-wide">
                                            {evento.tipo}
                                        </span>
                                    </div>
                                    <h5 className="text-xs font-black text-[#5D4E3F] dark:text-[#EDE4D3] mt-1">
                                        🕊️ {t.homenajeado}: <span className="text-[#8F7E54] dark:text-[#D9B44A] font-black">{evento.nombre}</span>
                                    </h5>
                                    <p className="text-[11px] font-medium opacity-90">
                                        🏢 {t.ubicacion}: <span className="font-bold">{evento.sala}</span>
                                    </p>
                                    {evento.observaciones && (
                                        <p className="text-[11px] italic bg-[#5D4E3F]/5 dark:bg-white/5 p-2 rounded-xl border border-dashed border-[#5D4E3F]/10 dark:border-[#4A4033] text-[#5D4E3F]/80 dark:text-[#C2B49A] mt-1">
                                            "{evento.observaciones}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setDiaSeleccionado(null)}
                            className="w-full bg-[#5D4E3F] dark:bg-[#3A322A] text-white font-black text-xs py-3 rounded-xl mt-4 hover:bg-[#A68966] transition shadow-md"
                        >
                            {t.entendido}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

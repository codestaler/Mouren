import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AdminSidebar from './AdminSidebar';
import ModalCrearCliente from './Components/ModalCrearCliente';
import ModalEditarUsuario from './Components/ModalEditarUsuario';
import GestionTiposDocumento from './Components/GestionTiposDocumento';

// Diccionario de titulos y etiquetas principales (no traduce datos dinamicos
// como nombres, cedulas, estados o rangos de edad que vienen de la BD).
const TEXTOS = {
    es: {
        bienvenido: 'Bienvenido,',
        subtitulo: 'Para que descanses mejor que en vida',
        buscarPlaceholder: 'Por favor ingresa la cedula del usuario',
        graficas: 'Gráficas',
        modoOperativo: 'Modo Operativo',
        configuracion: 'Configuración',
        descargar: 'Descargar',
        descargarPdf: 'Descargar PDF',
        descargarExcel: 'Descargar Excel',
        estadoPlanes: 'Estado de Planes',
        resumenAfiliaciones: 'Resumen rápido de afiliaciones',
        totalAfiliados: 'Total de usuarios afiliados.',
        personasAtendidas: 'Personas atendidas.',
        nuevosAfiliados: 'Nuevos afiliados en el mes.',
        huellaEterna: 'Fallecimientos Huella Eterna',
        gatos: 'Gatos', perros: 'Perros', otros: 'Otros',
        fallecimientosGenero: 'Fallecimientos por género',
        mujeres: 'Mujeres', hombres: 'Hombres', noEspecificado: 'No especificado',
        planesElegidos: 'Planes más elegidos por usuarios',
        rangosEdad: 'Fallecimientos por rangos de edad',
        afiliadosTipo: 'Afiliados por tipo',
        personas: 'Personas', mascotas: 'Mascotas',
        buscarNombreCedula: 'Buscar por nombre o cédula...',
        nuevoUsuario: '+ Nuevo Usuario',
        administradores: 'Administradores',
        clientes: 'Clientes',
        resultado: 'resultado', resultados: 'resultados',
        sinAdministradores: 'No hay administradores que coincidan con la búsqueda.',
        sinClientes: 'No hay clientes que coincidan con la búsqueda.',
        editar: '✎ Editar',
        desactivar: 'Desactivar',
        activar: 'Activar',
    },
    en: {
        bienvenido: 'Welcome,',
        subtitulo: "So you rest better than you did in life",
        buscarPlaceholder: "Please enter the user's ID",
        graficas: 'Charts',
        modoOperativo: 'Operations Mode',
        configuracion: 'Settings',
        descargar: 'Download',
        descargarPdf: 'Download PDF',
        descargarExcel: 'Download Excel',
        estadoPlanes: 'Plan Status',
        resumenAfiliaciones: 'Quick membership summary',
        totalAfiliados: 'Total affiliated users.',
        personasAtendidas: 'People served.',
        nuevosAfiliados: 'New members this month.',
        huellaEterna: 'Eternal Footprint Deaths',
        gatos: 'Cats', perros: 'Dogs', otros: 'Other',
        fallecimientosGenero: 'Deaths by gender',
        mujeres: 'Women', hombres: 'Men', noEspecificado: 'Not specified',
        planesElegidos: 'Most chosen plans by users',
        rangosEdad: 'Deaths by age range',
        afiliadosTipo: 'Members by type',
        personas: 'People', mascotas: 'Pets',
        buscarNombreCedula: 'Search by name or ID...',
        nuevoUsuario: '+ New User',
        administradores: 'Administrators',
        clientes: 'Clients',
        resultado: 'result', resultados: 'results',
        sinAdministradores: 'No administrators match the search.',
        sinClientes: 'No clients match the search.',
        editar: '✎ Edit',
        desactivar: 'Deactivate',
        activar: 'Activate',
    },
};

export default function GestionUsuarios({ datosUsuarios, usuarios = [], estados = [], generos = [], tiposDocumento = [] }) {
    const { auth } = usePage().props;
    const nombreUsuario = auth?.user?.nombre || 'Mario Solar';
    const idioma = auth?.user?.idioma || 'es';
    const t = TEXTOS[idioma] || TEXTOS.es;

    const [animado, setAnimado] = React.useState(false);
    const [modo, setModo] = React.useState('graficas');
    const [busquedaUsuario, setBusquedaUsuario] = React.useState('');
    const [modalCrear, setModalCrear] = React.useState(null);
    const [modalEditar, setModalEditar] = React.useState(null);
    const [procesando, setProcesando] = React.useState(false);
    const { flash } = usePage().props;

    const coincideBusqueda = (u) => {
        if (!busquedaUsuario.trim()) return true;
        const q = busquedaUsuario.toLowerCase();
        return (u.nombre?.toLowerCase().includes(q) || u.cedula?.toLowerCase().includes(q));
    };

    const administradores = usuarios.filter(u => u.tipo_usuario_id === 1 && coincideBusqueda(u));
    const clientes = usuarios.filter(u => u.tipo_usuario_id !== 1 && coincideBusqueda(u));

    const cambiarEstadoUsuario = (usuario, estadoId, nombreEstado) => {
        if (!window.confirm(`¿Confirmas cambiar el estado de ${usuario.nombre} a "${nombreEstado}"?`)) return;
        router.put(`/admin/usuarios/${usuario.id}/estado`, { estado_id: estadoId }, { preserveScroll: true });
    };

    React.useEffect(() => {
        const tmr = setTimeout(() => setAnimado(true), 100);
        return () => clearTimeout(tmr);
    }, []);

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
        ...datosUsuarios
    };

    const TarjetaUsuario = ({ u }) => (
        <div className="flex flex-wrap justify-between items-center gap-4 p-4 bg-[#F4EDE6]/60 dark:bg-[#221D17]/60 rounded-2xl border border-[#A68966]/10 dark:border-[#4A4033] hover:border-[#A68966]/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    u.tipo_usuario_id === 1 ? 'bg-[#56473A] text-white' : 'bg-[#D9CEB6] dark:bg-[#4A4033] text-[#60533E] dark:text-[#EDE4D3]'
                }`}>
                    {u.nombre?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-black text-[#5D4E3F] dark:text-[#EDE4D3] truncate">{u.nombre}</p>
                    <p className="text-[10px] text-[#5D4E3F]/60 dark:text-[#C2B49A] font-medium mt-0.5 truncate">
                        Cédula: {u.cedula} · {u.email} · {u.telefono}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full whitespace-nowrap ${
                    u.estado?.nombre === 'Activo' ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' :
                    u.estado?.nombre === 'Inactivo' ? 'bg-gray-200 dark:bg-[#4A4033] text-gray-600 dark:text-[#C2B49A]' :
                    'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                }`}>
                    {u.estado?.nombre || 'Sin estado'}
                </span>

                <button
                    onClick={() => setModalEditar(u)}
                    className="text-[10px] font-black text-[#4D78A3] dark:text-[#7FAEDD] hover:underline whitespace-nowrap"
                >
                    {t.editar}
                </button>

                {u.estado?.nombre === 'Activo' ? (
                    <button
                        onClick={() => cambiarEstadoUsuario(u, 2, 'Inactivo')}
                        className="text-[10px] font-black text-red-500 hover:underline whitespace-nowrap"
                    >
                        {t.desactivar}
                    </button>
                ) : (
                    <button
                        onClick={() => cambiarEstadoUsuario(u, 1, 'Activo')}
                        className="text-[10px] font-black text-green-600 hover:underline whitespace-nowrap"
                    >
                        {t.activar}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F4EDE6] dark:bg-[#221D17] font-['Hepta_Slab'] flex relative text-[#5D4E3F] dark:text-[#EDE4D3] transition-colors duration-500">
            <Head title="Gestión de Usuarios - Mouren" />

            <AdminSidebar />

            <main className="flex-1 p-4 sm:p-8 content-shift transition-all duration-700 overflow-x-hidden">

                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                            {t.bienvenido} <span className="font-black text-[#8F7E54] dark:text-[#D9B44A]">{nombreUsuario}</span>
                        </h1>
                        <p className="text-xs text-[#5D4E3F]/70 dark:text-[#C2B49A] italic mt-1">{t.subtitulo}</p>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative w-full lg:w-96">
                            <input
                                type="text"
                                placeholder={t.buscarPlaceholder}
                                className="w-full bg-[#D1C4B4] dark:bg-[#3A322A] placeholder-[#5D4E3F]/50 dark:placeholder-[#C2B49A]/60 text-[#5D4E3F] dark:text-[#EDE4D3] text-xs font-medium px-5 py-2.5 rounded-full pr-10 border-none focus:ring-2 focus:ring-[#5D4E3F]/30 shadow-inner"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D4E3F]/70 dark:text-[#C2B49A] hover:text-[#5D4E3F] dark:hover:text-white">
                                🔍
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-wrap gap-2 mb-6 bg-[#EDE4D3] dark:bg-[#2E2720] p-1.5 rounded-2xl w-fit max-w-full">
                    <button
                        onClick={() => setModo('graficas')}
                        className={`px-4 sm:px-5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wide transition-all whitespace-nowrap ${modo === 'graficas' ? 'bg-[#56473A] text-white shadow-md' : 'text-[#8F7E54] dark:text-[#D9B44A] hover:bg-white/50 dark:hover:bg-white/5'}`}
                    >
                        📊 {t.graficas}
                    </button>
                    <button
                        onClick={() => setModo('operativo')}
                        className={`px-4 sm:px-5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wide transition-all whitespace-nowrap ${modo === 'operativo' ? 'bg-[#56473A] text-white shadow-md' : 'text-[#8F7E54] dark:text-[#D9B44A] hover:bg-white/50 dark:hover:bg-white/5'}`}
                    >
                        ⚙️ {t.modoOperativo}
                    </button>
                    <button
                        onClick={() => setModo('configuracion')}
                        className={`px-4 sm:px-5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wide transition-all whitespace-nowrap ${modo === 'configuracion' ? 'bg-[#56473A] text-white shadow-md' : 'text-[#8F7E54] dark:text-[#D9B44A] hover:bg-white/50 dark:hover:bg-white/5'}`}
                    >
                        🛠️ {t.configuracion}
                    </button>
                </div>

                {flash?.message && <div className="mb-6 p-4 bg-[#56473A] text-white rounded-2xl text-xs font-bold shadow-sm">✨ {flash.message}</div>}
                {flash?.error && <div className="mb-6 p-4 bg-red-500 text-white rounded-2xl text-xs font-bold shadow-sm">⚠️ {flash.error}</div>}

                {modo === 'graficas' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-8 bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[30px] p-6 shadow-sm">
                        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                            <div>
                                <h3 className="text-md font-black text-[#8F7E54] dark:text-[#D9B44A]">{t.estadoPlanes}</h3>
                                <p className="text-[11px] text-[#5D4E3F]/60 dark:text-[#C2B49A] font-bold">{t.resumenAfiliaciones}</p>
                            </div>
                            <div className="relative group">
                                <button className="bg-[#BCAAA4] dark:bg-[#4A4033] text-[#5D4E3F] dark:text-[#EDE4D3] text-[11px] font-black px-4 py-1.5 rounded-xl shadow-sm hover:brightness-95 transition flex items-center gap-1">
                                    {t.descargar} ▾
                                </button>
                                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#2E2720] rounded-xl shadow-lg border border-[#E8DFC8] dark:border-[#4A4033] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                                    <a href="/admin/gestion-usuarios/exportar-pdf" className="block px-4 py-2 text-[11px] font-bold text-[#5D4E3F] dark:text-[#EDE4D3] hover:bg-[#F4EDE6] dark:hover:bg-[#221D17] rounded-t-xl">
                                        📄 {t.descargarPdf}
                                    </a>
                                    <a href="/admin/gestion-usuarios/exportar-excel" className="block px-4 py-2 text-[11px] font-bold text-[#5D4E3F] dark:text-[#EDE4D3] hover:bg-[#F4EDE6] dark:hover:bg-[#221D17] rounded-b-xl">
                                        📊 {t.descargarExcel}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-4">

                            <div className="relative group cursor-pointer h-[105px]">
                                <div className="absolute inset-0 bg-[#A68966]/30 rounded-[22px] translate-y-4 scale-[0.96] z-0 transition-transform duration-300 group-hover:translate-y-5"></div>
                                <div className="absolute inset-0 bg-[#5D4E3F]/30 rounded-[22px] translate-y-2 scale-[0.98] z-0 transition-transform duration-300 group-hover:translate-y-3"></div>

                                <div className="absolute inset-0 z-10 bg-[#56473A] dark:bg-[#3A322A] text-[#F4EDE6] p-4 rounded-[22px] flex items-center gap-3 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#4E4034] active:translate-y-1">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-[#56473A] shadow">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black tracking-tight">{info.totalAfiliados.toLocaleString()}</h4>
                                        <p className="text-[10px] font-bold opacity-80 leading-tight">{t.totalAfiliados}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group cursor-pointer h-[105px]">
                                <div className="absolute inset-0 bg-[#A68966]/30 rounded-[22px] translate-y-4 scale-[0.96] z-0 transition-transform duration-300 group-hover:translate-y-5"></div>
                                <div className="absolute inset-0 bg-[#5D4E3F]/30 rounded-[22px] translate-y-2 scale-[0.98] z-0 transition-transform duration-300 group-hover:translate-y-3"></div>

                                <div className="absolute inset-0 z-10 bg-[#56473A] dark:bg-[#3A322A] text-[#F4EDE6] p-4 rounded-[22px] flex items-center gap-3 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#4E4034] active:translate-y-1">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-[#56473A] relative shadow">
                                        <div className="absolute top-1.5 w-5 h-1 border border-[#D9B44A] rounded-full bg-[#D9B44A]/20"></div>
                                        <svg className="w-6 h-6 mt-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black tracking-tight">{info.personasAtendidas.toLocaleString()}</h4>
                                        <p className="text-[10px] font-bold opacity-80 leading-tight">{t.personasAtendidas}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group cursor-pointer h-[105px]">
                                <div className="absolute inset-0 bg-[#A68966]/30 rounded-[22px] translate-y-4 scale-[0.96] z-0 transition-transform duration-300 group-hover:translate-y-5"></div>
                                <div className="absolute inset-0 bg-[#5D4E3F]/30 rounded-[22px] translate-y-2 scale-[0.98] z-0 transition-transform duration-300 group-hover:translate-y-3"></div>

                                <div className="absolute inset-0 z-10 bg-[#56473A] dark:bg-[#3A322A] text-[#F4EDE6] p-4 rounded-[22px] flex items-center gap-3 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-[#4E4034] active:translate-y-1">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-[#56473A] relative shadow">
                                        <span className="absolute top-0.5 right-0.5 bg-[#FFC600] text-[#56473A] text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                                            +
                                        </span>
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black tracking-tight">{info.nuevosAfiliadosMes}</h4>
                                        <p className="text-[10px] font-bold opacity-80 leading-tight">{t.nuevosAfiliados}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[30px] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <h3 className="text-xs font-black text-[#8F7E54] dark:text-[#D9B44A] uppercase tracking-wide">{t.huellaEterna}</h3>

                        <div className="flex flex-col gap-3 my-4 z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-[#F4EDE6] dark:bg-[#221D17] h-6 rounded-md overflow-hidden relative border border-[#A68966]/10 dark:border-[#4A4033]">
                                    <div className="bg-[#C2A67D] h-full transition-all duration-1000 ease-out" style={{ width: animado ? `${info.fallecimientosHuellaEterna.gatos}%` : '0%' }}></div>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black">{info.fallecimientosHuellaEterna.gatos}%</span>
                                </div>
                                <span className="text-[10px] font-bold text-[#A26D4F] w-14">🐈 {t.gatos}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-[#F4EDE6] dark:bg-[#221D17] h-6 rounded-md overflow-hidden relative border border-[#A68966]/10 dark:border-[#4A4033]">
                                    <div className="bg-[#8E6E4E] h-full transition-all duration-1000 ease-out delay-100" style={{ width: animado ? `${info.fallecimientosHuellaEterna.perros}%` : '0%' }}></div>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black text-white">{info.fallecimientosHuellaEterna.perros}%</span>
                                </div>
                                <span className="text-[10px] font-bold text-[#A26D4F] w-14">🐕 {t.perros}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-[#F4EDE6] dark:bg-[#221D17] h-6 rounded-md overflow-hidden relative border border-[#A68966]/10 dark:border-[#4A4033]">
                                    <div className="bg-[#D9B44A] h-full transition-all duration-1000 ease-out delay-200" style={{ width: animado ? `${info.fallecimientosHuellaEterna.otros}%` : '0%' }}></div>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-black">{info.fallecimientosHuellaEterna.otros}%</span>
                                </div>
                                <span className="text-[10px] font-bold text-[#A26D4F] w-14">🐾 {t.otros}</span>
                            </div>
                        </div>

                        <div className="absolute right-2 bottom-2 w-20 h-20 opacity-10 pointer-events-none">
                            <img src="/images/Admin/Panel_principal/mouri_informe1.png" className="w-full h-full object-contain" alt="Watermark" />
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-[#56473A] dark:bg-[#2E2720] text-[#F4EDE6] rounded-[30px] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-transparent dark:border-[#4A4033]">
                        <div className="flex flex-col gap-4 w-full sm:w-1/2">
                            <h3 className="text-sm font-black tracking-tight leading-tight">{t.fallecimientosGenero}</h3>

                            <div className="flex flex-col gap-1.5 text-[10px] font-bold">
                                <span className="bg-[#A27B5C] text-white px-2 py-1 rounded-md text-center">
                                    {t.mujeres} ({info.fallecimientosGenero.mujeres}%)
                                </span>
                                <span className="bg-[#8D7B68] text-white px-2 py-1 rounded-md text-center">
                                    {t.hombres} ({info.fallecimientosGenero.hombres}%)
                                </span>
                                <span className="bg-[#3E3227] text-white/70 px-2 py-1 rounded-md text-center">
                                    {t.noEspecificado} ({info.fallecimientosGenero.noEspecificado}%)
                                </span>
                            </div>
                        </div>

                        <div className="w-28 h-28 relative flex items-center justify-center group cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_10px_rgba(217,180,74,0.5)] shrink-0">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8D7B68" strokeWidth="4" />

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

                    <div className="lg:col-span-8 bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[30px] p-6 shadow-sm flex flex-col xl:flex-row justify-between gap-6">
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                            <h3 className="text-sm font-black text-[#8F7E54] dark:text-[#D9B44A] mb-4">{t.planesElegidos}</h3>

                            <div className="flex items-end justify-between gap-2 h-40 pt-4 border-b border-[#5D4E3F]/20 dark:border-[#4A4033] px-2">
                                {info.planesMasElegidos.map((plan, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1 group relative h-full">
                                        <span className="text-[10px] font-black mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 bg-[#5D4E3F] text-white px-1 rounded">
                                            {plan.pct}%
                                        </span>
                                        <span className="text-[11px] font-bold text-[#5D4E3F]/80 dark:text-[#C2B49A] mb-1">{plan.pct}%</span>
                                        <div
                                            className={`${plan.color} w-full rounded-t-md transition-all duration-1000 ease-out shadow-sm group-hover:brightness-95 group-hover:shadow-[0_0_12px_-2px_rgba(166,137,102,0.8)]`}
                                            style={{ height: animado ? `${plan.pct * 1.3}%` : '0%', transitionDelay: `${idx * 80}ms` }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 xl:flex-col xl:items-start xl:justify-center xl:min-w-[140px] xl:shrink-0 text-[11px] font-black">
                            {info.planesMasElegidos.map((plan, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${plan.color} flex-shrink-0`} />
                                    <span className="text-[#A68966] whitespace-nowrap">{plan.nombre}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-[#56473A] dark:bg-[#2E2720] text-[#F4EDE6] rounded-[30px] p-6 shadow-sm border border-transparent dark:border-[#4A4033]">
                        <h3 className="text-sm font-black mb-6">{t.rangosEdad}</h3>

                        <div className="flex flex-col md:flex-row justify-between gap-8 items-center">
                            <div className="flex items-end justify-between gap-2 sm:gap-4 w-full md:w-3/5 h-44 bg-[#41352A] p-4 rounded-2xl border border-white/10">
                                {info.rangosEdad.map((rango, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end relative group">
                                        <div className="w-4 sm:w-6 bg-white/10 h-full rounded-full flex flex-col justify-end overflow-hidden border border-white/5">
                                            <div
                                            className={`${rango.color} w-full rounded-b-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                                            style={{ height: animado ? `${rango.pct}%` : '0%', transitionDelay: `${idx * 80}ms` }}
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

                    <div className="lg:col-span-4 bg-[#41352A] dark:bg-[#221D17] text-[#F4EDE6] rounded-[30px] p-6 shadow-sm flex flex-col justify-between items-center text-center border border-transparent dark:border-[#4A4033]">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#D9B44A]">{t.afiliadosTipo}</h3>

                        <div className="w-32 h-32 relative flex items-center justify-center my-4 group cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_10px_rgba(217,180,74,0.5)]">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C2A67D" strokeWidth="5" />
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="15.915"
                                    fill="none"
                                    stroke="#FFFFFF"
                                    strokeWidth="5"
                                    strokeDasharray={`${info.afiliadosTipo.personas} 100`}
                                    strokeDashoffset="0"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-xl font-black text-[#5D4E3F]">{info.afiliadosTipo.personas}%</span>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full">
                            <div className="flex-1 bg-white text-[#5D4E3F] text-[10px] sm:text-[11px] font-black py-1.5 rounded-md shadow">
                                {t.personas} ({info.afiliadosTipo.personas}%)
                            </div>
                            <div className="flex-1 bg-[#C2A67D] text-[#5D4E3F] text-[10px] sm:text-[11px] font-black py-1.5 rounded-md shadow">
                                {t.mascotas} ({info.afiliadosTipo.mascotas}%)
                            </div>
                        </div>
                    </div>

                </div>
                )}

                {modo === 'operativo' && (
                    <div className="space-y-6">

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="relative flex-1 sm:flex-none w-full sm:w-auto">
                                <input
                                    type="text"
                                    value={busquedaUsuario}
                                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                                    placeholder={t.buscarNombreCedula}
                                    className="w-full sm:w-80 p-2.5 pl-9 bg-white dark:bg-[#2E2720] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E] dark:text-[#EDE4D3] focus:ring-2 focus:ring-[#A68966]/40 outline-none"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A68966] text-xs">🔍</span>
                            </div>
                            <button
                                onClick={() => setModalCrear('cliente')}
                                className="bg-[#56473A] text-white text-[11px] font-black px-4 py-2.5 rounded-xl hover:brightness-110 transition shadow-sm whitespace-nowrap w-full sm:w-auto"
                            >
                                {t.nuevoUsuario}
                            </button>
                        </div>

                        <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[30px] p-4 sm:p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-lg">🛡️</span>
                                <div>
                                    <h3 className="text-md font-black text-[#8F7E54] dark:text-[#D9B44A]">{t.administradores}</h3>
                                    <p className="text-[11px] text-[#5D4E3F]/60 dark:text-[#C2B49A] font-bold">{administradores.length} {administradores.length !== 1 ? t.resultados : t.resultado}</p>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                {administradores.length === 0 && (
                                    <p className="text-center text-xs text-[#A68966] font-bold py-6">{t.sinAdministradores}</p>
                                )}
                                {administradores.map((u) => <TarjetaUsuario key={u.id} u={u} />)}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[30px] p-4 sm:p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-lg">👤</span>
                                <div>
                                    <h3 className="text-md font-black text-[#8F7E54] dark:text-[#D9B44A]">{t.clientes}</h3>
                                    <p className="text-[11px] text-[#5D4E3F]/60 dark:text-[#C2B49A] font-bold">{clientes.length} {clientes.length !== 1 ? t.resultados : t.resultado}</p>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                {clientes.length === 0 && (
                                    <p className="text-center text-xs text-[#A68966] font-bold py-6">{t.sinClientes}</p>
                                )}
                                {clientes.map((u) => <TarjetaUsuario key={u.id} u={u} />)}
                            </div>
                        </div>

                    </div>
                )}

                {modo === 'configuracion' && (
                    <div className="space-y-6">
                        <GestionTiposDocumento tiposDocumento={tiposDocumento} />
                    </div>
                )}

            {modalCrear === 'cliente' && (
                <ModalCrearCliente
                    generos={generos}
                    tiposDocumento={tiposDocumento}
                    procesando={procesando}
                    setProcesando={setProcesando}
                    onClose={() => setModalCrear(null)}
                />
            )}

            {modalEditar && (
                <ModalEditarUsuario
                    usuario={modalEditar}
                    generos={generos}
                    tiposDocumento={tiposDocumento}
                    procesando={procesando}
                    setProcesando={setProcesando}
                    onClose={() => setModalEditar(null)}
                />
            )}
            </main>
        </div>
    );
}

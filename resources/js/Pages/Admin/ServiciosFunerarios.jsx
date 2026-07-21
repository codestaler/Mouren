import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AdminSidebar from './AdminSidebar';
import GraficasServiciosFunerarios from './Components/GraficasServiciosFunerarios';
import axios from 'axios';

// Diccionario de titulos, pestanas, botones y estados vacios principales.
// No traduce datos dinamicos (nombres, salas, etapas, observaciones) que vienen de la BD.
const TEXTOS = {
    es: {
        titulo: 'Servicios Funerarios,',
        subtitulo: 'Trazabilidad y ceremonias',
        registrarFallecimiento: '🕯️ Registrar Fallecimiento',
        modoOperativo: 'Modo Operativo',
        modoGrafico: 'Modo Gráfico',
        configuracion: 'Configuración',
        enProceso: 'En Proceso',
        finalizados: 'Finalizados',
        buscarPlaceholder: 'Buscar por nombre o cédula...',
        sinProceso: 'No hay servicios en proceso actualmente.',
        sinFinalizados: 'Aún no hay servicios finalizados.',
        acciones: '⚙️ Acciones ▾',
        programarCeremonia: '🕯️ Programar Ceremonia',
        agregarEtapa: '📋 Agregar Etapa',
        editarCeremonia: '✏️ Editar Ceremonia',
        cartaFallecimiento: 'Descargar Carta de Fallecimiento',
        cartaAtencion: 'Descargar Carta de Atención',
        generarImagen: 'Generar Imagen para WhatsApp',
        verHistorial: 'Ver historial',
        sala: 'Sala',
        generarImagenWhatsapp: '📲 Generar imagen WhatsApp',
        etapasServicio: 'Etapas de Servicio',
        nuevaEtapa: '+ Nueva Etapa',
        editar: 'Editar',
        eliminar: 'Eliminar',
        salasVelacion: 'Salas de Velación',
        nuevaSala: '+ Nueva Sala',
        cancelar: 'Cancelar',
        confirmar: 'Confirmar',
        guardando: 'Guardando...',
        registrarFallecimientoTitulo: 'Registrar Fallecimiento',
        buscaTitular: 'Busca al titular por cédula o nombre para ver su suscripción',
        cedulaONombre: 'Cédula o nombre del titular...',
        buscando: 'Buscando...',
        sinResultados: 'Sin resultados.',
        cambiarTitular: '← Cambiar titular',
        protegidos: 'Protegidos',
        cambiar: 'Cambiar',
        observacionOpcional: 'Observación (opcional)',
        confirmarFallecimiento: 'Confirmar Fallecimiento',
        procesando: 'Procesando...',
        cerrar: 'Cerrar',
        programarCeremoniaTitulo: 'Programar Ceremonia',
        seleccionaSala: 'Selecciona una sala...',
        observacionesOpcional: 'Observaciones (opcional)',
        agregarEtapaTitulo: 'Agregar Etapa de Trazabilidad',
        seleccionaEtapa: 'Selecciona una etapa...',
        descripcionEtapa: 'Descripción de la etapa',
        nuevaEtapaTitulo: 'Nueva Etapa',
        editarEtapaTitulo: 'Editar Etapa',
        nombreEtapaPlaceholder: 'Nombre de la etapa',
        nuevaSalaTitulo: 'Nueva Sala',
        editarSalaTitulo: 'Editar Sala',
        nombreSalaPlaceholder: 'Nombre de la sala',
        editarCeremoniaTitulo: 'Editar Ceremonia',
        observaciones: 'Observaciones',
        verificando: 'Verificando...',
    },
    en: {
        titulo: 'Funeral Services,',
        subtitulo: 'Traceability and ceremonies',
        registrarFallecimiento: '🕯️ Register Death',
        modoOperativo: 'Operations Mode',
        modoGrafico: 'Chart Mode',
        configuracion: 'Settings',
        enProceso: 'In Progress',
        finalizados: 'Completed',
        buscarPlaceholder: 'Search by name or ID...',
        sinProceso: 'There are no services in progress at the moment.',
        sinFinalizados: 'No services have been completed yet.',
        acciones: '⚙️ Actions ▾',
        programarCeremonia: '🕯️ Schedule Ceremony',
        agregarEtapa: '📋 Add Stage',
        editarCeremonia: '✏️ Edit Ceremony',
        cartaFallecimiento: 'Download Death Certificate',
        cartaAtencion: 'Download Service Letter',
        generarImagen: 'Generate WhatsApp Image',
        verHistorial: 'View history',
        sala: 'Room',
        generarImagenWhatsapp: '📲 Generate WhatsApp image',
        etapasServicio: 'Service Stages',
        nuevaEtapa: '+ New Stage',
        editar: 'Edit',
        eliminar: 'Delete',
        salasVelacion: 'Wake Rooms',
        nuevaSala: '+ New Room',
        cancelar: 'Cancel',
        confirmar: 'Confirm',
        guardando: 'Saving...',
        registrarFallecimientoTitulo: 'Register Death',
        buscaTitular: "Search for the policyholder by ID or name to see their subscription",
        cedulaONombre: "Policyholder's ID or name...",
        buscando: 'Searching...',
        sinResultados: 'No results.',
        cambiarTitular: '← Change policyholder',
        protegidos: 'Protected members',
        cambiar: 'Change',
        observacionOpcional: 'Note (optional)',
        confirmarFallecimiento: 'Confirm Death',
        procesando: 'Processing...',
        cerrar: 'Close',
        programarCeremoniaTitulo: 'Schedule Ceremony',
        seleccionaSala: 'Select a room...',
        observacionesOpcional: 'Notes (optional)',
        agregarEtapaTitulo: 'Add Traceability Stage',
        seleccionaEtapa: 'Select a stage...',
        descripcionEtapa: 'Stage description',
        nuevaEtapaTitulo: 'New Stage',
        editarEtapaTitulo: 'Edit Stage',
        nombreEtapaPlaceholder: 'Stage name',
        nuevaSalaTitulo: 'New Room',
        editarSalaTitulo: 'Edit Room',
        nombreSalaPlaceholder: 'Room name',
        editarCeremoniaTitulo: 'Edit Ceremony',
        observaciones: 'Notes',
        verificando: 'Verifying...',
    },
};

export default function ServiciosFunerarios({ serviciosEnProceso = [], serviciosFinalizados = [], etapas = [], salasDisponibles = [], todasLasSalas = [], estadisticas = {} }) {
    const { auth, flash } = usePage().props;
    const nombreUsuario = auth?.user?.nombre || 'Admin';
    const idioma = auth?.user?.idioma || 'es';
    const t = TEXTOS[idioma] || TEXTOS.es;

    const [pestaña, setPestaña] = useState('proceso');
    const [modo, setModo] = useState('operativo');
    const [modalFallecido, setModalFallecido] = useState(false);
    const [modalCeremonia, setModalCeremonia] = useState(null);
    const [modalEtapa, setModalEtapa] = useState(null);
    const [expandido, setExpandido] = useState(null);
    const [procesando, setProcesando] = useState(false);

    const [textoBusqueda, setTextoBusqueda] = useState('');
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
    const [titularSeleccionado, setTitularSeleccionado] = useState(null);
    const [busquedaLista, setBusquedaLista] = useState('');
    const [buscando, setBuscando] = useState(false);
    const [observacionFallecido, setObservacionFallecido] = useState('');
    const [afiliadoAMarcar, setAfiliadoAMarcar] = useState(null);
    const [modalEtapaForm, setModalEtapaForm] = useState(null);
    const [nombreEtapaForm, setNombreEtapaForm] = useState('');
    const [modalSalaForm, setModalSalaForm] = useState(null);
    const [nombreSalaForm, setNombreSalaForm] = useState('');
    const [estadoSalaForm, setEstadoSalaForm] = useState('Disponible');

    const [modalEditarCeremonia, setModalEditarCeremonia] = useState(null);

    useEffect(() => {
        if (textoBusqueda.trim().length < 2) {
            setResultadosBusqueda([]);
            return;
        }
        setBuscando(true);
        const delay = setTimeout(() => {
            axios.get('/admin/servicios-funerarios/buscar-titular', { params: { query: textoBusqueda } })
                .then(res => setResultadosBusqueda(res.data))
                .catch(() => setResultadosBusqueda([]))
                .finally(() => setBuscando(false));
        }, 350);
        return () => clearTimeout(delay);
    }, [textoBusqueda]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const destacarId = params.get('destacar');

        if (destacarId) {
            const idNum = parseInt(destacarId, 10);
            const estaEnProceso = serviciosEnProceso.some(s => s.id === idNum);
            const estaFinalizado = serviciosFinalizados.some(s => s.id === idNum);

            setModo('operativo');

            if (estaEnProceso) {
                setPestaña('proceso');
            } else if (estaFinalizado) {
                setPestaña('finalizados');
            }

            setExpandido(idNum);

            setTimeout(() => {
                const el = document.getElementById(`servicio-${idNum}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);
        }
    }, []);


    const filtrarServicios = (lista) => {
        if (!busquedaLista.trim()) return lista;
        const q = busquedaLista.toLowerCase();
        return lista.filter(s => {
            const sujeto = s.afiliado || s.mascota;
            const nombre = sujeto?.nombre?.toLowerCase() || '';
            const cedula = s.afiliado?.cedula?.toLowerCase() || '';
            return nombre.includes(q) || cedula.includes(q);
        });
    };

    const enviarMarcarFallecido = (e) => {
        e.preventDefault();
        if (!afiliadoAMarcar) return;

        setProcesando(true);
        router.post('/admin/servicios-funerarios/marcar-fallecido', {
            afiliado_id: afiliadoAMarcar.tipo === 'afiliado' ? afiliadoAMarcar.id : null,
            mascota_id: afiliadoAMarcar.tipo === 'mascota' ? afiliadoAMarcar.id : null,
            observacion: observacionFallecido,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setProcesando(false);
                setModalFallecido(false);
                setTitularSeleccionado(null);
                setAfiliadoAMarcar(null);
                setTextoBusqueda('');
                setObservacionFallecido('');
            }
        });
    };

    const [salaId, setSalaId] = useState('');
    const [fechaHora, setFechaHora] = useState('');
    const [observacionesCeremonia, setObservacionesCeremonia] = useState('');

    const enviarCeremonia = (e) => {
        e.preventDefault();
        setProcesando(true);
        router.post('/admin/servicios-funerarios/programar-ceremonia', {
            servicio_funerario_id: modalCeremonia,
            sala_velacion_id: salaId,
            fecha_hora: fechaHora,
            observaciones: observacionesCeremonia,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setProcesando(false);
                setModalCeremonia(null);
                setSalaId('');
                setFechaHora('');
                setObservacionesCeremonia('');
            }
        });
    };

    const [etapaId, setEtapaId] = useState('');
    const [descripcionEtapa, setDescripcionEtapa] = useState('');

    const enviarEtapa = (e) => {
        e.preventDefault();
        setProcesando(true);
        router.post('/admin/servicios-funerarios/agregar-etapa', {
            servicio_funerario_id: modalEtapa,
            etapa_id: etapaId,
            descripcion: descripcionEtapa,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setProcesando(false);
                setModalEtapa(null);
                setEtapaId('');
                setDescripcionEtapa('');
            }
        });
    };

    const confirmarYEjecutar = (mensaje, callback) => {
        if (window.confirm(mensaje)) {
            callback();
        }
    };

    const enviarCrearEtapa = (e) => {
        e.preventDefault();
        confirmarYEjecutar(`¿Confirmas crear la etapa "${nombreEtapaForm}"?`, () => {
            setProcesando(true);
            router.post('/admin/servicios-funerarios/etapas', { nombre: nombreEtapaForm }, {
                preserveScroll: true,
                onFinish: () => { setProcesando(false); setModalEtapaForm(null); setNombreEtapaForm(''); }
            });
        });
    };

    const enviarEditarEtapa = (e) => {
        e.preventDefault();
        confirmarYEjecutar(`¿Confirmas renombrar esta etapa a "${nombreEtapaForm}"?`, () => {
            setProcesando(true);
            router.put(`/admin/servicios-funerarios/etapas/${modalEtapaForm.id}`, { nombre: nombreEtapaForm }, {
                preserveScroll: true,
                onFinish: () => { setProcesando(false); setModalEtapaForm(null); setNombreEtapaForm(''); }
            });
        });
    };

    const eliminarEtapaConfirmar = (etapa) => {
        confirmarYEjecutar(`¿Seguro que quieres ELIMINAR la etapa "${etapa.nombre}"? Esta acción no se puede deshacer.`, () => {
            router.delete(`/admin/servicios-funerarios/etapas/${etapa.id}`, { preserveScroll: true });
        });
    };

    const enviarCrearSala = (e) => {
        e.preventDefault();
        confirmarYEjecutar(`¿Confirmas crear la sala "${nombreSalaForm}"?`, () => {
            setProcesando(true);
            router.post('/admin/servicios-funerarios/salas', { nombre: nombreSalaForm }, {
                preserveScroll: true,
                onFinish: () => { setProcesando(false); setModalSalaForm(null); setNombreSalaForm(''); }
            });
        });
    };

    const enviarEditarSala = (e) => {
        e.preventDefault();
        confirmarYEjecutar(`¿Confirmas guardar los cambios de la sala "${nombreSalaForm}" (estado: ${estadoSalaForm})?`, () => {
            setProcesando(true);
            router.put(`/admin/servicios-funerarios/salas/${modalSalaForm.id}`, { nombre: nombreSalaForm, estado: estadoSalaForm }, {
                preserveScroll: true,
                onFinish: () => { setProcesando(false); setModalSalaForm(null); setNombreSalaForm(''); setEstadoSalaForm('Disponible'); }
            });
        });
    };

    const eliminarSalaConfirmar = (sala) => {
        confirmarYEjecutar(`¿Seguro que quieres ELIMINAR la sala "${sala.nombre}"? Esta acción no se puede deshacer.`, () => {
            router.delete(`/admin/servicios-funerarios/salas/${sala.id}`, { preserveScroll: true });
        });
    };

    const enviarEditarCeremonia = (e) => {
        e.preventDefault();
        confirmarYEjecutar('¿Confirmas guardar los cambios de esta ceremonia?', () => {
            setProcesando(true);
            router.put(`/admin/servicios-funerarios/ceremonia/${modalEditarCeremonia.ceremoniaId}`, {
                sala_velacion_id: modalEditarCeremonia.sala_velacion_id,
                fecha_hora: modalEditarCeremonia.fecha_hora,
                observaciones: modalEditarCeremonia.observaciones,
            }, {
                preserveScroll: true,
                onFinish: () => { setProcesando(false); setModalEditarCeremonia(null); }
            });
        });
    };

    const renderTarjetaServicio = (servicio, esFinalizado) => {
        const sujeto = servicio.afiliado || servicio.mascota;
        const esAfiliado = !!servicio.afiliado;
        const ultimaEtapa = servicio.trazabilidades?.[0]?.etapa?.nombre || 'Sin etapa';
        const abierto = expandido === servicio.id;
        const tieneCeremonia = servicio.ceremonias && servicio.ceremonias.length > 0;

        return (
            <div id={`servicio-${servicio.id}`} key={servicio.id} className={`bg-white dark:bg-[#2E2720] border rounded-[24px] p-4 sm:p-6 shadow-sm transition-all ${expandido === servicio.id ? 'ring-4 ring-[#D9B44A]/50' : ''} ${esFinalizado ? 'border-[#D9B44A]/40' : 'border-[#A68966]/20 dark:border-[#4A4033]'}`}>
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <div className="min-w-0">
                        <h3 className="font-black text-[#5D4E3F] dark:text-[#EDE4D3] truncate">
                            {sujeto?.nombre || 'Sin nombre'}
                            <span className="ml-2 text-[10px] font-bold text-[#A68966] uppercase">
                                {esAfiliado ? '👤 Persona' : '🐾 Mascota'}
                            </span>
                        </h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${esFinalizado ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' : 'bg-[#E8C468] dark:bg-[#D9B44A]/30 text-[#6B5312] dark:text-[#D9B44A]'}`}>
                            {ultimaEtapa}
                        </span>
                    </div>

                    <div className="flex gap-2 flex-wrap items-center">
                        {!esFinalizado && (
                            <div className="relative group/menu">
                                <button className="px-3 py-1.5 rounded-xl bg-[#56473A] text-white font-bold text-[11px] hover:bg-[#6B5B47] transition-all shadow-sm hover:shadow-md flex items-center gap-1">
                                    {t.acciones}
                                </button>
                                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#2E2720] rounded-xl shadow-lg border border-[#E8DFC8] dark:border-[#4A4033] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-30 overflow-hidden">
                                    {!tieneCeremonia && (
                                        <button onClick={() => setModalCeremonia(servicio.id)}
                                            className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-[#4D78A3] dark:text-[#7FAEDD] hover:bg-[#F4EDE6] dark:hover:bg-[#221D17] transition">
                                            {t.programarCeremonia}
                                        </button>
                                    )}
                                    <button onClick={() => setModalEtapa(servicio.id)}
                                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-[#8F7E20] dark:text-[#D9B44A] hover:bg-[#F4EDE6] dark:hover:bg-[#221D17] transition">
                                        {t.agregarEtapa}
                                    </button>

                                    {tieneCeremonia && (
                                        <button onClick={() => setModalEditarCeremonia({
                                            ceremoniaId: servicio.ceremonias[0].id,
                                            sala_velacion_id: servicio.ceremonias[0].sala_velacion_id,
                                            fecha_hora: servicio.ceremonias[0].fecha_hora?.slice(0, 16),
                                            observaciones: servicio.ceremonias[0].observaciones || '',
                                        })}
                                            className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-[#4D78A3] dark:text-[#7FAEDD] hover:bg-[#F4EDE6] dark:hover:bg-[#221D17] transition">
                                            {t.editarCeremonia}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <a href={`/admin/servicios-funerarios/${servicio.id}/carta-fallecimiento`} target="_blank" rel="noreferrer"
                            title={t.cartaFallecimiento}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#56473A]/10 dark:bg-[#56473A]/30 text-[#56473A] dark:text-[#D9B44A] hover:bg-[#56473A] hover:text-white hover:scale-110 transition-all duration-200 shadow-sm">
                            📄
                        </a>
                        <a href={`/admin/servicios-funerarios/${servicio.id}/carta-atencion`} target="_blank" rel="noreferrer"
                            title={t.cartaAtencion}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#4D78A3]/10 dark:bg-[#4D78A3]/30 text-[#4D78A3] dark:text-[#7FAEDD] hover:bg-[#4D78A3] hover:text-white hover:scale-110 transition-all duration-200 shadow-sm">
                            📋
                        </a>
                        {tieneCeremonia && (
                            <a href={`/admin/servicios-funerarios/ceremonia/${servicio.ceremonias[0].id}/imagen-whatsapp`} target="_blank" rel="noreferrer"
                                title={t.generarImagen}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 hover:bg-green-600 hover:text-white hover:scale-110 transition-all duration-200 shadow-sm">
                                📲
                            </a>
                        )}

                        <button onClick={() => setExpandido(abierto ? null : servicio.id)}
                            title={t.verHistorial}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#4A4033] text-gray-600 dark:text-[#C2B49A] hover:bg-gray-600 hover:text-white hover:scale-110 transition-all duration-200 shadow-sm">
                            {abierto ? '▲' : '▼'}
                        </button>
                    </div>
                </div>

                {abierto && (
                    <div className="mt-4 pt-4 border-t border-[#E8DFC8] dark:border-[#4A4033] space-y-2">
                        {servicio.trazabilidades.map((tr) => (
                            <div key={tr.id} className="text-[11px] flex flex-wrap gap-2">
                                <span className="font-black text-[#A68966] shrink-0">{tr.etapa?.nombre}:</span>
                                <span className="text-[#6A5A48] dark:text-[#C2B49A]">{tr.descripcion}</span>
                                <span className="text-gray-400 sm:ml-auto shrink-0">{new Date(tr.fecha).toLocaleDateString()}</span>
                            </div>
                        ))}
                        {tieneCeremonia && (
                            <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
                                <p className="text-[11px] text-[#4D78A3] dark:text-[#7FAEDD] font-bold">
                                    🕯️ {t.sala}: {servicio.ceremonias[0].sala_velacion?.nombre} — {new Date(servicio.ceremonias[0].fecha_hora).toLocaleString()}
                                </p>
                                <a href={`/admin/servicios-funerarios/ceremonia/${servicio.ceremonias[0].id}/imagen-whatsapp`} target="_blank" rel="noreferrer"
                                    className="text-[10px] font-bold text-green-600 dark:text-green-400 hover:underline">
                                    {t.generarImagenWhatsapp}
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F4EDE6] dark:bg-[#221D17] font-['Hepta_Slab'] flex relative text-[#5D4E3F] dark:text-[#EDE4D3] transition-colors duration-500">
            <Head title="Servicios Funerarios - Mouren" />
            <AdminSidebar />

            <main className="flex-1 p-4 sm:p-8 content-shift transition-all duration-700 overflow-x-hidden">
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                            {t.titulo} <span className="font-black text-[#8F7E54] dark:text-[#D9B44A]">{nombreUsuario}</span>
                        </h1>
                        <p className="text-xs text-[#5D4E3F]/70 dark:text-[#C2B49A] italic mt-1">{t.subtitulo}</p>
                    </div>

                    <button onClick={() => setModalFallecido(true)}
                        className="bg-[#56473A] text-white text-[11px] font-black px-5 py-2.5 rounded-xl shadow-sm hover:brightness-110 transition w-full lg:w-auto">
                        {t.registrarFallecimiento}
                    </button>
                </header>

                {flash?.message && <div className="mb-6 p-4 bg-[#56473A] text-white rounded-2xl text-xs font-bold shadow-sm">✨ {flash.message}</div>}
                {flash?.error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-2xl text-xs font-bold border-l-4 border-red-500 shadow-sm">⚠️ {flash.error}</div>}

                <div className="flex flex-wrap gap-2 mb-4 bg-[#EDE4D3] dark:bg-[#2E2720] p-1.5 rounded-2xl w-fit max-w-full">
                    <button
                        onClick={() => { setModo('operativo'); setPestaña('proceso'); }}
                        className={`px-4 sm:px-5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wide transition-all whitespace-nowrap ${modo === 'operativo' ? 'bg-[#56473A] text-white shadow-md' : 'text-[#8F7E54] dark:text-[#D9B44A] hover:bg-white/50 dark:hover:bg-white/5'}`}
                    >
                        ⚙️ {t.modoOperativo}
                    </button>
                    <button
                        onClick={() => { setModo('grafico'); setPestaña('graficas'); }}
                        className={`px-4 sm:px-5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wide transition-all whitespace-nowrap ${modo === 'grafico' ? 'bg-[#56473A] text-white shadow-md' : 'text-[#8F7E54] dark:text-[#D9B44A] hover:bg-white/50 dark:hover:bg-white/5'}`}
                    >
                        📊 {t.modoGrafico}
                    </button>
                    <button
                        onClick={() => setModo('configuracion')}
                        className={`px-4 sm:px-5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wide transition-all whitespace-nowrap ${modo === 'configuracion' ? 'bg-[#56473A] text-white shadow-md' : 'text-[#8F7E54] dark:text-[#D9B44A] hover:bg-white/50 dark:hover:bg-white/5'}`}
                    >
                        🛠️ {t.configuracion}
                    </button>
                </div>

                {modo === 'operativo' && (
                    <div className="flex gap-2 mb-6 border-b border-[#A68966]/20 dark:border-[#4A4033] overflow-x-auto">
                        {[
                            { key: 'proceso', label: `${t.enProceso} (${serviciosEnProceso.length})` },
                            { key: 'finalizados', label: `${t.finalizados} (${serviciosFinalizados.length})` },
                        ].map(p => (
                            <button key={p.key} onClick={() => setPestaña(p.key)}
                                className={`px-4 py-2 text-xs font-black uppercase tracking-wide border-b-2 transition whitespace-nowrap ${pestaña === p.key ? 'border-[#56473A] text-[#56473A] dark:text-[#D9B44A] dark:border-[#D9B44A]' : 'border-transparent text-gray-400'}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                )}

                {modo === 'operativo' && (pestaña === 'proceso' || pestaña === 'finalizados') && (
                    <input
                        type="text"
                        value={busquedaLista}
                        onChange={(e) => setBusquedaLista(e.target.value)}
                        placeholder={t.buscarPlaceholder}
                        className="w-full sm:w-80 mb-4 p-2.5 bg-white dark:bg-[#2E2720] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E] dark:text-[#EDE4D3] shadow-sm"
                    />
                )}

                {modo === 'operativo' && pestaña === 'proceso' && (
                    <div className="space-y-4">
                        {serviciosEnProceso.length === 0 && (
                            <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-8 text-center text-sm text-[#8C7A67] dark:text-[#C2B49A] italic">
                                {t.sinProceso}
                            </div>
                        )}
                        {filtrarServicios(serviciosEnProceso).map(s => renderTarjetaServicio(s, false))}
                    </div>
                )}

                {modo === 'operativo' && pestaña === 'finalizados' && (
                    <div className="space-y-4">
                        {serviciosFinalizados.length === 0 && (
                            <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-8 text-center text-sm text-[#8C7A67] dark:text-[#C2B49A] italic">
                                {t.sinFinalizados}
                            </div>
                        )}
                        {filtrarServicios(serviciosFinalizados).map(s => renderTarjetaServicio(s, true))}
                    </div>
                )}

                {modo === 'grafico' && (
                    <GraficasServiciosFunerarios estadisticas={estadisticas} />
                )}

                {modo === 'configuracion' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-4 sm:p-6 shadow-sm">
                            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                                <h3 className="text-sm font-black text-[#8F7E54] dark:text-[#D9B44A]">{t.etapasServicio}</h3>
                                <button
                                    onClick={() => { setModalEtapaForm('crear'); setNombreEtapaForm(''); }}
                                    className="px-3 py-1.5 rounded-xl bg-[#56473A] text-white text-[11px] font-bold hover:brightness-110 transition"
                                >
                                    {t.nuevaEtapa}
                                </button>
                            </div>
                            <div className="space-y-2">
                                {etapas.map((et) => (
                                    <div key={et.id} className="flex flex-wrap justify-between items-center gap-2 p-3 bg-[#F4EDE6]/50 dark:bg-[#221D17]/60 rounded-xl border border-[#A68966]/10 dark:border-[#4A4033]">
                                        <span className="text-xs font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">{et.nombre}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setModalEtapaForm(et); setNombreEtapaForm(et.nombre); }}
                                                className="text-[10px] font-bold text-[#4D78A3] dark:text-[#7FAEDD] hover:underline"
                                            >
                                                {t.editar}
                                            </button>
                                            <button
                                                onClick={() => eliminarEtapaConfirmar(et)}
                                                className="text-[10px] font-bold text-red-500 hover:underline"
                                            >
                                                {t.eliminar}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-4 sm:p-6 shadow-sm">
                            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                                <h3 className="text-sm font-black text-[#8F7E54] dark:text-[#D9B44A]">{t.salasVelacion}</h3>
                                <button
                                    onClick={() => { setModalSalaForm('crear'); setNombreSalaForm(''); }}
                                    className="px-3 py-1.5 rounded-xl bg-[#56473A] text-white text-[11px] font-bold hover:brightness-110 transition"
                                >
                                    {t.nuevaSala}
                                </button>
                            </div>
                            <div className="space-y-2">
                                {todasLasSalas.map((sala) => (
                                    <div key={sala.id} className="flex flex-wrap justify-between items-center gap-2 p-3 bg-[#F4EDE6]/50 dark:bg-[#221D17]/60 rounded-xl border border-[#A68966]/10 dark:border-[#4A4033]">
                                        <div>
                                            <span className="text-xs font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">{sala.nombre}</span>
                                            <span className={`ml-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                sala.estado === 'Disponible' ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' :
                                                sala.estado === 'Ocupada' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                                                'bg-gray-200 dark:bg-[#4A4033] text-gray-600 dark:text-[#C2B49A]'
                                            }`}>
                                                {sala.estado}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setModalSalaForm(sala); setNombreSalaForm(sala.nombre); setEstadoSalaForm(sala.estado); }}
                                                className="text-[10px] font-bold text-[#4D78A3] dark:text-[#7FAEDD] hover:underline"
                                            >
                                                {t.editar}
                                            </button>
                                            <button
                                                onClick={() => eliminarSalaConfirmar(sala)}
                                                className="text-[10px] font-bold text-red-500 hover:underline"
                                            >
                                                {t.eliminar}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {modalFallecido && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#FDFBF7] dark:bg-[#2E2720] rounded-[28px] max-w-lg w-full border-2 border-[#60533E] dark:border-[#4A4033] shadow-2xl max-h-[85vh] flex flex-col">
                        <div className="p-6 border-b border-[#E3D9BC] dark:border-[#4A4033]">
                            <h3 className="font-black text-sm uppercase text-[#60533E] dark:text-[#D9B44A]">{t.registrarFallecimientoTitulo}</h3>
                            <p className="text-[10px] text-[#A68966] mt-1">{t.buscaTitular}</p>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-3">
                            {!titularSeleccionado ? (
                                <>
                                    <input
                                        type="text"
                                        value={textoBusqueda}
                                        onChange={(e) => setTextoBusqueda(e.target.value)}
                                        placeholder={t.cedulaONombre}
                                        className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E]"
                                    />
                                    {buscando && <p className="text-[10px] text-[#A68966] italic">{t.buscando}</p>}
                                    {!buscando && textoBusqueda.trim().length >= 2 && resultadosBusqueda.length === 0 && (
                                        <p className="text-[10px] text-gray-400 italic">{t.sinResultados}</p>
                                    )}
                                    <div className="space-y-1.5">
                                        {resultadosBusqueda.map((u) => (
                                            <button key={u.id} type="button" onClick={() => setTitularSeleccionado(u)}
                                                className="w-full text-left p-3 bg-white dark:bg-[#221D17] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl hover:border-[#A68966] hover:bg-[#FDF6E9] dark:hover:bg-[#2E2720] transition">
                                                <p className="text-xs font-black text-[#60533E] dark:text-[#EDE4D3]">{u.nombre}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-[#C2B49A]">Cédula: {u.cedula} · {u.suscripciones.length} suscripción(es)</p>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : !afiliadoAMarcar ? (
                                <>
                                    <button type="button" onClick={() => setTitularSeleccionado(null)} className="text-[10px] font-bold text-[#A68966] hover:underline">
                                        {t.cambiarTitular}
                                    </button>
                                    <p className="text-xs font-black text-[#60533E] dark:text-[#EDE4D3]">{titularSeleccionado.nombre} — {titularSeleccionado.cedula}</p>

                                    {titularSeleccionado.suscripciones.map((s) => (
                                        <div key={s.id} className="border-2 border-[#E3D9BC] dark:border-[#4A4033] rounded-2xl p-4 bg-gradient-to-br from-white to-[#FDF6E9] dark:from-[#221D17] dark:to-[#2E2720] shadow-sm">
                                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#E3D9BC] dark:border-[#4A4033]">
                                                <p className="text-xs font-black text-[#60533E] dark:text-[#D9B44A] uppercase tracking-wide">💎 {s.plan}</p>
                                                {s.total_deuda > 0 ? (
                                                    <span className="text-[10px] font-black text-white bg-red-500 px-2 py-1 rounded-full">
                                                        Debe ${Number(s.total_deuda).toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                                        Al día ✓
                                                    </span>
                                                )}
                                            </div>

                                            {s.facturas && s.facturas.length > 0 && (
                                                <div className="mb-3 bg-white/60 dark:bg-white/5 rounded-xl p-2.5 space-y-1">
                                                    {s.facturas.slice(0, 3).map(f => (
                                                        <div key={f.id} className="flex justify-between text-[9px] items-center">
                                                            <span className={`font-bold px-1.5 py-0.5 rounded ${f.estado === 'Pagada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                                #{f.id} · {f.estado}
                                                            </span>
                                                            <span className="font-black text-[#60533E] dark:text-[#EDE4D3]">${Number(f.saldo_pendiente).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {(s.recuerdos?.length > 0 || s.serviciosExtras?.length > 0) && (
                                                <div className="mb-3 flex flex-wrap gap-1.5">
                                                    {s.recuerdos?.map((r, i) => (
                                                        <span key={i} className="text-[9px] font-bold bg-[#FBEEC1] text-[#8F7E20] px-2 py-1 rounded-full">🎁 {r.nombre}</span>
                                                    ))}
                                                    {s.serviciosExtras?.map((se, i) => (
                                                        <span key={i} className="text-[9px] font-bold bg-[#E8D4F0] text-[#7A4D8F] px-2 py-1 rounded-full">➕ {se.nombre}</span>
                                                    ))}
                                                </div>
                                            )}

                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#A68966]/70 mb-1.5">{t.protegidos}</p>
                                            <div className="space-y-1.5">
                                                {s.afiliados.map((a) => (
                                                    <button
                                                        key={a.id}
                                                        type="button"
                                                        disabled={a.estado === 'Fallecido'}
                                                        onClick={() => setAfiliadoAMarcar({ id: a.id, tipo: 'afiliado', nombre: a.nombre })}
                                                        className={`w-full text-left p-2.5 rounded-lg text-xs flex justify-between items-center transition-all ${a.estado === 'Fallecido' ? 'bg-gray-100 dark:bg-[#4A4033] text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-[#221D17] hover:bg-[#F4EDE6] dark:hover:bg-[#2E2720] hover:shadow-sm border border-[#E3D9BC] dark:border-[#4A4033] hover:border-[#A68966] text-[#5D4E3F] dark:text-[#EDE4D3]'}`}
                                                    >
                                                        <span>{a.nombre} <span className="text-gray-400">({a.parentesco})</span></span>
                                                        {a.estado === 'Fallecido' && <span className="text-[9px] font-black uppercase">🕯️ Fallecido</span>}
                                                    </button>
                                                ))}
                                                {s.mascotas.map((m) => (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        disabled={m.estado === 'Fallecido'}
                                                        onClick={() => setAfiliadoAMarcar({ id: m.id, tipo: 'mascota', nombre: m.nombre })}
                                                        className={`w-full text-left p-2.5 rounded-lg text-xs flex justify-between items-center transition-all ${m.estado === 'Fallecido' ? 'bg-gray-100 dark:bg-[#4A4033] text-gray-400 cursor-not-allowed' : 'bg-white dark:bg-[#221D17] hover:bg-[#F4EDE6] dark:hover:bg-[#2E2720] hover:shadow-sm border border-[#E3D9BC] dark:border-[#4A4033] hover:border-[#A68966] text-[#5D4E3F] dark:text-[#EDE4D3]'}`}
                                                    >
                                                        <span>🐾 {m.nombre} <span className="text-gray-400">({m.especie})</span></span>
                                                        {m.estado === 'Fallecido' && <span className="text-[9px] font-black uppercase">🕯️ Fallecido</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <form onSubmit={enviarMarcarFallecido} className="space-y-3">
                                    <div className="p-3 bg-[#F4EDE6] dark:bg-[#221D17] rounded-xl border border-[#A68966]/30 dark:border-[#4A4033] flex justify-between items-center">
                                        <p className="text-xs font-black text-[#60533E] dark:text-[#EDE4D3]">{afiliadoAMarcar.nombre}</p>
                                        <button type="button" onClick={() => setAfiliadoAMarcar(null)} className="text-[10px] font-bold text-red-500 hover:underline">{t.cambiar}</button>
                                    </div>
                                    <textarea
                                        value={observacionFallecido}
                                        onChange={(e) => setObservacionFallecido(e.target.value)}
                                        placeholder={t.observacionOpcional}
                                        className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs h-20 resize-none"
                                    />
                                    <div className="flex gap-2 text-[10px] font-black uppercase">
                                        <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50">
                                            {procesando ? t.procesando : t.confirmarFallecimiento}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="p-4 border-t border-[#E3D9BC] dark:border-[#4A4033]">
                            <button type="button" onClick={() => { setModalFallecido(false); setTitularSeleccionado(null); setAfiliadoAMarcar(null); setTextoBusqueda(''); }}
                                className="w-full py-2.5 bg-gray-200 dark:bg-[#4A4033] text-gray-700 dark:text-[#EDE4D3] rounded-xl text-[10px] font-black uppercase">
                                {t.cerrar}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalCeremonia && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <form onSubmit={enviarCeremonia} className="bg-[#FDFBF7] dark:bg-[#2E2720] p-6 rounded-[28px] max-w-sm w-full border-2 border-[#60533E] dark:border-[#4A4033] shadow-2xl space-y-4">
                        <h3 className="font-black text-sm uppercase text-[#60533E] dark:text-[#D9B44A]">{t.programarCeremoniaTitulo}</h3>
                        <select value={salaId} onChange={(e) => setSalaId(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E]" required>
                            <option value="">{t.seleccionaSala}</option>
                            {salasDisponibles.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                        <input type="datetime-local" value={fechaHora} onChange={(e) => setFechaHora(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E]" required />
                        <textarea value={observacionesCeremonia} onChange={(e) => setObservacionesCeremonia(e.target.value)} placeholder={t.observacionesOpcional} className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs h-20 resize-none" />
                        <div className="flex gap-2 text-[10px] font-black uppercase">
                            <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50">{procesando ? t.guardando : t.confirmar}</button>
                            <button type="button" onClick={() => setModalCeremonia(null)} className="flex-1 py-2.5 bg-gray-200 dark:bg-[#4A4033] text-gray-700 dark:text-[#EDE4D3] rounded-xl">{t.cancelar}</button>
                        </div>
                    </form>
                </div>
            )}

            {modalEtapa && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <form onSubmit={enviarEtapa} className="bg-[#FDFBF7] dark:bg-[#2E2720] p-6 rounded-[28px] max-w-sm w-full border-2 border-[#60533E] dark:border-[#4A4033] shadow-2xl space-y-4">
                        <h3 className="font-black text-sm uppercase text-[#60533E] dark:text-[#D9B44A]">{t.agregarEtapaTitulo}</h3>
                        <select value={etapaId} onChange={(e) => setEtapaId(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E]" required>
                            <option value="">{t.seleccionaEtapa}</option>
                            {etapas.map((et) => <option key={et.id} value={et.id}>{et.nombre}</option>)}
                        </select>
                        <textarea value={descripcionEtapa} onChange={(e) => setDescripcionEtapa(e.target.value)} placeholder={t.descripcionEtapa} className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs h-20 resize-none" required />
                        <div className="flex gap-2 text-[10px] font-black uppercase">
                            <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50">{procesando ? t.guardando : t.confirmar}</button>
                            <button type="button" onClick={() => setModalEtapa(null)} className="flex-1 py-2.5 bg-gray-200 dark:bg-[#4A4033] text-gray-700 dark:text-[#EDE4D3] rounded-xl">{t.cancelar}</button>
                        </div>
                    </form>
                </div>
            )}
            {modalEtapaForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <form onSubmit={modalEtapaForm === 'crear' ? enviarCrearEtapa : enviarEditarEtapa} className="bg-[#FDFBF7] dark:bg-[#2E2720] p-6 rounded-[28px] max-w-sm w-full border-2 border-[#60533E] dark:border-[#4A4033] shadow-2xl space-y-4">
                        <h3 className="font-black text-sm uppercase text-[#60533E] dark:text-[#D9B44A]">
                            {modalEtapaForm === 'crear' ? t.nuevaEtapaTitulo : t.editarEtapaTitulo}
                        </h3>
                        <input
                            type="text"
                            value={nombreEtapaForm}
                            onChange={(e) => setNombreEtapaForm(e.target.value)}
                            placeholder={t.nombreEtapaPlaceholder}
                            className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E]"
                            required
                        />
                        <div className="flex gap-2 text-[10px] font-black uppercase">
                            <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50">
                                {procesando ? t.guardando : t.confirmar}
                            </button>
                            <button type="button" onClick={() => setModalEtapaForm(null)} className="flex-1 py-2.5 bg-gray-200 dark:bg-[#4A4033] text-gray-700 dark:text-[#EDE4D3] rounded-xl">
                                {t.cancelar}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {modalSalaForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <form onSubmit={modalSalaForm === 'crear' ? enviarCrearSala : enviarEditarSala} className="bg-[#FDFBF7] dark:bg-[#2E2720] p-6 rounded-[28px] max-w-sm w-full border-2 border-[#60533E] dark:border-[#4A4033] shadow-2xl space-y-4">
                        <h3 className="font-black text-sm uppercase text-[#60533E] dark:text-[#D9B44A]">
                            {modalSalaForm === 'crear' ? t.nuevaSalaTitulo : t.editarSalaTitulo}
                        </h3>
                        <input
                            type="text"
                            value={nombreSalaForm}
                            onChange={(e) => setNombreSalaForm(e.target.value)}
                            placeholder={t.nombreSalaPlaceholder}
                            className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E]"
                            required
                        />
                        {modalSalaForm !== 'crear' && (
                            <select
                                value={estadoSalaForm}
                                onChange={(e) => setEstadoSalaForm(e.target.value)}
                                className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E]"
                            >
                                <option value="Disponible">Disponible</option>
                                <option value="Ocupada">Ocupada</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                            </select>
                        )}
                        <div className="flex gap-2 text-[10px] font-black uppercase">
                            <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50">
                                {procesando ? t.guardando : t.confirmar}
                            </button>
                            <button type="button" onClick={() => setModalSalaForm(null)} className="flex-1 py-2.5 bg-gray-200 dark:bg-[#4A4033] text-gray-700 dark:text-[#EDE4D3] rounded-xl">
                                {t.cancelar}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {modalEditarCeremonia && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <form onSubmit={enviarEditarCeremonia} className="bg-[#FDFBF7] dark:bg-[#2E2720] p-6 rounded-[28px] max-w-sm w-full border-2 border-[#60533E] dark:border-[#4A4033] shadow-2xl space-y-4">
                        <h3 className="font-black text-sm uppercase text-[#60533E] dark:text-[#D9B44A]">{t.editarCeremoniaTitulo}</h3>
                        <select
                            value={modalEditarCeremonia.sala_velacion_id}
                            onChange={(e) => setModalEditarCeremonia({ ...modalEditarCeremonia, sala_velacion_id: e.target.value })}
                            className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E]"
                            required
                        >
                            {salasDisponibles.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                            {todasLasSalas.filter(s => s.id === modalEditarCeremonia.sala_velacion_id && s.estado !== 'Disponible').map(s => (
                                <option key={s.id} value={s.id}>{s.nombre} (actual)</option>
                            ))}
                        </select>
                        <input
                            type="datetime-local"
                            value={modalEditarCeremonia.fecha_hora}
                            onChange={(e) => setModalEditarCeremonia({ ...modalEditarCeremonia, fecha_hora: e.target.value })}
                            className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E]"
                            required
                        />
                        <textarea
                            value={modalEditarCeremonia.observaciones}
                            onChange={(e) => setModalEditarCeremonia({ ...modalEditarCeremonia, observaciones: e.target.value })}
                            placeholder={t.observaciones}
                            className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs h-20 resize-none"
                        />
                        <div className="flex gap-2 text-[10px] font-black uppercase">
                            <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50">
                                {procesando ? t.guardando : t.confirmar}
                            </button>
                            <button type="button" onClick={() => setModalEditarCeremonia(null)} className="flex-1 py-2.5 bg-gray-200 dark:bg-[#4A4033] text-gray-700 dark:text-[#EDE4D3] rounded-xl">
                                {t.cancelar}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

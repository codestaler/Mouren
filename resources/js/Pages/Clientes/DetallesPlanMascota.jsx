import React, { useState, useEffect } from 'react';
import ResumenCardsMascota from './components/ResumenCardsMascota';
import MascotasPanel from './Components/MascotasPanel';
import ServiciosExtrasPanel from './Components/ServiciosExtrasPanel';
import ServiciosBaseIncluidosPanel from './Components/ServiciosBaseIncluidosPanel';
import ModalMascota from './Components/ModalMascota';
import ModalCatalogoServicios from './Components/ModalCatalogoServicios';
import ModalConfirmarEliminar from './Components/ModalConfirmarEliminar';
import ModalExitoMouren from './Components/ModalExitoMouren';
import ModalErrorMouren from './Components/ModalErrorMouren';
import { Head, usePage, router } from '@inertiajs/react';
import Sidebar from './Sidebar';

// 🆕 AJUSTA esta función si ya tienes/creas una calculadora de costos específica
// para mascotas (equivalente a calcularTotalSuscripcion del lado humano). Por ahora
// suma: cuota base del plan x cantidad de mascotas + recuerdo de cada mascota + servicios extra.
function calcularTotalSuscripcionMascota(plan, mascotas, serviciosExtras, todosLosRecuerdos) {
    if (!plan) return 0;
    const base = Number(plan.cuota_base || 0);
    const totalMascotas = base * (mascotas?.length || 0);

    const totalServicios = (serviciosExtras || []).reduce(
        (sum, s) => sum + Number(s.precio_pagado ?? s.pivot?.precio_pagado ?? s.precio ?? 0),
        0
    );

    const totalRecuerdos = (mascotas || []).reduce((sum, m) => {
        const dataFuneraria = m.servicio_funerario || {};
        const recuerdoId = m.recuerdo_id ?? dataFuneraria.recuerdo_id;
        const recuerdo = dataFuneraria.recuerdo || todosLosRecuerdos.find(r => r.id == recuerdoId);
        return sum + Number(recuerdo?.precio_adicional || 0);
    }, 0);

    return totalMascotas + totalServicios + totalRecuerdos;
}

export default function DetallesPlanMascota({
    suscripcion = null,
    canciones = [],
    todosLosServicios = [],
    todosLosRecuerdos = [],
    especies = []
}) {
    const { auth } = usePage().props;

    // --- VALIDACIÓN DE COBERTURA ACTIVA ---
    if (!suscripcion || Object.keys(suscripcion).length === 0) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#221D17] font-['Hepta_Slab'] text-[#5D4E3F] dark:text-[#EDE4D3] flex flex-col md:flex-row relative overflow-x-hidden transition-colors duration-500">
                <Head title="Sin Plan de Mascota Activo - Mouren" />
                <Sidebar />
                <main className="flex-1 w-full min-w-0 p-6 sm:p-10 content-shift transition-all duration-700 ease-in-out flex items-center justify-center">
                    <h2 className="text-xl sm:text-2xl font-black text-[#5C4F3C] dark:text-[#EDE4D3]">🐾 Sin Plan Huella Eterna Activo</h2>
                </main>
            </div>
        );
    }

    // --- ESTADOS ---
    const [serviciosExtras, setServiciosExtras] = useState(suscripcion?.servicios_extras || []);
    const [mascotas, setMascotas] = useState(suscripcion?.mascotas || []);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [cuotaTotalDinamica, setCuotaTotalDinamica] = useState(suscripcion?.cuota_mensual || 0);
    const [datosCargados, setDatosCargados] = useState(false);
    const [modalConfig, setModalConfig] = useState({ tipo: null, visible: false });
    const [formMascota, setFormMascota] = useState({ id: null, nombre: '', especie_id: '', raza_id: '', fecha_nacimiento: '', cancion_id: '', recuerdo_id: '' });
    const [idMascotaAEliminar, setIdMascotaAEliminar] = useState(null);

    const plan = suscripcion.plan || {};
    const serviciosBaseFijos = plan.servicios || [];

    // =======================
    // MASCOTAS
    // =======================

    const guardarMascotaGabinete = (e) => {
        e.preventDefault();

        if (formMascota.id) {
            setMascotas(mascotas.map((m) => (m.id === formMascota.id ? { ...m, ...formMascota } : m)));
        } else {
            setMascotas([...mascotas, { ...formMascota, id: Date.now(), estado: 'activo' }]);
        }

        cerrarModal();
    };

    const iniciarEdicionMascota = (mascota) => {
        const funeraria = mascota.servicio_funerario || {};

        setFormMascota({
            id: mascota.id,
            nombre: mascota.nombre,
            especie_id: mascota.especie_id || mascota.especie?.id || '',
            raza_id: mascota.raza_id || mascota.raza?.id || '',
            fecha_nacimiento: mascota.fecha_nacimiento ? mascota.fecha_nacimiento.split('T')[0] : '',
            cancion_id: funeraria.cancion_id || '',
            recuerdo_id: mascota.recuerdo_id || funeraria.recuerdo_id || ''
        });

        abrirModal('FORMULARIO_MASCOTA');
    };

    const ventanaConfirmarQuitar = (mascota) => {
        setIdMascotaAEliminar(mascota.id);
        abrirModal('CONFIRM_ELIMINAR_MASCOTA');
    };

    const ejecutarEliminacionMascota = () => {
        setMascotas(mascotas.filter((m) => m.id !== idMascotaAEliminar));
        setIdMascotaAEliminar(null);
        cerrarModal();
    };

    // =======================
    // SERVICIOS EXTRAS (misma lógica que el lado humano)
    // =======================

    const agregarExtraCatalogo = (servicio) => {
        const existe = serviciosExtras.some((s) => s.id === servicio.id);
        if (existe) {
            alert('Este servicio ya fue agregado');
            return;
        }
        setServiciosExtras([...serviciosExtras, { ...servicio }]);
        cerrarModal();
    };

    const quitarExtraGabinete = (id) => {
        setServiciosExtras(serviciosExtras.filter((s) => s.id !== id));
    };

    // --- LÓGICA ---
    useEffect(() => {
        setDatosCargados(true);
    }, []);

    useEffect(() => {
        if (datosCargados && plan) {
            const total = calcularTotalSuscripcionMascota(plan, mascotas, serviciosExtras, todosLosRecuerdos);
            setCuotaTotalDinamica(total);
        }
    }, [mascotas, serviciosExtras, plan]);

    const abrirModal = (tipo) => setModalConfig({ tipo, visible: true });
    const cerrarModal = () => setModalConfig({ tipo: null, visible: false });

    const enviarDatosAlGabineteBackend = () => {
        setCargandoGuardar(true);

        const payload = {
            suscripcion_id: suscripcion.id,
            cuota_mensual: cuotaTotalDinamica,
            servicios_adicionales: serviciosExtras.map((s) => ({
                id: s.id,
                precio: s.precio_pagado ?? s.precio,
            })),
            mascotas: mascotas.map((m) => ({
                id: m.id || null,
                nombre: m.nombre,
                especie_id: m.especie_id,
                raza_id: m.raza_id || null,
                fecha_nacimiento: m.fecha_nacimiento || null,
                cancion_id: m.cancion_id || null,
                // 🆕 recuerdo propio de esta mascota (antes se mandaba aparte como recuerdos_seleccionados)
                recuerdo_id: m.recuerdo_id || null,
            })),
        };

        console.log('Payload que se envía (mascota):', JSON.stringify(payload, null, 2));

        // 🆕 AJUSTA esta ruta si en tu web.php le pusiste otro nombre/URL
        router.post('/api/personalizacion/gabinete-mascota', payload, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setCargandoGuardar(false);
                abrirModal('NOTIFICACION_EXITO_MOUREN');
            },
            onError: (errors) => {
                setCargandoGuardar(false);
                console.error('Errores recibidos del servidor:', errors);
                alert('Error detallado: ' + JSON.stringify(errors));
            },
        });
    };

    const cantidadMascotas = mascotas.length;
    const cantidadServiciosTotales = serviciosBaseFijos.length + serviciosExtras.length;

    return (
        <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#221D17] font-['Hepta_Slab'] text-[#5D4E3F] dark:text-[#EDE4D3] flex flex-col md:flex-row relative overflow-x-hidden transition-colors duration-500">
            <Head title="Detalles Plan Mascota - Mouren" />
            <Sidebar />

            <div className="hidden lg:block absolute top-0 right-12 w-[45%] h-44 pointer-events-none z-0 opacity-100 dark:opacity-40 select-none">
                <img src="/images/elementos_dashboard/detalles_plan/flores_colgantes.png" alt="Flores" className="w-full h-full object-contain object-right-top" />
            </div>

            <main className="flex-1 w-full min-w-0 p-4 sm:p-6 md:p-10 content-shift transition-all duration-700 ease-in-out relative z-10 mt-2">
                <div className="max-w-7xl mx-auto">

                    <header className="mb-6 sm:mb-8 text-center md:text-left relative z-20">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#5C4F3C] dark:text-[#EDE4D3] tracking-tight leading-none">
                            Personaliza la protección de tus peluditos, <span className="text-[#8B7355] dark:text-[#FFD97D]">{auth?.user?.nombre || 'Gabinete Clienta'}</span>
                        </h1>
                        <p className="text-[10px] sm:text-[11px] text-[#8A7A65] dark:text-[#EDE4D3]/60 mt-2 tracking-wide">
                            "Para que ellos también descansen mejor que en vida"
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">

                        {/* ============ COLUMNA IZQUIERDA ============ */}
                        <div className="min-w-0 space-y-6 sm:space-y-8 order-2 lg:order-1">

                            {/* 🖼️ BANNER */}
                            <div className="flex flex-col md:flex-row items-center gap-0 relative z-20">
                                <div className="relative w-40 sm:w-48 md:w-60 shrink-0 z-10">
                                    <div className="absolute inset-0 blur-3xl bg-[#5C4F3C]/10 dark:bg-white/5 scale-95 rounded-[40px]" />
                                    <img
                                        src="/images/elementos_dashboard/inscripcion_planes/mouri_planes.webp"
                                        alt="Mouri con mascotas"
                                        className="relative w-full h-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)] hover:scale-[1.02] transition-transform duration-300"
                                    />
                                </div>

                                <div className="flex-1 relative md:ml-[-28px] bg-[#60533E] dark:bg-[#2E2720] text-white rounded-[22px] sm:rounded-[26px] p-5 sm:p-6 md:p-7 shadow-xl border border-[#7A6A56] dark:border-white/10 overflow-hidden transition-colors duration-500">
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
                                    <div className="hidden md:block absolute left-0 top-1/2 -translate-x-4 w-8 h-8 bg-[#60533E] dark:bg-[#2E2720] rotate-45 border-l border-t border-[#7A6A56] dark:border-white/10" />
                                    <div className="absolute -top-10 right-10 w-40 h-40 bg-[#C9A86A]/20 blur-3xl rounded-full" />

                                    <div className="relative space-y-3 sm:space-y-4">
                                        <div className="text-xl sm:text-2xl font-black leading-tight">
                                            🐾 Huella Eterna:
                                            <span className="block text-[#F5E6C8] mt-1">
                                                {plan.nombre || 'Plan Mascota'}
                                            </span>
                                        </div>

                                        <p className="text-[11px] sm:text-[12px] md:text-sm text-[#E9DDC8] italic leading-relaxed">
                                            "No dejes desprotegidos a tus consentidos de cuatro patas. Aquí gestionas su cobertura, sus recuerdos y su despedida con el amor que merecen."
                                        </p>

                                        <div className="flex flex-wrap gap-2 sm:gap-3 text-[11px] sm:text-[12px] pt-2 border-t border-white/20">
                                            <span className="font-black uppercase tracking-widest text-[#F5E6C8]">
                                                Cobertura:
                                            </span>
                                            <span>Protección vitalicia animal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 📊 RESUMEN */}
                            <ResumenCardsMascota
                                cuotaTotalDinamica={cuotaTotalDinamica}
                                cantidadMascotas={cantidadMascotas}
                                cantidadServiciosTotales={cantidadServiciosTotales}
                            />

                            {/* 🌿 SERVICIOS (ya filtrados en el backend por aplica_a = mascota/ambos) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ServiciosExtrasPanel
                                    serviciosExtras={serviciosExtras}
                                    abrirModal={abrirModal}
                                    abrirConfiguradorEstetico={() => {}}
                                    quitarExtraGabinete={quitarExtraGabinete}
                                />
                                <ServiciosBaseIncluidosPanel serviciosBaseFijos={serviciosBaseFijos} />
                            </div>
                        </div>

                        {/* ============ COLUMNA DERECHA ============ */}
                        <div className="min-w-0 space-y-5 order-1 lg:order-2 lg:sticky lg:top-8">

                            <MascotasPanel
                                mascotas={mascotas}
                                canciones={canciones}
                                todosLosRecuerdos={todosLosRecuerdos}
                                iniciarEdicionMascota={iniciarEdicionMascota}
                                ventanaConfirmarQuitar={ventanaConfirmarQuitar}
                                abrirModal={abrirModal}
                                setFormMascota={setFormMascota}
                            />

                            <div className="relative overflow-hidden bg-[#302A1D] dark:bg-[#2E2720] text-white rounded-[24px] p-5 sm:p-6 shadow-xl border border-white/10">
                                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#A68966] blur-3xl opacity-25 rounded-full pointer-events-none" />
                                <div className="relative z-10 space-y-3">
                                    <p className="text-[10px] uppercase tracking-widest font-black text-[#FFD97D]">Bóveda de Mouren</p>
                                    <p className="text-[11px] text-white/70 leading-relaxed">
                                        Guarda los cambios para dejar activa la protección de tus mascotas.
                                    </p>
                                    <button
                                        onClick={enviarDatosAlGabineteBackend}
                                        disabled={cargandoGuardar}
                                        className="w-full px-6 py-3.5 bg-[#A68966] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-md transition-all hover:bg-[#8e7253] disabled:opacity-50"
                                    >
                                        {cargandoGuardar ? 'Guardando en Bóveda...' : 'Guardar Personalización →'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODALES */}
                <ModalMascota
                    visible={modalConfig.visible && modalConfig.tipo === 'FORMULARIO_MASCOTA'}
                    formMascota={formMascota}
                    setFormMascota={setFormMascota}
                    especies={especies}
                    canciones={canciones}
                    todosLosRecuerdos={todosLosRecuerdos}
                    guardarMascotaGabinete={guardarMascotaGabinete}
                    cerrarModal={cerrarModal}
                />

                <ModalExitoMouren
                    visible={modalConfig.visible && modalConfig.tipo === 'NOTIFICACION_EXITO_MOUREN'}
                    cerrarModal={cerrarModal}
                />

                <ModalErrorMouren
                    visible={modalConfig.visible && modalConfig.tipo === 'NOTIFICACION_ERROR_MOUREN'}
                    cerrarModal={cerrarModal}
                />

                <ModalConfirmarEliminar
                    visible={modalConfig.visible && modalConfig.tipo === 'CONFIRM_ELIMINAR_MASCOTA'}
                    ejecutarEliminacionAfiliado={ejecutarEliminacionMascota}
                    cerrarModal={cerrarModal}
                />

                <ModalCatalogoServicios
                    visible={modalConfig.visible && modalConfig.tipo === 'CATALOGO_COMPLETO_SERVICIOS'}
                    todosLosServicios={todosLosServicios}
                    agregarExtraCatalogo={agregarExtraCatalogo}
                    cerrarModal={cerrarModal}
                />
            </main>
        </div>
    );
}

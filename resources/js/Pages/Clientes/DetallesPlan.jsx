import React, { useState, useEffect } from 'react';
import { calcularTotalSuscripcion } from "../../utils/calculadoraCostos";
import RecuerdoPanel from "./Components/RecuerdoPanel";
import ResumenCards from './components/ResumenCards';
import ServiciosExtrasPanel from './Components/ServiciosExtrasPanel';
import AfiliadosPanel from "./Components/AfiliadosPanel";
import ModalAfiliado from "./Components/ModalAfiliado";
import ModalPersonalizacionEstetica from "./Components/ModalPersonalizacionEstetica";
import ModalCatalogoServicios from "./Components/ModalCatalogoServicios";
import ModalConfirmarEliminar from "./Components/ModalConfirmarEliminar";
import ModalRecuerdos from "./Components/ModalRecuerdos";
import ModalExitoMouren from "./Components/ModalExitoMouren";
import ModalErrorMouren from "./Components/ModalErrorMouren";
import ModalAvisoServicioNoPersonalizable from "./Components/ModalAvisoServicioNoPersonalizable";
import ServiciosBaseIncluidosPanel from "./Components/ServiciosBaseIncluidosPanel";
import { Head, usePage, router } from '@inertiajs/react';
import Sidebar from './Sidebar';

export default function DetallesPlan({ suscripcion = null, canciones = [], precioBasePuroPlan = 0, todosLosServicios = [], todosLosRecuerdos = [], generos = [], tiposDocumento = [] }) {
    const { auth } = usePage().props;

    // --- VALIDACIÓN DE COBERTURA ACTIVA ---
    if (
        !suscripcion ||
        Object.keys(suscripcion).length === 0 ||
        suscripcion?.plan?.id === 4
    ) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] font-['Hepta_Slab'] text-[#5D4E3F] flex relative overflow-x-hidden">
                <Head title="Sin Cobertura Activa - Mouren" />
                <Sidebar />
                <main className="flex-1 ml-64 p-10 flex items-center justify-center">
                    <h2 className="text-2xl font-black text-[#5C4F3C]">Sin Cobertura Activa ☹</h2>
                </main>
            </div>
        );
    }

    // --- ESTADOS ---
    const [serviciosExtras, setServiciosExtras] = useState(suscripcion?.servicios_extras || []);
    const [afiliados, setAfiliados] = useState(suscripcion?.afiliados || []);
    const [recuerdosSeleccionados, setRecuerdosSeleccionados] = useState(suscripcion?.recuerdos?.length > 0 ? suscripcion.recuerdos[0] : null);
    const [cargandoGuardar, setCargandoGuardar] = useState(false);
    const [cuotaTotalDinamica, setCuotaTotalDinamica] = useState(suscripcion?.cuota_mensual || 0);
    const [datosCargados, setDatosCargados] = useState(false);
    const [modalConfig, setModalConfig] = useState({ tipo: null, visible: false });
    const [formAfiliado, setFormAfiliado] = useState({ id: null, nombre: '', parentesco: '', observacion_funeraria: '' });
    const [idAfiliadoAEliminar, setIdAfiliadoAEliminar] = useState(null);
    const [servicioAEditar, setServicioAEditar] = useState(null);
    const [personalizacionEstetica, setPersonalizacionEstetica] = useState({ colorId: '', colorNombre: '', florId: '', florNombre: '', observacion: '' });

    const plan = suscripcion.plan || {};
    const serviciosBaseFijos = plan.servicios || [];
    const VALOR_CUOTA_BASE_PLAN = plan.cuota_base ? Number(plan.cuota_base) : (suscripcion.cuota_mensual ? Number(suscripcion.cuota_mensual) : 0);
    const maxAfiliadosIncluidos = plan.max_afiliados ? Number(plan.max_afiliados) : 3;

    // =======================
    // CONFIGURACIONES
    // =======================

    const opcionesColores = [
        { id: 1, nombre: 'Blanco', hex: '#FFFFFF' },
        { id: 2, nombre: 'Dorado', hex: '#edcd64' },
        { id: 3, nombre: 'Cafe', hex: '#86764b' },
        { id: 4, nombre: 'Rosado', hex: '#ffb5da' },
        { id: 5, nombre: 'Azul', hex: '#b5d8ff' }
    ];

    const opcionesFlores = [
    { id: 1, nombre: 'Rosas',     imagen: 'rosas.png' },
    { id: 2, nombre: 'Lirios',    imagen: 'lirios.png' },
    { id: 3, nombre: 'Orquídeas', imagen: 'orquideas.png' },
    { id: 4, nombre: 'Claveles',  imagen: 'claveles.png' },
    { id: 5, nombre: 'Crisantemos ',  imagen: 'crisantemos.png' },
];

    // =======================
    // AFILIADOS
    // =======================

    const guardarAfiliadoGabinete = (e) => {
        e.preventDefault();

        console.log("Datos a guardar:", formAfiliado);

        if (formAfiliado.id) {
            setAfiliados(
                afiliados.map((a) =>
                    a.id === formAfiliado.id ? formAfiliado : a
                )
            );
        } else {
            setAfiliados([
                ...afiliados,
                {
                    ...formAfiliado,
                    id: Date.now()
                }
            ]);
        }
        setAfiliados(prev => prev.map(a =>
            a.id === formAfiliado.id
                ? { ...a, ...formAfiliado } // Aquí actualizamos con los valores del form
                : a
        ));

        cerrarModal();
    };

    const iniciarEdicionAfiliado = (afi) => {

        const funeraria = afi.servicio_funerario || {};

        setFormAfiliado({
            id: afi.id,
            nombre: afi.nombre,
            parentesco: afi.parentesco,
            observacion_funeraria:
                funeraria.observaciones || '',
            cancion_id:
                funeraria.cancion_id || '',
            genero_id: afi.genero_id || '',
            tipo_documento_id: afi.tipo_documento_id || '',
            cedula: afi.cedula || '',
            fecha_nacimiento: afi.fecha_nacimiento ? afi.fecha_nacimiento.split('T')[0] : ''
        });

        abrirModal('FORMULARIO_AFILIADO');
    };

    const ventanaConfirmarQuitar = (afi) => {
        setIdAfiliadoAEliminar(afi.id);
        abrirModal('CONFIRM_ELIMINAR_AFILIADO');
    };

    const ejecutarEliminacionAfiliado = () => {

        setAfiliados(
            afiliados.filter(
                (a) => a.id !== idAfiliadoAEliminar
            )
        );

        setIdAfiliadoAEliminar(null);

        cerrarModal();
    };

    // =======================
    // SERVICIOS EXTRAS
    // =======================

    const agregarExtraCatalogo = (servicio) => {

        const existe = serviciosExtras.some(
            (s) => s.id === servicio.id
        );

        if (existe) {
            alert('Este servicio ya fue agregado');
            return;
        }

        setServiciosExtras([
            ...serviciosExtras,
            {
                ...servicio,
                personalizacion: null
            }
        ]);

        cerrarModal();
    };

    const quitarExtraGabinete = (id) => {

        setServiciosExtras(
            serviciosExtras.filter(
                (s) => s.id !== id
            )
        );
    };

    // =======================
    // PERSONALIZACIÓN
    // =======================

    const abrirConfiguradorEstetico = (servicio) => {

        console.log("SERVICIO EDITAR", servicio);

        setServicioAEditar(servicio);

        setPersonalizacionEstetica(
            servicio.personalizacion?.configuracion || {
                colorId: '',
                colorNombre: '',
                florId: '',
                florNombre: '',
                observacion: ''
            }
        );
        console.log("ESTADO QUE VOY A CARGAR", servicio.personalizacion?.configuracion);

        abrirModal('PANEL_PERSONALIZACION_ESTETICA');
    };

    const aplicarConfiguracionEstetica = (e) => {
    e.preventDefault();
    if (!servicioAEditar) return;

    setServiciosExtras(
        serviciosExtras.map((s) =>
            s.id === servicioAEditar.id
                ? {
                    ...s,
                    personalizacion: {
                        configuracion: {
                            ...personalizacionEstetica
                        }
                    }
                }
                : s
        )
    );

    cerrarModal();
};

    useEffect(() => {
        if (suscripcion?.afiliados) {

            const afiliadosNormalizados =
                suscripcion.afiliados.map(afi => ({
                    ...afi,

                    observacion_funeraria:
                        afi.servicio_funerario?.observaciones || '',

                    cancion_id:
                        afi.servicio_funerario?.cancion_id || ''
                }));

            setAfiliados(afiliadosNormalizados);
        }
    }, [suscripcion]);

    console.log("=== SUSCRIPCION ===");
    console.log(suscripcion);

    console.log("=== AFILIADOS ===");
    console.log(suscripcion.afiliados[0])

    console.log("=== RECUERDOS ===");
    console.log(todosLosRecuerdos);

    // --- LÓGICA ---
    useEffect(() => {
        setDatosCargados(true);
    }, []);

    useEffect(() => {
        if (datosCargados && plan) {
            const total = calcularTotalSuscripcion(plan, afiliados, serviciosExtras, recuerdosSeleccionados);
            setCuotaTotalDinamica(total);
        }
    }, [afiliados, serviciosExtras, recuerdosSeleccionados, plan]);

    const abrirModal = (tipo) => setModalConfig({ tipo, visible: true });
    const cerrarModal = () => setModalConfig({ tipo: null, visible: false });

    const enviarDatosAlGabineteBackend = () => {
        setCargandoGuardar(true);
        const payload = {
            suscripcion_id: suscripcion.id,
            cuota_mensual: cuotaTotalDinamica,
            servicios_adicionales: serviciosExtras.map(s => ({
                id: s.id,
                precio: s.precio_pagado,
                personalizacion: s.personalizacion || null
            })),
                       afiliados: afiliados.map(a => ({
                // Verifica si el campo se llama realmente 'id'. 
                // Si no, cámbialo por el nombre correcto, ej: a.id_afiliado o a.usuario_id
                id: a.id || null,
                nombre: a.nombre,
                parentesco: a.parentesco,
                observaciones: a.observacion_funeraria || "Sin observaciones",
                cancion_id: a.cancion_id, // Este es el que agregamos antes
                genero_id: a.genero_id || null,
                tipo_documento_id: a.tipo_documento_id || null,
                cedula: a.cedula || null,
                fecha_nacimiento: a.fecha_nacimiento || null,
            })),
            recuerdos_seleccionados: recuerdosSeleccionados ? [recuerdosSeleccionados.id] : []
        };

        {/*console.log("AFILIADOS ENVIADOS");
        console.log(afiliados);
        console.log("SERVICIOS EXTRAS ENVIADOS");
        console.log(serviciosExtras)
        console.log("AFILIADOS FINALES");
        console.log(JSON.stringify(afiliados, null, 2));
        console.log("PERSONALIZACIONES");
        console.log(payload);
        console.log("VISTA SERVICIOS EXTRAS");
        console.log(
            JSON.stringify(serviciosExtras, null, 2)
        );
        
        console.log("SERVICIO PRUEBA");
        serviciosExtras.forEach(servicio => {
            console.log(
                servicio.nombre,
                servicio.personalizacion
            );
        });*/}

        console.log("Payload que se envía:", JSON.stringify(payload, null, 2));
        router.post('/api/personalizacion/gabinete', payload, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setCargandoGuardar(false);
                abrirModal("NOTIFICACION_EXITO_MOUREN");
            },
            onError: (errors) => {
                setCargandoGuardar(false);
                // AQUÍ ESTÁ EL TRUCO:
                console.error("Errores recibidos del servidor:", errors);
                alert("Error detallado: " + JSON.stringify(errors));
            }
        });
    };

    const cantidadAfiliados = afiliados.length;
    const cantidadAfiliadosExtras = cantidadAfiliados > maxAfiliadosIncluidos ? cantidadAfiliados - maxAfiliadosIncluidos : 0;
    const cantidadServiciosTotales = serviciosBaseFijos.length + serviciosExtras.length;

    console.log("¿Qué canciones tengo disponibles?", canciones);
    console.log("¿Qué ID de canción busca la tarjeta?", afiliados[0]?.cancion_id);
    console.log(afiliados)
    console.log("SERVICIOS EXTRAS")
    console.log(suscripcion.servicios_extras)

    return (
        <div className="min-h-screen bg-[#FFFFFFF] font-['Hepta_Slab'] text-[#5D4E3F] flex relative overflow-x-hidden">
            <Head title="Detalles del Plan - Mouren" />
            <Sidebar />

            <div className="absolute top-0 right-12 w-[75%] h-44 pointer-events-none z-0 opacity-100 select-none">
                <img src="/images/elementos_dashboard/detalles_plan/flores_colgantes.png" alt="Flores" className="w-full h-full object-contain object-right-top" />
            </div>

            <main className="flex-1 ml-64 p-6 md:p-10 relative z-10 mt-2 ">
                <div className="max-w-5xl mx-auto">

                    <header className="mb-8 text-center md:text-left relative z-20">
                        <h1 className="text-2xl md:text-3xl font-black text-[#5C4F3C] tracking-tight leading-none">
                            Personaliza tu plan, <span className="text-[#8B7355] ">{auth?.user?.nombre || 'Gabinete Clienta'}</span>
                        </h1>
                        <p className="text-[11px] text-[#8A7A65] mt-2 tracking-wide">
                            "Para que descanses mejor que en vida"
                        </p>
                    </header>

                    <div className="flex flex-col md:flex-row items-center gap-0 mb-10 relative z-20">

                        {/* 🖼️ OBRA (CUERVO / PINCEL / CUADRO) */}
                        <div className="relative w-56 md:w-60 shrink-0 z-10">

                            {/* aura artística */}
                            <div className="absolute inset-0 blur-3xl bg-[#5C4F3C]/10 scale-95 rounded-[40px]" />

                            <img
                                src="/images/elementos_dashboard/detalles_plan/mouri_detalles_plan.gif"
                                alt="Obra"
                                className="
                relative
                w-full
                h-full
                object-contain
                drop-shadow-[0_30px_50px_rgba(0,0,0,0.25)]
                hover:scale-[1.02]
                transition-transform duration-300
            "
                            />
                        </div>

                        {/* 📜 TARJETA (SE MANTIENE, PERO MÁS ARTÍSTICA) */}
                        <div className="
        flex-1
        relative
        ml-[-18px] md:ml-[-28px]
        bg-[#60533E]
        text-white
        rounded-[26px]
        p-6 md:p-7
        shadow-xl
        border border-[#7A6A56]
        overflow-hidden
    ">

                            {/* textura artística suave */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />

                            {/* conexión visual con la obra */}
                            <div className="absolute left-0 top-1/2 -translate-x-4 w-8 h-8 bg-[#60533E] rotate-45 border-l border-t border-[#7A6A56]" />

                            {/* glow elegante */}
                            <div className="absolute -top-10 right-10 w-40 h-40 bg-[#C9A86A]/20 blur-3xl rounded-full" />

                            {/* CONTENIDO */}
                            <div className="relative space-y-4">

                                {/* TITULO ARTÍSTICO */}
                                <div className="text-2xl md:text-2xl font-black leading-tight">
                                    Tu plan es una obra viva:
                                    <span className="block text-[#F5E6C8] mt-1">
                                        {plan.nombre || 'Personalizado'}
                                    </span>
                                </div>

                                {/* FRASE ARTÍSTICA */}
                                <p className="text-[12px] md:text-sm text-[#E9DDC8] italic leading-relaxed">
                                    “Un homenaje pensado para preservar recuerdos, acompañar historias
                                    y convertir cada detalle en una composición eterna.”
                                </p>

                                {/* REGLA (MEJOR INTEGRADA, NO BLOQUE) */}
                                <div className="flex flex-wrap gap-3 text-[12px] pt-2 border-t border-white/20">

                                    <span className="font-black uppercase tracking-widest text-[#F5E6C8]">
                                        Afiliación:
                                    </span>

                                    <span>
                                        {maxAfiliadosIncluidos} amparados incluidos
                                    </span>

                                    <span className="text-[#F5E6C8]">
                                        +${(VALOR_CUOTA_BASE_PLAN + 2000).toLocaleString('es-CO')} c/u
                                    </span>

                                </div>

                            </div>
                        </div>
                    </div>

                    {/* TARJETAS INFORMATIVAS */}
                    <ResumenCards
                        cuotaTotalDinamica={cuotaTotalDinamica}
                        cantidadAfiliados={cantidadAfiliados}
                        cantidadAfiliadosExtras={cantidadAfiliadosExtras}
                        cantidadServiciosTotales={cantidadServiciosTotales}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-20">
                        {/* PANEL DE RECUERDOS  */}
                        <RecuerdoPanel
                            recuerdosSeleccionados={recuerdosSeleccionados}
                            abrirModal={abrirModal}
                        />

                        <div className="lg:col-span-2 space-y-6">
                            <AfiliadosPanel
                                afiliados={afiliados}
                                canciones={canciones}
                                maxAfiliadosIncluidos={maxAfiliadosIncluidos}
                                cantidadAfiliadosExtras={cantidadAfiliadosExtras}
                                iniciarEdicionAfiliado={iniciarEdicionAfiliado}
                                ventanaConfirmarQuitar={ventanaConfirmarQuitar}
                                abrirModal={abrirModal}
                                setFormAfiliado={setFormAfiliado}
                            />

                            {/* Panel Servicios Extras */}
                            <ServiciosExtrasPanel
                                serviciosExtras={serviciosExtras}
                                abrirModal={abrirModal}
                                abrirConfiguradorEstetico={abrirConfiguradorEstetico}
                                quitarExtraGabinete={quitarExtraGabinete}
                            />


                            {/* Panel Servicios Base Incluidos */}
                            <ServiciosBaseIncluidosPanel serviciosBaseFijos={serviciosBaseFijos} />
                        </div>
                    </div>

                    <div className="mt-10 flex justify-center">
                        <button onClick={enviarDatosAlGabineteBackend} disabled={cargandoGuardar} className="px-12 py-3.5 bg-[#60533E] text-white rounded-full font-black uppercase text-xs tracking-widest shadow-md transition-all hover:bg-[#473D2D]">
                            {cargandoGuardar ? 'Guardando en Bóveda...' : 'Guardar Personalización'}
                        </button>
                    </div>
                </div>

                {/* --- PARTE AFILIADOS --- */}
                <ModalAfiliado
                    visible={
                        modalConfig.visible &&
                        modalConfig.tipo === "FORMULARIO_AFILIADO"
                    }
                    formAfiliado={formAfiliado}
                    setFormAfiliado={setFormAfiliado}
                    canciones={canciones}
                    generos={generos}
                    tiposDocumento={tiposDocumento}
                    afiliados={afiliados}
                    guardarAfiliadoGabinete={guardarAfiliadoGabinete}
                    cerrarModal={cerrarModal}
                />

                {/* Selector de Recuerdos */}
                <ModalRecuerdos
                    visible={
                        modalConfig.visible &&
                        modalConfig.tipo === "SELECHAIN_RECUERDO_BD"
                    }
                    todosLosRecuerdos={todosLosRecuerdos}
                    setRecuerdosSeleccionados={setRecuerdosSeleccionados}
                    cerrarModal={cerrarModal}
                />

                {/* Panel Personalización Visual */}
                <ModalPersonalizacionEstetica
                    visible={
                        modalConfig.visible &&
                        modalConfig.tipo === "PANEL_PERSONALIZACION_ESTETICA"
                    }
                    servicioAEditar={servicioAEditar}
                    personalizacionEstetica={personalizacionEstetica}
                    setPersonalizacionEstetica={setPersonalizacionEstetica}
                    opcionesColores={opcionesColores}
                    opcionesFlores={opcionesFlores}
                    aplicarConfiguracionEstetica={aplicarConfiguracionEstetica}
                    cerrarModal={cerrarModal}
                />

                {/* Éxito */}
                <ModalExitoMouren
                    visible={
                        modalConfig.visible &&
                        modalConfig.tipo === "NOTIFICACION_EXITO_MOUREN"
                    }
                    cerrarModal={cerrarModal}
                />

                {/* Error */}
                <ModalErrorMouren
                    visible={
                        modalConfig.visible &&
                        modalConfig.tipo === "NOTIFICACION_ERROR_MOUREN"
                    }
                    cerrarModal={cerrarModal}
                />

                {/* Cobertura Fija No Modificable */}
                <ModalAvisoServicioNoPersonalizable
                    visible={
                        modalConfig.visible &&
                        modalConfig.tipo === "AVISO_SERVICIO_NO_PERSONALIZABLE"
                    }
                    cerrarModal={cerrarModal}
                />

                {/* Confirmar Eliminación */}
                <ModalConfirmarEliminar
                    visible={
                        modalConfig.visible &&
                        modalConfig.tipo === "CONFIRM_ELIMINAR_AFILIADO"
                    }
                    ejecutarEliminacionAfiliado={ejecutarEliminacionAfiliado}
                    cerrarModal={cerrarModal}
                />

                {/* Catálogo Completo */}
                <ModalCatalogoServicios
                    visible={
                        modalConfig.visible &&
                        modalConfig.tipo === "CATALOGO_COMPLETO_SERVICIOS"
                    }
                    todosLosServicios={todosLosServicios}
                    agregarExtraCatalogo={agregarExtraCatalogo}
                    cerrarModal={cerrarModal}
                />
            </main>
        </div>
    );
}
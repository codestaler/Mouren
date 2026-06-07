import React, { useState, useEffect } from 'react';
import { calcularTotalSuscripcion } from "../../utils/calculadoraCostos";
import { Head, usePage, router } from '@inertiajs/react';
import Sidebar from './Sidebar';

export default function DetallesPlan({ suscripcion = null, canciones = [], precioBasePuroPlan = 0, todosLosServicios = [], todosLosRecuerdos = [] }) {
    const { auth } = usePage().props;

    // --- VALIDACIÓN DE COBERTURA ACTIVA ---
    if (!suscripcion || Object.keys(suscripcion).length === 0) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] font-['Hepta_Slab'] text-[#5D4E3F] flex relative overflow-x-hidden">
                <Head title="Sin Cobertura Activa - Mouren" />
                <Sidebar />
                <main className="flex-1 ml-64 p-10 flex items-center justify-center">
                    <h2 className="text-2xl font-black text-[#5C4F3C]">Sin Cobertura Activa</h2>
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
        { id: 2, nombre: 'Dorado', hex: '#D4AF37' },
        { id: 3, nombre: 'Azul', hex: '#2563EB' },
        { id: 4, nombre: 'Rosado', hex: '#EC4899' }
    ];

    const opcionesFlores = [
        { id: 1, nombre: 'Rosas' },
        { id: 2, nombre: 'Lirios' },
        { id: 3, nombre: 'Orquídeas' },
        { id: 4, nombre: 'Claveles' }
    ];

    // =======================
    // AFILIADOS
    // =======================

    const guardarAfiliadoGabinete = (e) => {
        e.preventDefault();

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

        cerrarModal();
    };

    const iniciarEdicionAfiliado = (afi) => {
        setFormAfiliado({
            id: afi.id,
            nombre: afi.nombre,
            parentesco: afi.parentesco,
            observacion_funeraria: afi.observacion_funeraria || '',
            cancion_id: afi.cancion_id || ''
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

        setServicioAEditar(servicio);

        setPersonalizacionEstetica(
            servicio.personalizacion || {
                colorId: '',
                colorNombre: '',
                florId: '',
                florNombre: '',
                observacion: ''
            }
        );

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
                            ...personalizacionEstetica
                        }
                    }
                    : s
            )
        );

        cerrarModal();
    };



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
            servicios_adicionales: serviciosExtras.map(s => ({ id: s.id, precio: s.precio_pagado })),
            afiliados: afiliados.map(a => ({
                // Verifica si el campo se llama realmente 'id'. 
                // Si no, cámbialo por el nombre correcto, ej: a.id_afiliado o a.usuario_id
                id: a.id || null,
                nombre: a.nombre,
                parentesco: a.parentesco,
                observaciones: a.observacion_funeraria || "Sin observaciones",
                cancion_id: a.cancion_id // Este es el que agregamos antes
            })),
            recuerdos_seleccionados: recuerdosSeleccionados ? [recuerdosSeleccionados.id] : []
        };

        console.log("Payload que se envía:", JSON.stringify(payload, null, 2));
        router.post('/api/personalizacion/gabinete', payload, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setCargandoGuardar(false);
                alert("¡Guardado con éxito!");
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


    return (
        <div className="min-h-screen bg-[#FDFBF7] font-['Hepta_Slab'] text-[#5D4E3F] flex relative overflow-x-hidden">
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

                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8 relative z-20">
                        <div className="w-44 h-44 bg-[#F2ECD9] rounded-[35px] p-4 flex items-center justify-center border border-[#D9CEB6] shadow-sm relative bg-white">
                            <img src="/images/elementos_dashboard/detalles_plan/mouri_saludando.png" alt="Mouri" className="w-full h-full object-contain" onError={(e) => { e.target.src = '/images/elementos_dashboard/detalles_plan/flores_colgantes.png'; }} />
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div className="bg-[#60533E] text-white text-center py-4 px-6 rounded-[24px] text-xl font-black tracking-wide shadow-sm ">
                                Tu plan es: <span className="text-[#FFFFFF]"> {plan.nombre || 'Personalizado'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white px-6 py-3.5 rounded-[22px] border border-[#EBE5D5] shadow-xs">
                                <span className="text-sm font-black uppercase tracking-wider text-[#60533E]">Regla de Afiliación:</span>
                                <span className="bg-[#473D2D] text-white px-4 py-1.5 rounded-full font-black text-[11px] tracking-wide text-center">
                                    {maxAfiliadosIncluidos} Amparados Gratis. Extra suma: +${(VALOR_CUOTA_BASE_PLAN + 2000).toLocaleString('es-CO')} c/u
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TARJETAS INFORMATIVAS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 relative z-20">
                        <div className="bg-[#473D2D] text-white p-6 rounded-[25px] min-h-[115px] flex flex-col justify-between relative overflow-hidden shadow-xl ring-4 ring-[#FFC107]/40">
                            <span className="text-xs uppercase tracking-widest font-black text-[#FFC107]">Cuota Total Dinámica</span>
                            <span className="text-2xl font-black text-right block tracking-tight text-[#FFF] drop-shadow-md mt-2">
                                {cuotaTotalDinamica > 0 ? cuotaTotalDinamica.toLocaleString('es-CO') : "0"} <span className="text-[10px] font-bold text-gray-300">COP</span>
                            </span>
                        </div>

                        <div className="bg-[#60533E] text-white p-6 rounded-[25px] min-h-[105px] flex flex-col justify-between relative overflow-hidden shadow-md">
                            <span className="text-xs uppercase tracking-widest font-black opacity-90">Miembros Registrados</span>
                            <span className="text-2xl font-black text-right block mt-2">
                                {cantidadAfiliados} {cantidadAfiliadosExtras > 0 && <span className="text-xs text-amber-400 font-bold block">(+{cantidadAfiliadosExtras} Extras × Cuota Base)</span>}
                            </span>
                        </div>

                        <div className="bg-[#60533E] text-white p-6 rounded-[25px] min-h-[105px] flex flex-col justify-between relative overflow-hidden shadow-md">
                            <span className="text-xs uppercase tracking-widest font-black opacity-90">Servicios en Cobertura</span>
                            <span className="text-2xl font-black text-right block mt-2">{cantidadServiciosTotales}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-20">
                        {/* Panel de Objeto de Recuerdo */}
                        <div className="bg-white p-5 rounded-[30px] border border-[#E3DCcc] shadow-xs text-center">
                            <h3 className="font-black text-xs uppercase tracking-wider text-[#60533E] border-b pb-2 mb-4">Objeto de Recuerdo</h3>
                            {recuerdosSeleccionados ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-[#F7F4EB] p-2 rounded-2xl border border-[#E3DCcc] flex items-center justify-center mb-2">
                                        <img src={`/images/elementos_dashboard/detalles_plan/flores_colgantes.png`} alt={recuerdosSeleccionados.nombre} className="w-full h-full object-contain" />
                                    </div>
                                    <p className="text-xs font-black text-[#60533E] uppercase tracking-tighter">"{recuerdosSeleccionados.nombre}"</p>
                                    <p className="text-[10px] text-amber-800 font-bold mt-1">+ ${Number(recuerdosSeleccionados.precio_adicional || recuerdosSeleccionados.pivot?.costo_unitario || 0).toLocaleString('es-CO')} COP</p>
                                    <button onClick={() => abrirModal('SELECHAIN_RECUERDO_BD')} className="mt-4 px-4 py-2 bg-[#F2ECD9] text-[#60533E] rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#60533E] hover:text-white transition-all shadow-3xs">Cambiar Recuerdo</button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <p className="text-xs italic text-gray-400 mb-3">No tienes ningún recuerdo asignado.</p>
                                    <button onClick={() => abrirModal('SELECHAIN_RECUERDO_BD')} className="px-4 py-1.5 bg-[#60533E] text-white text-[9px] rounded-xl font-bold uppercase tracking-wide">Abrir Catálogo</button>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            {/* Panel Miembros Protegidos */}
                            <div className="bg-white p-6 rounded-[30px] border border-[#E3DCcc] shadow-xs">
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <div>
                                        <h3 className="font-black text-xs uppercase tracking-wider text-[#60533E]">Miembros Protegidos bajo Cobertura</h3>
                                        <p className="text-[9px] font-bold text-amber-800 italic mt-0.5">Extras actuales: {cantidadAfiliadosExtras} de 3 permitidos.</p>
                                    </div>
                                    {cantidadAfiliadosExtras < 3 && (
                                        <button onClick={() => { setFormAfiliado({ id: null, nombre: '', parentesco: '', observacion_funeraria: '' }); abrirModal('FORMULARIO_AFILIADO'); }} className="bg-[#60533E] text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider">+ Inscribir Miembro</button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {afiliados.length === 0 ? (
                                        <p className="text-xs italic text-gray-400 col-span-2 py-3 text-center">No posees familiares o protegidos cargados.</p>
                                    ) : (
                                        afiliados.map((afi, idx) => {
                                            const esExtra = idx >= maxAfiliadosIncluidos;
                                            /*console.log("Estructura de canciones:", canciones);*/
                                            return (
                                                <div key={afi.id} className={`p-3.5 rounded-[20px] border flex flex-col justify-between gap-2 shadow-xs transition-all ${esExtra ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/10' : 'bg-[#FDFBF7] border-[#EAE4D5]'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full border border-[#D9CEB6] overflow-hidden bg-white flex items-center justify-center p-1 shadow-3xs">
                                                            <img src="/images/elementos_dashboard/detalles_plan/flores_colgantes.png" alt="Icono" className="w-full h-full object-contain" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <h4 className="text-xs font-black text-[#60533E] uppercase tracking-tight truncate max-w-[120px]">{afi.nombre}</h4>
                                                                {esExtra && <span className="bg-amber-700 text-white text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">+ Extra</span>}
                                                            </div>
                                                            <p className="text-[10px] text-[#8A7A65] font-bold italic">Vínculo: {afi.parentesco}</p>
                                                        </div>
                                                    </div>
                                                    {afi.observacion_funeraria && (
                                                        <div className="mt-1 p-2 bg-[#F2ECD9]/50 rounded-xl text-[9px] font-medium text-[#60533E] border border-[#E3DCcc] leading-normal">
                                                            <strong>Obs. Funeraria:</strong> "{afi.observacion_funeraria}"
                                                        </div>
                                                    )}
                                                    <div className="flex justify-end gap-3 text-[10px] font-black uppercase border-t pt-2 mt-1 border-gray-100">
                                                        <button onClick={() => iniciarEdicionAfiliado(afi)} className="text-[#8B7355] hover:underline">Editar Obs</button>
                                                        {afi.parentesco.toLowerCase().trim() !== 'titular' ? (
                                                            <button onClick={() => ventanaConfirmarQuitar(afi)} className="text-rose-600 hover:underline">Quitar</button>
                                                        ) : (
                                                            <span className="text-gray-400 italic font-normal text-[9px]">Titular Inamovible</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Panel Servicios Extras */}
                            <div className="bg-white p-6 rounded-[30px] border border-[#E3DCcc] shadow-xs">
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <h3 className="font-black text-xs uppercase tracking-wider text-[#60533E]">Decoración Adicional y Servicios Extras</h3>
                                    <button onClick={() => abrirModal('CATALOGO_COMPLETO_SERVICIOS')} className="bg-[#8B7355] text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider">+ Añadir del Catálogo</button>
                                </div>

                                <div className="space-y-2.5">
                                    {serviciosExtras.length === 0 ? (
                                        <p className="text-xs italic text-gray-400 py-2 text-center">No has adicionado decoración complementaria.</p>
                                    ) : (
                                        serviciosExtras.map((item) => (
                                            <div key={item.id} className="p-3.5 bg-[#FDFBF7] rounded-[18px] border border-[#EAE4D5] flex flex-col md:flex-row justify-between md:items-center gap-2">
                                                <div>
                                                    <span className="font-black text-xs text-[#60533E] uppercase block">✦ {item.nombre}</span>
                                                    <span className="text-[10px] text-amber-800 font-bold block">+ ${Number(item.precio || item.pivot?.precio_pagado || 0).toLocaleString('es-CO')} COP</span>
                                                    {item.personalizacion && (
                                                        <div className="mt-2 p-2 bg-[#F2ECD9] rounded-xl text-[9px] text-[#60533E] font-medium space-y-0.5">
                                                            <p><strong>Cromática:</strong> {item.personalizacion.colorNombre}</p>
                                                            <p><strong>Arreglo:</strong> {item.personalizacion.florNombre}</p>
                                                            {item.personalizacion.observacion && <p className="italic text-gray-500">"Obs: {item.personalizacion.observacion}"</p>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 self-end md:self-center">
                                                    <button onClick={() => abrirConfiguradorEstetico(item)} className="px-3 py-1 bg-[#F2ECD9] text-[#60533E] font-black text-[9px] uppercase rounded-lg">Configurar</button>
                                                    <button onClick={() => quitarExtraGabinete(item.id)} className="text-rose-600 font-bold px-2 text-xs">✕</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Panel Servicios Base Incluidos */}
                            <div className="bg-white p-6 rounded-[30px] border border-[#E3DCcc] shadow-xs">
                                <h3 className="font-black text-xs uppercase tracking-wider text-[#60533E] border-b pb-2 mb-3">Servicios Base Incluidos (Amparados por Plan Base)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {serviciosBaseFijos.length === 0 ? (
                                        <p className="text-xs italic text-gray-400 col-span-2 py-2">No se encontraron coberturas fijas.</p>
                                    ) : (
                                        serviciosBaseFijos.map((sb) => (
                                            <div key={sb.id} className="p-3 bg-[#F2ECD9]/30 rounded-xl border border-[#EAE4D5] flex gap-2 items-start">
                                                <span className="text-amber-700 font-bold text-xs">✔</span>
                                                <div>
                                                    <h4 className="text-[11px] font-black text-[#60533E] uppercase">{sb.nombre}</h4>
                                                    <p className="text-[10px] text-gray-500 italic mt-0.5">{sb.descripcion || 'Servicio amparado por el plan.'}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-center">
                        <button onClick={enviarDatosAlGabineteBackend} disabled={cargandoGuardar} className="px-12 py-3.5 bg-[#60533E] text-white rounded-full font-black uppercase text-xs tracking-widest shadow-md transition-all hover:bg-[#473D2D]">
                            {cargandoGuardar ? 'Guardando en Bóveda...' : 'Guardar Personalización'}
                        </button>
                    </div>
                </div>

                {/* --- MODALES EMERGENTES --- */}
                {modalConfig.visible && modalConfig.tipo === 'FORMULARIO_AFILIADO' && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <form onSubmit={guardarAfiliadoGabinete} className="bg-[#FDFBF7] p-6 rounded-[28px] max-w-sm w-full border-2 border-[#60533E] shadow-2xl">
                            <h3 className="font-black text-xs uppercase text-[#60533E] border-b pb-2 mb-4">{formAfiliado.id ? 'Modificar' : 'Inscribir'} Protegido</h3>
                            <div className="space-y-3.5 text-xs mb-5">
                                <div className="flex flex-col gap-1">
                                    <label className="font-black uppercase text-gray-500 text-[10px]">Nombre Completo:</label>
                                    <input type="text" value={formAfiliado.nombre} onChange={(e) => setFormAfiliado({ ...formAfiliado, nombre: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-[#60533E] font-bold" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="font-black uppercase text-gray-500 text-[10px]">Parentesco / Vínculo:</label>
                                    <input type="text" value={formAfiliado.parentesco} onChange={(e) => setFormAfiliado({ ...formAfiliado, parentesco: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-[#60533E] font-bold" placeholder="Ej: Hijo, Mascota, Hermano..." required />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="font-black uppercase text-amber-800 text-[10px]">Observaciones:</label>
                                    <textarea value={formAfiliado.observacion_funeraria} onChange={(e) => setFormAfiliado({ ...formAfiliado, observacion_funeraria: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl h-16 resize-none" placeholder="Ej: Especificaciones del memorial o capillas..." />
                                </div>

                            </div>
                            <div className="flex flex-col gap-1 mb-5">
                                <label className="font-black uppercase text-gray-500 text-[10px]">Seleccionar Canción:</label>
                                <select
                                    value={formAfiliado.cancion_id || ''}
                                    onChange={(e) => setFormAfiliado({ ...formAfiliado, cancion_id: e.target.value })}
                                    className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-[#60533E] font-bold w-full"
                                    required
                                >
                                    <option value="">Seleccione una canción...</option>
                                    {canciones && canciones.map((cancion) => (
                                        <option key={cancion.id} value={cancion.id}>
                                            {cancion.titulo} - {cancion.artista}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 text-[10px] font-black uppercase tracking-wider">
                                <button type="submit" className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl">Confirmar</button>
                                <button type="button" onClick={cerrarModal} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl">Cancelar</button>
                            </div>
                            {/*PARTE FORMULARIO CANCION AFILIADO*/}

                        </form>
                    </div>

                )}

                {/* Selector de Recuerdos */}
                {modalConfig.visible && modalConfig.tipo === 'SELECHAIN_RECUERDO_BD' && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <div className="bg-[#FDFBF7] p-6 rounded-[28px] max-w-xs w-full border-2 border-[#60533E] shadow-2xl">
                            <h4 className="font-black text-xs uppercase text-[#60533E] border-b pb-2 mb-3">Inventario de Recuerdos</h4>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto text-[11px]">
                                {todosLosRecuerdos.length === 0 ? (
                                    <p className="text-center italic text-gray-400 py-3">No hay recuerdos registrados.</p>
                                ) : (
                                    todosLosRecuerdos.map((rec) => (
                                        <div key={rec.id} onClick={() => { setRecuerdosSeleccionados(rec); cerrarModal(); }} className="p-2.5 bg-[#F7F4EB] hover:bg-[#60533E] hover:text-white rounded-xl cursor-pointer font-black uppercase flex justify-between items-center border border-[#E3DCcc]">
                                            <span>{rec.nombre}</span>
                                            <span className="text-[9px] bg-white text-[#60533E] px-1.5 py-0.5 rounded font-black">${Number(rec.precio_adicional || 0).toLocaleString('es-CO')}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button onClick={cerrarModal} className="w-full mt-4 py-2 bg-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-600">Cerrar</button>
                        </div>
                    </div>
                )}

                {/* Panel Personalización Visual */}
                {modalConfig.visible && modalConfig.tipo === 'PANEL_PERSONALIZACION_ESTETICA' && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <form onSubmit={aplicarConfiguracionEstetica} className="bg-[#FDFBF7] p-6 rounded-[30px] max-w-md w-full border-2 border-[#60533E] shadow-2xl">
                            <h3 className="font-black text-xs uppercase text-[#60533E] border-b pb-2 mb-4">Configuración Visual: {servicioAEditar?.nombre}</h3>
                            <div className="space-y-4 text-xs mb-5">
                                <div>
                                    <label className="font-black text-gray-600 uppercase text-[10px] block mb-2">1. Gama Cromática:</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {opcionesColores.map((col) => (
                                            <div key={col.id} onClick={() => setPersonalizacionEstetica({ ...personalizacionEstetica, colorId: col.id, colorNombre: col.nombre })} className={`p-2.5 rounded-xl cursor-pointer flex items-center gap-2 border transition-all ${personalizacionEstetica.colorId === col.id ? 'border-[#60533E] bg-[#F2ECD9]' : 'border-gray-200 bg-white'}`}>
                                                <div className="w-4 h-4 rounded-full border border-gray-400" style={{ backgroundColor: col.hex }}></div>
                                                <span className="font-bold text-[10px] uppercase text-[#60533E]">{col.nombre}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="font-black text-gray-600 uppercase text-[10px] block mb-2">2. Arreglo de Flores:</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {opcionesFlores.map((fl) => (
                                            <div key={fl.id} onClick={() => setPersonalizacionEstetica({ ...personalizacionEstetica, florId: fl.id, florNombre: fl.nombre })} className={`p-2 rounded-xl cursor-pointer text-center border transition-all flex flex-col items-center justify-between ${personalizacionEstetica.florId === fl.id ? 'border-[#60533E] bg-[#F2ECD9]' : 'border-gray-200 bg-white'}`}>
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mb-1 flex items-center justify-center">
                                                    <img src="/images/elementos_dashboard/detalles_plan/flores_colgantes.png" alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <span className="font-bold text-[9px] uppercase leading-tight text-[#60533E]">{fl.nombre}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="font-black text-gray-600 uppercase text-[10px]">3. Observaciones de Decoración:</label>
                                    <textarea value={personalizacionEstetica.observacion} onChange={(e) => setPersonalizacionEstetica({ ...personalizacionEstetica, observacion: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl outline-none font-medium text-[#60533E] resize-none h-16" placeholder="Ej: Añadir cintas personalizadas..." />
                                </div>
                            </div>
                            <div className="flex gap-2 text-[10px] font-black uppercase tracking-wider">
                                <button type="submit" className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl">Aplicar</button>
                                <button type="button" onClick={cerrarModal} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl">Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Éxito */}
                {modalConfig.visible && modalConfig.tipo === 'NOTIFICACION_EXITO_MOUREN' && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <div className="bg-[#FDFBF7] p-8 rounded-[30px] max-w-xs w-full border-2 border-[#FFC107] text-center shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-2 bg-[#FFC107]"></div>
                            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-3xs">
                                <span className="text-[#60533E] font-black text-xl">✔</span>
                            </div>
                            <h4 className="font-black text-sm text-[#60533E] uppercase mb-1 tracking-wide">Bóveda Actualizada</h4>
                            <p className="text-[11px] text-gray-600 italic mb-6 leading-relaxed">¡Configuraciones guardadas con éxito!</p>
                            <button onClick={cerrarModal} className="w-full py-2.5 bg-[#60533E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Entendido</button>
                        </div>
                    </div>
                )}

                {/* Error */}
                {modalConfig.visible && modalConfig.tipo === 'NOTIFICACION_ERROR_MOUREN' && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <div className="bg-[#FDFBF7] p-6 rounded-[25px] max-w-xs w-full border-2 border-rose-600 text-center shadow-2xl">
                            <h4 className="font-black text-xs uppercase text-rose-800 mb-1">Error de Guardado</h4>
                            <p className="text-[11px] text-gray-600 italic mb-4">Hubo un contratiempo al procesar la personalización.</p>
                            <button onClick={cerrarModal} className="w-full py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase">Cerrar</button>
                        </div>
                    </div>
                )}

                {/* Cobertura Fija No Modificable */}
                {modalConfig.visible && modalConfig.tipo === 'AVISO_SERVICIO_NO_PERSONALIZABLE' && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <div className="bg-[#FDFBF7] p-6 rounded-[25px] max-w-xs w-full border-2 border-amber-600 text-center shadow-2xl">
                            <h4 className="font-black text-xs uppercase text-amber-800 mb-1">Aviso del Sistema</h4>
                            <p className="text-[11px] text-gray-600 italic mb-4">Este servicio es de cobertura fija y no admite alteraciones visuales o personalizaciones estéticas.</p>
                            <button onClick={cerrarModal} className="w-full py-2 bg-gray-700 text-white rounded-xl text-[10px] font-black uppercase">Cerrar</button>
                        </div>
                    </div>
                )}

                {/* Confirmar Eliminación */}
                {modalConfig.visible && modalConfig.tipo === 'CONFIRM_ELIMINAR_AFILIADO' && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <div className="bg-[#FDFBF7] p-6 rounded-[25px] max-w-xs w-full border-2 border-rose-600/40 text-center shadow-2xl">
                            <h4 className="font-black text-sm text-rose-700 uppercase mb-2">¿Retirar del Plan?</h4>
                            <p className="text-xs text-gray-600 italic mb-5">¿Deseas remover a este miembro o protegido del plan amparado?</p>
                            <div className="flex gap-2 text-[10px] font-black uppercase">
                                <button onClick={ejecutarEliminacionAfiliado} className="flex-1 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700">Sí, Remover</button>
                                <button onClick={cerrarModal} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl">Mantener</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Catálogo Completo */}
                {modalConfig.visible && modalConfig.tipo === 'CATALOGO_COMPLETO_SERVICIOS' && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <div className="bg-[#FDFBF7] p-6 rounded-[25px] max-w-sm w-full border-2 border-[#60533E] shadow-2xl">
                            <h3 className="font-black text-xs uppercase text-[#60533E] border-b pb-2 mb-3">Catálogo de Servicios Extra</h3>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4 text-[11px]">
                                {todosLosServicios.map((serv) => (
                                    <div key={serv.id} onClick={() => agregarExtraCatalogo(serv)} className="p-2 bg-[#F7F4EB] hover:bg-[#60533E] hover:text-white rounded-xl cursor-pointer flex justify-between items-center border border-[#E3DCcc]">
                                        <span className="font-black uppercase">{serv.nombre}</span>
                                        <span className="bg-white text-[#60533E] font-black px-2 py-0.5 rounded-lg text-[10px]">${Number(serv.precio).toLocaleString('es-CO')}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={cerrarModal} className="w-full py-2 bg-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-600">Cerrar</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import Sidebar from './Sidebar';
import axios from 'axios';

export default function Cartera({ facturas = [] }) {
    const { auth } = usePage().props;
    const usuario = auth?.user || {};
    const [procesando, setProcesando] = useState(false);
    
    // Estado para almacenar las IDs de las facturas seleccionadas para pago múltiple
    const [seleccionadas, setSeleccionadas] = useState([]);
    
    // Estados para controlar los modales personalizados de diseño
    const [modalConfig, setModalConfig] = useState({ visible: false, mensaje: '', tipo: 'info' });
    const [confirmConfig, setConfirmConfig] = useState({ visible: false, modoMasivo: false, facturaId: null });

    const nombreParaMostrar = usuario.name || "Usuario";

    // Filtrar únicamente las facturas pendientes
    const facturasPendientes = facturas.filter(f => f.estado_factura_id === 1);
    
    // Total histórico de deuda pendiente
    const totalDeudaPendiente = facturasPendientes.reduce((sum, f) => sum + Number(f.total), 0);

    // TOTAL CORREGIDO (Sin espacios en el nombre de la variable)
    const totalSeleccionado = facturasPendientes
        .filter(f => seleccionadas.includes(f.id))
        .reduce((sum, f) => sum + Number(f.total), 0);

    // Función auxiliar para calcular días restantes y retornar la alerta estética
    const obtenerAlertaVencimiento = (fechaVencimiento) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const vencimiento = new Date(fechaVencimiento);
        vencimiento.setHours(0, 0, 0, 0);
        
        const diferenciaTiempo = vencimiento - hoy;
        const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) {
            return (
                <span className="inline-block px-2 py-0.5 bg-red-200 text-red-900 font-black rounded-md text-[9px] uppercase tracking-wider animate-pulse">
                    Vencida ({Math.abs(diasRestantes)}d)
                </span>
            );
        } else if (diasRestantes === 0) {
            return (
                <span className="inline-block px-2 py-0.5 bg-red-500 text-white font-black rounded-md text-[9px] uppercase tracking-wider animate-pulse">
                    ¡Vence Hoy! ⚠️
                </span>
            );
        } else if (diasRestantes === 1) {
            return (
                <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 font-black rounded-md text-[9px] uppercase tracking-wider">
                    Vence Mañana
                </span>
            );
        } else if (diasRestantes <= 3) {
            return (
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 font-black rounded-md text-[9px] uppercase tracking-wider">
                    Faltan {diasRestantes} días
                </span>
            );
        }
        return null;
    };

    // Control de selección individual
    const handleSeleccionarFactura = (id) => {
        if (seleccionadas.includes(id)) {
            setSeleccionadas(seleccionadas.filter(item => item !== id));
        } else {
            setSeleccionadas([...seleccionadas, id]);
        }
    };

    // Seleccionar o deseleccionar todas las facturas pendientes de un solo golpe
    const handleSeleccionarTodas = () => {
        if (seleccionadas.length === facturasPendientes.length) {
            setSeleccionadas([]);
        } else {
            setSeleccionadas(facturasPendientes.map(f => f.id));
        }
    };

    const mostrarAlerta = (mensaje, tipo = 'info') => {
        setModalConfig({ visible: true, mensaje, tipo });
    };

    const descargarPDF = async (facturaId) => {
        try {
            const response = await axios.get(`/cliente/factura/${facturaId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `factura-mouren-${facturaId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Error descargando el PDF:", error);
            mostrarAlerta("No se pudo descargar el comprobante en este momento.", 'error');
        }
    };

    const descargarEstadoCuenta = async () => {
        try {
            const response = await axios.get(`/cliente/estado-cuenta/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `estado-cuenta-mouren.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Error al descargar el estado de cuenta:", error);
            mostrarAlerta("No se pudo procesar la descarga de tu estado de cuenta general.", 'error');
        }
    };

    // Solicitar confirmación para pago único o masivo
    const abrirModalConfirmacion = (modoMasivo, facturaId = null) => {
        setConfirmConfig({ visible: true, modoMasivo, facturaId });
    };

    const procesarPagoConfirmado = () => {
        const { modoMasivo, facturaId } = confirmConfig;
        
        // Si es masivo, toma las seleccionadas; si es individual, crea un arreglo con ese único ID
        const idsAProcesar = modoMasivo ? seleccionadas : [facturaId];

        setConfirmConfig({ visible: false, modoMasivo: false, facturaId: null });
        setProcesando(true);
        
        // Hacemos la petición POST hacia la ruta exacta de tu backend de Mouren
        router.post(`/cliente/pagos/procesar-lote`, { ids: idsAProcesar }, {
            preserveScroll: true,
            onSuccess: () => {
                setProcesando(false);
                setSeleccionadas([]);
            },
            onError: (errors) => {
                setProcesando(false);
                // Si el backend nos devuelve un error de validación o pasarela, lo atrapamos y lo mostramos en tu modal estético
                if (errors.error) {
                    mostrarAlerta(errors.error, 'error');
                } else {
                    mostrarAlerta("Ocurrió un inconveniente al conectar con la pasarela de pagos.", 'error');
                }
            }
        });
    };
    return (
        <div className="min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] bg-[#FFFFFF] flex overflow-x-hidden relative">
            <Head title="Estado de Cuenta - Mouren" />

            <Sidebar />

            <main className="flex-1 p-6 md:p-10 content-shift transition-all duration-700 ease-in-out">
                {/* ENCABEZADO */}
                <header className="flex justify-between items-start mb-10 animate-fade-in">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight">
                            Estado de Cuenta
                        </h1>
                        <p className="text-[11px] italic opacity-70 mt-1">Suscripciones y previsión exequial de {nombreParaMostrar}</p>
                    </div>

                </header>

                <div className="max-w-5xl mx-auto space-y-8">
                    
                    {/* SECCIÓN 1: RESUMEN DE CARTERA INTELIGENTE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-[#5D4E3F] text-white p-8 rounded-[45px] shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                            <img src="/images/elementos_dashboard/flores_main.gif" className="absolute -top-8 -right-12 w-[200px] opacity-40 pointer-events-none" alt="" />
                            
                            <div>
                                <h3 className="text-[10px] uppercase tracking-[3px] font-bold text-[#FFD97D] mb-2 italic">Estado de Cartera</h3>
                                <h2 className="text-2xl font-black">
                                    {totalDeudaPendiente > 0 ? 'Tienes saldos pendientes' : '¡Te encuentras al día!'}
                                </h2>
                                <p className="text-[11px] opacity-70 mt-1">
                                    {seleccionadas.length > 0 
                                        ? `Has seleccionado ${seleccionadas.length} cuotas para saldar en bloque.` 
                                        : 'Selecciona las facturas de la tabla inferior que desees abonar en conjunto.'}
                                </p>
                            </div>

                            <div className="flex justify-between items-end mt-4">
                                <div>
                                    <p className="text-[9px] uppercase opacity-60 font-bold">Total Deuda</p>
                                    <p className="text-xl font-bold opacity-90">${Number(totalDeudaPendiente).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] uppercase text-[#FFD97D] font-bold">Total a Pagar Seleccionado</p>
                                    <p className="text-3xl font-black text-[#FFBD2E]">${Number(totalSeleccionado).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES MASIVAS Y BOTÓN DE PAGO */}
                        <div className="bg-[#D3CAB6] p-8 rounded-[45px] shadow-md flex flex-col justify-between text-left">
                            <div>
                                <h4 className="text-[10px] uppercase tracking-[2px] font-bold opacity-60 mb-3">Acciones de Pago</h4>
                                {seleccionadas.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="space-y-1 text-[11px] font-bold opacity-80">
                                            <p>📦 Cuotas marcadas: <span className="opacity-100 font-black">{seleccionadas.length}</span></p>
                                            <p>💰 Monto total: <span className="text-[#6E5D4F] font-black">${Number(totalSeleccionado).toLocaleString()}</span></p>
                                        </div>
                                        <button
                                            onClick={() => abrirModalConfirmacion(true)}
                                            disabled={procesando}
                                            className="w-full py-2.5 bg-[#302A1D] text-white rounded-2xl text-[10px] tracking-wider uppercase font-black hover:bg-[#4A3E32] transition shadow-md"
                                        >
                                            {procesando ? 'Procesando Transacción...' : 'Pagar Cuotas Seleccionadas'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-[11px] font-bold opacity-70 italic py-4">
                                        <p>No has marcado ningún elemento.</p>
                                        <p className="text-[10px] opacity-50 font-normal">Usa las casillas de la tabla para abonar múltiples obligaciones a la vez.</p>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 border-t border-[#5D4E3F]/10 text-[9px] uppercase tracking-wider opacity-60 italic">
                                Mouren Previsión Pasarela
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: TABLA CON CHECKBOXES E INDICADORES DE TIEMPO */}
                    <div className="bg-[#F4F1ED] p-6 md:p-8 rounded-[45px] shadow-sm border border-[#5D4E3F]/5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#5D4E3F]/10 pb-4">
                            <h3 className="text-lg font-black italic flex items-center gap-2">
                                Historial de Facturación 📜
                            </h3>
                            <button
                                onClick={descargarEstadoCuenta}
                                className="px-4 py-2 bg-[#5D4E3F] text-white rounded-2xl text-[11px] font-black tracking-wider uppercase hover:bg-[#4A3E32] transition shadow-sm flex items-center gap-2"
                            >
                                📥 Descargar Estado de Cuenta
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-[#5D4E3F]/20 text-[10px] uppercase tracking-wider opacity-60">
                                        <th className="py-3 px-2 text-center w-12">
                                            {facturasPendientes.length > 0 && (
                                                <input 
                                                    type="checkbox"
                                                    checked={seleccionadas.length === facturasPendientes.length}
                                                    onChange={handleSeleccionarTodas}
                                                    className="rounded border-[#5D4E3F]/30 text-[#5D4E3F] focus:ring-[#5D4E3F]"
                                                />
                                            )}
                                        </th>
                                        <th className="py-3 px-2">Factura #</th>
                                        <th className="py-3 px-2">Emisión</th>
                                        <th className="py-3 px-2">Vencimiento / Alerta</th>
                                        <th className="py-3 px-2 text-right">Total</th>
                                        <th className="py-3 px-2 text-center">Estado</th>
                                        <th className="py-3 px-2 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {facturas.length > 0 ? (
                                        facturas.map((factura) => {
                                            const esPendiente = factura.estado_factura_id === 1;
                                            return (
                                                <tr key={factura.id} className="border-b border-[#5D4E3F]/10 hover:bg-white/40 transition-all font-bold">
                                                    <td className="py-4 px-2 text-center">
                                                        {esPendiente ? (
                                                            <input 
                                                                type="checkbox"
                                                                checked={seleccionadas.includes(factura.id)}
                                                                onChange={() => handleSeleccionarFactura(factura.id)}
                                                                className="rounded border-[#5D4E3F]/30 text-[#5D4E3F] focus:ring-[#5D4E3F]"
                                                            />
                                                        ) : (
                                                            <span className="text-emerald-600 text-xs">✔</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-2">#{factura.id}</td>
                                                    <td className="py-4 px-2 opacity-80">{factura.fecha_emision}</td>
                                                    <td className="py-4 px-2 space-x-2">
                                                        <span className="opacity-80">{factura.fecha_vencimiento}</span>
                                                        {esPendiente && obtenerAlertaVencimiento(factura.fecha_vencimiento)}
                                                    </td>
                                                    <td className="py-4 px-2 text-right text-[#A68966]">${Number(factura.total).toLocaleString()}</td>
                                                    <td className="py-4 px-2 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-wider font-black ${
                                                            esPendiente 
                                                                ? 'bg-[#FFD97D]/30 text-[#8C6F4F]' 
                                                                : 'bg-emerald-100 text-emerald-800' 
                                                        }`}>
                                                            {esPendiente ? 'Pendiente' : 'Pagado'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-2 text-center flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => descargarPDF(factura.id)}
                                                            className="p-2 bg-white rounded-xl shadow-sm hover:scale-105 transition border border-[#5D4E3F]/10"
                                                            title="Descargar PDF"
                                                        >
                                                            📄
                                                        </button>

                                                        {esPendiente && (
                                                            <button 
                                                                onClick={() => abrirModalConfirmacion(false, factura.id)}
                                                                disabled={procesando}
                                                                className="px-3 py-1.5 bg-[#302A1D] text-white rounded-xl text-[10px] tracking-wider uppercase font-black hover:bg-[#4A3E32] transition disabled:opacity-50"
                                                            >
                                                                Pagar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-10 text-center opacity-50 italic">
                                                No se registran movimientos ni facturas en tu historial.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL 1: ALERTA PERSONALIZADA */}
            {modalConfig.visible && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-[#F4F1ED] border border-[#5D4E3F]/20 max-w-sm w-full p-6 rounded-[35px] shadow-2xl text-center space-y-4">
                        <div className="text-2xl">
                            {modalConfig.tipo === 'success' ? '✨' : modalConfig.tipo === 'error' ? '❌' : 'ℹ️'}
                        </div>
                        <p className="text-xs font-bold text-[#5D4E3F] leading-relaxed">
                            {modalConfig.mensaje}
                        </p>
                        <button
                            onClick={() => setModalConfig({ ...modalConfig, visible: false })}
                            className="w-full py-2 bg-[#5D4E3F] text-white text-[11px] font-black uppercase tracking-wider rounded-xl hover:bg-[#4A3E32] transition"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL 2: CONFIRMACIÓN DE PAGO ADAPTADO A PAGOS MÚLTIPLES */}
            {confirmConfig.visible && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-[#F4F1ED] border border-[#5D4E3F]/20 max-w-sm w-full p-6 rounded-[35px] shadow-2xl text-center space-y-5">
                        <div className="text-2xl">🔒</div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black uppercase tracking-wide">Confirmar Transacción</h4>
                            <p className="text-[11px] opacity-80 font-medium">
                                {confirmConfig.modoMasivo 
                                    ? `¿Deseas proceder con el pago seguro de las ${seleccionadas.length} cuotas seleccionadas por un valor de $${totalSeleccionado.toLocaleString()}?`
                                    : `¿Deseas proceder con el pago seguro de la cuota #${confirmConfig.facturaId}?`
                                }
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmConfig({ visible: false, modoMasivo: false, facturaId: null })}
                                className="flex-1 py-2 bg-transparent border border-[#5D4E3F]/30 text-[#5D4E3F] text-[10px] tracking-wider uppercase font-black rounded-xl hover:bg-gray-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={procesarPagoConfirmado}
                                className="flex-1 py-2 bg-[#302A1D] text-white text-[10px] tracking-wider uppercase font-black rounded-xl hover:bg-[#4A3E32] transition"
                            >
                                Sí, Pagar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
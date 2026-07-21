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
    
    // 🆕 NUEVO ESTADO: Almacena los montos específicos que el usuario decide abonar por cada factura
    // Se inicializa dinámicamente con el saldo_pendiente real de cada factura
    const [valoresAbono, setValoresAbono] = useState(() => {
        const inicial = {};
        facturas.forEach(f => {
            inicial[f.id] = Number(f.saldo_pendiente ?? f.total);
        });
        return inicial;
    });
    
    // Estados para controlar los modales personalizados de diseño
    const [modalConfig, setModalConfig] = useState({ visible: false, mensaje: '', tipo: 'info' });
    const [confirmConfig, setConfirmConfig] = useState({ visible: false, modoMasivo: false, facturaId: null });

    const nombreParaMostrar = usuario.name || "Usuario";

    // 🆕 CAMBIO: Filtrar las facturas que tengan saldo pendiente real (Pendientes = 1 o Abonadas = 3)
    const facturasCobrables = facturas.filter(f => f.estado_factura_id === 1 || f.estado_factura_id === 3);
    
    // 🆕 CAMBIO: El total histórico de deuda ahora se calcula en base a lo que realmente falta por pagar (saldo_pendiente)
    const totalDeudaPendiente = facturasCobrables.reduce((sum, f) => sum + Number(f.saldo_pendiente ?? f.total), 0);

    // 🆕 TOTAL CORREGIDO: Suma los abonos específicos que el usuario digitó en los inputs para las facturas seleccionadas
    const totalSeleccionado = facturasCobrables
        .filter(f => seleccionadas.includes(f.id))
        .reduce((sum, f) => sum + Number(valoresAbono[f.id] || 0), 0);

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

    // Seleccionar o deseleccionar todas las facturas cobrables de un solo golpe
    const handleSeleccionarTodas = () => {
        if (seleccionadas.length === facturasCobrables.length) {
            setSeleccionadas([]);
        } else {
            setSeleccionadas(facturasCobrables.map(f => f.id));
        }
    };

    // 🆕 NUEVO: Manejar cambios en el input de abono parcial protegiendo los límites de la factura
    const handleCambioMontoAbono = (id, valorDigitado, saldoMaximo) => {
        const numero = Number(valorDigitado);
        
        // No permitimos que digite un valor negativo ni que supere el saldo total pendiente de la factura
        if (numero < 0) return;
        
        setValoresAbono({
            ...valoresAbono,
            [id]: numero > saldoMaximo ? saldoMaximo : numero
        });
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
        
        // 🆕 CAMBIO ESTRATÉGICO: Construimos una estructura estructurada [id => monto] para pasarle al backend
        const idsAProcesar = modoMasivo ? seleccionadas : [facturaId];
        const detallesPago = idsAProcesar.map(id => ({
            id: id,
            monto: valoresAbono[id] || 0
        }));

        // Validar que no se envíen abonos en $0
        const abonosValidos = detallesPago.filter(item => item.monto > 0);
        if (abonosValidos.length === 0) {
            mostrarAlerta("El monto de abono debe ser mayor a $0 en las facturas seleccionadas.", "error");
            return;
        }

        setConfirmConfig({ visible: false, modoMasivo: false, facturaId: null });
        setProcesando(true);
        
        // Enviamos tanto las IDs como sus montos personalizados correspondientes en el request
        router.post(`/cliente/pagos/procesar-lote`, { 
            ids: abonosValidos.map(item => item.id),
            montos_personalizados: abonosValidos // Enviamos el mapeo detallado al servidor
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setProcesando(false);
                setSeleccionadas([]);
            },
            onError: (errors) => {
                setProcesando(false);
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
                                        ? `Has seleccionado ${seleccionadas.length} obligaciones para procesar abonos parciales o totales.` 
                                        : 'Selecciona las facturas de la tabla inferior. Si superan los $60.000 puedes escribir el monto parcial que deseas abonar.'}
                                </p>
                            </div>

                            <div className="flex justify-between items-end mt-4">
                                <div>
                                    <p className="text-[9px] uppercase opacity-60 font-bold">Total Saldo Pendiente</p>
                                    <p className="text-xl font-bold opacity-90">${Number(totalDeudaPendiente).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] uppercase text-[#FFD97D] font-bold">Total del Abono a Enviar</p>
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
                                            <p>💰 Monto de abono: <span className="text-[#6E5D4F] font-black">${Number(totalSeleccionado).toLocaleString()}</span></p>
                                        </div>
                                        <button
                                            onClick={() => abrirModalConfirmacion(true)}
                                            disabled={procesando || totalSeleccionado <= 0}
                                            className="w-full py-2.5 bg-[#302A1D] text-white rounded-2xl text-[10px] tracking-wider uppercase font-black hover:bg-[#4A3E32] transition shadow-md disabled:opacity-50"
                                        >
                                            {procesando ? 'Procesando Transacción...' : 'Pagar Abonos Seleccionados'}
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
                                            {facturasCobrables.length > 0 && (
                                                <input 
                                                    type="checkbox"
                                                    checked={seleccionadas.length === facturasCobrables.length}
                                                    onChange={handleSeleccionarTodas}
                                                    className="rounded border-[#5D4E3F]/30 text-[#5D4E3F] focus:ring-[#5D4E3F]"
                                                />
                                            )}
                                        </th>
                                        <th className="py-3 px-2">Factura #</th>
                                        <th className="py-3 px-2">Vencimiento / Alerta</th>
                                        <th className="py-3 px-2 text-right">Monto Total</th>
                                        <th className="py-3 px-2 text-right text-emerald-700">Ya Pagado</th>
                                        <th className="py-3 px-2 text-right text-red-700">Por Pagar</th>
                                        <th className="py-3 px-2 text-center w-36">¿Cuánto deseas abonar?</th>
                                        <th className="py-3 px-2 text-center">Estado</th>
                                        <th className="py-3 px-2 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {facturas.length > 0 ? (
                                        facturas.map((factura) => {
                                            // Se permite pagar si el estado es Pendiente (1) o Abonado (3)
                                            const esCobrable = factura.estado_factura_id === 1 || factura.estado_factura_id === 3;
                                            const saldoReal = Number(factura.saldo_pendiente ?? factura.total);
                                            // Condición solicitada: Habilitar abonos parciales si el total original supera los $60.000
                                            const permiteAbonosParciales = Number(factura.total) > 60000;

                                            return (
                                                <tr key={factura.id} className="border-b border-[#5D4E3F]/10 hover:bg-white/40 transition-all font-bold">
                                                    <td className="py-4 px-2 text-center">
                                                        {esCobrable ? (
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
                                                    <td className="py-4 px-2 space-x-2">
                                                        <span className="opacity-80">{factura.fecha_vencimiento}</span>
                                                        {esCobrable && obtenerAlertaVencimiento(factura.fecha_vencimiento)}
                                                    </td>
                                                    <td className="py-4 px-2 text-right opacity-60">${Number(factura.total).toLocaleString()}</td>
                                                    <td className="py-4 px-2 text-right text-emerald-600">${Number(factura.monto_pagado ?? 0).toLocaleString()}</td>
                                                    <td className="py-4 px-2 text-right text-red-600">${saldoReal.toLocaleString()}</td>
                                                    
                                                    {/* 🆕 COLUMNA DE ABONO INTELIGENTE */}
                                                    <td className="py-2 px-2 text-center">
                                                        {esCobrable ? (
                                                            permiteAbonosParciales ? (
                                                                <div className="flex items-center bg-white border border-[#5D4E3F]/20 rounded-lg px-2 py-1 max-w-[130px] mx-auto shadow-inner">
                                                                    <span className="text-[10px] opacity-50 mr-1">$</span>
                                                                    <input 
                                                                        type="number"
                                                                        value={valoresAbono[factura.id] ?? ''}
                                                                        onChange={(e) => handleCambioMontoAbono(factura.id, e.target.value, saldoReal)}
                                                                        className="w-full bg-transparent border-none p-0 text-xs text-right focus:ring-0 text-[#5D4E3F] font-black"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span className="text-[11px] opacity-50 italic">Valor Fijo Obligatorio</span>
                                                            )
                                                        ) : (
                                                            <span className="text-[11px] text-emerald-600">Completado</span>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-2 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-wider font-black ${
                                                            factura.estado_factura_id === 1 
                                                                ? 'bg-[#FFD97D]/30 text-[#8C6F4F]' 
                                                                : factura.estado_factura_id === 3
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-emerald-100 text-emerald-800' 
                                                        }`}>
                                                            {factura.estado_factura_id === 1 ? 'Pendiente' : factura.estado_factura_id === 3 ? 'Abonado' : 'Pagado'}
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

                                                        {esCobrable && (
                                                            <button 
                                                                onClick={() => abrirModalConfirmacion(false, factura.id)}
                                                                disabled={procesando || (valoresAbono[factura.id] || 0) <= 0}
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
                                            <td colSpan="9" className="py-10 text-center opacity-50 italic">
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
                                    ? `¿Deseas proceder con el pago seguro de los abonos seleccionados por un valor total de $${totalSeleccionado.toLocaleString()}?`
                                    : `¿Deseas proceder con el pago seguro del abono para la cuota #${confirmConfig.facturaId} por un valor de $${(valoresAbono[confirmConfig.facturaId] || 0).toLocaleString()}?`
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
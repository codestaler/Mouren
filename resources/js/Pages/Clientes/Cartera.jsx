import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import Sidebar from './Sidebar';
import axios from 'axios';

export default function Cartera({ facturas = [] }) {
    const { auth } = usePage().props;
    const usuario = auth?.user || {};
    const [procesandoId, setProcesandoId] = useState(null);
    
    // Estados para controlar los modales personalizados de diseño
    const [modalConfig, setModalConfig] = useState({ visible: false, mensaje: '', tipo: 'info' });
    const [confirmConfig, setConfirmConfig] = useState({ visible: false, facturaId: null });

    // Filtrar la cuota pendiente más urgente para mostrarla en el banner principal
    const facturaPendiente = facturas.find(f => f.estado_factura_id === 1); // 1 = Pendiente
    const totalPendiente = facturas
        .filter(f => f.estado_factura_id === 1)
        .reduce((sum, f) => sum + Number(f.total), 0);

    const nombreParaMostrar = usuario.name || "Usuario";

    // Función para mostrar alertas personalizadas estéticas de Mouren
    const mostrarAlerta = (mensaje, tipo = 'info') => {
        setModalConfig({ visible: true, mensaje, tipo });
    };

    // Función para descargar el PDF usando tu ruta activa de Laravel
    const descargarPDF = async (facturaId) => {
        try {
            const response = await axios.get(`/cliente/factura/${facturaId}/pdf`, {
                responseType: 'blob',
            });
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

    // Nueva Función: Descargar el Estado de Cuenta Completo en PDF
    const descargarEstadoCuenta = async () => {
        try {
            const response = await axios.get(`/cliente/estado-cuenta/pdf`, {
                responseType: 'blob',
            });
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

    // Iniciar el flujo de pago abriendo el modal de confirmación propio
    const solicitarConfirmacionPago = (facturaId) => {
        setConfirmConfig({ visible: true, facturaId });
    };

    // Ejecutar la petición real de pago si el usuario acepta en nuestro modal
    const procesarPagoConfirmado = () => {
        const facturaId = confirmConfig.facturaId;
        setConfirmConfig({ visible: false, facturaId: null });
        setProcesandoId(facturaId);
        
        router.post(`/cliente/pagos/${facturaId}/procesar`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setProcesandoId(null);
                mostrarAlerta("¡Pago procesado con éxito! Gracias por mantener tu cobertura al día.", 'success');
            },
            onError: () => setProcesandoId(null)
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

                    <div className="flex items-center gap-3 bg-white/30 p-2 rounded-full border border-white/50 shadow-sm backdrop-blur-sm">
                        <div className="w-9 h-9 rounded-full bg-[#5D4E3F] text-white flex items-center justify-center font-bold text-xs shadow-md">
                            {nombreParaMostrar[0]}
                        </div>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto space-y-8">
                    
                    {/* SECCIÓN 1: TARJETA RESUMEN DE CARTERA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-[#5D4E3F] text-white p-8 rounded-[45px] shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                            <img src="/images/elementos_dashboard/flores_main.gif" className="absolute -top-8 -right-12 w-[200px] opacity-40 pointer-events-none" alt="" />
                            
                            <div>
                                <h3 className="text-[10px] uppercase tracking-[3px] font-bold text-[#FFD97D] mb-2 italic">Estado de Cartera</h3>
                                <h2 className="text-2xl font-black">
                                    {totalPendiente > 0 ? 'Tienes saldos pendientes' : '¡Te encuentras al día!'}
                                </h2>
                                <p className="text-[11px] opacity-70 mt-1">Mantén tus pagos al día para garantizar la protección total de tus afiliados.</p>
                            </div>

                            <div className="text-right mt-4">
                                <p className="text-[9px] uppercase opacity-60 font-bold">Total Deuda Actual</p>
                                <p className="text-3xl font-black text-[#FFBD2E]">${Number(totalPendiente).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* TARJETA CHICA: PRÓXIMO VENCIMIENTO CON MÁS DETALLES */}
                        <div className="bg-[#D3CAB6] p-8 rounded-[45px] shadow-md flex flex-col justify-between text-left">
                            <div>
                                <h4 className="text-[10px] uppercase tracking-[2px] font-bold opacity-60 mb-2">Próximo Límite</h4>
                                {facturaPendiente ? (
                                    <div className="space-y-2">
                                        <p className="text-lg font-black text-[#302A1D]">
                                            {facturaPendiente.fecha_vencimiento}
                                        </p>
                                        <div className="space-y-1 text-[11px] font-bold opacity-80">
                                            <p>📄 Documento: <span className="opacity-100 font-black">#{facturaPendiente.id}</span></p>
                                            <p>💰 Valor cuota: <span className="text-[#6E5D4F] font-black">${Number(facturaPendiente.total).toLocaleString()}</span></p>
                                        </div>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 font-black rounded-md text-[9px] uppercase tracking-wider animate-pulse">
                                            Pago Requerido
                                        </span>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-emerald-800">Sin fechas límite</p>
                                        <p className="text-[11px] opacity-70">No registras ninguna obligación pendiente por abonar.</p>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 border-t border-[#5D4E3F]/10 text-[9px] uppercase tracking-wider opacity-60 italic">
                                Mouren Previsión
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: TABLA DETALLADA DE HISTORIAL */}
                    <div className="bg-[#F4F1ED] p-6 md:p-8 rounded-[45px] shadow-sm border border-[#5D4E3F]/5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#5D4E3F]/10 pb-4">
                            <h3 className="text-lg font-black italic flex items-center gap-2">
                                Historial de Facturación 📜
                            </h3>
                            {/* Botón para descargar Estado de Cuenta general */}
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
                                        <th className="py-3 px-2">Factura #</th>
                                        <th className="py-3 px-2">Emisión</th>
                                        <th className="py-3 px-2">Vencimiento</th>
                                        <th className="py-3 px-2 text-right">Total</th>
                                        <th className="py-3 px-2 text-center">Estado</th>
                                        <th className="py-3 px-2 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {facturas.length > 0 ? (
                                        facturas.map((factura) => (
                                            <tr key={factura.id} className="border-b border-[#5D4E3F]/10 hover:bg-white/40 transition-all font-bold">
                                                <td className="py-4 px-2">#{factura.id}</td>
                                                <td className="py-4 px-2 opacity-80">{factura.fecha_emision}</td>
                                                <td className="py-4 px-2 opacity-80">{factura.fecha_vencimiento}</td>
                                                <td className="py-4 px-2 text-right text-[#A68966]">${Number(factura.total).toLocaleString()}</td>
                                                <td className="py-4 px-2 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-wider font-black ${
                                                        factura.estado_factura_id === 1 
                                                            ? 'bg-[#FFD97D]/30 text-[#8C6F4F]' 
                                                            : 'bg-emerald-100 text-emerald-800' 
                                                    }`}>
                                                        {factura.estado_factura_id === 1 ? 'Pendiente' : 'Pagado'}
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

                                                    {factura.estado_factura_id === 1 && (
                                                        <button 
                                                            onClick={() => solicitarConfirmacionPago(factura.id)}
                                                            disabled={procesandoId === factura.id}
                                                            className="px-3 py-1.5 bg-[#302A1D] text-white rounded-xl text-[10px] tracking-wider uppercase font-black hover:bg-[#4A3E32] transition disabled:opacity-50"
                                                        >
                                                            {procesandoId === factura.id ? '...' : 'Pagar'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="py-10 text-center opacity-50 italic">
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

            {/* MODAL 1: ALERTA PERSONALIZADA (Reemplaza al alert de localhost) */}
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

            {/* MODAL 2: CONFIRMACIÓN DE PAGO (Reemplaza al confirm de localhost) */}
            {confirmConfig.visible && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-[#F4F1ED] border border-[#5D4E3F]/20 max-w-sm w-full p-6 rounded-[35px] shadow-2xl text-center space-y-5">
                        <div className="text-2xl">🔒</div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black uppercase tracking-wide">Confirmar Transacción</h4>
                            <p className="text-[11px] opacity-80 font-medium">¿Deseas proceder con el pago seguro de la cuota #{confirmConfig.facturaId}?</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmConfig({ visible: false, facturaId: null })}
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
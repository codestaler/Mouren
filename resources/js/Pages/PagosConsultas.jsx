import React, { useState } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head } from '@inertiajs/react';
import axios from 'axios';

/**
 * PÁGINA PÚBLICA: Pagos y Consultas
 * No requiere inicio de sesión.
 *
 * Dos flujos, presentados como "tiquetes" perforados (borde punteado + sello circular),
 * porque ambos documentos —certificado y comprobante— son piezas oficiales que la
 * persona se lleva consigo.
 *
 * 🔌 ENDPOINTS QUE ESTE COMPONENTE ESPERA (se conectarán en el siguiente paso):
 *   POST /consultas/afiliacion            { cedula }              -> { encontrado, tipo, nombre, plan, estado, afiliado_id }
 *   POST /consultas/afiliacion/certificado/{afiliado_id}          -> descarga PDF
 *   POST /consultas/pagos/enviar-codigo   { cedula }              -> { enviado, canal }
 *   POST /consultas/pagos/verificar       { cedula, codigo }      -> { valido, token }
 *   POST /consultas/pagos/facturas        { cedula, token }       -> { facturas: [...] }
 *   POST /consultas/pagos/procesar-lote   { cedula, token, ids, montos_personalizados } -> redirect a Mercado Pago
 */

const ESTILO = {
    marron: '#5D4E3F',
    crema: '#F4EDE6',
    acento: '#A68966',
};

// --- Componente reutilizable: "tiquete" perforado con sello ---
function TiqueteCard({ icono, titulo, subtitulo, rotacion = '-rotate-1', children }) {
    return (
        <div className={`relative bg-white/80 backdrop-blur-sm border-2 border-dashed border-[#5D4E3F]/25 rounded-[28px] p-6 sm:p-8 shadow-xl ${rotacion} transition-transform hover:rotate-0 duration-500`}>
            {/* Sello circular, como un timbre oficial */}
            <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full bg-[#5D4E3F] text-white flex items-center justify-center text-2xl shadow-lg border-4 border-[#F4EDE6] rotate-12">
                {icono}
            </div>
            {/* Muescas laterales tipo tiquete */}
            <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F4EDE6]" />
            <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F4EDE6]" />

            <h3 className="text-xl sm:text-2xl font-black italic text-[#5D4E3F] mb-1">{titulo}</h3>
            <p className="text-[13px] text-[#5D4E3F]/70 font-bold mb-6">{subtitulo}</p>

            {children}
        </div>
    );
}

function Spinner() {
    return (
        <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
    );
}

export default function PagosConsultas() {
    // ============ FLUJO A: CONSULTA DE AFILIACIÓN ============
    const [cedulaAfiliacion, setCedulaAfiliacion] = useState('');
    const [buscandoAfiliacion, setBuscandoAfiliacion] = useState(false);
    const [resultadoAfiliacion, setResultadoAfiliacion] = useState(null); // { encontrado, nombre, tipo, plan, estado, afiliado_id }
    const [errorAfiliacion, setErrorAfiliacion] = useState('');

    const consultarAfiliacion = async (e) => {
        e.preventDefault();
        if (!cedulaAfiliacion.trim()) return;

        setBuscandoAfiliacion(true);
        setErrorAfiliacion('');
        setResultadoAfiliacion(null);

        try {
            const { data } = await axios.post('/consultas/afiliacion', { cedula: cedulaAfiliacion.trim() });
            setResultadoAfiliacion(data);
            if (!data.encontrado) {
                setErrorAfiliacion('No encontramos ninguna afiliación activa con ese número de documento.');
            }
        } catch (err) {
            setErrorAfiliacion('No pudimos procesar la consulta en este momento. Intenta de nuevo.');
        } finally {
            setBuscandoAfiliacion(false);
        }
    };

    const descargarCertificado = async () => {
        if (!resultadoAfiliacion?.id) return;
        try {
            const response = await axios.post(
                `/consultas/afiliacion/certificado`,
                {
                    cedula: cedulaAfiliacion.trim(),
                    tipo: resultadoAfiliacion.tipo,
                    id: resultadoAfiliacion.id,
                },
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificado-afiliacion-${cedulaAfiliacion.trim()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            setErrorAfiliacion('No se pudo generar el certificado en este momento.');
        }
    };

    // ============ FLUJO B: PAGOS Y FACTURAS ============
    const [pasoPago, setPasoPago] = useState('cedula'); // 'cedula' | 'codigo' | 'facturas'
    const [cedulaPago, setCedulaPago] = useState('');
    const [codigo, setCodigo] = useState('');
    const [tokenSesion, setTokenSesion] = useState(null);
    const [enviandoCodigo, setEnviandoCodigo] = useState(false);
    const [verificandoCodigo, setVerificandoCodigo] = useState(false);
    const [errorPago, setErrorPago] = useState('');
    const [canalEnvio, setCanalEnvio] = useState('');

    const [facturas, setFacturas] = useState([]);
    const [seleccionadas, setSeleccionadas] = useState([]);
    const [valoresAbono, setValoresAbono] = useState({});
    const [procesandoPago, setProcesandoPago] = useState(false);
    const [expandidas, setExpandidas] = useState([]);

    // Misma lógica de alertas de vencimiento que usas en la Cartera del cliente logueado
    const obtenerAlertaVencimiento = (fechaVencimiento) => {
        if (!fechaVencimiento) return null;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const vencimiento = new Date(fechaVencimiento);
        vencimiento.setHours(0, 0, 0, 0);

        const diferenciaTiempo = vencimiento - hoy;
        const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) {
            return <span className="inline-block px-2 py-0.5 bg-red-200 text-red-900 font-black rounded-md text-[9px] uppercase tracking-wider whitespace-nowrap">Vencida ({Math.abs(diasRestantes)}d)</span>;
        } else if (diasRestantes === 0) {
            return <span className="inline-block px-2 py-0.5 bg-red-500 text-white font-black rounded-md text-[9px] uppercase tracking-wider whitespace-nowrap">¡Vence Hoy!</span>;
        } else if (diasRestantes === 1) {
            return <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 font-black rounded-md text-[9px] uppercase tracking-wider whitespace-nowrap">Vence Mañana</span>;
        } else if (diasRestantes <= 3) {
            return <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 font-black rounded-md text-[9px] uppercase tracking-wider whitespace-nowrap">Faltan {diasRestantes} días</span>;
        }
        return null;
    };

    const toggleExpandida = (id) => {
        setExpandidas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const enviarCodigo = async (e) => {
        e.preventDefault();
        if (!cedulaPago.trim()) return;

        setEnviandoCodigo(true);
        setErrorPago('');

        try {
            const { data } = await axios.post('/consultas/pagos/enviar-codigo', { cedula: cedulaPago.trim() });
            setCanalEnvio(data.canal || 'correo');
            setPasoPago('codigo');
        } catch (err) {
            setErrorPago(err.response?.data?.error || 'No encontramos ningún registro con ese número de documento.');
        } finally {
            setEnviandoCodigo(false);
        }
    };

    const verificarCodigo = async (e) => {
        e.preventDefault();
        if (!codigo.trim()) return;

        setVerificandoCodigo(true);
        setErrorPago('');

        try {
            const { data } = await axios.post('/consultas/pagos/verificar', {
                cedula: cedulaPago.trim(),
                codigo: codigo.trim(),
            });

            setTokenSesion(data.token);

            const { data: dataFacturas } = await axios.post('/consultas/pagos/facturas', {
                cedula: cedulaPago.trim(),
                token: data.token,
            });

            setFacturas(dataFacturas.facturas || []);
            const inicial = {};
            (dataFacturas.facturas || []).forEach(f => {
                inicial[f.id] = Number(f.saldo_pendiente ?? f.total);
            });
            setValoresAbono(inicial);
            setPasoPago('facturas');
        } catch (err) {
            setErrorPago(err.response?.data?.error || 'El código ingresado no es válido o expiró.');
        } finally {
            setVerificandoCodigo(false);
        }
    };

    const facturasCobrables = facturas.filter(f => f.estado_factura_id === 1 || f.estado_factura_id === 3);
    const totalSeleccionado = facturasCobrables
        .filter(f => seleccionadas.includes(f.id))
        .reduce((sum, f) => sum + Number(valoresAbono[f.id] || 0), 0);

    const toggleSeleccion = (id) => {
        setSeleccionadas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const cambiarAbono = (id, valor, max) => {
        const num = Number(valor);
        if (num < 0) return;
        setValoresAbono(prev => ({ ...prev, [id]: num > max ? max : num }));
    };

    const pagarSeleccionadas = async () => {
        if (seleccionadas.length === 0 || totalSeleccionado <= 0) return;

        setProcesandoPago(true);
        setErrorPago('');

        try {
            await axios.post('/consultas/pagos/procesar-lote', {
                cedula: cedulaPago.trim(),
                token: tokenSesion,
                ids: seleccionadas,
                montos_personalizados: seleccionadas.map(id => ({ id, monto: valoresAbono[id] || 0 })),
            }).then(({ data }) => {
                if (data?.init_point) {
                    window.location.href = data.init_point;
                }
            });
        } catch (err) {
            setErrorPago(err.response?.data?.error || 'No se pudo conectar con la pasarela de pagos.');
            setProcesandoPago(false);
        }
    };

    const reiniciarFlujoPago = () => {
        setPasoPago('cedula');
        setCedulaPago('');
        setCodigo('');
        setTokenSesion(null);
        setFacturas([]);
        setSeleccionadas([]);
        setValoresAbono({});
        setErrorPago('');
    };

    return (
        <div className="min-h-screen bg-[#F4EDE6] font-['Hepta_Slab'] relative overflow-x-hidden flex flex-col text-[#5D4E3F]">
            <Head title="Pagos y Consultas - Mouren" />
            <Navbar />

            {/* --- HERO --- */}
            <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-8 md:px-16 flex flex-col items-center text-center overflow-hidden">
                {/* Textura de fondo sutil, papel */}
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, #5D4E3F 0, #5D4E3F 1px, transparent 1px, transparent 12px)',
                    }}
                />
                <span className="relative text-[12px] uppercase tracking-[4px] font-black text-[#A68966] mb-3">
                    Trámites en línea
                </span>
                <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-black italic mb-4 max-w-2xl">
                    Pagos y Consultas
                </h1>
                <p className="relative text-[15px] sm:text-[16px] opacity-70 max-w-xl leading-relaxed font-bold">
                    Verifica tu afiliación y descarga tu certificado, o consulta y paga tus cuotas pendientes.
                    Todo sin necesidad de crear una cuenta.
                </p>
            </section>

            {/* --- LAS DOS TARJETAS PRINCIPALES --- */}
            <section className="relative z-10 px-4 sm:px-8 md:px-16 pb-24 -mt-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-start">

                    {/* ===== TARJETA 1: AFILIACIÓN / CERTIFICADO ===== */}
                    <TiqueteCard icono="🎓" titulo="Consultar Afiliación" subtitulo="Verifica tu estado y descarga tu certificado" rotacion="-rotate-1">
                        <form onSubmit={consultarAfiliacion} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1 opacity-60">
                                    Número de documento
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    value={cedulaAfiliacion}
                                    onChange={(e) => setCedulaAfiliacion(e.target.value)}
                                    placeholder="Ej: 1017123456"
                                    className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-2 outline-none focus:border-[#A68966] transition-colors text-lg font-bold"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={buscandoAfiliacion}
                                className="w-full flex items-center justify-center gap-2 bg-[#5D4E3F] text-white py-3 rounded-full font-black text-[13px] uppercase tracking-wider hover:bg-[#4A3E32] transition disabled:opacity-60"
                            >
                                {buscandoAfiliacion ? (<><Spinner /> Consultando...</>) : 'Consultar'}
                            </button>
                        </form>

                        {errorAfiliacion && (
                            <p className="mt-4 text-[12px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                                {errorAfiliacion}
                            </p>
                        )}

                        {resultadoAfiliacion?.encontrado && (
                            <div className="mt-5 pt-5 border-t border-dashed border-[#5D4E3F]/20 space-y-2 animate-fade-in">
                                <p className="text-[13px]"><span className="opacity-60 font-bold">Nombre:</span> <span className="font-black">{resultadoAfiliacion.nombre}</span></p>
                                <p className="text-[13px]"><span className="opacity-60 font-bold">Tipo:</span> <span className="font-black">{resultadoAfiliacion.tipo}</span></p>
                                <p className="text-[13px]"><span className="opacity-60 font-bold">Plan:</span> <span className="font-black">{resultadoAfiliacion.plan}</span></p>
                                <p className="text-[13px] flex items-center gap-2">
                                    <span className="opacity-60 font-bold">Estado:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                                        resultadoAfiliacion.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        {resultadoAfiliacion.estado}
                                    </span>
                                </p>

                                <button
                                    onClick={descargarCertificado}
                                    className="w-full mt-3 flex items-center justify-center gap-2 bg-[#A68966] text-white py-2.5 rounded-full font-black text-[12px] uppercase tracking-wider hover:bg-[#8f7455] transition"
                                >
                                    📜 Descargar Certificado
                                </button>
                            </div>
                        )}
                    </TiqueteCard>

                    {/* ===== TARJETA 2: PAGOS Y FACTURAS ===== */}
                    <TiqueteCard icono="🧾" titulo="Pagar Facturas" subtitulo="Consulta tu saldo y paga en línea" rotacion="rotate-1">

                        {/* PASO 1: Pedir cédula */}
                        {pasoPago === 'cedula' && (
                            <form onSubmit={enviarCodigo} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1 opacity-60">
                                        Número de documento
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        required
                                        value={cedulaPago}
                                        onChange={(e) => setCedulaPago(e.target.value)}
                                        placeholder="Ej: 1017123456"
                                        className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-2 outline-none focus:border-[#A68966] transition-colors text-lg font-bold"
                                    />
                                </div>
                                <p className="text-[11px] opacity-60 leading-relaxed">
                                    Por tu seguridad, te enviaremos un código de verificación al correo o celular registrado antes de mostrarte tus facturas.
                                </p>
                                <button
                                    type="submit"
                                    disabled={enviandoCodigo}
                                    className="w-full flex items-center justify-center gap-2 bg-[#5D4E3F] text-white py-3 rounded-full font-black text-[13px] uppercase tracking-wider hover:bg-[#4A3E32] transition disabled:opacity-60"
                                >
                                    {enviandoCodigo ? (<><Spinner /> Enviando código...</>) : 'Enviar código de verificación'}
                                </button>
                            </form>
                        )}

                        {/* PASO 2: Verificar código */}
                        {pasoPago === 'codigo' && (
                            <form onSubmit={verificarCodigo} className="space-y-4">
                                <p className="text-[12px] font-bold bg-[#F4EDE6] rounded-xl px-3 py-2">
                                    ✉️ Enviamos un código de 6 dígitos a tu {canalEnvio || 'correo'} registrado.
                                </p>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1 opacity-60">
                                        Código de verificación
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        required
                                        value={codigo}
                                        onChange={(e) => setCodigo(e.target.value)}
                                        placeholder="000000"
                                        className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-2 outline-none focus:border-[#A68966] transition-colors text-2xl font-black tracking-[8px] text-center"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={verificandoCodigo}
                                    className="w-full flex items-center justify-center gap-2 bg-[#5D4E3F] text-white py-3 rounded-full font-black text-[13px] uppercase tracking-wider hover:bg-[#4A3E32] transition disabled:opacity-60"
                                >
                                    {verificandoCodigo ? (<><Spinner /> Verificando...</>) : 'Verificar código'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPasoPago('cedula')}
                                    className="w-full text-[11px] font-bold opacity-60 hover:opacity-100 transition"
                                >
                                    ← Usar otro número de documento
                                </button>
                            </form>
                        )}

                        {/* PASO 3: Ver facturas y pagar */}
                        {pasoPago === 'facturas' && (
                            <div className="space-y-4">
                                {facturasCobrables.length === 0 ? (
                                    <p className="text-[13px] font-bold opacity-70 italic py-6 text-center">
                                        ¡Buenas noticias! No tienes facturas pendientes en este momento.
                                    </p>
                                ) : (
                                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                        {facturasCobrables.map((factura) => {
                                            const saldoReal = Number(factura.saldo_pendiente ?? factura.total);
                                            const permiteParcial = Number(factura.total) > 60000;
                                            const marcada = seleccionadas.includes(factura.id);
                                            const abierta = expandidas.includes(factura.id);

                                            return (
                                                <div key={factura.id} className={`rounded-2xl border overflow-hidden transition ${marcada ? 'border-[#A68966] bg-[#A68966]/5' : 'border-[#5D4E3F]/10 bg-white/50'}`}>
                                                    {/* CABECERA: siempre visible */}
                                                    <div className="flex items-center justify-between gap-2 p-3">
                                                        <label className="flex items-center gap-2 font-black text-[13px] cursor-pointer min-w-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={marcada}
                                                                onChange={() => toggleSeleccion(factura.id)}
                                                                className="rounded border-[#5D4E3F]/30 text-[#5D4E3F] shrink-0"
                                                            />
                                                            <span className="truncate">Factura #{factura.id}</span>
                                                            {obtenerAlertaVencimiento(factura.fecha_vencimiento)}
                                                        </label>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-[11px] font-bold text-red-600 whitespace-nowrap">
                                                                Debe ${saldoReal.toLocaleString()}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpandida(factura.id)}
                                                                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/70 border border-[#5D4E3F]/15 text-[11px] font-black hover:bg-white transition"
                                                                aria-label={abierta ? 'Ver menos' : 'Ver más detalles'}
                                                            >
                                                                {abierta ? '−' : '+'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* DETALLE EXPANDIDO */}
                                                    {abierta && (
                                                        <div className="px-3 pb-3 pt-1 border-t border-dashed border-[#5D4E3F]/15 space-y-3 animate-fade-in">
                                                            <div className="flex justify-between text-[11px] opacity-70 font-bold">
                                                                <span>Vence: {factura.fecha_vencimiento}</span>
                                                            </div>

                                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                                <div className="bg-black/5 rounded-xl p-2">
                                                                    <p className="text-[8px] uppercase opacity-50 font-bold">Total</p>
                                                                    <p className="text-[11px] font-black opacity-70">${Number(factura.total).toLocaleString()}</p>
                                                                </div>
                                                                <div className="bg-emerald-50 rounded-xl p-2">
                                                                    <p className="text-[8px] uppercase opacity-50 font-bold">Pagado</p>
                                                                    <p className="text-[11px] font-black text-emerald-600">${Number(factura.monto_pagado ?? 0).toLocaleString()}</p>
                                                                </div>
                                                                <div className="bg-red-50 rounded-xl p-2">
                                                                    <p className="text-[8px] uppercase opacity-50 font-bold">Por Pagar</p>
                                                                    <p className="text-[11px] font-black text-red-600">${saldoReal.toLocaleString()}</p>
                                                                </div>
                                                            </div>

                                                            <p className="text-[10px] uppercase font-bold opacity-50">
                                                                Estado: <span className="opacity-100">{factura.estado_factura_id === 3 ? 'Abonada parcialmente' : 'Pendiente'}</span>
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* INPUT DE ABONO: solo si está seleccionada */}
                                                    {marcada && (
                                                        <div className="px-3 pb-3">
                                                            {permiteParcial ? (
                                                                <div className="flex items-center bg-white border border-[#5D4E3F]/20 rounded-lg px-2 py-1.5">
                                                                    <span className="text-[11px] opacity-50 mr-1">¿Cuánto abonas? $</span>
                                                                    <input
                                                                        type="number"
                                                                        value={valoresAbono[factura.id] ?? ''}
                                                                        onChange={(e) => cambiarAbono(factura.id, e.target.value, saldoReal)}
                                                                        className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0 font-black"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span className="text-[11px] opacity-50 italic">Se pagará el valor completo</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {errorPago && (
                                    <p className="text-[12px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                                        {errorPago}
                                    </p>
                                )}

                                {facturasCobrables.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#5D4E3F]/20">
                                            <span className="text-[11px] uppercase font-bold opacity-60">Total a pagar</span>
                                            <span className="text-xl font-black text-[#A68966]">${totalSeleccionado.toLocaleString()}</span>
                                        </div>
                                        <button
                                            onClick={pagarSeleccionadas}
                                            disabled={procesandoPago || totalSeleccionado <= 0}
                                            className="w-full flex items-center justify-center gap-2 bg-[#302A1D] text-white py-3 rounded-full font-black text-[13px] uppercase tracking-wider hover:bg-[#4A3E32] transition disabled:opacity-50"
                                        >
                                            {procesandoPago ? (<><Spinner /> Redirigiendo a Mercado Pago...</>) : 'Pagar ahora'}
                                        </button>
                                    </>
                                )}

                                <button
                                    type="button"
                                    onClick={reiniciarFlujoPago}
                                    className="w-full text-[11px] font-bold opacity-60 hover:opacity-100 transition"
                                >
                                    ← Consultar otro documento
                                </button>
                            </div>
                        )}
                    </TiqueteCard>
                </div>
            </section>

            <div className="relative z-30 mt-[200px]">
                <Footer />
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
}

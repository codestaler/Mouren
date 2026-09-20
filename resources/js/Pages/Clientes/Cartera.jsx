import React, { useState, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import Sidebar from './Sidebar';
import axios from 'axios';

// 🖼️ Cambia esta ruta por tu GIF — se muestra dentro de la pantalla del TV místico.
// Si la dejas vacía o la imagen no existe, el TV simplemente muestra "SIN SEÑAL".
const GIF_TV_MISTICO = '/images/elementos_dashboard/cartera/mouri_tv.webp';

// 🆕 El televisor colgante — puramente decorativo, vive solo en la sección de Informes.
function TVMistico() {
    const [imagenValida, setImagenValida] = useState(true);

    return (
        <div className="absolute -top-2 right-2 sm:right-6 flex flex-col items-center pointer-events-none select-none z-10">
            {/* cuerdita de la que cuelga */}
            <div className="w-0.5 h-7 bg-gradient-to-b from-transparent to-[#5D4E3F]/50 dark:to-white/30"></div>

            <div className="relative">
                {/* plantas colgando a los lados del televisor */}
                <span className="absolute top-6 -left-3 sm:-left-5 text-lg sm:text-2xl -rotate-[18deg] opacity-90">🌿</span>
                <span className="absolute top-6 -right-3 sm:-right-5 text-lg sm:text-2xl rotate-[18deg] opacity-90">🌱</span>

                {/* antena */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                    <div className="w-0.5 h-5 bg-[#3A2F22] dark:bg-[#1A1510] origin-bottom -rotate-[20deg] rounded-full"></div>
                    <div className="w-0.5 h-5 bg-[#3A2F22] dark:bg-[#1A1510] origin-bottom rotate-[20deg] rounded-full"></div>
                </div>

                {/* cuerpo del televisor */}
                <div className="relative w-20 sm:w-32 bg-gradient-to-b from-[#8C6F4F] to-[#5D4E3F] dark:from-[#4A3E32] dark:to-[#2E2720] rounded-2xl p-2 sm:p-2.5 shadow-2xl border-2 border-[#3A2F22]">
                    {/* pantalla */}
                    <div className="relative aspect-square rounded-lg bg-black overflow-hidden border-2 border-[#2A2118] flex items-center justify-center">
                        {imagenValida && GIF_TV_MISTICO ? (
                            <img
                                src={GIF_TV_MISTICO}
                                alt=""
                                className="w-full h-full object-cover opacity-90"
                                onError={() => setImagenValida(false)}
                            />
                        ) : (
                            <span className="text-[7px] sm:text-[8px] text-[#8C6F4F] text-center px-2 font-mono tracking-widest">
                                SIN SEÑAL
                            </span>
                        )}
                        {/* líneas de escaneo, efecto tv vieja */}
                        <div
                            className="absolute inset-0 opacity-25 mix-blend-overlay"
                            style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.6) 0px, transparent 1px, transparent 2px)' }}
                        />
                        <div className="absolute inset-0 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]" />
                    </div>
                    {/* perillas */}
                    <div className="flex justify-end gap-1 mt-1.5">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#3A2F22] dark:bg-[#1A1510]"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#3A2F22] dark:bg-[#1A1510]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 🆕 Una tarjetita de estadística rápida, reutilizada 4 veces en la fila de KPIs.
function TarjetaKPI({ etiqueta, valor, color }) {
    return (
        <div className="bg-white dark:bg-black/20 rounded-2xl p-3 sm:p-4 border border-[#5D4E3F]/10 dark:border-white/10 min-w-0">
            <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black text-[#A68966] mb-1 truncate">{etiqueta}</p>
            <p className="text-sm sm:text-lg font-black truncate" style={color ? { color } : undefined}>{valor}</p>
        </div>
    );
}

// 🆕 Panel completo de "Informes de Cartera" — gráficas + observación financiera.
// Recibe todo ya calculado por props; no toca ningún dato ni función de pago.
function PanelInformesCartera({
    mesesData,
    desglose,
    observaciones,
    cantidadFacturas,
    promedioMensual,
    proximoVencimiento,
    obtenerAlertaVencimiento,
    onVolver,
}) {
    const maxMes = Math.max(1, ...mesesData.map(([, monto]) => monto));
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const formatearMes = (clave) => {
        const [anio, mes] = clave.split('-');
        const idx = parseInt(mes, 10) - 1;
        return `${nombresMeses[idx] ?? clave}`;
    };

    // 🆕 % pagado del total histórico, para la dona de progreso
    const pctPagado = desglose.total > 0 ? Math.round((desglose.pagado / desglose.total) * 100) : 0;

    return (
        <div className="relative bg-[#F4F1ED] dark:bg-[#3A322A] text-[#5D4E3F] dark:text-[#EDE4D3] p-4 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] shadow-sm border border-[#5D4E3F]/5 dark:border-white/10 overflow-hidden min-h-full">

            <TVMistico />

            <div className="flex items-center gap-3 mb-5 sm:mb-6 pr-24 sm:pr-32">
                <button
                    onClick={onVolver}
                    className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-black/20 border border-[#5D4E3F]/10 dark:border-white/10 shadow-sm flex items-center justify-center hover:scale-105 transition"
                    aria-label="Volver a mi cartera"
                >
                    ←
                </button>
                <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-black italic flex items-center gap-2 truncate">
                        📡 Informes de Cartera
                    </h3>
                    <p className="text-[9px] sm:text-[10px] opacity-60 italic">Una mirada mística a tus números</p>
                </div>
            </div>

            {/* 🆕 FILA DE KPIs RÁPIDOS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
                <TarjetaKPI etiqueta="Total Histórico" valor={`$${Number(desglose.total).toLocaleString()}`} />
                <TarjetaKPI etiqueta="Total Pagado" valor={`$${Number(desglose.pagado).toLocaleString()}`} color="#10b981" />
                <TarjetaKPI etiqueta="Saldo Pendiente" valor={`$${Number(desglose.abonado + desglose.pendiente).toLocaleString()}`} color="#FFBD2E" />
                <TarjetaKPI etiqueta="N° de Facturas" valor={cantidadFacturas} />
            </div>

            {/* OBSERVACIÓN FINANCIERA */}
            <div className="bg-[#5D4E3F] dark:bg-[#221D17] text-white rounded-[24px] p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#A68966]/20 blur-3xl rounded-full pointer-events-none" />
                <p className="text-[9px] uppercase tracking-[2px] font-bold text-[#FFD97D] mb-3 italic relative z-10">
                    🔮 Observación financiera
                </p>
                <div className="space-y-2 relative z-10">
                    {observaciones.length > 0 ? (
                        observaciones.map((obs, i) => (
                            <p key={i} className="text-[11px] sm:text-[12px] leading-relaxed opacity-90">
                                {obs}
                            </p>
                        ))
                    ) : (
                        <p className="text-[11px] opacity-70 italic">
                            Aún no hay suficiente historial para generar una observación.
                        </p>
                    )}
                    {promedioMensual > 0 && (
                        <p className="text-[11px] sm:text-[12px] leading-relaxed opacity-90">
                            Tu promedio de facturación mensual es de <strong>${Math.round(promedioMensual).toLocaleString()}</strong>.
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">

                {/* GRÁFICA DE BARRAS: facturación por mes */}
                <div className="bg-white dark:bg-black/20 rounded-[24px] p-4 sm:p-5 border border-[#5D4E3F]/10 dark:border-white/10">
                    <p className="text-[9px] uppercase tracking-wider font-black text-[#A68966] mb-4">
                        Facturación por mes
                    </p>
                    {mesesData.length > 0 ? (
                        <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-32 sm:h-40">
                            {mesesData.map(([clave, monto]) => (
                                <div key={clave} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5 min-w-0">
                                    <span className="text-[8px] sm:text-[9px] font-black opacity-60 whitespace-nowrap">
                                        ${Math.round(monto / 1000)}k
                                    </span>
                                    <div
                                        className="w-full max-w-[28px] sm:max-w-[36px] rounded-t-lg bg-gradient-to-t from-[#5D4E3F] to-[#A68966] dark:from-[#4A3E32] dark:to-[#A68966] transition-all duration-700"
                                        style={{ height: `${Math.max(6, (monto / maxMes) * 100)}%` }}
                                    />
                                    <span className="text-[8px] sm:text-[9px] font-bold opacity-50 uppercase whitespace-nowrap">
                                        {formatearMes(clave)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[11px] italic opacity-50 py-8 text-center">Sin historial suficiente todavía.</p>
                    )}
                </div>

                {/* 🆕 DONA DE PROGRESO: % pagado del total histórico */}
                <div className="bg-white dark:bg-black/20 rounded-[24px] p-4 sm:p-5 border border-[#5D4E3F]/10 dark:border-white/10 flex flex-col items-center justify-center">
                    <p className="text-[9px] uppercase tracking-wider font-black text-[#A68966] mb-4 self-start">
                        Progreso de pago
                    </p>
                    {desglose.total > 0 ? (
                        <div
                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full relative shrink-0"
                            style={{ background: `conic-gradient(#10b981 0% ${pctPagado}%, #FFBD2E ${pctPagado}% 100%)` }}
                        >
                            <div className="absolute inset-2.5 sm:inset-3 rounded-full bg-white dark:bg-[#221D17] flex flex-col items-center justify-center">
                                <span className="text-lg sm:text-xl font-black">{pctPagado}%</span>
                                <span className="text-[7px] sm:text-[8px] uppercase opacity-50 font-bold tracking-wider">Pagado</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[11px] italic opacity-50 py-8 text-center">Sin historial suficiente todavía.</p>
                    )}
                </div>

                {/* DESGLOSE POR ESTADO: barra apilada */}
                <div className="bg-white dark:bg-black/20 rounded-[24px] p-4 sm:p-5 border border-[#5D4E3F]/10 dark:border-white/10">
                    <p className="text-[9px] uppercase tracking-wider font-black text-[#A68966] mb-4">
                        Tu historial por estado
                    </p>
                    {desglose.total > 0 ? (
                        <>
                            <div className="flex w-full h-5 sm:h-6 rounded-full overflow-hidden shadow-inner mb-4">
                                {desglose.pagado > 0 && (
                                    <div className="bg-emerald-500 h-full" style={{ width: `${(desglose.pagado / desglose.total) * 100}%` }} />
                                )}
                                {desglose.abonado > 0 && (
                                    <div className="bg-blue-400 h-full" style={{ width: `${(desglose.abonado / desglose.total) * 100}%` }} />
                                )}
                                {desglose.pendiente > 0 && (
                                    <div className="bg-[#FFBD2E] h-full" style={{ width: `${(desglose.pendiente / desglose.total) * 100}%` }} />
                                )}
                            </div>
                            <div className="space-y-2 text-[10px] sm:text-[11px] font-bold">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Pagado</span>
                                    <span>${Number(desglose.pagado).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" /> Abonado</span>
                                    <span>${Number(desglose.abonado).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FFBD2E] shrink-0" /> Pendiente</span>
                                    <span>${Number(desglose.pendiente).toLocaleString()}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-[11px] italic opacity-50 py-8 text-center">Sin historial suficiente todavía.</p>
                    )}
                </div>

                {/* 🆕 PRÓXIMO VENCIMIENTO DESTACADO */}
                <div className="bg-white dark:bg-black/20 rounded-[24px] p-4 sm:p-5 border border-[#5D4E3F]/10 dark:border-white/10 flex flex-col">
                    <p className="text-[9px] uppercase tracking-wider font-black text-[#A68966] mb-4">
                        Próximo vencimiento
                    </p>
                    {proximoVencimiento ? (
                        <div className="flex-1 flex flex-col justify-center gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-black text-sm">Factura #{proximoVencimiento.id}</span>
                                {obtenerAlertaVencimiento(proximoVencimiento.fecha_vencimiento)}
                            </div>
                            <p className="text-[10px] opacity-60">Vence: {proximoVencimiento.fecha_vencimiento}</p>
                            <p className="text-xl font-black text-[#A68966]">
                                ${Number(proximoVencimiento.saldo_pendiente ?? proximoVencimiento.total).toLocaleString()}
                            </p>
                        </div>
                    ) : (
                        <p className="text-[11px] italic opacity-50 py-8 text-center flex-1 flex items-center justify-center">
                            No tienes facturas próximas a vencer. 🎉
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Cartera({ facturas = [] }) {
    const { auth } = usePage().props;
    const usuario = auth?.user || {};
    const [procesando, setProcesando] = useState(false);

    // 🆕 Las facturas ANULADAS (estado_factura_id === 4) nunca deben aparecer
    // en esta vista — ni en la tabla, ni en las tarjetas de móvil, ni en los
    // totales, ni en el conteo de "cobrables". Las filtramos aquí UNA sola
    // vez, antes de que el resto del componente las toque para nada.
    const facturasVisibles = facturas.filter(f => f.estado_factura_id !== 4);

    // Estado para almacenar las IDs de las facturas seleccionadas para pago múltiple
    const [seleccionadas, setSeleccionadas] = useState([]);

    // 🆕 NUEVO ESTADO: Almacena los montos específicos que el usuario decide abonar por cada factura
    // Se inicializa dinámicamente con el saldo_pendiente real de cada factura visible
    const [valoresAbono, setValoresAbono] = useState(() => {
        const inicial = {};
        facturasVisibles.forEach(f => {
            inicial[f.id] = Number(f.saldo_pendiente ?? f.total);
        });
        return inicial;
    });

    // Estados para controlar los modales personalizados de diseño
    const [modalConfig, setModalConfig] = useState({ visible: false, mensaje: '', tipo: 'info' });
    const [confirmConfig, setConfirmConfig] = useState({ visible: false, modoMasivo: false, facturaId: null });

    // 🆕 Controla si se está viendo la Cartera normal o el nuevo panel de Informes.
    // Puramente de presentación — no afecta ningún dato ni cálculo de pagos.
    const [vistaActiva, setVistaActiva] = useState('cartera'); // 'cartera' | 'informes'

    const nombreParaMostrar = usuario.name || "Usuario";

    // 🆕 CAMBIO: Filtrar las facturas que tengan saldo pendiente real (Pendientes = 1 o Abonadas = 3)
    // (ya parte de facturasVisibles, así que una anulada jamás puede colarse aquí)
    const facturasCobrables = facturasVisibles.filter(f => f.estado_factura_id === 1 || f.estado_factura_id === 3);

    // 🆕 CAMBIO: El total histórico de deuda ahora se calcula en base a lo que realmente falta por pagar (saldo_pendiente)
    const totalDeudaPendiente = facturasCobrables.reduce((sum, f) => sum + Number(f.saldo_pendiente ?? f.total), 0);

    // 🆕 TOTAL CORREGIDO: Suma los abonos específicos que el usuario digitó en los inputs para las facturas seleccionadas
    const totalSeleccionado = facturasCobrables
        .filter(f => seleccionadas.includes(f.id))
        
        .reduce((sum, f) => sum + Number(valoresAbono[f.id] || 0), 0);

    // ============================================================
    // 🆕 DATOS PARA EL PANEL DE INFORMES — todo esto es de solo lectura,
    // derivado de facturasVisibles. No modifica nada, no se usa en el
    // flujo de pago; solo alimenta las gráficas y la observación.
    // ============================================================
    const mesesData = useMemo(() => {
        const acumulado = {};
        facturasVisibles.forEach(f => {
            const fecha = f.fecha_emision || f.fecha_vencimiento || f.created_at;
            if (!fecha) return;
            const mes = String(fecha).slice(0, 7); // "2026-08"
            acumulado[mes] = (acumulado[mes] || 0) + Number(f.total || 0);
        });
        return Object.entries(acumulado)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6); // últimos 6 meses con movimientos
    }, [facturasVisibles]);

    const desglose = useMemo(() => {
        const pagado = facturasVisibles.filter(f => f.estado_factura_id === 2).reduce((s, f) => s + Number(f.total || 0), 0);
        const abonado = facturasVisibles.filter(f => f.estado_factura_id === 3).reduce((s, f) => s + Number(f.total || 0), 0);
        const pendiente = facturasVisibles.filter(f => f.estado_factura_id === 1).reduce((s, f) => s + Number(f.total || 0), 0);
        return { pagado, abonado, pendiente, total: pagado + abonado + pendiente };
    }, [facturasVisibles]);

    const facturasVencidas = useMemo(() => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return facturasCobrables.filter(f => {
            if (!f.fecha_vencimiento) return false;
            const v = new Date(f.fecha_vencimiento);
            v.setHours(0, 0, 0, 0);
            return v < hoy;
        });
    }, [facturasCobrables]);

    // 🆕 El promedio mensual de facturación, calculado sobre los mismos meses de la gráfica de barras
    const promedioMensual = useMemo(() => {
        if (mesesData.length === 0) return 0;
        const suma = mesesData.reduce((acc, [, monto]) => acc + monto, 0);
        return suma / mesesData.length;
    }, [mesesData]);

    // 🆕 La factura cobrable más urgente por fecha de vencimiento (vencida o próxima a vencer)
    const proximoVencimiento = useMemo(() => {
        const conFecha = facturasCobrables.filter(f => f.fecha_vencimiento);
        if (conFecha.length === 0) return null;
        return [...conFecha].sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))[0];
    }, [facturasCobrables]);

    const observaciones = useMemo(() => {
        const lista = [];

        if (desglose.total > 0) {
            const pct = Math.round((desglose.pagado / desglose.total) * 100);
            lista.push(`Has cubierto el ${pct}% de tu historial de facturación con Mouren.`);
        }

        if (facturasVencidas.length > 0) {
            const totalVencido = facturasVencidas.reduce((s, f) => s + Number(f.saldo_pendiente ?? f.total), 0);
            lista.push(`Tienes ${facturasVencidas.length} factura${facturasVencidas.length > 1 ? 's' : ''} vencida${facturasVencidas.length > 1 ? 's' : ''} por $${totalVencido.toLocaleString()}. Ponte al día cuando puedas para evitar contratiempos.`);
        } else if (facturasCobrables.length > 0) {
            lista.push('Vas al día: ninguna de tus facturas pendientes está vencida todavía.');
        }

        if (mesesData.length >= 2) {
            const ultimo = mesesData[mesesData.length - 1][1];
            const anterior = mesesData[mesesData.length - 2][1];
            if (ultimo > anterior) {
                lista.push('Tu facturación del último mes fue mayor que la del mes anterior.');
            } else if (ultimo < anterior) {
                lista.push('Tu facturación del último mes fue menor que la del mes anterior.');
            }
        }

        return lista;
    }, [desglose, facturasVencidas, facturasCobrables, mesesData]);

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
                <span className="inline-block px-2 py-0.5 bg-red-200 text-red-900 font-black rounded-md text-[9px] uppercase tracking-wider animate-pulse whitespace-nowrap">
                    Vencida ({Math.abs(diasRestantes)}d)
                </span>
            );
        } else if (diasRestantes === 0) {
            return (
                <span className="inline-block px-2 py-0.5 bg-red-500 text-white font-black rounded-md text-[9px] uppercase tracking-wider animate-pulse whitespace-nowrap">
                    ¡Vence Hoy! ⚠️
                </span>
            );
        } else if (diasRestantes === 1) {
            return (
                <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 font-black rounded-md text-[9px] uppercase tracking-wider whitespace-nowrap">
                    Vence Mañana
                </span>
            );
        } else if (diasRestantes <= 3) {
            return (
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 font-black rounded-md text-[9px] uppercase tracking-wider whitespace-nowrap">
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
        <div className="min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] dark:text-[#EDE4D3] bg-[#FFFFFF] dark:bg-[#221D17] flex flex-col md:flex-row overflow-x-hidden relative">
            <Head title="Estado de Cuenta - Mouren" />

            <Sidebar />

            <main className="flex-1 w-full min-w-0 p-4 sm:p-6 md:p-10 content-shift transition-all duration-700 ease-in-out">
                {/* ENCABEZADO */}
                <header className="flex flex-wrap justify-between items-start gap-3 mb-6 sm:mb-10 animate-fade-in">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter leading-tight">
                            Estado de Cuenta
                        </h1>
                        <p className="text-[10px] sm:text-[11px] italic opacity-70 mt-1 break-words">Suscripciones y previsión exequial de {nombreParaMostrar}</p>
                    </div>

                    {/* 🆕 Botón que desliza la pantalla hacia el panel de Informes */}
                    <button
                        onClick={() => setVistaActiva(vistaActiva === 'cartera' ? 'informes' : 'cartera')}
                        className="shrink-0 flex items-center gap-2 bg-[#5D4E3F] dark:bg-[#A68966] text-white px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-[#4A3E32] dark:hover:bg-[#8e7253] transition active:scale-95"
                    >
                        {vistaActiva === 'cartera' ? '📡 Ver Informes' : '← Volver a mi Cartera'}
                    </button>
                </header>

                {/* 🆕 CONTENEDOR DESLIZANTE: la Cartera y los Informes viven uno al lado
                    del otro dentro de una franja del doble de ancho; al cambiar de vista,
                    solo se traslada esa franja — nada de la lógica de pagos se recalcula
                    ni se desmonta, ambos paneles existen todo el tiempo. */}
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-700 ease-in-out"
                        style={{ width: '200%', transform: vistaActiva === 'informes' ? 'translateX(-50%)' : 'translateX(0%)' }}
                    >
                        {/* ======================= PANEL 1: CARTERA (tal cual ya la tenías) ======================= */}
                        <div style={{ width: '50%' }} className="pr-0 lg:pr-3">
                            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

                                {/* SECCIÓN 1: RESUMEN DE CARTERA INTELIGENTE */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                    <div className="md:col-span-2 bg-[#5D4E3F] text-white p-5 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                                        <img src="/images/elementos_dashboard/flores_main.webp" className="absolute -top-6 -right-8 sm:-top-8 sm:-right-12 w-32 sm:w-[200px] opacity-40 pointer-events-none" alt="" />

                                        <div>
                                            <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[2px] sm:tracking-[3px] font-bold text-[#FFD97D] mb-2 italic">Estado de Cartera</h3>
                                            <h2 className="text-lg sm:text-2xl font-black">
                                                {totalDeudaPendiente > 0 ? 'Tienes saldos pendientes' : '¡Te encuentras al día!'}
                                            </h2>
                                            <p className="text-[10px] sm:text-[11px] opacity-70 mt-1">
                                                {seleccionadas.length > 0
                                                    ? `Has seleccionado ${seleccionadas.length} obligaciones para procesar abonos parciales o totales.`
                                                    : 'Selecciona las facturas de la tabla inferior. Si superan los $60.000 puedes escribir el monto parcial que deseas abonar.'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mt-4">
                                            <div>
                                                <p className="text-[9px] uppercase opacity-60 font-bold">Total Saldo Pendiente</p>
                                                <p className="text-lg sm:text-xl font-bold opacity-90">${Number(totalDeudaPendiente).toLocaleString()}</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-[9px] uppercase text-[#FFD97D] font-bold">Total del Abono a Enviar</p>
                                                <p className="text-2xl sm:text-3xl font-black text-[#FFBD2E]">${Number(totalSeleccionado).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACCIONES MASIVAS Y BOTÓN DE PAGO */}
                                    <div className="bg-[#D3CAB6] dark:bg-[#3A322A] text-[#5D4E3F] dark:text-[#EDE4D3] p-5 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] shadow-md flex flex-col justify-between text-left">
                                        <div>
                                            <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[2px] font-bold opacity-60 mb-3">Acciones de Pago</h4>
                                            {seleccionadas.length > 0 ? (
                                                <div className="space-y-3">
                                                    <div className="space-y-1 text-[11px] font-bold opacity-80">
                                                        <p>📦 Cuotas marcadas: <span className="opacity-100 font-black">{seleccionadas.length}</span></p>
                                                        <p>💰 Monto de abono: <span className="text-[#6E5D4F] dark:text-[#FFD97D] font-black">${Number(totalSeleccionado).toLocaleString()}</span></p>
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
                                                <div className="space-y-2 text-[11px] font-bold opacity-70 italic py-2 sm:py-4">
                                                    <p>No has marcado ningún elemento.</p>
                                                    <p className="text-[10px] opacity-50 font-normal">Usa las casillas de la tabla para abonar múltiples obligaciones a la vez.</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-4 border-t border-[#5D4E3F]/10 dark:border-white/10 text-[9px] uppercase tracking-wider opacity-60 italic">
                                            Mouren Previsión Pasarela
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN 2: TABLA CON CHECKBOXES E INDICADORES DE TIEMPO */}
                                <div className="bg-[#F4F1ED] dark:bg-[#3A322A] text-[#5D4E3F] dark:text-[#EDE4D3] p-4 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] shadow-sm border border-[#5D4E3F]/5 dark:border-white/10">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#5D4E3F]/10 dark:border-white/10 pb-4">
                                        <h3 className="text-base sm:text-lg font-black italic flex items-center gap-2">
                                            Historial de Facturación 📜
                                        </h3>
                                        <button
                                            onClick={descargarEstadoCuenta}
                                            className="w-full sm:w-auto px-4 py-2 bg-[#5D4E3F] dark:bg-[#5D4E3F] text-white rounded-2xl text-[11px] font-black tracking-wider uppercase hover:bg-[#4A3E32] transition shadow-sm flex items-center justify-center gap-2"
                                        >
                                            📥 Descargar Estado de Cuenta
                                        </button>
                                    </div>

                                    {/* 📱 VISTA MÓVIL: tarjetas apiladas, una por factura (ya sin anuladas) */}
                                    <div className="md:hidden space-y-4">
                                        {facturasVisibles.length > 0 ? (
                                            facturasVisibles.map((factura) => {
                                                const esCobrable = factura.estado_factura_id === 1 || factura.estado_factura_id === 3;
                                                const saldoReal = Number(factura.saldo_pendiente ?? factura.total);
                                                const permiteAbonosParciales = Number(factura.total) > 60000;

                                                return (
                                                    <div key={factura.id} className="bg-white/70 dark:bg-black/20 border border-[#5D4E3F]/10 dark:border-white/10 rounded-[24px] p-4 shadow-sm">
                                                        <div className="flex justify-between items-start gap-2 mb-3">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {esCobrable ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={seleccionadas.includes(factura.id)}
                                                                        onChange={() => handleSeleccionarFactura(factura.id)}
                                                                        className="rounded border-[#5D4E3F]/30 text-[#5D4E3F] focus:ring-[#5D4E3F] shrink-0"
                                                                    />
                                                                ) : (
                                                                    <span className="text-emerald-600 text-xs shrink-0">✔</span>
                                                                )}
                                                                <span className="font-black text-sm">Factura #{factura.id}</span>
                                                            </div>
                                                            <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-black whitespace-nowrap shrink-0 ${
                                                                factura.estado_factura_id === 1
                                                                    ? 'bg-[#FFD97D]/30 text-[#8C6F4F]'
                                                                    : factura.estado_factura_id === 3
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-emerald-100 text-emerald-800'
                                                            }`}>
                                                                {factura.estado_factura_id === 1 ? 'Pendiente' : factura.estado_factura_id === 3 ? 'Abonado' : 'Pagado'}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between items-center mb-3 text-[11px]">
                                                            <span className="opacity-70">Vence: {factura.fecha_vencimiento}</span>
                                                            {esCobrable && obtenerAlertaVencimiento(factura.fecha_vencimiento)}
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                                                            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2">
                                                                <p className="text-[8px] uppercase opacity-50 font-bold">Total</p>
                                                                <p className="text-[11px] font-black opacity-70">${Number(factura.total).toLocaleString()}</p>
                                                            </div>
                                                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2">
                                                                <p className="text-[8px] uppercase opacity-50 font-bold">Pagado</p>
                                                                <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">${Number(factura.monto_pagado ?? 0).toLocaleString()}</p>
                                                            </div>
                                                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2">
                                                                <p className="text-[8px] uppercase opacity-50 font-bold">Por Pagar</p>
                                                                <p className="text-[11px] font-black text-red-600 dark:text-red-400">${saldoReal.toLocaleString()}</p>
                                                            </div>
                                                        </div>

                                                        {esCobrable && (
                                                            <div className="mb-3">
                                                                <p className="text-[9px] uppercase opacity-50 font-bold mb-1">¿Cuánto deseas abonar?</p>
                                                                {permiteAbonosParciales ? (
                                                                    <div className="flex items-center bg-white dark:bg-black/30 border border-[#5D4E3F]/20 dark:border-white/10 rounded-lg px-3 py-2 shadow-inner">
                                                                        <span className="text-xs opacity-50 mr-1">$</span>
                                                                        <input
                                                                            type="number"
                                                                            value={valoresAbono[factura.id] ?? ''}
                                                                            onChange={(e) => handleCambioMontoAbono(factura.id, e.target.value, saldoReal)}
                                                                            className="w-full bg-transparent border-none p-0 text-sm text-right focus:ring-0 text-[#5D4E3F] dark:text-[#EDE4D3] font-black"
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[11px] opacity-50 italic">Valor Fijo Obligatorio</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#5D4E3F]/10 dark:border-white/10">
                                                            <button
                                                                onClick={() => descargarPDF(factura.id)}
                                                                className="flex-1 min-w-[88px] py-2 bg-white dark:bg-white/10 rounded-xl shadow-sm hover:scale-[1.02] transition border border-[#5D4E3F]/10 dark:border-white/10 text-[11px] font-bold flex items-center justify-center gap-1.5"
                                                            >
                                                                📄 PDF
                                                            </button>
                                                            {factura.ultimo_pago_id && (
                                                                <a
                                                                    href={`/cliente/pagos/${factura.ultimo_pago_id}/comprobante`}
                                                                    className="flex-1 min-w-[88px] py-2 bg-white dark:bg-white/10 rounded-xl shadow-sm hover:scale-[1.02] transition border border-[#5D4E3F]/10 dark:border-white/10 text-[11px] font-bold flex items-center justify-center gap-1.5"
                                                                >
                                                                    🧾 Comprobante
                                                                </a>
                                                            )}
                                                            {esCobrable && (
                                                                <button
                                                                    onClick={() => abrirModalConfirmacion(false, factura.id)}
                                                                    disabled={procesando || (valoresAbono[factura.id] || 0) <= 0}
                                                                    className="flex-1 min-w-[88px] py-2 bg-[#302A1D] text-white rounded-xl text-[11px] tracking-wider uppercase font-black hover:bg-[#4A3E32] transition disabled:opacity-50"
                                                                >
                                                                    Pagar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="py-10 text-center opacity-50 italic text-xs">
                                                No se registran movimientos ni facturas en tu historial.
                                            </p>
                                        )}
                                    </div>

                                    {/* 🖥️ VISTA ESCRITORIO/TABLET: tabla completa (ya sin anuladas) */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full min-w-[820px] text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b-2 border-[#5D4E3F]/20 dark:border-white/20 text-[10px] uppercase tracking-wider opacity-60">
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
                                                {facturasVisibles.length > 0 ? (
                                                    facturasVisibles.map((factura) => {
                                                        // Se permite pagar si el estado es Pendiente (1) o Abonado (3)
                                                        const esCobrable = factura.estado_factura_id === 1 || factura.estado_factura_id === 3;
                                                        const saldoReal = Number(factura.saldo_pendiente ?? factura.total);
                                                        // Condición solicitada: Habilitar abonos parciales si el total original supera los $60.000
                                                        const permiteAbonosParciales = Number(factura.total) > 60000;

                                                        return (
                                                            <tr key={factura.id} className="border-b border-[#5D4E3F]/10 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/20 transition-all font-bold">
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
                                                                <td className="py-4 px-2 space-x-2 whitespace-nowrap">
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
                                                                            <div className="flex items-center bg-white dark:bg-black/30 border border-[#5D4E3F]/20 dark:border-white/10 rounded-lg px-2 py-1 max-w-[130px] mx-auto shadow-inner">
                                                                                <span className="text-[10px] opacity-50 mr-1">$</span>
                                                                                <input
                                                                                    type="number"
                                                                                    value={valoresAbono[factura.id] ?? ''}
                                                                                    onChange={(e) => handleCambioMontoAbono(factura.id, e.target.value, saldoReal)}
                                                                                    className="w-full bg-transparent border-none p-0 text-xs text-right focus:ring-0 text-[#5D4E3F] dark:text-[#EDE4D3] font-black"
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
                                                                    <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-wider font-black whitespace-nowrap ${
                                                                        factura.estado_factura_id === 1
                                                                            ? 'bg-[#FFD97D]/30 text-[#8C6F4F]'
                                                                            : factura.estado_factura_id === 3
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : 'bg-emerald-100 text-emerald-800'
                                                                    }`}>
                                                                        {factura.estado_factura_id === 1 ? 'Pendiente' : factura.estado_factura_id === 3 ? 'Abonado' : 'Pagado'}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-2 text-center">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <button
                                                                            onClick={() => descargarPDF(factura.id)}
                                                                            className="p-2 bg-white dark:bg-white/10 rounded-xl shadow-sm hover:scale-105 transition border border-[#5D4E3F]/10 dark:border-white/10"
                                                                            title="Descargar PDF"
                                                                        >
                                                                            📄
                                                                        </button>

                                                                        {factura.ultimo_pago_id && (
                                                                            <a
                                                                                href={`/cliente/pagos/${factura.ultimo_pago_id}/comprobante`}
                                                                                className="p-2 bg-white dark:bg-white/10 rounded-xl shadow-sm hover:scale-105 transition border border-[#5D4E3F]/10 dark:border-white/10"
                                                                                title="Descargar comprobante de pago"
                                                                            >
                                                                                🧾
                                                                            </a>
                                                                        )}

                                                                        {esCobrable && (
                                                                            <button
                                                                                onClick={() => abrirModalConfirmacion(false, factura.id)}
                                                                                disabled={procesando || (valoresAbono[factura.id] || 0) <= 0}
                                                                                className="px-3 py-1.5 bg-[#302A1D] text-white rounded-xl text-[10px] tracking-wider uppercase font-black hover:bg-[#4A3E32] transition disabled:opacity-50 whitespace-nowrap"
                                                                            >
                                                                                Pagar
                                                                            </button>
                                                                        )}
                                                                    </div>
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
                        </div>

                        {/* ======================= PANEL 2: INFORMES (nuevo) ======================= */}
                        <div style={{ width: '50%' }} className="pl-0 lg:pl-3">
                            <div className="max-w-5xl mx-auto">
                                <PanelInformesCartera
                                    mesesData={mesesData}
                                    desglose={desglose}
                                    observaciones={observaciones}
                                    cantidadFacturas={facturasVisibles.length}
                                    promedioMensual={promedioMensual}
                                    proximoVencimiento={proximoVencimiento}
                                    obtenerAlertaVencimiento={obtenerAlertaVencimiento}
                                    onVolver={() => setVistaActiva('cartera')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL 1: ALERTA PERSONALIZADA */}
            {modalConfig.visible && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-[#F4F1ED] dark:bg-[#2E2720] border border-[#5D4E3F]/20 dark:border-white/10 max-w-sm w-full p-6 rounded-[35px] shadow-2xl text-center space-y-4">
                        <div className="text-2xl">
                            {modalConfig.tipo === 'success' ? '✨' : modalConfig.tipo === 'error' ? '❌' : 'ℹ️'}
                        </div>
                        <p className="text-xs font-bold text-[#5D4E3F] dark:text-[#EDE4D3] leading-relaxed">
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
                    <div className="bg-[#F4F1ED] dark:bg-[#2E2720] border border-[#5D4E3F]/20 dark:border-white/10 max-w-sm w-full p-6 rounded-[35px] shadow-2xl text-center space-y-5">
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
                                className="flex-1 py-2 bg-transparent border border-[#5D4E3F]/30 dark:border-white/20 text-[#5D4E3F] dark:text-[#EDE4D3] text-[10px] tracking-wider uppercase font-black rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition"
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
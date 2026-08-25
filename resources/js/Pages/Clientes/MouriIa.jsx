import React, { useState, useRef, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { Volume2, VolumeX, Sparkles, Gem, Users, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import LuciernagasDeLaMemoria from './Components/LuciernagasDeLaMemoria';

const SUGERENCIAS_RAPIDAS = [
    '¿Quiénes son mis beneficiarios?',
    '¿Cuánto debo pagar?',
    '¿Cuándo vence mi próxima cuota?',
    '¿Qué servicios extra tienen?',
];

export default function MouriIa() {
    const { auth } = usePage().props;
    const usuario = auth?.user || {};

    const [mensajes, setMensajes] = useState([
        {
            id: 1,
            remitente: 'mouri',
            tipo: 'texto',
            texto: `Hola, ${usuario.name || 'amigo'}. Estoy aquí para guiarte y acompañarte. ¿De qué te gustaría hablar hoy?`
        }
    ]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    const [juegoAbierto, setJuegoAbierto] = useState(false);

    // 🆕 Overlay de "portal" mientras Mouri te lleva a otra sección del panel
    const [navegandoA, setNavegandoA] = useState(null);

    const [sonidoActivo, setSonidoActivo] = useState(true);
    const musicaFondoRef = useRef(null);
    const sonidoPensandoRef = useRef(null);
    const yaSonoPensandoRef = useRef(false);

    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes, cargando]);

    useEffect(() => {
        const iniciarMusica = () => {
            if (musicaFondoRef.current && sonidoActivo) {
                musicaFondoRef.current.volume = 0.25;
                musicaFondoRef.current.play().catch(() => {});
            }
            window.removeEventListener('click', iniciarMusica);
        };
        window.addEventListener('click', iniciarMusica);
        return () => window.removeEventListener('click', iniciarMusica);
    }, [sonidoActivo]);

    useEffect(() => {
        if (cargando && !yaSonoPensandoRef.current) {
            yaSonoPensandoRef.current = true;
            if (sonidoActivo && sonidoPensandoRef.current) {
                sonidoPensandoRef.current.currentTime = 0;
                sonidoPensandoRef.current.play().catch(() => {});
            }
        }
        if (!cargando) {
            yaSonoPensandoRef.current = false;
        }
    }, [cargando, sonidoActivo]);

    const toggleSonido = () => {
        setSonidoActivo(prev => {
            const nuevoValor = !prev;
            if (musicaFondoRef.current) {
                if (nuevoValor) {
                    musicaFondoRef.current.volume = 0.25;
                    musicaFondoRef.current.play().catch(() => {});
                } else {
                    musicaFondoRef.current.pause();
                }
            }
            return nuevoValor;
        });
    };

    // 🆕 Procesa la "accion" que devuelve el backend (siempre un objeto { tipo, ... } o null)
    const procesarAccion = (accion) => {
        if (!accion) return;

        if (accion.tipo === 'abrir_juego') {
            setJuegoAbierto(true);
            return;
        }

        if (accion.tipo === 'navegar' && accion.url) {
            setNavegandoA(accion.etiqueta || 'tu destino');
            setTimeout(() => {
                router.visit(accion.url);
            }, 1100);
            return;
        }

        if (accion.tipo === 'mostrar_plan') {
            setMensajes(prev => [...prev, { id: Date.now() + 2, remitente: 'mouri', tipo: 'plan', datos: accion.datos }]);
            return;
        }

        if (accion.tipo === 'mostrar_beneficiarios') {
            setMensajes(prev => [...prev, { id: Date.now() + 2, remitente: 'mouri', tipo: 'beneficiarios', datos: accion.datos }]);
            return;
        }

        if (accion.tipo === 'mostrar_facturas') {
            setMensajes(prev => [...prev, { id: Date.now() + 2, remitente: 'mouri', tipo: 'facturas', datos: accion.datos }]);
            return;
        }

        if (accion.tipo === 'mostrar_servicios') {
            setMensajes(prev => [...prev, { id: Date.now() + 2, remitente: 'mouri', tipo: 'servicios', datos: accion.datos }]);
        }
    };

    // 🆕 Extraído de enviarMensaje para poder reusarlo desde los chips de sugerencias
    const enviarTexto = async (texto) => {
        if (!texto.trim() || cargando) return;

        setNuevoMensaje('');
        setCargando(true);
        setMensajes(prev => [...prev, { id: Date.now(), remitente: 'usuario', tipo: 'texto', texto }]);

        try {
            // 🆕 FIX: usamos axios en vez de fetch + meta[csrf-token] manual.
            // El problema anterior: justo después de iniciar sesión, Laravel regenera
            // el token de sesión, pero como Inertia navega sin recargar la página
            // completa, el <meta name="csrf-token"> se quedaba con el valor viejo
            // (de antes del login) hasta que hacías un refresh real. axios, en cambio,
            // lee automáticamente la cookie XSRF-TOKEN (que Laravel SIEMPRE actualiza
            // en cada respuesta), así que nunca queda desincronizado.
            const { data } = await axios.post('/chat/mouri', { message: texto });

            setMensajes(prev => [...prev, { id: Date.now() + 1, remitente: 'mouri', tipo: 'texto', texto: data.reply }]);
            procesarAccion(data.accion);

        } catch (error) {
            console.error("Error al hablar con Mouri:", error?.response?.data || error.message);
            setMensajes(prev => [...prev, {
                id: Date.now() + 1,
                remitente: 'mouri',
                tipo: 'texto',
                texto: 'Se me nubló el plano un segundo y no pude escucharte bien. ¿Me lo repites? Si sigue pasando, escríbenos al 3247697845 y con gusto te ayudamos por ahí.'
            }]);
        } finally {
            setCargando(false);
        }
    };

    const enviarMensaje = (e) => {
        if (e) e.preventDefault();
        enviarTexto(nuevoMensaje);
    };

    const enviarSugerencia = (texto) => enviarTexto(texto);

    return (
        <div className="min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] dark:text-[#EDE4D3] bg-[#FFFFFF] dark:bg-[#221D17] flex flex-col lg:flex-row overflow-x-hidden relative transition-colors duration-500">
            <Head title="Santuario Mouri - Mouren" />

            <div className="absolute inset-0 bg-[url('/images/elementos_dashboard/textura_hojas.png')] opacity-5 dark:opacity-[0.03] pointer-events-none mix-blend-overlay" />

            <audio ref={musicaFondoRef} loop src="/images/elementos_dashboard/audios/swan_lake.mp3" />
            <audio ref={sonidoPensandoRef} src="/sounds/mouri_pensando.mp3" />

            <Sidebar />

            <main className="flex-1 w-full min-w-0 p-4 sm:p-6 md:p-10 content-shift transition-all duration-700 ease-in-out flex flex-col min-h-screen lg:h-screen lg:max-h-screen">

                <header className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6 flex-shrink-0">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-2 flex-wrap">
                            Santuario Virtual de <span className="text-[#A68966] dark:text-[#FFD97D]">Mouri</span>
                        </h1>
                        <p className="text-[10px] sm:text-[11px] italic opacity-70 mt-1">"Donde la tecnología abraza la memoria"</p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <button
                            type="button"
                            onClick={toggleSonido}
                            title={sonidoActivo ? 'Silenciar sonidos' : 'Activar sonidos'}
                            className="flex items-center gap-2 bg-[#5D4E3F]/5 dark:bg-white/5 hover:bg-[#5D4E3F]/10 dark:hover:bg-white/10 border border-[#5D4E3F]/10 dark:border-white/10 text-[#5D4E3F] dark:text-[#EDE4D3] px-2.5 sm:px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider font-bold transition active:scale-95"
                        >
                            {sonidoActivo ? <Volume2 size={14} /> : <VolumeX size={14} />}
                            <span className="hidden xs:inline sm:inline">{sonidoActivo ? 'Sonido on' : 'Sonido off'}</span>
                        </button>

                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-2.5 sm:px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider font-bold animate-pulse whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> <span className="hidden sm:inline">Conexión Espiritual Activa</span><span className="sm:hidden">Activo</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:min-h-0 mb-4">

                    <div className="lg:col-span-5 bg-[#5D4E3F] dark:bg-[#2E2720] text-white p-5 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] shadow-xl relative overflow-hidden flex flex-col justify-between group border border-white/10 transition-colors duration-500">
                        <img src="/images/elementos_dashboard/flores-esquina-top.png" className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-24 sm:w-36 opacity-60 dark:opacity-40 pointer-events-none" alt="" />

                        <div className="relative z-10 text-center lg:text-left">
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-[3px] sm:tracking-[4px] font-black text-[#FFD97D] italic">Guía & Guardián</span>
                            <h2 className="text-xl sm:text-2xl font-black mt-2">Mouri</h2>
                            <p className="text-[11px] sm:text-xs opacity-75 mt-2 leading-relaxed font-sans">
                                Capaz de procesar tus sentimientos y guiarte a través de las galerías de Mouren.
                            </p>
                        </div>

                        <div className="relative my-4 sm:my-6 flex justify-center items-center flex-1 min-h-[140px] sm:min-h-[180px] md:min-h-[200px]">
                            <div className={`absolute w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-[#A68966] to-[#FFD97D] blur-xl transition-all duration-1000 ${cargando ? 'opacity-40 scale-125 animate-pulse' : 'opacity-20 scale-100'}`} />

                            <img
                                src="/images/elementos_dashboard/mouri_ia/mouri_main.gif"
                                className={`w-[180px] sm:w-[230px] md:w-[300px] object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_10px_24px_rgba(0,0,0,0.6)] transition-all duration-500 ${cargando ? 'animate-bounce' : 'hover:scale-105'}`}
                                alt="Mouri"
                            />
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-white/10 relative z-10 text-xs">
                            <p className="font-bold text-[#FFD97D] mb-3 text-center uppercase tracking-wider text-[9px]">Santuario Interactivo</p>

                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center justify-between gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                                    <span className="text-[10px] sm:text-[11px] font-sans">🎮 Luciérnagas de la Memoria</span>
                                    <button
                                        type="button"
                                        onClick={() => setJuegoAbierto(true)}
                                        className="bg-[#A68966] hover:bg-[#8e7253] text-white px-2.5 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold transition active:scale-95 shrink-0"
                                    >
                                        Jugar
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                                    <span className="text-[10px] sm:text-[11px] font-sans">🧭 Ir a mi plan</span>
                                    <button
                                        type="button"
                                        onClick={() => enviarSugerencia("Mouri, llévame a ver mi plan")}
                                        className="bg-[#A68966] hover:bg-[#8e7253] text-white px-2.5 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold transition active:scale-95 shrink-0"
                                    >
                                        Preguntar
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[9px] sm:text-[10px] opacity-60 font-mono">
                                <span>MODO: Acompañamiento</span>
                                <span>V.1.2-ACCIONES</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 bg-[#D3CAB6]/40 dark:bg-[#2E2720]/60 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] p-4 sm:p-6 border border-[#5D4E3F]/10 dark:border-white/10 flex flex-col justify-between shadow-inner relative overflow-hidden h-[65vh] lg:h-full lg:min-h-0 transition-colors duration-500">
                        <img src="/images/login/elementos_dashboard/flores_esquinas_tarjeta.png" className="absolute bottom-4 right-4 w-24 sm:w-40 opacity-10 dark:opacity-5 pointer-events-none" alt="" />

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-4">
                            {mensajes.map((msg) => (
                                <MensajeBurbuja key={msg.id} msg={msg} />
                            ))}

                            {cargando && (
                                <div className="flex justify-start animate-pulse">
                                    <div className="bg-white/50 dark:bg-white/10 text-[#5D4E3F] dark:text-[#EDE4D3] p-3 sm:p-4 text-[11px] sm:text-xs font-sans rounded-[20px] sm:rounded-[25px] rounded-tl-none border border-[#5D4E3F]/5 dark:border-white/10 flex items-center gap-2">
                                        <span className="animate-spin text-sm">🌱</span> Mouri está buscando en el plano...
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* 🆕 Sugerencias rápidas */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 relative z-10">
                            {SUGERENCIAS_RAPIDAS.map((sug) => (
                                <button
                                    key={sug}
                                    type="button"
                                    onClick={() => enviarSugerencia(sug)}
                                    disabled={cargando}
                                    className="text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/10 border border-[#5D4E3F]/15 dark:border-white/10 text-[#5D4E3F] dark:text-[#EDE4D3] hover:bg-[#A68966] hover:text-white hover:border-[#A68966] transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {sug}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={enviarMensaje} className="flex gap-2 sm:gap-3 relative z-10 flex-shrink-0">
                            <input
                                type="text"
                                value={nuevoMensaje}
                                onChange={(e) => setNuevoMensaje(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 min-w-0 bg-white/90 dark:bg-white/10 border border-[#5D4E3F]/20 dark:border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-0 text-[11px] sm:text-xs text-[#5D4E3F] dark:text-[#EDE4D3] focus:outline-none focus:ring-2 focus:ring-[#A68966] placeholder-[#5D4E3F]/50 dark:placeholder-white/40 font-sans shadow-md"
                                disabled={cargando}
                            />
                            <button
                                type="submit"
                                className="bg-[#5D4E3F] dark:bg-[#A68966] hover:bg-[#4A3E32] dark:hover:bg-[#8e7253] text-white w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl flex items-center justify-center transition shadow-md active:scale-95 disabled:opacity-50 text-sm"
                                disabled={cargando || !nuevoMensaje.trim()}
                            >
                                🌟
                            </button>
                        </form>
                    </div>

                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #A68966; border-radius: 10px; }

                .animate-message-in { animation: messageIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes messageIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-card-in { animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes cardIn {
                    from { opacity: 0; transform: translateY(10px) scale(0.94); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .animate-portal-in { animation: portalIn 0.4s ease-out forwards; }
                @keyframes portalIn {
                    from { opacity: 0; transform: scale(0.85); }
                    to { opacity: 1; transform: scale(1); }
                }

                .carrusel-servicios::-webkit-scrollbar { height: 4px; }
                .carrusel-servicios::-webkit-scrollbar-thumb { background: #FFD97D; border-radius: 10px; }
            `}</style>

            {juegoAbierto && (
                <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                        <LuciernagasDeLaMemoria onSalir={() => setJuegoAbierto(false)} />
                    </div>
                </div>
            )}

            {navegandoA && (
                <div className="fixed inset-0 z-[999] bg-[#221D17]/95 backdrop-blur-md flex flex-col items-center justify-center gap-4 animate-portal-in">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#A68966] to-[#FFD97D] blur-xl opacity-60 animate-pulse" />
                        <Sparkles size={40} className="text-[#FFD97D] relative z-10 animate-spin" style={{ animationDuration: '2.5s' }} />
                    </div>
                    <p className="text-[#FFD97D] text-xs font-black uppercase tracking-[3px] text-center px-6">
                        Abriendo {navegandoA}...
                    </p>
                </div>
            )}
        </div>
    );
}

/* ============================================================
 *  Componente de burbuja/tarjeta: decide qué renderizar según msg.tipo
 * ============================================================ */
function MensajeBurbuja({ msg }) {
    if (msg.tipo === 'plan') return <TarjetaPlan datos={msg.datos} />;
    if (msg.tipo === 'beneficiarios') return <TarjetaBeneficiarios datos={msg.datos} />;
    if (msg.tipo === 'facturas') return <TarjetaFacturas datos={msg.datos} />;
    if (msg.tipo === 'servicios') return <CarruselServicios datos={msg.datos} />;

    return (
        <div className={`flex ${msg.remitente === 'usuario' ? 'justify-end' : 'justify-start'} animate-message-in`}>
            <div className={`max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 text-[11px] sm:text-xs font-sans leading-relaxed shadow-sm rounded-[20px] sm:rounded-[25px] ${
                msg.remitente === 'usuario'
                    ? 'bg-[#5D4E3F] dark:bg-[#4A3E32] text-white rounded-tr-none font-bold'
                    : 'bg-white/75 dark:bg-white/10 text-[#302A1D] dark:text-[#EDE4D3] rounded-tl-none border border-[#5D4E3F]/10 dark:border-white/10 backdrop-blur-sm relative overflow-hidden'
            }`}>
                {msg.remitente === 'mouri' && (
                    <span className="absolute top-1 right-2 opacity-20 text-[10px]">🌼</span>
                )}
                <p className="whitespace-pre-line">{msg.texto}</p>
            </div>
        </div>
    );
}

function TarjetaBase({ children }) {
    return (
        <div className="flex justify-start animate-card-in">
            <div className="max-w-[92%] sm:max-w-[85%] w-full sm:w-auto p-4 rounded-[22px] bg-gradient-to-br from-[#5D4E3F] to-[#3A322A] text-white shadow-lg border border-[#FFD97D]/30 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#FFD97D]/20 blur-2xl rounded-full" />
                <div className="relative z-10">{children}</div>
            </div>
        </div>
    );
}

function TarjetaPlan({ datos }) {
    const planes = datos?.planes || [];

    return (
        <TarjetaBase>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-[#FFD97D]/20 flex items-center justify-center shrink-0">
                    <Gem size={16} className="text-[#FFD97D]" />
                </div>
                <p className="text-[9px] uppercase tracking-widest text-[#FFD97D] font-black">Tus planes activos</p>
            </div>
            {planes.length === 0 && (
                <p className="text-[11px] opacity-75">Todavía no tienes un plan activo.</p>
            )}
            {planes.map((p, i) => (
                <div key={i} className={`py-2 ${i > 0 ? 'border-t border-white/10 mt-2' : ''}`}>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-black">{p.nombre || 'Sin plan'} {p.tipo === 'mascota' ? '🐾' : ''}</span>
                        {p.cuota ? (
                            <span className="text-sm font-black text-[#FFD97D] whitespace-nowrap">
                                ${Number(p.cuota).toLocaleString('es-CO')}
                            </span>
                        ) : null}
                    </div>
                </div>
            ))}
        </TarjetaBase>
    );
}

function TarjetaBeneficiarios({ datos }) {
    const beneficiarios = datos || [];

    return (
        <TarjetaBase>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-[#FFD97D]/20 flex items-center justify-center shrink-0">
                    <Users size={16} className="text-[#FFD97D]" />
                </div>
                <p className="text-[9px] uppercase tracking-widest text-[#FFD97D] font-black">
                    Tus protegidos ({beneficiarios.length})
                </p>
            </div>
            {beneficiarios.length === 0 && (
                <p className="text-[11px] opacity-75">Aún no tienes beneficiarios registrados.</p>
            )}
            <div className="space-y-1.5">
                {beneficiarios.map((b, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 bg-white/5 rounded-xl px-3 py-2">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold truncate">{b.nombre}</p>
                            <p className="text-[9px] opacity-60">{b.parentesco}</p>
                        </div>
                        {b.estado?.toLowerCase() === 'fallecido' ? (
                            <span className="text-[8px] font-black uppercase bg-[#E8C468]/20 text-[#E8C468] px-2 py-0.5 rounded-full shrink-0">🕯️ En memoria</span>
                        ) : (
                            <span className="text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full shrink-0">Activo</span>
                        )}
                    </div>
                ))}
            </div>
        </TarjetaBase>
    );
}

function TarjetaFacturas({ datos }) {
    const tieneDeuda = (datos?.cantidad_pendientes || 0) > 0;

    return (
        <TarjetaBase>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-[#FFD97D]/20 flex items-center justify-center shrink-0">
                    <Receipt size={16} className="text-[#FFD97D]" />
                </div>
                <p className="text-[9px] uppercase tracking-widest text-[#FFD97D] font-black">Estado de cuenta</p>
            </div>

            {!tieneDeuda ? (
                <p className="text-[11px] opacity-90">¡Estás al día! No tienes facturas pendientes 🎉</p>
            ) : (
                <>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] uppercase tracking-wider opacity-70">Total pendiente</span>
                        <span className="text-base font-black text-[#FFD97D]">
                            ${Number(datos.total_pendiente).toLocaleString('es-CO')}
                        </span>
                    </div>
                    {datos.proxima_fecha_vencimiento && (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                            <span className="text-[10px] uppercase tracking-wider opacity-70">Próximo vencimiento</span>
                            <span className="text-[11px] font-bold">
                                {new Date(datos.proxima_fecha_vencimiento).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => router.visit('/pagos')}
                        className="mt-3 w-full bg-[#FFD97D] text-[#5A4020] text-[10px] font-black uppercase py-2 rounded-xl hover:bg-[#FFC94D] transition active:scale-95"
                    >
                        Pagar ahora
                    </button>
                </>
            )}
        </TarjetaBase>
    );
}

function CarruselServicios({ datos }) {
    const scrollRef = useRef(null);
    const servicios = datos || [];

    const desplazar = (direccion) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: direccion * 220, behavior: 'smooth' });
    };

    if (servicios.length === 0) return null;

    return (
        <div className="flex justify-start animate-card-in w-full">
            <div className="w-full">
                <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-[9px] uppercase tracking-widest text-[#5D4E3F] dark:text-[#FFD97D] font-black">
                        Catálogo de servicios extra
                    </p>
                    <div className="flex gap-1">
                        <button onClick={() => desplazar(-1)} className="w-6 h-6 rounded-full bg-white/70 dark:bg-white/10 flex items-center justify-center hover:bg-[#A68966] hover:text-white transition">
                            <ChevronLeft size={12} />
                        </button>
                        <button onClick={() => desplazar(1)} className="w-6 h-6 rounded-full bg-white/70 dark:bg-white/10 flex items-center justify-center hover:bg-[#A68966] hover:text-white transition">
                            <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
                <div ref={scrollRef} className="carrusel-servicios flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                    {servicios.map((s, i) => (
                        <div
                            key={i}
                            className="snap-start shrink-0 w-[200px] p-3.5 rounded-[20px] bg-white dark:bg-[#221D17] border border-[#5D4E3F]/10 dark:border-white/10 shadow-sm relative overflow-hidden"
                        >
                            {s.personalizable && (
                                <div className="absolute top-2 right-2 bg-amber-400 text-[#5A4020] text-[7px] font-black px-2 py-0.5 rounded-full">
                                    ✨ Personalizable
                                </div>
                            )}
                            <p className="text-[11px] font-black text-[#5D4E3F] dark:text-[#EDE4D3] leading-tight pr-2 mb-1.5">
                                {s.nombre}
                            </p>
                            <p className="text-[9px] text-[#6A5A48] dark:text-[#C2B49A] leading-relaxed mb-2 line-clamp-3">
                                {s.descripcion}
                            </p>
                            <p className="text-[11px] font-black text-[#A68966]">
                                ${Number(s.precio).toLocaleString('es-CO')}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

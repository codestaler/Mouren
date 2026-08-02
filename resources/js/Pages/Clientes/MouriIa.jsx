import React, { useState, useRef, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';
import { Volume2, VolumeX } from 'lucide-react';
import LuciernagasDeLaMemoria from './Components/LuciernagasDeLaMemoria';

export default function MouriIa() {
    const { auth } = usePage().props;
    const usuario = auth?.user || {};
    
    // Estados para el Chat
    const [mensajes, setMensajes] = useState([
        { 
            id: 1, 
            remitente: 'mouri', 
            texto: `Hola, ${usuario.name || 'amigo'}. Estoy aquí para guiarte, acompañarte o simplemente poner la melodía que tu corazón necesite en este momento. ¿De qué te gustaría hablar hoy?` 
        }
    ]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    // CAMBIO: estado del juego — Mouri puede abrirlo solo, vía function
    // calling (ver el campo "accion" que devuelve /chat/mouri), o el
    // usuario lo abre manualmente con el botón de la tarjeta.
    const [juegoAbierto, setJuegoAbierto] = useState(false);

    // --- NUEVO: Estado y refs de audio ---
    const [sonidoActivo, setSonidoActivo] = useState(true);
    const musicaFondoRef = useRef(null);   // <audio> de música de fondo (loop)
    const sonidoPensandoRef = useRef(null); // <audio> del "blip" cuando Mouri piensa
    const yaSonoPensandoRef = useRef(false); // evita repetir el sonido en cada render mientras cargando=true

    const chatEndRef = useRef(null);

    // Auto-scroll al último mensaje
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes, cargando]);

    // --- NUEVO: Inicia la música de fondo en cuanto el usuario interactúa por primera vez ---
    // (los navegadores bloquean el autoplay con sonido si no hay interacción previa)
    useEffect(() => {
        const iniciarMusica = () => {
            if (musicaFondoRef.current && sonidoActivo) {
                musicaFondoRef.current.volume = 0.25; // volumen bajito, es música ambiente
                musicaFondoRef.current.play().catch(() => {});
            }
            window.removeEventListener('click', iniciarMusica);
        };
        window.addEventListener('click', iniciarMusica);
        return () => window.removeEventListener('click', iniciarMusica);
    }, [sonidoActivo]);

    // --- NUEVO: Reproduce el sonidito cada vez que Mouri empieza a "pensar" ---
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

    // --- NUEVO: Silenciar / activar todo (música + efectos) ---
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

    const enviarMensaje = async (e) => {
        if (e) e.preventDefault();

        if (!nuevoMensaje.trim() || cargando) return;

        const mensajeParaEnviar = nuevoMensaje;
        
        setNuevoMensaje('');
        setCargando(true);

        setMensajes(prev => [...prev, { id: Date.now(), remitente: 'usuario', texto: mensajeParaEnviar }]);
        
        try {
            const response = await fetch('/chat/mouri', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ message: mensajeParaEnviar }),
            });

            if (!response.ok) {
                const textoError = await response.text();
                console.error("====== DETALLE DEL ERROR EN EL SERVIDOR ======");
                console.error("Status:", response.status);
                console.error("Respuesta del servidor:", textoError);
                console.error("==============================================");
                
                throw new Error(`Error en el servidor: ${response.status}`);
            }

            const data = await response.json();
            setMensajes(prev => [...prev, { id: Date.now() + 1, remitente: 'mouri', texto: data.reply }]);

            // CAMBIO: si Mouri decidió (vía function calling en el backend)
            // que este es un buen momento para el juego, lo abrimos solo.
            if (data.accion === 'abrir_juego') {
                setJuegoAbierto(true);
            }

        } catch (error) {
            // CAMBIO: antes decía "Error detectado. Revisa la consola (F12)...".
            // El detalle técnico ya se loguea arriba con console.error para que
            // tú (developer) lo veas si hace falta, pero el usuario ya no ve
            // nada técnico — Mouri se mantiene en personaje incluso si la
            // petición falla del todo (red caída, CORS, etc).
            console.error("Error al hablar con Mouri:", error);
            setMensajes(prev => [...prev, { 
                id: Date.now() + 1, 
                remitente: 'mouri', 
                texto: 'Se me nubló el plano un segundo y no pude escucharte bien. ¿Me lo repites? Si sigue pasando, escríbenos al 3247697845 y con gusto te ayudamos por ahí.' 
            }]);
        } finally {
            setCargando(false);
        }
    };

    return (
        // CAMBIO: se agregaron las variantes dark: en todo el layout, siguiendo
        // el mismo patrón de colores que ya usas en MiPlan.jsx (dark:bg-[#221D17],
        // dark:text-[#EDE4D3], etc.) para que este panel respete el modo oscuro
        // del resto de la app.
        // 🆕 RESPONSIVO: flex-col en móvil/tablet, flex-row desde lg (el Sidebar es un drawer debajo de ese punto)
        <div className="min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] dark:text-[#EDE4D3] bg-[#FFFFFF] dark:bg-[#221D17] flex flex-col lg:flex-row overflow-x-hidden relative transition-colors duration-500">
            <Head title="Santuario Mouri - Mouren" />
            
            <div className="absolute inset-0 bg-[url('/images/elementos_dashboard/textura_hojas.png')] opacity-5 dark:opacity-[0.03] pointer-events-none mix-blend-overlay" />
            
            {/* --- NUEVO: Elementos de audio (pon tus rutas aquí) --- */}
            <audio ref={musicaFondoRef} loop src="/images/elementos_dashboard/audios/swan_lake.mp3" />
            <audio ref={sonidoPensandoRef} src="/sounds/mouri_pensando.mp3" />

            <Sidebar />

            {/* 🆕 RESPONSIVO: en móvil quitamos el h-screen/max-h-screen fijo (se vuelve muy apretado
                con el GIF + chat + input todo en una sola pantalla) y dejamos que crezca con el contenido;
                desde lg volvemos al layout de "app" a pantalla completa que ya tenías. */}
            <main className="flex-1 w-full min-w-0 p-4 sm:p-6 md:p-10 content-shift transition-all duration-700 ease-in-out flex flex-col min-h-screen lg:h-screen lg:max-h-screen">
                
                <header className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6 flex-shrink-0">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-2 flex-wrap">
                            Santuario Virtual de <span className="text-[#A68966] dark:text-[#FFD97D]">Mouri</span>
                        </h1>
                        <p className="text-[10px] sm:text-[11px] italic opacity-70 mt-1">"Donde la tecnología abraza la memoria"</p>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {/* --- NUEVO: Botón mute/unmute --- */}
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

                {/* 🆕 RESPONSIVO: en móvil las dos columnas se apilan (Mouri arriba, chat abajo) y
                    cada una tiene su propia altura natural en vez de forzar min-h-0 de un grid a pantalla completa */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:min-h-0 mb-4">
                    
                    <div className="lg:col-span-5 bg-[#5D4E3F] dark:bg-[#2E2720] text-white p-5 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] shadow-xl relative overflow-hidden flex flex-col justify-between group border border-white/10 transition-colors duration-500">
                        <img src="/images/elementos_dashboard/flores-esquina-top.png" className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-24 sm:w-36 opacity-60 dark:opacity-40 pointer-events-none" alt="" />
                        
                        <div className="relative z-10 text-center lg:text-left">
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-[3px] sm:tracking-[4px] font-black text-[#FFD97D] italic">Guía & Guardián</span>
                            <h2 className="text-xl sm:text-2xl font-black mt-2">Mouri</h2>
                            <p className="text-[11px] sm:text-xs opacity-75 mt-2 leading-relaxed font-sans">
                                Capaz de procesar tus sentimientos, buscar tus canciones preferidas o guiarte a través de las galerías de Mouren.
                            </p>
                        </div>

                        <div className="relative my-4 sm:my-6 flex justify-center items-center flex-1 min-h-[140px] sm:min-h-[180px] md:min-h-[200px]">
                            <div className={`absolute w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-[#A68966] to-[#FFD97D] blur-xl transition-all duration-1000 ${cargando ? 'opacity-40 scale-125 animate-pulse' : 'opacity-20 scale-100'}`} />
                            
                            {/* CAMBIO: por ahora se repite la misma imagen en modo oscuro
                                (mismo src). El día que tengas una variante de Mouri para
                                modo oscuro, solo agrega algo como:
                                src={ /* modoOscuro ? '/.../mouri_main_dark.gif' : '/.../mouri_main.gif' * / }
                                usando el hook de tema que ya manejas en el resto de la app. */}
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
                                    <span className="text-[10px] sm:text-[11px] font-sans">🎵 Reproductor Espiritual</span>
                                    <button 
                                        type="button"
                                        onClick={() => setNuevoMensaje("Mouri, pon una melodía bonita por favor")}
                                        className="bg-[#A68966] hover:bg-[#8e7253] text-white px-2.5 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold transition active:scale-95 shrink-0"
                                    >
                                        Pedir Canción
                                    </button>
                                </div>

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
                            </div>

                            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[9px] sm:text-[10px] opacity-60 font-mono">
                                <span>MODO: Acompañamiento</span>
                                <span>V.1.0-BIO</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 bg-[#D3CAB6]/40 dark:bg-[#2E2720]/60 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] p-4 sm:p-6 border border-[#5D4E3F]/10 dark:border-white/10 flex flex-col justify-between shadow-inner relative overflow-hidden h-[60vh] lg:h-full lg:min-h-0 transition-colors duration-500">
                        <img src="/images/login/elementos_dashboard/flores_esquinas_tarjeta.png" className="absolute bottom-4 right-4 w-24 sm:w-40 opacity-10 dark:opacity-5 pointer-events-none" alt="" />
                        
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-4">
                            {mensajes.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className={`flex ${msg.remitente === 'usuario' ? 'justify-end' : 'justify-start'} animate-message-in`}
                                >
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

                        <form onSubmit={enviarMensaje} className="mt-4 flex gap-2 sm:gap-3 relative z-10 flex-shrink-0">
                            <input 
                                type="text"
                                value={nuevoMensaje}
                                onChange={(e) => setNuevoMensaje(e.target.value)}
                                placeholder="Escribe un mensaje o pide una canción..."
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
                
                .animate-message-in {
                    animation: messageIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes messageIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* CAMBIO: overlay del juego — se abre solo (Mouri vía chat) o
                manualmente con el botón "Jugar" de la tarjeta */}
            {juegoAbierto && (
                <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                        <LuciernagasDeLaMemoria onSalir={() => setJuegoAbierto(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

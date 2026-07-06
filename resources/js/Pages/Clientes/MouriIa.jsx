import React, { useState, useRef, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';

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
    
    const chatEndRef = useRef(null);

    // Auto-scroll al último mensaje
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes, cargando]);

    const enviarMensaje = async (e) => {
        if (e) e.preventDefault();

        if (!nuevoMensaje.trim() || cargando) return;

        const mensajeParaEnviar = nuevoMensaje;
        
        setNuevoMensaje('');
        setCargando(true);

        setMensajes(prev => [...prev, { id: Date.now(), remitente: 'usuario', texto: mensajeParaEnviar }]);
        
        try {
            // CORREGIDO: Apuntamos directamente a la ruta raíz web sin el prefijo /api/ que causaba el 404 local
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

        } catch (error) {
            console.error("Error al hablar con Mouri:", error);
            setMensajes(prev => [...prev, { 
                id: Date.now() + 1, 
                remitente: 'mouri', 
                texto: 'Error detectado. Revisa la consola (F12) para ver el detalle místico.' 
            }]);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] bg-[#FFFFFF] flex overflow-x-hidden relative">
            <Head title="Santuario Mouri - Mouren" />
            
            <div className="absolute inset-0 bg-[url('/images/elementos_dashboard/textura_hojas.png')] opacity-5 pointer-events-none mix-blend-overlay" />
            
            <Sidebar />

            <main className="flex-1 p-6 md:p-10 content-shift transition-all duration-700 ease-in-out flex flex-col h-screen max-h-screen">
                
                <header className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-2">
                            Santuario Virtual de <span className="text-[#A68966]">Mouri</span>
                        </h1>
                        <p className="text-[11px] italic opacity-70 mt-1">"Donde la tecnología abraza la memoria"</p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Conexión Espiritual Activa
                    </div>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 mb-4">
                    
                    <div className="lg:col-span-5 bg-[#5D4E3F] text-white p-8 rounded-[45px] shadow-xl relative overflow-hidden flex flex-col justify-between group border border-white/10">
                        <img src="/images/elementos_dashboard/flores-esquina-top.png" className="absolute -top-4 -right-4 w-36 opacity-60 pointer-events-none" alt="" />
                        
                        <div className="relative z-10 text-center lg:text-left">
                            <span className="text-[10px] uppercase tracking-[4px] font-black text-[#FFD97D] italic">Guía & Guardián</span>
                            <h2 className="text-2xl font-black mt-2">Mouri</h2>
                            <p className="text-xs opacity-75 mt-2 leading-relaxed font-sans">
                                Capaz de procesar tus sentimientos, buscar tus canciones preferidas o guiarte a través de las galerías de Mouren.
                            </p>
                        </div>

                        <div className="relative my-6 flex justify-center items-center flex-1 min-h-[200px]">
                            <div className={`absolute w-44 h-44 rounded-full bg-gradient-to-tr from-[#A68966] to-[#FFD97D] blur-xl transition-all duration-1000 ${cargando ? 'opacity-40 scale-125 animate-pulse' : 'opacity-20 scale-100'}`} />
                            
                            <img 
                                src="/images/elementos_dashboard/mouri_ia/mouri_main.png" 
                                className={`w-[300px] object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-500 ${cargando ? 'animate-bounce' : 'hover:scale-105'}`} 
                                alt="Mouri" 
                            />
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/10 relative z-10 text-xs">
                            <p className="font-bold text-[#FFD97D] mb-3 text-center uppercase tracking-wider text-[9px]">Santuario Interactivo</p>
                            
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                                    <span className="text-[11px] font-sans">🎵 Reproductor Espiritual</span>
                                    <button 
                                        type="button"
                                        onClick={() => setNuevoMensaje("Mouri, pon una melodía bonita por favor")}
                                        className="bg-[#A68966] hover:bg-[#8e7253] text-white px-3 py-1 rounded-lg text-[10px] font-bold transition active:scale-95"
                                    >
                                        Pedir Canción
                                    </button>
                                </div>

                                <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5 opacity-80">
                                    <span className="text-[11px] font-sans">🎮 Juegos y Memoria</span>
                                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">
                                        Próximamente
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[10px] opacity-60 font-mono">
                                <span>MODO: Acompañamiento</span>
                                <span>V.1.0-BIO</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 bg-[#D3CAB6]/40 rounded-[45px] p-6 border border-[#5D4E3F]/10 flex flex-col justify-between shadow-inner relative overflow-hidden h-full min-h-0">
                        <img src="/images/login/elementos_dashboard/flores_esquinas_tarjeta.png" className="absolute bottom-4 right-4 w-40 opacity-10 pointer-events-none" alt="" />
                        
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-4">
                            {mensajes.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className={`flex ${msg.remitente === 'usuario' ? 'justify-end' : 'justify-start'} animate-message-in`}
                                Rim>
                                    <div className={`max-w-[85%] p-4 text-xs font-sans leading-relaxed shadow-sm rounded-[25px] ${
                                        msg.remitente === 'usuario'
                                            ? 'bg-[#5D4E3F] text-white rounded-tr-none font-bold'
                                            : 'bg-white/75 text-[#302A1D] rounded-tl-none border border-[#5D4E3F]/10 backdrop-blur-sm relative overflow-hidden'
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
                                    <div className="bg-white/50 text-[#5D4E3F] p-4 text-xs font-sans rounded-[25px] rounded-tl-none border border-[#5D4E3F]/5 flex items-center gap-2">
                                        <span className="animate-spin text-sm">🌱</span> Mouri está buscando en el plano...
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={enviarMensaje} className="mt-4 flex gap-3 relative z-10 flex-shrink-0">
                            <input 
                                type="text"
                                value={nuevoMensaje}
                                onChange={(e) => setNuevoMensaje(e.target.value)}
                                placeholder="Escribe un mensaje o pide una canción..."
                                className="flex-1 bg-white/90 border border-[#5D4E3F]/20 rounded-2xl px-5 text-xs text-[#5D4E3F] focus:outline-none focus:ring-2 focus:ring-[#A68966] placeholder-[#5D4E3F]/50 font-sans shadow-md"
                                disabled={cargando}
                            />
                            <button 
                                type="submit"
                                className="bg-[#5D4E3F] hover:bg-[#4A3E32] text-white w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-md active:scale-95 disabled:opacity-50 text-sm"
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
        </div>
    );
}
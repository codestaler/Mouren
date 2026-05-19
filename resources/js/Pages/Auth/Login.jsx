import React, { useState, useEffect } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

export default function Login() {
    const [showErrorToast, setShowErrorToast] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Si aparecen errores en el objeto 'errors', activamos la alerta
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setShowErrorToast(true);
            // La alerta se quita sola tras 5 segundos
            const timer = setTimeout(() => setShowErrorToast(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative h-screen w-full flex items-center bg-[#F4EDE6] font-['Hepta_Slab'] overflow-hidden">
            <Head title="Inicia Sesión - Mouren" />

            {/* --- ALERTA FLOTANTE DE ERROR (ESTILO MOUREN) --- */}
            {showErrorToast && (
                <div className="fixed top-6 right-6 z-50 animate-bounce-in w-[380px]">
                    <div className="flex items-center p-5 rounded-2xl border-l-8 border-[#5D4E3F] bg-red-50/95 shadow-2xl backdrop-blur-md">
                        {/* Cuervo triste para errores */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white shadow-md mr-4">
                            <img 
                                src="/images/cuervo_triste.png" 
                                className="w-full h-full object-contain p-1"
                                alt="Error"
                            />
                        </div>
                        
                        <div className="flex-1">
                            <p className="font-bold text-lg text-red-900 leading-tight">
                                ¡Uy! Algo falló
                            </p>
                            <p className="text-sm text-red-800 font-medium opacity-90">
                                {errors.email || errors.password || "Credenciales incorrectas"}
                            </p>
                        </div>
                        
                        <button onClick={() => setShowErrorToast(false)} className="text-red-900/50 hover:text-red-900 ml-2">
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* 1. FONDO */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="/images/login/visual_fondo_login.gif" 
                    className="w-full h-full object-cover" 
                    alt="Fondo Mouren" 
                />
            </div>

            {/* 2. DECORACIÓN + LOGO */}
            <div className="absolute top-0 right-0 z-20 pointer-events-none">
                <img src="/images/login/esquina-decorativa-derecha.png" className="w-40 opacity-100" />
                <img src="/images/logo.png" className="absolute top-8 right-8 h-10 pointer-events-auto" alt="Logo" />
            </div>

            <div className="relative z-10 w-full flex h-full">
                
                {/* ZONA IZQUIERDA (Botón Volver) */}
                <div className="w-1/2 relative flex items-end p-12">
                    <Link href="/" className="group bg-[#A68966]/80 text-white px-8 py-2 rounded-full hover:bg-[#5D4E3F] transition-all duration-300 text-sm font-bold shadow-lg hover:scale-105 active:scale-95">
                        <span className="mr-2">←</span> Volver al inicio
                    </Link>
                </div>

                {/* ZONA DERECHA (Formulario) */}
                <div className="w-1/2 flex flex-col justify-center items-center pr-20">
                    <div className="w-full max-w-sm bg-white/20 backdrop-blur-md p-8 rounded-2xl border border-white/30 shadow-2xl text-[#5D4E3F]">
                        <h2 className="text-3xl font-bold mb-8 text-center tracking-tight ">Inicia Sesión</h2>
                        
                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className="group">
                                <label className="block text-sm font-bold mb-1 group-focus-within:text-[#A68966] transition-colors  tracking-widest">Correo electrónico</label>
                                <input 
                                    type="email"
                                    className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-1 focus:border-[#A68966] outline-none text-lg transition-all duration-300"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold mb-1 group-focus-within:text-[#A68966] transition-colors  tracking-widest">Contraseña</label>
                                <input 
                                    type="password"
                                    className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-1 focus:border-[#A68966] outline-none text-lg transition-all duration-300"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col items-center gap-4 mt-4">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full bg-[#5D4E3F] text-white py-3 rounded-xl hover:bg-[#A68966] transition-all duration-500 font-bold shadow-lg hover:shadow-[#A68966]/40 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'COMPROBANDO...' : '¡Ya Estoy Listo!'}
                                </button>
                                
                                <Link href={route('password.request')} className="text-xs hover:text-[#A68966] underline decoration-[#A68966]/30 transition-all">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-[#5D4E3F]/20"></div>
                                <span className="flex-shrink mx-4 text-xs font-bold opacity-50 ">O</span>
                                <div className="flex-grow border-t border-[#5D4E3F]/20"></div>
                            </div>

                            <Link 
                                href="/register" 
                                className="text-center font-bold text-[#A68966] hover:text-[#5D4E3F] transition-colors text-sm  tracking-tighter"
                            >
                                ¿No tienes cuenta aún? Regístrate
                            </Link>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-bounce-in {
                    animation: bounceInRight 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                @keyframes bounceInRight {
                    0% { opacity: 0; transform: translateX(200px); }
                    60% { opacity: 1; transform: translateX(-20px); }
                    100% { transform: translateX(0); }
                }

                body::-webkit-scrollbar { width: 8px; }
                body::-webkit-scrollbar-track { background: #F4EDE6; }
                body::-webkit-scrollbar-thumb { 
                    background: #A68966; 
                    border-radius: 10px; 
                    border: 2px solid #F4EDE6;
                }
            `}</style>
        </div>
    );
}
import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="relative h-screen w-full flex items-center bg-[#F4EDE6] font-['Hepta_Slab'] overflow-hidden">
            <Head title="Inicia Sesión - Mouren" />

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
                <img src="/images/logo.png" className="absolute top-8 right-8 h-10 pointer-events-auto" />
            </div>

            <div className="relative z-10 w-full flex h-full">
                
                {/* ZONA IZQUIERDA (Botón Volver) */}
                <div className="w-1/2 relative flex items-end p-12">
                    <Link href="/" className="group bg-[#A68966]/80 text-white px-8 py-2 rounded-full hover:bg-[#5D4E3F] transition-all duration-300 text-sm font-bold shadow-lg hover:scale-105 active:scale-95">
                        <span className="mr-2">←</span> Volver al inicio
                    </Link>
                </div>

                {/* ZONA DERECHA (Formulario más pequeño) */}
                <div className="w-1/2 flex flex-col justify-center items-center pr-20">
                    <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-2xl text-[#5D4E3F]">
                        <h2 className="text-3xl font-bold mb-8  text-center tracking-tight">Inicia Sesión</h2>
                        
                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div className="group">
                                <label className="block text-sm font-bold mb-1 group-focus-within:text-[#A68966] transition-colors">Correo electrónico</label>
                                <input 
                                    type="email"
                                    className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-1 focus:border-[#A68966] outline-none text-lg transition-all duration-300"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold mb-1 group-focus-within:text-[#A68966] transition-colors">Contraseña</label>
                                <input 
                                    type="password"
                                    className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-1 focus:border-[#A68966] outline-none text-lg transition-all duration-300"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password}</span>}
                            </div>

                            <div className="flex flex-col items-center gap-4 mt-4">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full bg-[#5D4E3F] text-white py-3 rounded-xl hover:bg-[#A68966] transition-all duration-500 font-bold shadow-lg hover:shadow-[#A68966]/40 transform hover:-translate-y-1"
                                >
                                    {processing ? 'Entrando...' : '¡Ya estoy listo!'}
                                </button>
                                
                                <Link href={route('password.request')} className="text-xs hover:text-[#A68966] underline decoration-[#A68966]/30 transition-all">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-[#5D4E3F]/20"></div>
                                <span className="flex-shrink mx-4 text-xs font-bold opacity-50">O</span>
                                <div className="flex-grow border-t border-[#5D4E3F]/20"></div>
                            </div>

                            <Link 
                                href="/register" 
                                className="text-center font-bold text-[#A68966] hover:text-[#5D4E3F] transition-colors text-sm"
                            >
                                ¿No tienes cuenta aún? Regístrate
                            </Link>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx global>{`
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
import React from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react'; // 🌟 Importamos usePage

export default function ForgotPassword() {
    // 🌟 Atrapamos las propiedades globales que comparte Inertia (como flash o status de sesión)
    const { flash, status: sessionStatus } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    // Evaluamos si viene en flash.status, flash.success o directamente sessionStatus
    const mensajeExito = sessionStatus || flash?.status || flash?.success || flash?.message;

    return (
        <div className="min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] bg-[#FAF8F5] flex items-center justify-center p-4">
            <Head title="Recuperar Contraseña - Mouren" />

            <div className="bg-white rounded-[45px] p-8 md:p-10 max-w-md w-full shadow-xl border border-[#5D4E3F]/5 text-center relative overflow-hidden">
                {/* Decoración sutil */}
                <div className="w-24 h-24 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                    <img src="/images/login/mouri_registro_exitoso.gif" alt="Mouri" className="w-16 h-16 object-contain" />
                </div>

                <h1 className="text-xl md:text-2xl font-black text-[#302A1D] mb-2 tracking-tighter">
                    ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-xs opacity-75 mb-6 max-w-sm mx-auto leading-relaxed italic">
                    No te preocupes, a cualquiera le pasa. Introduce tu correo y Mouri te enviará un enlace de recuperación.
                </p>

                {/* 🌟 Ahora sí va a leer el estado correctamente */}
                {mensajeExito && (
                    <div className="mb-6 p-4 bg-[#302A1D] text-[#F4EDE6] rounded-2xl text-xs font-bold border-l-4 border-[#A68966] shadow-sm text-left animate-fade-in">
                        ✨ El enlace fue enviado con éxito. ¡Revisa tu bandeja de Mailtrap!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                    <div>
                        <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={data.email} 
                            onChange={e => setData('email', e.target.value)} 
                            className="w-full bg-[#FAF8F5] border border-[#A68966]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all font-sans" 
                            placeholder="tu-correo@ejemplo.com"
                            required 
                        />
                        {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold font-sans">*{errors.email}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 px-8 rounded-2xl font-bold text-xs bg-[#302A1D] text-white hover:bg-[#A68966] transition-all duration-300 shadow-md uppercase tracking-widest disabled:opacity-40"
                    >
                        {processing ? 'Enviando...' : 'Enviar enlace al correo'}
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-[#5D4E3F]/5 text-center">
                    <Link href={route('login')} className="text-xs text-[#A68966] font-bold hover:underline">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
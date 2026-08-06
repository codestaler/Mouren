import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

// 🌟 Ahora recibe correctamente las propiedades del Token y Email que le manda Laravel
export default function ResetPassword({ token, email }) {
    
    // Estados para controlar la visibilidad de los campos de contraseña
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Inicializamos el formulario de Inertia con los campos de la nueva clave
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Envía la petición POST al método reset() del controlador
        post(route('password.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] bg-[#FAF8F5] flex items-center justify-center p-4">
            <Head title="Restablecer Contraseña - Mouren" />

            <div className="bg-white rounded-[45px] p-8 md:p-10 max-w-md w-full shadow-xl border border-[#5D4E3F]/5 text-center relative overflow-hidden">
                
                {/* El gif de Mouri */}
                <div className="w-24 h-24 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                    <img src="/images/login/mouri_registro_exitoso.webp" alt="Mouri" className="w-16 h-16 object-contain" />
                </div>

                {/* Títulos de la interfaz */}
                <h1 className="text-xl md:text-2xl font-black text-[#302A1D] mb-2 tracking-tighter">
                    Crea tu nueva contraseña
                </h1>
                <p className="text-xs opacity-75 mb-6 max-w-sm mx-auto leading-relaxed italic">
                    Ya casi lo tienes, Sabrina. Elige una contraseña segura para proteger tu cuenta en Mouren.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    
                    {/* Input de Email (Solo lectura) */}
                    <div>
                        <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={data.email} 
                            disabled
                            className="w-full bg-[#FAF8F5] opacity-60 border border-[#A68966]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-sans cursor-not-allowed" 
                        />
                        {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold font-sans">*{errors.email}</p>}
                    </div>

                    {/* Nueva Contraseña */}
                    <div>
                        <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Nueva Contraseña</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={data.password} 
                                onChange={e => setData('password', e.target.value)} 
                                className="w-full bg-[#FAF8F5] border border-[#A68966]/20 rounded-xl pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all font-sans" 
                                placeholder="Mínimo 8 caracteres"
                                required 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
                                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold font-sans">*{errors.password}</p>}
                    </div>

                    {/* Confirmar Contraseña */}
                    <div>
                        <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Confirmar Nueva Contraseña</label>
                        <div className="relative">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                value={data.password_confirmation} 
                                onChange={e => setData('password_confirmation', e.target.value)} 
                                className="w-full bg-[#FAF8F5] border border-[#A68966]/20 rounded-xl pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all font-sans" 
                                placeholder="Repite tu contraseña exactamente"
                                required 
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
                                title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.password_confirmation && <p className="text-red-500 text-[10px] mt-1 font-bold font-sans">*{errors.password_confirmation}</p>}
                    </div>

                    {/* Botón de Enviar */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 px-8 rounded-2xl font-bold text-xs bg-[#302A1D] text-white hover:bg-[#A68966] transition-all duration-300 shadow-md uppercase tracking-widest disabled:opacity-40"
                    >
                        {processing ? 'Actualizando contraseña...' : 'Guardar Nueva Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
}
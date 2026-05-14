import React, { useState } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';

export default function Register({ tiposDocumento, generos }) {
    const [showPassword, setShowPassword] = useState(false);
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        tipo_documento_id: '',
        cedula: '', 
        nombre1: '',
        nombre2: '',
        apellido1: '',
        apellido2: '',
        fecha_nacimiento: '',
        telefono: '',
        genero_id: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const today = new Date().toISOString().split('T')[0];

    const handleInput = (e, field, type) => {
        let value = e.target.value;
        if (type === 'no-special') value = value.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ ]/g, '');
        if (type === 'no-spaces') value = value.replace(/\s/g, '');
        if (type === 'numbers') {
            value = value.replace(/\D/g, '');
            if (field === 'telefono' && value.length > 10) return;
        }
        setData(field, value);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const hasErrors = Object.keys(errors).length > 0;
    const isSuccess = flash?.message;

    return (
        <div className="relative h-screen w-full flex items-center bg-[#F4EDE6] font-['Hepta_Slab'] overflow-hidden">
            <Head title="Registro - Mouren" />

            {/* --- ALERTA FLOTANTE EN LA ESQUINA --- */}
            {(hasErrors || isSuccess) && (
                <div className="fixed top-6 right-6 z-50 animate-bounce-in w-[400px]">
                    <div className={`flex items-center p-6 rounded-2xl border-l-8 shadow-2xl backdrop-blur-md ${
                        hasErrors 
                        ? 'bg-red-50/95 border-[#5D4E3F] text-red-900' 
                        : 'bg-green-50/95 border-[#5D4E3F] text-green-900'
                    }`}>
                        {/* Círculo con el Cuervo (Más grande) */}
                        <div className="flex-shrink-0 w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg mr-5">
                            <img 
                                src={hasErrors ? "/images/login/mouri_registro_exitoso.png" : "/images/login/mouri_registro_exitoso.png"} 
                                className="w-full h-full object-contain p-1"
                                alt="Estado Cuervo"
                            />
                        </div>
                        
                        <div className="flex-1">
                            <p className="font-bold text-xl mb-1 tracking-tight">
                                {hasErrors ? "¡Revisa los datos!" : "¡Registro Exitoso!"}
                            </p>
                            <div className="text-base font-medium opacity-90">
                                {hasErrors ? (
                                    <ul className="list-disc list-inside">
                                        {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                                        {data.telefono.length !== 10 && data.telefono.length > 0 && <li>10 dígitos para el teléfono.</li>}
                                    </ul>
                                ) : (
                                    <div>
                                        <p className="mb-3">{flash.message}</p>
                                        <Link 
                                            href="/login" 
                                            className="inline-block bg-[#5D4E3F] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#A68966] transition-colors"
                                        >
                                            IR AL LOGIN AHORA
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fondo */}
            <div className="absolute inset-0 z-0">
                <img src="/images/login/visual_fondo_registro.gif" className="w-full h-full object-cover" alt="" />
            </div>

            {/* Logos */}
            <div className="absolute top-0 left-0 z-20 pointer-events-none">
                <img src="/images/esquina-decorativa.png" className="w-52 opacity-80" alt="" />
                <img src="/images/logo.png" className="absolute top-4 left-4 h-10 pointer-events-auto" alt="Logo" />
            </div>

            <div className="relative z-10 w-full flex">
                <div className="w-1/2 flex justify-start pl-52 pt-2">
                    <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto pr-4 text-[#5D4E3F]">
                        <h2 className="text-3xl font-bold mb-6">Crea tu cuenta de Mouren</h2>

                        <form onSubmit={submit} className="grid grid-cols-2 gap-x-8 gap-y-4 text-base pb-10">
                            {/* Inputs del formulario (se mantienen iguales) */}
                            <div>
                                <label className="block font-semibold mb-1 text-sm">Tipo de documento</label>
                                <select 
                                    required
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.tipo_documento_id}
                                    onChange={e => setData('tipo_documento_id', e.target.value)}
                                >
                                    <option value="">Seleccione...</option>
                                    {tiposDocumento?.map((tipo) => (
                                        <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-sm">Número de documento</label>
                                <input 
                                    required
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.cedula}
                                    onChange={e => handleInput(e, 'cedula', 'numbers')}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-sm">Primer nombre *</label>
                                <input 
                                    required
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.nombre1}
                                    onChange={e => handleInput(e, 'nombre1', 'no-special')}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-sm">Segundo nombre</label>
                                <input 
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.nombre2}
                                    onChange={e => handleInput(e, 'nombre2', 'no-special')}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-sm">Primer apellido *</label>
                                <input 
                                    required
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.apellido1}
                                    onChange={e => handleInput(e, 'apellido1', 'no-special')}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-sm">Segundo apellido</label>
                                <input 
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.apellido2}
                                    onChange={e => handleInput(e, 'apellido2', 'no-special')}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block font-semibold mb-1 text-sm">Fecha de nacimiento</label>
                                <input 
                                    type="date"
                                    max={today}
                                    required
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.fecha_nacimiento}
                                    onChange={e => setData('fecha_nacimiento', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-sm">Género</label>
                                <select 
                                    required
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.genero_id}
                                    onChange={e => setData('genero_id', e.target.value)}
                                >
                                    <option value="">Seleccione...</option>
                                    {generos?.map((gen) => (
                                        <option key={gen.id} value={gen.id}>{gen.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-sm text-[#A68966]">Teléfono (10 dígitos)</label>
                                <input 
                                    required
                                    placeholder="3001234567"
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.telefono}
                                    onChange={e => handleInput(e, 'telefono', 'numbers')}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block font-semibold mb-1 text-sm">Correo electrónico</label>
                                <input 
                                    type="email"
                                    required
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.email}
                                    onChange={e => handleInput(e, 'email', 'no-spaces')}
                                />
                            </div>

                            <div className="relative">
                                <label className="block font-semibold mb-1 text-sm">Contraseña</label>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F] pr-12"
                                    value={data.password}
                                    onChange={e => handleInput(e, 'password', 'no-spaces')}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 bottom-2 text-xs font-bold text-[#A68966] hover:text-[#5D4E3F]"
                                >
                                    {showPassword ? "Ocultar" : "Ver"}
                                </button>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-sm">Confirmar contraseña</label>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.password_confirmation}
                                    onChange={e => handleInput(e, 'password_confirmation', 'no-spaces')}
                                />
                            </div>

                            <div className="col-span-2 mt-8">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#5D4E3F] text-white py-4 rounded-md font-bold hover:bg-[#FFC600] hover:text-[#5D4E3F] transition-all transform active:scale-95 disabled:opacity-50 shadow-lg"
                                >
                                    {processing ? 'Creando tu cuenta...' : 'REGISTRARME EN MOUREN'}
                                </button>
                            </div>

                            <div className="col-span-2 text-center mt-2">
                                <Link href="/login" className="text-sm font-semibold underline decoration-[#A68966] underline-offset-4 hover:text-[#A68966]">
                                    ¿Ya tienes cuenta? Inicia sesión aquí
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="w-1/2 flex justify-end items-end pt-10 pr-10 pb-4">
                    <Link href="/" className="bg-[#A68966]/90 backdrop-blur-sm text-white px-8 py-2 rounded-full font-semibold hover:bg-[#5D4E3F] transition shadow-md">
                        Volver al inicio
                    </Link>
                </div>
            </div>

            <style>{`
                div::-webkit-scrollbar { width: 6px; }
                div::-webkit-scrollbar-thumb { background: #A68966; border-radius: 10px; }
                div::-webkit-scrollbar-track { background: transparent; }
                
                .animate-bounce-in {
                    animation: bounceInRight 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                @keyframes bounceInRight {
                    0% { opacity: 0; transform: translateX(200px); }
                    60% { opacity: 1; transform: translateX(-20px); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
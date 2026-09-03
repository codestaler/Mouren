import React, { useState, useEffect, useRef } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
// Importamos iconos sencillos (si no tienes Lucide, puedes usar texto o emojis como hice abajo)
import { Eye, EyeOff, Flower } from 'lucide-react';

export default function Register({ tiposDocumento, generos }) {
    const [showPassword, setShowPassword] = useState(false);
    const [tamperDetected, setTamperDetected] = useState(false);
    const { flash } = usePage().props;

    // 🛡️ Refs de los campos sensibles que vigilamos contra cambios de "type"
    const emailRef = useRef(null);
    const cedulaRef = useRef(null);
    const telefonoRef = useRef(null);
    const fechaRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmRef = useRef(null);

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

    // 🛡️ Vigilamos que nadie cambie el "type" de los campos sensibles desde DevTools
    useEffect(() => {
        const expectedTypes = new Map([
            [emailRef.current, 'email'],
            [cedulaRef.current, 'text'],
            [telefonoRef.current, 'text'],
            [fechaRef.current, 'date'],
            [passwordRef.current, showPassword ? 'text' : 'password'],
            [confirmRef.current, showPassword ? 'text' : 'password'],
        ]);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'type') {
                    const el = mutation.target;
                    const esperado = expectedTypes.get(el);
                    if (esperado && el.getAttribute('type') !== esperado) {
                        setTamperDetected(true);
                    }
                }
            });
        });

        expectedTypes.forEach((_, el) => {
            if (el) observer.observe(el, { attributes: true, attributeFilter: ['type'] });
        });

        return () => observer.disconnect();
    }, [showPassword]);

    const handleInput = (e, field, type) => {
        let value = e.target.value;

        // 1. Quitar espacios vacíos en todos los campos
        value = value.replace(/\s/g, '');

        if (type === 'no-special') {
            // Permite letras y números, quita caracteres especiales
            value = value.replace(/[^a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ]/g, '');

            // Formato: Primera Mayúscula, resto minúscula
            if (value.length > 0) {
                value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            }
        }

        if (type === 'numbers') {
            value = value.replace(/\D/g, '');

            // TELÉFONO: máximo 10 números
            if (field === 'telefono' && value.length > 10) return;

            // CÉDULA: mínimo 6 y máximo 12
            if (field === 'cedula' && value.length > 12) return;
        }

        setData(field, value);
    };

    const submit = (e) => {
        e.preventDefault();

        // VALIDAR CAMPOS VACÍOS
        for (const key in data) {
            if (
                key !== 'nombre2' &&
                key !== 'apellido2' &&
                data[key].trim() === ''
            ) {
                alert('Todos los campos obligatorios deben estar llenos');
                return;
            }
        }

        // VALIDAR CÉDULA
        if (data.cedula.length < 6 || data.cedula.length > 12) {
            alert('La cédula debe tener entre 6 y 12 números');
            return;
        }

        // VALIDAR TELÉFONO
        if (!data.telefono.startsWith('3')) {
            alert('El número de celular debe comenzar por 3');
            return;
        }

        if (data.telefono.length !== 10) {
            alert('El celular debe tener 10 números');
            return;
        }

        // VALIDAR CONTRASEÑA
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

        if (!passwordRegex.test(data.password)) {
            alert(
                'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial'
            );
            return;
        }

        // CONFIRMAR CONTRASEÑAS
        if (data.password !== data.password_confirmation) {
            alert('Las contraseñas no coinciden');
            return;
        }

        post('/register-store', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const hasErrors = Object.keys(errors).length > 0;
    const isSuccess = flash?.message;

    return (
        <div className="relative min-h-screen w-full flex items-center bg-[#F4EDE6] font-['Hepta_Slab'] overflow-x-hidden">
            <Head title="Registro - Mouren" />

            {/* --- PANTALLA DE BLOQUEO POR MANIPULACIÓN DEL FORMULARIO --- */}
            {tamperDetected && (
                <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#F4EDE6]/95 backdrop-blur-sm px-6 text-center">
                    <img
                        src="/images/login/mouri_error.png"
                        className="w-40 sm:w-56 mb-6 animate-bounce"
                        alt="Mouri regañando"
                    />
                    <h2 className="text-2xl font-bold text-[#5D4E3F] mb-2">¡Ey, ey, ey! 🙅‍♂️</h2>
                    <p className="text-[#5D4E3F]/80 max-w-sm">
                        Detectamos que se modificó el formulario de registro. Por favor no toques la estructura del formulario, causa errores raros. Recarga la página para continuar.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-[#5D4E3F] text-white px-6 py-2 rounded-full hover:bg-[#A68966] transition-all"
                    >
                        Recargar
                    </button>
                </div>
            )}

            {/* --- MODAL DE ÉXITO --- */}
            {isSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4">
                    <div className="relative flex flex-col sm:flex-row items-center w-full max-w-md sm:max-w-none sm:w-auto">
                        <div className="z-10 sm:-mr-16 w-40 h-40 sm:w-64 sm:h-64">
                            <img src="/images/login/mouri_registro_exitoso.webp" className="w-full h-full drop-shadow-2xl" alt="Mouri" />
                        </div>
                        <div className="bg-[#5D4E3F] text-white p-6 sm:p-10 sm:pl-20 rounded-[32px] sm:rounded-[40px] shadow-2xl w-full max-w-md border-2 border-[#A68966] -mt-6 sm:mt-0 text-center sm:text-left">
                            <h2 className="text-[#FFC600] text-3xl sm:text-4xl font-black italic mb-2">¡Felicidades!</h2>
                            <p className="text-base sm:text-lg font-medium leading-tight mb-6 sm:mb-8 lowercase">
                                <span className="text-[#EBE3CB] font-bold">{data.nombre1}</span>, ya tienes cuenta. inicia sesión para continuar.
                            </p>
                            <Link href="/login" className="block w-full bg-[#A68966] text-white py-4 rounded-2xl font-bold text-center hover:bg-[#FFC600] hover:text-[#5D4E3F] transition-all shadow-lg text-lg sm:text-xl lowercase">
                                inicia sesión ahora
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ALERTA DE ERRORES --- */}
            {hasErrors && (
                <div className="fixed top-4 sm:top-6 right-4 sm:right-6 left-4 sm:left-auto z-50 animate-bounce-in sm:w-[400px]">
                    <div className="flex items-center p-4 sm:p-5 rounded-2xl border-l-8 bg-red-50 border-red-700 text-red-900 shadow-2xl">
                        <img src="/images/login/mouri_error.png" className="w-14 h-14 sm:w-20 sm:h-20 mr-3 sm:mr-4 flex-shrink-0" alt="Error" />
                        <div>
                            <p className="font-bold text-base sm:text-lg italic lowercase">¡alto ahí!</p>
                            <ul className="text-xs list-disc list-inside opacity-80 lowercase">
                                {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Fondo */}
            <div className="absolute inset-0 z-0">
                <img src="/images/login/visual_fondo_registro.gif" className="w-full h-full object-cover" alt="" />
            </div>

            {/* Logo Fijo */}
            <div className="absolute top-0 left-0 z-20">
                <img src="/images/esquina-decorativa.png" className="w-32 sm:w-52 opacity-80" alt="" />
                <Link href="/" className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <img src="/images/logo.png" className="h-7 sm:h-10" alt="Logo" />
                </Link>
            </div>

            <div className="relative z-10 w-full flex flex-col sm:flex-row min-h-screen sm:h-full pt-24 sm:pt-0">
                <div className="w-full sm:w-1/2 flex flex-col justify-start px-5 sm:pl-24 md:pl-36 lg:pl-60 sm:pt-8 md:pt-12 lg:pt-16">

                    {/* TÍTULO ESTÁTICO (No se mueve con el scroll del form) */}
                    <div className="mb-4 sm:mb-6">
                        <h2 className="text-2xl sm:text-4xl font-black text-[#5D4E3F] lowercase tracking-tighter">únete a nuestra familia</h2>
                        <div className="h-1 w-16 sm:w-20 bg-[#A68966] mt-2"></div>
                    </div>

                    {/* FORMULARIO CON SCROLL */}
                    <div className="w-full max-w-xl sm:overflow-y-auto sm:max-h-[calc(100vh-16rem)] lg:max-h-[calc(100vh-18rem)] pr-0 sm:pr-4 text-[#5D4E3F] custom-scrollbar pb-10 sm:pb-20">
                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-5 sm:gap-y-6 text-base">

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">tipo de documento</label>
                                <select required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966] transition-colors"
                                    value={data.tipo_documento_id} onChange={e => setData('tipo_documento_id', e.target.value)}>
                                    <option value="">seleccione...</option>
                                    {tiposDocumento?.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">número de documento</label>
                                <input ref={cedulaRef} type="text" required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966] "
                                    value={data.cedula} onChange={e => handleInput(e, 'cedula', 'numbers')} />
                                <span className="block text-[10px] text-[#A68966] mt-1 lowercase">debe tener entre 6 y 12 números</span>
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">primer nombre *</label>
                                <input required placeholder="ej: Juan" className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.nombre1} onChange={e => handleInput(e, 'nombre1', 'no-special')} />
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">segundo nombre</label>
                                <input className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.nombre2} onChange={e => handleInput(e, 'nombre2', 'no-special')} />
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">primer apellido *</label>
                                <input required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.apellido1} onChange={e => handleInput(e, 'apellido1', 'no-special')} />
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">segundo apellido</label>
                                <input className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.apellido2} onChange={e => handleInput(e, 'apellido2', 'no-special')} />
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                <label className="block font-bold mb-1 text-xs lowercase">fecha de nacimiento</label>
                                <input ref={fechaRef} type="date" max={today} required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.fecha_nacimiento} onChange={e => setData('fecha_nacimiento', e.target.value)} />
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">género</label>
                                <select required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.genero_id} onChange={e => setData('genero_id', e.target.value)}>
                                    <option value="">seleccione...</option>
                                    {generos?.map((gen) => <option key={gen.id} value={gen.id}>{gen.nombre}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">teléfono</label>
                                <input ref={telefonoRef} type="text" required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.telefono} onChange={e => handleInput(e, 'telefono', 'numbers')} />
                                <span className="block text-[10px] text-[#A68966] mt-1 lowercase">10 dígitos, debe iniciar con el número 3</span>
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                <label className="block font-bold mb-1 text-xs lowercase">correo electrónico</label>
                                <input ref={emailRef} type="email" required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.email} onChange={e => handleInput(e, 'email', 'no-spaces')} />
                            </div>

                            {/* --- SECCIÓN CONTRASEÑA CORREGIDA --- */}
                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">contraseña</label>
                                <div className="relative flex items-center">
                                    <input ref={passwordRef} type={showPassword ? "text" : "password"} required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none pr-8 focus:border-[#A68966]"
                                        value={data.password} onChange={e => setData('password', e.target.value.replace(/\s/g, ''))} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 text-[#A68966] hover:scale-110 transition-transform text-lg">
                                        {showPassword ? '🌸' : '👁️'}
                                    </button>
                                </div>
                                <span className="block text-[10px] text-[#A68966] mt-1 lowercase leading-tight">mínimo 8 caracteres, una mayúscula, un número y un carácter especial (@$!%*?&.#_-)</span>
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">confirmar contraseña</label>
                                <input ref={confirmRef} type={showPassword ? "text" : "password"} required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value.replace(/\s/g, ''))} />
                                <span className="block text-[10px] text-[#A68966] mt-1 lowercase">las contraseñas deben ser idénticas</span>
                            </div>

                            <div className="col-span-1 sm:col-span-2 mt-2 sm:mt-4">
                                <button type="submit" disabled={processing} className="w-full bg-[#5D4E3F] text-white py-4 rounded-2xl font-bold hover:bg-[#A68966] transition-all transform active:scale-95 disabled:opacity-50 shadow-xl lowercase tracking-widest">
                                    {processing ? 'procesando...' : 'finalizar registro'}
                                </button>
                            </div>

                            <div className="col-span-1 sm:col-span-2 text-center pb-4 sm:pb-0">
                                <Link href="/login" className="text-sm font-medium hover:text-[#A68966] transition-colors lowercase">
                                    ¿ya tienes cuenta? <span className="font-bold underline">inicia sesión aquí</span>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="hidden sm:flex w-1/2 justify-end items-end p-10">
                    <Link href="/" className="bg-[#A68966]/90 backdrop-blur-md text-white px-10 py-3 rounded-full font-bold hover:bg-[#5D4E3F] transition shadow-2xl active:scale-95 lowercase">
                        volver al inicio
                    </Link>
                </div>
            </div>

            {/* Botón "volver" flotante para móvil, ya que el panel derecho se oculta */}
            <Link
                href="/"
                className="sm:hidden fixed bottom-4 right-4 z-20 bg-[#A68966]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#5D4E3F] transition shadow-2xl active:scale-95 lowercase"
            >
                volver al inicio
            </Link>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #A68966; border-radius: 10px; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                .animate-bounce-in { animation: bounceInRight 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes bounceInRight {
                    0% { opacity: 0; transform: translateX(200px); }
                    60% { opacity: 1; transform: translateX(-20px); }
                    100% { transform: translateX(0); }
                }
                @media (max-width: 639px) {
                    @keyframes bounceInRight {
                        0% { opacity: 0; transform: translateY(-40px); }
                        60% { opacity: 1; transform: translateY(6px); }
                        100% { transform: translateY(0); }
                    }
                }
            `}</style>
        </div>
    );
}

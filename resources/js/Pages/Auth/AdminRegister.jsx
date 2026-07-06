import React, { useState } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { Eye, EyeOff, Shield } from 'lucide-react'; // Cambiamos Flower por Shield (Escudo) para la temática Admin

export default function AdminRegister({ tiposDocumento, generos }) {
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

        // 1. Quitar espacios vacíos en todos los campos
        value = value.replace(/\s/g, '');

        if (type === 'no-special') {
            value = value.replace(/[^a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ]/g, '');

            if (value.length > 0) {
                value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            }
        }

        if (type === 'numbers') {
            value = value.replace(/\D/g, '');

            if (field === 'telefono' && value.length > 10) return;
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

        // Por esto (usando la URL manual exacta de tu Laravel):
        post('/admin/users/store-admin', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const hasErrors = Object.keys(errors).length > 0;
    const isSuccess = flash?.message;

    return (
        <div className="relative h-screen w-full flex items-center bg-[#F4EDE6] font-['Hepta_Slab'] overflow-hidden">
            <Head title="Registro Administrador - Mouren" />

            {/* --- MODAL DE ÉXITO --- */}
            {isSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="relative flex items-center">
                        <div className="z-10 -mr-16">
                            {/* Puedes usar el mismo gif o uno de Mouri con traje corporativo si lo tienes */}
                            <img src="/images/login/mouri_registro_exitoso.gif" className="w-64 h-64 drop-shadow-2xl" alt="Mouri" />
                        </div>
                        <div className="bg-[#5D4E3F] text-white p-10 pl-20 rounded-[40px] shadow-2xl max-w-md border-2 border-[#A68966]">
                            <h2 className="text-[#FFC600] text-4xl font-black italic mb-2">¡Hecho!</h2>
                            <p className="text-lg font-medium leading-tight mb-8 lowercase">
                                nuevo administrador <span className="text-[#EBE3CB] font-bold">{data.nombre1}</span> registrado correctamente en el sistema.
                            </p>
                            <Link href="/login" className="block w-full bg-[#A68966] text-white py-4 rounded-2xl font-bold text-center hover:bg-[#FFC600] hover:text-[#5D4E3F] transition-all shadow-lg text-xl lowercase">
                                ir al inicio de sesión
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ALERTA DE ERRORES --- */}
            {hasErrors && (
                <div className="fixed top-6 right-6 z-50 animate-bounce-in w-[400px]">
                    <div className="flex items-center p-5 rounded-2xl border-l-8 bg-red-50 border-red-700 text-red-900 shadow-2xl">
                        <img src="/images/login/mouri_error.png" className="w-20 h-20 mr-4" alt="Error" />
                        <div>
                            <p className="font-bold text-lg italic lowercase">¡atención!</p>
                            <ul className="text-xs list-disc list-inside opacity-80 lowercase">
                                {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Fondo (Puedes usar el mismo o uno exclusivo para la sección interna) */}
            <div className="absolute inset-0 z-0">
                <img src="/images/login/visual_fondo_registro.gif" className="w-full h-full object-cover" alt="" />
            </div>

            {/* Logo Fijo */}
            <div className="absolute top-0 left-0 z-20">
                <img src="/images/esquina-decorativa.png" className="w-52 opacity-80" alt="" />
                <Link href="/" className="absolute top-4 left-4">
                    <img src="/images/logo.png" className="h-10" alt="Logo" />
                </Link>
            </div>

            <div className="relative z-10 w-full flex h-full">
                <div className="w-1/2 flex flex-col justify-start pl-52 pt-20">

                    {/* TÍTULO ESTÁTICO DE ADMINISTRACIÓN */}
                    <div className="mb-6">
                        <span className="text-xs font-bold text-[#A68966] tracking-widest uppercase flex items-center gap-1 mb-1">
                            <Shield className="w-3 h-3" /> Panel de Control
                        </span>
                        <h2 className="text-4xl font-black text-[#5D4E3F] lowercase tracking-tighter">alta de nuevo administrador</h2>
                        <div className="h-1 w-20 bg-[#A68966] mt-2"></div>
                    </div>

                    {/* FORMULARIO CON SCROLL */}
                    <div className="w-full max-w-xl overflow-y-auto pr-4 text-[#5D4E3F] custom-scrollbar pb-20">
                        <form onSubmit={submit} className="grid grid-cols-2 gap-x-8 gap-y-6 text-base">

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
                                <input required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966] "
                                    value={data.cedula} onChange={e => handleInput(e, 'cedula', 'numbers')} />
                                <span className="block text-[10px] text-[#A68966] mt-1 lowercase">debe tener entre 6 y 12 números</span>
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">primer nombre *</label>
                                <input required placeholder="ej: Administrador" className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
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

                            <div className="col-span-2">
                                <label className="block font-bold mb-1 text-xs lowercase">fecha de nacimiento</label>
                                <input type="date" max={today} required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
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
                                <input required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.telefono} onChange={e => handleInput(e, 'telefono', 'numbers')} />
                                <span className="block text-[10px] text-[#A68966] mt-1 lowercase">10 dígitos, debe iniciar con el número 3</span>
                            </div>

                            <div className="col-span-2">
                                <label className="block font-bold mb-1 text-xs lowercase">correo electrónico corporativo</label>
                                <input type="email" required placeholder="admin@mouren.com" className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.email} onChange={e => handleInput(e, 'email', 'no-spaces')} />
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">contraseña segura</label>
                                <div className="relative flex items-center">
                                    <input type={showPassword ? "text" : "password"} required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none pr-8 focus:border-[#A68966]"
                                        value={data.password} onChange={e => setData('password', e.target.value.replace(/\s/g, ''))} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 text-[#A68966] hover:scale-110 transition-transform text-lg">
                                        {showPassword ? '🌸' : '👁️'}
                                    </button>
                                </div>
                                <span className="block text-[10px] text-[#A68966] mt-1 lowercase leading-tight">mínimo 8 caracteres, una mayúscula, un número y un carácter especial (@$!%*?&.#_-)</span>
                            </div>

                            <div>
                                <label className="block font-bold mb-1 text-xs lowercase">confirmar contraseña</label>
                                <input type={showPassword ? "text" : "password"} required className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#A68966]"
                                    value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value.replace(/\s/g, ''))} />
                                <span className="block text-[10px] text-[#A68966] mt-1 lowercase">las contraseñas deben ser idénticas</span>
                            </div>

                            <div className="col-span-2 mt-4">
                                <button type="submit" disabled={processing} className="w-full bg-[#5D4E3F] text-white py-4 rounded-2xl font-bold hover:bg-[#A68966] transition-all transform active:scale-95 disabled:opacity-50 shadow-xl lowercase tracking-widest">
                                    {processing ? 'creando administrador...' : 'registrar administrador'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="w-1/2 flex justify-end items-end p-10">
                    <Link href="/admin/dashboard" className="bg-[#A68966]/90 backdrop-blur-md text-white px-10 py-3 rounded-full font-bold hover:bg-[#5D4E3F] transition shadow-2xl active:scale-95 lowercase">
                        volver al panel
                    </Link>
                </div>
            </div>

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
            `}</style>
        </div>
    );
}
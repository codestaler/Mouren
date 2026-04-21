import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing } = useForm({
        tipo_documento: '',
        numero_documento: '',
        nombre1: '',
        nombre2: '',
        apellido1: '',
        apellido2: '',
        fecha_nacimiento: '',
        telefono: '',
        ciudad: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleInput = (e, field, type) => {
        let value = e.target.value;
        if (type === 'no-special') value = value.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ]/g, '');
        if (type === 'no-spaces') value = value.replace(/\s/g, '');
        if (type === 'numbers') value = value.replace(/\D/g, '');
        setData(field, value);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="relative h-screen w-full flex items-center bg-[#F4EDE6] font-['Hepta_Slab'] overflow-hidden">
            <Head title="Registro - Mouren" />

            {/* FONDO */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="/images/login/visual_fondo_registro.gif" 
                    className="w-full h-full object-cover" 
                    alt=""
                />
            </div>

            {/* DECORACIÓN + LOGO */}
            <div className="absolute top-0 left-0 z-20 pointer-events-none">
                <img src="/images/esquina-decorativa.png" className="w-52 opacity-80" />
                <img src="/images/logo.png" className="absolute top-4 left-4 h-10 pointer-events-auto" />
            </div>

            <div className="relative z-10 w-full flex">

                {/* FORMULARIO */}
                <div className="w-1/2 flex justify-start pl-52 pt-2">
                    
                    {/* SCROLL AQUÍ 👇 */}
                    <div className="w-full max-w-xl max-h-[75vh] overflow-y-auto pr-4 text-[#5D4E3F]">

                        <h2 className="text-3xl font-bold mb-6 ">
                            Crea tu cuenta de Mouren
                        </h2>

                        <form 
                            onSubmit={submit} 
                            className="grid grid-cols-2 gap-x-8 gap-y-4 text-base pb-6"
                        >

                            <div>
                                <label className="block font-semibold mb-1">Tipo de documento</label>
                                <select 
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.tipo_documento}
                                    onChange={e => setData('tipo_documento', e.target.value)}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="CC">Cédula</option>
                                    <option value="TI">Tarjeta</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Número</label>
                                <input 
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.numero_documento}
                                    onChange={e => handleInput(e, 'numero_documento', 'numbers')}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Primer nombre</label>
                                <input 
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.nombre1}
                                    onChange={e => handleInput(e, 'nombre1', 'no-special')}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Segundo nombre</label>
                                <input 
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.nombre2}
                                    onChange={e => handleInput(e, 'nombre2', 'no-special')}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Primer apellido</label>
                                <input 
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.apellido1}
                                    onChange={e => handleInput(e, 'apellido1', 'no-special')}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Segundo apellido</label>
                                <input 
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.apellido2}
                                    onChange={e => handleInput(e, 'apellido2', 'no-special')}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block font-semibold mb-1">Fecha de nacimiento</label>
                                <input 
                                    type="date"
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.fecha_nacimiento}
                                    onChange={e => setData('fecha_nacimiento', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Teléfono</label>
                                <input 
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.telefono}
                                    onChange={e => handleInput(e, 'telefono', 'numbers')}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Ciudad</label>
                                <select 
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.ciudad}
                                    onChange={e => setData('ciudad', e.target.value)}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="Medellin">Medellín</option>
                                    <option value="Itagui">Itagüí</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block font-semibold mb-1">Correo electrónico</label>
                                <input 
                                    type="email"
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.email}
                                    onChange={e => handleInput(e, 'email', 'no-spaces')}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Contraseña</label>
                                <input 
                                    type="password"
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.password}
                                    onChange={e => handleInput(e, 'password', 'no-spaces')}
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Confirmar contraseña</label>
                                <input 
                                    type="password"
                                    className="w-full border-b border-[#5D4E3F]/40 bg-transparent py-2 outline-none focus:border-[#5D4E3F]"
                                    value={data.password_confirmation}
                                    onChange={e => handleInput(e, 'password_confirmation', 'no-spaces')}
                                />
                            </div>

                            <div className="col-span-2 mt-6">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#5D4E3F] text-white py-3 rounded-md font-bold hover:bg-[#FFC600] hover:text-[#5D4E3F] transition"
                                >
                                    Crear cuenta
                                </button>
                            </div>

                            <div className="col-span-2 text-center mt-3">
                                <Link href="/login" className="font-semibold underline hover:text-[#A68966]">
                                    ¿Ya tienes cuenta? Inicia sesión
                                </Link>
                            </div>

                        </form>
                    </div>
                </div>

                {/* DERECHA */}
                <div className="w-1/2 flex justify-end items-end pt-10 pr-10 pb-4">
                    <Link href="/" className="bg-[#A68966] text-white px-8 py-2 rounded-full font-semibold">
                        Volver al inicio
                    </Link>
                </div>
            </div>

            {/* SCROLL BONITO 🔥 */}
            <style jsx>{`
                div::-webkit-scrollbar {
                    width: 8px;
                }
                div::-webkit-scrollbar-thumb {
                    background: #63522B;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import Sidebar from './Sidebar';
import MiniJuegoMouri from '@/Components/MouriGame/MiniJuegoMouri';
import axios from 'axios';

export default function Datos() {
    const { auth, flash, generos } = usePage().props;
    const usuario = auth?.user || {};

    const [mostrarModal, setMostrarModal] = useState(false);
    const [codigoVerificacion, setCodigoVerificacion] = useState(['', '', '', '', '', '']);
    const [enviandoEmail, setEnviandoEmail] = useState(false);
    const [errorCodigo, setErrorCodigo] = useState('');
    const [errorFormulario, setErrorFormulario] = useState('');
    const [validandoToken, setValidandoToken] = useState(false);
    const [digitosCasino, setDigitosCasino] = useState(['0', '0', '0', '0', '0', '0']);

    // 🆕 Referencias a cada casilla del código, para poder controlar el foco
    // con precisión (avanzar, retroceder con Backspace, flechas, pegar el código completo).
    const inputsCodigoRef = useRef([]);

    const { data, setData, put, processing, errors } = useForm({
        nombre1: '',
        nombre2: '',
        apellido1: '',
        apellido2: '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        cedula: usuario.cedula || '',
        genero_id: usuario.genero_id || '',
        fecha_nacimiento: usuario.fecha_nacimiento || '',
        codigo_ingresado: '',
    });

    useEffect(() => {
        if (usuario && usuario.id) {
            let n1 = '', n2 = '', a1 = '', a2 = '';

            if (usuario.nombre) {
                const partes = usuario.nombre.trim().split(/\s+/);
                if (partes.length === 2) {
                    n1 = partes[0];
                    a1 = partes[1];
                } else if (partes.length === 3) {
                    n1 = partes[0];
                    n2 = partes[1];
                    a1 = partes[2];
                } else if (partes.length >= 4) {
                    n1 = partes[0];
                    n2 = partes[1];
                    a1 = partes[2];
                    a2 = partes.slice(3).join(' ');
                } else {
                    n1 = usuario.nombre;
                }
            }

            setData({
                nombre1: usuario.nombre1 || n1,
                nombre2: usuario.nombre2 || n2,
                apellido1: usuario.apellido1 || a1,
                apellido2: usuario.apellido2 || a2,
                email: usuario.email || '',
                telefono: usuario.telefono || '',
                cedula: usuario.cedula || '',
                genero_id: usuario.genero_id || '',
                fecha_nacimiento: usuario.fecha_nacimiento || '',
                codigo_ingresado: '',
            });
        }
    }, [auth]);

    const nombreParaMostrar = usuario.nombre ? usuario.nombre.split(' ')[0] : (usuario.name || "Usuario");

    // 🌗 cambia el tema del usuario (mismo patrón que Ajustes.jsx admin)
    const cambiarTema = (tema) => {
        router.put('/cliente/ajustes/tema', { tema }, { preserveScroll: true });
    };

    const formatName = (text) => {
        const cleanText = text.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ]/g, '');
        if (cleanText.length === 0) return '';
        return cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase();
    };

    const handleTelefonoChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            setData('telefono', value);
        }
    };

    useEffect(() => {
        let intervalo;
        if (validandoToken) {
            intervalo = setInterval(() => {
                setDigitosCasino(
                    Array.from({ length: 6 }, () => Math.floor(Math.random() * 10).toString())
                );
            }, 70);
        }
        return () => clearInterval(intervalo);
    }, [validandoToken]);

    const calcularEdad = (fecha) => {
        if (!fecha) return 0;
        const hoy = new Date();
        const cumpleanos = new Date(fecha + 'T00:00:00');
        let edad = hoy.getFullYear() - cumpleanos.getFullYear();
        const m = hoy.getMonth() - cumpleanos.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
            edad--;
        }
        return edad;
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();

        if (data.telefono.length !== 10) {
            setErrorFormulario('El número de teléfono móvil debe tener exactamente 10 dígitos.');
            return;
        }

        if (!data.fecha_nacimiento) {
            setErrorFormulario('Por favor, selecciona tu fecha de nacimiento.');
            return;
        }

        const edad = calcularEdad(data.fecha_nacimiento);

        if (edad <= 7 || edad > 75) {
            setErrorFormulario('Debes tener más de 7 y máximo 75 años para actualizar tus datos.');
            return;
        }

        setEnviandoEmail(true);
        setErrorFormulario('');
        setErrorCodigo('');

        axios.post(route('user.enviar-codigo'), { email: data.email })
            .then(response => {
                setEnviandoEmail(false);
                if (response.data.success) {
                    setMostrarModal(true);
                } else {
                    setErrorFormulario(response.data.message || 'Este correo ya está en uso.');
                }
            })
            .catch(error => {
                setEnviandoEmail(false);
                if (error.response && error.response.status === 422) {
                    setErrorFormulario('No puedes usar ese correo electrónico. Ya está asignado a otra cuenta.');
                } else {
                    setErrorFormulario('Error al procesar la solicitud. Verifica el correo e intenta de nuevo.');
                }
            });
    };

    const handleConfirmarCodigo = () => {
        const codigoCompleto = codigoVerificacion.join('');

        if (codigoCompleto.length !== 6) {
            setErrorCodigo('Por favor, ingresa los 6 dígitos.');
            return;
        }

        setErrorCodigo('');
        setValidandoToken(true);

        router.put(route('user.update', usuario.id), {
            ...data,
            codigo_ingresado: codigoCompleto,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setValidandoToken(false);
                setMostrarModal(false);
            },
            onError: (errors) => {
                setValidandoToken(false);
                setErrorCodigo(errors.codigo || errors.telefono || errors.email || 'Verifica los datos ingresados.');
            },
        });
    };

    // 🆕 REESCRITO: manejo del código de 6 dígitos, más "trabajable".
    // - Al escribir, avanza a la siguiente casilla (igual que antes).
    // - Al enfocar una casilla (clic o Tab), selecciona su contenido, así con solo
    //   escribir un número nuevo lo reemplazas directo sin tener que borrar primero.
    // - Backspace: si la casilla actual tiene valor, lo borra; si ya está vacía,
    //   retrocede a la anterior y la borra también (como en apps de verificación reales).
    // - Flechas ← → para moverte manualmente entre casillas.
    // - Pegar (Ctrl+V) un código completo de 6 dígitos lo reparte automáticamente en todas las casillas.
    const handleCodigoChange = (e, index) => {
        const soloDigitos = e.target.value.replace(/\D/g, '');

        if (soloDigitos.length === 0) {
            const nuevoCodigo = [...codigoVerificacion];
            nuevoCodigo[index] = '';
            setCodigoVerificacion(nuevoCodigo);
            return;
        }

        // Si el usuario tenía el texto seleccionado y escribió, nos quedamos con el último dígito tecleado
        const digito = soloDigitos.slice(-1);
        const nuevoCodigo = [...codigoVerificacion];
        nuevoCodigo[index] = digito;
        setCodigoVerificacion(nuevoCodigo);

        if (index < 5) {
            inputsCodigoRef.current[index + 1]?.focus();
        }
    };

    const handleCodigoKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const nuevoCodigo = [...codigoVerificacion];

            if (nuevoCodigo[index]) {
                // Hay algo en esta casilla: la borramos y nos quedamos aquí
                nuevoCodigo[index] = '';
                setCodigoVerificacion(nuevoCodigo);
            } else if (index > 0) {
                // Ya estaba vacía: retrocedemos y borramos la anterior
                nuevoCodigo[index - 1] = '';
                setCodigoVerificacion(nuevoCodigo);
                inputsCodigoRef.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            inputsCodigoRef.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            e.preventDefault();
            inputsCodigoRef.current[index + 1]?.focus();
        }
    };

    const handleCodigoPaste = (e) => {
        e.preventDefault();
        const pegado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pegado) return;

        const nuevoCodigo = pegado.split('');
        while (nuevoCodigo.length < 6) nuevoCodigo.push('');
        setCodigoVerificacion(nuevoCodigo);

        const indiceEnfoque = Math.min(pegado.length, 5);
        inputsCodigoRef.current[indiceEnfoque]?.focus();
    };

    return (
        <div className="min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] dark:text-[#EDE4D3] flex flex-col md:flex-row overflow-x-hidden transition-all duration-1000 bg-[#FFFFFF] dark:bg-[#221D17]">
            <Head title="Tus Datos - Mouren" />

            <Sidebar />

            <main className="flex-1 w-full min-w-0 p-4 sm:p-6 md:p-10 content-shift transition-all duration-700 ease-in-out">

                <header className="flex flex-wrap justify-between items-start gap-4 mb-6 sm:mb-10 animate-fade-in">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter leading-tight break-words">
                            Mantén tu info al día,
                            <span className="text-[#A68966]"> {nombreParaMostrar}</span>
                        </h1>
                        <p className="text-[10px] sm:text-[11px] italic opacity-70 mt-1">"Para que descanses mejor que en vida"</p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {/* 🌗 toggle de Modo Claro / Oscuro */}
                        <div className="flex items-center gap-1.5 bg-white/30 dark:bg-black/20 p-1.5 px-3 rounded-full border border-white/50 dark:border-white/10 shadow-sm backdrop-blur-sm text-[9px] sm:text-[10px] font-bold">
                            <button
                                onClick={() => cambiarTema('claro')}
                                className={usuario.tema === 'claro' ? 'text-[#5D4E3F] dark:text-[#EDE4D3] underline' : 'text-gray-400'}
                            >
                                ☀️ Claro
                            </button>
                            <span className="text-gray-300">/</span>
                            <button
                                onClick={() => cambiarTema('oscuro')}
                                className={usuario.tema === 'oscuro' ? 'text-[#5D4E3F] dark:text-[#EDE4D3] underline' : 'text-gray-400'}
                            >
                                🌙 Oscuro
                            </button>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 bg-white/30 dark:bg-black/20 p-2 rounded-full border border-white/50 dark:border-white/10 shadow-sm backdrop-blur-sm">
                            <button className="w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-[#2E2720] rounded-full flex items-center justify-center hover:scale-110 transition shadow-sm text-sm text-[#5D4E3F] dark:text-[#EDE4D3]">🔔</button>
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md bg-[#5D4E3F] text-white">
                                {nombreParaMostrar[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto">
                    <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 italic border-b pb-2 border-[#5D4E3F]/10 dark:border-[#4A4033]">Tus datos personales:</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch mb-10 sm:mb-12">

                        <div className="md:col-span-2 bg-[#FAF8F5] dark:bg-[#2E2720] p-5 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] shadow-lg border border-[#5D4E3F]/5 dark:border-[#4A4033] flex flex-col justify-between relative overflow-hidden group">
                            <div className="relative z-10 w-full">
                                {flash?.message && (
                                    <div className="mb-6 p-4 bg-[#302A1D] text-[#F4EDE6] rounded-2xl text-xs font-bold border-l-4 border-[#A68966] shadow-sm animate-fade-in">
                                        ✨ {flash.message}
                                    </div>
                                )}

                                {errorFormulario && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-2xl text-xs font-bold border-l-4 border-red-500 dark:border-red-900 shadow-sm animate-fade-in flex items-center gap-2">
                                        ⚠️ <span>{errorFormulario}</span>
                                    </div>
                                )}

                                {Object.keys(errors).length > 0 && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-2xl text-xs font-bold border-l-4 border-red-500 dark:border-red-900 shadow-sm animate-fade-in">
                                        {Object.values(errors).map((err, i) => <p key={i}>• {err}</p>)}
                                    </div>
                                )}

                                <form onSubmit={handlePreSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Primer Nombre *</label>
                                            <input type="text" value={data.nombre1} onChange={e => setData('nombre1', formatName(e.target.value))} className="w-full bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-[#4A4033] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all" required />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Segundo Nombre</label>
                                            <input type="text" value={data.nombre2} onChange={e => setData('nombre2', formatName(e.target.value))} className="w-full bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-[#4A4033] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Primer Apellido *</label>
                                            <input type="text" value={data.apellido1} onChange={e => setData('apellido1', formatName(e.target.value))} className="w-full bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-[#4A4033] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all" required />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Segundo Apellido</label>
                                            <input type="text" value={data.apellido2} onChange={e => setData('apellido2', formatName(e.target.value))} className="w-full bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-[#4A4033] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Documento de Identidad</label>
                                            <input type="text" value={data.cedula} className="w-full bg-[#EFECE8] dark:bg-[#3A322A] border border-neutral-300 dark:border-[#4A4033] text-neutral-500 dark:text-[#8F8368] rounded-xl px-4 py-2.5 text-xs cursor-not-allowed font-sans" disabled />
                                            <p className="text-[10px] text-[#A68966] italic mt-1.5 flex items-start gap-1 leading-snug">
                                                <span>ℹ️</span> <span>El documento no se puede modificar. Si hay un error, contacta a
                                                <a href="mailto:soporte@mouren.com?subject=Correccion de Cedula" className="underline font-bold hover:text-[#302A1D] dark:hover:text-[#EDE4D3] transition-colors ml-0.5">
                                                    Soporte Mouren
                                                </a>.</span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Teléfono Móvil *</label>
                                            <input type="text" value={data.telefono} onChange={handleTelefonoChange} placeholder="Ej. 3001234567" className="w-full bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-[#4A4033] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all font-sans" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Género</label>
                                            <select
                                                value={data.genero_id}
                                                onChange={e => setData('genero_id', e.target.value)}
                                                className="w-full bg-white dark:bg-[#221D17] border border-[#A68966]/20 dark:border-[#4A4033] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all text-[#5D4E3F] dark:text-[#EDE4D3]"
                                            >
                                                <option value="" className="text-black">Selecciona tu género</option>
                                                {generos.map((g) => (
                                                    <option key={g.id} value={g.id} className="text-black">{g.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Fecha de Nacimiento</label>
                                            <input
                                                type="date"
                                                value={data.fecha_nacimiento}
                                                onChange={e => setData('fecha_nacimiento', e.target.value)}
                                                className="w-full bg-white dark:bg-[#221D17] border border-[#A68966]/20 dark:border-[#4A4033] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all font-sans text-[#5D4E3F] dark:text-[#EDE4D3]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Correo Electrónico *</label>
                                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-[#4A4033] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all font-sans" required />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 relative z-10">
                                        <a
                                            href="/mi-plan/certificado"
                                            className="w-full sm:w-auto py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl font-bold text-xs bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border-2 border-[#A68966] text-[#5D4E3F] hover:bg-[#A68966] hover:text-white transition-all duration-300 shadow-sm uppercase tracking-widest text-center"
                                        >
                                            📄 Descargar Certificado
                                        </a>

                                        <button
                                            type="submit"
                                            disabled={enviandoEmail || processing || data.telefono.length !== 10}
                                            className="w-full sm:w-auto py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl font-bold text-xs bg-[#302A1D] text-white hover:bg-[#A68966] transition-all duration-300 shadow-md uppercase tracking-widest disabled:opacity-40"
                                        >
                                            {enviandoEmail ? 'Validando...' : processing ? 'Guardando...' : 'Verificar y Actualizar'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="bg-[#5D4E3F] dark:bg-[#2E2720] text-[#F4EDE6] p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[300px] sm:min-h-[350px] group">
                            <img src="/images/elementos_dashboard/flores_esquinas_tarjeta1.png" className="absolute -top-6 -left-6 w-28 sm:w-40 opacity-40 pointer-events-none transform rotate-40 transition-all group-hover:opacity-80" alt="flores_esquina_superior" />
                            <img src="/images/elementos_dashboard/flores_esquinas_tarjeta1.png" className="absolute -bottom-6 -right-6 w-28 sm:w-40 opacity-40 pointer-events-none transform -rotate-90 transition-all group-hover:opacity-60" alt="flores_esquina_inferior" />

                            <div className="relative z-10 bg-[#4A3E32] text-[10px] px-4 py-2 rounded-2xl border border-[#A68966]/40 max-w-[210px] animate-bounce mb-3 italic shadow-md text-center">
                                "Revisar bien tus datos asegura la paz de tus seres queridos (¡humanos y peluditos!)"
                                <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#4A3E32] rotate-45 border-r border-b border-[#A68966]/40"></div>
                            </div>

                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[#4A3E32] rounded-full flex items-center justify-center p-3 shadow-lg relative z-10 mb-4 transition-transform duration-500 group-hover:scale-105">
                                <img src="/images/login/mouri_registro_exitoso.gif" alt="Mascota Mouri" className="w-full h-full object-contain" />
                            </div>

                            <div className="relative z-10 max-w-[200px]">
                                <p className="text-xs font-bold italic tracking-wide opacity-90 leading-relaxed">"Para que descanses mejor que en vida"</p>
                                <span className="block text-[9px] uppercase tracking-widest mt-1 text-[#A68966] font-black">- Mouri</span>
                            </div>
                        </div>

                    </div>

                    <div className="w-full animate-fade-in block">
                        <h3 className="text-base sm:text-lg font-bold mb-4 italic border-b pb-2 border-[#5D4E3F]/10 dark:border-[#4A4033] flex items-center gap-2">
                            🎮 <span>Un descanso con Mouri:</span>
                        </h3>
                        <MiniJuegoMouri />
                    </div>

                </div>
            </main>

            {mostrarModal && (
                <div className="fixed inset-0 bg-[#302A1D]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#FFFFFF] dark:bg-[#2E2720] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden">
                        <h3 className="text-base sm:text-lg font-black text-[#302A1D] dark:text-[#EDE4D3] mb-1">Código de Seguridad</h3>
                        <p className="text-[10px] sm:text-[11px] text-[#5D4E3F] dark:text-[#C2B49A] opacity-70 mb-6 italic">Ingresa el token de 6 dígitos enviado.</p>

                        {errorCodigo && <div className="text-[10px] text-red-600 dark:text-red-400 font-bold mb-4 bg-red-50 dark:bg-red-950/40 py-1.5 px-3 rounded-lg">{errorCodigo}</div>}

                        <div className="relative min-h-[50px] flex justify-center items-center mb-8">
                            {!validandoToken ? (
                                <div className="flex justify-center gap-1.5 sm:gap-2">
                                    {codigoVerificacion.map((num, index) => (
                                        <input
                                            key={index}
                                            ref={el => (inputsCodigoRef.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength="1"
                                            value={num}
                                            onChange={e => handleCodigoChange(e, index)}
                                            onKeyDown={e => handleCodigoKeyDown(e, index)}
                                            onFocus={e => e.target.select()}
                                            onPaste={handleCodigoPaste}
                                            className="w-9 h-12 sm:w-10 sm:h-14 bg-[#FAF8F5] dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/30 dark:border-[#4A4033] rounded-xl text-center font-black text-base text-[#302A1D] dark:text-[#EDE4D3] font-sans focus:outline-none focus:border-[#A68966] focus:ring-2 focus:ring-[#A68966]/40 transition-all"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex justify-center gap-1.5 sm:gap-2">
                                    {digitosCasino.map((digito, index) => (
                                        <div key={index} className="w-9 h-12 sm:w-10 sm:h-14 bg-[#302A1D] border border-[#A68966] rounded-xl flex items-center justify-center text-white font-black text-xl font-sans">{digito}</div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setMostrarModal(false)} disabled={validandoToken} className="px-5 sm:px-6 py-3 rounded-xl border border-neutral-200 dark:border-[#4A4033] text-[10px] uppercase font-bold tracking-widest dark:text-[#EDE4D3]">Volver</button>
                            <button onClick={handleConfirmarCodigo} disabled={validandoToken} className="px-5 sm:px-6 py-3 rounded-xl bg-[#302A1D] text-[#F4EDE6] text-[10px] uppercase font-bold tracking-widest">
                                {validandoToken ? 'Verificando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import Sidebar from './Sidebar';
import axios from 'axios';

export default function Datos() {
    // Jalamos la información de auth directamente de los props globales de Inertia como en MiPlan
    const { auth, flash } = usePage().props;
    const usuario = auth?.user || {};
    
    const [mostrarModal, setMostrarModal] = useState(false);
    const [codigoVerificacion, setCodigoVerificacion] = useState(['', '', '', '', '', '']);
    const [enviandoEmail, setEnviandoEmail] = useState(false);
    const [errorCodigo, setErrorCodigo] = useState('');
    
    // Estados para el efecto "Casino / Lotería"
    const [validandoToken, setValidandoToken] = useState(false);
    const [digitosCasino, setDigitosCasino] = useState(['0', '0', '0', '0', '0', '0']);

    // Inicializamos con los datos actuales para que siempre sean visibles
    const { data, setData, put, processing, errors } = useForm({
        nombre1: usuario.nombre1 || '',
        nombre2: usuario.nombre2 || '',
        apellido1: usuario.apellido1 || '',
        apellido2: usuario.apellido2 || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        cedula: usuario.cedula || '',
        codigo_ingresado: '',
    });

    // Misma lógica de extracción de nombre que usas en tu dashboard
    const nombreParaMostrar =
        usuario.nombre1 ||
        (usuario.nombre ? usuario.nombre.split(' ')[0] : null) ||
        usuario.name ||
        "Usuario";

    // Función para formatear nombres: quita espacios, caracteres raros y pone Primera letra Mayúscula
    const formatName = (text) => {
        const cleanText = text.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ]/g, '');
        if (cleanText.length === 0) return '';
        return cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase();
    };

    // Función para formatear el teléfono a solo números y máximo 10 dígitos
    const handleTelefonoChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Quita cualquier cosa que no sea número
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

    const handlePreSubmit = (e) => {
        e.preventDefault();
        
        // Validación extra por seguridad de los 10 dígitos
        if (data.telefono.length !== 10) {
            alert('El número de teléfono móvil debe tener exactamente 10 dígitos.');
            return;
        }

        setEnviandoEmail(true);
        setErrorCodigo('');

        axios.post(route('user.enviar-codigo'), { email: data.email })
            .then(response => {
                setEnviandoEmail(false);
                if (response.data.success) {
                    setMostrarModal(true);
                }
            })
            .catch(error => {
                setEnviandoEmail(false);
                alert('Hubo un error al enviar el código de verificación. Inténtalo de nuevo.');
            });
    };

    const handleConfirmarCodigo = () => {
        const codigoCompleto = codigoVerificacion.join('');
        if (codigoCompleto.length === 6) {
            setErrorCodigo('');
            setValidandoToken(true); 

            setTimeout(() => {
                data.codigo_ingresado = codigoCompleto; 
                
                put(route('user.update', usuario.id), {
                    onFinish: () => setValidandoToken(false),
                    onSuccess: () => setMostrarModal(false),
                    onError: (err) => {
                        setValidandoToken(false);
                        if (err.codigo) {
                            setErrorCodigo(err.codigo);
                        }
                    }
                });
            }, 1500);

        } else {
            setErrorCodigo('Por favor, ingresa los 6 dígitos.');
        }
    };

    const handleCodigoChange = (element, index) => {
        if (isNaN(element.value)) return false;
        let nuevoCodigo = [...codigoVerificacion];
        nuevoCodigo[index] = element.value;
        setCodigoVerificacion(nuevoCodigo);

        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    return (
        <div className="min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] flex overflow-x-hidden transition-all duration-1000 bg-[#FFFFFF]">
            <Head title="Tus Datos - Mouren" />
            
            <Sidebar />

            <main className="flex-1 p-6 md:p-10 content-shift transition-all duration-700 ease-in-out">
                
                {/* Header dinámico con tu nombre real */}
                <header className="flex justify-between items-start mb-10 animate-fade-in">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight">
                            Manten tu info al dia,
                            <span className="text-[#A68966]"> {nombreParaMostrar}</span>
                        </h1>
                        <p className="text-[11px] italic opacity-70 mt-1">"Para que descanses mejor que en vida"</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white/30 p-2 rounded-full border border-white/50 shadow-sm backdrop-blur-sm">
                        <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-110 transition shadow-sm text-sm text-[#5D4E3F]">🔔</button>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md bg-[#5D4E3F] text-white">
                            {nombreParaMostrar[0]}
                        </div>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl font-bold mb-6 italic border-b pb-2 border-[#5D4E3F]/10">Tus datos personales:</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        
                        {/* TARJETA 1: FORMULARIO DE CONFIGURACIÓN */}
                        <div className="md:col-span-2 bg-[#FAF8F5] p-8 rounded-[45px] shadow-lg border border-[#5D4E3F]/5 flex flex-col justify-between relative overflow-hidden group">
                            
                            <img src="/images/elementos_dashboard/flores_esquinas_tarjeta1.png" className="absolute -top-8 -right-12 w-50 opacity-60 pointer-events-none transition-all group-hover:opacity-60" alt="flores" />

                            <div className="relative z-10">
                                {flash?.message && (
                                    <div className="mb-6 p-4 bg-[#302A1D] text-[#F4EDE6] rounded-2xl text-xs font-bold border-l-4 border-[#A68966] shadow-sm">
                                        ✨ {flash.message}
                                    </div>
                                )}

                                <form onSubmit={handlePreSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Primer Nombre *</label>
                                            <input type="text" value={data.nombre1} onChange={e => setData('nombre1', formatName(e.target.value))} className="w-full bg-white border border-[#A68966]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all" required />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Segundo Nombre</label>
                                            <input type="text" value={data.nombre2} onChange={e => setData('nombre2', formatName(e.target.value))} className="w-full bg-white border border-[#A68966]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Primer Apellido *</label>
                                            <input type="text" value={data.apellido1} onChange={e => setData('apellido1', formatName(e.target.value))} className="w-full bg-white border border-[#A68966]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all" required />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Segundo Apellido</label>
                                            <input type="text" value={data.apellido2} onChange={e => setData('apellido2', formatName(e.target.value))} className="w-full bg-white border border-[#A68966]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Documento de Identidad</label>
                                            <input type="text" value={data.cedula} className="w-full bg-[#EFECE8] border border-neutral-300 text-neutral-500 rounded-xl px-4 py-2.5 text-xs cursor-not-allowed font-sans" disabled />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Teléfono Móvil (10 dígitos) *</label>
                                            <input type="text" value={data.telefono} onChange={handleTelefonoChange} placeholder="Ej. 3001234567" className="w-full bg-white border border-[#A68966]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all font-sans" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70">Correo Electrónico *</label>
                                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full bg-white border border-[#A68966]/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all font-sans" required />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end relative z-10">
                                        <button 
                                            type="submit" 
                                            disabled={enviandoEmail || processing || data.telefono.length !== 10} 
                                            className="w-full sm:w-auto py-4 px-8 rounded-2xl font-bold text-xs bg-[#302A1D] text-white hover:bg-[#A68966] transition-all duration-300 shadow-md uppercase tracking-widest disabled:opacity-40 active:scale-95"
                                        >
                                            {enviandoEmail ? 'Solicitando Código...' : processing ? 'Guardando...' : 'Verificar y Actualizar'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <img src="/images/login/elementos_dashboard/flores_esquinas_tarjeta.png" className="absolute bottom-2 right-2 w-32 opacity-5 group-hover:opacity-40 transition-opacity" alt="" />
                        </div>

                        {/* TARJETA 2: BANNER INFORMATIVO */}
                        <div className="bg-[#5D4E3F] text-[#F4EDE6] p-8 rounded-[45px] shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[320px]">
                            <img src="/images/elementos_dashboard/flores-esquina-top.png" className="absolute -top-4 -right-4 w-36 opacity-60 pointer-events-none" alt="flores" />
                            <img src="/images/elementos_dashboard/flores-esquina-bottom.png" className="absolute -bottom-4 -left-4 w-36 opacity-60 pointer-events-none" alt="flores" />

                            <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-4 font-bold rounded-2xl text-[15px] italic mb-6 max-w-[200px] leading-relaxed relative z-10 shadow-inner">
                                "Cuidar de tu información personal es parte fundamental de nuestra promesa de resguardo."
                            </div>
                            
                            <div className="w-40 h-40 bg-[#4A3E32] rounded-full flex items-center justify-center p-3 shadow-lg border border-[#A68966]/20 relative z-10">
                                <img src="/images/login/mouri_registro_exitoso.gif" alt="Mascota" className="w-full h-full object-contain filter drop-shadow-md" />
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.8s ease-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                main::-webkit-scrollbar { width: 5px; }
                main::-webkit-scrollbar-thumb { background: #080602; border-radius: 10px; }
            `}</style>

            {/* MODAL DE VERIFICACIÓN */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-[#302A1D]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-[#FFFFFF] rounded-[36px] p-8 max-w-sm w-full border border-neutral-100 shadow-2xl text-center relative overflow-hidden animate-fade-in">
                        
                        <span className="text-xl mb-1 block text-[#A68966]">✦</span>
                        <h3 className="text-lg font-black tracking-tight text-[#302A1D] mb-1">Código de Seguridad</h3>
                        <p className="text-[11px] text-[#5D4E3F] opacity-70 mb-6 italic leading-snug">Ingresa el token de 6 dígitos enviado.</p>
                        
                        {errorCodigo && <div className="text-[10px] text-red-600 font-bold mb-4 bg-red-50 py-1.5 px-3 rounded-lg">{errorCodigo}</div>}

                        <div className="relative min-h-[50px] flex justify-center items-center mb-8">
                            {!validandoToken ? (
                                <div className="flex justify-center gap-2">
                                    {codigoVerificacion.map((num, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            maxLength="1"
                                            value={num}
                                            onChange={e => handleCodigoChange(e.target, index)}
                                            onFocus={e => e.target.select()}
                                            className="w-10 h-14 bg-[#FAF8F5] border border-[#A68966]/30 rounded-xl text-center font-black text-base text-[#302A1D] focus:outline-none focus:border-[#302A1D] transition-all font-sans"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex justify-center gap-2">
                                    {digitosCasino.map((digito, index) => (
                                        <div 
                                            key={index} 
                                            className="w-10 h-14 bg-[#302A1D] border border-[#A68966] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md font-sans border-b-4"
                                        >
                                            {digito}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setMostrarModal(false)} disabled={validandoToken} className="px-6 py-3 rounded-xl border border-neutral-200 text-[10px] uppercase font-bold tracking-widest hover:bg-neutral-50 transition-colors disabled:opacity-30">
                                Volver
                            </button>
                            <button onClick={handleConfirmarCodigo} disabled={validandoToken} className="px-6 py-3 rounded-xl bg-[#302A1D] text-[#F4EDE6] text-[10px] uppercase font-bold tracking-widest hover:bg-[#A68966] transition-colors shadow-md">
                                {validandoToken ? 'Verificando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState, useRef } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import Sidebar from './Sidebar';

export default function MiPlan({ suscripcion = null }) {
    console.log("Datos recibidos en suscripcion:", suscripcion);
    const { auth } = usePage().props;
    const usuario = auth?.user || {};

    // --- ESTADOS PARA LA MÚSICA Y EL FONDO DINÁMICO ---
    const [reproduciendo, setReproduciendo] = useState(false);
    const audioRef = useRef(null);

    // 1. CAPTURA DEL OBJETO CANCIÓN (Soporta múltiples nombres de relación)
    const cancionObjeto = suscripcion?.cancion_tributo || suscripcion?.cancion;
    
    // 2. OBTENER EL NOMBRE REAL DEL ARCHIVO (De la columna 'archivo_audio' de tu BD)
    const nombreArchivo = cancionObjeto?.archivo_audio || "";

    // 3. CONSTRUCCIÓN DE LA RUTA RELATIVA PARA EL NAVEGADOR
    const urlCancion = nombreArchivo 
        ? `/images/planes/album/${nombreArchivo}` 
        : "";

    // 4. TITULO DE LA CANCIÓN
    const nombreCancion = cancionObjeto?.titulo || 
                          suscripcion?.afiliados?.[0]?.servicio_funerario?.cancion?.titulo || 
                          'Melodía por definir';

    const controlarMusica = () => {
        if (!nombreArchivo) {
            alert("No hay un archivo de audio asignado a esta canción aún en la base de datos.");
            return;
        }

        if (reproduciendo) {
            audioRef.current.pause();
            setReproduciendo(false);
        } else {
            audioRef.current.play().catch(error => {
                console.error("Error al intentar reproducir el archivo:", error);
                alert("No se pudo cargar el archivo. Verifica que exista en public/images/planes/album/");
            });
            setReproduciendo(true);
        }
    };

    const alTerminarCancion = () => {
        setReproduciendo(false);
    };
    // --------------------------------------------------

    const nombreParaMostrar =
        usuario.nombre1 ||
        (usuario.nombre ? usuario.nombre.split(' ')[0] : null) ||
        usuario.name ||
        "Usuario";

    const editarNombre = (afiliadoId, nombreActual) => {
        const nuevoNombre = prompt("Editar nombre del beneficiario:", nombreActual);
        if (nuevoNombre && nuevoNombre.trim() !== "" && nuevoNombre !== nombreActual) {
            router.patch(`/afiliados/${afiliadoId}`, {
                nombre: nuevoNombre
            }, {
                preserveScroll: true,
                onSuccess: () => console.log("Nombre actualizado"),
            });
        }
    };

    return (
        <div className={`min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] flex overflow-x-hidden transition-all duration-1000 ${
            reproduciendo 
            ? 'bg-gradient-to-br from-[#4A3B2C] via-[#A68966] via-[#F5C453] to-[#8C6F4F] bg-[length:300%300%] animate-gradient-bg text-white' 
            : 'bg-[#FFFFFF]'
        }`}>
            <Head title="Mi Plan - Mouren" />

            {/* Elemento de audio invisible controlado por React */}
            {urlCancion && (
                <audio 
                    ref={audioRef} 
                    src={urlCancion} 
                    onEnded={alTerminarCancion}
                />
            )}

            <Sidebar />

            <main className="flex-1 p-6 md:p-10 content-shift transition-all duration-700 ease-in-out">

                <header className="flex justify-between items-start mb-10 animate-fade-in">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight">
                            Nos alegra verte,
                            <span className={reproduciendo ? 'text-[#FFD97D]' : 'text-[#A68966]'}> {nombreParaMostrar}</span>
                        </h1>
                        <p className="text-[11px] italic opacity-70 mt-1">"Para que descanses mejor que en vida"</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white/30 p-2 rounded-full border border-white/50 shadow-sm backdrop-blur-sm">
                        <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-110 transition shadow-sm text-sm text-[#5D4E3F]">🔔</button>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${reproduciendo ? 'bg-[#FFD97D] text-[#4A3B2C]' : 'bg-[#5D4E3F] text-white'}`}>
                            {nombreParaMostrar[0]}
                        </div>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto">
                    <h2 className={`text-xl font-bold mb-6 italic border-b pb-2 ${reproduciendo ? 'border-white/20' : 'border-[#5D4E3F]/10'}`}>Mi plan Funerario:</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* TARJETA 1: INFO DEL PLAN */}
                        <div className={`${suscripcion ? (reproduciendo ? 'bg-[#362A1F]/90 text-white border-white/30' : 'bg-[#5D4E3F] text-white') : 'bg-[#CDC2AD] text-[#5D4E3F]' } p-8 rounded-[45px] shadow-lg border relative group overflow-hidden flex flex-col h-full transition-all duration-500`}>
                            <div className="relative z-10">
                                <h3 className={`text-[10px] uppercase tracking-[3px] font-bold ${suscripcion ? (reproduciendo ? 'text-[#FFD97D]' : 'text-[#Ffffff]') : 'opacity-60'} mb-4 italic`}>
                                    {suscripcion ? 'Estado: Activo' : 'Primeros Pasos'}
                                </h3>
                                <h2 className="text-xl font-black mb-4 ">
                                    {suscripcion ? (suscripcion.plan?.nombre || 'Plan Contratado') : 'Inscríbete a un plan'}
                                </h2>

                                {suscripcion && (
                                <>
                                    <img src="/images/elementos_dashboard/flores_main.gif" className={`absolute -top-12 -right-12 w-[190px] opacity-80 pointer-events-none transition-all ${reproduciendo ? 'brightness-125 contrast-125' : ''}`} alt="flores" />
                                </>
                            )} {/*"C:\mouren\public\images\elementos_dashboard\detalles_plan\flores_esquinas_tarjeta1.png" */}

                                {suscripcion ? (
                                    <div className="space-y-3 mt-6">
                                        <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                                            <p className="text-[9px] uppercase opacity-60 font-bold">Cuota Mensual</p>
                                            <p className="text-2xl font-black text-[#FFBD2E]">${Number(suscripcion.cuota_mensual || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                                            <p className="text-[9px] uppercase opacity-60 font-bold">Inicio de Cobertura</p>
                                            <p className="text-sm font-bold">{suscripcion.fecha_inicio || 'Pendiente'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 mb-8">
                                        <div className="bg-white/20 p-3 rounded-2xl flex gap-3 items-center border border-white/10">
                                            <span className="bg-[#5D4E3F] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold italic">1</span>
                                            <p className="text-[10px] font-bold uppercase tracking-wider italic">Elige tu Plan</p>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-2xl flex gap-3 items-center border border-white/10">
                                            <span className="bg-[#5D4E3F] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold italic">2</span>
                                            <p className="text-[10px] font-bold uppercase tracking-wider italic">Registra Familiares</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link href={suscripcion ? "/detalles" : "/planes-disponibles"} className={`relative z-10 py-4 rounded-2xl font-bold text-xs text-center transition-all shadow-md active:scale-95 uppercase tracking-widest mt-10 ${reproduciendo ? 'bg-[#A68966] text-white hover:bg-[#8C6F4F]' : 'bg-[#302A1D] text-white hover:bg-[#4A3E32]'}`}>
                                {suscripcion ? 'Ver Detalles Completos' : 'Ver Planes Disponibles'}
                            </Link>

                            <img src="/images/login/elementos_dashboard/flores_esquinas_tarjeta.png" className="absolute bottom-2 right-2 w-32 opacity-5 group-hover:opacity-15 transition-opacity" alt="" />
                        </div>

                        {/* TARJETA 2: BENEFICIARIOS Y CANCIÓN */}
                        <div className={`${suscripcion ? (reproduciendo ? 'bg-white/20 border border-white/30 text-white backdrop-blur-md' : 'bg-[#D3CAB6] text-[#5D4E3F]') : 'bg-[#5D4E3F]'} p-8 rounded-[45px] shadow-2xl flex flex-col items-center justify-center text-center h-full transition-all duration-500 relative overflow-hidden`}>

                            {suscripcion && (
                                <>
                                    <img src="/images/elementos_dashboard/flores-esquina-top.png" className={`absolute -top-4 -right-4 w-40 opacity-80 pointer-events-none transition-all ${reproduciendo ? 'brightness-125 contrast-125' : ''}`} alt="flores" />
                                    <img src="/images/elementos_dashboard/flores-esquina-bottom.png" className={`absolute -bottom-4 -left-4 w-40 opacity-80 pointer-events-none transition-all ${reproduciendo ? 'brightness-125 contrast-125' : ''}`} alt="flores" />
                                </>
                            )}

                            {suscripcion ? (
                                <div className="w-full text-left relative z-10">
                                    <h3 className={`text-sm font-black uppercase mb-6 italic border-b pb-2 flex items-center gap-2 ${reproduciendo ? 'text-white border-white/20' : 'text-[#5D4E3F] border-[#5D4E3F]/10'}`}>
                                        Beneficiarios {reproduciendo ? '✨' : '🌼'}
                                    </h3>
                                    <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                        {suscripcion.afiliados?.length > 0 ? (
                                            suscripcion.afiliados.map((afi, idx) => (
                                                <div key={idx} className={`flex justify-between items-center p-3 rounded-[20px] rounded-tr-none text-[10px] font-bold uppercase tracking-tighter group hover:shadow-md transition-all border-l-4 ${reproduciendo ? 'bg-white/10 text-white border-[#FFD97D]' : 'bg-white/60 text-[#5D4E3F] border-[#A68966]'}`}>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">{afi.nombre}</span>
                                                        <span className={`text-[8px] italic ${reproduciendo ? 'text-[#FFD97D]' : 'text-[#A68966]'}`}>Vinculado: {afi.parentesco}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => editarNombre(afi.id, afi.nombre)}
                                                        className={`opacity-0 group-hover:opacity-100 p-2 rounded-full transition-all ${reproduciendo ? 'hover:bg-white/20 text-[#FFD97D]' : 'hover:bg-[#F4F1ED] text-[#A68966]'}`}
                                                        title="Editar nombre"
                                                    >
                                                        ✏️
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center py-6 opacity-40">
                                                <span className="text-2xl mb-2">🍃</span>
                                                <p className="text-[10px] italic text-center">Aún no has vinculado familiares.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* SECCIÓN DE CANCIÓN INTERACTIVA */}
                                    <div className={`mt-8 p-4 rounded-[25px] shadow-xl relative flex items-center justify-between gap-3 group transition-all duration-500 ${reproduciendo ? 'bg-[#362A1F] border border-white/10' : 'bg-[#5D4E3F] text-white'}`}>
                                        <div className={`absolute -top-3 right-4 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${reproduciendo ? 'bg-[#FFBD2E] text-[#362A1F]' : 'bg-[#A68966] text-white'}`}>
                                            {reproduciendo ? "Sonando En Vivo 🎵" : "En Memoria 🎶"}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[8px] uppercase opacity-60 font-bold tracking-widest mb-1">Tributo Musical Seleccionado:</p>
                                            <p className={`text-[11px] font-bold italic truncate ${reproduciendo ? 'text-[#FFBD2E] text-sm tracking-wide transition-all' : 'text-[#F4F1ED]'}`}>
                                                {nombreCancion}
                                            </p>
                                        </div>

                                        {/* Botón interactivo de Play / Pause */}
                                        <button 
                                            onClick={controlarMusica}
                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md text-xs border border-white/10 active:scale-90 ${
                                                reproduciendo ? 'bg-[#FFBD2E] text-[#5D4E3F] scale-110 shadow-lg' : 'bg-[#A68966] text-white hover:bg-[#c0a27d]'
                                            }`}
                                            title={reproduciendo ? "Pausar tributo" : "Escuchar tributo"}
                                        >
                                            {reproduciendo ? '⏸️' : '▶️'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-5 text-3xl">🛡️</div>
                                    <h3 className="text-lg font-bold mb-2 uppercase tracking-[0.2em] italic text-[#F4EDE6]">Sin Protección</h3>
                                    <p className="text-[10px] opacity-60 leading-relaxed px-6 text-[#F4EDE6]">
                                        Tu panel de pagos y beneficiarios se activará una vez elijas un plan de previsión.
                                    </p>
                                    <div className="mt-10 pt-6 border-t border-white/10 w-full italic opacity-30 text-[9px] uppercase tracking-widest text-[#F4EDE6]">
                                        Mouren Previsión Exequial
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </main>

            {/* ESTILOS DE ANIMACIÓN INYECTADOS */}
            <style>{`
                .animate-fade-in { animation: fadeIn 0.8s ease-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ffdeb6; border-radius: 10px; }
                main::-webkit-scrollbar { width: 5px; }
                main::-webkit-scrollbar-thumb { background: #080602; border-radius: 10px; }

                /* ANIMACIÓN MEJORADA: GRADIENTE FLUIDO MÁS RÁPIDO Y MARCADO COFFEE/GOLD */
                .animate-gradient-bg {
                    background-size: 300% 300%;
                    animation: gradientMovement 8s ease-in-out infinite;
                }
                @keyframes gradientMovement {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
}
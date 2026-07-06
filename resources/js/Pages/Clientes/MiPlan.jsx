import React, { useState, useRef, useEffect } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import Sidebar from './Sidebar';

export default function MiPlan({
    planHumano = null,
    planMascota = null
}) {
    /* console.log("Datos recibidos en suscripcion:", suscripcion);*/


    const { auth, flash } = usePage().props;
    const usuario = auth?.user || {};

    console.log("--- DEBUG DE PROPS ---");
    console.log("Plan Humano recibido:", planHumano);
    console.log("Plan Mascota recibido:", planMascota);

    // --- ESTADOS PARA LA MÚSICA Y EL FONDO DINÁMICO ---
    const [reproduciendo, setReproduciendo] = useState(false);
    const audioRef = useRef(null);
    const [mostrarBienvenida, setMostrarBienvenida] = useState(false);

    useEffect(() => {
    if (flash?.activado) {
        setMostrarBienvenida(true);
        const timer = setTimeout(() => setMostrarBienvenida(false), 4000);
        return () => clearTimeout(timer);
    }
}, [flash]);

    // --- ESTADOS DE INTERFAZ DUAL (HUMANO / MASCOTA) ---
    const [modoMascota, setModoMascota] = useState(false);
    const [verModalMascota, setVerModalMascota] = useState(false);
    const tienePlanHumano = planHumano && planHumano.id;
    const tienePlanMascota = planMascota && planMascota.id;
    const tieneAmbos = tienePlanHumano && tienePlanMascota;
    const tieneCualquierPlan = tienePlanHumano || tienePlanMascota;


    console.log("Humano:", tienePlanHumano);
    console.log("Mascota:", tienePlanMascota);

    const suscripcion =
        modoMascota
            ? planMascota
            : (planHumano || planMascota);

    console.log("Plan humano:", planHumano);
    console.log("Plan mascota:", planMascota);

    // Verificaciones de estado del plan
    const tienePlanMascotaContratado = !!planMascota;

    // 1. CAPTURA DEL OBJETO CANCIÓN
    const cancionObjeto = suscripcion?.cancion_tributo || suscripcion?.cancion;

    // 2. OBTENER EL NOMBRE REAL DEL ARCHIVO
    const nombreArchivo = cancionObjeto?.archivo_audio || "";

    // 3. CONSTRUCCIÓN DE LA RUTA RELATIVA
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



    /*if (!tienePlanHumano && !tienePlanMascota) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h1 className="text-2xl font-bold">Sin protección</h1>
            </div>
        );
    }*/

    return (
        <div className={`min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] flex overflow-x-hidden transition-all duration-1000 ${reproduciendo
            ? 'bg-gradient-to-br from-[#4A3B2C] via-[#A68966] via-[#F5C453] to-[#8C6F4F] bg-[length:300%300%] animate-gradient-bg text-white'
            : 'bg-[#FFFFFF]'
            }`}>
            <Head title="Mi Plan - Mouren" />

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
                    <h2 className="text-xl font-bold mb-6 italic border-b pb-2">
                        {planMascota && !planHumano
                            ? 'Mi Plan Huella Eterna:'
                            : modoMascota
                                ? 'Mi Plan Huella Eterna:'
                                : 'Mi Plan Funerario:'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* TARJETA 1: INFO DEL PLAN (COMPLETAMENTE ARREGLADA) */}
                        <div className={`${suscripcion ? (reproduciendo ? 'bg-[#362A1F]/90 text-white border-white/30' : 'bg-[#5D4E3F] text-white') : 'bg-[#CDC2AD] text-[#5D4E3F]'} p-8 rounded-[45px] shadow-lg border relative group overflow-hidden flex flex-col h-full transition-all duration-500`}>

                            {/* PEQUEÑO BOTÓN FLOTANTE INGENIOSO - SOLO SALE SI YA TIENE UN PLAN */}
                            {suscripcion && planHumano && (
                                <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5">
                                    {!tienePlanMascotaContratado && (
                                        <span className="bg-[#FFBD2E] text-[#362A1F] text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                                            ¡Mascotas!
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (tieneAmbos) {
                                                setModoMascota(!modoMascota);
                                            } else if (tienePlanHumano && !tienePlanMascota) {
                                                setVerModalMascota(true); // Abre el modal de "Inscribete a Mascota"
                                            } else if (tienePlanMascota && !tienePlanHumano) {
                                                router.visit('/planes-disponibles');
                                            }
                                        }}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md border hover:scale-110 transition-all ${modoMascota
                                            ? 'bg-white text-[#5D4E3F] border-white'
                                            : 'bg-[#362A1F]/40 text-[#FFBD2E] border-white/20 hover:bg-[#362A1F]'
                                            }`}
                                        title={
                                            tieneAmbos
                                                ? "Alternar Modo Mascota"
                                                : tienePlanHumano
                                                    ? "Inscribirse a Huella Eterna"
                                                    : "Ir al catálogo"
                                        }
                                    >
                                        🐾
                                    </button>
                                </div>
                            )}

                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className={`text-[10px] uppercase tracking-[3px] font-bold ${suscripcion ? (reproduciendo ? 'text-[#FFD97D]' : 'text-[#Ffffff]') : 'opacity-60'} italic`}>
                                        {modoMascota ? 'Línea Mascotas' : (suscripcion ? 'Estado: Activo' : 'Primeros Pasos')}
                                    </h3>
                                </div>

                                <h2 className="text-xl font-black mb-4">
                                    {modoMascota
                                        ? 'Huella Eterna 🐾'
                                        : (planHumano
                                            ? planHumano.plan?.nombre
                                            : (planMascota
                                                ? planMascota.plan?.nombre
                                                : 'Inscríbete a un plan'
                                            )
                                        )
                                    }
                                </h2>

                                {/* Las flores hermosas y decoraciones SOLO aparecen si el usuario ya está protegido */}
                                {suscripcion && (
                                    <img src="/images/elementos_dashboard/flores_main.gif" className={`absolute -top-12 -right-12 w-[190px] opacity-80 pointer-events-none transition-all ${reproduciendo ? 'brightness-125 contrast-125' : ''}`} alt="flores" />
                                )}

                                {suscripcion ? (
                                    <div className="space-y-3 mt-6">
                                        <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                                            <p className="text-[9px] uppercase opacity-60 font-bold">
                                                {modoMascota ? 'Suscripción Huella Eterna' : 'Cuota Mensual Plan'}
                                            </p>
                                            <p className="text-2xl font-black text-[#FFBD2E]">
                                                ${Number(
                                                    suscripcion?.cuota_mensual || 0
                                                ).toLocaleString()}
                                            </p>

                                        </div>
                                        <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                                            <p className="text-[9px] uppercase opacity-60 font-bold">Cobertura Exequial</p>
                                            <p className="text-sm font-bold">
                                                {modoMascota ? 'Protección Vitalicia Animal' : (suscripcion.fecha_inicio || 'Pendiente')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* DISEÑO SIMPLE DE ANTES CUANDO ESTÁ VACÍO */
                                    <div className="space-y-3 mb-8 mt-4">
                                        <div className="bg-white/40 p-3 rounded-2xl flex gap-3 items-center border border-white/20">
                                            <span className="bg-[#5D4E3F] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold italic">1</span>
                                            <p className="text-[10px] font-bold uppercase tracking-wider italic text-[#5D4E3F]">Elige tu Plan Funeral</p>
                                        </div>
                                        <div className="bg-white/40 p-3 rounded-2xl flex gap-3 items-center border border-white/20">
                                            <span className="bg-[#5D4E3F] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold italic">2</span>
                                            <p className="text-[10px] font-bold uppercase tracking-wider italic text-[#5D4E3F]">Registra tus Beneficiarios</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* MODAL INTERNO PROMOCIONAL SI DA CLIC A LA HUELLITA */}
                            {verModalMascota && (
                                <div className="absolute inset-0 bg-[#362A1F]/95 z-40 p-6 flex flex-col justify-center items-center text-center animate-fade-in rounded-[45px]">
                                    <span className="text-3xl mb-2 animate-bounce">🐾</span>
                                    <h4 className="text-sm font-black text-[#FFBD2E] uppercase tracking-widest mb-1">Plan Huella Eterna</h4>
                                    <p className="text-[10px] opacity-80 max-w-[200px] leading-relaxed mb-4 italic text-white">
                                        No dejes desprotegidos a tus consentidos de 4 patas. Asegura su despedida con el amor que merecen.
                                    </p>
                                    <div className="flex gap-2 w-full px-4">
                                        <Link
                                            href="/mi-plan-mascota"
                                            className="flex-1 py-2 bg-[#FFBD2E] text-[#362A1F] font-bold text-[9px] uppercase tracking-wider rounded-xl text-center hover:scale-105 transition"
                                        >
                                            Adquirir
                                        </Link>
                                        <button
                                            onClick={() => setVerModalMascota(false)}
                                            className="px-3 py-2 bg-white/10 text-white font-bold text-[9px] uppercase tracking-wider rounded-xl hover:bg-white/20"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* BOTONES ACCIONABLES TOTALMENTE ARREGLADOS */}
                            <div className="flex flex-col gap-2 mt-auto relative z-10 pt-6">
                                {planHumano || tieneAmbos ? (
                                    /* BOTÓN DE VER DETALLES SI YA ESTÁ INSCRITO */
                                    <Link
                                        href={modoMascota ? "/detalles-mascota" : "/detalles"}
                                        className={`py-4 rounded-2xl font-bold text-xs text-center transition-all shadow-md active:scale-95 uppercase tracking-widest ${reproduciendo ? 'bg-[#A68966] text-white hover:bg-[#8C6F4F]' : 'bg-[#302A1D] text-white hover:bg-[#4A3E32]'}`}
                                    >
                                        Ver Detalles Completos
                                    </Link>

                                ) : (
                                    /* ¡EL BOTÓN CLAVE DE INSCRIPCIÓN VUELVE A ESTAR AQUÍ SI NO TIENE PLAN! */
                                    <Link
                                        href="/planes-disponibles"
                                        className="py-4 bg-[#5D4E3F] text-white hover:bg-[#4A3E32] rounded-2xl font-bold text-xs text-center transition-all shadow-md active:scale-95 uppercase tracking-widest"
                                    >
                                        Inscribirme a un Plan
                                    </Link>
                                )}
                            </div>

                            <img src="/images/login/elementos_dashboard/flores_esquinas_tarjeta.png" className="absolute bottom-2 right-2 w-32 opacity-5 group-hover:opacity-15 transition-opacity" alt="" />
                        </div>

                        {/* TARJETA 2: BENEFICIARIOS HUMANOS / DINÁMICA DE MASCOTAS */}
                        <div className={`${(planHumano || planMascota) ? (reproduciendo ? 'bg-white/20 border border-white/30 text-white backdrop-blur-md' : 'bg-[#D3CAB6] text-[#5D4E3F]') : 'bg-[#5D4E3F]'} p-8 rounded-[45px] shadow-2xl flex flex-col items-center justify-center text-center h-full transition-all duration-500 relative overflow-hidden`}>
                            {suscripcion && (
                                <>
                                    <img src="/images/elementos_dashboard/flores-esquina-top.png" className={`absolute -top-4 -right-4 w-40 opacity-80 pointer-events-none transition-all ${reproduciendo ? 'brightness-125 contrast-125' : ''}`} alt="flores" />
                                    <img src="/images/elementos_dashboard/flores-esquina-bottom.png" className={`absolute -bottom-4 -left-4 w-40 opacity-80 pointer-events-none transition-all ${reproduciendo ? 'brightness-125 contrast-125' : ''}`} alt="flores" />
                                </>
                            )}

                            {/* --- CAMBIO APLICADO AQUÍ --- */}
                            {suscripcion ? (
                                <div className="w-full text-left relative z-10">

                                    <h3 className="text-[16px] font-black mb-6 italic border-b pb-2 flex items-center gap-2">
                                        {(!planHumano && planMascota) || modoMascota
                                            ? 'Patitas Protegidas 🐾'
                                            : 'Beneficiarios Humanos 🌼'}
                                    </h3>

                                    <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">

                                        {(!planHumano && planMascota) || modoMascota ? (
                                            // RENDERIZADO DE MASCOTAS
                                            planMascota?.mascotas?.length > 0 ? (
                                                planMascota.mascotas.map((pet, idx) => (
                                                    <div key={idx} className={`flex justify-between items-center p-3 rounded-[20px] rounded-tr-none text-[10px] font-bold tracking-tighter border-l-4 ${reproduciendo ? 'bg-white/10 text-white border-[#FFBD2E]' : 'bg-white/60 text-[#5D4E3F] border-[#8C6F4F]'}`}>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-amber-900">🐾 {pet.nombre}</span>
                                                            <span className={`text-[8px] italic mt-0.5 ${reproduciendo ? 'text-[#FFD97D]' : 'text-[#A68966]'}`}>
                                                                {pet.especie?.nombre || 'Mascota'} | {pet.raza?.nombre || 'Sin raza'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] text-center opacity-50 italic">No tienes mascotas vinculadas.</p>
                                            )
                                        ) : (
                                            // RENDERIZADO DE AFILIADOS HUMANOS
                                            planHumano?.afiliados?.length > 0 ? (
                                                planHumano.afiliados.map((afi, idx) => (
                                                    <div key={idx} className={`flex justify-between items-center p-3 rounded-[20px] rounded-tr-none text-[10px] font-bold border-l-4 ${reproduciendo ? 'bg-white/10 text-white border-[#FFD97D]' : 'bg-white/60 text-[#5D4E3F] border-[#8C6F4F]'}`}>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm">{afi.nombre}</span>
                                                            <span className="text-[8px] italic opacity-70">Vinculado: {afi.parentesco}</span>
                                                        </div>
                                                        <button onClick={() => editarNombre(afi.id, afi.nombre)} className="p-2">✏️</button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] text-center opacity-50 italic">No tienes afiliados vinculados.</p>
                                            )
                                        )}
                                    </div>

                                    {/* SECCIÓN DE CANCIÓN INTERACTIVA */}
                                    <div className={`mt-8 p-4 rounded-[25px] shadow-xl relative flex items-center justify-between gap-3 group transition-all duration-500 ${reproduciendo ? 'bg-[#362A1F]' : 'bg-[#5D4E3F] text-white'}`}>
                                        <div className={`absolute -top-3 right-4 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${reproduciendo ? 'bg-[#FFBD2E] text-[#362A1F]' : 'bg-[#A68966] text-white'}`}>
                                            {reproduciendo ? "Sonando En Vivo 🎵" : "En Memoria 🎶"}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-[8px] uppercase opacity-60 font-bold tracking-widest mb-1">Tributo Musical Seleccionado:</p>
                                            <p className={`text-[11px] font-bold italic truncate ${reproduciendo ? 'text-[#FFBD2E] text-sm tracking-wide transition-all' : 'text-[#F4F1ED]'}`}>
                                                {nombreCancion}
                                            </p>
                                        </div>

                                        <button
                                            onClick={controlarMusica}
                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md text-xs border border-white/10 active:scale-90 ${reproduciendo ? 'bg-[#FFBD2E] text-[#5D4E3F] scale-110 shadow-lg' : 'bg-[#A68966] text-white hover:bg-[#c0a27d]'
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

            {mostrarBienvenida && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#5D4E3F]/90 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-10 rounded-[50px] text-center shadow-2xl">
                        <img
                            src="/images/elementos_dashboard/inscripcion_planes/welcome.gif"
                            className="w-40 h-40 mx-auto mb-4"
                            alt="¡Bienvenido!"
                        />
                        <h2 className="text-xl font-black text-[#5D4E3F] italic">
                            ¡Tu protección está activa!
                        </h2>
                    </div>
                </div>
            )}

            <style>{`
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ffdeb6; border-radius: 10px; }
                main::-webkit-scrollbar { width: 5px; }
                main::-webkit-scrollbar-thumb { background: #080602; border-radius: 10px; }

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
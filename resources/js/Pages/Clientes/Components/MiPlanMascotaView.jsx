import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '@/Pages/Clientes/Sidebar';
import {
    Trash2, Plus, Play, Pause, Sparkles, ShieldCheck, Gem, PawPrint, Flower, Music
} from 'lucide-react';

// 🆕 Orquesta de pájaros: igual que en Inscribir.jsx, cuando suena una
// canción aparecen pajaritos alrededor de toda la pantalla. Aquí se usa una
// versión más liviana (emoji en vez del SVG completo) porque esta vista no
// tenía el personaje Mouri dibujado; así evitamos duplicar ~90 líneas de SVG.
function OrquestaPajaros({ activa }) {
    if (!activa) return null;
    const posiciones = [
        { top: '4%', left: '6%' },
        { top: '3%', left: '48%' },
        { top: '4%', right: '6%' },
        { top: '42%', left: '2%' },
        { top: '42%', right: '2%' },
        { bottom: '8%', left: '14%' },
        { bottom: '8%', right: '14%' },
    ];
    return (
        <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
            {posiciones.map((pos, i) => (
                <span key={i} className="absolute orquesta-pajaro-mascota text-2xl" style={{ ...pos, animationDelay: `${i * 0.15}s` }}>
                    🐦
                </span>
            ))}
        </div>
    );
}

// 🆕 Huellitas del "caminito" — aparecen un instante cada vez que cambias
// de paso, como si algo caminara por la pantalla. Puramente decorativo.
function CaminitoHuellitas({ activo }) {
    if (!activo) return null;
    const pasos = [12, 28, 44, 60, 76, 90];
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-30">
            {pasos.map((left, i) => (
                <span
                    key={i}
                    className="huellita-camino text-base"
                    style={{ left: `${left}%`, bottom: `${8 + (i % 2) * 6}%`, animationDelay: `${i * 0.06}s` }}
                >
                    🐾
                </span>
            ))}
        </div>
    );
}

// 🆕 Tarjetita simple con un detalle de color arriba — mismo diseño ya
// simplificado en Inscribir.jsx (nada de balanceos raros).
function CartelitoMascota({ children, color }) {
    return (
        <div className="bg-white dark:bg-black/20 rounded-xl px-3 py-2.5 shadow-sm border border-[#5D4E3F]/10 dark:border-white/10 border-t-2" style={{ borderTopColor: color }}>
            {children}
        </div>
    );
}

export default function MiPlanMascotaView({
    plan,
    recuerdos,
    canciones,
    especies = [], // <-- NUEVO: Recibe el catálogo de especies y razas de la BD
    isSidebarOpen,
    setIsSidebarOpen,
    paso,
    setPaso,
    aceptoTerminos,
    setAceptoTerminos,
    showSuccessModal,
    setShowSuccessModal,
    errorModal,
    setErrorModal,
    playingId,
    audioRef,
    nombreTitular,
    data,
    setData,
    processing,
    aplicarCancionATodos,
    numMascotasActuales,
    MAX_MASCOTAS,
    valorCuotaBase,
    totalCalculado,
    validarPaso,
    toggleMúsica,
    toggleSeleccionRecuerdo,
    enviarInscripcion
}) {
    console.log("Especies recibidas desde la BD:", especies);

    // 🆕 Mismo acento e ícono que usa "Huella Eterna" en Planes.jsx, para que
    // esta vista se sienta parte del mismo plan (no se toca ningún dato, solo color).
    const tema = { color: '#6E5A3E', colorSuave: '#8C6A4F', icono: '🐾' };
    const cancionElegida = canciones.find(c => c.id === data.cancion_id);

    // 🆕 Efecto "ascensor" al cambiar de paso. Aquí `paso` es una prop que
    // cambia el componente padre (no la controlamos nosotros), así que en
    // vez de animar "antes" del cambio, reaccionamos al cambio: apenas
    // `paso` cambia, la nueva sección entra bajando (o subiendo si vas
    // "atrás"). Usamos `key={paso}` para que React vuelva a montar el
    // contenido y la animación de entrada se dispare siempre, sin tocar
    // ninguna validación ni dato.
    const pasoAnteriorRef = useRef(paso);
    const direccionRef = useRef('adelante');
    if (paso !== pasoAnteriorRef.current) {
        direccionRef.current = paso > pasoAnteriorRef.current ? 'adelante' : 'atras';
        pasoAnteriorRef.current = paso;
    }
    const claseEntradaPaso = direccionRef.current === 'adelante' ? 'elevador-baja-entra' : 'elevador-sube-entra';

    // Partículas del "caminito" (flores/glitch/confeti según el tema): se
    // encienden un instante cada vez que el paso cambia de verdad.
    const [efectoCaminoActivo, setEfectoCaminoActivo] = useState(false);
    useEffect(() => {
        setEfectoCaminoActivo(true);
        const t = setTimeout(() => setEfectoCaminoActivo(false), 500);
        return () => clearTimeout(t);
    }, [paso]);

    // 🆕 Desglose SOLO para mostrar en la nota financiera del paso 4 — usa
    // los mismos props (valorCuotaBase, numMascotasActuales) que ya te
    // calcula el componente padre, no inventa ningún número nuevo.
    const desgloseFinancieroMascota = useMemo(() => {
        const subtotalBase = (valorCuotaBase || 0) * (numMascotasActuales || 0);
        const subtotalRecuerdos = (data.recuerdos_seleccionados || []).reduce((acc, id) => {
            const r = recuerdos.find(rec => rec.id === id);
            return acc + (r ? parseFloat(r.precio_adicional) : 0);
        }, 0);
        return { subtotalBase, subtotalRecuerdos };
    }, [valorCuotaBase, numMascotasActuales, JSON.stringify(data.recuerdos_seleccionados)]);

    return (
        <div className="flex min-h-screen bg-[#FDFBF9] dark:bg-[#221D17] font-['Hepta_Slab'] text-[#5D4E3F] dark:text-[#EDE4D3] relative z-0 overflow-hidden">
            {/* 🆕 Animación de la orquesta de pájaros */}
            <style>{`
                @keyframes orquestaApareceMascota {
                    0% { opacity: 0; transform: scale(0.4) translateY(14px) rotate(0deg); }
                    50% { transform: scale(1.05) translateY(-4px) rotate(-6deg); }
                    100% { opacity: 0.9; transform: scale(1) translateY(0) rotate(0deg); }
                }
                .orquesta-pajaro-mascota { animation: orquestaApareceMascota 1.6s ease-in-out infinite; }
                @keyframes huellitaMascotaParpadea {
                    0%, 100% { opacity: 0.35; transform: scale(1); }
                    50% { opacity: 0.75; transform: scale(1.2); }
                }
                .huellita-mascota { animation: huellitaMascotaParpadea 2.4s ease-in-out infinite; }
                @keyframes elevadorBajaEntra {
                    from { transform: translateY(-48px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes elevadorSubeEntra {
                    from { transform: translateY(48px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .elevador-baja-entra { animation: elevadorBajaEntra 0.42s cubic-bezier(0,0,0.2,1) forwards; }
                .elevador-sube-entra { animation: elevadorSubeEntra 0.42s cubic-bezier(0,0,0.2,1) forwards; }
                @keyframes huellitaCaminoAparece {
                    0% { opacity: 0; transform: translateY(6px); }
                    40% { opacity: 0.8; transform: translateY(0); }
                    100% { opacity: 0; }
                }
                .huellita-camino { position: absolute; animation: huellitaCaminoAparece 0.7s ease-out forwards; }
                @media (prefers-reduced-motion: reduce) {
                    .orquesta-pajaro-mascota, .huellita-mascota, .elevador-baja-entra, .elevador-sube-entra, .huellita-camino { animation: none !important; }
                }
            `}</style>

            {/* 🆕 Huellitas del caminito, aparecen un instante al cambiar de paso */}
            <CaminitoHuellitas activo={efectoCaminoActivo} />

            {/* 🆕 Pajaritos alrededor de toda la pantalla mientras suena una canción */}
            <OrquestaPajaros activa={playingId !== null} />

            {/* 🆕 Decoración del tema: antes estaba al 5% de opacidad (casi invisible).
                Ahora hay un "baño" de color + flores y huellitas bien visibles. */}
            <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{ background: `linear-gradient(135deg, ${tema.color}26 0%, transparent 45%, ${tema.colorSuave}1F 100%)` }}
            />
            <Flower className="absolute -top-10 -right-10 w-40 h-40 pointer-events-none rotate-12 opacity-[0.14]" style={{ color: tema.colorSuave }} />
            <Flower className="absolute bottom-20 -left-10 w-48 h-48 pointer-events-none -rotate-12 opacity-[0.14]" style={{ color: tema.colorSuave }} />
            <PawPrint className="absolute bottom-5 right-5 w-32 h-32 pointer-events-none opacity-[0.10]" style={{ color: tema.color }} />
            {[
                { top: '10%', left: '92%' }, { top: '30%', left: '4%' },
                { top: '60%', left: '90%' }, { top: '82%', left: '10%' },
            ].map((p, i) => (
                <span
                    key={i}
                    className="absolute text-lg pointer-events-none huellita-mascota"
                    style={{ ...p, animationDelay: `${i * 0.8}s`, filter: 'drop-shadow(0 0 6px rgba(110,90,62,0.5))' }}
                >
                    🐾
                </span>
            ))}

            <Head title={`Inscribir Plan Mascota ${plan.nombre || ''}`} />
            <Sidebar onToggle={setIsSidebarOpen} />
            <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

            <main className={`flex-1 transition-all p-6 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
                <div className="max-w-6xl mx-auto">
                    <br />

                    {/* ENCABEZADO */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter italic lowercase flex items-center gap-2">
                                inscribir <span className="text-[#A68966]">{plan.nombre}</span>
                                <Flower className="text-[#A68966] animate-pulse hidden sm:inline" size={24} />
                            </h1>
                            <p className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-30 mt-2">Paso {paso} de 4</p>
                        </div>

                        <div className="text-white p-4 rounded-2xl flex items-center gap-4 max-w-md shadow-xl border-l-4 relative" style={{ backgroundColor: tema.color, borderLeftColor: tema.colorSuave }}>
                            <Sparkles className="text-[#A68966] shrink-0" size={20} />
                            <p className="text-[10px] font-bold italic leading-tight">
                                {paso === 1 && "Mouri dice: Registra a tus mascotas — puedes agregar hasta 5. Cada una necesita su nombre, especie y raza para quedar bien cubierta."}
                                {paso === 2 && "Mouri dice: Elige una canción conmemorativa para todas tus mascotas. Toca play para escucharla antes de decidir."}
                                {paso === 3 && "Mouri dice: Elige los objetos de memoria que quieras incluir — se suman a la cuota de todas tus mascotas."}
                                {paso === 4 && "Mouri dice: Último paso. Revisa el compromiso y tu resumen de la derecha antes de activar la protección."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* CONTENEDOR PRINCIPAL DEL PASO */}
                        <div className="lg:col-span-7 bg-white dark:bg-[#2E2720] p-10 rounded-[50px] shadow-sm border border-[#5D4E3F]/5 dark:border-white/10 min-h-[550px] flex flex-col relative">
                            
                            {/* PASO 1: SECCIÓN MASCOTAS */}
                            {paso === 1 && (
                                <div key={paso} className={`flex-1 ${claseEntradaPaso}`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-black lowercase italic flex items-center gap-2">
                                            tus consentidos <PawPrint size={20} className="text-[#A68966]" />
                                        </h2>
                                        <button
                                            type="button"
                                            disabled={numMascotasActuales >= MAX_MASCOTAS}
                                            onClick={() => setData('mascotas', [...data.mascotas, { nombre: '', especie_id: '', raza_id: '', cancion_id: data.cancion_id }])}
                                            className={`text-[10px] font-bold uppercase flex items-center gap-2 border border-dashed p-2 rounded-xl transition-all ${numMascotasActuales >= MAX_MASCOTAS ? 'opacity-20 border-gray-200' : 'text-[#A68966] border-[#A68966]/40 dark:border-[#A68966]/40 hover:bg-[#A68966]/5'}`}
                                        >
                                            <Plus size={14} /> agregar ({numMascotasActuales}/{MAX_MASCOTAS})
                                        </button>
                                    </div>

                                    <div className="space-y-5 mt-6">
    {data.mascotas.map((masc, i) => {
        const especieSeleccionada = especies.find(e => String(e.id) === String(masc.especie_id));
        const razasDisponibles = especieSeleccionada ? especieSeleccionada.razas : [];

        return (
            <div
                key={i}
                className="relative p-5 rounded-[35px] border bg-[#FDFBF9] dark:bg-[#221D17] border-[#5D4E3F]/10 dark:border-[#4A4033] shadow-sm hover:shadow-md transition-all"
            >
                {/* Botón eliminar flotante */}
                {numMascotasActuales > 1 && (
                    <button
                        type="button"
                        onClick={() => setData('mascotas', data.mascotas.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 bg-white dark:bg-[#2E2720] text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 shadow-md border border-red-100 transition-colors z-10"
                    >
                        <Trash2 size={14} />
                    </button>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* AVATAR / FOTO DE LA MASCOTA (placeholder, luego pones la imagen real) */}
                    <div className="shrink-0 flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2">
                        <div className="w-16 h-16 rounded-full bg-white dark:bg-[#2E2720] border-2 border-dashed border-[#A68966]/40 dark:border-[#A68966]/40 flex items-center justify-center overflow-hidden shadow-inner">
                            {/* Cuando tengas la foto real, reemplaza este ícono por:
                                <img src={masc.foto_url} className="w-full h-full object-cover" /> */}
                            <PawPrint className="text-[#A68966]/50" size={26} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#A68966]/60 sm:text-center">
                            #{i + 1}
                        </span>
                    </div>

                    {/* CAMPOS */}
                    <div className="flex-1 space-y-3">
                        {/* Nombre */}
                        <input
                            className="w-full border-none bg-white dark:bg-[#2E2720] rounded-2xl text-xs font-bold p-3.5 shadow-sm focus:ring-2 focus:ring-[#A68966]/40 placeholder:font-normal placeholder:opacity-40"
                            placeholder="Nombre de tu consentido 🐾"
                            value={masc.nombre}
                            onChange={e => {
                                const m = [...data.mascotas];
                                m[i].nombre = e.target.value;
                                setData('mascotas', m);
                            }}
                        />

                        {/* Especie + Raza en grid, ya no se desbordan */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-[#A68966]/70 ml-1">
                                    Especie
                                </label>
                                <select
                                    className="w-full bg-white dark:bg-[#2E2720] border-none rounded-2xl text-xs p-3 shadow-sm focus:ring-2 focus:ring-[#A68966]/40"
                                    value={masc.especie_id}
                                    onChange={e => {
                                        const m = [...data.mascotas];
                                        m[i].especie_id = e.target.value;
                                        m[i].raza_id = '';
                                        setData('mascotas', m);
                                    }}
                                >
                                    <option value="">Elegir</option>
                                    {especies.map(esp => (
                                        <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-[#A68966]/70 ml-1">
                                    Raza / Variedad
                                </label>
                                <select
                                    className="w-full bg-white dark:bg-[#2E2720] border-none rounded-2xl text-xs p-3 shadow-sm focus:ring-2 focus:ring-[#A68966]/40 disabled:opacity-40"
                                    value={masc.raza_id}
                                    disabled={!masc.especie_id}
                                    onChange={e => {
                                        const m = [...data.mascotas];
                                        m[i].raza_id = e.target.value;
                                        setData('mascotas', m);
                                    }}
                                >
                                    <option value="">
                                        {masc.especie_id ? 'Elegir' : 'Selecciona especie primero'}
                                    </option>
                                    {razasDisponibles.map(rz => (
                                        <option key={rz.id} value={rz.id}>{rz.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    })}
</div>
                                </div>
                            )}

                            {/* PASO 2: MELODÍAS */}
                            {paso === 2 && (
                                <div key={paso} className={`flex-1 ${claseEntradaPaso}`}>
                                    <h2 className="text-2xl font-black lowercase italic mb-6 flex items-center gap-2">
                                        melodías del alma <Flower size={20} className="text-[#A68966]" />
                                    </h2>
                                    <div className="space-y-3 max-w-xl">
                                        <p className="text-[9px] font-black opacity-30 uppercase tracking-widest text-gray-400">Canción Conmemorativa sugerida</p>
                                        <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                            {canciones.map(c => (
                                                <div
                                                    key={c.id}
                                                    className={`p-4 rounded-2xl flex items-center justify-between border cursor-pointer transition-all ${data.cancion_id === c.id ? 'bg-[#5D4E3F] text-white border-[#5D4E3F]' : 'bg-[#FDFBF9] dark:bg-[#221D17] border-transparent hover:border-[#A68966]/30'}`}
                                                    onClick={() => aplicarCancionATodos(c.id)}
                                                >
                                                    <p className="text-xs font-bold lowercase flex items-center gap-2">
                                                        <PawPrint size={12} className={data.cancion_id === c.id ? 'text-[#A68966]' : 'opacity-40'} />
                                                        {c.titulo}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); toggleMúsica(c); }}
                                                        className="ml-2 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                                                    >
                                                        {playingId === c.id ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-[#A68966]" />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PASO 3: OBJETOS DE MEMORIA */}
                            {paso === 3 && (
                                <div key={paso} className={`flex-1 ${claseEntradaPaso}`}>
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-black lowercase italic">tributos de memoria</h2>
                                        <p className="text-[10px] text-[#A68966] font-bold uppercase mt-1">Selección única para el recuerdo físico</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        {recuerdos.map(r => (
                                            <div key={r.id} onClick={() => toggleSeleccionRecuerdo(r.id)} className={`p-6 rounded-[45px] border-2 cursor-pointer text-center transition-all ${data.recuerdos_seleccionados.includes(r.id) ? 'bg-[#5D4E3F] text-white border-[#5D4E3F] shadow-lg' : 'bg-[#FDFBF9] dark:bg-[#221D17] border-transparent hover:bg-[#F4F1ED] dark:bg-[#3A322A]'}`}>
                                                <div className="bg-white dark:bg-[#2E2720] rounded-3xl p-3 mb-3 shadow-sm max-w-[120px] mx-auto">
                                                    <img src={`/images/planes/recuerdos/${r.imagen || 'peluche_mouri.png'}`} className="w-20 h-20 mx-auto object-contain" alt={r.nombre} />
                                                </div>
                                                <p className="text-xs font-bold lowercase">{r.nombre}</p>
                                                <p className="text-[10px] opacity-60 mt-1">$ {Number(r.precio_adicional).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PASO 4: COMPROMISO */}
                            {paso === 4 && (
                                <div key={paso} className={`flex-1 flex flex-col justify-center ${claseEntradaPaso}`}>
                                    <div className="bg-[#FDFBF9] dark:bg-[#221D17] p-8 rounded-[60px] border border-[#A68966]/10 shadow-inner overflow-hidden relative">
                                        <ShieldCheck className="mx-auto text-[#A68966] mb-4" size={44} />
                                        <h2 className="text-xl font-black lowercase italic mb-4 text-center">compromiso huella eterna mouren</h2>

                                        {/* 🆕 Mini-resumen + nota financiera, antes de la autorización */}
                                        <div className="mb-6 bg-white dark:bg-[#2E2720] rounded-3xl border p-4 sm:p-5 shadow-sm" style={{ borderColor: `${tema.color}40` }}>
                                            <p className="text-[9px] font-black uppercase tracking-widest mb-3 text-center" style={{ color: tema.color }}>
                                                {tema.icono} Nota financiera de tu suscripción
                                            </p>
                                            <div className="space-y-1.5 text-[11px] text-[#5D4E3F] dark:text-[#EDE4D3]">
                                                <div className="flex justify-between">
                                                    <span className="opacity-70">Plan {plan.nombre} × {numMascotasActuales} {numMascotasActuales === 1 ? 'mascota' : 'mascotas'}</span>
                                                    <span className="font-bold">${desgloseFinancieroMascota.subtotalBase.toLocaleString()}</span>
                                                </div>
                                                {desgloseFinancieroMascota.subtotalRecuerdos > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="opacity-70">Objetos de memoria</span>
                                                        <span className="font-bold">${desgloseFinancieroMascota.subtotalRecuerdos.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-[#5D4E3F]/20 dark:border-white/20">
                                                <span className="text-xs font-black uppercase">Total mensual</span>
                                                <span className="text-xl font-black" style={{ color: tema.color }}>${totalCalculado.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="max-h-36 overflow-y-auto pr-4 text-[11px] leading-relaxed text-[#5D4E3F]/70 dark:text-[#EDE4D3]/70 text-justify space-y-3 mb-6 font-sans">
                                            <p>Yo, <strong>{nombreTitular || 'Usuario'}</strong>, en calidad de responsable, solicito de manera voluntaria la afiliación al <strong>Plan {plan.nombre}</strong> de Mouren para {numMascotasActuales} {numMascotasActuales === 1 ? 'mascota' : 'mascotas'}, declarando que los datos e información suministrada son veraces y completos.</p>
                                            <p>Entiendo que la protección y los servicios exequiales para mis compañeros de vida entrarán en vigencia una vez se valide el pago de la cuota correspondiente. Mouren se compromete a acompañar este proceso con amor, dignidad y el máximo respeto.</p>
                                            <p>De acuerdo con la <strong>Ley 1581 de 2012</strong> y demás normas de protección de datos personales, autorizo a Mouren el tratamiento de mis datos, con el único fin de gestionar esta afiliación, la facturación y la prestación de los servicios contratados.</p>
                                            <p>La cuota de inversión mensual calculada es de <strong>${totalCalculado.toLocaleString()}</strong>, la cual podrá variar si más adelante agrego o retiro mascotas o recuerdos.</p>
                                        </div>

                                        <label className="flex items-start gap-4 cursor-pointer p-4 bg-white dark:bg-[#2E2720] rounded-3xl border border-[#A68966]/20 dark:border-[#A68966]/30 transition-all hover:bg-emerald-50/20">
                                            <input type="checkbox" className="w-5 h-5 mt-1 rounded-lg text-[#A68966] focus:ring-0 checked:bg-[#A68966]" checked={aceptoTerminos} onChange={e => setAceptoTerminos(e.target.checked)} />
                                            <span className="text-[10px] font-bold leading-tight uppercase tracking-tight">Prometo cuidar la memoria de mis mascotas y acepto los términos de Mouren y el tratamiento de mis datos personales, conforme a la Ley 1581 de 2012.</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* BOTONES NAVEGACIÓN */}
                            <div className="mt-auto pt-8 flex justify-between items-center border-t border-[#5D4E3F]/5 dark:border-white/10">
                                {paso > 1 && (
                                    <button type="button" onClick={() => setPaso(paso - 1)} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-all tracking-widest">← atrás</button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => paso === 4 ? enviarInscripcion() : validarPaso()}
                                    disabled={processing || (paso === 4 && !aceptoTerminos)}
                                    className="bg-[#5D4E3F] text-white px-12 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] ml-auto shadow-lg hover:bg-[#4A3E32] transition-colors disabled:opacity-40"
                                >
                                    {paso === 4 ? (processing ? 'procesando...' : 'activar huella eterna') : 'siguiente'}
                                </button>
                            </div>
                        </div>

                        {/* PANEL DE RESUMEN LATERAL */}
                        <div className="lg:col-span-5 sticky top-10">
                            <div className="relative group">
                                <div className="absolute inset-0 rounded-[40px] transform -rotate-2 transition-transform group-hover:rotate-0 duration-500 shadow-xl opacity-10" style={{ backgroundColor: tema.colorSuave }}></div>
                                <div className="relative bg-[#F4F1ED] dark:bg-[#3A322A] border border-[#5D4E3F]/10 dark:border-[#4A4033] rounded-[40px] p-8 shadow-2xl overflow-hidden">
                                    
                                    <div className="inline-flex items-center gap-2 px-8 py-2 transform -skew-x-12 mb-6 ml-[-20px]" style={{ backgroundColor: tema.color }}>
                                        <span className="transform skew-x-12">{tema.icono}</span>
                                        <h2 className="text-xl font-black text-[#FDFBF9] lowercase italic transform skew-x-12">resumen patitas mouri</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-dashed border-[#5D4E3F]/20 dark:border-white/20 pb-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A68966]">Plan Base Elegido</p>
                                                <p className="text-lg font-black text-[#5D4E3F] dark:text-[#EDE4D3] italic">{plan.nombre || 'Huella Eterna'}</p>
                                            </div>
                                            <Gem className="text-[#A68966] opacity-40" size={28} />
                                        </div>

                                        {/* 🆕 EL VALOR DEL PLAN, ARRIBA */}
                                        <div className="relative">
                                            <div className="absolute inset-0 rounded-3xl transform skew-y-2" style={{ backgroundColor: tema.color }}></div>
                                            <div className="relative overflow-hidden bg-[#FDFBF9] dark:bg-[#221D17] p-5 sm:p-6 rounded-3xl transform -translate-y-1 -translate-x-1 border border-[#5D4E3F]/10 dark:border-[#4A4033]">
                                                <p className="text-[10px] uppercase font-black text-[#A68966] mb-1 tracking-[0.2em] text-center">Inversión Mensual Total</p>
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-xl sm:text-2xl font-black text-[#5D4E3F] dark:text-[#EDE4D3]">$</span>
                                                    <span className="text-3xl sm:text-4xl font-black text-[#5D4E3F] dark:text-[#EDE4D3] tracking-tighter">
                                                        {totalCalculado.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 🆕 Los demás ítems, en tarjetitas pequeñas y normales */}
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <CartelitoMascota color={tema.color}>
                                                <p className="text-[8px] font-black uppercase text-[#A68966]">Mascotas</p>
                                                <p className="text-sm font-black italic text-[#5D4E3F] dark:text-[#EDE4D3]">x{numMascotasActuales}</p>
                                                <p className="text-[9px] font-bold opacity-60">${valorCuotaBase.toLocaleString()} c/u</p>
                                            </CartelitoMascota>

                                            {cancionElegida && (
                                                <CartelitoMascota color={tema.colorSuave}>
                                                    <p className="text-[8px] font-black uppercase text-[#A68966] flex items-center gap-1"><Music size={9} /> Canción</p>
                                                    <p className="text-[10px] font-bold lowercase italic truncate">{cancionElegida.titulo}</p>
                                                </CartelitoMascota>
                                            )}

                                            {data.recuerdos_seleccionados.map((id) => {
                                                const r = recuerdos.find(rec => rec.id === id);
                                                if (!r) return null;
                                                return (
                                                    <CartelitoMascota key={id} color={tema.color}>
                                                        <p className="text-[8px] font-black uppercase text-[#A68966]">Incluye</p>
                                                        <p className="text-[10px] font-bold lowercase italic truncate">{r.nombre}</p>
                                                        <p className="text-[9px] font-bold opacity-60">${Number(r.precio_adicional).toLocaleString()}</p>
                                                    </CartelitoMascota>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* MODAL ÉXITO */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#5D4E3F]/90 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#2E2720] p-12 rounded-[60px] text-center max-w-sm w-full shadow-2xl border-t-8 border-[#A68966]">
                        <img src="/images/login/mouri_registro_exitoso.png" className="w-32 h-32 mx-auto mb-6 object-contain" alt="Éxito" />
                        <h2 className="text-3xl font-black text-[#5D4E3F] dark:text-[#EDE4D3] lowercase mb-2 italic">¡huella protegida!</h2>
                        <p className="text-xs opacity-70">El plan floral y conmemorativo ha sido configurado con éxito.</p>
                        <button onClick={() => window.location.href = '/cliente/mi-plan'} className="mt-8 bg-[#A68966] text-white w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-md hover:bg-[#937756] transition-colors">ir a mi panel</button>
                    </div>
                </div>
            )}

            {/* MODAL ERROR */}
            {errorModal.show && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-[#2E2720] p-8 rounded-3xl max-w-md w-full text-center shadow-xl">
                        <h2 className="text-xl font-black text-red-500 mb-4">Mouri te informa</h2>
                        <p className="text-sm text-gray-700">{errorModal.message}</p>
                        <button onClick={() => setErrorModal({ show: false, message: '' })} className="mt-6 bg-[#A68966] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase">Entendido</button>
                    </div>
                </div>
            )}
        </div>
    );
}
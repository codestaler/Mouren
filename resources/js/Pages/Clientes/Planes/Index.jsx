import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebar from '@/Pages/Clientes/Sidebar';
import {
    ShieldCheck, Download, CheckCircle2, X, Flame, Cpu, PartyPopper, PawPrint,
    Users, Music2, ClipboardList, Sparkles as SparklesIcon
} from 'lucide-react';

/* ============================================================
 *  TEMAS POR PLAN — cada uno con su paleta, partículas animadas,
 *  ícono y una pequeña "historia" evocadora. Si agregas un plan
 *  nuevo que no calce con ningún "match", cae en TEMA_DEFAULT.
 * ============================================================ */
const TEMAS = [
    {
        match: (nombre) => nombre.toLowerCase().includes('descanso'),
        gradienteHeader: 'from-[#EFE7D8] via-[#F6F1E8] to-[#E3ECE3]',
        gradienteFondo: 'from-[#FDFBF7] to-[#F4EFE4]',
        colorTexto: '#4A5D45',
        colorAcento: '#A68966',
        icono: Flame,
        tagline: 'Paz, luz suave y flores que acompañan',
        historia: 'Descanso Sereno está pensado para quienes buscan un homenaje tranquilo: '
            + 'velas encendidas, flores frescas y un silencio respetuoso que acompaña sin apuro. '
            + 'Es la cobertura esencial, pensada para dar tranquilidad sin complicaciones.',
    },
    {
        match: (nombre) => nombre.toLowerCase().includes('legado'),
        gradienteHeader: 'from-[#241F30] via-[#1B1826] to-[#332B47]',
        gradienteFondo: 'from-[#F4F1E8] to-[#E9E4D4]',
        colorTexto: '#E8D9A8',
        colorAcento: '#C9A86A',
        icono: Cpu,
        tagline: 'Un homenaje con alma retro-futurista',
        historia: 'Legado Eterno combina calidez humana con un toque tecnológico: proyecciones, '
            + 'streaming para quien no pueda estar presente, y una ambientación que se siente '
            + 'como un archivo precioso de la memoria, guardado para siempre.',
    },
    {
        match: (nombre) => nombre.toLowerCase().includes('rumba'),
        gradienteHeader: 'from-[#3D1638] via-[#6B2360] to-[#B8156E]',
        gradienteFondo: 'from-[#FDF5FA] to-[#F6E9F2]',
        colorTexto: '#FFE9A8',
        colorAcento: '#E85C9E',
        icono: PartyPopper,
        tagline: 'Celebra la vida como se merece',
        historia: 'Última Rumba es para quienes prefieren celebrar en vez de solo despedir: música, '
            + 'color y un espíritu festivo que honra la vida vivida. La cobertura premium, con todo '
            + 'lo que se necesita para una despedida inolvidable.',
    },
    {
        match: (nombre) => nombre.toLowerCase().includes('huella'),
        gradienteHeader: 'from-[#4A3B2A] via-[#5F4C36] to-[#7A6248]',
        gradienteFondo: 'from-[#FDFBF7] to-[#F0E9DC]',
        colorTexto: '#F4EDE3',
        colorAcento: '#8A7355',
        icono: PawPrint,
        tagline: 'Un lugar seguro para tu compañero fiel',
        historia: 'Huella Eterna es la protección pensada exclusivamente para esos miembros de la '
            + 'familia con cuatro patas. Un homenaje cálido y sencillo para que su recuerdo también '
            + 'tenga un lugar digno.',
    },
];

const TEMA_DEFAULT = {
    gradienteHeader: 'from-[#5D4E3F] via-[#4A3E32] to-[#302A1D]',
    gradienteFondo: 'from-[#FDFBF7] to-[#F0EAE0]',
    colorTexto: '#F4EDE3',
    colorAcento: '#A68966',
    icono: ShieldCheck,
    tagline: 'Protección y tranquilidad para tu familia',
    historia: 'Un plan pensado para acompañarte con respeto y cuidado en cada paso.',
};

const resolverTema = (nombrePlan) => TEMAS.find((t) => t.match(nombrePlan)) || TEMA_DEFAULT;

const PASOS_INSCRIPCION = [
    { icono: Users, titulo: 'Elige tus protegidos', texto: 'Agrega hasta 5 personas que quieras proteger junto a ti.' },
    { icono: Music2, titulo: 'Canción y recuerdo', texto: 'Cada protegido elige su propio tributo musical y objeto de memoria.' },
    { icono: ClipboardList, titulo: 'Revisa tu resumen', texto: 'Verifica servicios extra y el valor final de tu cuota mensual.' },
    { icono: CheckCircle2, titulo: 'Activa tu protección', texto: 'Acepta el compromiso y tu plan queda activo de inmediato.' },
];

export default function PlanesIndex({ planes, tieneHumano = false, tieneMascota = false }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // 🆕 Plan actualmente abierto en el modal "Descubrir" (null = cerrado)
    const [planEnfocado, setPlanEnfocado] = useState(null);

    const planesVisibles = planes.filter((plan) => {
        const esPlanMascotas = plan.nombre.toLowerCase().includes('huella eterna');
        return esPlanMascotas ? !tieneMascota : !tieneHumano;
    });

    return (
        <div className="flex min-h-screen bg-white font-['Hepta_Slab'] text-[#5D4E3F]">
            <Head title="Planes Disponibles - Mouren" />

            <Sidebar onToggle={(state) => setIsSidebarOpen(state)} />

            <main className={`flex-1 transition-all duration-500 ease-in-out p-4 md:p-10 overflow-y-auto h-screen custom-scrollbar ${isSidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>

                <header className="mb-8 mt-2 max-w-4xl">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-[#5D4E3F] leading-tight">
                        Nuestros planes de <span className="text-[#A68966]">previsión</span>
                    </h1>
                    <div className="h-1 w-12 bg-[#A68966] mt-3 mb-3 rounded-full"></div>
                    <p className="text-[12px] md:text-sm italic opacity-60 max-w-md">
                        selecciona el camino que mejor proteja tu legado y el de tu familia.
                    </p>

                    {(tieneHumano || tieneMascota) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {tieneHumano && (
                                <Link
                                    href="/mi-plan"
                                    className="text-[9px] font-bold uppercase tracking-widest bg-[#F4EDE6] text-[#5D4E3F] px-3 py-2 rounded-full hover:bg-[#E3D9BC] transition"
                                >
                                    ✓ Ya tienes un plan activo — ver mi plan
                                </Link>
                            )}
                            {tieneMascota && (
                                <Link
                                    href="/mi-plan-mascota"
                                    className="text-[9px] font-bold uppercase tracking-widest bg-[#F4EDE6] text-[#5D4E3F] px-3 py-2 rounded-full hover:bg-[#E3D9BC] transition"
                                >
                                    ✓ Ya tienes plan de mascota — ver mi plan
                                </Link>
                            )}
                        </div>
                    )}
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl pb-20">
                    {planesVisibles.map((plan) => {
                        const cuota = Number(plan.cuota_base) || 0;
                        const nombreLimpio = plan.nombre.toLowerCase().replace('plan ', '').replace(/ /g, '_');
                        const rutaImagen = `/images/planes/mouri_${nombreLimpio}.png`;
                        const rutaPdf = `/pdfs/${nombreLimpio}.pdf`;
                        const esPlanMascotas = plan.nombre.toLowerCase().includes('huella eterna');
                        const tema = resolverTema(plan.nombre);
                        const IconoTema = tema.icono;

                        return (
                            <div key={plan.id}
                                 className="bg-[#FDFBF9] rounded-[35px] shadow-sm border border-[#5D4E3F]/5 overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-500 border-b-4 border-b-[#A68966] max-w-[340px]">

                                <div className="h-40 bg-[#5D4E3F] text-white relative overflow-hidden p-6 flex flex-col justify-end">
                                    <div className="relative z-10">
                                        <ShieldCheck className="w-6 h-6 text-[#A68966] mb-2" />
                                        <h2 className="text-lg font-black uppercase leading-tight tracking-tighter max-w-[180px]">
                                            {plan.nombre}
                                        </h2>
                                    </div>

                                    <img
                                        src={rutaImagen}
                                        className="absolute right-[-20px] bottom-[-30px] w-40 opacity-20 grayscale group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none z-0"
                                        alt={plan.nombre}
                                        onError={(e) => { e.target.src = '/images/elementos_dashboard/inscripcion_planes/mouri_planes.webp'; }}
                                    />
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-4 flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-[#5D4E3F]">
                                            ${cuota.toLocaleString('es-CO')}
                                        </span>
                                        <span className="text-[9px] opacity-40 font-bold uppercase tracking-widest">/ mes</span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#A68966] mt-0.5 shrink-0" />
                                            <p className="text-[10px] font-bold lowercase opacity-70 leading-snug">cobertura nacional completa</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#A68966] mt-0.5 shrink-0" />
                                            <p className="text-[10px] font-bold lowercase opacity-70 leading-snug">
                                                {esPlanMascotas ? 'Protección exclusiva para tu mascota' : `hasta ${plan.max_afiliados} beneficiarios`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-2 space-y-2">
                                        <Link
                                            href={esPlanMascotas ? '/mi-plan-mascota' : `/planes/inscribir/${plan.id}`}
                                            className="block w-full bg-[#5D4E3F] text-white py-3 rounded-2xl font-bold text-center hover:bg-[#A68966] transition-all shadow-md active:scale-95 lowercase tracking-widest text-[10px]"
                                        >
                                            inscribirme
                                        </Link>

                                        {/* 🆕 Botón "Descubrir" — abre el modal temático, sin tocar el flujo de inscripción */}
                                        <button
                                            type="button"
                                            onClick={() => setPlanEnfocado(plan)}
                                            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl border-2 font-bold text-center transition-all active:scale-95 lowercase tracking-widest text-[10px]"
                                            style={{ borderColor: tema.colorAcento, color: tema.colorAcento }}
                                        >
                                            <IconoTema size={13} />
                                            descubrir este plan
                                        </button>

                                        <a
                                            href={rutaPdf}
                                            download={`${nombreLimpio}.pdf`}
                                            className="flex items-center justify-center gap-2 w-full py-2 text-[#5D4E3F]/30 hover:text-[#5D4E3F] transition-all text-[8px] uppercase font-black tracking-widest"
                                        >
                                            <Download className="w-3 h-3" />
                                            descargar pdf
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {planesVisibles.length === 0 && (
                        <div className="col-span-full text-center py-16">
                            <ShieldCheck className="w-10 h-10 text-[#A68966] mx-auto mb-3 opacity-40" />
                            <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">
                                Ya tienes cobertura activa en todos los planes disponibles.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* 🆕 Modal "Descubrir Plan" */}
            {planEnfocado && (
                <ModalDescubrirPlan plan={planEnfocado} cerrar={() => setPlanEnfocado(null)} />
            )}

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.92) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-in { animation: modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

                @keyframes pasoIn {
                    from { opacity: 0; transform: translateX(10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-paso-in { animation: pasoIn 0.35s ease-out forwards; }
            `}</style>
        </div>
    );
}

/* ============================================================
 *  MODAL "DESCUBRIR PLAN" — ahora como slideshow interactivo,
 *  con el mismo lenguaje visual del tutorial estilo videojuego
 *  que ya usas en ServiciosExtrasPanel (barra de progreso, Paso
 *  X/Y, puntos de navegación, ◀ Anterior / Siguiente ▶).
 * ============================================================ */
function ModalDescubrirPlan({ plan, cerrar }) {
    const tema = resolverTema(plan.nombre);
    const IconoTema = tema.icono;
    const esPlanMascotas = plan.nombre.toLowerCase().includes('huella eterna');
    const cuota = Number(plan.cuota_base) || 0;
    const servicios = plan.servicios || [];

    // 🆕 Armamos las diapositivas: portada -> pasos del proceso -> servicios -> CTA
    const slides = [
        { tipo: 'portada' },
        ...PASOS_INSCRIPCION.map((paso, i) => ({ tipo: 'paso', paso, numero: i + 1 })),
        { tipo: 'servicios' },
        { tipo: 'cta' },
    ];

    const [indice, setIndice] = useState(0);
    const slide = slides[indice];
    const esUltima = indice === slides.length - 1;
    const esPrimera = indice === 0;

    const siguiente = () => setIndice((i) => Math.min(slides.length - 1, i + 1));
    const anterior = () => setIndice((i) => Math.max(0, i - 1));

    return (
        <div
            className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
            onClick={cerrar}
        >
            <div
                className="w-full max-w-lg rounded-[32px] shadow-2xl animate-modal-in bg-white overflow-hidden flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER TEMÁTICO — ícono centrado con brillo, sin partículas cayendo */}
                <div className={`relative overflow-hidden bg-gradient-to-br ${tema.gradienteHeader} px-6 pt-6 pb-5 shrink-0`}>
                    <button
                        type="button"
                        onClick={cerrar}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition z-20"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                            <div
                                className="absolute inset-0 rounded-2xl blur-md animate-pulse"
                                style={{ backgroundColor: tema.colorAcento, opacity: 0.5 }}
                            />
                            <div
                                className="relative w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                                style={{ backgroundColor: `${tema.colorAcento}33` }}
                            >
                                <IconoTema size={20} style={{ color: tema.colorAcento }} />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-black uppercase tracking-tight truncate" style={{ color: tema.colorTexto }}>
                                {plan.nombre}
                            </h2>
                            <p className="text-[10px] italic opacity-90 truncate" style={{ color: tema.colorTexto }}>
                                {tema.tagline}
                            </p>
                        </div>
                    </div>

                    {/* Barra de progreso + contador, mismo patrón que ya usas en Servicios Extra */}
                    <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-black/20 overflow-hidden">
                            <div
                                className="h-full transition-all duration-300"
                                style={{ width: `${((indice + 1) / slides.length) * 100}%`, backgroundColor: tema.colorAcento }}
                            />
                        </div>
                        <span className="text-[9px] font-black whitespace-nowrap" style={{ color: tema.colorTexto }}>
                            {indice + 1} / {slides.length}
                        </span>
                    </div>
                </div>

                {/* CUERPO — cambia según la diapositiva actual */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <div key={indice} className="animate-paso-in" style={{ opacity: 0 }}>
                        {slide.tipo === 'portada' && (
                            <div className="text-center py-2">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{ backgroundColor: `${tema.colorAcento}1A` }}
                                >
                                    <IconoTema size={30} style={{ color: tema.colorAcento }} />
                                </div>
                                <p className="text-[13px] leading-relaxed text-[#5D4E3F]/80 italic max-w-sm mx-auto">
                                    {tema.historia}
                                </p>
                                <div className="mt-5 inline-flex items-baseline gap-1 border border-[#5D4E3F]/10 rounded-2xl px-4 py-2">
                                    <span className="text-xl font-black text-[#5D4E3F]">${cuota.toLocaleString('es-CO')}</span>
                                    <span className="text-[9px] opacity-40 font-bold uppercase tracking-widest">/ mes</span>
                                </div>
                            </div>
                        )}

                        {slide.tipo === 'paso' && (
                            <div className="text-center py-2">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-xl"
                                    style={{ backgroundColor: `${tema.colorAcento}1A`, color: tema.colorAcento }}
                                >
                                    {slide.numero}
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: tema.colorAcento }}>
                                    Paso {slide.numero} del proceso
                                </p>
                                <p className="text-sm font-black text-[#5D4E3F] flex items-center justify-center gap-2 mb-2">
                                    <slide.paso.icono size={15} style={{ color: tema.colorAcento }} />
                                    {slide.paso.titulo}
                                </p>
                                <p className="text-[11px] text-[#5D4E3F]/60 leading-relaxed max-w-xs mx-auto">
                                    {slide.paso.texto}
                                </p>
                            </div>
                        )}

                        {slide.tipo === 'servicios' && (
                            <div className="py-2">
                                <p className="text-[9px] font-black uppercase tracking-widest mb-4 text-center" style={{ color: tema.colorAcento }}>
                                    Servicios relacionados
                                </p>
                                {servicios.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {servicios.map((s) => (
                                            <span
                                                key={s.id}
                                                className="text-[10px] font-bold px-3 py-1.5 rounded-full border"
                                                style={{ borderColor: `${tema.colorAcento}55`, color: tema.colorAcento }}
                                            >
                                                {s.nombre}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-[#5D4E3F]/50 italic text-center max-w-xs mx-auto">
                                        Podrás ver y agregar servicios extra al personalizar tu plan después de inscribirte.
                                    </p>
                                )}
                            </div>
                        )}

                        {slide.tipo === 'cta' && (
                            <div className="text-center py-2">
                                <SparklesIcon size={28} style={{ color: tema.colorAcento }} className="mx-auto mb-3" />
                                <p className="text-sm font-black text-[#5D4E3F] mb-1">¿Listo para dar el paso?</p>
                                <p className="text-[11px] text-[#5D4E3F]/60 mb-5 max-w-xs mx-auto">
                                    Activa {plan.nombre} hoy mismo y da tranquilidad a tu familia.
                                </p>
                                <Link
                                    href={esPlanMascotas ? '/mi-plan-mascota' : `/planes/inscribir/${plan.id}`}
                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 text-white py-3.5 rounded-2xl font-bold text-center transition-all shadow-md active:scale-95 lowercase tracking-widest text-[10px]"
                                    style={{ backgroundColor: tema.colorAcento }}
                                >
                                    <SparklesIcon size={14} />
                                    inscribirme ahora
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* NAVEGACIÓN — mismo patrón de ◀ Anterior / puntos / Siguiente ▶ */}
                <div className="px-6 py-4 border-t border-[#5D4E3F]/10 flex items-center justify-between shrink-0 bg-white">
                    <button
                        onClick={anterior}
                        disabled={esPrimera}
                        className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition bg-[#F4EDE6] text-[#5D4E3F] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#EAD9BE]"
                    >
                        ◀ Anterior
                    </button>

                    <div className="flex gap-1">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndice(i)}
                                className="h-2 rounded-full transition-all"
                                style={{
                                    width: i === indice ? '16px' : '8px',
                                    backgroundColor: i === indice ? tema.colorAcento : `${tema.colorAcento}33`,
                                }}
                                aria-label={`Ir a la diapositiva ${i + 1}`}
                            />
                        ))}
                    </div>

                    {!esUltima ? (
                        <button
                            onClick={siguiente}
                            className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition text-white"
                            style={{ backgroundColor: tema.colorAcento }}
                        >
                            Siguiente ▶
                        </button>
                    ) : (
                        <button
                            onClick={cerrar}
                            className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition bg-[#F4EDE6] text-[#5D4E3F] hover:bg-[#EAD9BE]"
                        >
                            Cerrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

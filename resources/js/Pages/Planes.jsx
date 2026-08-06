import React, { useState, useEffect } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head, useForm } from '@inertiajs/react';
import MusicAlbum from '@/Components/MusicAlbum';
import RecuerdosCarousel from '@/Components/RecuerdosCarousel';

const planesData = [
    {
        id: 'sereno',
        titulo: 'Descanso Sereno',
        precioIndividual: 5000,
        enfoque: 'Un servicio digno, esencial y respetuoso. Diseñado para brindar tranquilidad inmediata y un respaldo sólido en los momentos que más se necesita la guía experta.',
        mouri: '/images/planes/tarjetas/sereno/logo_descanso_sereno.webp',
        tipoNombre: 'Esencial',
        unidad: 'persona',
        detalles: [
            { cat: 'Atención Integral', items: ['Orientación profesional 24/7', 'Tanatopraxia técnica certificada', 'Cofre de línea estándar o semilujo', 'Traslados nacionales hasta 150 km', 'Diligencias ante Registro Civil'] },
            { cat: 'Velación Humana', items: ['Sala de velación por 16 horas', 'Arreglo floral fúnebre natural', 'Libro de firmas para recuerdos', 'Estación permanente de café y aromáticas', 'Asesoría en protocolo de despedida'] },
            { cat: 'Destino Final', items: ['Inhumación o Cremación asistida', 'Lote en comodato (según disponibilidad legal)', 'Urna para cenizas en madera', 'Certificación de destino final'] }
        ]
    },
    {
        id: 'legado',
        titulo: 'Legado Eterno',
        precioIndividual: 7500,
        enfoque: 'Honrar la historia de vida con detalles que perduran. Un homenaje profundo que resalta los valores y el camino recorrido por nuestros seres queridos.',
        mouri: '/images/planes/tarjetas/legado/logo_legado_eterno.gif',
        tipoNombre: 'Historia',
        unidad: 'persona',
        detalles: [
            { cat: 'Atención Superior', items: ['Tanatopraxia avanzada estética', 'Cofre semi lujo con acabados finos', 'Acompañamiento legal y notarial total', 'Coche fúnebre de lujo para traslados'] },
            { cat: 'Homenaje Especial', items: ['Sala 24 horas en sedes VIP', 'Dos arreglos florales de diseño', 'Video homenaje proyectado en sala', 'Estación de café premium y refrigerio ligero'] },
            { cat: 'Cortejo y Redes', items: ['Autobús para 40 acompañantes', 'Transmisión en vivo para familiares en el exterior', 'Coche especial para arreglos florales'] },
            { cat: 'Destino con Honor', items: ['Inhumación o Cremación con protocolo', 'Urna de madera fina grabada en láser', 'Apoyo en trámites de exhumación futura'] }
        ]
    },
    {
        id: 'tributo',
        titulo: 'Tributo a la Vida',
        precioIndividual: 10000,
        enfoque: 'Una celebración emotiva, personal y de alta gama. Para quienes desean transformar el adiós en un evento memorable lleno de luz, música y detalles únicos.',
        mouri: '/images/planes/tarjetas/tributo/logo_tributo.webp',
        tipoNombre: 'Tributo',
        unidad: 'persona',
        detalles: [
            { cat: 'Experiencias Especiales', items: ['Música instrumental en vivo (Violín/Piano)', 'Ceremonia de despedida personalizada por orador', 'Video tributo cinematográfico 4K', 'Servicio de catering premium para invitados'] },
            { cat: 'Atención Premium', items: ['Cofre de lujo en madera de cedro o caoba', 'Tanatopraxia estética de alta definición', 'Gestión total de trámites ante todas las entidades'] },
            { cat: 'Velación Exclusiva', items: ['Ambientación floral temática personalizada', 'Estación de snacks, frutas y bebidas frías', 'Acompañamiento psicológico especializado in situ'] },
            { cat: 'Destino VIP', items: ['Inhumación o Cremación en sectores preferenciales', 'Urna especial de diseño artístico', 'Placa conmemorativa personalizada'] }
        ]
    },
    {
        id: 'huella',
        titulo: 'Huella Eterna',
        precioIndividual: 13000,
        enfoque: 'Amor y respeto infinito para los compañeros que dejan su marca en el alma. Un adiós digno para nuestras mascotas, tratándolas como los miembros de familia que son.',
        mouri: '/images/planes/tarjetas/huella/logo_huella_eterna.webp',
        tipoNombre: 'Mascotas',
        unidad: 'mascota',
        detalles: [
            { cat: 'Servicios Mascotas', items: ['Cremación individual con entrega de cenizas', 'Urna decorativa temática a elección', 'Huella memorial en arcilla o escayola', 'Mechón de pelo memorial (opcional)'] },
            { cat: 'Ritual de Despedida', items: ['Espacio simbólico privado para la familia', 'Ritual de luz y siembra de vida', 'Música ambiental relajante para el proceso'] },
            { cat: 'Atención y Respeto', items: ['Recogida en veterinaria o domicilio 24h', 'Preparación estética digna del peludito', 'Certificado oficial de cremación y duelo'] }
        ]
    }
];

const serviciosGenerales = [
    { servicio: "Traslado Inicial", cobertura: "Recogida desde el lugar del fallecimiento (clínica o casa) hasta la unidad de preservación." },
    { servicio: "Asesoría Legal", cobertura: "Acompañamiento experto en trámites de defunción, licencias de inhumación y registros notariales." },
    { servicio: "Laboratorio Ético", cobertura: "Preparación técnica realizada por profesionales certificados bajo estándares de dignidad absoluta." },
    { servicio: "Cofre y Velación", cobertura: "Suministro de cofre según plan y acceso a salas de velación confortables a nivel nacional." },
    { servicio: "Asistencia 24/7", cobertura: "Línea de vida Mouren activa siempre para guiar a la familia en cada paso del proceso." },
    { servicio: "Red de Apoyo", cobertura: "Convenios en todo el territorio nacional para garantizar el servicio donde se necesite." }
];

// --- COMPONENTE NUEVO: SECCIÓN DE OPINIONES (CARRUSEL HORIZONTAL) ---

// Paleta de acentos para variar el color del avatar/borde de cada tarjeta
const ACENTOS = ['#A68966', '#FFC600', '#5D4E3F', '#C9A876'];

function iniciales(nombre) {
    if (!nombre) return '?';
    const partes = nombre.trim().split(' ');
    const primera = partes[0]?.[0] || '';
    const segunda = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primera + segunda).toUpperCase();
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function SeccionOpiniones() {
    const [opiniones, setOpiniones] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        nombre: '',
        mensaje: '',
    });

    const cargarOpiniones = () => {
        fetch('/opiniones')
            .then((res) => res.json())
            .then((data) => setOpiniones(data));
    };

    useEffect(() => {
        cargarOpiniones();
    }, []);

    const enviarOpinion = (e) => {
        e.preventDefault();
        post('/opiniones', {
            onSuccess: () => {
                reset();
                cargarOpiniones();
                setMostrarForm(false);
            },
        });
    };

    return (
        <section className="bg-[#F4EDE6] py-16 sm:py-20 px-4 sm:px-6 border-t border-[#5D4E3F]/10">
            <div className="max-w-6xl mx-auto">
                {/* --- ENCABEZADO --- */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                    <div>
                        <span className="text-[#A68966] text-[10px] font-black uppercase tracking-[3px]">Testimonios</span>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#5D4E3F] italic mt-1">
                            ¿Qué opinan de Mouren?
                        </h2>
                        <p className="text-[#5D4E3F]/60 text-xs mt-2 max-w-md">
                            Historias reales de familias que confiaron en nosotros para honrar a sus seres queridos.
                        </p>
                    </div>
                    <button
                        onClick={() => setMostrarForm(!mostrarForm)}
                        className="shrink-0 bg-[#5D4E3F] hover:bg-[#FFC600] hover:text-[#5D4E3F] text-white font-black px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 w-fit"
                    >
                        {mostrarForm ? '✕ Cerrar' : '✍️ Dejar mi opinión'}
                    </button>
                </div>

                {/* --- FORMULARIO (colapsable) --- */}
                {mostrarForm && (
                    <form
                        onSubmit={enviarOpinion}
                        className="bg-white rounded-[24px] shadow-xl border border-[#5D4E3F]/10 p-6 sm:p-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"
                    >
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                className="w-full border border-[#5D4E3F]/20 rounded-xl p-3 text-sm focus:outline-none focus:border-[#FFC600] focus:ring-2 focus:ring-[#FFC600]/30 transition-all"
                            />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <textarea
                                placeholder="Cuéntanos tu experiencia con nosotros..."
                                value={data.mensaje}
                                onChange={(e) => setData('mensaje', e.target.value)}
                                rows={3}
                                className="w-full border border-[#5D4E3F]/20 rounded-xl p-3 text-sm focus:outline-none focus:border-[#FFC600] focus:ring-2 focus:ring-[#FFC600]/30 transition-all resize-none"
                            />
                            {errors.mensaje && <p className="text-red-500 text-xs mt-1">{errors.mensaje}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="md:col-span-2 justify-self-start bg-[#FFC600] text-[#5D4E3F] font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-md active:scale-95"
                        >
                            {processing ? 'Enviando...' : 'Publicar opinión'}
                        </button>
                    </form>
                )}

                {/* --- CARRUSEL HORIZONTAL --- */}
                {opiniones.length === 0 ? (
                    <p className="text-center text-[#5D4E3F]/50 text-xs italic py-10">
                        Aún no hay opiniones. ¡Sé el primero en compartir la tuya!
                    </p>
                ) : (
                    <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory custom-scrollbar-h -mx-4 px-4 sm:mx-0 sm:px-0">
                        {opiniones.map((op, idx) => {
                            const acento = ACENTOS[idx % ACENTOS.length];
                            return (
                                <div
                                    key={op.id}
                                    className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-white rounded-[24px] shadow-lg border border-[#5D4E3F]/10 p-6 flex flex-col hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                                    style={{ borderTop: `4px solid ${acento}` }}
                                >
                                    {/* Comilla decorativa */}
                                    <span
                                        className="text-5xl font-black leading-none mb-2 select-none"
                                        style={{ color: acento, opacity: 0.25 }}
                                    >
                                        "
                                    </span>

                                    <p className="text-[#5D4E3F] text-sm leading-relaxed italic flex-1 mb-6">
                                        {op.mensaje}
                                    </p>

                                    <div className="flex items-center gap-3 pt-4 border-t border-[#F4EDE6]">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0"
                                            style={{ backgroundColor: acento }}
                                        >
                                            {iniciales(op.nombre)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-[#5D4E3F] text-sm truncate">{op.nombre}</p>
                                            {op.created_at && (
                                                <p className="text-[#5D4E3F]/40 text-[10px]">{formatearFecha(op.created_at)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar-h::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar-h::-webkit-scrollbar-track {
                    background: #ffffff80;
                    border-radius: 10px;
                }
                .custom-scrollbar-h::-webkit-scrollbar-thumb {
                    background: #A68966;
                    border-radius: 10px;
                }
                .custom-scrollbar-h::-webkit-scrollbar-thumb:hover {
                    background: #5D4E3F;
                }
            `}</style>
        </section>
    );
}
// --- FIN COMPONENTE NUEVO ---

export default function Planes() {
    const [planActivo, setPlanActivo] = useState(null);

    const scrollToPlanes = () => {
        document.getElementById('seccion-planes').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#F4EDE6] font-['Hepta_Slab'] relative overflow-x-hidden flex flex-col text-[#5D4E3F]">
            <Head title="Nuestros Planes - Mouren" />
            <Navbar />

            {/* --- SECCIÓN 1: BANNER --- */}
            <section className="relative min-h-screen h-screen flex flex-col justify-center items-center">
                <div className="absolute inset-0 z-0">
                    <img src="/images/planes/fondo_animado_planes.gif" className="w-full h-full object-cover" alt="Fondo" />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center px-5 sm:px-8 md:px-10 mt-20 animate-fade-in">
                    <h1 className="text-[24px] sm:text-[30px] md:text-[40px] font-bold text-white drop-shadow-[0_8px_15px_rgba(0,0,0,0.8)] leading-tight mb-4  tracking-tighter">
                        Nuestros Planes Y Servicios
                    </h1>
                    <p className="text-white text-base sm:text-lg md:text-xl drop-shadow-lg mb-8 max-w-2xl font-light italic opacity-90">
                        Acompañamos el ciclo de la vida con respeto, dignidad y amor, brindando soluciones integrales para humanos y mascotas en sus momentos más delicados.
                    </p>
                    {/* Botón más pequeño y con nuevo texto */}
                    <button onClick={scrollToPlanes} className="bg-[#FFC600] text-[#5D4E3F] px-8 py-3 text-sm font-black rounded-full shadow-2xl hover:scale-105 transition-all tracking-[2px]">
                        Descubrir ahora
                    </button>
                </div>
            </section>

            {/* --- NUEVA SECCIÓN: TEXTO Y TABLA DE SERVICIOS --- */}
            <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white/40">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-10 sm:mb-12 text-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#A68966] mb-4">Un Compromiso de Corazón</h2>
                        <p className="text-[#5D4E3F] max-w-3xl mx-auto text-xs leading-relaxed italic">
                            En Mouren, entendemos que cada despedida es única. Por eso, hemos consolidado una base de servicios generales de alta calidad que se incluyen en cada uno de nuestros planes, asegurando que la dignidad y el profesionalismo sean el estándar de nuestra atención.
                        </p>
                    </div>

                    <div className="bg-white rounded-[20px] sm:rounded-[30px] shadow-xl border border-[#5D4E3F]/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[480px] text-left text-[10px] md:text-xs">
                                <thead className="bg-[#5D4E3F] text-white tracking-wider">
                                    <tr>
                                        <th className="p-4 font-bold">Servicio Incluido</th>
                                        <th className="p-4 font-bold">Especificación de Cobertura Integral</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviciosGenerales.map((item, i) => (
                                        <tr key={i} className="border-b border-[#F4EDE6] hover:bg-[#FFC600]/5 transition-colors">
                                            <td className="p-3 font-black text-[#A68966] italic">{item.servicio}</td>
                                            <td className="p-3 text-[#5D4E3F] leading-tight">{item.cobertura}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN 2: TARJETAS --- */}
            <section id="seccion-planes" className="relative z-20 pt-16 pb-40 px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
                    {planesData.map((plan) => (
                        <div key={plan.id} className="bg-[#4a3f35] rounded-[25px] p-5 shadow-2xl border-b-8 border-[#A68966] flex flex-col items-center group hover:-translate-y-3 transition-all duration-500">
                            {/* Imagen Arreglada: Contenedor con altura fija y object-contain */}
                            <div className="w-full h-40 bg-[#5D4E3F] rounded-2xl p-4 mb-4 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden">
                                <img src={plan.mouri} alt="Plan" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                            </div>

                            <h3 className="text-white text-lg font-bold mb-1 italic">{plan.titulo}</h3>
                            <div className="bg-[#A68966] text-white text-[8px] font-bold px-3 py-1 rounded-full mb-5 tracking-widest ">
                                {plan.tipoNombre}
                            </div>

                            <div className="w-full bg-black/20 rounded-xl p-3 text-white text-[10px] mb-6 space-y-2">
                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                    <span className="opacity-70 italic font-light tracking-tight">Valor inversión</span>
                                    <span className="font-bold text-[#FFC600] text-sm">
                                        ${plan.precioIndividual.toLocaleString()}
                                        <span className="text-[8px] opacity-60">/{plan.unidad === 'persona' ? 'p' : 'm'}</span>
                                    </span>
                                </div>
                                <p className="text-center opacity-85 italic text-[10px] leading-tight h-12 flex items-center justify-center">
                                    {plan.enfoque}
                                </p>
                            </div>

                            <button onClick={() => setPlanActivo(plan)} className="w-full bg-[#F4EDE6] hover:bg-[#FFC600] text-[#5D4E3F] font-black py-2.5 rounded-lg transition-all text-[9px] tracking-wider shadow-lg  mb-2 active:scale-95">
                                🔍 Ver especificaciones
                            </button>

                            <button className="w-full bg-[#A68966] hover:bg-white hover:text-[#5D4E3F] text-white font-black py-2.5 rounded-lg transition-all text-[9px] tracking-wider shadow-lg  active:scale-95">
                                ✍️ Iniciar afiliación
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- MODAL MEJORADO --- */}
            {planActivo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-[#F4EDE6]/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-white w-full max-w-6xl h-[92vh] sm:h-[85vh] overflow-hidden rounded-[22px] sm:rounded-[32px] md:rounded-[40px] shadow-3xl relative border-4 sm:border-6 md:border-8 border-[#5D4E3F] flex flex-col md:flex-row animate-scale-up">

                        <button onClick={() => setPlanActivo(null)} className="absolute top-2 right-3 sm:top-4 sm:right-6 text-3xl sm:text-4xl md:text-5xl font-light hover:text-red-500 z-[110] transition-transform hover:rotate-90">&times;</button>

                        <div className="md:w-1/3 shrink-0 bg-[#5D4E3F] p-5 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 flex items-center justify-center mb-4 md:mb-6">
                                <img src={planActivo.mouri} alt="Plan" className="max-w-full max-h-full object-contain drop-shadow-xl animate-float" />
                            </div>
                            <h2 className="text-white text-xl sm:text-2xl font-black italic mb-2  tracking-tighter">{planActivo.titulo}</h2>
                            <div className="bg-[#FFC600] text-[#5D4E3F] px-5 py-1 rounded-full font-bold text-xs mb-6 uppercase">
                                {planActivo.tipoNombre}
                            </div>
                            <p className="text-white/60 italic text-xs leading-relaxed px-4">{planActivo.enfoque}</p>
                        </div>

                        <div className="md:w-2/3 flex-1 min-h-0 p-5 sm:p-7 md:p-10 overflow-y-auto custom-scrollbar relative bg-white">
                            <div className="mb-8 border-b-2 border-[#F4EDE6] pb-4">
                                <h3 className="text-[#5D4E3F] text-xl sm:text-2xl font-black mb-1 italic">Detalles Técnicos y Coberturas</h3>
                                <p className="text-[#A68966] text-xs font-bold uppercase tracking-widest">Inversión Individual: ${planActivo.precioIndividual.toLocaleString()} COP</p>
                            </div>

                            <div className="mb-10 grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div key={n} className="bg-[#F4EDE6] border-2 border-[#5D4E3F]/5 p-3 rounded-2xl shadow-sm hover:border-[#FFC600] transition-all group">
                                        <p className="text-[9px] font-bold text-[#A68966] group-hover:text-[#5D4E3F]">{n} {planActivo.unidad === 'persona' ? 'Pers.' : 'Masc.'}</p>
                                        <p className="font-bold text-[#5D4E3F] text-[10px]">${(planActivo.precioIndividual * n).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6 pb-20">
                                {planActivo.detalles.map((seccion, idx) => (
                                    <div key={idx} className="flex gap-4 sm:gap-6 items-start bg-[#F4EDE6]/20 p-4 sm:p-6 rounded-3xl border border-[#5D4E3F]/5 hover:bg-white hover:shadow-lg transition-all duration-300">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-[#5D4E3F]/10 shadow-inner">
                                            <img
                                                src={`/images/planes/tarjetas/${planActivo.id}/imagen_${idx + 1}.jpg`}
                                                alt="Visual del servicio"
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-[#A68966] uppercase text-xs mb-3 tracking-widest flex items-center gap-2">
                                                <span className="w-8 h-[2px] bg-[#FFC600]"></span>
                                                {seccion.cat}
                                            </h4>
                                            <ul className="grid grid-cols-1 gap-2">
                                                {seccion.items.map((item, i) => (
                                                    <li key={i} className="text-[10px] flex items-start gap-2 text-[#5D4E3F] font-medium leading-tight">
                                                        <span className="w-1.5 h-1.5 bg-[#A68966] rounded-full shrink-0 mt-0.5"></span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* --- BOTÓN DE CONTACTO FLOTANTE --- */}
                        <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 flex flex-col items-center group z-[120]">
                            <div className="w-14 h-14 bg-[#FFC600] border-2 border-[#FFC600] rounded-full flex items-center justify-center shadow-2xl hover:rotate-6 hover:scale-110 transition-all cursor-pointer">
                                <img src="/images/planes/tarjetas/mouri_sac.png" alt="SAC" className="w-10 h-10 object-contain" />
                            </div>
                            <span className="text-[8px] font-black text-[#5D4E3F] uppercase text-center mt-2 leading-tight bg-white px-2 py-1 rounded-lg border border-[#FFC600]/20 shadow-md group-hover:bg-[#FFC600] transition-colors">
                                ¿Dudas? Habla<br />con un asesor
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <MusicAlbum />
            {/* --- SECCIÓN DE VIDEO Y GUÍA DE DUELO --- */}
            <section className="bg-[#F4EDE6] flex flex-col md:flex-row items-stretch overflow-hidden border-[#A68966]/20 h-auto md:h-[600px]">

                {/* LADO IZQUIERDO: MOURI EN EL PARQUE (GIF COMO FONDO COMPLETO CON CAPA NEGRA Y DIFUSIÓN) */}
                <div className="md:w-1/2 relative bg-[#E9DCC9] flex items-center justify-center min-h-[280px] sm:min-h-[350px] md:min-h-full overflow-hidden">

                    {/* El GIF ocupando todo el ancho y alto disponible */}
                    <img
                        src="/images/planes/mouri_sentando.gif"
                        alt="Mouri en el parque"
                        className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                    />

                    {/* NUEVA CAPA NEGRA UNIFORME CON EFECTO DE DIFUSIÓN (BACKDROP-BLUR) */}
                    {/* Usamos bg-black con una opacidad y un efecto de desenfoque de fondo para lograr la difusión. */}
                    <div className="absolute inset-0 bg-black/40 z-10 backdrop-blur-sm" />

                    {/* Fondo sutil de textura (opcional, ahora por encima de la capa negra si se quiere integrar) */}
                    <div className="absolute inset-0 opacity-10 z-20" style={{ backgroundImage: 'radial-gradient(#5D4E3F 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    {/* Adorno visual de estrella/brillo - ajustado para que sea visible */}
                    <div className="absolute bottom-6 right-6 text-white md:text-[#FFC600] opacity-70 text-2xl z-20">✦</div>
                </div>

                {/* LADO DERECHO: CONTENIDO Y VIDEO (SE MANTIENE LA MISMA ALTURA) */}
                <div className="md:w-1/2 bg-[#5D4E3F] p-6 sm:p-8 md:p-20 flex flex-col justify-center text-white z-20 h-auto md:h-full">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-6 tracking-tighter leading-tight">
                        Espacio para un video
                    </h2>

                    <p className="text-sm md:text-base opacity-80 mb-10 font-light leading-relaxed max-w-lg">
                        Acompañamos tu proceso con material educativo y momentos de reflexión.
                        Nuestros videos están diseñados para brindarte serenidad y las herramientas
                        necesarias para honrar la memoria de quienes siempre vivirán en nuestro corazón.
                    </p>

                    {/* CONTENEDOR DEL VIDEO (Proporción 16:9, compacto) */}
                    <div className="relative w-full aspect-video bg-white/10 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl mb-10 group">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/TU_ID_DE_VIDEO"
                            title="Video informativo Mouren"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    {/* ENLACE DE DESCARGA PDF */}
                    <a
                        href="/downloads/guia_duelo_mouren.pdf"
                        download
                        className="flex items-center gap-3 text-[#FFC600] font-black uppercase tracking-[3px] text-xs hover:gap-5 transition-all group w-fit"
                    >
                        <span className="border-b-2 border-[#FFC600] pb-1 group-hover:border-white transition-colors">
                            Descargar guía de duelo (PDF)
                        </span>
                        <span className="text-lg">→</span>
                    </a>
                </div>
            </section>

            <RecuerdosCarousel />

            {/* --- SECCIÓN DE OPINIONES (NUEVA) --- */}
            <SeccionOpiniones />

            <div className="mt-14 sm:mt-32">
                <Footer />
            </div>

            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-scale-up {
                    animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

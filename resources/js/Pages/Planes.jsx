import React, { useState } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head } from '@inertiajs/react';
import MusicAlbum from '@/Components/MusicAlbum';
import RecuerdosCarousel from '@/Components/RecuerdosCarousel';

const planesData = [
    {
        id: 'sereno',
        titulo: 'Descanso Sereno',
        precioIndividual: 5000,
        enfoque: 'Un servicio digno, esencial y respetuoso. Diseñado para brindar tranquilidad inmediata y un respaldo sólido en los momentos que más se necesita la guía experta.',
        mouri: '/images/planes/tarjetas/logo_descanso_sereno.gif',
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
        mouri: '/images/planes/mouri_legado.png',
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
        mouri: '/images/planes/mouri_tributo.png',
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
        mouri: '/images/planes/mouri_mascota.png',
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
            <section className="relative h-screen flex flex-col justify-center items-center">
                <div className="absolute inset-0 z-0">
                    <img src="/images/planes/fondo_animado_planes.gif" className="w-full h-full object-cover" alt="Fondo" />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center px-10 mt-20 animate-fade-in">
                    <h1 className="text-[30px] md:text-[40px] font-bold text-white drop-shadow-[0_8px_15px_rgba(0,0,0,0.8)] leading-tight mb-4  tracking-tighter">
                        Nuestros Planes Y Servicios
                    </h1>
                    <p className="text-white text-lg md:text-xl drop-shadow-lg mb-8 max-w-2xl font-light italic opacity-90">
                        Acompañamos el ciclo de la vida con respeto, dignidad y amor, brindando soluciones integrales para humanos y mascotas en sus momentos más delicados.
                    </p>
                    {/* Botón más pequeño y con nuevo texto */}
                    <button onClick={scrollToPlanes} className="bg-[#FFC600] text-[#5D4E3F] px-8 py-3 text-sm font-black rounded-full shadow-2xl hover:scale-105 transition-all tracking-[2px]">
                        Descubrir ahora
                    </button>
                </div>
            </section>

            {/* --- NUEVA SECCIÓN: TEXTO Y TABLA DE SERVICIOS --- */}
            <section className="py-20 px-6 bg-white/40">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12 text-center">
                        <h2 className="text-2xl font-bold text-[#A68966] mb-4">Un Compromiso de Corazón</h2>
                        <p className="text-[#5D4E3F] max-w-3xl mx-auto text-xs leading-relaxed italic">
                            En Mouren, entendemos que cada despedida es única. Por eso, hemos consolidado una base de servicios generales de alta calidad que se incluyen en cada uno de nuestros planes, asegurando que la dignidad y el profesionalismo sean el estándar de nuestra atención.
                        </p>
                    </div>

                    <div className="bg-white rounded-[30px] shadow-xl border border-[#5D4E3F]/10 overflow-hidden">
                        <table className="w-full text-left text-[10px] md:text-xs">
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
            </section>

            {/* --- SECCIÓN 2: TARJETAS --- */}
            <section id="seccion-planes" className="relative z-20 pt-16 pb-40 px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#F4EDE6]/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-white w-full max-w-6xl h-[85vh] overflow-hidden rounded-[40px] shadow-3xl relative border-8 border-[#5D4E3F] flex flex-col md:flex-row animate-scale-up">
                        
                        <button onClick={() => setPlanActivo(null)} className="absolute top-4 right-6 text-5xl font-light hover:text-red-500 z-[110] transition-transform hover:rotate-90">&times;</button>

                        <div className="md:w-1/3 bg-[#5D4E3F] p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-48 h-48 flex items-center justify-center mb-6">
                                <img src={planActivo.mouri} alt="Plan" className="max-w-full max-h-full object-contain drop-shadow-xl animate-float" />
                            </div>
                            <h2 className="text-white text-2xl font-black italic mb-2  tracking-tighter">{planActivo.titulo}</h2>
                            <div className="bg-[#FFC600] text-[#5D4E3F] px-5 py-1 rounded-full font-bold text-xs mb-6 uppercase">
                                {planActivo.tipoNombre}
                            </div>
                            <p className="text-white/60 italic text-xs leading-relaxed px-4">{planActivo.enfoque}</p>
                        </div>

                        <div className="md:w-2/3 p-10 overflow-y-auto custom-scrollbar relative bg-white">
                            <div className="mb-8 border-b-2 border-[#F4EDE6] pb-4">
                                <h3 className="text-[#5D4E3F] text-2xl font-black mb-1 italic">Detalles Técnicos y Coberturas</h3>
                                <p className="text-[#A68966] text-xs font-bold uppercase tracking-widest">Inversión Individual: ${planActivo.precioIndividual.toLocaleString()} COP</p>
                            </div>

                            <div className="mb-10 grid grid-cols-5 gap-2 text-center">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div key={n} className="bg-[#F4EDE6] border-2 border-[#5D4E3F]/5 p-3 rounded-2xl shadow-sm hover:border-[#FFC600] transition-all group">
                                        <p className="text-[9px] font-bold text-[#A68966] group-hover:text-[#5D4E3F]">{n} {planActivo.unidad === 'persona' ? 'Pers.' : 'Masc.'}</p>
                                        <p className="font-bold text-[#5D4E3F] text-[10px]">${(planActivo.precioIndividual * n).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6 pb-20">
                                {planActivo.detalles.map((seccion, idx) => (
                                    <div key={idx} className="flex gap-6 items-start bg-[#F4EDE6]/20 p-6 rounded-3xl border border-[#5D4E3F]/5 hover:bg-white hover:shadow-lg transition-all duration-300">
                                        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-[#5D4E3F]/10 shadow-inner">
                                            <span className="text-[8px] font-bold opacity-20 italic text-center px-1">Visual Mouren {idx + 1}</span>
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
                        <div className="fixed bottom-10 right-10 flex flex-col items-center group z-[120]">
                            <div className="w-14 h-14 bg-[#4f81bd] border-2 border-[#FFB200] rounded-full flex items-center justify-center shadow-2xl hover:rotate-6 hover:scale-110 transition-all cursor-pointer">
                                <img src="/images/planes/tarjetas/mouri_sac.png" alt="SAC" className="w-10 h-10 object-contain" />
                            </div>
                            <span className="text-[8px] font-black text-[#5D4E3F] uppercase text-center mt-2 leading-tight bg-white px-2 py-1 rounded-lg border border-[#A68966]/20 shadow-md group-hover:bg-[#FFC600] transition-colors">
                                ¿Dudas? Habla<br />con un asesor
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <MusicAlbum />
            <RecuerdosCarousel />
            <Footer />

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
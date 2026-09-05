import React, { useRef, useState } from 'react';

// ============================================================
// DATA DE LOS 4 PLANES — antes vivía dentro de Planes.jsx, ahora
// vive aquí junto con la tarjeta que la muestra. Se exporta por si
// en el futuro se necesita en otro lado (ej. un buscador de planes).
// ============================================================
export const planesData = [
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
        titulo: 'Última Rumba',
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

// ============================================================
// TARJETA CON INCLINACIÓN 3D (efecto tipo carta de colección)
// Solo la usan las tarjetas de planes, por eso vive en este archivo.
// ============================================================
function TiltCard({ children, className = '' }) {
    const ref = useRef(null);
    const [style, setStyle] = useState({
        transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
    });

    const handleMove = (e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 12;
        const rotateX = ((y / rect.height) - 0.5) * -12;
        setStyle({
            transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`,
        });
    };

    const handleLeave = () => {
        setStyle({ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)' });
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className={className}
            style={{ transition: 'transform 0.25s ease-out', transformStyle: 'preserve-3d', willChange: 'transform', ...style }}
        >
            {children}
        </div>
    );
}

// ============================================================
// CUADRÍCULA DE LAS 4 TARJETAS — se usa así en Planes.jsx:
//   <PlanesTarjetas onSeleccionarPlan={setPlanActivo} />
// El componente padre sigue siendo dueño del estado "planActivo";
// aquí solo se avisa cuál tarjeta se tocó.
// ============================================================
export default function PlanesTarjetas({ onSeleccionarPlan }) {
    return (
        <section id="seccion-planes" className="relative z-20 pt-16 pb-40 px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
                {planesData.map((plan) => (
                    <TiltCard key={plan.id} className="rounded-[25px]">
                        <div className="bg-[#4a3f35] rounded-[25px] p-5 shadow-2xl border-b-8 border-[#A68966] flex flex-col items-center group hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-shadow duration-500">
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

                            <button onClick={() => onSeleccionarPlan(plan)} className="w-full bg-[#F4EDE6] hover:bg-[#FFC600] text-[#5D4E3F] font-black py-2.5 rounded-lg transition-all text-[9px] tracking-wider shadow-lg  mb-2 active:scale-95">
                                🔍 Ver especificaciones
                            </button>

                            <button className="w-full bg-[#A68966] hover:bg-white hover:text-[#5D4E3F] text-white font-black py-2.5 rounded-lg transition-all text-[9px] tracking-wider shadow-lg  active:scale-95">
                                ✍️ Iniciar afiliación
                            </button>
                        </div>
                    </TiltCard>
                ))}
            </div>
        </section>
    );
}

import React, { useRef } from 'react';

const recuerdos = [
    { id: 1, nombre: 'Separador de libro', plan: 'Plan Descanso Sereno', imagen: '/images/planes/recuerdos/separador.png', desc: 'Conserva su esencia en un detalle de cristal fino.' },
    { id: 2, nombre: 'Recuerdo con perlas', plan: 'Plan Descanso Sereno', imagen: '/images/planes/recuerdos/recordatorio_con_perlas.png', desc: 'Acabados naturales que honran la vida con sencillez.' },
    { id: 3, nombre: 'Mouri con flores', plan: 'Plan Descanso Sereno', imagen: '/images/planes/recuerdos/peluche_mouri.png', desc: 'Grabado eterno para un recuerdo inmarcesible.' },
    { id: 4, nombre: 'Taza del Alma', plan: 'Plan Legado Eterno', imagen: '/images/planes/recuerdos/taza_mouri.png', desc: 'Lleva un símbolo de amor siempre cerca de ti.' },
    { id: 5, nombre: 'Árbol de Vida', plan: 'Plan Tributo a la Vida', imagen: '/images/planes/recuerdos/planta_lazo.png', desc: 'Un tributo vivo que crece en honor a su memoria.' },
    { id: 6, nombre: 'Cofre de Recuerdos', plan: 'Plan Legado Eterno', imagen: '/images/planes/recuerdos/recordatorio_circular.png', desc: 'Espacio sagrado para los tesoros de una historia.' },
    { id: 7, nombre: 'Pulsera de Luz', plan: 'Plan Huella Eterna', imagen: '/images/planes/recuerdos/pulsera_mascotas.png', desc: 'Retrato artístico que ilumina cada rincón.' },
    { id: 8, nombre: 'Vela de Honor', plan: 'Plan Esencial', imagen: '/images/planes/recuerdos/separador.png', desc: 'Una luz suave para acompañar tus oraciones.' },
];

export default function RecuerdosCarousel() {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        const { current } = scrollRef;
        const scrollAmount = 400;
        if (direction === 'left') {
            current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-20 bg-[#F4EDE6] relative overflow-hidden">
            <div className="max-w-[1500px] mx-auto px-4">
                
                {/* Títulos y Flechas */}
                <div className="flex justify-between items-center mb-10 px-4">
                    <div>
                        <h2 className="text-3xl font-black text-[#5D4E3F] italic tracking-tighter">
                            Nuestros <span className="text-[#A68966]">Recuerdos</span>
                        </h2>
                        <p className="text-[#A68966] font-bold text-[10px]  tracking-widest">Personaliza tu despedida</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-[#5D4E3F] text-[#5D4E3F] hover:bg-[#5D4E3F] hover:text-white transition-all flex items-center justify-center font-bold text-sm">
                            ←
                        </button>
                        <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-[#5D4E3F] text-[#5D4E3F] hover:bg-[#5D4E3F] hover:text-white transition-all flex items-center justify-center font-bold text-sm">
                            →
                        </button>
                    </div>
                </div>

                {/* Contenedor del Carrusel - Ajustado para 6 elementos */}
                <div 
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-16 pt-12 no-scrollbar"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {recuerdos.map((item) => (
                        <div 
                            key={item.id}
                            className="relative min-w-[210px] flex-shrink-0 h-[380px] flex flex-col items-center group transition-all duration-500"
                            style={{ scrollSnapAlign: 'start' }}
                        >
                            {/* IMAGEN: Ahora más pequeña para que quepan 6 */}
                            <div className="relative z-20 transition-all duration-500 group-hover:-translate-y-12 group-hover:scale-120">
                                <img 
                                    src={item.imagen} 
                                    alt={item.nombre} 
                                    className="w-32 h-40 object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)]"
                                />
                            </div>

                            {/* TEXTO INICIAL: Nombre y Plan */}
                            <div className="mt-4 text-center group-hover:opacity-0 transition-opacity duration-300">
                                <h4 className="text-[#5D4E3F] font-black text-[11px]  leading-tight mb-1">{item.nombre}</h4>
                                <span className="bg-[#A68966]/10 text-[#A68966] text-[9px] font-black px-2 py-0.5 rounded-full  tracking-tighter">
                                    {item.plan}
                                </span>
                            </div>

                            {/* ESTADO HOVER: Fondo café curvo */}
                            <div className="absolute inset-0 bg-[#5D4E3F] rounded-[30px] rounded-tl-[80px] opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-500 shadow-2xl flex flex-col justify-end p-6 border-b-4 border-[#FFC600]">
                                <div className="text-white text-center">
                                    <h3 className="text-xs font-black italic uppercase leading-tight mb-1">{item.nombre}</h3>
                                    <p className="text-[#FFC600] text-[9px] font-bold mb-2 uppercase">{item.plan}</p>
                                    <p className="text-white/70 text-[9px] leading-tight mb-4 italic">
                                        "{item.desc}"
                                    </p>
                                    <button className="bg-[#FFC600] text-[#5D4E3F] w-full py-2 rounded-full font-black uppercase text-[9px] tracking-widest hover:bg-white transition-colors">
                                        Detalles
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </section>
    );
}
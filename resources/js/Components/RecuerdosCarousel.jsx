import React, { useRef, useState } from 'react';

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
    const [recuerdoActivo, setRecuerdoActivo] = useState(null);

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
        <section className="py-16 sm:py-20 bg-[#F4EDE6] relative overflow-hidden">
            <div className="max-w-[1500px] mx-auto px-4">
                
                {/* Títulos y Flechas */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-10 px-2 sm:px-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#5D4E3F] italic tracking-tighter">
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
                            className="relative min-w-[180px] sm:min-w-[210px] flex-shrink-0 h-[340px] sm:h-[380px] flex flex-col items-center group transition-all duration-500"
                            style={{ scrollSnapAlign: 'start' }}
                        >
                            {/* IMAGEN: Ahora más pequeña para que quepan 6 */}
                            <div className="relative z-20 transition-all duration-500 group-hover:-translate-y-12 group-hover:scale-120">
                                <img 
                                    src={item.imagen} 
                                    alt={item.nombre} 
                                    className="w-28 h-36 sm:w-32 sm:h-40 object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)]"
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
                                    <button
                                        onClick={() => setRecuerdoActivo(item)}
                                        className="bg-[#FFC600] text-[#5D4E3F] w-full py-2 rounded-full font-black uppercase text-[9px] tracking-widest hover:bg-white transition-colors"
                                    >
                                        Detalles
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- PANEL DE DETALLES DEL RECUERDO --- */}
            {recuerdoActivo && (
                <div
                    className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#3f342a]/70 backdrop-blur-md animate-fade-in"
                    onClick={() => setRecuerdoActivo(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-3xl bg-[#FDFBF9] rounded-[32px] sm:rounded-[40px] shadow-2xl border-4 border-[#5D4E3F] overflow-hidden flex flex-col md:flex-row animate-scale-up max-h-[90vh]"
                    >
                        <button
                            onClick={() => setRecuerdoActivo(null)}
                            className="absolute top-3 right-4 sm:top-5 sm:right-6 text-3xl sm:text-4xl font-light text-white/90 hover:text-[#FFC600] z-20 transition-transform hover:rotate-90"
                        >
                            &times;
                        </button>

                        {/* Lado izquierdo: la misma imagen del recuerdo, en grande, sobre un fondo cálido */}
                        <div className="md:w-2/5 shrink-0 relative bg-gradient-to-b from-[#5D4E3F] to-[#3f342a] p-8 sm:p-10 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#FDFBF9 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                            <div className="absolute w-40 h-40 sm:w-52 sm:h-52 bg-[#FFC600]/10 rounded-full blur-2xl" />
                            <img
                                src={recuerdoActivo.imagen}
                                alt={recuerdoActivo.nombre}
                                className="relative z-10 w-40 h-52 sm:w-52 sm:h-64 object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.45)] animate-float-suave"
                            />
                        </div>

                        {/* Lado derecho: nombre, plan y descripción */}
                        <div className="md:w-3/5 p-7 sm:p-10 flex flex-col justify-center overflow-y-auto">
                            <span className="bg-[#A68966]/10 text-[#A68966] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit mb-4">
                                {recuerdoActivo.plan}
                            </span>

                            <h3 className="text-2xl sm:text-3xl font-black text-[#5D4E3F] italic tracking-tighter mb-4">
                                {recuerdoActivo.nombre}
                            </h3>

                            <span className="block w-14 h-[3px] bg-[#FFC600] rounded-full mb-5" />

                            <p className="text-[#5D4E3F]/70 text-sm leading-relaxed italic">
                                "{recuerdoActivo.desc}"
                            </p>

                            <p className="text-[#5D4E3F]/50 text-[10px] leading-relaxed mt-6">
                                Este recuerdo forma parte de las opciones disponibles dentro de tu proceso de afiliación. Puedes elegirlo para cada uno de tus protegidos al momento de inscribir tu plan.
                            </p>

                            <button
                                onClick={() => setRecuerdoActivo(null)}
                                className="mt-8 bg-[#5D4E3F] text-white w-fit px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-[#FFC600] hover:text-[#5D4E3F] transition-colors self-start"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }

                @keyframes scaleUp {
                    from { transform: scale(0.92); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-up { animation: scaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }

                @keyframes floatSuave {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float-suave { animation: floatSuave 3.5s ease-in-out infinite; }

                @media (prefers-reduced-motion: reduce) {
                    .animate-fade-in, .animate-scale-up, .animate-float-suave { animation: none !important; }
                }
            `}} />
        </section>
    );
}

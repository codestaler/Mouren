import React from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head } from '@inertiajs/react';

export default function QuienesSomos() {
    return (
        <div className="min-h-screen bg-[#F4EDE6] font-['Hepta_Slab'] relative overflow-x-hidden flex flex-col text-[#5D4E3F]">
            <Head title="¿Quiénes Somos? - Mouren" />
            <Navbar />

            {/* --- SECCIÓN 1: EL ORIGEN (Banner con GIF) --- */}
            <section className="relative h-screen flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                    <img 
                        src="/images/quienes_somos/fondo_animado_quienes_somos.gif" 
                        className="w-full h-full object-cover opacity-90" 
                        alt="Fondo" 
                    />
                </div>
                <div className="relative z-10 ml-32 w-1/2">
                    <h1 className="text-[30px] font-bold mb-6 italic leading-tight">Nuestra Historia</h1>
                    <p className="text-[19px] text-gray-800 max-w-[500px] leading-relaxed">
                        Mouren nació de una idea sencilla pero profunda: transformar la despedida en un tributo lleno de arte, respeto y calidez. Somos más que una funeraria; somos los narradores del último gran capítulo.
                    </p>
                </div>
            </section>

            {/* --- SECCIÓN 2: MISIÓN Y VISIÓN (Estilo Crónica) --- */}
            <section className="relative z-20 py-32 px-12 bg-white/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-around gap-12 border-y border-[#A68966]/20">
                {/* MISIÓN */}
                <div className="max-w-md p-10 bg-white/60 shadow-xl rounded-[20px] rotate-[-1deg] border border-[#A68966]/10 transform hover:rotate-0 transition-transform duration-500">
                    <h2 className="text-3xl font-bold mb-4 italic text-[#A68966]">Nuestra Misión</h2>
                    <p className="leading-relaxed opacity-90">
                        En Mouren, nuestra misión es ofrecer despedidas únicas y humanas que reconforten a los seres queridos. Acompañamos el duelo con respeto, calidez y tecnología, creando homenajes memorables, auténticos y llenos de sensibilidad.
                    </p>
                </div>

                {/* VISIÓN */}
                <div className="max-w-md p-10 bg-[#5D4E3F] text-white shadow-2xl rounded-[20px] rotate-[1deg] transform hover:rotate-0 transition-transform duration-500">
                    <h2 className="text-3xl font-bold mb-4 italic text-[#fffff]">Nuestra Visión</h2>
                    <p className="leading-relaxed opacity-80 text-pretty">
                        Queremos posicionarnos como una empresa referente por su empatía, creatividad y compromiso con el acompañamiento emocional y simbólico en momentos de pérdida.
                    </p>
                </div>
            </section>

            {/* --- SECCIÓN 3: NUESTROS VALORES (Libertad Creativa) --- */}
            <section className="relative z-20 py-40 px-40 pb-60">
                <h2 className="text-4xl font-bold text-center mb-16 ">Los Pilares de Mouren</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { title: "Empatia", desc: "Nos ponemos en el lugar del otro, acompañando con respeto cada proceso de duelo.", icon: "🕯️" },
                        { title: "Humanidad", desc: "Valoramos cada historia de vida y la despedimos con autenticidad.", icon: "🤝" },
                        { title: "Innovación", desc: "Usamos la creatividad y la tecnología para transformar el adiós en una experiencia significativa.", icon: "🎬" },
                        { title: "Respeto", desc: "Honramos cada vida y cada decisión con cuidado y discreción.", icon: "🤗" },
                        { title: "Calidez", desc: "Brindamos apoyo cercano, sensible y compasivo.", icon: "🔥" },
                        { title: "Estética y simbolismo: ", desc: "Cuidamos cada detalle visual y emocional para que la última página sea inolvidable.", icon: "🎨" },
                    ].map((valor, i) => (
                        <div key={i} className="text-center p-8 border-b-2 border-[#A68966]/20 hover:bg-[#A68966]/5 transition-colors group">
                            <span className="text-5xl mb-4 block group-hover:scale-125 transition-transform">{valor.icon}</span>
                            <h3 className="text-xl font-bold mb-2 tracking-tighter">{valor.title}</h3>
                            <p className="text-sm opacity-70 italic">{valor.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Frase de cierre con estilo de firma */}
                <div className="mt-24 text-center">
                    <p className="text-2xl font-bold italic opacity-60">"Porque cada vida merece ser recordada como una gran obra."</p>
                    <div className="h-1 w-40 bg-[#A68966] mx-auto mt-4"></div>
                </div>
            </section>

            <div className="relative z-30 mt-auto">
                <Footer />
            </div>
        </div>
    );
}
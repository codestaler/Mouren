import React, { useState } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head } from '@inertiajs/react';

const testimonios = [
    {
        nombre: 'Laura Montaño',
        mensaje: 'Fue increíble, agradezco todo, pero hay que dejarlo ir :)',
    },
    {
        nombre: 'Yenny Arias',
        mensaje: 'Nos acompañaron en cada paso con una calidez que no esperábamos. Gracias por hacer más liviano un momento tan difícil.',
    },
    {
        nombre: 'Laura Perez',
        mensaje: 'El trato humano y la atención a cada detalle hicieron toda la diferencia para nuestra familia. Siempre lo recordaremos.',
    },
];

export default function Contactos() {
    const [indice, setIndice] = useState(0);

    const siguiente = () => setIndice((prev) => (prev + 1) % testimonios.length);
    const anterior = () => setIndice((prev) => (prev - 1 + testimonios.length) % testimonios.length);

    return (
        <div className="min-h-screen bg-[#F4EDE6] font-['Hepta_Slab'] relative overflow-x-hidden flex flex-col text-[#5D4E3F]">
            <Head title="Contáctanos - Mouren" />
            <Navbar />

            {/* --- SECCIÓN 1: BANNER PRINCIPAL --- */}
            <section className="relative min-h-screen h-screen flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                    <img src="/images/imagenes_contactos/fondo_animado_contactos.gif" className="w-full h-full object-cover" alt="Fondo" />
                </div>
                <div className="relative z-10 mx-4 sm:mx-8 md:ml-16 lg:ml-32 w-[92%] sm:w-[85%] md:w-1/2 bg-white/10 backdrop-blur-[2px] p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl">
                    <h1 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold mb-4 italic">Contáctanos</h1>
                    <p className="text-[15px] sm:text-[16px] md:text-[18px] mb-6 leading-relaxed max-w-[450px]">
                        Cada detalle importa: desde la ceremonia hasta el silencio compartido. Estamos aquí para ayudarte en lo que necesites. 🥃✨
                    </p>
                    <div className="space-y-2 text-[14px] sm:text-[15px] md:text-[16px] font-bold border-l-4 border-[#A68966] pl-4">
                        <p>📍 Cl. 63 #58B-03, Itagüí</p>
                        <p>📞 WhatsApp: 314 651 75 54</p>
                        <p>✉️ mouren.funeraria@gmail.com</p>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN 2: UBICACIÓN --- */}
            <section className="relative z-20 py-16 md:py-24 px-6 sm:px-8 md:px-12 bg-white/40 backdrop-blur-md flex flex-col md:flex-row items-center justify-around gap-10 md:gap-6 border-y border-[#A68966]/20">
                <div className="w-full md:w-1/3 md:ml-8 lg:ml-32">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 italic">Nuestra Ubicación</h2>
                    <div className="p-6 bg-[#5D4E3F] text-white rounded-2xl shadow-xl rotate-1">
                        <p className="font-bold text-lg mb-2">📍 Itagüí, Antioquia</p>
                        <p className="text-sm opacity-90 leading-relaxed text-pretty">
                            Cl. 63 #58B-03, Terranova.<br />
                            Atención inmediata las 24 Horas.
                        </p>
                    </div>
                </div>
                <div className="w-full md:w-1/2 md:pr-6 lg:pr-12">
                    <div className="relative p-4 bg-[#5D4E3F] rounded-lg shadow-2xl -rotate-1">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.5674751493636!2d-75.6033107!3d6.1885973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e46824962b95111%3A0xc068bc5a0d5c8261!2sCl.%2063%20%2358b-3%2C%20Terranova%2C%20Itag%C3%BC%C3%AD%2C%20Antioquia!5e0!3m2!1ses-419!2sco!4v1710500000000!5m2!1ses-419!2sco" 
                            className="w-full h-[220px] sm:h-[260px] md:h-[300px] rounded border-0 grayscale hover:grayscale-0 transition-all duration-500"
                            allowFullScreen="" loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN 3: TESTIMONIOS (carrusel interactivo) --- */}
            <section className="relative z-20 py-20 md:py-40 px-4 sm:px-6 md:px-10 bg-[#F4EDE6] flex flex-col items-center overflow-hidden">
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold italic mb-2">Testimonios</h2>
                    <p className="text-sm opacity-70 italic font-bold">Historias que nos recuerdan por qué hacemos esto.</p>
                </div>

                <div className="relative max-w-2xl w-full">
                    {/* Decoración */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#A68966]/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#A68966]/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative bg-white/60 border border-[#A68966]/20 shadow-2xl rounded-[24px] sm:rounded-[32px] md:rounded-[40px] p-8 sm:p-10 md:p-14 min-h-[260px] flex flex-col justify-center items-center text-center">
                        <span className="text-5xl sm:text-6xl text-[#A68966] leading-none mb-2 font-serif select-none">“</span>

                        <p
                            key={indice}
                            className="text-[16px] sm:text-[18px] md:text-[20px] leading-relaxed max-w-[480px] mb-6 animate-fade-in italic"
                        >
                            {testimonios[indice].mensaje}
                        </p>

                        <p key={`nombre-${indice}`} className="font-bold uppercase tracking-widest text-[13px] sm:text-[14px] opacity-70 animate-fade-in">
                            — {testimonios[indice].nombre}
                        </p>

                        {/* Flechas */}
                        <button
                            onClick={anterior}
                            aria-label="Testimonio anterior"
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#5D4E3F] text-white flex items-center justify-center hover:bg-[#A68966] transition-colors shadow-md"
                        >
                            ‹
                        </button>
                        <button
                            onClick={siguiente}
                            aria-label="Siguiente testimonio"
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#5D4E3F] text-white flex items-center justify-center hover:bg-[#A68966] transition-colors shadow-md"
                        >
                            ›
                        </button>
                    </div>

                    {/* Puntos de navegación */}
                    <div className="flex justify-center gap-2 mt-6">
                        {testimonios.map((t, i) => (
                            <button
                                key={t.nombre}
                                onClick={() => setIndice(i)}
                                aria-label={`Ver testimonio de ${t.nombre}`}
                                className={`h-2.5 rounded-full transition-all duration-300 ${
                                    i === indice ? 'w-8 bg-[#5D4E3F]' : 'w-2.5 bg-[#5D4E3F]/30 hover:bg-[#5D4E3F]/60'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <div className="relative z-30 mt-auto">
                <Footer />
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}
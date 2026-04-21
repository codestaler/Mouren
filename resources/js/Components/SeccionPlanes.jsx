import React, { useState } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head } from '@inertiajs/react';
import MusicAlbum from '@/Components/MusicAlbum';
import RecuerdosCarousel from '@/Components/RecuerdosCarousel';
import SeccionPlanes from '@/Components/SeccionPlanes';

const planesData = [
    {
        id: 'sereno',
        titulo: 'Descanso Sereno',
        precioIndividual: 5000,
        precioAdicional: 3500,
        tipoNombre: 'Esencial',
        enfoque: 'Un servicio digno y esencial.',
        mouri: '/images/planes/tarjetas/descanso_sereno.gif',
        detalles: [
            { cat: 'Atención', items: ['Orientación 24h', 'Tanatopraxia', 'Cofre estándar', 'Traslados'] },
            { cat: 'Velación', items: ['Sala 16h', '1 Arreglo floral', 'Libro de firmas', 'Estación café'] },
            { cat: 'Destino', items: ['Inhumación o Cremación', 'Lote en comodato', 'Urna cenizas'] }
        ]
    },
    // ... agrega aquí el resto de tus 4 planes con la misma estructura de detalles
];

export default function Planes() {
    const [planActivo, setPlanActivo] = useState(null);

    return (
        <div className="min-h-screen bg-[#F4EDE6] font-['Hepta_Slab'] flex flex-col text-[#5D4E3F] relative">
            <Head title="Nuestros Planes - Mouren" />
            <Navbar />

            {/* BANNER CON TEXTO ORIGINAL */}
            <section className="relative h-[70vh] flex flex-col justify-center items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="/images/planes/fondo_animado_planes.gif" className="w-full h-full object-cover" alt="Fondo" />
                </div>
                <div className="relative z-10 text-center px-10">
                    <h1 className="text-[30px] md:text-[40px] font-bold text-white drop-shadow-lg leading-tight mb-4">
                        Nuestros Planes Y Servicios
                    </h1>
                    <p className="text-white text-lg md:text-xl drop-shadow-md mb-8 font-light italic">
                        Para humanos y mascotas: la esencia de la despedida.
                    </p>
                    <button 
                        onClick={() => document.getElementById('seccion-planes').scrollIntoView({ behavior: 'smooth' })} 
                        className="bg-[#FFC600] text-[#5D4E3F] px-8 py-3 text-sm font-black rounded-full shadow-2xl hover:scale-105 transition-all uppercase tracking-widest"
                    >
                        Mirar
                    </button>
                </div>
            </section>

            {/* SECCIÓN DE TABLA Y TARJETAS */}
            <SeccionPlanes planesData={planesData} setPlanActivo={setPlanActivo} />

            <MusicAlbum />
            <RecuerdosCarousel />

            {/* MODAL CON ESPECIFICACIONES AVANZADAS (Imagen y Scroll) */}
            {planActivo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#F4EDE6]/80 backdrop-blur-md">
                    <div className="bg-white w-full max-w-5xl h-[80vh] overflow-hidden rounded-[40px] shadow-3xl relative border-8 border-[#5D4E3F] flex flex-col md:flex-row">
                        
                        {/* Cerrar */}
                        <button onClick={() => setPlanActivo(null)} className="absolute top-4 right-6 text-4xl font-light z-[110] hover:rotate-90 transition-transform">×</button>

                        {/* Izquierda: Fija */}
                        <div className="md:w-1/3 bg-[#5D4E3F] p-8 flex flex-col items-center justify-center text-center text-white">
                            <img src={planActivo.mouri} alt="Plan" className="w-40 h-40 object-contain mb-6 animate-pulse" />
                            <h2 className="text-2xl font-black italic mb-2 uppercase">{planActivo.titulo}</h2>
                            <div className="bg-[#FFC600] text-[#5D4E3F] px-4 py-1 rounded-full font-bold text-[10px] mb-4 uppercase tracking-tighter">
                                {planActivo.tipoNombre}
                            </div>
                            <p className="text-white/70 italic text-xs">{planActivo.enfoque}</p>
                        </div>

                        {/* Derecha: Scroll con Detalles e Imagen */}
                        <div className="md:w-2/3 p-8 overflow-y-auto custom-scrollbar">
                            <h3 className="text-[#5D4E3F] text-xl font-black mb-6 border-b-2 border-[#FFC600] inline-block">Especificaciones del servicio</h3>
                            <div className="space-y-6">
                                {planActivo.detalles.map((seccion, idx) => (
                                    <div key={idx} className="flex gap-4 bg-[#F4EDE6]/50 p-5 rounded-2xl border border-[#5D4E3F]/5">
                                        <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
                                            <span className="text-[10px] opacity-20 italic">Visual</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#A68966] text-sm uppercase mb-2">{seccion.cat}</h4>
                                            <ul className="grid grid-cols-1 gap-1">
                                                {seccion.items.map((item, i) => (
                                                    <li key={i} className="text-[11px] flex items-center gap-2 text-[#5D4E3F]">
                                                        <span className="w-1 h-1 bg-[#FFC600] rounded-full"></span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BOTÓN FLOTANTE CONTACTANOS */}
            <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-center group">
                <div className="w-14 h-14 bg-[#4f81bd] border-4 border-[#FFB200] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all cursor-pointer">
                    <img src="/images/planes/tarjetas/mouri_sac.png" alt="contacto" className="w-10 h-10 object-contain" />
                </div>
                <span className="mt-2 text-[10px] font-black bg-white px-2 py-1 rounded shadow-md uppercase">Contáctanos</span>
            </div>

            <Footer />
        </div>
    );
}
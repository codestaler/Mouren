import React, { useState } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head, useForm } from '@inertiajs/react';

export default function Contactos() {
    const [enviado, setEnviado] = useState(false);
    
    const { data, setData, post, processing, reset } = useForm({
        nombre: '',
        email: '',
        telefono: '',
        asunto: 'Consulta General', // Nuevo campo
        comentario: '',
    });

    const submit = (e) => {
        e.preventDefault();
        // Simulamos el envío
        console.log("Enviando...", data);
        setEnviado(true);
        setTimeout(() => setEnviado(false), 5000); // El mensaje desaparece tras 5 segundos
        reset();
    };

    return (
        <div className="min-h-screen bg-[#F4EDE6] font-['Hepta_Slab'] relative overflow-x-hidden flex flex-col text-[#5D4E3F]">
            <Head title="Contáctanos - Mouren" />
            <Navbar />

            {/* --- SECCIÓN 1: BANNER PRINCIPAL --- */}
            <section className="relative h-screen flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                    <img src="/images/imagenes_contactos/fondo_animado_contactos.gif" className="w-full h-full object-cover" alt="Fondo" />
                </div>
                <div className="relative z-10 ml-32 w-1/2 bg-white/10 backdrop-blur-[2px] p-8 rounded-3xl">
                    <h1 className="text-[30px] font-bold mb-4 italic">Contáctanos</h1>
                    <p className="text-[18px] mb-6 leading-relaxed max-w-[450px]">
                        Cada detalle importa: desde la ceremonia hasta el silencio compartido. Estamos aquí para ayudarte en lo que necesites. 🥃✨
                    </p>
                    <div className="space-y-2 text-[16px] font-bold border-l-4 border-[#A68966] pl-4">
                        <p>📍 Cl. 63 #58B-03, Itagüí</p>
                        <p>📞 WhatsApp: 314 651 75 54</p>
                        <p>✉️ mouren.funeraria@gmail.com</p>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN 2: UBICACIÓN --- */}
            <section className="relative z-20 py-24 px-12 bg-white/40 backdrop-blur-md flex items-center justify-around border-y border-[#A68966]/20">
                <div className="w-1/3 ml-32">
                    <h2 className="text-3xl font-bold mb-4 italic">Nuestra Ubicación</h2>
                    <div className="p-6 bg-[#5D4E3F] text-white rounded-2xl shadow-xl rotate-1">
                        <p className="font-bold text-lg mb-2">📍 Itagüí, Antioquia</p>
                        <p className="text-sm opacity-90 leading-relaxed text-pretty">
                            Cl. 63 #58B-03, Terranova.<br />
                            Atención inmediata las 24 Horas.
                        </p>
                    </div>
                </div>
                <div className="w-1/2 pr-12">
                    <div className="relative p-4 bg-[#5D4E3F] rounded-lg shadow-2xl -rotate-1">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.5674751493636!2d-75.6033107!3d6.1885973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e46824962b95111%3A0xc068bc5a0d5c8261!2sCl.%2063%20%2358b-3%2C%20Terranova%2C%20Itag%C3%BC%C3%AD%2C%20Antioquia!5e0!3m2!1ses-419!2sco!4v1710500000000!5m2!1ses-419!2sco" 
                            className="w-full h-[300px] rounded border-0 grayscale hover:grayscale-0 transition-all duration-500"
                            allowFullScreen="" loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN 3: FORMULARIO MEJORADO --- */}
            <section className="relative z-20 py-40 px-10 bg-[#F4EDE6] flex flex-col items-center">
                <div className="max-w-2xl w-full">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold italic mb-2">Déjanos tu mensaje</h2>
                        <p className="text-sm opacity-70 italic font-bold">Tu tranquilidad es nuestra prioridad.</p>
                    </div>

                    <form onSubmit={submit} className="grid grid-cols-2 gap-6 bg-white/60 p-12 rounded-[40px] shadow-2xl border border-[#A68966]/20 relative overflow-hidden">
                        {/* Decoración sutil de fondo del formulario */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#A68966]/10 rounded-full blur-3xl"></div>
                        
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[13px] font-bold uppercase tracking-widest mb-1 opacity-60">Nombre completo</label>
                            <input type="text" required className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-2 outline-none focus:border-[#A68966] transition-colors" value={data.nombre} onChange={e => setData('nombre', e.target.value)} />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[13px] font-bold uppercase tracking-widest mb-1 opacity-60">Correo Electrónico</label>
                            <input type="email" required className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-2 outline-none focus:border-[#A68966] transition-colors" value={data.email} onChange={e => setData('email', e.target.value)} />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[13px] font-bold uppercase tracking-widest mb-1 opacity-60">Teléfono / Celular</label>
                            <input type="text" className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-2 outline-none focus:border-[#A68966] transition-colors" value={data.telefono} onChange={e => setData('telefono', e.target.value)} />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[13px] font-bold uppercase tracking-widest mb-1 opacity-60">Asunto</label>
                            <select className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-2 outline-none focus:border-[#A68966] transition-colors cursor-pointer" value={data.asunto} onChange={e => setData('asunto', e.target.value)}>
                                <option value="Consulta General">Consulta General</option>
                                <option value="Planes Funerarios">Planes Funerarios</option>
                                <option value="Servicio Inmediato">Servicio Inmediato</option>
                                <option value="Sugerencia">Sugerencia</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-[13px] font-bold uppercase tracking-widest mb-1 opacity-60">¿En qué podemos ayudarte?</label>
                            <textarea required className="w-full bg-transparent border-b-2 border-[#5D4E3F]/30 py-2 outline-none focus:border-[#A68966] transition-colors min-h-[100px] resize-none" value={data.comentario} onChange={e => setData('comentario', e.target.value)}></textarea>
                        </div>

                        <div className="col-span-2 flex flex-col items-center mt-4">
                            <button type="submit" disabled={processing} className="bg-[#5D4E3F] text-white px-16 py-3 rounded-full hover:bg-[#FFC600] hover:text-[#5D4E3F] transition-all font-bold shadow-lg transform hover:scale-105 active:scale-95">
                                {processing ? 'Enviando...' : 'Enviar mensaje'}
                            </button>
                            
                            {enviado && (
                                <p className="mt-4 text-sm font-bold text-green-700 animate-fade-in text-center">
                                    ✨ ¡Gracias! Hemos recibido tu mensaje. <br /> Nos comunicaremos contigo en la mayor brevedad posible.
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </section>

            <div className="relative z-30 mt-auto">
                <Footer />
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}
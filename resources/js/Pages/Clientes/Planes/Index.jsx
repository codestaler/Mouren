import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebar from '@/Pages/Clientes/Sidebar'; 
import { ShieldCheck, Download, CheckCircle2 } from 'lucide-react';

export default function PlanesIndex({ planes }) {
    // Este estado atrapará lo que el Sidebar mande
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-white font-['Hepta_Slab'] text-[#5D4E3F]">
            <Head title="Planes Disponibles - Mouren" />
            
            {/* Es vital que el Sidebar ejecute onToggle cuando se le de click al botón de hamburguesa */}
            <Sidebar onToggle={(state) => setIsSidebarOpen(state)} />

            {/* CLASES DINÁMICAS: Cambiamos ml-72 por ml-20 suavemente */}
            <main className={`flex-1 transition-all duration-500 ease-in-out p-4 md:p-10 overflow-y-auto h-screen custom-scrollbar ${isSidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
                
                <header className="mb-8 mt-2 max-w-4xl">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-[#5D4E3F] leading-tight">
                        Nuestros planes de <span className="text-[#A68966]">previsión</span>
                    </h1>
                    <div className="h-1 w-12 bg-[#A68966] mt-3 mb-3 rounded-full"></div>
                    <p className="text-[12px] md:text-sm italic opacity-60 max-w-md">
                        selecciona el camino que mejor proteja tu legado y el de tu familia. 
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl pb-20">
                    {planes.map((plan) => {
                        const cuota = Number(plan.cuota_base) || 0;
                        const nombreLimpio = plan.nombre.toLowerCase().replace('plan ', '').replace(/ /g, '_');
                        const rutaImagen = `/images/planes/mouri_${nombreLimpio}.png`;
                        const rutaPdf = `/pdfs/${nombreLimpio}.pdf`;

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
                                        className="absolute right-[-15px] bottom-[-15px] w-32 opacity-20 grayscale invert group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 pointer-events-none z-0" 
                                        alt={plan.nombre}
                                        onError={(e) => { e.target.src = '/images/login/mouri_registro_exitoso.png'; }}
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
                                            <p className="text-[10px] font-bold lowercase opacity-70 leading-snug">hasta {plan.max_afiliados} beneficiarios</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-2 space-y-2">
                                        <Link 
                                            href={`/planes/inscribir/${plan.id}`}
                                            className="block w-full bg-[#5D4E3F] text-white py-3 rounded-2xl font-bold text-center hover:bg-[#A68966] transition-all shadow-md active:scale-95 lowercase tracking-widest text-[10px]"
                                        >
                                            inscribirme
                                        </Link>

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
                </div>
            </main>
        </div>
    );
}
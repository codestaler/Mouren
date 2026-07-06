import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminSidebar() {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(true);

    // Configuración de estados: Blanco puro por defecto. Activo: Amarillo claro brillante (#FFF5CC)
    const active = (path) =>
        url.startsWith(path)
            ? "border-b-2 border-[#FFC600] text-[#FFC600] font-bold drop-shadow-[0_0_6px_rgba(255,245,204,0.4)]"
            : "text-white opacity-85 hover:opacity-100 transition-all hover:translate-x-1 hover:text-[#FFF5CC] hover:drop-shadow-[0_0_8px_rgba(255,245,204,0.6)]";

    return (
        <>
            {/* TIRADOR DE CUERDA */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-0 left-0 z-50 cursor-pointer transition-transform duration-500 hover:scale-105"
                style={{ width: '120px' }}
            >
                <img
                    src="/images/esquina-decorativa.png"
                    className="w-[130px]"
                    // style={{ filter: 'brightness(0) invert(1)' }}
                    alt="Menú"
                />
            </div>

            {/* ASIDE REFINADO Y DELGADO */}
            <aside className={`fixed top-0 left-0 h-screen bg-[#5D4E3F] shadow-2xl transition-all duration-700 ease-in-out z-40 flex flex-col overflow-hidden ${isOpen ? 'w-60' : 'w-0'}`}>

                {/* 🌌 CONTENEDOR DEL VITRAL CON EFECTO DE DESVANECIMIENTO Y TRANSPARENCIA */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <img
                        src="/images/Admin/Panel_principal/vitral.png.jpg"
                        alt=""
                        // Ajustado para que se posicione abajo, use un alto máximo y tenga una transparencia sutil (opacity-20)
                        className="absolute bottom-0 left-0 w-full h-[60%] object-cover opacity-20 object-bottom"
                        style={{
                            WebkitMaskImage: "linear-gradient(to top, black 5%, transparent 90%)",
                            maskImage: "linear-gradient(to top, black 20%, transparent 70%)",
                        }}
                    />
                    {/* Máscara de desvanecimiento perfecta: el color marrón se funde desde arriba hacia la transparencia abajo */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#5D4E3F] via-[#5D4E3F]/80 to-transparent"></div>
                </div>

                {/* CONTENEDOR LOGO (z-10 para quedar sobre el vitral) */}
                <div className="relative h-32 flex items-center justify-center flex-shrink-0 mt-4 z-10">
                    <img
                        src="/images/esquina-decorativa.png"
                        className="absolute top-[-10] left-0 w-[400px] opacity-10 pointer-events-none scale-110 origin-top-left mt-[-10px]"
                        //style={{ filter: 'brightness(0) invert(1)' }}
                    />
                    <img
                        src="/images/logo.png"
                        className="relative z-10 w-32"
                        style={{ filter: 'brightness(0) invert(1)' }}
                        alt="Mouren"
                    />
                </div>

                {/* OPCIONES DEL MENÚ (z-10 para quedar sobre el vitral) */}
                <nav className="flex-1 px-6 mt-2 min-w-[240px] z-10">
                    <div className="flex flex-col gap-6 font-['Hepta_Slab'] tracking-wide">
                        <Link href="/admin/dashboard" className={`text-sm md:text-base w-fit flex items-center gap-2 ${active('/admin/dashboard')}`}>
                            Panel Principal
                        </Link>
                        <Link href="/admin/gestion-usuarios" className={`text-sm md:text-base w-fit ${active('/admin/gestion-usuarios')}`}>
                            Gestión de Usuarios
                        </Link>
                        <Link href="/admin/servicios" className={`text-sm md:text-base w-fit ${active('/admin/servicios')}`}>
                            Servicios Funerarios
                        </Link>
                        <Link href="/admin/ventas" className={`text-sm md:text-base w-fit ${active('/admin/ventas')}`}>
                            Informes de Ventas
                        </Link>
                        <Link href="/admin/ajustes" className={`text-sm md:text-base w-fit ${active('/admin/ajustes')}`}>
                            Ajustes
                        </Link>
                    </div>
                </nav>

                {/* BOTÓN CERRAR SESIÓN (z-10 para quedar sobre el vitral) */}
                <div className="p-5 mt-auto min-w-[240px] z-10">
                    <Link
                        href="/force-logout"
                        className="group flex items-center justify-center gap-2 bg-[#A68966] text-[#F4EDE6] py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-[0.15em] transition-all hover:bg-[#FFC600] hover:text-[#5D4E3F] hover:shadow-lg active:scale-95"
                    >
                        <span>CERRAR SESIÓN</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </aside>

            {/* MANEJO DE RESPONSIVO AUTOMÁTICO */}
            <style>{`
                .content-shift { 
                    transition: margin-left 0.7s ease-in-out; 
                    margin-left: ${isOpen ? '240px' : '0px'}; 
                }
                @media (max-width: 1024px) { 
                    .content-shift { margin-left: 0 !important; } 
                }
            `}</style>
        </>
    );
}
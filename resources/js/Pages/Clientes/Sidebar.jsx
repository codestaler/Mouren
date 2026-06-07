import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Sidebar() {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(true);

    const active = (path) =>
        url === path
            ? "border-b-2 border-[#5D4E3F] font-bold"
            : "opacity-70 hover:opacity-100 transition-all hover:translate-x-1";

    return (
        <>
            {/* TIRADOR DE CUERDA (ESQUINA) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-0 left-0 z-50 cursor-pointer transition-transform duration-500 hover:scale-105"
                style={{ width: '130px' }}
            >
                <img src="/images/esquina-decorativa.png" className="w-full drop-shadow-sm" alt="Menú" />
            </div>

            <aside className={`fixed top-0 left-0 h-screen bg-[#EBE3CB] shadow-2xl transition-all duration-700 ease-in-out z-40 flex flex-col overflow-hidden ${isOpen ? 'w-64' : 'w-0'}`}>

                {/* CONTENEDOR LOGO (MÁS ARRIBA) */}
                <div className="relative h-40 flex items-center justify-center flex-shrink-0">
                    <img
                        src="/images/esquina-decorativa.png"
                        className="absolute top-0 left-0 w-full opacity-20 pointer-events-none scale-125 origin-top-left"
                    />
                    <img
                        src="/images/logo.png"
                        className="relative z-10 w-36 mt-6"
                        alt="Mouren"
                    />
                </div>

                {/* OPCIONES DEL MENÚ (AJUSTADAS) */}
                <nav className="flex-1 px-8 mt-2 min-w-[256px] text-[#5D4E3F]">
                    <p className="text-[10px] uppercase tracking-[4px] font-bold opacity-40 mb-6">Gestión</p>

                    <div className="flex flex-col gap-5"> {/* Espaciado controlado entre opciones */}
                        <Link href="/cliente/mi-plan" className={`text-base md:text-lg w-fit ${active('/cliente/mi-plan')}`}>
                            Mi plan Funerario
                        </Link>
                        <Link href="/detalles" className={`text-base md:text-lg w-fit ${active('/detalles')}`}>
                            Detalles del plan
                        </Link>
                        <Link href="#" className={`text-base md:text-lg w-fit ${active('/pagos')}`}>
                            Pagar mi cuota
                        </Link>
                        {/* Cambia la línea de Tus datos para que quede así: */}
                        <Link href="/datos" className={`text-base md:text-lg w-fit ${active('/datos')}`}>
                            Tus datos
                        </Link>
                        {/* Cambia la línea de Tus datos para que quede así: */}
                        <Link href="/mouriia" className={`text-base md:text-lg w-fit ${active('/mouriia')}`}>
                            Habla con Mouri
                        </Link>
                    </div>
                </nav>

                {/* BOTÓN CERRAR SESIÓN ESTILIZADO */}
                <div className="p-6 mt-auto min-w-[256px]">
                    <Link
                        href="/force-logout"
                        className="group flex items-center justify-center gap-3 bg-[#5D4E3F] text-[#F4EDE6] py-3 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] transition-all hover:bg-[#4A3E32] hover:shadow-lg active:scale-95"
                    >
                        <span>CERRAR SESIÓN</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </aside>

            <style>{`
                .content-shift { 
                    transition: margin-left 0.7s ease-in-out; 
                    margin-left: ${isOpen ? '256px' : '0px'}; 
                }
                @media (max-width: 1024px) { .content-shift { margin-left: 0; } }
            `}</style>
        </>
    );
}
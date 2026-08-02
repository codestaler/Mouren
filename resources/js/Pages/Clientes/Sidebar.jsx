import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Sidebar() {
    const { url, props } = usePage();

    // 🆕 En pantallas de escritorio (>=1024px) arranca abierto, en móvil/tablet arranca cerrado
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.innerWidth >= 1024;
    });

    useEffect(() => {
        const tema = props?.auth?.user?.tema || 'claro';
        document.documentElement.classList.toggle('dark', tema === 'oscuro');
    }, [props?.auth?.user?.tema]);

    useEffect(() => {
        const cerrar = () => setIsOpen(false);
        const abrir = () => setIsOpen(true);
        window.addEventListener('sidebar:cerrar', cerrar);
        window.addEventListener('sidebar:abrir', abrir);
        return () => {
            window.removeEventListener('sidebar:cerrar', cerrar);
            window.removeEventListener('sidebar:abrir', abrir);
        };
    }, []);

    // 🆕 Si el usuario redimensiona la ventana (ej. gira el celular o pasa a tablet/desktop),
    // ajustamos el estado para que no quede un drawer móvil abierto tapando todo en desktop, ni viceversa
    useEffect(() => {
        const manejarResize = () => {
            setIsOpen(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', manejarResize);
        return () => window.removeEventListener('resize', manejarResize);
    }, []);

    // 🆕 Cierra el sidebar automáticamente al navegar en móvil/tablet, para no tener que cerrarlo a mano
    const irYCerrarEnMovil = () => {
        if (window.innerWidth < 1024) setIsOpen(false);
    };

    const active = (path) =>
        url === path
            ? "border-b-2 border-[#5D4E3F] dark:border-[#D9B44A] font-bold"
            : "opacity-70 hover:opacity-100 transition-all hover:translate-x-1";

    return (
        <>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-0 left-0 z-50 cursor-pointer transition-transform duration-500 hover:scale-105 w-24 sm:w-28 md:w-[130px]"
            >
                <img src="/images/esquina-decorativa.png" className="w-full drop-shadow-sm" alt="Menú" />
            </div>

            {/* 🆕 FONDO OSCURO DETRÁS DEL SIDEBAR: solo visible en móvil/tablet cuando está abierto,
                para dar sensación de "menú flotante" y permitir cerrarlo tocando afuera */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
                />
            )}

            <aside className={`fixed top-0 left-0 h-screen bg-[#453C2A] dark:bg-[#453C2A] shadow-2xl transition-all duration-500 ease-in-out z-40 flex flex-col overflow-hidden ${
                isOpen ? 'w-[78vw] max-w-[280px] lg:w-64' : 'w-0'
            }`}>

                <div className="relative h-40 flex items-center justify-center flex-shrink-0">
                    <img
                        src="/images/esquina-decorativa.png"
                        className="absolute top-0 left-0 w-full opacity-20 pointer-events-none scale-125 origin-top-left"
                    />
                    <img
                        src="/images/logo.png"
                        className="relative z-10 w-28 sm:w-32 lg:w-36 mt-6"
                        alt="Mouren"
                    />
                </div>

                <nav className="flex-1 px-6 lg:px-8 mt-2 min-w-[256px] text-[#FFFFFF] dark:text-[#EDE4D3]">
                    <p className="text-[10px] uppercase tracking-[4px] font-bold opacity-40 mb-6">Gestión</p>

                    <div className="flex flex-col gap-5">
                        <Link href="/cliente/mi-plan" onClick={irYCerrarEnMovil} className={`text-base lg:text-lg w-fit ${active('/cliente/mi-plan')}`}>
                            Mi plan Funerario
                        </Link>
                        <Link href="/detalles" onClick={irYCerrarEnMovil} className={`text-base lg:text-lg w-fit ${active('/detalles')}`}>
                            Detalles del plan
                        </Link>
                        <Link href="/pagos" onClick={irYCerrarEnMovil} className={`text-base lg:text-lg w-fit ${active('/pagos')}`}>
                            Pagar mi cuota
                        </Link>
                        <Link href="/datos" onClick={irYCerrarEnMovil} className={`text-base lg:text-lg w-fit ${active('/datos')}`}>
                            Tus datos
                        </Link>
                        <Link href="/mouriia" onClick={irYCerrarEnMovil} className={`text-base lg:text-lg w-fit ${active('/mouriia')}`}>
                            Habla con Mouri
                        </Link>
                    </div>
                </nav>

                <div className="p-6 mt-auto min-w-[256px]">
                    <Link
                        href="/force-logout"
                        className="group flex items-center justify-center gap-3 bg-[#5D4E3F] dark:bg-[#3A322A] text-[#F4EDE6] py-3 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] transition-all hover:bg-[#4A3E32] hover:shadow-lg active:scale-95"
                    >
                        <span>CERRAR SESIÓN</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </aside>

            <style>{`
                .content-shift { 
                    transition: margin-left 0.7s ease-in-out; 
                }
                @media (min-width: 1024px) {
                    .content-shift { margin-left: ${isOpen ? '256px' : '0px'}; }
                }
                @media (max-width: 1023px) { .content-shift { margin-left: 0; } }
            `}</style>
        </>
    );
}

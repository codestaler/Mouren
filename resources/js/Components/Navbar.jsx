import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function Navbar() {
    // 🆕 Estado del menú móvil (hamburguesa)
    const [menuAbierto, setMenuAbierto] = useState(false);

    return (
        /* Menú más delgado (h-16) */
        <nav className="fixed top-0 w-full bg-[#5D4E3F] text-white flex items-center justify-between px-4 sm:px-6 z-50 h-16">

            {/* CONTENEDOR LOGO + ESQUINA */}
            <div className="relative flex items-center h-full ml-1 sm:ml-4 w-56 sm:w-72 shrink-0">
                <img
                    src="/images/esquina-decorativa.png"
                    className="absolute -top-5 -left-6 sm:-left-10 w-40 sm:w-52 z-10 pointer-events-none"
                    alt="Decoración"
                />
                <img
                    src="/images/logo.png"
                    className="relative w-24 sm:w-28 z-20 -ml-6 sm:-ml-8"
                    alt="Logo Mouren"
                />
            </div>

            {/* MENÚ DE ESCRITORIO */}
            <div className="hidden lg:flex gap-7 font-['Hepta_Slab'] text-[14px] tracking-wide">
                <Link href="/" className="hover:text-gray-300 transition">
                    Inicio
                </Link>

                <Link href="/quienes-somos" className="hover:text-gray-300 transition">
                    ¿Quiénes somos?
                </Link>

                <Link href="/planes" className="hover:text-gray-300 transition">
                    Planes y Servicios
                </Link>

                {/* 🆕 Pagos y Consultas — usa el name() real de la ruta pública */}
                <Link href={route('pagos.consultas')} className="hover:text-gray-300 transition">
                    Pagos y Consultas
                </Link>

                <Link href={route('contactos')} className="hover:text-gray-300 transition">
                    Contáctanos
                </Link>
            </div>

            {/* BOTONES DE ESCRITORIO */}
            <div className="hidden lg:flex gap-3 mr-4">
                <Link
                    href="/register"
                    className="border border-white px-4 py-1 rounded-full text-[14px] hover:bg-white hover:text-[#5D4E3F] transition cursor-pointer"
                >
                    Regístrate
                </Link>
                <Link
                    href="/login"
                    className="border border-white px-4 py-1 rounded-full text-[14px] hover:bg-white hover:text-[#5D4E3F] transition cursor-pointer"
                >
                    Inicia Sesión
                </Link>
            </div>

            {/* BOTÓN HAMBURGUESA */}
            <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="lg:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 mr-1 shrink-0"
                aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            >
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuAbierto ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuAbierto ? 'opacity-0' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuAbierto ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>

            {/* MENÚ MÓVIL DESPLEGABLE */}
            <div className={`lg:hidden fixed top-16 left-0 w-full bg-[#5D4E3F] shadow-2xl border-t border-white/10 transition-all duration-300 ease-in-out overflow-hidden z-20 ${
                menuAbierto ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="flex flex-col gap-1 px-6 py-4 font-['Hepta_Slab'] text-[15px]">
                    <Link href="/" onClick={() => setMenuAbierto(false)} className="py-3 border-b border-white/10 hover:text-gray-300 transition">
                        Inicio
                    </Link>
                    <Link href="/quienes-somos" onClick={() => setMenuAbierto(false)} className="py-3 border-b border-white/10 hover:text-gray-300 transition">
                        ¿Quiénes somos?
                    </Link>
                    <Link href="/planes" onClick={() => setMenuAbierto(false)} className="py-3 border-b border-white/10 hover:text-gray-300 transition">
                        Planes y Servicios
                    </Link>
                    {/* 🆕 CORREGIDO: antes apuntaba por error a route('contactos') */}
                    <Link href={route('pagos.consultas')} onClick={() => setMenuAbierto(false)} className="py-3 border-b border-white/10 hover:text-gray-300 transition">
                        Pagos y consultas
                    </Link>
                    <Link href={route('contactos')} onClick={() => setMenuAbierto(false)} className="py-3 border-b border-white/10 hover:text-gray-300 transition">
                        Contáctanos
                    </Link>

                    <div className="flex flex-col sm:flex-row gap-3 ml-3 mt-4">
                        <Link
                            href="/register"
                            onClick={() => setMenuAbierto(false)}
                            className="flex-1 text-center border border-white px-4 py-2 rounded-full text-[14px] hover:bg-white hover:text-[#5D4E3F] transition cursor-pointer"
                        >
                            Regístrate
                        </Link>
                        <Link
                            href="/login"
                            onClick={() => setMenuAbierto(false)}
                            className="flex-1 text-center border border-white px-4 py-2 rounded-full text-[14px] hover:bg-white hover:text-[#5D4E3F] transition cursor-pointer"
                        >
                            Inicia Sesión
                        </Link>
                    </div>
                </div>
            </div>

            {menuAbierto && (
                <div
                    onClick={() => setMenuAbierto(false)}
                    className="lg:hidden fixed inset-0 top-16 bg-black/40 z-10"
                />
            )}
        </nav>
    );
}

import React from 'react';
import { Link } from '@inertiajs/react';

export default function Navbar() {
    return (
        /* Menú más delgado (h-16) */
        <nav className="fixed top-0 w-full bg-[#5D4E3F] text-white flex items-center justify-between px-6 z-50 h-16">

            {/* CONTENEDOR LOGO + ESQUINA */}
            {/* Ajustamos el ancho y posición para que sea el corazón del header */}
            <div className="relative flex items-center h-full ml-4 w-72">

                {/* ESQUINA: Más grande (w-72) y posicionada para sobresalir */}
                <img
                    src="/images/esquina-decorativa.png"
                    className="absolute -top-5 -left-10 w-52 z-10 pointer-events-none"
                    alt="Decoración"
                />

                {/* LOGO: Más pequeño para que quepa bien dentro de la decoración */}
                <img
                    src="/images/logo.png"
                    className="relative w-28 z-20 -ml-8"
                    alt="Logo Mouren"
                />
            </div>

{/* MENÚ: Optimizado para Inertia */}
<div className="flex gap-7 font-['Hepta_Slab'] text-[14px] tracking-wide">
    <Link href="/" className="hover:text-gray-300 transition">
        Inicio
    </Link>
    
    <Link href="/quienes-somos" className="hover:text-gray-300 transition">
        ¿Quiénes somos?
    </Link>
    
    <Link href="/planes" className="hover:text-gray-300 transition">
        Planes y Servicios
    </Link>
    
    {/* Usamos el nombre de la ruta que pusimos en web.php */}
    <Link href={route('contactos')} className="hover:text-gray-300 transition">
        Contáctanos
    </Link>
</div>

            {/* BOTONES */}
            <div className="flex gap-3 mr-4">
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
        </nav>
    );
}
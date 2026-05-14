import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AuthenticatedClientLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="flex h-screen bg-white font-['Hepta_Slab'] text-[#5D4E3F]">
            {/* Menú Lateral Izquierdo - PERMANENTE */}
            <aside className="w-64 bg-[#E2D9C3] flex flex-col justify-between shadow-xl z-20">
                <div>
                    <div className="p-8">
                        <img src="/images/logo.png" className="h-10" alt="Mouren" />
                    </div>
                    <nav className="mt-4 px-6 space-y-6">
                        <Link href={route('cliente.dashboard')} className="block font-bold border-b-2 border-[#5D4E3F] pb-1">Mi plan Funerario</Link>
                        <Link href="#" className="block hover:text-[#A68966] transition">Detalles de mi plan</Link>
                        <Link href="#" className="block hover:text-[#A68966] transition">Pagar mi cuota</Link>
                        <Link href="#" className="block hover:text-[#A68966] transition">Cambiar de Plan</Link>
                        <Link href="#" className="block hover:text-[#A68966] transition">Tus datos</Link>
                    </nav>
                </div>
                
                <Link 
                    href={route('logout')} 
                    method="post" 
                    as="button" 
                    className="w-full bg-[#5D4E3F] text-white py-6 font-bold hover:bg-[#4A3E32] transition"
                >
                    Cerrar Sesion
                </Link>
            </aside>

            {/* Contenido Dinámico a la derecha */}
            <main className="flex-1 overflow-y-auto bg-[#FDFBF9]">
                {children}
            </main>
        </div>
    );
}
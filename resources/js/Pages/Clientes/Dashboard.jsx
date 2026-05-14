import React from 'react';
import AuthenticatedClientLayout from '@/Layouts/AuthenticatedClientLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedClientLayout>
            <Head title="Mi Plan - Mouren" />
            
            <div className="p-12">
                {/* Header Superior */}
                <header className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-3xl text-[#A68966]">
                            Bienvenido, <span className="font-bold text-[#5D4E3F]">{auth.user.nombre1} {auth.user.apellido1}</span>
                        </h1>
                        <p className="text-sm italic opacity-75">Para que descanses mejor que en vida</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 bg-[#F4EDE6] rounded-full relative">
                            🔔 <span className="absolute top-0 right-0 bg-[#A68966] text-white text-[10px] px-1 rounded-full">0</span>
                        </button>
                        <div className="w-10 h-10 bg-[#A68966] rounded-full border-2 border-[#5D4E3F] flex items-center justify-center text-white font-bold">
                            {auth.user.nombre1[0]}
                        </div>
                    </div>
                </header>

                <h2 className="text-2xl font-bold mb-6">Mi plan Funerario:</h2>

                {/* Estado: Sin suscripciones activas */}
                <div className="bg-[#F4EDE6] border-2 border-dashed border-[#A68966] rounded-[40px] p-12 text-center">
                    <div className="mb-4 text-5xl">🕊️</div>
                    <h3 className="text-xl font-bold mb-2">Aún no tienes un plan activo</h3>
                    <p className="mb-6 opacity-80">Protege a los que más quieres con nuestros servicios para humanos y mascotas.</p>
                    <button className="bg-[#5D4E3F] text-white px-8 py-3 rounded-full font-bold hover:bg-[#A68966] transition shadow-lg">
                        Ver planes disponibles
                    </button>
                </div>
            </div>
        </AuthenticatedClientLayout>
    );
}
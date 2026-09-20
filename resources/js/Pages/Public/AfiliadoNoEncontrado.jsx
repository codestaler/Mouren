import React from 'react';
import { Head } from '@inertiajs/react';

export default function AfiliadoNoEncontrado() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#221D17] flex items-center justify-center p-6 font-['Hepta_Slab'] text-[#5D4E3F] dark:text-[#EDE4D3]">
            <Head title="Enlace no válido - Mouren" />
            <div className="max-w-sm w-full bg-white dark:bg-[#2E2720] rounded-[32px] shadow-xl p-8 text-center">
                <div className="text-4xl mb-4">🌙</div>
                <h1 className="text-lg font-black mb-2">Este enlace no es válido</h1>
                <p className="text-xs opacity-70 leading-relaxed">
                    Puede que el enlace esté incompleto o ya no exista. Pídele a tu familiar que te comparta uno nuevo desde su Gabinete en Mouren.
                </p>
            </div>
        </div>
    );
}

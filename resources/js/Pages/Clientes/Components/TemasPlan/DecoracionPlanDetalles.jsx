import React from 'react';

// 🆕 Decoración de fondo detrás de TODO el contenido de Detalles del Plan.
// Puramente visual (pointer-events-none), un solo archivo reutilizable para
// los 3 planes — solo cambia según "tema.motivo".
export default function DecoracionPlanDetalles({ tema }) {
    if (!tema) return null;

    if (tema.motivo === 'flores') {
        return (
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-[0.06]">
                <span className="absolute top-20 left-8 text-6xl sm:text-7xl">🌸</span>
                <span className="absolute bottom-24 right-10 text-6xl sm:text-7xl">🕯️</span>
            </div>
        );
    }

    if (tema.motivo === 'tecnologia') {
        return (
            <div
                className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-[0.045]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, #5D4E3F 0px, #5D4E3F 1.5px, transparent 1.5px, transparent 4px)' }}
            />
        );
    }

    if (tema.motivo === 'disco') {
        return (
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <span className="absolute top-28 right-20 w-40 h-40 bg-[#FFD97D]/10 blur-3xl rounded-full" />
                <span className="absolute bottom-28 left-16 w-40 h-40 bg-[#A68966]/10 blur-3xl rounded-full" />
            </div>
        );
    }

    return null;
}

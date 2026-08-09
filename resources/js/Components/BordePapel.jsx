import React from 'react';

export default function BordePapel({ posicion = 'top', className = '' }) {
    const base = "absolute left-0 w-full h-10 sm:h-14 md:h-28 object-cover z-30";
    const variante = posicion === 'top'
        ? "top-0 -translate-y-4 sm:-translate-y-8 md:-translate-y-11"
        : "bottom-0 rotate-180 translate-y-4 sm:translate-y-8 md:translate-y-12";

    return (
        <img
            src="/images/imagenes_inicio/borde_papel.png"
            className={`${base} ${variante} ${className}`}
            alt="Borde"
        />
    );
}

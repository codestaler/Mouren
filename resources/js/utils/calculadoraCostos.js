// Ahora el recuerdo NO es un solo valor global de la suscripción:
// cada afiliado/mascota trae su propio recuerdo (afi.recuerdo o afi.recuerdo_id),
// así que el total suma el recuerdo de CADA UNO.
export const calcularTotalSuscripcion = (plan, afiliados, serviciosExtras) => {
    const precioPorPersona = plan ? Number(plan.cuota_base || 0) : 0;

    // Si tu base de datos de 'afiliados' YA incluye al titular, usamos el length real.
    const totalPersonas = Array.isArray(afiliados) ? afiliados.length : 1;

    const costoTotalAfiliados = totalPersonas * precioPorPersona;

    const totalServicios = serviciosExtras ? serviciosExtras.reduce((sum, item) =>
        sum + Number(item.precio || item.pivot?.precio_pagado || 0), 0) : 0;

    // Suma del recuerdo de CADA afiliado (si lo tiene seleccionado)
    const totalRecuerdos = Array.isArray(afiliados) ? afiliados.reduce((sum, afi) => {
        // afi.recuerdo puede venir embebido (desde el backend) o afi.costo_recuerdo guardado,
        // según de dónde venga el dato en cada pantalla.
        const precio = afi.recuerdo?.precio_adicional
            ?? afi.costo_recuerdo
            ?? 0;
        return sum + Number(precio || 0);
    }, 0) : 0;

    console.log("Cálculo:", { totalPersonas, precioPorPersona, totalServicios, totalRecuerdos });

    return costoTotalAfiliados + totalServicios + totalRecuerdos;
};
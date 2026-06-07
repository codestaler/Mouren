export const calcularTotalSuscripcion = (plan, afiliados, serviciosExtras, recuerdo) => {
    const precioPorPersona = plan ? Number(plan.cuota_base || 0) : 0;
    
    // AQUÍ ESTÁ EL CAMBIO:
    // Si tu base de datos de 'afiliados' YA incluye al titular (como el caso de Juan Gonzalez),
    // entonces no debemos sumar el +1. 
    // Usamos el length real del array, porque ya trae a todos.
    const totalPersonas = Array.isArray(afiliados) ? afiliados.length : 1;
    
    const costoTotalAfiliados = totalPersonas * precioPorPersona;

    const totalServicios = serviciosExtras ? serviciosExtras.reduce((sum, item) => 
        sum + Number(item.precio || item.pivot?.precio_pagado || 0), 0) : 0;

    const totalRecuerdo = recuerdo 
        ? Number(recuerdo.precio_adicional || recuerdo.pivot?.costo_unitario || 0) 
        : 0;

    console.log("Cálculo:", { totalPersonas, precioPorPersona, totalServicios, totalRecuerdo });

    return costoTotalAfiliados + totalServicios + totalRecuerdo;
};
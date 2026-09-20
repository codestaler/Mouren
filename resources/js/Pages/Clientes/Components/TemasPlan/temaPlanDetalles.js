// 🆕 Temas por plan para Detalles del Plan — mismos colores/íconos que ya
// usamos en Inscribir.jsx, para que se sienta la misma familia visual en
// toda la app. "motivo" decide qué decoración de fondo usa cada uno.
export const TEMAS_PLAN_DETALLES = {
    1: { color: '#5D4E3F', colorSuave: '#8C6A4F', icono: '🕯️', nombre: 'sereno', motivo: 'flores' },   // Descanso Sereno
    2: { color: '#8C6A4F', colorSuave: '#A68966', icono: '◈', nombre: 'legado', motivo: 'tecnologia' }, // Legado Eterno
    3: { color: '#A68966', colorSuave: '#5D4E3F', icono: '✦', nombre: 'rumba', motivo: 'disco' },       // Última Rumba
};

export function resolverTemaPlanDetalles(planId) {
    return TEMAS_PLAN_DETALLES[planId] || TEMAS_PLAN_DETALLES[1];
}

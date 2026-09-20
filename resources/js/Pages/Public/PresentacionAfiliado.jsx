import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { resolverTemaPlanDetalles } from '../Clientes/Components/TemasPlan/temaPlanDetalles';
import DecoracionPlanDetalles from '../Clientes/Components/TemasPlan/DecoracionPlanDetalles';
import VistaPrevia3DCofre from '../Clientes/Components/VistaPrevia3DCofre';
import IntroAnimacionAfiliado from './IntroAnimacionAfiliado';

// 🆕 Mismas opciones que ya usas en DetallesPlan.jsx para el titular —
// las repito aquí (en vez de importarlas) para no arriesgarme a tocar
// ese archivo, que ya funciona bien tal como está.
const opcionesColores = [
    { id: 1, nombre: 'Blanco', hex: '#FFFFFF' },
    { id: 2, nombre: 'Dorado', hex: '#edcd64' },
    { id: 3, nombre: 'Cafe', hex: '#86764b' },
    { id: 4, nombre: 'Rosado', hex: '#ffb5da' },
    { id: 5, nombre: 'Azul', hex: '#b5d8ff' },
];

const opcionesFlores = [
    { id: 1, nombre: 'Rosas' },
    { id: 2, nombre: 'Lirios' },
    { id: 3, nombre: 'Orquídeas' },
    { id: 4, nombre: 'Claveles' },
    { id: 5, nombre: 'Crisantemos' },
];

// 🆕 La presentación que ve el afiliado una vez confirma su cédula.
// Reutiliza el mismo sistema de temas por plan + la misma vista 3D del
// cofre que ya usa el titular, y guarda SU PROPIA personalización.
export default function PresentacionAfiliado({ nombre, parentesco, plan, personalizacionActual }) {
    const tema = resolverTemaPlanDetalles(plan?.id);
    // 🆕 Se muestra la intro animada apenas carga esta pantalla (justo
    // después de confirmar la cédula), y se apaga sola a los pocos segundos.
    const [mostrandoIntro, setMostrandoIntro] = useState(true);
    const token = window.location.pathname.split('/').pop();

    const [seleccion, setSeleccion] = useState({
        colorId: personalizacionActual?.colorId || '',
        colorNombre: personalizacionActual?.colorNombre || '',
        florId: personalizacionActual?.florId || '',
        florNombre: personalizacionActual?.florNombre || '',
    });
    const [guardando, setGuardando] = useState(false);
    const [guardado, setGuardado] = useState(false);
    const [error, setError] = useState('');

    const listaParaGuardar = seleccion.colorId && seleccion.florId;

    const guardar = () => {
        if (!listaParaGuardar) return;
        setGuardando(true);
        setError('');
        setGuardado(false);
        router.post(`/afiliado/${token}/personalizar`, seleccion, {
            preserveScroll: true,
            onSuccess: () => setGuardado(true),
            onError: () => setError('No se pudo guardar. Intenta de nuevo en un momento.'),
            onFinish: () => setGuardando(false),
        });
    };

    return (
        <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#221D17] p-6 font-['Hepta_Slab'] text-[#5D4E3F] dark:text-[#EDE4D3] overflow-hidden">
            <Head title={`Hola ${nombre} - Mouren`} />

            {mostrandoIntro && (
                <IntroAnimacionAfiliado tema={tema} nombre={nombre} onFinalizado={() => setMostrandoIntro(false)} />
            )}

            <DecoracionPlanDetalles tema={tema} />

            <div className="relative z-10 max-w-lg mx-auto">
                <div className="bg-white dark:bg-[#2E2720] rounded-[36px] shadow-xl p-6 sm:p-8 text-center mb-6">
                    <div className="text-4xl mb-3">{tema.icono}</div>
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Bienvenido a tu espacio en Mouren</p>
                    <h1 className="text-xl font-black mb-1">{nombre}</h1>
                    <p className="text-xs opacity-60">{parentesco} · Plan {plan?.nombre || 'de tu familia'}</p>
                </div>

                <div className="bg-white dark:bg-[#2E2720] rounded-[32px] shadow-xl p-5 sm:p-6">
                    <p className="text-[10px] uppercase tracking-widest font-black text-[#A68966] mb-1">🪄 Personaliza tu cofre</p>
                    <p className="text-[11px] opacity-60 mb-4">Elige tu color y tu arreglo floral favoritos — es tuyo, nadie más lo edita.</p>

                    {/* Vista previa 3D en vivo */}
                    <div className="relative rounded-2xl border border-[#5D4E3F]/10 dark:border-white/10 bg-[#F4EDE6] dark:bg-black/20 overflow-hidden h-44 flex items-center justify-center mb-5">
                        <VistaPrevia3DCofre colorNombre={seleccion.colorNombre} florNombre={seleccion.florNombre} size={160} />
                    </div>

                    {/* Colores */}
                    <p className="text-[9px] uppercase font-black text-[#5D4E3F] dark:text-[#EDE4D3] mb-2">1. Elige el color</p>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                        {opcionesColores.map((col) => {
                            const activo = seleccion.colorId === col.id;
                            return (
                                <button
                                    key={col.id}
                                    type="button"
                                    onClick={() => { setSeleccion(s => ({ ...s, colorId: col.id, colorNombre: col.nombre })); setGuardado(false); }}
                                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border-2 transition ${
                                        activo ? 'border-[#5D4E3F] dark:border-[#FFD97D] bg-[#F4EDE6] dark:bg-white/10' : 'border-[#5D4E3F]/10 dark:border-white/10'
                                    }`}
                                >
                                    <span className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: col.hex }} />
                                    <span className="text-[9px] font-bold uppercase truncate">{col.nombre}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Flores */}
                    <p className="text-[9px] uppercase font-black text-[#5D4E3F] dark:text-[#EDE4D3] mb-2">2. Elige el arreglo floral</p>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {opcionesFlores.map((fl) => {
                            const activo = seleccion.florId === fl.id;
                            return (
                                <button
                                    key={fl.id}
                                    type="button"
                                    onClick={() => { setSeleccion(s => ({ ...s, florId: fl.id, florNombre: fl.nombre })); setGuardado(false); }}
                                    className={`px-2.5 py-2 rounded-xl border-2 text-[9px] font-bold uppercase transition ${
                                        activo ? 'border-[#5D4E3F] dark:border-[#FFD97D] bg-[#F4EDE6] dark:bg-white/10' : 'border-[#5D4E3F]/10 dark:border-white/10'
                                    }`}
                                >
                                    {fl.nombre}
                                </button>
                            );
                        })}
                    </div>

                    {error && <p className="text-[11px] text-red-500 font-bold mb-3 text-center">{error}</p>}

                    <button
                        onClick={guardar}
                        disabled={!listaParaGuardar || guardando}
                        className="w-full py-3 bg-[#5D4E3F] dark:bg-[#A68966] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-[#4A3E32] dark:hover:bg-[#8e7253] transition disabled:opacity-40"
                    >
                        {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : 'Guardar mi personalización'}
                    </button>
                </div>
            </div>
        </div>
    );
}

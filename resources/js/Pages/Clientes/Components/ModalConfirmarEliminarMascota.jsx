import React, { useState, useEffect } from 'react';

// 🆕 Modal de doble autorización para eliminar una mascota:
// Paso 1: advierte claramente que dejará de contar en el costo del plan.
// Paso 2: pide escribir el nombre exacto de la mascota para confirmar.
// Es un componente NUEVO y separado — no toca ModalConfirmarEliminar.jsx,
// que se sigue usando tal cual para los afiliados.
export default function ModalConfirmarEliminarMascota({ visible, mascota, ejecutarEliminacion, cerrarModal }) {
    const [paso, setPaso] = useState(1);
    const [textoConfirmacion, setTextoConfirmacion] = useState('');

    // Cada vez que se abre (o cambia la mascota objetivo), reinicia el flujo
    useEffect(() => {
        if (visible) {
            setPaso(1);
            setTextoConfirmacion('');
        }
    }, [visible, mascota?.id]);

    if (!visible || !mascota) return null;

    const nombreCoincide = textoConfirmacion.trim().toLowerCase() === (mascota.nombre || '').trim().toLowerCase();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#FDFBF7] dark:bg-[#2E2720] max-w-sm w-full p-6 rounded-[30px] shadow-2xl text-center space-y-4 border-2 border-red-200 dark:border-red-900/40">
                {paso === 1 ? (
                    <>
                        <div className="text-3xl">⚠️</div>
                        <h4 className="text-sm font-black uppercase text-[#5D4E3F] dark:text-[#EDE4D3]">
                            ¿Eliminar a {mascota.nombre}?
                        </h4>
                        {/* 🆕 Aviso claro del costo, como pediste */}
                        <p className="text-[11px] text-[#6A5A48] dark:text-[#C2B49A] leading-relaxed">
                            <strong>{mascota.nombre}</strong> dejará de estar incluida en tu plan — ya no formará parte del costo mensual de tu suscripción, y se perderán su canción y su recuerdo asignados.
                        </p>
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={cerrarModal}
                                className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => setPaso(2)}
                                className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                Continuar
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-3xl">🔒</div>
                        <h4 className="text-sm font-black uppercase text-[#5D4E3F] dark:text-[#EDE4D3]">
                            Confirmación final
                        </h4>
                        <p className="text-[11px] text-[#6A5A48] dark:text-[#C2B49A]">
                            Para confirmar de verdad, escribe el nombre exacto:
                        </p>
                        <p className="text-sm font-black text-[#5D4E3F] dark:text-[#FFD97D]">{mascota.nombre}</p>
                        <input
                            type="text"
                            value={textoConfirmacion}
                            onChange={(e) => setTextoConfirmacion(e.target.value)}
                            placeholder={mascota.nombre}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#A68966]/30 dark:border-white/10 bg-white dark:bg-black/20 text-center text-sm text-[#5D4E3F] dark:text-[#EDE4D3] focus:outline-none focus:ring-2 focus:ring-red-400"
                            autoFocus
                        />
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={cerrarModal}
                                className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={ejecutarEliminacion}
                                disabled={!nombreCoincide}
                                className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Eliminar definitivamente
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

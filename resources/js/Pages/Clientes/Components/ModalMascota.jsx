export default function ModalMascota({
    visible,
    formMascota,
    setFormMascota,
    especies = [],
    canciones = [],
    todosLosRecuerdos = [],
    guardarMascotaGabinete,
    cerrarModal
}) {
    if (!visible) return null;

    const especieSeleccionada = especies.find(e => e.id == formMascota.especie_id);
    const razasDisponibles = especieSeleccionada?.razas || [];

    return (
        <div className="fixed inset-0 bg-[#302A1D]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#2E2720] rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">

                <h3 className="text-lg font-black text-[#302A1D] dark:text-[#EDE4D3] mb-1">
                    {formMascota.id ? 'Editar mascota' : 'Agregar mascota'}
                </h3>
                <p className="text-[11px] text-[#5D4E3F] dark:text-[#C2B49A] opacity-70 mb-6 italic">
                    Cuéntanos un poco sobre tu protegido/a de cuatro patas.
                </p>

                <form onSubmit={guardarMascotaGabinete} className="space-y-4">
                    <div>
                        <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70 text-[#5D4E3F] dark:text-[#EDE4D3]">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={formMascota.nombre}
                            onChange={e => setFormMascota({ ...formMascota, nombre: e.target.value })}
                            className="w-full bg-[#FAF8F5] dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70 text-[#5D4E3F] dark:text-[#EDE4D3]">
                                Especie *
                            </label>
                            <select
                                value={formMascota.especie_id}
                                onChange={e => setFormMascota({ ...formMascota, especie_id: e.target.value, raza_id: '' })}
                                className="w-full bg-[#FAF8F5] dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all"
                                required
                            >
                                <option value="">Selecciona</option>
                                {especies.map(esp => (
                                    <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70 text-[#5D4E3F] dark:text-[#EDE4D3]">
                                Raza
                            </label>
                            <select
                                value={formMascota.raza_id}
                                onChange={e => setFormMascota({ ...formMascota, raza_id: e.target.value })}
                                disabled={!formMascota.especie_id}
                                className="w-full bg-[#FAF8F5] dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all disabled:opacity-40"
                            >
                                <option value="">Selecciona</option>
                                {razasDisponibles.map(raza => (
                                    <option key={raza.id} value={raza.id}>{raza.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70 text-[#5D4E3F] dark:text-[#EDE4D3]">
                            Fecha de nacimiento
                        </label>
                        <input
                            type="date"
                            value={formMascota.fecha_nacimiento || ''}
                            onChange={e => setFormMascota({ ...formMascota, fecha_nacimiento: e.target.value })}
                            className="w-full bg-[#FAF8F5] dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all font-sans"
                        />
                    </div>

                    <div>
                        <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70 text-[#5D4E3F] dark:text-[#EDE4D3]">
                            Canción tributo
                        </label>
                        <select
                            value={formMascota.cancion_id || ''}
                            onChange={e => setFormMascota({ ...formMascota, cancion_id: e.target.value })}
                            className="w-full bg-[#FAF8F5] dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all"
                        >
                            <option value="">Sin canción por ahora</option>
                            {canciones.map(c => (
                                <option key={c.id} value={c.id}>{c.titulo}</option>
                            ))}
                        </select>
                    </div>

                    {/* 🆕 Recuerdo propio de esta mascota (antes vivía a nivel de toda la suscripción) */}
                    <div>
                        <label className="block text-[9px] uppercase tracking-wider font-bold mb-1 italic opacity-70 text-[#5D4E3F] dark:text-[#EDE4D3]">
                            Recuerdo
                        </label>
                        <select
                            value={formMascota.recuerdo_id || ''}
                            onChange={e => setFormMascota({ ...formMascota, recuerdo_id: e.target.value })}
                            className="w-full bg-[#FAF8F5] dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#A68966]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#A68966] transition-all"
                        >
                            <option value="">Sin recuerdo por ahora</option>
                            {todosLosRecuerdos.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.nombre} (+${Number(r.precio_adicional || 0).toLocaleString('es-CO')})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={cerrarModal}
                            className="flex-1 py-3 rounded-xl border border-[#A68966]/30 dark:border-white/20 text-[#5D4E3F] dark:text-[#EDE4D3] text-[10px] uppercase font-bold tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-[#5D4E3F] dark:bg-[#A68966] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#4A3E32] dark:hover:bg-[#8e7253] transition"
                        >
                            {formMascota.id ? 'Guardar cambios' : 'Agregar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

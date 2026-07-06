export default function ModalAfiliado({
    visible,
    formAfiliado,
    setFormAfiliado,
    canciones,
    guardarAfiliadoGabinete,
    cerrarModal
}) {

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <form
                onSubmit={guardarAfiliadoGabinete}
                className="bg-[#FDFBF7] p-6 rounded-[28px] max-w-sm w-full border-2 border-[#60533E] shadow-2xl"
            >
                <h3 className="font-black text-xs uppercase text-[#60533E] border-b pb-2 mb-4">
                    {formAfiliado.id ? 'Modificar' : 'Inscribir'} Protegido
                </h3>

                <div className="space-y-3.5 text-xs mb-5">

                    <div className="flex flex-col gap-1">
                        <label className="font-black uppercase text-gray-500 text-[10px]">
                            Nombre Completo:
                        </label>

                        <input
                            type="text"
                            value={formAfiliado.nombre}
                            onChange={(e) =>
                                setFormAfiliado({
                                    ...formAfiliado,
                                    nombre: e.target.value
                                })
                            }
                            className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-[#60533E] font-bold"
                            required
                            disabled={
                                formAfiliado.parentesco?.toLowerCase() === 'titular'
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-black uppercase text-gray-500 text-[10px]">
                            Parentesco / Vínculo:
                        </label>

                        <input
                            type="text"
                            value={formAfiliado.parentesco}
                            onChange={(e) =>
                                setFormAfiliado({
                                    ...formAfiliado,
                                    parentesco: e.target.value
                                })
                            }
                            className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-[#60533E] font-bold"
                            required
                            disabled={
                                formAfiliado.parentesco?.toLowerCase() === 'titular'
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-black uppercase text-amber-800 text-[10px]">
                            Observaciones:
                        </label>

                        <textarea
                            value={formAfiliado.observacion_funeraria}
                            onChange={(e) =>
                                setFormAfiliado({
                                    ...formAfiliado,
                                    observacion_funeraria: e.target.value
                                })
                            }
                            className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl h-16 resize-none"
                            placeholder="Ej: Especificaciones del memorial o capillas..."
                        />
                    </div>

                </div>

                <div className="flex flex-col gap-1 mb-5">

                    <label className="font-black uppercase text-gray-500 text-[10px]">
                        Seleccionar Canción:
                    </label>

                    <select
                        value={formAfiliado.cancion_id || ''}
                        onChange={(e) =>
                            setFormAfiliado({
                                ...formAfiliado,
                                cancion_id: e.target.value
                            })
                        }
                        className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-[#60533E] font-bold w-full"
                        required
                    >
                        <option value="">
                            Seleccione una canción...
                        </option>

                        {canciones?.map((cancion) => (
                            <option
                                key={cancion.id}
                                value={cancion.id}
                            >
                                {cancion.titulo} - {cancion.artista}
                            </option>
                        ))}
                    </select>

                </div>

                <div className="flex gap-2 text-[10px] font-black uppercase tracking-wider">

                    <button
                        type="submit"
                        className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl"
                    >
                        Confirmar
                    </button>

                    <button
                        type="button"
                        onClick={cerrarModal}
                        className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl"
                    >
                        Cancelar
                    </button>

                </div>
            </form>
        </div>
    );
}
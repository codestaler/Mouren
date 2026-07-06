export default function ModalPersonalizacionEstetica({
    visible,
    servicioAEditar,
    personalizacionEstetica,
    setPersonalizacionEstetica,
    opcionesColores,
    opcionesFlores,
    aplicarConfiguracionEstetica,
    cerrarModal
}) {

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">

            <form
                onSubmit={aplicarConfiguracionEstetica}
                className="bg-[#FDFBF7] p-6 rounded-[30px] max-w-md w-full border-2 border-[#60533E] shadow-2xl"
            >

                <h3 className="font-black text-xs uppercase text-[#60533E] border-b pb-2 mb-4">
                    Configuración Visual: {servicioAEditar?.nombre}
                </h3>

                <div className="space-y-4 text-xs mb-5">

                    {/* COLORES */}
                    <div>

                        <label className="font-black text-gray-600 uppercase text-[10px] block mb-2">
                            1. Gama Cromática:
                        </label>

                        <div className="grid grid-cols-2 gap-2">

                            {opcionesColores.map((col) => (

                                <div
                                    key={col.id}
                                    onClick={() =>
                                        setPersonalizacionEstetica({
                                            ...personalizacionEstetica,
                                            colorId: col.id,
                                            colorNombre: col.nombre
                                        })
                                    }
                                    className={`p-2.5 rounded-xl cursor-pointer flex items-center gap-2 border transition-all ${
                                        personalizacionEstetica.colorId === col.id
                                            ? 'border-[#60533E] bg-[#F2ECD9]'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >

                                    <div
                                        className="w-4 h-4 rounded-full border border-gray-400"
                                        style={{
                                            backgroundColor: col.hex
                                        }}
                                    />

                                    <span className="font-bold text-[10px] uppercase text-[#60533E]">
                                        {col.nombre}
                                    </span>

                                </div>

                            ))}

                        </div>

                    </div>

                    {/* FLORES */}
                    <div>

                        <label className="font-black text-gray-600 uppercase text-[10px] block mb-2">
                            2. Arreglo de Flores:
                        </label>

                        <div className="grid grid-cols-3 gap-2">

                            {opcionesFlores.map((fl) => (

                                <div
                                    key={fl.id}
                                    onClick={() =>
                                        setPersonalizacionEstetica({
                                            ...personalizacionEstetica,
                                            florId: fl.id,
                                            florNombre: fl.nombre
                                        })
                                    }
                                    className={`p-2 rounded-xl cursor-pointer text-center border transition-all flex flex-col items-center justify-between ${
                                        personalizacionEstetica.florId === fl.id
                                            ? 'border-[#60533E] bg-[#F2ECD9]'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >

                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mb-1 flex items-center justify-center">
                                        <img
                                            src="/images/elementos_dashboard/detalles_plan/flores_colgantes.png"
                                            alt=""
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    <span className="font-bold text-[9px] uppercase leading-tight text-[#60533E]">
                                        {fl.nombre}
                                    </span>

                                </div>

                            ))}

                        </div>

                    </div>

                    {/* OBSERVACIONES */}
                    <div className="flex flex-col gap-1">

                        <label className="font-black text-gray-600 uppercase text-[10px]">
                            3. Observaciones de Decoración:
                        </label>

                        <textarea
                            value={personalizacionEstetica.observacion}
                            onChange={(e) =>
                                setPersonalizacionEstetica({
                                    ...personalizacionEstetica,
                                    observacion: e.target.value
                                })
                            }
                            className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl outline-none font-medium text-[#60533E] resize-none h-16"
                            placeholder="Ej: Añadir cintas personalizadas..."
                        />

                    </div>

                </div>

                <div className="flex gap-2 text-[10px] font-black uppercase tracking-wider">

                    <button
                        type="submit"
                        className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl"
                    >
                        Aplicar
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
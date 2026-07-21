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

    const colorElegido = opcionesColores.find((c) => c.id === personalizacionEstetica.colorId);
    const florElegida = opcionesFlores.find((f) => f.id === personalizacionEstetica.florId);


    const imagenFlor = (fl) =>
        `/images/elementos_dashboard/detalles_plan/tipos_flores/${fl?.imagen || 'flor_pre.png'}`;


    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">

            {/* CAMBIO: el modal pasa de max-w-md a max-w-3xl para que quepan
                2 columnas y ya no tenga que estirarse tanto en vertical. */}
            <form
                onSubmit={aplicarConfiguracionEstetica}
                className="bg-[#FDFBF7] p-6 rounded-[30px] max-w-3xl w-full border-2 border-[#60533E] shadow-2xl max-h-[92vh] overflow-y-auto"
            >

                <h3 className="font-black text-xs uppercase text-[#60533E] border-b pb-2 mb-4">
                    Configuración Visual: {servicioAEditar?.nombre}
                </h3>

                {/* CAMBIO: layout de 2 columnas en lugar de todo apilado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">

                    {/* COLUMNA IZQUIERDA: vista previa + colores */}
                    <div className="space-y-5 text-xs">

                        <div className="relative rounded-2xl border border-[#D9CEB6] bg-white overflow-visible h-28 flex items-center justify-center">
                            <img
                                src={imagenFlor(florElegida)}
                                alt=""
                                className="relative z-10 w-40 h-40 object-contain overflow-visible"
                                style={{ filter: " contrast(1.1)" }}
                            />
                            {colorElegido && (
                                <div
                                    className="absolute inset-0 pointer-events-none transition-colors duration-300 rounded-xl"
                                    style={{
                                        backgroundColor: colorElegido.hex,
                                        mixBlendMode: "multiply",
                                        opacity: 0.90,
                                    }}
                                />
                            )}
                            <div className="absolute bottom-1.5 right-2.5 text-[9px] font-black uppercase text-[#60533E]/60">
                                Vista previa
                            </div>
                        </div>

                        <div>
                            <label className="font-black text-gray-600 uppercase text-[10px] block mb-2">
                                1. Gama Cromática:
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                {opcionesColores.map((col) => {
                                    const seleccionado = personalizacionEstetica.colorId === col.id;
                                    return (
                                        <div
                                            key={col.id}
                                            onClick={() =>
                                                setPersonalizacionEstetica({
                                                    ...personalizacionEstetica,
                                                    colorId: col.id,
                                                    colorNombre: col.nombre
                                                })
                                            }
                                            className={`relative p-2.5 rounded-xl cursor-pointer flex items-center gap-2 border-2 transition-all duration-200 hover:-translate-y-0.5
                                                ${seleccionado
                                                    ? 'border-[#60533E] bg-[#F2ECD9] shadow-sm'
                                                    : 'border-gray-200 bg-white hover:border-[#60533E]/40'
                                                }`}
                                        >
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 shrink-0 transition-transform duration-200 ${
                                                    seleccionado ? "border-[#60533E] scale-110" : "border-gray-300"
                                                }`}
                                                style={{
                                                    backgroundColor: col.hex,
                                                    boxShadow: seleccionado ? `0 0 0 3px ${col.hex}33` : "none",
                                                }}
                                            />

                                            <span className="font-bold text-[10px] uppercase text-[#60533E]">
                                                {col.nombre}
                                            </span>

                                            {seleccionado && (
                                                <span className="ml-auto text-[#60533E] text-xs">✓</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* COLUMNA DERECHA: flores + observaciones */}
                    <div className="space-y-5 text-xs">

                        <div>
                            <label className="font-black text-gray-600 uppercase text-[10px] block mb-2">
                                2. Arreglo de Flores:
                            </label>

                            <div className="grid grid-cols-3 gap-2">
                                {opcionesFlores.map((fl) => {
                                    const seleccionado = personalizacionEstetica.florId === fl.id;
                                    return (
                                        <div
                                            key={fl.id}
                                            onClick={() =>
                                                setPersonalizacionEstetica({
                                                    ...personalizacionEstetica,
                                                    florId: fl.id,
                                                    florNombre: fl.nombre
                                                })
                                            }
                                            className={`relative p-2 rounded-xl cursor-pointer text-center border-2 transition-all duration-200 flex flex-col items-center justify-between hover:-translate-y-0.5
                                                ${seleccionado
                                                    ? 'border-[#60533E] bg-[#F2ECD9] shadow-sm'
                                                    : 'border-gray-200 bg-white hover:border-[#60533E]/40'
                                                }`}
                                        >
                                            {seleccionado && (
                                                <span className="absolute top-1 right-1 text-[#60533E] text-[10px]">✓</span>
                                            )}

                                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mb-1 flex items-center justify-center relative">
                                                <img
                                                    src={imagenFlor(fl)}
                                                    alt=""
                                                    className="w-full h-full object-contain"
                                                    style={{ filter: "grayscale(1) contrast(1.1)" }}
                                                />
                                                {seleccionado && colorElegido && (
                                                    <div
                                                        className="absolute inset-0 pointer-events-none"
                                                        style={{
                                                            backgroundColor: colorElegido.hex,
                                                            mixBlendMode: "multiply",
                                                            opacity: 0.55,
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <span className="font-bold text-[9px] uppercase leading-tight text-[#60533E]">
                                                {fl.nombre}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

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
                                className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl outline-none font-medium text-[#60533E] resize-none h-20 focus:border-[#60533E] transition-colors"
                                placeholder="Ej: Añadir cintas personalizadas..."
                            />
                        </div>

                    </div>

                </div>

                <div className="flex gap-2 text-[10px] font-black uppercase tracking-wider">

                    <button
                        type="submit"
                        className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl hover:bg-[#4E4432] hover:shadow-md transition-all"
                    >
                        Aplicar
                    </button>

                    <button
                        type="button"
                        onClick={cerrarModal}
                        className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                    >
                        Cancelar
                    </button>

                </div>

            </form>

        </div>
    );
}

export default function ModalCatalogoServicios({
    visible,
    todosLosServicios,
    agregarExtraCatalogo,
    cerrarModal
}) {

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">

            <div className="bg-[#FDFBF7] p-6 rounded-[25px] max-w-sm w-full border-2 border-[#60533E] shadow-2xl">

                <h3 className="font-black text-xs uppercase text-[#60533E] border-b pb-2 mb-3">
                    Catálogo de Servicios Extra
                </h3>

                <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4 text-[11px]">

                    {todosLosServicios.map((serv) => (

                        <div
                            key={serv.id}
                            onClick={() => agregarExtraCatalogo(serv)}
                            className="p-2 bg-[#F7F4EB] hover:bg-[#60533E] hover:text-white rounded-xl cursor-pointer flex justify-between items-center border border-[#E3DCcc]"
                        >

                            <span className="font-black uppercase">
                                {serv.nombre}
                            </span>

                            <span className="bg-white text-[#60533E] font-black px-2 py-0.5 rounded-lg text-[10px]">
                                $
                                {Number(serv.precio).toLocaleString("es-CO")}
                            </span>

                        </div>

                    ))}

                </div>

                <button
                    onClick={cerrarModal}
                    className="w-full py-2 bg-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-600"
                >
                    Cerrar
                </button>

            </div>

        </div>
    );
}
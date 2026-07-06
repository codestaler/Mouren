export default function ModalErrorMouren({
    visible,
    cerrarModal
}) {

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">

            <div className="bg-[#FDFBF7] p-6 rounded-[25px] max-w-xs w-full border-2 border-rose-600 text-center shadow-2xl">

                <h4 className="font-black text-xs uppercase text-rose-800 mb-1">
                    Error de Guardado
                </h4>

                <p className="text-[11px] text-gray-600 italic mb-4">
                    Hubo un contratiempo al procesar la personalización.
                </p>

                <button
                    onClick={cerrarModal}
                    className="w-full py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase"
                >
                    Cerrar
                </button>

            </div>
        </div>
    );
}
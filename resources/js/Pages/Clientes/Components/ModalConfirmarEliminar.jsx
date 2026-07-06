// Components/ModalConfirmarEliminar.jsx

export default function ModalConfirmarEliminar({
    visible,
    ejecutarEliminacionAfiliado,
    cerrarModal
}) {

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[#FDFBF7] p-6 rounded-[25px] max-w-xs w-full border-2 border-rose-600/40 text-center shadow-2xl">

                <h4 className="font-black text-sm text-rose-700 uppercase mb-2">
                    ¿Retirar del Plan?
                </h4>

                <p className="text-xs text-gray-600 italic mb-5">
                    ¿Deseas remover a este miembro o protegido del plan amparado?
                </p>

                <div className="flex gap-2 text-[10px] font-black uppercase">

                    <button
                        onClick={ejecutarEliminacionAfiliado}
                        className="flex-1 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700"
                    >
                        Sí, Remover
                    </button>

                    <button
                        onClick={cerrarModal}
                        className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl"
                    >
                        Mantener
                    </button>

                </div>

            </div>
        </div>
    );
}
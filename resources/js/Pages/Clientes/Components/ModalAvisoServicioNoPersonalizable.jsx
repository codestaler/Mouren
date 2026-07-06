export default function ModalAvisoServicioNoPersonalizable({
    visible,
    cerrarModal
}) {

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">

            <div className="bg-[#FDFBF7] p-6 rounded-[25px] max-w-xs w-full border-2 border-amber-600 text-center shadow-2xl">

                <h4 className="font-black text-xs uppercase text-amber-800 mb-1">
                    Aviso del Sistema
                </h4>

                <p className="text-[11px] text-gray-600 italic mb-4">
                    Este servicio es de cobertura fija y no admite alteraciones visuales o personalizaciones estéticas.
                </p>

                <button
                    onClick={cerrarModal}
                    className="w-full py-2 bg-gray-700 text-white rounded-xl text-[10px] font-black uppercase"
                >
                    Cerrar
                </button>

            </div>
        </div>
    );
}
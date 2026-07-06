// Components/ModalExitoMouren.jsx

export default function ModalExitoMouren({
    visible,
    cerrarModal
}) {

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">

            <div className="bg-[#FDFBF7] p-8 rounded-[30px] max-w-xs w-full border-2 border-[#FFC107] text-center shadow-2xl relative overflow-hidden">

                <div className="absolute top-0 left-0 right-0 h-2 bg-[#FFC107]"></div>

                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <span className="text-[#60533E] font-black text-xl">
                        ✔
                    </span>
                </div>

                <h4 className="font-black text-sm text-[#60533E] uppercase mb-1 tracking-wide">
                    Bóveda Actualizada
                </h4>

                <p className="text-[11px] text-gray-600 italic mb-6">
                    ¡Configuraciones guardadas con éxito!
                </p>

                <button
                    onClick={cerrarModal}
                    className="w-full py-2.5 bg-[#60533E] text-white rounded-xl text-[10px] font-black uppercase"
                >
                    Entendido
                </button>

            </div>

        </div>
    );
}
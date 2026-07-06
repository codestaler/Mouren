import { useState, useEffect } from "react";

export default function MiniJuegoMouri() {

    // Posición de Mouri
    const [posicionX, setPosicionX] = useState(400);

    // Imagen actual de Mouri
    const [mouriImagen, setMouriImagen] = useState("/images/mouri-game/mouri.gif");

    const posicionFlorAmarilla = 20;

    const estaCercaDeFlorAmarilla =
        posicionX >= posicionFlorAmarilla - 40 &&
        posicionX <= posicionFlorAmarilla + 40;

    const [mensajeMouri, setMensajeMouri] = useState(
        "¡Bienvenido al Jardín de Mouri! 🌸"
    );

    const [mostrarMensaje, setMostrarMensaje] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMostrarMensaje(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {

        const moverMouri = (event) => {

            if (event.key === "ArrowRight") {

                setMouriImagen("/images/mouri-game/mouri_walk_right.gif");

                setPosicionX((prev) => Math.min(prev + 20, 900));
            }

            if (event.key === "ArrowLeft") {

                setMouriImagen("/images/mouri-game/mouri_walk_left.gif");

                setPosicionX((prev) => Math.max(prev - 20, 20));
            }

        };

        const detenerMouri = () => {
            setMouriImagen("/images/mouri-game/mouri.gif");
        };

        window.addEventListener("keydown", moverMouri);
        window.addEventListener("keyup", detenerMouri);

        return () => {
            window.removeEventListener("keydown", moverMouri);
            window.removeEventListener("keyup", detenerMouri);
        };

    }, []);

    return (
        <div className="w-full h-80 bg-green-100 rounded-3xl border-4 border-[#786F49] overflow-hidden">

            <div className="relative w-full h-80 overflow-hidden rounded-3xl">

                {/* Fondo */}
                <img
                    src="/images/mouri-game/fondo.png"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {estaCercaDeFlorAmarilla && (
                    <div className="absolute top-4 left-4 bg-white/90 border-2 border-[#786F49] rounded-xl px-3 py-2 text-sm font-bold text-[#5C4A2C] shadow-lg">
                        🌸 Presiona ESPACIO para cuidar esta flor
                    </div>
                )}

                {/* Mouri */}
                <img
                    src={mouriImagen}
                    className="absolute bottom-4 w-16 transition-all duration-100"
                    style={{
                        left: `${posicionX}px`,
                        imageRendering: "pixelated"
                    }}
                />

                {/* Flores */}

                <img
                    src="/images/mouri-game/flor_amarilla.gif"
                    className="absolute bottom-20 left-20 w-12"
                />

                <img
                    src="/images/mouri-game/flor_azul.gif"
                    className="absolute bottom-10 left-40 w-12"
                    style={{
                        imageRendering: "pixelated"
                    }}
                />

                <img
                    src="/images/mouri-game/flor_morada.gif"
                    className="absolute bottom-20 left-64 w-12"
                    style={{
                        imageRendering: "pixelated"
                    }}
                />

                <img
                    src="/images/mouri-game/rosa_amarilla.gif"
                    className="absolute bottom-8 left-80 w-12"
                    style={{
                        imageRendering: "pixelated"
                    }}
                />

                {mostrarMensaje && (

                    <div className="absolute bottom-4 right-4 z-20">

                        {/* Globo */}
                        <div className="relative bg-[#FFF8E8] border-2 border-[#786F49] rounded-2xl px-4 py-3 max-w-xs shadow-xl">

                            <p className="text-sm text-[#4E3A25] font-semibold leading-5">
                                {mensajeMouri}
                            </p>

                            <div
                                className="absolute -bottom-2 right-8 w-4 h-4 bg-[#FFF8E8] border-r-2 border-b-2 border-[#786F49] rotate-45"
                            />

                        </div>

                        <img
                            src="/images/mouri-game/mouri_volador.gif"
                            className="w-20 mt-1 ml-auto animate-bounce"
                            style={{ imageRendering: "pixelated" }}
                        />

                    </div>

                )}
            </div>

        </div>
    );
}
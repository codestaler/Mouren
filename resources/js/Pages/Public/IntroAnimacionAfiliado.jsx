import React, { useState, useEffect, useRef } from 'react';

// 🆕 Rutas de sonido corto (2-4s) por motivo de plan. Si el archivo no
// existe todavía, el navegador simplemente no reproduce nada — no rompe
// la animación visual, que sigue funcionando igual sin sonido.
const SONIDO_POR_MOTIVO = {
    flores: '/sounds/intro-sereno.mp3',
    tecnologia: '/sounds/intro-legado.mp3',
    disco: '/sounds/intro-rumba.mp3',
};

const DURACION_MS = 2800;

function IntroFlores({ nombre }) {
    const petalos = Array.from({ length: 10 }).map((_, i) => ({
        left: `${(i * 9.5) % 100}%`,
        delay: `${(i % 5) * 0.3}s`,
        duracion: `${2.2 + (i % 4) * 0.4}s`,
        tam: 18 + (i % 3) * 8,
    }));
    return (
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#F4EDE6] to-[#E3D4BC] dark:from-[#221D17] dark:to-[#3A322A] flex items-center justify-center">
            {petalos.map((p, i) => (
                <span
                    key={i}
                    className="absolute top-0 petalo-intro"
                    style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duracion, fontSize: p.tam }}
                >
                    🌸
                </span>
            ))}
            <div className="relative z-10 text-center px-6">
                <div className="text-5xl mb-3 animate-pulse">🕯️</div>
                {/* 🆕 Nombre de la persona, destacado */}
                {nombre && (
                    <p className="text-[#5D4E3F] dark:text-[#EDE4D3] text-xl font-black mb-1">{nombre}</p>
                )}
                <p className="text-[#5D4E3F] dark:text-[#EDE4D3] text-sm font-black uppercase tracking-[3px]">Bienvenido a tu jardín</p>
                {/* 🆕 Mensaje cálido, simple */}
                <p className="text-[#8C7A67] dark:text-[#C2B49A] text-[11px] italic mt-2">Con cariño y calma, siempre</p>
            </div>
        </div>
    );
}

function IntroGlitch({ nombre }) {
    return (
        <div className="absolute inset-0 overflow-hidden bg-[#0d0b08] flex items-center justify-center">
            {/* líneas de escaneo */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)' }} />
            {/* barras de glitch aleatorias */}
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute left-0 w-full bg-[#FFD97D] mix-blend-difference glitch-barra"
                    style={{ top: `${10 + i * 15}%`, height: `${3 + (i % 3) * 2}px`, animationDelay: `${i * 0.18}s` }}
                />
            ))}
            <div className="relative z-10 text-center px-6">
                <p className="text-[#FFD97D] font-mono text-[10px] uppercase tracking-[3px] mb-2 opacity-70">// accediendo al legado de</p>
                {/* 🆕 Nombre de la persona, con el mismo efecto glitch */}
                {nombre && (
                    <p className="text-[#EDE4D3] font-mono text-xl font-black tracking-widest glitch-texto mb-1">
                        {nombre}
                    </p>
                )}
                <p className="text-[#A68966] font-mono text-[11px] tracking-widest mb-3">
                    LEGADO ETERNO
                </p>
                {/* 🆕 Mensaje cálido, simple */}
                <p className="text-[#8C7A67] font-mono text-[10px] italic opacity-70">tu historia, protegida para siempre</p>
            </div>
        </div>
    );
}

function IntroConfeti({ nombre }) {
    const colores = ['#FFC600', '#A68966', '#8C6A4F', '#C9A876', '#FFD97D', '#fff'];
    const piezas = Array.from({ length: 22 }).map((_, i) => ({
        left: `${(i * 4.6) % 100}%`,
        color: colores[i % colores.length],
        delay: `${(i % 8) * 0.15}s`,
        duracion: `${1.8 + (i % 5) * 0.3}s`,
    }));
    return (
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#4A3B2C] to-[#5D4E3F] flex items-center justify-center">
            <div className="absolute inset-0 luces-fiesta" />
            {piezas.map((p, i) => (
                <span
                    key={i}
                    className="absolute top-0 confeti-intro"
                    style={{ left: p.left, backgroundColor: p.color, animationDelay: p.delay, animationDuration: p.duracion }}
                />
            ))}
            <div className="relative z-10 text-center px-6">
                <div className="text-5xl mb-3">🎉</div>
                {/* 🆕 Nombre de la persona, destacado */}
                {nombre && (
                    <p className="text-[#FFD97D] text-xl font-black mb-1">{nombre}</p>
                )}
                <p className="text-white text-sm font-black uppercase tracking-[3px]">¡Vamos a celebrar tu vida!</p>
                {/* 🆕 Mensaje cálido, simple */}
                <p className="text-white/70 text-[11px] italic mt-2">Con todo el cariño de quienes te aman</p>
            </div>
        </div>
    );
}

// 🆕 Overlay de intro temático de pantalla completa. Se muestra ~2.8s y
// luego se desvanece solo, llamando a onFinalizado(). Puramente visual —
// no guarda nada, solo lee el tema del plan y el nombre de la persona.
export default function IntroAnimacionAfiliado({ tema, nombre, onFinalizado }) {
    const [saliendo, setSaliendo] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Intentamos reproducir un sonido corto. Si el navegador lo bloquea
        // (política de autoplay) o el archivo no existe, simplemente no
        // pasa nada — la animación visual sigue de todas formas.
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(() => {});
        }

        const salir = setTimeout(() => setSaliendo(true), DURACION_MS);
        const terminar = setTimeout(() => onFinalizado?.(), DURACION_MS + 500);
        return () => {
            clearTimeout(salir);
            clearTimeout(terminar);
        };
    }, [onFinalizado]);

    const sonidoSrc = SONIDO_POR_MOTIVO[tema?.motivo];

    return (
        <div className={`fixed inset-0 z-[999] transition-opacity duration-500 ${saliendo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {sonidoSrc && <audio ref={audioRef} src={sonidoSrc} />}

            {tema?.motivo === 'tecnologia' ? (
                <IntroGlitch nombre={nombre} />
            ) : tema?.motivo === 'disco' ? (
                <IntroConfeti nombre={nombre} />
            ) : (
                <IntroFlores nombre={nombre} />
            )}

            <style>{`
                @keyframes petaloIntro {
                    0% { transform: translateY(-10%) rotate(0deg); opacity: 0; }
                    15% { opacity: 0.85; }
                    100% { transform: translateY(1100%) rotate(320deg); opacity: 0.2; }
                }
                .petalo-intro { animation: petaloIntro linear infinite; }

                @keyframes glitchBarra {
                    0%, 100% { transform: translateX(0); opacity: 0; }
                    5% { opacity: 0.6; transform: translateX(-6px); }
                    10% { opacity: 0; transform: translateX(4px); }
                }
                .glitch-barra { animation: glitchBarra 1.4s steps(2) infinite; }

                @keyframes glitchTexto {
                    0%, 100% { text-shadow: 0 0 0 transparent; transform: translate(0,0); }
                    20% { text-shadow: 2px 0 #FF5D8F, -2px 0 #5DD4FF; transform: translate(-1px, 0); }
                    40% { text-shadow: -2px 0 #FF5D8F, 2px 0 #5DD4FF; transform: translate(1px, 0); }
                    60% { text-shadow: 0 0 0 transparent; transform: translate(0,0); }
                }
                .glitch-texto { animation: glitchTexto 0.5s steps(1) infinite; }

                @keyframes confetiIntro {
                    0% { transform: translateY(-10%) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateY(1100%) rotate(480deg); opacity: 0.3; }
                }
                .confeti-intro { width: 8px; height: 13px; border-radius: 1px; animation: confetiIntro linear infinite; }

                @keyframes lucesFiesta {
                    0%, 100% { background-color: rgba(255,198,0,0.12); }
                    33% { background-color: rgba(166,137,102,0.15); }
                    66% { background-color: rgba(255,217,125,0.12); }
                }
                .luces-fiesta { animation: lucesFiesta 1.2s ease-in-out infinite; }

                @media (prefers-reduced-motion: reduce) {
                    .petalo-intro, .glitch-barra, .glitch-texto, .confeti-intro, .luces-fiesta { animation: none !important; }
                }
            `}</style>
        </div>
    );
}

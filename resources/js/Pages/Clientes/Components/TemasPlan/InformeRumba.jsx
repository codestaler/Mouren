import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// 🪩 Bola disco 3D real — MISMO código que ya usamos en Inscribir.jsx (probado y funcionando).
function BolaDisco3D({ size = 100 }) {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(0, 0, 4.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);

        const geometry = new THREE.IcosahedronGeometry(1.3, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0xC9A876, metalness: 1, roughness: 0.15, flatShading: true });
        const ball = new THREE.Mesh(geometry, material);
        scene.add(ball);

        const wire = new THREE.LineSegments(
            new THREE.WireframeGeometry(geometry),
            new THREE.LineBasicMaterial({ color: 0x5D4E3F, transparent: true, opacity: 0.35 })
        );
        ball.add(wire);

        const luz1 = new THREE.PointLight(0xFFC600, 3, 10);
        luz1.position.set(2, 2, 2);
        scene.add(luz1);
        const luz2 = new THREE.PointLight(0xA68966, 2, 10);
        luz2.position.set(-2, -1, 2);
        scene.add(luz2);
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));

        let raf; let t = 0;
        const animar = () => {
            t += 0.01;
            ball.rotation.y += 0.022;
            ball.rotation.x = Math.sin(t) * 0.06;
            luz1.position.x = Math.sin(t * 2) * 2.5;
            luz1.position.z = Math.cos(t * 2) * 2.5;
            luz2.position.x = Math.cos(t * 1.5) * 2.5;
            luz2.position.z = Math.sin(t * 1.5) * 2.5;
            renderer.render(scene, camera);
            raf = requestAnimationFrame(animar);
        };
        animar();

        return () => {
            cancelAnimationFrame(raf);
            geometry.dispose();
            material.dispose();
            wire.geometry.dispose();
            wire.material.dispose();
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [size]);

    return <div ref={mountRef} style={{ width: size, height: size }} />;
}

// 🎉 Confeti cayendo de verdad, continuo — puramente decorativo.
function ConfetiCayendo() {
    const colores = ['#FFC600', '#A68966', '#8C6A4F', '#C9A876', '#FFD97D'];
    const piezas = Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        left: `${(i * 6.2) % 100}%`,
        color: colores[i % colores.length],
        delay: `${(i % 8) * 0.6}s`,
        duracion: `${5 + (i % 5)}s`,
    }));

    return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {piezas.map((p) => (
                <span
                    key={p.id}
                    className="absolute top-0 confeti-cae-rumba"
                    style={{
                        left: p.left, backgroundColor: p.color,
                        animationDelay: p.delay, animationDuration: p.duracion,
                    }}
                />
            ))}
        </div>
    );
}

// 🎉 Informe de Última Rumba — "Línea de Celebración".
// Útil de verdad: qué canción tiene elegida cada protegido (para detectar
// a quién le falta) y el desglose real de a qué se destina la cuota.
export default function InformeRumba({
    afiliados = [],
    serviciosExtras = [],
    canciones = [],
    cuotaTotalDinamica = 0,
    valorCuotaBase = 0,
    onVolver,
}) {
    const totalBase = valorCuotaBase * afiliados.length;
    const totalExtras = serviciosExtras.reduce((s, x) => s + Number(x.precio_pagado ?? x.precio ?? 0), 0);
    const nombreCancion = (a) => canciones.find(c => c.id === a.cancion_id)?.titulo;

    return (
        <div className="relative bg-gradient-to-br from-[#4A3B2C] to-[#5D4E3F] text-white p-4 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] shadow-sm overflow-hidden min-h-full">
            {/* 🆕 Confeti cayendo de verdad */}
            <ConfetiCayendo />

            {/* luces de fiesta, suaves */}
            <span className="pointer-events-none absolute top-6 right-10 w-24 h-24 bg-[#FFD97D]/15 blur-3xl rounded-full" />
            <span className="pointer-events-none absolute bottom-10 left-6 w-24 h-24 bg-[#A68966]/15 blur-3xl rounded-full" />

            <div className="flex items-center gap-3 mb-6 sm:mb-8 relative z-10">
                <button
                    onClick={onVolver}
                    className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 border border-white/10 shadow-sm flex items-center justify-center hover:scale-105 transition"
                    aria-label="Volver a mi gabinete"
                >
                    ←
                </button>
                <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-black italic flex items-center gap-2 truncate">🎉 Línea de Celebración</h3>
                    <p className="text-[9px] sm:text-[10px] opacity-70 italic">Tu cobertura, a puro ritmo</p>
                </div>
            </div>

            {/* 🆕 La bola disco 3D real, protagonista */}
            <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-4 sm:p-5 mb-6 border border-white/10 relative z-10 flex justify-center">
                <BolaDisco3D size={110} />
            </div>

            {/* Playlist de protegidos — útil: te dice a quién le falta canción */}
            <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-4 sm:p-5 mb-6 border border-white/10 relative z-10">
                <p className="text-[9px] uppercase tracking-wider font-black text-[#FFD97D] mb-3">🎵 Tu playlist de tributos</p>
                <div className="space-y-2">
                    {afiliados.length > 0 ? afiliados.map((a, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 bg-white/5 rounded-xl px-3 py-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold truncate">{a.nombre}</p>
                                <p className={`text-[9px] truncate ${nombreCancion(a) ? 'opacity-60' : 'text-amber-300 italic'}`}>
                                    {nombreCancion(a) || 'Sin canción elegida todavía'}
                                </p>
                            </div>
                            <span className="text-lg shrink-0">{nombreCancion(a) ? '🎶' : '🔇'}</span>
                        </div>
                    )) : (
                        <p className="text-[11px] italic opacity-70">Aún no hay protegidos en la fiesta.</p>
                    )}
                </div>
            </div>

            {/* Presupuesto de la celebración: desglose real del costo */}
            <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-4 sm:p-5 border border-white/10 relative z-10">
                <p className="text-[9px] uppercase tracking-wider font-black text-[#FFD97D] mb-3">💰 Presupuesto de la celebración</p>
                <div className="space-y-2 text-[10px] sm:text-[11px]">
                    <div className="flex justify-between">
                        <span className="opacity-80">Cobertura base × {afiliados.length} invitado{afiliados.length !== 1 ? 's' : ''}</span>
                        <span className="font-bold">${totalBase.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-80">Extras de la fiesta ({serviciosExtras.length})</span>
                        <span className="font-bold">${totalExtras.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-2 mt-2 text-sm font-black text-[#FFD97D]">
                        <span>Total mensual</span>
                        <span>${Number(cuotaTotalDinamica).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <style>{`
                .confeti-cae-rumba {
                    width: 7px; height: 11px; border-radius: 1px;
                    animation-name: confetiCaeRumba;
                    animation-timing-function: ease-in;
                    animation-iteration-count: infinite;
                }
                @keyframes confetiCaeRumba {
                    0% { transform: translateY(-10%) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 0.9; }
                    100% { transform: translateY(650%) rotate(420deg); opacity: 0; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .confeti-cae-rumba { animation: none !important; }
                }
            `}</style>
        </div>
    );
}

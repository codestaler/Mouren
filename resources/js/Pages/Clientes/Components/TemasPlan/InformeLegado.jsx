import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// 💾 Monumento holográfico 3D — tu "tumba personalizable", pero convertida
// en un holograma de datos (nada triste ni realista): líneas de wireframe
// brillantes, semi-transparente, girando lento, con partículas subiendo
// como si fuera un respaldo en la nube. Mismo motor que la bola disco.
function MonumentoHolografico3D({ size = 130 }) {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(0, 0.2, 4.6);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);

        // Cuerpo del monumento: un prisma tipo estela, en wireframe
        const geometry = new THREE.BoxGeometry(1.3, 2.2, 0.35, 4, 6, 2);
        const material = new THREE.MeshBasicMaterial({
            color: 0xC9A876,
            wireframe: true,
            transparent: true,
            opacity: 0.6,
        });
        const monumento = new THREE.Mesh(geometry, material);
        scene.add(monumento);

        // Relleno semitransparente, para que se sienta "sólido" tipo holograma
        const relleno = new THREE.Mesh(
            geometry.clone(),
            new THREE.MeshBasicMaterial({ color: 0xFFD97D, transparent: true, opacity: 0.07 })
        );
        monumento.add(relleno);

        // Partículas subiendo, como datos respaldándose en la nube
        const particulas = [];
        for (let i = 0; i < 14; i++) {
            const p = new THREE.Mesh(
                new THREE.SphereGeometry(0.035, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0xFFD97D, transparent: true, opacity: 0.85 })
            );
            p.position.set((Math.random() - 0.5) * 1.1, -1.3 + Math.random() * 2.6, (Math.random() - 0.5) * 0.4);
            p.userData.velocidad = 0.004 + Math.random() * 0.006;
            scene.add(p);
            particulas.push(p);
        }

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));

        let raf;
        const animar = () => {
            monumento.rotation.y += 0.006;
            particulas.forEach((p) => {
                p.position.y += p.userData.velocidad;
                if (p.position.y > 1.3) p.position.y = -1.3;
            });
            renderer.render(scene, camera);
            raf = requestAnimationFrame(animar);
        };
        animar();

        return () => {
            cancelAnimationFrame(raf);
            geometry.dispose();
            material.dispose();
            relleno.geometry.dispose();
            relleno.material.dispose();
            particulas.forEach((p) => { p.geometry.dispose(); p.material.dispose(); });
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [size]);

    return <div ref={mountRef} style={{ width: size, height: size }} />;
}

// 💾 Informe de Legado Eterno — "Panel de Legado Digital".
// Útil de verdad: % real de protegidos con toda su info configurada, un log
// de estado por cada uno, y el desglose real de a qué se destina la cuota.
export default function InformeLegado({
    plan = {},
    afiliados = [],
    serviciosExtras = [],
    cuotaTotalDinamica = 0,
    valorCuotaBase = 0,
    onVolver,
}) {
    const totalAfiliados = afiliados.length;
    const completos = afiliados.filter(a => a.recuerdo_id && a.cancion_id).length;
    const pctRespaldo = totalAfiliados > 0 ? Math.round((completos / totalAfiliados) * 100) : 0;

    const totalBase = valorCuotaBase * totalAfiliados;
    const totalExtras = serviciosExtras.reduce((s, x) => s + Number(x.precio_pagado ?? x.precio ?? 0), 0);

    return (
        <div className="relative bg-[#221D17] text-[#EDE4D3] p-4 sm:p-6 md:p-8 rounded-[28px] sm:rounded-[36px] md:rounded-[45px] shadow-sm border border-white/10 overflow-hidden min-h-full font-mono">
            {/* líneas de escaneo tipo terminal, muy suaves */}
            <div
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)' }}
            />

            <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <button
                    onClick={onVolver}
                    className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 border border-white/10 shadow-sm flex items-center justify-center hover:scale-105 transition"
                    aria-label="Volver a mi gabinete"
                >
                    ←
                </button>
                <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-black flex items-center gap-2 truncate">💾 Panel de Legado Digital</h3>
                    <p className="text-[9px] sm:text-[10px] opacity-60">// sistema de respaldo activo</p>
                </div>
            </div>

            {/* 🆕 Monumento holográfico — el "cofre 3D" convertido en holograma de legado */}
            <div className="bg-black/30 rounded-2xl p-4 sm:p-5 mb-6 border border-[#A68966]/30 flex flex-col items-center">
                <p className="text-[9px] uppercase tracking-wider font-black text-[#A68966] mb-2 self-start">MONUMENTO_HOLOGRÁFICO</p>
                <MonumentoHolografico3D size={130} />
                <p className="text-[10px] text-[#FFD97D] font-black mt-2 tracking-widest text-center">{plan?.nombre || 'LEGADO ETERNO'}</p>
                <p className="text-[8px] opacity-50 mt-1 text-center">Tu legado, respaldado para siempre</p>
            </div>

            {/* Barra de "respaldo" — % real de perfiles completos */}
            <div className="bg-black/30 rounded-2xl p-4 sm:p-5 mb-6 border border-[#A68966]/30">
                <div className="flex justify-between items-center mb-2 text-[9px] sm:text-[10px] uppercase tracking-widest">
                    <span className="text-[#A68966] font-black">RESPALDO_COMPLETO</span>
                    <span className="font-black text-[#FFD97D]">{pctRespaldo}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#8C6A4F] to-[#A68966] transition-all duration-700"
                        style={{ width: `${pctRespaldo}%` }}
                    />
                </div>
                <p className="text-[9px] opacity-50 mt-2">{completos}/{totalAfiliados} perfiles con canción + recuerdo asignados</p>
            </div>

            {/* Logs de afiliados */}
            <div className="bg-black/30 rounded-2xl p-4 sm:p-5 mb-6 border border-white/10">
                <p className="text-[9px] uppercase tracking-wider font-black text-[#A68966] mb-3">LOG_PROTEGIDOS</p>
                <div className="space-y-1.5 text-[10px] sm:text-[11px]">
                    {afiliados.length > 0 ? afiliados.map((a, i) => {
                        const completo = a.recuerdo_id && a.cancion_id;
                        return (
                            <div key={i} className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0">
                                <span className="truncate">&gt; {a.nombre} <span className="opacity-40">[{a.parentesco}]</span></span>
                                <span className={`shrink-0 font-black px-2 py-0.5 rounded text-[8px] uppercase ${completo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {completo ? 'OK' : 'PENDIENTE'}
                                </span>
                            </div>
                        );
                    }) : (
                        <p className="opacity-50 italic">Sin registros todavía.</p>
                    )}
                </div>
            </div>

            {/* Asignación de recursos: desglose real del costo */}
            <div className="bg-black/30 rounded-2xl p-4 sm:p-5 border border-white/10">
                <p className="text-[9px] uppercase tracking-wider font-black text-[#A68966] mb-3">ASIGNACIÓN_DE_RECURSOS</p>
                <div className="space-y-1.5 text-[10px] sm:text-[11px]">
                    <div className="flex justify-between">
                        <span className="opacity-70">Módulo base × {totalAfiliados}</span>
                        <span>${totalBase.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-70">Módulos extra ({serviciosExtras.length})</span>
                        <span>${totalExtras.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1.5 font-black text-[#FFD97D]">
                        <span>TOTAL_MENSUAL</span>
                        <span>${Number(cuotaTotalDinamica).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

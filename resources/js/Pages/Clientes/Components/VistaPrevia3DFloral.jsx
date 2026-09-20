import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Mismos nombres/colores que ya usa VistaPrevia3DCofre — el "color"
// aquí se interpreta como el color de la CINTA de la corona (una corona
// funeraria real siempre lleva una cinta), y la "flor" es el color real
// del arreglo floral. Encaja con lo que el cliente ya elige en el modal.
const HEX_POR_COLOR = {
    blanco: '#F5F0E8',
    dorado: '#D4AF37',
    cafe: '#8C6F4F',
    'café': '#8C6F4F',
    rosado: '#E8A9C4',
    azul: '#7FA8C9',
};

const HEX_POR_FLOR = {
    rosas: '#D4526E',
    lirios: '#F5F0E8',
    orquídeas: '#B77FC9',
    orquideas: '#B77FC9',
    claveles: '#E85C7A',
    crisantemos: '#E8C468',
};

function resolverHexColor(nombre) {
    if (!nombre) return '#C9A876';
    return HEX_POR_COLOR[nombre.trim().toLowerCase()] || '#C9A876';
}

function resolverHexFlor(nombre) {
    if (!nombre) return '#E8A9C4';
    return HEX_POR_FLOR[nombre.trim().toLowerCase()] || '#E8A9C4';
}

// 🆕 Vista previa 3D de una CORONA/ARREGLO FLORAL — distinta a propósito
// del cofre, para que "Decoración Floral" no muestre un ataúd. Mismo
// patrón de arrastrar-para-rotar que VistaPrevia3DCofre.
export default function VistaPrevia3DFloral({ colorNombre, florNombre, size = 150 }) {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const cintaHex = resolverHexColor(colorNombre);
        const florHex = resolverHexFlor(florNombre);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0.3, 5.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);

        const grupo = new THREE.Group();

        // Base de la corona: un aro de "follaje" verde
        const aroGeo = new THREE.TorusGeometry(1.3, 0.28, 12, 32);
        const aroMat = new THREE.MeshStandardMaterial({ color: 0x4a6b3f, roughness: 0.8 });
        const aro = new THREE.Mesh(aroGeo, aroMat);
        grupo.add(aro);

        // Flores repartidas alrededor del aro, con el color real elegido
        const florMat = new THREE.MeshStandardMaterial({ color: florHex, roughness: 0.5 });
        const NUM_FLORES = 14;
        for (let i = 0; i < NUM_FLORES; i++) {
            const angulo = (i / NUM_FLORES) * Math.PI * 2;
            const flor = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), florMat);
            flor.position.set(Math.cos(angulo) * 1.3, Math.sin(angulo) * 1.3, 0.15);
            grupo.add(flor);

            // un centro más chico y claro, para dar textura de pétalo
            const centro = new THREE.Mesh(
                new THREE.SphereGeometry(0.09, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0xFFF3D6, roughness: 0.4 })
            );
            centro.position.set(Math.cos(angulo) * 1.3, Math.sin(angulo) * 1.3, 0.32);
            grupo.add(centro);
        }

        // Cinta con el color elegido, colgando abajo
        const cintaMat = new THREE.MeshStandardMaterial({ color: cintaHex, metalness: 0.2, roughness: 0.4, side: THREE.DoubleSide });
        const cintaIzq = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 1.3), cintaMat);
        cintaIzq.position.set(-0.18, -1.7, 0.1);
        cintaIzq.rotation.z = 0.12;
        grupo.add(cintaIzq);
        const cintaDer = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 1.15), cintaMat);
        cintaDer.position.set(0.18, -1.65, 0.1);
        cintaDer.rotation.z = -0.15;
        grupo.add(cintaDer);
        // moño central de la cinta
        const monio = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), cintaMat);
        monio.position.set(0, -1.05, 0.15);
        grupo.add(monio);

        scene.add(grupo);

        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const luz1 = new THREE.PointLight(0xFFD97D, 1.5, 15);
        luz1.position.set(3, 3, 3);
        scene.add(luz1);
        const luz2 = new THREE.PointLight(0xA68966, 0.9, 15);
        luz2.position.set(-3, -1, 2);
        scene.add(luz2);

        // Arrastrar para rotar — mismo patrón que el cofre
        let arrastrando = false;
        let ultimoX = 0;
        let ultimoY = 0;
        const SENSIBILIDAD = 0.008;
        const LIMITE_VERTICAL = 0.5;

        const obtenerXY = (evento) => {
            if (evento.touches && evento.touches.length > 0) {
                return { x: evento.touches[0].clientX, y: evento.touches[0].clientY };
            }
            return { x: evento.clientX, y: evento.clientY };
        };
        const iniciarArrastre = (evento) => {
            arrastrando = true;
            const { x, y } = obtenerXY(evento);
            ultimoX = x; ultimoY = y;
            renderer.domElement.style.cursor = 'grabbing';
        };
        const moverArrastre = (evento) => {
            if (!arrastrando) return;
            const { x, y } = obtenerXY(evento);
            const deltaX = x - ultimoX;
            const deltaY = y - ultimoY;
            ultimoX = x; ultimoY = y;
            grupo.rotation.y += deltaX * SENSIBILIDAD;
            grupo.rotation.x = Math.max(-LIMITE_VERTICAL, Math.min(LIMITE_VERTICAL, grupo.rotation.x + deltaY * SENSIBILIDAD));
        };
        const terminarArrastre = () => {
            arrastrando = false;
            renderer.domElement.style.cursor = 'grab';
        };

        const el = renderer.domElement;
        el.style.cursor = 'grab';
        el.style.touchAction = 'none';
        el.addEventListener('mousedown', iniciarArrastre);
        window.addEventListener('mousemove', moverArrastre);
        window.addEventListener('mouseup', terminarArrastre);
        el.addEventListener('touchstart', iniciarArrastre, { passive: true });
        el.addEventListener('touchmove', moverArrastre, { passive: true });
        el.addEventListener('touchend', terminarArrastre);

        let raf;
        const animar = () => {
            if (!arrastrando) grupo.rotation.y += 0.005;
            renderer.render(scene, camera);
            raf = requestAnimationFrame(animar);
        };
        animar();

        return () => {
            cancelAnimationFrame(raf);
            el.removeEventListener('mousedown', iniciarArrastre);
            window.removeEventListener('mousemove', moverArrastre);
            window.removeEventListener('mouseup', terminarArrastre);
            el.removeEventListener('touchstart', iniciarArrastre);
            el.removeEventListener('touchmove', moverArrastre);
            el.removeEventListener('touchend', terminarArrastre);
            aroGeo.dispose(); aroMat.dispose();
            florMat.dispose(); cintaMat.dispose();
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [colorNombre, florNombre, size]);

    return <div ref={mountRef} style={{ width: size, height: size }} className="mx-auto" />;
}

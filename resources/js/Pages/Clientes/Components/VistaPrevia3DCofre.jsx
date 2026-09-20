import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// 🆕 Traduce el NOMBRE de color/flor que ya guarda tu sistema de
// personalización a un color real para el 3D. Es solo de presentación —
// no reemplaza ni toca tus opcionesColores/opcionesFlores reales, solo
// lee el nombre de texto que ya viene guardado.
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
    if (!nombre) return '#8C6F4F';
    return HEX_POR_COLOR[nombre.trim().toLowerCase()] || '#8C6F4F';
}

function resolverHexFlor(nombre) {
    if (!nombre) return '#E8A9C4';
    return HEX_POR_FLOR[nombre.trim().toLowerCase()] || '#E8A9C4';
}

// 🆕 Vista previa 3D del cofre, mostrando EN VIVO el color y el arreglo
// floral que el cliente ya personalizó y guardó. Puramente de presentación:
// no guarda, no modifica, no reemplaza el modal de personalización — solo
// dibuja en 3D lo que ya existe en `colorNombre` / `florNombre`.
//
// 🆕 Ahora se puede arrastrar con el mouse (o el dedo en celular) para
// verlo desde cualquier ángulo. Gira solo cuando nadie lo está arrastrando.
export default function VistaPrevia3DCofre({ colorNombre, florNombre, size = 150 }) {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const colorHex = resolverHexColor(colorNombre);
        const florHex = resolverHexFlor(florNombre);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 1.6, 5.2);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);

        const grupo = new THREE.Group();

        // Cuerpo del cofre
        const baseGeo = new THREE.BoxGeometry(2.6, 0.85, 1.1);
        const baseMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.3, roughness: 0.45 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -0.15;
        grupo.add(base);

        // Tapa
        const tapaGeo = new THREE.BoxGeometry(2.7, 0.22, 1.2);
        const tapaMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.4, roughness: 0.35 });
        const tapa = new THREE.Mesh(tapaGeo, tapaMat);
        tapa.position.y = 0.38;
        grupo.add(tapa);

        // Borde dorado, siempre dorado sin importar el color del cofre (detalle elegante fijo)
        const bordeGeo = new THREE.BoxGeometry(2.75, 0.035, 1.25);
        const bordeMat = new THREE.MeshStandardMaterial({ color: 0xC9A876, metalness: 0.9, roughness: 0.2 });
        const borde = new THREE.Mesh(bordeGeo, bordeMat);
        borde.position.y = 0.27;
        grupo.add(borde);

        // Arreglo floral encima — un pequeño racimo con el color real de la flor elegida
        const florGrupo = new THREE.Group();
        const florMat = new THREE.MeshStandardMaterial({ color: florHex, roughness: 0.55 });
        const posicionesFlor = [
            [0, 0], [0.18, 0.1], [-0.18, -0.1], [0.1, -0.16], [-0.1, 0.15],
        ];
        posicionesFlor.forEach(([x, z], i) => {
            const petalo = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), florMat);
            petalo.position.set(x, 0.5 + (i % 2 === 0 ? 0.02 : 0), z);
            florGrupo.add(petalo);
        });
        const hojaMat = new THREE.MeshStandardMaterial({ color: 0x4a6b4a, roughness: 0.7 });
        [[0.26, 0.02], [-0.26, 0.08], [0.02, -0.24]].forEach(([x, z]) => {
            const hoja = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), hojaMat);
            hoja.position.set(x, 0.48, z);
            florGrupo.add(hoja);
        });
        grupo.add(florGrupo);

        // Rotación inicial parecida a la de antes, para que se vea igual al cargar
        grupo.rotation.x = 0;
        scene.add(grupo);

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const luz1 = new THREE.PointLight(0xFFD97D, 1.6, 15);
        luz1.position.set(3, 3, 3);
        scene.add(luz1);
        const luz2 = new THREE.PointLight(0xA68966, 1, 15);
        luz2.position.set(-3, 1, -2);
        scene.add(luz2);

        // 🆕 Arrastrar para rotar — funciona con mouse y con el dedo (touch)
        let arrastrando = false;
        let ultimoX = 0;
        let ultimoY = 0;
        const SENSIBILIDAD = 0.008;
        const LIMITE_VERTICAL = 0.6; // evita que el cofre se voltee de cabeza

        const obtenerXY = (evento) => {
            if (evento.touches && evento.touches.length > 0) {
                return { x: evento.touches[0].clientX, y: evento.touches[0].clientY };
            }
            return { x: evento.clientX, y: evento.clientY };
        };

        const iniciarArrastre = (evento) => {
            arrastrando = true;
            const { x, y } = obtenerXY(evento);
            ultimoX = x;
            ultimoY = y;
            renderer.domElement.style.cursor = 'grabbing';
        };

        const moverArrastre = (evento) => {
            if (!arrastrando) return;
            const { x, y } = obtenerXY(evento);
            const deltaX = x - ultimoX;
            const deltaY = y - ultimoY;
            ultimoX = x;
            ultimoY = y;

            grupo.rotation.y += deltaX * SENSIBILIDAD;
            grupo.rotation.x = Math.max(
                -LIMITE_VERTICAL,
                Math.min(LIMITE_VERTICAL, grupo.rotation.x + deltaY * SENSIBILIDAD)
            );
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
            // Solo gira solo cuando nadie lo está arrastrando
            if (!arrastrando) {
                grupo.rotation.y += 0.006;
            }
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
            baseGeo.dispose(); baseMat.dispose();
            tapaGeo.dispose(); tapaMat.dispose();
            bordeGeo.dispose(); bordeMat.dispose();
            florMat.dispose(); hojaMat.dispose();
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [colorNombre, florNombre, size]);

    return <div ref={mountRef} style={{ width: size, height: size }} className="mx-auto" />;
}

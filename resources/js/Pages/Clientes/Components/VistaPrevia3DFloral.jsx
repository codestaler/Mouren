import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Mismos nombres/colores que ya usa VistaPrevia3DCofre — el "color" aquí
// es la cinta de la corona, la "flor" es el color real del arreglo.
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

// 🆕 Misma textura de degradado por bandas que el cofre, para que ambas
// vistas 3D se sientan de la misma "familia" de estilo cartoon.
function crearGradienteToon() {
    const bandas = new Uint8Array([70, 130, 190, 255]);
    const gradiente = new THREE.DataTexture(bandas, bandas.length, 1, THREE.RedFormat);
    gradiente.needsUpdate = true;
    gradiente.minFilter = THREE.NearestFilter;
    gradiente.magFilter = THREE.NearestFilter;
    return gradiente;
}

// 🆕 Vista previa 3D de una CORONA/ARREGLO FLORAL — distinta a propósito
// del cofre, para que "Decoración Floral" no muestre un ataúd. Mismo estilo
// cartoon años 30 (sombreado por bandas + contorno negro) y mismo patrón
// de arrastrar-para-rotar que VistaPrevia3DCofre.
export default function VistaPrevia3DFloral({ colorNombre, florNombre, size = 150 }) {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const cintaHex = resolverHexColor(colorNombre);
        const florHex = resolverHexFlor(florNombre);
        const gradienteToon = crearGradienteToon();

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0.3, 5.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);

        const grupo = new THREE.Group();

        const materialesParaLimpiar = [];
        const geometriasParaLimpiar = [gradienteToon];

        // 🆕 Mismo truco de contorno negro (malla invertida) que en el cofre
        function piezaConContorno(geometria, colorHex, posicion = [0, 0, 0], rotacion = [0, 0, 0], escalaContorno = 1.07) {
            const mat = new THREE.MeshToonMaterial({ color: colorHex, gradientMap: gradienteToon });
            const mesh = new THREE.Mesh(geometria, mat);
            mesh.position.set(...posicion);
            mesh.rotation.set(...rotacion);
            grupo.add(mesh);

            const contornoMat = new THREE.MeshBasicMaterial({ color: 0x231a12, side: THREE.BackSide });
            const contorno = new THREE.Mesh(geometria, contornoMat);
            contorno.position.set(...posicion);
            contorno.rotation.set(...rotacion);
            contorno.scale.multiplyScalar(escalaContorno);
            grupo.add(contorno);

            materialesParaLimpiar.push(mat, contornoMat);
            geometriasParaLimpiar.push(geometria);
            return mesh;
        }

        // Base de la corona: un aro de "follaje" verde
        const aroGeo = new THREE.TorusGeometry(1.3, 0.28, 12, 32);
        piezaConContorno(aroGeo, 0x4a6b3f, [0, 0, 0], [0, 0, 0], 1.04);

        // Flores repartidas alrededor del aro, con el color real elegido
        const NUM_FLORES = 14;
        for (let i = 0; i < NUM_FLORES; i++) {
            const angulo = (i / NUM_FLORES) * Math.PI * 2;
            const x = Math.cos(angulo) * 1.3;
            const y = Math.sin(angulo) * 1.3;

            const florGeo = new THREE.SphereGeometry(0.22, 10, 10);
            piezaConContorno(florGeo, florHex, [x, y, 0.15]);

            // un centro más chico y claro, para dar textura de pétalo (sin contorno propio, va encima)
            const centroMat = new THREE.MeshToonMaterial({ color: 0xFFF3D6, gradientMap: gradienteToon });
            const centroGeo = new THREE.SphereGeometry(0.09, 8, 8);
            const centro = new THREE.Mesh(centroGeo, centroMat);
            centro.position.set(x, y, 0.32);
            grupo.add(centro);
            materialesParaLimpiar.push(centroMat);
            geometriasParaLimpiar.push(centroGeo);
        }

        // Cinta con el color elegido, colgando abajo
        const cintaIzqGeo = new THREE.PlaneGeometry(0.32, 1.3);
        piezaConContorno(cintaIzqGeo, cintaHex, [-0.18, -1.7, 0.1], [0, 0, 0.12], 1.12);

        const cintaDerGeo = new THREE.PlaneGeometry(0.32, 1.15);
        piezaConContorno(cintaDerGeo, cintaHex, [0.18, -1.65, 0.1], [0, 0, -0.15], 1.12);

        // moño central de la cinta
        const monioGeo = new THREE.SphereGeometry(0.16, 10, 10);
        piezaConContorno(monioGeo, cintaHex, [0, -1.05, 0.15]);

        scene.add(grupo);

        scene.add(new THREE.AmbientLight(0xffffff, 0.85));
        const luzPrincipal = new THREE.DirectionalLight(0xFFF3D6, 0.9);
        luzPrincipal.position.set(3, 3, 4);
        scene.add(luzPrincipal);

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
            materialesParaLimpiar.forEach((m) => m.dispose());
            geometriasParaLimpiar.forEach((g) => g.dispose());
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [colorNombre, florNombre, size]);

    return (
        <div className="relative mx-auto" style={{ width: size, height: size }}>
            <div ref={mountRef} style={{ width: size, height: size }} />
            <div
                className="absolute inset-0 pointer-events-none rounded-full"
                style={{ boxShadow: 'inset 0 0 24px rgba(35,26,18,0.18)' }}
            />
        </div>
    );
}

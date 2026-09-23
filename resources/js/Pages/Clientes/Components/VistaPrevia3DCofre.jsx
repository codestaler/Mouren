import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Mismos nombres/colores que ya usa tu sistema — sin cambios
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

// 🆕 Textura de degradado por bandas para el sombreado tipo "cartoon de los
// 30" (cel-shading): en vez de una luz suave y realista, la superficie se
// ve en 3-4 tonos planos y marcados, como una caricatura pintada a mano.
function crearGradienteToon() {
    const bandas = new Uint8Array([70, 130, 190, 255]);
    const gradiente = new THREE.DataTexture(bandas, bandas.length, 1, THREE.RedFormat);
    gradiente.needsUpdate = true;
    gradiente.minFilter = THREE.NearestFilter;
    gradiente.magFilter = THREE.NearestFilter;
    return gradiente;
}

// 🆕 Vista previa 3D del cofre, mostrando EN VIVO el color y el arreglo
// floral que el cliente ya personalizó y guardó. Puramente de presentación:
// no guarda, no modifica, no reemplaza el modal de personalización — solo
// dibuja en 3D lo que ya existe en `colorNombre` / `florNombre`.
//
// Se puede arrastrar con el mouse (o el dedo en celular) para verlo desde
// cualquier ángulo. Gira solo cuando nadie lo está arrastrando.
export default function VistaPrevia3DCofre({ colorNombre, florNombre, size = 150 }) {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const colorHex = resolverHexColor(colorNombre);
        const florHex = resolverHexFlor(florNombre);
        const gradienteToon = crearGradienteToon();

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 1.6, 5.2);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);

        const grupo = new THREE.Group();

        // 🆕 Todo lo que se crea con esta función queda con el sombreado por
        // bandas Y su propio contorno negro (el truco clásico de "malla
        // invertida": una copia más grande de la misma pieza, pintada de
        // negro por dentro, que solo se asoma por los bordes — así se ve
        // como si estuviera dibujada a mano, no como un modelo de prueba).
        const materialesParaLimpiar = [];
        const geometriasParaLimpiar = [gradienteToon];

        function piezaConContorno(geometria, colorHex, posicion = [0, 0, 0]) {
            const mat = new THREE.MeshToonMaterial({ color: colorHex, gradientMap: gradienteToon });
            const mesh = new THREE.Mesh(geometria, mat);
            mesh.position.set(...posicion);
            grupo.add(mesh);

            const contornoMat = new THREE.MeshBasicMaterial({ color: 0x231a12, side: THREE.BackSide });
            const contorno = new THREE.Mesh(geometria, contornoMat);
            contorno.position.set(...posicion);
            contorno.scale.multiplyScalar(1.07);
            grupo.add(contorno);

            materialesParaLimpiar.push(mat, contornoMat);
            geometriasParaLimpiar.push(geometria);
            return mesh;
        }

        // Cuerpo del cofre
        const baseGeo = new THREE.BoxGeometry(2.6, 0.85, 1.1);
        piezaConContorno(baseGeo, colorHex, [0, -0.15, 0]);

        // Tapa
        const tapaGeo = new THREE.BoxGeometry(2.7, 0.22, 1.2);
        piezaConContorno(tapaGeo, colorHex, [0, 0.38, 0]);

        // Borde dorado, siempre dorado sin importar el color del cofre
        const bordeGeo = new THREE.BoxGeometry(2.75, 0.035, 1.25);
        piezaConContorno(bordeGeo, 0xC9A876, [0, 0.27, 0]);

        // Arreglo floral encima — un pequeño racimo con el color real de la flor elegida
        const posicionesFlor = [
            [0, 0.5, 0], [0.18, 0.52, 0.1], [-0.18, 0.48, -0.1], [0.1, 0.34, -0.16], [-0.1, 0.65, 0.15],
        ];
        posicionesFlor.forEach(([x, y, z]) => {
            const petaloGeo = new THREE.SphereGeometry(0.13, 10, 10);
            piezaConContorno(petaloGeo, florHex, [x, y, z]);
        });

        [[0.26, 0.48, 0.02], [-0.26, 0.48, 0.08], [0.02, 0.48, -0.24]].forEach(([x, y, z]) => {
            const hojaGeo = new THREE.SphereGeometry(0.07, 8, 8);
            piezaConContorno(hojaGeo, 0x4a6b4a, [x, y, z]);
        });

        scene.add(grupo);

        // 🆕 Luz más plana y menos puntos de brillo — la personalidad ahora
        // la da el sombreado por bandas y el contorno, no las luces.
        scene.add(new THREE.AmbientLight(0xffffff, 0.85));
        const luzPrincipal = new THREE.DirectionalLight(0xFFF3D6, 0.9);
        luzPrincipal.position.set(3, 4, 4);
        scene.add(luzPrincipal);

        // Arrastrar para rotar — funciona con mouse y con el dedo (touch)
        let arrastrando = false;
        let ultimoX = 0;
        let ultimoY = 0;
        const SENSIBILIDAD = 0.008;
        const LIMITE_VERTICAL = 0.6;

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
            materialesParaLimpiar.forEach((m) => m.dispose());
            geometriasParaLimpiar.forEach((g) => g.dispose());
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, [colorNombre, florNombre, size]);

    return (
        <div className="relative mx-auto" style={{ width: size, height: size }}>
            <div ref={mountRef} style={{ width: size, height: size }} />
            {/* 🆕 Viñeta suave tipo película antigua, puro CSS, muy sutil */}
            <div
                className="absolute inset-0 pointer-events-none rounded-full"
                style={{ boxShadow: 'inset 0 0 24px rgba(35,26,18,0.18)' }}
            />
        </div>
    );
}

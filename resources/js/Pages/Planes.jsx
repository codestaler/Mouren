import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import { Head, useForm } from '@inertiajs/react';
import MusicAlbum from '@/Components/MusicAlbum';
import RecuerdosCarousel from '@/Components/RecuerdosCarousel';

const planesData = [
    {
        id: 'sereno',
        titulo: 'Descanso Sereno',
        precioIndividual: 5000,
        enfoque: 'Un servicio digno, esencial y respetuoso. Diseñado para brindar tranquilidad inmediata y un respaldo sólido en los momentos que más se necesita la guía experta.',
        mouri: '/images/planes/tarjetas/sereno/logo_descanso_sereno.webp',
        tipoNombre: 'Esencial',
        unidad: 'persona',
        detalles: [
            { cat: 'Atención Integral', items: ['Orientación profesional 24/7', 'Tanatopraxia técnica certificada', 'Cofre de línea estándar o semilujo', 'Traslados nacionales hasta 150 km', 'Diligencias ante Registro Civil'] },
            { cat: 'Velación Humana', items: ['Sala de velación por 16 horas', 'Arreglo floral fúnebre natural', 'Libro de firmas para recuerdos', 'Estación permanente de café y aromáticas', 'Asesoría en protocolo de despedida'] },
            { cat: 'Destino Final', items: ['Inhumación o Cremación asistida', 'Lote en comodato (según disponibilidad legal)', 'Urna para cenizas en madera', 'Certificación de destino final'] }
        ]
    },
    {
        id: 'legado',
        titulo: 'Legado Eterno',
        precioIndividual: 7500,
        enfoque: 'Honrar la historia de vida con detalles que perduran. Un homenaje profundo que resalta los valores y el camino recorrido por nuestros seres queridos.',
        mouri: '/images/planes/tarjetas/legado/logo_legado_eterno.gif',
        tipoNombre: 'Historia',
        unidad: 'persona',
        detalles: [
            { cat: 'Atención Superior', items: ['Tanatopraxia avanzada estética', 'Cofre semi lujo con acabados finos', 'Acompañamiento legal y notarial total', 'Coche fúnebre de lujo para traslados'] },
            { cat: 'Homenaje Especial', items: ['Sala 24 horas en sedes VIP', 'Dos arreglos florales de diseño', 'Video homenaje proyectado en sala', 'Estación de café premium y refrigerio ligero'] },
            { cat: 'Cortejo y Redes', items: ['Autobús para 40 acompañantes', 'Transmisión en vivo para familiares en el exterior', 'Coche especial para arreglos florales'] },
            { cat: 'Destino con Honor', items: ['Inhumación o Cremación con protocolo', 'Urna de madera fina grabada en láser', 'Apoyo en trámites de exhumación futura'] }
        ]
    },
    {
        id: 'tributo',
        titulo: 'Última Rumba',
        precioIndividual: 10000,
        enfoque: 'Una celebración emotiva, personal y de alta gama. Para quienes desean transformar el adiós en un evento memorable lleno de luz, música y detalles únicos.',
        mouri: '/images/planes/tarjetas/tributo/logo_tributo.webp',
        tipoNombre: 'Tributo',
        unidad: 'persona',
        detalles: [
            { cat: 'Experiencias Especiales', items: ['Música instrumental en vivo (Violín/Piano)', 'Ceremonia de despedida personalizada por orador', 'Video tributo cinematográfico 4K', 'Servicio de catering premium para invitados'] },
            { cat: 'Atención Premium', items: ['Cofre de lujo en madera de cedro o caoba', 'Tanatopraxia estética de alta definición', 'Gestión total de trámites ante todas las entidades'] },
            { cat: 'Velación Exclusiva', items: ['Ambientación floral temática personalizada', 'Estación de snacks, frutas y bebidas frías', 'Acompañamiento psicológico especializado in situ'] },
            { cat: 'Destino VIP', items: ['Inhumación o Cremación en sectores preferenciales', 'Urna especial de diseño artístico', 'Placa conmemorativa personalizada'] }
        ]
    },
    {
        id: 'huella',
        titulo: 'Huella Eterna',
        precioIndividual: 13000,
        enfoque: 'Amor y respeto infinito para los compañeros que dejan su marca en el alma. Un adiós digno para nuestras mascotas, tratándolas como los miembros de familia que son.',
        mouri: '/images/planes/tarjetas/huella/logo_huella_eterna.webp',
        tipoNombre: 'Mascotas',
        unidad: 'mascota',
        detalles: [
            { cat: 'Servicios Mascotas', items: ['Cremación individual con entrega de cenizas', 'Urna decorativa temática a elección', 'Huella memorial en arcilla o escayola', 'Mechón de pelo memorial (opcional)'] },
            { cat: 'Ritual de Despedida', items: ['Espacio simbólico privado para la familia', 'Ritual de luz y siembra de vida', 'Música ambiental relajante para el proceso'] },
            { cat: 'Atención y Respeto', items: ['Recogida en veterinaria o domicilio 24h', 'Preparación estética digna del peludito', 'Certificado oficial de cremación y duelo'] }
        ]
    }
];

const serviciosGenerales = [
    { servicio: "Traslado Inicial", cobertura: "Recogida desde el lugar del fallecimiento (clínica o casa) hasta la unidad de preservación." },
    { servicio: "Asesoría Legal", cobertura: "Acompañamiento experto en trámites de defunción, licencias de inhumación y registros notariales." },
    { servicio: "Laboratorio Ético", cobertura: "Preparación técnica realizada por profesionales certificados bajo estándares de dignidad absoluta." },
    { servicio: "Cofre y Velación", cobertura: "Suministro de cofre según plan y acceso a salas de velación confortables a nivel nacional." },
    { servicio: "Asistencia 24/7", cobertura: "Línea de vida Mouren activa siempre para guiar a la familia en cada paso del proceso." },
    { servicio: "Red de Apoyo", cobertura: "Convenios en todo el territorio nacional para garantizar el servicio donde se necesite." }
];

// ============================================================
// TARJETA CON INCLINACIÓN 3D (efecto tipo carta de colección)
// ============================================================
function TiltCard({ children, className = '' }) {
    const ref = useRef(null);
    const [style, setStyle] = useState({
        transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
    });

    const handleMove = (e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 12;
        const rotateX = ((y / rect.height) - 0.5) * -12;
        setStyle({
            transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`,
        });
    };

    const handleLeave = () => {
        setStyle({ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)' });
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className={className}
            style={{ transition: 'transform 0.25s ease-out', transformStyle: 'preserve-3d', willChange: 'transform', ...style }}
        >
            {children}
        </div>
    );
}

// ============================================================
// FONDOS DISTINTOS PARA EL PANEL IZQUIERDO DEL MODAL, UNO POR PLAN
// (mismos colores de marca, solo cambia el degradado/atmósfera)
// ============================================================
function claseFondoPanel(planId) {
    // Misma familia café/dorado para los cuatro planes: solo cambia el tono,
    // nunca el matiz (nada de morados, verdes o naranjas ajenos a la marca).
    switch (planId) {
        case 'sereno':
            return 'bg-gradient-to-b from-[#5D4E3F] to-[#3f342a]';
        case 'legado':
            return 'bg-gradient-to-b from-[#6b5a46] to-[#4a3f35]';
        case 'tributo':
            return 'bg-gradient-to-b from-[#5D4E3F] to-[#241d18]';
        case 'huella':
            return 'bg-gradient-to-b from-[#8C6A4F] to-[#5D4E3F]';
        default:
            return 'bg-[#5D4E3F]';
    }
}

// Plan en los que la experiencia interactiva es la protagonista y va primero
const EXPERIENCIA_PRIMERO = ['tributo', 'huella'];

// ============================================================
// EFECTOS DE PANTALLA COMPLETA
// Estos se dibujan por encima de TODO el modal (fixed inset-0),
// no solo dentro del cuadro de detalles. Son pointer-events-none
// para no bloquear ningún botón ni interacción del usuario.
// ============================================================

// --- Descanso Sereno: pétalos cayendo por toda la pantalla ---
function FloresPantallaCompleta({ activo }) {
    if (!activo) return null;
    const petalos = Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        dur: 6 + Math.random() * 6,
        delay: Math.random() * 5,
        size: 14 + Math.random() * 12,
    }));
    return (
        <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden">
            {petalos.map((p) => (
                <span
                    key={p.id}
                    className="petalo-cae-full"
                    style={{ left: `${p.left}%`, fontSize: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
                >
                    🌸
                </span>
            ))}
        </div>
    );
}

// --- Última Rumba: CONFETI real cayendo por toda la pantalla ---
function ConfettiPantallaCompleta({ activo }) {
    const [piezas, setPiezas] = useState([]);

    useEffect(() => {
        if (!activo) {
            setPiezas([]);
            return;
        }
        let contador = 0;
        const colores = ['#FFC600', '#A68966', '#8C6A4F', '#C9A876', '#5D4E3F', '#F4EDE6'];

        const spawn = () => {
            const nuevas = Array.from({ length: 8 }).map(() => ({
                id: `${Date.now()}-${contador++}`,
                left: Math.random() * 100,
                color: colores[Math.floor(Math.random() * colores.length)],
                dur: 2.2 + Math.random() * 1.8,
                size: 6 + Math.random() * 7,
            }));
            setPiezas((prev) => [...prev.slice(-80), ...nuevas]);
        };

        spawn();
        const intervalo = setInterval(spawn, 220);
        return () => clearInterval(intervalo);
    }, [activo]);

    if (!activo) return null;

    return (
        <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden">
            {piezas.map((p) => (
                <span
                    key={p.id}
                    className="confeti-full-pieza"
                    style={{
                        left: `${p.left}%`,
                        backgroundColor: p.color,
                        width: p.size,
                        height: p.size * 0.4,
                        animationDuration: `${p.dur}s`,
                    }}
                />
            ))}
        </div>
    );
}

// --- Última Rumba: figuras de luz tipo show, que parpadean y cambian de lugar (simulan la bola disco) ---
function LucesShowPantallaCompleta({ activo }) {
    const [luces, setLuces] = useState([]);

    useEffect(() => {
        if (!activo) {
            setLuces([]);
            return;
        }
        const colores = ['#FFC600', '#A68966', '#8C6A4F', '#C9A876', '#5D4E3F'];
        const generar = () =>
            Array.from({ length: 10 }).map((_, i) => ({
                id: `${Date.now()}-${i}`,
                top: Math.random() * 88,
                left: Math.random() * 88,
                color: colores[Math.floor(Math.random() * colores.length)],
                size: 36 + Math.random() * 56,
            }));

        setLuces(generar());
        const intervalo = setInterval(() => setLuces(generar()), 480);
        return () => clearInterval(intervalo);
    }, [activo]);

    if (!activo) return null;

    return (
        <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden mix-blend-screen">
            {luces.map((l) => (
                <span
                    key={l.id}
                    className="luz-show-full"
                    style={{
                        top: `${l.top}%`,
                        left: `${l.left}%`,
                        width: l.size,
                        height: l.size,
                        backgroundColor: l.color,
                        color: l.color,
                    }}
                />
            ))}
        </div>
    );
}

// --- Legado Eterno: glitch de pantalla completa (transición al cambiar de frase) ---
function GlitchPantallaCompleta({ activo }) {
    if (!activo) return null;
    return (
        <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden">
            <div className="glitch-full-slice glitch-full-slice-1" />
            <div className="glitch-full-slice glitch-full-slice-2" />
            <div className="glitch-full-scanlines" />
        </div>
    );
}

// --- Huella Eterna: camino de huellas que "camina" por toda la pantalla, paso a paso ---
function HuellasPantallaCompleta({ huellas }) {
    if (!huellas.length) return null;
    return (
        <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden">
            {huellas.map((h) => (
                <span
                    key={h.id}
                    className="huella-full"
                    style={{
                        top: `${h.top}%`,
                        left: `${h.left}%`,
                        fontSize: h.size,
                        animationDelay: `${h.delay}s`,
                        transform: `rotate(${h.rot}deg) scaleX(${h.espejo ? -1 : 1})`,
                    }}
                >
                    🐾
                </span>
            ))}
        </div>
    );
}

// ============================================================
// EXPERIENCIAS INTERACTIVAS — una distinta por cada plan
// Cada una avisa al componente padre (Planes) cuándo activar
// el efecto de pantalla completa correspondiente.
// ============================================================

// --- Descanso Sereno: enciende una velita + pétalos cayendo (calma) ---
function VelaInteractiva({ onToggle }) {
    const [encendida, setEncendida] = useState(false);
    const petalos = [
        { left: '8%', dur: '7s', delay: '0s' },
        { left: '28%', dur: '9s', delay: '1.4s' },
        { left: '50%', dur: '8s', delay: '0.6s' },
        { left: '68%', dur: '10s', delay: '2.2s' },
        { left: '86%', dur: '7.5s', delay: '1s' },
    ];

    const alternar = () => {
        const nuevoEstado = !encendida;
        setEncendida(nuevoEstado);
        onToggle?.(nuevoEstado);
    };

    return (
        <div className="mt-6 w-full flex flex-col items-center relative min-h-[130px]">
            {/* pétalos cayendo suavemente dentro del panel: ambientan el descanso */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {petalos.map((p, i) => (
                    <span
                        key={i}
                        className="petalo-cae"
                        style={{ left: p.left, animationDuration: p.dur, animationDelay: p.delay }}
                    >
                        🌸
                    </span>
                ))}
            </div>

            <button
                onClick={alternar}
                className="relative w-16 h-24 flex flex-col items-center justify-end focus:outline-none group z-10"
                aria-label="Encender vela en memoria"
            >
                {encendida && (
                    <>
                        <span className="absolute -top-4 w-10 h-10 rounded-full bg-[#FFC600]/20 blur-xl" />
                        <span className="vela-llama absolute -top-1 w-3 h-5 rounded-full bg-gradient-to-t from-[#FFC600] via-[#FFA500] to-transparent blur-[1px]" />
                    </>
                )}
                <span className="w-1 h-3 bg-[#5D4E3F] -mb-0.5" />
                <span className="w-9 h-16 rounded-t-md rounded-b-sm bg-gradient-to-b from-[#FFFDF6] to-[#EFE6D0] border border-white/10 shadow-inner group-active:scale-95 transition-transform" />
            </button>
            <p className="text-white/70 text-[10px] italic mt-3 text-center px-4 z-10">
                {encendida ? 'Una luz encendida en su memoria.' : 'Toca la vela para encenderla'}
            </p>
        </div>
    );
}

// --- Legado Eterno: mini "registro digital" de frases, estilo panel/terminal ---
const FRASES_LEGADO = [
    '"Su risa sigue viva en cada reunión familiar."',
    '"Nos enseñó que el tiempo se mide en abrazos, no en años."',
    '"Un legado no se entierra, se hereda."',
];

function AlbumRecuerdos({ onAvanzar }) {
    const [idx, setIdx] = useState(0);
    const [glitch, setGlitch] = useState(false);

    const avanzar = (i) => {
        if (i === idx) return;
        setGlitch(true);
        onAvanzar?.();
        setTimeout(() => {
            setIdx(i);
            setGlitch(false);
        }, 160);
    };

    return (
        <div className="mt-6 w-full flex flex-col items-center">
            <div className="relative bg-[#141210] text-[#FFC600] rounded-xl shadow-2xl p-5 w-[220px] border border-[#FFC600]/30 overflow-hidden font-mono">
                {/* esquinas tipo panel/circuito digital */}
                <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FFC600]" />
                <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FFC600]" />
                {/* scanlines sutiles */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, #FFC600 0px, transparent 1px, transparent 3px)' }}
                />
                <p className="text-[8px] uppercase tracking-[3px] opacity-60 mb-2">
                    // registro_{String(idx + 1).padStart(2, '0')}.log
                </p>
                <p
                    className={`text-[11px] leading-relaxed min-h-[70px] transition-all duration-150 ${glitch ? 'opacity-20 translate-x-[3px]' : 'opacity-100 translate-x-0'}`}
                >
                    {FRASES_LEGADO[idx]}
                </p>
                <span className="inline-block w-2 h-3 bg-[#FFC600] align-middle animate-pulse ml-0.5" />
            </div>

            <div className="flex justify-center gap-2 mt-4">
                {FRASES_LEGADO.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => avanzar(i)}
                        className={`h-2 rounded-full transition-all ${i === idx ? 'bg-[#FFC600] w-5' : 'bg-white/30 w-2'}`}
                        aria-label={`Registro ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

// --- Última Rumba: disco ball real en 3D + pista de baile + música + confeti/luces de pantalla completa ---
const BALDOSAS_COLOR = ['#FFC600', '#A68966', '#C9A876', '#FF8A65', '#FFD34E', '#8C6A4F'];

function DiscoBallRumba({ onToggle }) {
    const mountRef = useRef(null);
    const audioRef = useRef(null); // 🎵 referencia al elemento <audio>
    const [bailando, setBailando] = useState(false);
    const [confeti, setConfeti] = useState([]);
    const bailandoRef = useRef(bailando);
    bailandoRef.current = bailando;

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = mount.clientWidth || 160;
        const height = mount.clientHeight || 160;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 4.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);

        const geometry = new THREE.IcosahedronGeometry(1.3, 2);
        const material = new THREE.MeshStandardMaterial({
            color: 0xC9A876,
            metalness: 1,
            roughness: 0.15,
            flatShading: true,
        });
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

        scene.add(new THREE.AmbientLight(0xffffff, 0.35));

        let raf;
        let t = 0;
        const animar = () => {
            t += 0.01;
            const velocidad = bailandoRef.current ? 0.035 : 0.006;
            ball.rotation.y += velocidad;
            ball.rotation.x = Math.sin(t) * 0.05;
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
            // 🎵 evita que la música siga sonando si se cierra el modal
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    const alternarRumba = () => {
        const nuevoEstado = !bailando;
        setBailando(nuevoEstado);
        onToggle?.(nuevoEstado); // 🔊 avisa al padre para prender/apagar confeti y luces en TODA la pantalla

        // 🎵 controla la música según el estado del botón
        if (audioRef.current) {
            if (nuevoEstado) {
                audioRef.current.currentTime = 0;
                audioRef.current.volume = 0.85;
                const promesa = audioRef.current.play();
                if (promesa?.catch) {
                    promesa.catch(() => {
                        // el navegador puede bloquear el autoplay si no hubo un click previo;
                        // como esto se dispara desde onClick, normalmente sí se permite.
                    });
                }
            } else {
                audioRef.current.pause();
            }
        }

        if (nuevoEstado) {
            const piezas = Array.from({ length: 14 }).map((_, i) => ({
                id: Date.now() + i,
                left: Math.random() * 100,
                delay: Math.random() * 0.5,
                emoji: ['🎉', '✨', '🎊'][i % 3],
            }));
            setConfeti(piezas);
            setTimeout(() => setConfeti([]), 1800);
        }
    };

    return (
        <div className="mt-2 w-full flex flex-col items-center relative">
            {/* 🎵 Música de la rumba */}
            <audio ref={audioRef} loop preload="auto">
                <source src="/images/planes/album/tears.mp3" type="audio/mpeg" />
            </audio>

            <div ref={mountRef} className="w-40 h-40 relative z-10" />

            {/* pista de baile: baldosas de colores que se prenden al ritmo */}
            <div className="flex gap-1.5 mt-1">
                {BALDOSAS_COLOR.map((color, i) => (
                    <span
                        key={i}
                        className={`w-5 h-5 rounded-sm ${bailando ? 'baldosa-activa' : 'opacity-40'}`}
                        style={{ backgroundColor: color, animationDelay: `${i * 0.12}s` }}
                    />
                ))}
            </div>

            {/* confeti pequeño local, extra al confeti de pantalla completa */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {confeti.map((c) => (
                    <span key={c.id} className="confeti-pieza" style={{ left: `${c.left}%`, animationDelay: `${c.delay}s` }}>
                        {c.emoji}
                    </span>
                ))}
            </div>

            <button
                onClick={alternarRumba}
                className="mt-3 bg-[#FFC600] text-[#5D4E3F] font-black text-[10px] uppercase tracking-widest px-5 py-2 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
                {bailando ? '🎶 ¡Está que arde!' : '🪩 Poner la rumba'}
            </button>
        </div>
    );
}

// --- Huella Eterna: abejitas y mariposas volando + huellitas al tocar ---
function SelloHuellita({ onHuella }) {
    const [huellas, setHuellas] = useState([]);
    const zonaRef = useRef(null);

    const dejarHuella = (e) => {
        const rect = zonaRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now() + Math.random();
        setHuellas((h) => [...h.slice(-11), { id, x, y, rot: Math.random() * 40 - 20 }]);
        onHuella?.(); // 🐾 avisa al padre para regar huellitas por toda la pantalla
    };

    return (
        <div className="mt-2 w-full">
            <div
                ref={zonaRef}
                onClick={dejarHuella}
                className="relative w-full h-32 rounded-2xl bg-gradient-to-b from-white/10 to-[#C9A876]/10 border border-white/15 overflow-hidden cursor-pointer"
            >
                {/* fauna ambiental: no interfiere con el click de huellitas */}
                <span className="bicho-volador" style={{ animationDuration: '7s' }}>🐝</span>
                <span className="bicho-volador" style={{ animationDuration: '9.5s', animationDelay: '1.2s', top: '55%' }}>🦋</span>

                {huellas.map((h) => (
                    <span
                        key={h.id}
                        className="absolute text-lg animate-fade-in select-none"
                        style={{ left: h.x - 8, top: h.y - 8, transform: `rotate(${h.rot}deg)` }}
                    >
                        🐾
                    </span>
                ))}
                {huellas.length === 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-white/50 text-[10px] italic px-6 text-center">
                        Toca para dejar una huella en su memoria
                    </span>
                )}
            </div>
        </div>
    );
}

function PlanExperience({ planId, onSerenoToggle, onRumbaToggle, onLegadoAvanzar, onHuellaTap }) {
    switch (planId) {
        case 'sereno': return <VelaInteractiva onToggle={onSerenoToggle} />;
        case 'legado': return <AlbumRecuerdos onAvanzar={onLegadoAvanzar} />;
        case 'tributo': return <DiscoBallRumba onToggle={onRumbaToggle} />;
        case 'huella': return <SelloHuellita onHuella={onHuellaTap} />;
        default: return null;
    }
}

// ============================================================
// AMBIENTACIÓN DEL PANEL DE DETALLES — una atmósfera distinta
// por plan, siempre detrás del contenido (pointer-events-none)
// para que nunca estorbe la lectura de la información.
// ============================================================
function AmbientFX({ planId }) {
    if (planId === 'sereno') {
        const velitas = [
            { top: '8%', left: '90%', size: 11, delay: '0s' },
            { top: '24%', left: '4%', size: 9, delay: '0.9s' },
            { top: '42%', left: '95%', size: 10, delay: '1.8s' },
            { top: '58%', left: '3%', size: 8, delay: '2.7s' },
            { top: '76%', left: '92%', size: 11, delay: '3.6s' },
            { top: '92%', left: '10%', size: 9, delay: '4.5s' },
        ];
        return (
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 opacity-60">
                {velitas.map((v, i) => (
                    <span
                        key={i}
                        className="absolute rounded-full vela-secuencial"
                        style={{
                            top: v.top,
                            left: v.left,
                            width: v.size,
                            height: v.size,
                            background: 'radial-gradient(circle, #FFE9A8 0%, #FFC600 45%, transparent 75%)',
                            boxShadow: '0 0 14px 4px rgba(255,198,0,0.35)',
                            animationDelay: v.delay,
                        }}
                    />
                ))}
            </div>
        );
    }

    if (planId === 'legado') {
        return (
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, #5D4E3F 0px, #5D4E3F 1px, transparent 1px, transparent 3px)' }}
                />
                <span className="interferencia-linea" style={{ top: '16%', animationDelay: '0.4s' }} />
                <span className="interferencia-linea" style={{ top: '52%', animationDelay: '2.3s' }} />
                <span className="interferencia-linea" style={{ top: '80%', animationDelay: '4.1s' }} />
            </div>
        );
    }

    if (planId === 'tributo') {
        const luces = [
            { top: '8%', left: '12%', color: '#FFC600', dur: '5s', delay: '0s' },
            { top: '62%', left: '78%', color: '#A68966', dur: '6.2s', delay: '1s' },
            { top: '28%', left: '68%', color: '#8C6A4F', dur: '4.4s', delay: '2s' },
            { top: '78%', left: '18%', color: '#C9A876', dur: '5.6s', delay: '0.6s' },
            { top: '45%', left: '40%', color: '#FFC600', dur: '7s', delay: '1.4s' },
        ];
        return (
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                {luces.map((l, i) => (
                    <span
                        key={i}
                        className="absolute w-40 h-40 rounded-full blur-3xl luz-disco"
                        style={{ top: l.top, left: l.left, backgroundColor: l.color, animationDuration: l.dur, animationDelay: l.delay }}
                    />
                ))}
            </div>
        );
    }

    if (planId === 'huella') {
        const fauna = [
            { emoji: '🦋', top: '8%', dur: '13s', delay: '0s' },
            { emoji: '🐝', top: '38%', dur: '10s', delay: '2s' },
            { emoji: '🐾', top: '58%', dur: '16s', delay: '1s' },
            { emoji: '🐦', top: '78%', dur: '14s', delay: '3.5s' },
            { emoji: '🍃', top: '22%', dur: '11s', delay: '4.5s' },
        ];
        return (
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 opacity-40">
                {fauna.map((f, i) => (
                    <span key={i} className="absolute text-lg fauna-vuelo" style={{ top: f.top, animationDuration: f.dur, animationDelay: f.delay }}>
                        {f.emoji}
                    </span>
                ))}
            </div>
        );
    }

    return null;
}

// ============================================================
// DISTRIBUCIÓN DE LOS DETALLES — cada plan organiza el espacio
// en blanco y sus tarjetas de forma distinta. Solo cambia la
// presentación visual: seccion.cat y seccion.items se muestran
// tal cual vienen de planesData, sin alterar la data.
// ============================================================
// Un único acento café/dorado por plan (misma familia de color, sin mezclas ajenas a la marca)
const ACENTO_POR_PLAN = {
    sereno: '#5D4E3F',
    legado: '#8C6A4F',
    tributo: '#A68966',
    huella: '#6E5A3E',
};

// Ícono discreto por plan, para diferenciar sin recurrir a colores distintos
const ICONO_POR_PLAN = {
    sereno: '🕯️',
    legado: '◈',
    tributo: '✦',
    huella: '🐾',
};

// Tarjeta única, profesional y consistente para los 4 planes.
// Solo cambia el color de acento y el ícono; la estructura es siempre la misma.
function TarjetaDetalle({ seccion, idx, planId, acento, icono }) {
    return (
        <div className="relative bg-white rounded-2xl border border-[#5D4E3F]/10 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <div className="h-1.5 w-full" style={{ backgroundColor: acento }} />
            <div className="p-5 sm:p-6 flex gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-[#5D4E3F]/10 shadow-inner bg-[#F4EDE6]">
                    <img
                        src={`/images/planes/tarjetas/${planId}/imagen_${idx + 1}.jpg`}
                        alt="Visual del servicio"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h4
                        className="font-black uppercase text-[11px] mb-3 tracking-widest flex items-center gap-2"
                        style={{ color: acento }}
                    >
                        <span>{icono}</span>
                        {seccion.cat}
                    </h4>
                    <ul className="space-y-1.5">
                        {seccion.items.map((item, i) => (
                            <li key={i} className="text-[11px] flex items-start gap-2 text-[#5D4E3F] font-medium leading-tight">
                                <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: acento }} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function DetalleSecciones({ planActivo }) {
    const { id, detalles } = planActivo;
    const acento = ACENTO_POR_PLAN[id] || '#5D4E3F';
    const icono = ICONO_POR_PLAN[id] || '◈';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pb-20 relative z-10">
            {detalles.map((seccion, idx) => (
                <TarjetaDetalle key={idx} seccion={seccion} idx={idx} planId={id} acento={acento} icono={icono} />
            ))}
        </div>
    );
}

// --- COMPONENTE NUEVO: SECCIÓN DE OPINIONES (CARRUSEL HORIZONTAL) ---

// Paleta de acentos para variar el color del avatar/borde de cada tarjeta
const ACENTOS = ['#A68966', '#FFC600', '#5D4E3F', '#C9A876'];

function iniciales(nombre) {
    if (!nombre) return '?';
    const partes = nombre.trim().split(' ');
    const primera = partes[0]?.[0] || '';
    const segunda = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primera + segunda).toUpperCase();
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function SeccionOpiniones() {
    const [opiniones, setOpiniones] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        nombre: '',
        mensaje: '',
    });

    const cargarOpiniones = () => {
        fetch('/opiniones')
            .then((res) => res.json())
            .then((data) => setOpiniones(data));
    };

    useEffect(() => {
        cargarOpiniones();
    }, []);

    const enviarOpinion = (e) => {
        e.preventDefault();
        post('/opiniones', {
            onSuccess: () => {
                reset();
                cargarOpiniones();
                setMostrarForm(false);
            },
        });
    };

    return (
        <section className="bg-[#F4EDE6] py-16 sm:py-20 px-4 sm:px-6 border-t border-[#5D4E3F]/10">
            <div className="max-w-6xl mx-auto">
                {/* --- ENCABEZADO --- */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                    <div>
                        <span className="text-[#A68966] text-[10px] font-black uppercase tracking-[3px]">Testimonios</span>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#5D4E3F] italic mt-1">
                            ¿Qué opinan de Mouren?
                        </h2>
                        <p className="text-[#5D4E3F]/60 text-xs mt-2 max-w-md">
                            Historias reales de familias que confiaron en nosotros para honrar a sus seres queridos.
                        </p>
                    </div>
                    <button
                        onClick={() => setMostrarForm(!mostrarForm)}
                        className="shrink-0 bg-[#5D4E3F] hover:bg-[#FFC600] hover:text-[#5D4E3F] text-white font-black px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 w-fit"
                    >
                        {mostrarForm ? '✕ Cerrar' : '✍️ Dejar mi opinión'}
                    </button>
                </div>

                {/* --- FORMULARIO (colapsable) --- */}
                {mostrarForm && (
                    <form
                        onSubmit={enviarOpinion}
                        className="bg-white rounded-[24px] shadow-xl border border-[#5D4E3F]/10 p-6 sm:p-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"
                    >
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                className="w-full border border-[#5D4E3F]/20 rounded-xl p-3 text-sm focus:outline-none focus:border-[#FFC600] focus:ring-2 focus:ring-[#FFC600]/30 transition-all"
                            />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <textarea
                                placeholder="Cuéntanos tu experiencia con nosotros..."
                                value={data.mensaje}
                                onChange={(e) => setData('mensaje', e.target.value)}
                                rows={3}
                                className="w-full border border-[#5D4E3F]/20 rounded-xl p-3 text-sm focus:outline-none focus:border-[#FFC600] focus:ring-2 focus:ring-[#FFC600]/30 transition-all resize-none"
                            />
                            {errors.mensaje && <p className="text-red-500 text-xs mt-1">{errors.mensaje}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="md:col-span-2 justify-self-start bg-[#FFC600] text-[#5D4E3F] font-black px-8 py-3 rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-md active:scale-95"
                        >
                            {processing ? 'Enviando...' : 'Publicar opinión'}
                        </button>
                    </form>
                )}

                {/* --- CARRUSEL HORIZONTAL --- */}
                {opiniones.length === 0 ? (
                    <p className="text-center text-[#5D4E3F]/50 text-xs italic py-10">
                        Aún no hay opiniones. ¡Sé el primero en compartir la tuya!
                    </p>
                ) : (
                    <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory custom-scrollbar-h -mx-4 px-4 sm:mx-0 sm:px-0">
                        {opiniones.map((op, idx) => {
                            const acento = ACENTOS[idx % ACENTOS.length];
                            return (
                                <div
                                    key={op.id}
                                    className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-white rounded-[24px] shadow-lg border border-[#5D4E3F]/10 p-6 flex flex-col hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                                    style={{ borderTop: `4px solid ${acento}` }}
                                >
                                    {/* Comilla decorativa */}
                                    <span
                                        className="text-5xl font-black leading-none mb-2 select-none"
                                        style={{ color: acento, opacity: 0.25 }}
                                    >
                                        "
                                    </span>

                                    <p className="text-[#5D4E3F] text-sm leading-relaxed italic flex-1 mb-6">
                                        {op.mensaje}
                                    </p>

                                    <div className="flex items-center gap-3 pt-4 border-t border-[#F4EDE6]">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0"
                                            style={{ backgroundColor: acento }}
                                        >
                                            {iniciales(op.nombre)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-[#5D4E3F] text-sm truncate">{op.nombre}</p>
                                            {op.created_at && (
                                                <p className="text-[#5D4E3F]/40 text-[10px]">{formatearFecha(op.created_at)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar-h::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar-h::-webkit-scrollbar-track {
                    background: #ffffff80;
                    border-radius: 10px;
                }
                .custom-scrollbar-h::-webkit-scrollbar-thumb {
                    background: #A68966;
                    border-radius: 10px;
                }
                .custom-scrollbar-h::-webkit-scrollbar-thumb:hover {
                    background: #5D4E3F;
                }
            `}</style>
        </section>
    );
}
// --- FIN COMPONENTE NUEVO ---

export default function Planes() {
    const [planActivo, setPlanActivo] = useState(null);

    // 🎆 Estados que controlan los efectos de PANTALLA COMPLETA (no solo el cuadro de detalles)
    const [efectoFlores, setEfectoFlores] = useState(false);
    const [efectoDisco, setEfectoDisco] = useState(false);
    const [efectoGlitch, setEfectoGlitch] = useState(false);
    const [huellasPantalla, setHuellasPantalla] = useState([]);
    const legadoAudioRef = useRef(null);

    // Al cambiar de plan o cerrar el modal, apagamos todos los efectos activos
    useEffect(() => {
        setEfectoFlores(false);
        setEfectoDisco(false);
        setEfectoGlitch(false);
        setHuellasPantalla([]);
    }, [planActivo]);

    // 🎵 Música/cita de fondo de Legado Eterno: suena mientras el modal de ese plan esté abierto
    useEffect(() => {
        const audio = legadoAudioRef.current;
        if (!audio) return;

        if (planActivo?.id === 'legado') {
            audio.currentTime = 0;
            audio.volume = 0.5;
            const promesa = audio.play();
            if (promesa?.catch) promesa.catch(() => {});
        } else {
            audio.pause();
            audio.currentTime = 0;
        }
    }, [planActivo]);

    const dispararGlitch = () => {
        setEfectoGlitch(true);
        setTimeout(() => setEfectoGlitch(false), 420);
    };

    const dispararHuellas = () => {
        // Simula un caminito real: punto de partida al azar, dirección al azar,
        // pasos que alternan de lado (como pisadas) y van apareciendo uno a uno.
        const pasos = 9;
        const inicioTop = 12 + Math.random() * 55;
        const inicioLeft = Math.random() < 0.5 ? 2 + Math.random() * 15 : 70 + Math.random() * 15;
        const direccion = inicioLeft < 50 ? 1 : -1;
        const ondulacion = Math.random() < 0.5 ? 1 : -1;

        const nuevas = Array.from({ length: pasos }).map((_, i) => {
            const top = Math.min(92, Math.max(6, inicioTop + Math.sin(i * 0.9) * 6 * ondulacion));
            const left = Math.min(94, Math.max(3, inicioLeft + direccion * i * (7 + Math.random() * 2)));
            return {
                id: `${Date.now()}-${i}`,
                top,
                left,
                rot: direccion * 22 * (i % 2 === 0 ? 1 : -1) + (Math.random() * 8 - 4),
                espejo: i % 2 === 0,
                size: 20 + i * 1.2,
                delay: i * 0.16,
            };
        });

        setHuellasPantalla((prev) => [...prev, ...nuevas]);
        setTimeout(() => {
            setHuellasPantalla((prev) => prev.filter((h) => !nuevas.some((n) => n.id === h.id)));
        }, pasos * 160 + 2600);
    };

    const scrollToPlanes = () => {
        document.getElementById('seccion-planes').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#F4EDE6] font-['Hepta_Slab'] relative overflow-x-hidden flex flex-col text-[#5D4E3F]">
            <Head title="Nuestros Planes - Mouren" />
            <Navbar />

            {/* --- SECCIÓN 1: BANNER --- */}
            <section className="relative min-h-screen h-screen flex flex-col justify-center items-center">
                <div className="absolute inset-0 z-0">
                    <img src="/images/planes/fondo_animado_planes.gif" className="w-full h-full object-cover" alt="Fondo" />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center px-5 sm:px-8 md:px-10 mt-20 animate-fade-in">
                    <h1 className="text-[24px] sm:text-[30px] md:text-[40px] font-bold text-white drop-shadow-[0_8px_15px_rgba(0,0,0,0.8)] leading-tight mb-4  tracking-tighter">
                        Nuestros Planes Y Servicios
                    </h1>
                    <p className="text-white text-base sm:text-lg md:text-xl drop-shadow-lg mb-8 max-w-2xl font-light italic opacity-90">
                        Acompañamos el ciclo de la vida con respeto, dignidad y amor, brindando soluciones integrales para humanos y mascotas en sus momentos más delicados.
                    </p>
                    {/* Botón más pequeño y con nuevo texto */}
                    <button onClick={scrollToPlanes} className="bg-[#FFC600] text-[#5D4E3F] px-8 py-3 text-sm font-black rounded-full shadow-2xl hover:scale-105 transition-all tracking-[2px]">
                        Descubrir ahora
                    </button>
                </div>
            </section>

            {/* --- NUEVA SECCIÓN: TEXTO Y TABLA DE SERVICIOS --- */}
            <section className="py-14 sm:py-20 px-4 sm:px-6 bg-white/40">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-10 sm:mb-12 text-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#A68966] mb-4">Un Compromiso de Corazón</h2>
                        <p className="text-[#5D4E3F] max-w-3xl mx-auto text-xs leading-relaxed italic">
                            En Mouren, entendemos que cada despedida es única. Por eso, hemos consolidado una base de servicios generales de alta calidad que se incluyen en cada uno de nuestros planes, asegurando que la dignidad y el profesionalismo sean el estándar de nuestra atención.
                        </p>
                    </div>

                    <div className="bg-white rounded-[20px] sm:rounded-[30px] shadow-xl border border-[#5D4E3F]/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[480px] text-left text-[10px] md:text-xs">
                                <thead className="bg-[#5D4E3F] text-white tracking-wider">
                                    <tr>
                                        <th className="p-4 font-bold">Servicio Incluido</th>
                                        <th className="p-4 font-bold">Especificación de Cobertura Integral</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviciosGenerales.map((item, i) => (
                                        <tr key={i} className="border-b border-[#F4EDE6] hover:bg-[#FFC600]/5 transition-colors">
                                            <td className="p-3 font-black text-[#A68966] italic">{item.servicio}</td>
                                            <td className="p-3 text-[#5D4E3F] leading-tight">{item.cobertura}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN 2: TARJETAS --- */}
            <section id="seccion-planes" className="relative z-20 pt-16 pb-40 px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
                    {planesData.map((plan) => (
                        <TiltCard key={plan.id} className="rounded-[25px]">
                            <div className="bg-[#4a3f35] rounded-[25px] p-5 shadow-2xl border-b-8 border-[#A68966] flex flex-col items-center group hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-shadow duration-500">
                                {/* Imagen Arreglada: Contenedor con altura fija y object-contain */}
                                <div className="w-full h-40 bg-[#5D4E3F] rounded-2xl p-4 mb-4 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden">
                                    <img src={plan.mouri} alt="Plan" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                                </div>

                                <h3 className="text-white text-lg font-bold mb-1 italic">{plan.titulo}</h3>
                                <div className="bg-[#A68966] text-white text-[8px] font-bold px-3 py-1 rounded-full mb-5 tracking-widest ">
                                    {plan.tipoNombre}
                                </div>

                                <div className="w-full bg-black/20 rounded-xl p-3 text-white text-[10px] mb-6 space-y-2">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                        <span className="opacity-70 italic font-light tracking-tight">Valor inversión</span>
                                        <span className="font-bold text-[#FFC600] text-sm">
                                            ${plan.precioIndividual.toLocaleString()}
                                            <span className="text-[8px] opacity-60">/{plan.unidad === 'persona' ? 'p' : 'm'}</span>
                                        </span>
                                    </div>
                                    <p className="text-center opacity-85 italic text-[10px] leading-tight h-12 flex items-center justify-center">
                                        {plan.enfoque}
                                    </p>
                                </div>

                                <button onClick={() => setPlanActivo(plan)} className="w-full bg-[#F4EDE6] hover:bg-[#FFC600] text-[#5D4E3F] font-black py-2.5 rounded-lg transition-all text-[9px] tracking-wider shadow-lg  mb-2 active:scale-95">
                                    🔍 Ver especificaciones
                                </button>

                                <button className="w-full bg-[#A68966] hover:bg-white hover:text-[#5D4E3F] text-white font-black py-2.5 rounded-lg transition-all text-[9px] tracking-wider shadow-lg  active:scale-95">
                                    ✍️ Iniciar afiliación
                                </button>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </section>

            {/* --- MODAL MEJORADO --- */}
            {planActivo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-[#F4EDE6]/90 backdrop-blur-md animate-fade-in">

                    {/* 🎆 Efectos de PANTALLA COMPLETA: van por encima de todo el modal, no solo del cuadro */}
                    <FloresPantallaCompleta activo={efectoFlores} />
                    <ConfettiPantallaCompleta activo={efectoDisco} />
                    <LucesShowPantallaCompleta activo={efectoDisco} />
                    <GlitchPantallaCompleta activo={efectoGlitch} />
                    <HuellasPantallaCompleta huellas={huellasPantalla} />

                    {/* 🎵 Cita/canción de fondo de Legado Eterno */}
                    <audio ref={legadoAudioRef} loop preload="auto">
                        <source src="/audio/planes/legado_cita.mp3" type="audio/mpeg" />
                    </audio>

                    <div className="bg-white w-full max-w-6xl h-[92vh] sm:h-[85vh] overflow-hidden rounded-[22px] sm:rounded-[32px] md:rounded-[40px] shadow-3xl relative border-4 sm:border-6 md:border-8 border-[#5D4E3F] flex flex-col md:flex-row animate-scale-up">

                        <button onClick={() => setPlanActivo(null)} className="absolute top-2 right-3 sm:top-4 sm:right-6 text-3xl sm:text-4xl md:text-5xl font-light hover:text-red-500 z-[110] transition-transform hover:rotate-90">&times;</button>

                        {/* Panel izquierdo: fondo y distribución distintos según el plan */}
                        <div className={`md:w-1/3 shrink-0 ${claseFondoPanel(planActivo.id)} p-5 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center overflow-y-auto`}>

                            {EXPERIENCIA_PRIMERO.includes(planActivo.id) && (
                                <PlanExperience
                                    planId={planActivo.id}
                                    onSerenoToggle={setEfectoFlores}
                                    onRumbaToggle={setEfectoDisco}
                                    onLegadoAvanzar={dispararGlitch}
                                    onHuellaTap={dispararHuellas}
                                />
                            )}

                            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex items-center justify-center mb-4 md:mb-6 mt-4">
                                <img src={planActivo.mouri} alt="Plan" className="max-w-full max-h-full object-contain drop-shadow-xl animate-float" />
                            </div>
                            <h2 className="text-white text-xl sm:text-2xl font-black italic mb-2  tracking-tighter">{planActivo.titulo}</h2>
                            <div className="bg-[#FFC600] text-[#5D4E3F] px-5 py-1 rounded-full font-bold text-xs mb-6 uppercase">
                                {planActivo.tipoNombre}
                            </div>
                            <p className="text-white/60 italic text-xs leading-relaxed px-4">{planActivo.enfoque}</p>

                            {!EXPERIENCIA_PRIMERO.includes(planActivo.id) && (
                                <PlanExperience
                                    planId={planActivo.id}
                                    onSerenoToggle={setEfectoFlores}
                                    onRumbaToggle={setEfectoDisco}
                                    onLegadoAvanzar={dispararGlitch}
                                    onHuellaTap={dispararHuellas}
                                />
                            )}
                        </div>

                        <div className="md:w-2/3 flex-1 min-h-0 p-5 sm:p-7 md:p-10 overflow-y-auto custom-scrollbar relative bg-white">
                            {/* Ambientación de fondo propia del plan: nunca tapa la info, va detrás (z-0) */}
                            <AmbientFX planId={planActivo.id} />

                            <div className="mb-8 border-b-2 pb-4 relative z-10 border-[#F4EDE6]">
                                <h3 className="text-xl sm:text-2xl font-black mb-1 italic text-[#5D4E3F]">Detalles Técnicos y Coberturas</h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#A68966]">Inversión Individual: ${planActivo.precioIndividual.toLocaleString()} COP</p>
                            </div>

                            <div className="mb-10 grid grid-cols-3 sm:grid-cols-5 gap-2 text-center relative z-10">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div
                                        key={n}
                                        className="p-3 rounded-2xl shadow-sm hover:border-[#FFC600] transition-all group border-2 bg-[#F4EDE6] border-[#5D4E3F]/5"
                                    >
                                        <p className="text-[9px] font-bold text-[#A68966] group-hover:text-[#5D4E3F]">{n} {planActivo.unidad === 'persona' ? 'Pers.' : 'Masc.'}</p>
                                        <p className="font-bold text-[10px] text-[#5D4E3F]">${(planActivo.precioIndividual * n).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Distribución y estilo de tarjetas distintos por cada plan (misma data, misma lógica) */}
                            <DetalleSecciones planActivo={planActivo} />
                        </div>

                        {/* --- BOTÓN DE CONTACTO FLOTANTE --- */}
                        <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 flex flex-col items-center group z-[120]">
                            <div className="w-14 h-14 bg-[#FFC600] border-2 border-[#FFC600] rounded-full flex items-center justify-center shadow-2xl hover:rotate-6 hover:scale-110 transition-all cursor-pointer">
                                <img src="/images/planes/tarjetas/mouri_sac.png" alt="SAC" className="w-10 h-10 object-contain" />
                            </div>
                            <span className="text-[8px] font-black text-[#5D4E3F] uppercase text-center mt-2 leading-tight bg-white px-2 py-1 rounded-lg border border-[#FFC600]/20 shadow-md group-hover:bg-[#FFC600] transition-colors">
                                ¿Dudas? Habla<br />con un asesor
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <MusicAlbum />
            {/* --- SECCIÓN DE VIDEO Y GUÍA DE DUELO --- */}
            <section className="bg-[#F4EDE6] flex flex-col md:flex-row items-stretch overflow-hidden border-[#A68966]/20 h-auto md:h-[600px]">

                {/* LADO IZQUIERDO: MOURI EN EL PARQUE (GIF COMO FONDO COMPLETO CON CAPA NEGRA Y DIFUSIÓN) */}
                <div className="md:w-1/2 relative bg-[#E9DCC9] flex items-center justify-center min-h-[280px] sm:min-h-[350px] md:min-h-full overflow-hidden">

                    {/* El GIF ocupando todo el ancho y alto disponible */}
                    <img
                        src="/images/planes/mouri_sentando.gif"
                        alt="Mouri en el parque"
                        className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                    />

                    {/* NUEVA CAPA NEGRA UNIFORME CON EFECTO DE DIFUSIÓN (BACKDROP-BLUR) */}
                    {/* Usamos bg-black con una opacidad y un efecto de desenfoque de fondo para lograr la difusión. */}
                    <div className="absolute inset-0 bg-black/40 z-10 backdrop-blur-sm" />

                    {/* Fondo sutil de textura (opcional, ahora por encima de la capa negra si se quiere integrar) */}
                    <div className="absolute inset-0 opacity-10 z-20" style={{ backgroundImage: 'radial-gradient(#5D4E3F 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    {/* Adorno visual de estrella/brillo - ajustado para que sea visible */}
                    <div className="absolute bottom-6 right-6 text-white md:text-[#FFC600] opacity-70 text-2xl z-20">✦</div>
                </div>

                {/* LADO DERECHO: CONTENIDO Y VIDEO (SE MANTIENE LA MISMA ALTURA) */}
                <div className="md:w-1/2 bg-[#5D4E3F] p-6 sm:p-8 md:p-20 flex flex-col justify-center text-white z-20 h-auto md:h-full">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-6 tracking-tighter leading-tight">
                        Espacio para un video
                    </h2>

                    <p className="text-sm md:text-base opacity-80 mb-10 font-light leading-relaxed max-w-lg">
                        Acompañamos tu proceso con material educativo y momentos de reflexión.
                        Nuestros videos están diseñados para brindarte serenidad y las herramientas
                        necesarias para honrar la memoria de quienes siempre vivirán en nuestro corazón.
                    </p>

                    {/* CONTENEDOR DEL VIDEO (Proporción 16:9, compacto) */}
                    <div className="relative w-full aspect-video bg-white/10 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl mb-10 group">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/TU_ID_DE_VIDEO"
                            title="Video informativo Mouren"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    {/* ENLACE DE DESCARGA PDF */}
                    <a
                        href="/downloads/guia_duelo_mouren.pdf"
                        download
                        className="flex items-center gap-3 text-[#FFC600] font-black uppercase tracking-[3px] text-xs hover:gap-5 transition-all group w-fit"
                    >
                        <span className="border-b-2 border-[#FFC600] pb-1 group-hover:border-white transition-colors">
                            Descargar guía de duelo (PDF)
                        </span>
                        <span className="text-lg">→</span>
                    </a>
                </div>
            </section>

            <RecuerdosCarousel />

            {/* --- SECCIÓN DE OPINIONES (NUEVA) --- */}
            <SeccionOpiniones />

            <div className="mt-14 sm:mt-32">
                <Footer />
            </div>

            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-scale-up {
                    animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes velaFlicker {
                    0%, 100% { transform: scaleY(1) scaleX(1) translateY(0); opacity: 0.95; }
                    25% { transform: scaleY(1.1) scaleX(0.9) translateY(-1px); opacity: 1; }
                    50% { transform: scaleY(0.95) scaleX(1.05) translateY(1px); opacity: 0.85; }
                    75% { transform: scaleY(1.05) scaleX(0.95) translateY(-0.5px); opacity: 1; }
                }
                .vela-llama {
                    animation: velaFlicker 0.6s ease-in-out infinite;
                }

                /* --- Descanso Sereno: pétalos (dentro del panel, versión pequeña) --- */
                .petalo-cae {
                    position: absolute;
                    top: -10%;
                    font-size: 14px;
                    opacity: 0;
                    animation-name: petaloCaida;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
                @keyframes petaloCaida {
                    0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.9; }
                    50% { transform: translateY(60px) translateX(10px) rotate(120deg); }
                    90% { opacity: 0.7; }
                    100% { transform: translateY(130px) translateX(-6px) rotate(240deg); opacity: 0; }
                }

                /* --- Descanso Sereno: pétalos de PANTALLA COMPLETA --- */
                .petalo-cae-full {
                    position: fixed;
                    top: -8%;
                    opacity: 0;
                    animation-name: petaloCaidaFull;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
                @keyframes petaloCaidaFull {
                    0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.9; }
                    50% { transform: translateY(50vh) translateX(20px) rotate(150deg); }
                    90% { opacity: 0.7; }
                    100% { transform: translateY(108vh) translateX(-15px) rotate(300deg); opacity: 0; }
                }

                /* --- Última Rumba: baldosas y confeti local pequeño (dentro del panel) --- */
                .baldosa-activa {
                    animation: baldosaBrillo 0.7s ease-in-out infinite alternate;
                }
                @keyframes baldosaBrillo {
                    from { opacity: 0.45; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1.18); }
                }
                .confeti-pieza {
                    position: absolute;
                    top: -5%;
                    font-size: 14px;
                    animation: confetiCae 1.7s ease-in forwards;
                }
                @keyframes confetiCae {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(140px) rotate(200deg); opacity: 0; }
                }

                /* --- Última Rumba: CONFETI real de PANTALLA COMPLETA --- */
                .confeti-full-pieza {
                    position: fixed;
                    top: -5%;
                    border-radius: 2px;
                    opacity: 1;
                    animation-name: confetiFullCae;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                }
                @keyframes confetiFullCae {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(112vh) rotate(560deg); opacity: 0; }
                }

                /* --- Última Rumba: figuras de luz tipo show que parpadean y cambian de lugar --- */
                .luz-show-full {
                    position: absolute;
                    border-radius: 9999px;
                    opacity: 0;
                    animation: luzShowParpadeo 0.5s ease-out forwards;
                    box-shadow: 0 0 30px 10px currentColor;
                }
                @keyframes luzShowParpadeo {
                    0% { opacity: 0; transform: scale(0.3); }
                    35% { opacity: 1; transform: scale(1.15); }
                    100% { opacity: 0; transform: scale(0.85); }
                }

                /* --- Huella Eterna: fauna voladora (dentro del panel) --- */
                .bicho-volador {
                    position: absolute;
                    top: 20%;
                    left: 0;
                    font-size: 15px;
                    animation-name: vueloLibre;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
                @keyframes vueloLibre {
                    0% { left: 0%; top: 20%; }
                    25% { left: 30%; top: 65%; }
                    50% { left: 60%; top: 15%; }
                    75% { left: 85%; top: 55%; }
                    100% { left: 0%; top: 20%; }
                }

                /* --- Huella Eterna: camino de huellas de PANTALLA COMPLETA --- */
                .huella-full {
                    position: fixed;
                    opacity: 0;
                    filter: drop-shadow(0 3px 6px rgba(93, 78, 63, 0.45)) sepia(0.15);
                    animation: huellaFullAparece 2.2s ease-out forwards;
                }
                @keyframes huellaFullAparece {
                    0% { opacity: 0; transform: scale(0.3); }
                    18% { opacity: 0.95; transform: scale(1.1); }
                    30% { transform: scale(0.98); }
                    78% { opacity: 0.8; }
                    100% { opacity: 0; transform: scale(0.9); }
                }

                /* --- Legado Eterno: glitch de PANTALLA COMPLETA --- */
                .glitch-full-slice {
                    position: fixed;
                    left: 0;
                    width: 100%;
                    height: 12%;
                    background: rgba(255, 198, 0, 0.15);
                    mix-blend-mode: screen;
                    animation: glitchFullMover 0.42s steps(2, end);
                }
                .glitch-full-slice-1 {
                    top: 20%;
                    animation-delay: 0s;
                    background: rgba(255, 0, 60, 0.12);
                }
                .glitch-full-slice-2 {
                    top: 60%;
                    animation-delay: 0.08s;
                    background: rgba(0, 200, 255, 0.12);
                }
                @keyframes glitchFullMover {
                    0% { transform: translateX(0); opacity: 0; }
                    20% { transform: translateX(-18px); opacity: 1; }
                    40% { transform: translateX(14px); opacity: 0.8; }
                    60% { transform: translateX(-8px); opacity: 1; }
                    100% { transform: translateX(0); opacity: 0; }
                }
                .glitch-full-scanlines {
                    position: fixed;
                    inset: 0;
                    opacity: 0.5;
                    background-image: repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, transparent 1px, transparent 3px);
                    animation: glitchFullFade 0.42s ease-out forwards;
                }
                @keyframes glitchFullFade {
                    0% { opacity: 0.7; }
                    100% { opacity: 0; }
                }

                /* --- Ambientación del panel de detalles --- */
                .vela-secuencial {
                    opacity: 0;
                    animation-name: velaSecuencialEncendido;
                    animation-duration: 6s;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
                @keyframes velaSecuencialEncendido {
                    0% { opacity: 0; transform: scale(0.5); }
                    6% { opacity: 1; transform: scale(1.2); }
                    10% { opacity: 0.8; transform: scale(0.95); }
                    30% { opacity: 0.95; transform: scale(1.05); }
                    50% { opacity: 0.75; transform: scale(0.92); }
                    70% { opacity: 0.9; transform: scale(1.08); }
                    90% { opacity: 0.82; transform: scale(0.97); }
                    100% { opacity: 0.88; transform: scale(1); }
                }

                .interferencia-linea {
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(255,198,0,0.45), transparent);
                    animation: interferenciaGlitch 6s ease-in-out infinite;
                    opacity: 0;
                }
                @keyframes interferenciaGlitch {
                    0%, 92%, 100% { opacity: 0; transform: translateX(0) scaleY(1); }
                    93% { opacity: 0.85; transform: translateX(-6px) scaleY(3); }
                    94% { opacity: 0.4; transform: translateX(8px) scaleY(1); }
                    96% { opacity: 0.7; transform: translateX(-3px) scaleY(2); }
                    97% { opacity: 0; }
                }

                .luz-disco {
                    animation-name: luzDiscoMover;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                    opacity: 0.3;
                }
                @keyframes luzDiscoMover {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.18; }
                    50% { transform: translate(30px, -20px) scale(1.35); opacity: 0.5; }
                }

                .fauna-vuelo {
                    position: absolute;
                    animation-name: faunaRecorrido;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
                @keyframes faunaRecorrido {
                    0% { left: -5%; transform: translateY(0); }
                    50% { left: 50%; transform: translateY(-14px); }
                    100% { left: 105%; transform: translateY(0); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .animate-float, .animate-fade-in, .animate-scale-up, .vela-llama,
                    .petalo-cae, .petalo-cae-full, .baldosa-activa, .confeti-pieza,
                    .confeti-full-pieza, .luz-show-full, .bicho-volador, .huella-full,
                    .glitch-full-slice, .glitch-full-scanlines,
                    .interferencia-linea, .luz-disco, .fauna-vuelo,
                    .vela-secuencial { animation: none !important; }
                    .vela-secuencial { opacity: 0.85; }
                }
            `}</style>
        </div>
    );
}

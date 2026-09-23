import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Head, usePage, Link, router } from '@inertiajs/react';
import Sidebar from './Sidebar';

// 🆕 Bola disco 3D de verdad (mismo motor Three.js que ya usa Inscribir.jsx
// para Última Rumba), en versión chiquita y siempre girando — puramente
// decorativa, no necesita botones ni estado.
function BolaDisco3DMiniPlan({ size = 48 }) {
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

        // 🆕 Antes estas dos luces daban toda la vuelta a la bola muy rápido
        // (t*2 y t*1.5 por frame). Como la bola tiene caras planas y
        // metálicas (flatShading), cada vez que una luz pasaba rozando una
        // cara se veía un destello brusco de encendido/apagado — eso era el
        // "parpadeo" que quedaba, aunque el rayo de color de atrás ya no
        // parpadeara. Bajamos la velocidad con la que giran las luces para
        // que el brillo se deslice suave por la bola en vez de destellar.
        const luz1 = new THREE.PointLight(0xFFC600, 2.4, 10);
        luz1.position.set(2, 2, 2);
        scene.add(luz1);
        const luz2 = new THREE.PointLight(0xA68966, 1.6, 10);
        luz2.position.set(-2, -1, 2);
        scene.add(luz2);
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        let raf; let t = 0;
        const animar = () => {
            t += 0.01;
            ball.rotation.y += 0.022;
            ball.rotation.x = Math.sin(t) * 0.06;
            luz1.position.x = Math.sin(t * 0.7) * 2.5;
            luz1.position.z = Math.cos(t * 0.7) * 2.5;
            luz2.position.x = Math.cos(t * 0.55) * 2.5;
            luz2.position.z = Math.sin(t * 0.55) * 2.5;
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

// 🆕 Mismo tema visual por plan que ya usa Inscribir.jsx (mismos colores,
// mismo ícono, mismo "motivo" decorativo), para que Mi Plan se sienta parte
// de la misma personalización que el cliente eligió. Solo aplica al plan
// HUMANO (Descanso Sereno / Legado Eterno / Última Rumba) — el plan de
// mascota conserva su propio estilo tal cual, sin ningún cambio.
const TEMAS_PLAN = {
    1: { color: '#5D4E3F', colorSuave: '#8C6A4F', icono: '🕯️', nombre: 'sereno', motivo: 'flores' },
    2: { color: '#8C6A4F', colorSuave: '#A68966', icono: '◈', nombre: 'legado', motivo: 'tecnologia' },
    3: { color: '#A68966', colorSuave: '#5D4E3F', icono: '✦', nombre: 'rumba', motivo: 'disco' },
};

// 🆕 Efectos decorativos pequeños, uno por tema — velitas para Descanso
// Sereno, lucecitas LED para Legado Eterno, luces de disco para Última
// Rumba. Puramente visual (pointer-events-none, z-0): va DETRÁS de todo
// el contenido de la tarjeta hero, nunca tapa ni estorba ningún botón.
function DecoracionMiniTema({ tema }) {
    if (!tema) return null;

    if (tema.motivo === 'flores') {
        const velitas = [
            { top: '10%', left: '92%' }, { top: '60%', left: '4%' }, { top: '85%', left: '88%' },
        ];
        return (
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                {velitas.map((v, i) => (
                    <span
                        key={i}
                        className="absolute rounded-full mini-velita-plan"
                        style={{
                            top: v.top, left: v.left, width: 10, height: 10,
                            background: 'radial-gradient(circle, #FFE9A8 0%, #FFC600 45%, transparent 75%)',
                            boxShadow: '0 0 12px 4px rgba(255,198,0,0.45)',
                            animationDelay: `${i * 0.8}s`,
                        }}
                    />
                ))}
            </div>
        );
    }

    if (tema.motivo === 'tecnologia') {
        return (
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, #FFFFFF 0px, #FFFFFF 1.5px, transparent 1.5px, transparent 4px)' }}
                />
                <div className="absolute top-4 right-4 flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full mini-led-plan" style={{ backgroundColor: tema.color, animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 rounded-full mini-led-plan" style={{ backgroundColor: '#FFC600', animationDelay: '0.45s' }} />
                    <span className="w-1.5 h-1.5 rounded-full mini-led-plan" style={{ backgroundColor: tema.colorSuave, animationDelay: '0.9s' }} />
                </div>
            </div>
        );
    }

    if (tema.motivo === 'disco') {
        // 🆕 Antes eran varias luces circulares prendiéndose y apagándose
        // (parpadeo). Ahora es una sola franja larga de colores que se
        // desliza suave de un lado a otro, sin parpadear — más parecida a
        // un rayo real de luz de disco. La bola disco 3D sigue igual.
        return (
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                <span className="mini-rayo-disco-plan" />
                <div className="absolute bottom-2 left-2 opacity-90 drop-shadow-lg">
                    <BolaDisco3DMiniPlan size={44} />
                </div>
            </div>
        );
    }

    return null;
}

export default function MiPlan({
    planHumano = null,
    planMascota = null
}) {
    const { auth, flash } = usePage().props;
    const usuario = auth?.user || {};

    // --- ESTADOS PARA LA MÚSICA Y EL FONDO DINÁMICO ---
    const [reproduciendo, setReproduciendo] = useState(false);
    const audioRef = useRef(null);
    const [mostrarBienvenida, setMostrarBienvenida] = useState(false);

    useEffect(() => {
        if (flash?.activado) {
            setMostrarBienvenida(true);
            const timer = setTimeout(() => setMostrarBienvenida(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // --- ESTADOS DE INTERFAZ DUAL (HUMANO / MASCOTA) ---
    const [modoMascota, setModoMascota] = useState(false);
    const [verModalMascota, setVerModalMascota] = useState(false);
    const tienePlanHumano = planHumano && planHumano.id;
    const tienePlanMascota = planMascota && planMascota.id;
    const tieneAmbos = tienePlanHumano && tienePlanMascota;

    const suscripcion =
        modoMascota
            ? planMascota
            : (planHumano || planMascota);

    // Verificaciones de estado del plan
    const tienePlanMascotaContratado = !!planMascota;

    // Modo de visualización de la tarjeta de beneficiarios
    const mostrandoMascotas = (!planHumano && planMascota) || modoMascota;

    // 🆕 Tema visual del plan humano activo (solo cuando NO estamos viendo
    // la línea de mascotas). Si no hay plan humano o estamos en modo
    // mascota, queda en null y todo se ve exactamente como antes.
    const temaPlan = (!mostrandoMascotas && planHumano?.plan?.id) ? TEMAS_PLAN[planHumano.plan.id] : null;

    // 1. CAPTURA DEL OBJETO CANCIÓN
    const cancionObjeto = suscripcion?.cancion_tributo || suscripcion?.cancion;

    // 2. OBTENER EL NOMBRE REAL DEL ARCHIVO
    const nombreArchivo = cancionObjeto?.archivo_audio || "";

    // 3. CONSTRUCCIÓN DE LA RUTA RELATIVA
    const urlCancion = nombreArchivo
        ? `/images/planes/album/${nombreArchivo}`
        : "";

    // 4. TITULO DE LA CANCIÓN
    const nombreCancion = cancionObjeto?.titulo ||
        suscripcion?.afiliados?.[0]?.servicio_funerario?.cancion?.titulo ||
        'Melodía por definir';

    const controlarMusica = () => {
        if (!nombreArchivo) {
            alert("No hay un archivo de audio asignado a esta canción aún en la base de datos.");
            return;
        }

        if (reproduciendo) {
            audioRef.current.pause();
            setReproduciendo(false);
        } else {
            audioRef.current.play().catch(error => {
                console.error("Error al intentar reproducir el archivo:", error);
                alert("No se pudo cargar el archivo. Verifica que exista en public/images/planes/album/");
            });
            setReproduciendo(true);
        }
    };

    const alTerminarCancion = () => {
        setReproduciendo(false);
    };

    const nombreParaMostrar =
        usuario.nombre1 ||
        (usuario.nombre ? usuario.nombre.split(' ')[0] : null) ||
        usuario.name ||
        "Usuario";

    // --- HELPERS SOLO VISUALES (no alteran los datos, solo eligen un ícono/color) ---
    const iconoParentesco = (parentesco = '') => {
        const p = parentesco.toLowerCase();
        if (p.includes('hij')) return '👶';
        if (p.includes('esp') || p.includes('pareja') || p.includes('conyug')) return '💍';
        if (p.includes('padre') || p.includes('madre') || p.includes('papá') || p.includes('mamá')) return '👴';
        if (p.includes('herman')) return '🧑‍🤝‍🧑';
        if (p.includes('abuel')) return '🧓';
        return '🌼';
    };

    const iconoEspecie = (especie = '') => {
        const e = especie.toLowerCase();
        if (e.includes('perr')) return '🐕';
        if (e.includes('gat')) return '🐈';
        if (e.includes('ave') || e.includes('pájaro') || e.includes('pajaro')) return '🐦';
        if (e.includes('conej')) return '🐇';
        return '🐾';
    };

    const acentos = ['#FFBD2E', '#A68966', '#8C6F4F', '#FFD97D'];

    return (
        <div className={`min-h-screen font-['Hepta_Slab'] text-[#5D4E3F] dark:text-[#EDE4D3] flex flex-col md:flex-row overflow-x-hidden transition-all duration-1000 ${reproduciendo
            ? 'bg-gradient-to-br from-[#4A3B2C] via-[#A68966] via-[#F5C453] to-[#8C6F4F] bg-[length:300%300%] animate-gradient-bg text-white'
            : 'bg-[#FFFFFF] dark:bg-[#221D17]'
            }`}>
            <Head title="Mi Plan - Mouren" />

            {urlCancion && (
                <audio
                    ref={audioRef}
                    src={urlCancion}
                    onEnded={alTerminarCancion}
                />
            )}

            <Sidebar />

            <main className="flex-1 w-full min-w-0 p-4 sm:p-6 md:p-10 content-shift transition-all duration-700 ease-in-out">

                <header className="flex flex-wrap justify-between items-start gap-4 mb-6 md:mb-8 animate-fade-in">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter leading-tight break-words">
                            Nos alegra verte,
                            <span className={reproduciendo ? 'text-[#FFD97D]' : 'text-[#A68966]'}> {nombreParaMostrar}</span>
                        </h1>
                        <p className="text-[10px] sm:text-[11px] italic opacity-70 mt-1">"Para que descanses mejor que en vida"</p>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto">
                    <h2 className="text-base sm:text-lg font-bold mb-4 italic border-b pb-2">
                        {mostrandoMascotas ? 'Mi Plan Huella Eterna:' : 'Mi Plan Funerario:'}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* ================= COLUMNA IZQUIERDA (2/3): HERO + BENEFICIARIOS ================= */}
                        <div className="lg:col-span-2 flex flex-col gap-5">

                            {/* --- HERO: tarjeta compacta del plan --- */}
                            <div
                                className={`relative overflow-hidden rounded-[26px] shadow-lg transition-all duration-500 min-h-[250px] ${suscripcion
                                    ? (reproduciendo
                                        ? 'bg-[#362A1F]/90 text-white'
                                        : 'bg-[#5D4E3F] text-white')
                                    : 'bg-[#CDC2AD] dark:bg-[#3A322A] text-[#5D4E3F] dark:text-[#EDE4D3]'
                                    }`}
                            >

                                {/* 🆕 Efectos del tema del plan, detrás de todo */}
                                <DecoracionMiniTema tema={temaPlan} />

                                {suscripcion && planHumano && (
                                    <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
                                        {!tienePlanMascotaContratado && (
                                            <span className="hidden sm:inline-block bg-[#FFBD2E] text-[#362A1F] text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                                                ¡Mascotas!
                                            </span>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (tieneAmbos) {
                                                    setModoMascota(!modoMascota);
                                                } else if (tienePlanHumano && !tienePlanMascota) {
                                                    setVerModalMascota(true);
                                                } else if (tienePlanMascota && !tienePlanHumano) {
                                                    router.visit('/planes-disponibles');
                                                }
                                            }}
                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md border hover:scale-110 transition-all ${modoMascota
                                                ? 'bg-white text-[#5D4E3F] border-white'
                                                : 'bg-[#362A1F]/40 text-[#FFBD2E] border-white/20 hover:bg-[#362A1F]'
                                                }`}
                                            title={
                                                tieneAmbos
                                                    ? "Alternar Modo Mascota"
                                                    : tienePlanHumano
                                                        ? "Inscribirse a Huella Eterna"
                                                        : "Ir al catálogo"
                                            }
                                        >
                                            🐾
                                        </button>
                                    </div>
                                )}

                                {verModalMascota && (
                                    <div className="absolute inset-0 bg-[#362A1F]/95 z-40 p-6 flex flex-col justify-center items-center text-center animate-fade-in rounded-[26px]">
                                        <span className="text-3xl mb-2 animate-bounce">🐾</span>
                                        <h4 className="text-sm font-black text-[#FFBD2E] uppercase tracking-widest mb-1">Plan Huella Eterna</h4>
                                        <p className="text-[10px] opacity-80 max-w-[220px] leading-relaxed mb-4 italic text-white">
                                            No dejes desprotegidos a tus consentidos de 4 patas. Asegura su despedida con el amor que merecen.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-2 w-full px-4">
                                            <Link
                                                href="/mi-plan-mascota"
                                                className="flex-1 py-2 bg-[#FFBD2E] text-[#362A1F] font-bold text-[9px] uppercase tracking-wider rounded-xl text-center hover:scale-105 transition"
                                            >
                                                Adquirir
                                            </Link>
                                            <button
                                                onClick={() => setVerModalMascota(false)}
                                                className="px-3 py-2 bg-white/10 text-white font-bold text-[9px] uppercase tracking-wider rounded-xl hover:bg-white/20"
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-stretch">

                                    {/* Texto del plan */}
                                    <div className="flex-1 p-8 flex flex-col justify-center h-full relative min-w-0 overflow-hidden">

                                        {/* Flor decorativa detrás del nombre y la cuota, en la esquina e invertida */}
                                        {suscripcion && (
                                            <img
                                                src="/images/elementos_dashboard/flores-esquina-bottom.png"
                                                alt=""
                                                aria-hidden="true"
                                                className={`absolute -bottom-8 -left-8 sm:-bottom-4 sm:-left-10 w-32 sm:w-40 opacity-20 pointer-events-none scale-x-[-1] z-0 transition-all ${reproduciendo ? 'brightness-125 contrast-125 opacity-30' : ''}`}
                                            />
                                        )}

                                        <div className="relative z-10">
                                            <p className={`text-[9px] uppercase tracking-[2px] font-bold mb-1.5 italic ${suscripcion ? (reproduciendo ? 'text-[#FFD97D]' : 'text-white/80') : 'opacity-60'}`}>
                                                {modoMascota ? 'Línea Mascotas' : (suscripcion ? 'Estado: Activo' : 'Primeros Pasos')}
                                            </p>

                                            <h2 className="text-lg sm:text-xl font-black tracking-tight mb-3 break-words pr-6">
                                                {modoMascota
                                                    ? 'Huella Eterna 🐾'
                                                    : (planHumano
                                                        ? <>{temaPlan && <span className="mr-1">{temaPlan.icono}</span>}{planHumano.plan?.nombre}</>
                                                        : (planMascota
                                                            ? planMascota.plan?.nombre
                                                            : 'Inscríbete a un plan'
                                                        )
                                                    )
                                                }
                                            </h2>

                                            {suscripcion ? (
                                                <>
                                                    <p className="text-[10px] uppercase opacity-70 font-bold tracking-wider">
                                                        {modoMascota ? 'Tu suscripción Huella Eterna es' : 'La cuota de tu plan es'}
                                                    </p>
                                                    <p className="text-2xl sm:text-3xl font-black text-[#FFBD2E] mb-4">
                                                        ${Number(suscripcion?.cuota_mensual || 0).toLocaleString()}
                                                        <span className="text-xs font-bold opacity-70">/mes</span>
                                                    </p>

                                                    <Link
                                                        href={modoMascota ? "/detalles-mascota" : "/detalles"}
                                                        className={`inline-flex w-fit items-center gap-2 py-2.5 px-5 rounded-full font-bold text-[10px] transition-all shadow-md active:scale-95 uppercase tracking-widest ${reproduciendo ? 'bg-[#A68966] text-white hover:bg-[#8C6F4F]' : 'bg-[#302A1D] text-white hover:bg-[#4A3E32]'}`}
                                                    >
                                                        Ver Detalles ▸
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-[10px] opacity-70 mb-4 leading-relaxed max-w-[220px]">
                                                        Elige tu plan y registra a tus beneficiarios para activar tu protección.
                                                    </p>
                                                    <Link
                                                        href="/planes-disponibles"
                                                        className="inline-flex w-fit items-center gap-2 py-2.5 px-5 bg-[#5D4E3F] text-white hover:bg-[#4A3E32] rounded-full font-bold text-[10px] transition-all shadow-md active:scale-95 uppercase tracking-widest"
                                                    >
                                                        Inscribirme ▸
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ilustración / personajes: uno para modo claro y otro para modo oscuro */}
                                    <div
                                        className={`relative w-full sm:w-[38%] h-full min-h-[250px] flex items-center justify-center overflow-visible ${reproduciendo ? 'bg-[#2B2216]/50' : 'bg-black/10'
                                            }`}
                                    >
                                        {suscripcion ? (
                                            <>
                                                {/* 👉 Personaje para modo claro (cámbialo por tu ilustración) */}
                                                <img
                                                    src="/images/elementos_dashboard/mouri_dia.webp"
                                                    alt="Personaje"
                                                    className={`block dark:hidden w-full h-full object-contain p-0 ml-[-180px] transition-all ${reproduciendo ? 'brightness-125 contrast-125' : ''}`}
                                                />
                                                {/* 👉 Personaje para modo oscuro (cámbialo por tu ilustración) */}
                                                <img
                                                    src="/images/elementos_dashboard/mouri_noche.webp"
                                                    alt="Personaje"
                                                    className={`hidden dark:block w-full h-full object-contain p-0 ml-[-210px] transition-all ${reproduciendo ? 'brightness-125 contrast-125' : ''}`}
                                                />
                                            </>
                                        ) : (
                                            <span className="text-4xl opacity-50">🕊️</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* --- BENEFICIARIOS: fila de tarjetas compactas --- */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xs sm:text-sm font-black italic">
                                        {mostrandoMascotas ? 'Patitas Protegidas 🐾' : 'Beneficiarios Humanos 🌼'}
                                    </h3>
                                    <span className="text-[10px] opacity-50 font-bold uppercase tracking-wide">
                                        {mostrandoMascotas
                                            ? (planMascota?.mascotas?.length || 0)
                                            : (planHumano?.afiliados?.length || 0)} vinculado(s)
                                    </span>
                                </div>

                                {suscripcion ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {mostrandoMascotas ? (
                                            planMascota?.mascotas?.length > 0 ? (
                                                planMascota.mascotas.map((pet, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`relative overflow-hidden flex items-center gap-4 p-4 sm:p-5 rounded-[24px] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${reproduciendo ? 'bg-white/10 border-white/20 text-white' : 'bg-[#D3CAB6] dark:bg-[#3A322A] border-white/20 text-[#5D4E3F] dark:text-[#EDE4D3]'}`}
                                                    >
                                                        {/* blob decorativo */}
                                                        <div
                                                            className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-25 pointer-events-none"
                                                            style={{ backgroundColor: acentos[idx % acentos.length] }}
                                                        />

                                                        <div className="relative shrink-0">
                                                            <div
                                                                className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-md ring-4 ring-white/30 bg-gradient-to-br from-[#5D4E3F] to-[#8C6F4F] text-white transition-transform duration-300 group-hover:scale-110"
                                                            >
                                                                {iconoEspecie(pet.especie?.nombre)}
                                                            </div>
                                                            <span
                                                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-sm border-2 border-white/80"
                                                                style={{ backgroundColor: acentos[idx % acentos.length] }}
                                                                title="Vinculado"
                                                            >
                                                                ✓
                                                            </span>
                                                        </div>

                                                        <div className="relative z-10 min-w-0 text-left flex-1">
                                                            <p className="text-sm sm:text-base font-black truncate">{pet.nombre}</p>
                                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                                <span className={`text-[9px] font-bold italic px-2 py-0.5 rounded-full ${reproduciendo ? 'bg-white/15 text-[#FFD97D]' : 'bg-white/60 text-[#8C6F4F]'}`}>
                                                                    {pet.especie?.nombre || 'Mascota'}
                                                                </span>
                                                                <span className={`text-[9px] font-bold italic px-2 py-0.5 rounded-full ${reproduciendo ? 'bg-white/15 text-[#FFD97D]' : 'bg-white/60 text-[#8C6F4F]'}`}>
                                                                    {pet.raza?.nombre || 'Sin raza'}
                                                                </span>
                                                            </div>
                                                            <p className="text-[9px] uppercase tracking-widest opacity-50 font-bold mt-2">Huella Eterna 🐾</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] opacity-50 italic col-span-full">No tienes mascotas vinculadas.</p>
                                            )
                                        ) : (
                                            planHumano?.afiliados?.length > 0 ? (
                                                planHumano.afiliados.map((afi, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`relative overflow-hidden flex items-center gap-4 p-4 sm:p-5 rounded-[24px] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${reproduciendo ? 'bg-white/10 border-white/20 text-white' : 'bg-[#D3CAB6] dark:bg-[#3A322A] border-white/20 text-[#5D4E3F] dark:text-[#EDE4D3]'}`}
                                                    >
                                                        {/* blob decorativo */}
                                                        <div
                                                            className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-25 pointer-events-none"
                                                            style={{ backgroundColor: acentos[idx % acentos.length] }}
                                                        />

                                                        <div className="relative shrink-0">
                                                            <div className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full flex items-center justify-center text-lg sm:text-xl font-black shadow-md ring-4 ring-white/30 bg-gradient-to-br from-[#5D4E3F] to-[#8C6F4F] text-white">
                                                                {afi.nombre?.[0]?.toUpperCase() || '?'}
                                                            </div>
                                                            <span
                                                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm border-2 border-white/80"
                                                                style={{ backgroundColor: acentos[idx % acentos.length] }}
                                                                title="Vinculado"
                                                            >
                                                                {iconoParentesco(afi.parentesco)}
                                                            </span>
                                                        </div>

                                                        <div className="relative z-10 min-w-0 text-left flex-1">
                                                            <p className="text-sm sm:text-base font-black truncate">{afi.nombre}</p>
                                                            <span className={`inline-block text-[9px] font-bold italic px-2 py-0.5 rounded-full mt-1.5 ${reproduciendo ? 'bg-white/15 text-[#FFD97D]' : 'bg-white/60 text-[#8C6F4F]'}`}>
                                                                {afi.parentesco}
                                                            </span>
                                                            <p className="text-[9px] uppercase tracking-widest opacity-50 font-bold mt-2">Beneficiario vinculado 🌼</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] opacity-50 italic col-span-full">No tienes afiliados vinculados.</p>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-[#5D4E3F] text-white rounded-2xl p-5 flex items-center gap-4">
                                        <div className="w-11 h-11 shrink-0 bg-white/10 rounded-full flex items-center justify-center text-xl">🛡️</div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] italic text-[#F4EDE6]">Sin Protección</h4>
                                            <p className="text-[10px] opacity-60 text-[#F4EDE6]">Se activará al elegir un plan.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ================= COLUMNA DERECHA (1/3): RESUMEN + TRIBUTO ================= */}
                        <div className="flex flex-col gap-5">

                            {/* --- Resumen rápido del plan --- */}
                            <div className={`rounded-[26px] p-5 shadow-md transition-all duration-500 ${reproduciendo ? 'bg-white/10 border border-white/20 text-white backdrop-blur-md' : 'bg-[#D3CAB6] dark:bg-[#3A322A] text-[#5D4E3F] dark:text-[#EDE4D3]'}`}>
                                <h4 className="text-xs sm:text-sm font-black italic mb-3 border-b border-black/10 dark:border-white/10 pb-2">
                                    Resumen de tu plan
                                </h4>

                                <div className="space-y-2.5">
                                    <div className={`flex items-center gap-3 p-2.5 rounded-xl ${reproduciendo ? 'bg-white/10' : 'bg-white/50 dark:bg-black/20'}`}>
                                        <span className="w-8 h-8 shrink-0 rounded-lg bg-[#5D4E3F] text-white flex items-center justify-center text-sm">✅</span>
                                        <div className="min-w-0">
                                            <p className="text-[9px] uppercase opacity-60 font-bold tracking-wide">Estado</p>
                                            <p className="text-[11px] font-bold truncate">{suscripcion ? 'Activo' : 'Sin protección'}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-3 p-2.5 rounded-xl ${reproduciendo ? 'bg-white/10' : 'bg-white/50 dark:bg-black/20'}`}>
                                        <span className="w-8 h-8 shrink-0 rounded-lg bg-[#A68966] text-white flex items-center justify-center text-sm">📋</span>
                                        <div className="min-w-0">
                                            <p className="text-[9px] uppercase opacity-60 font-bold tracking-wide">Cobertura</p>
                                            <p className="text-[11px] font-bold truncate">
                                                {modoMascota ? 'Protección Vitalicia' : (suscripcion?.fecha_inicio || 'Pendiente')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-3 p-2.5 rounded-xl ${reproduciendo ? 'bg-white/10' : 'bg-white/50 dark:bg-black/20'}`}>
                                        <span className="w-8 h-8 shrink-0 rounded-lg bg-[#FFBD2E] text-[#362A1F] flex items-center justify-center text-sm">🐾</span>
                                        <div className="min-w-0">
                                            <p className="text-[9px] uppercase opacity-60 font-bold tracking-wide">Línea Mascotas</p>
                                            <p className="text-[11px] font-bold truncate">
                                                {tienePlanMascotaContratado ? 'Contratada' : 'No contratada'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- Tributo musical (estilo tarjeta de app destacada) --- */}
                            <div
                                className={`rounded-[26px] overflow-hidden shadow-xl flex-1 flex flex-col transition-all duration-500 ${reproduciendo ? 'bg-[#362A1F] text-white' : 'bg-[#5D4E3F] text-white'}`}
                                style={temaPlan ? { borderTop: `3px solid ${temaPlan.color}` } : undefined}
                            >
                                <div className="relative h-28 sm:h-32 shrink-0">
                                    {/* 👉 Cambia este src por la portada/imagen de tu tributo musical */}
                                    <img
                                        src="/images/elementos_dashboard/flores-esquina-top.png"
                                        alt=""
                                        className={`w-full h-full object-cover transition-all ${reproduciendo ? 'brightness-125 contrast-125' : 'opacity-90'}`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#302A1D]/90 to-transparent" />
                                    <button
                                        onClick={controlarMusica}
                                        className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-sm border border-white/10 active:scale-90 transition-all ${reproduciendo ? 'bg-[#FFBD2E] text-[#5D4E3F] scale-110' : 'bg-white/90 text-[#5D4E3F] hover:scale-110'}`}
                                        title={reproduciendo ? "Pausar tributo" : "Escuchar tributo"}
                                    >
                                        {reproduciendo ? '⏸️' : '▶️'}
                                    </button>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <span className={`inline-block w-fit px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider mb-2 ${reproduciendo ? 'bg-[#FFBD2E] text-[#362A1F]' : 'bg-white/15 text-[#FFBD2E]'}`}>
                                        {reproduciendo ? 'Sonando en vivo 🎵' : 'Tributo Musical'}
                                    </span>

                                    <h4 className="text-sm font-black italic truncate mb-1">
                                        {suscripcion ? nombreCancion : 'Aún no tienes tributo'}
                                    </h4>
                                    <p className="text-[10px] opacity-60 leading-relaxed mb-4">
                                        {suscripcion
                                            ? 'La melodía elegida para acompañar tu memoria.'
                                            : 'Se asignará una vez actives tu plan.'}
                                    </p>

                                    <button
                                        onClick={controlarMusica}
                                        disabled={!suscripcion}
                                        className={`mt-auto py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${reproduciendo ? 'bg-[#FFBD2E] text-[#362A1F]' : 'bg-white/15 hover:bg-white/25 text-white'}`}
                                    >
                                        {reproduciendo ? 'Pausar tributo' : 'Escuchar tributo'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {mostrarBienvenida && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#5D4E3F]/90 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white dark:bg-[#2E2720] p-6 sm:p-10 rounded-[32px] sm:rounded-[50px] text-center shadow-2xl max-w-sm w-full">
                        <img
                            src="/images/elementos_dashboard/inscripcion_planes/welcome.png"
                            className="w-28 h-28 sm:w-40 sm:h-40 mx-auto mb-4"
                            alt="¡Bienvenido!"
                        />
                        <h2 className="text-lg sm:text-xl font-black text-[#5D4E3F] italic">
                            ¡Tu protección está activa!
                        </h2>
                    </div>
                </div>
            )}

            <style>{`
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ffdeb6; border-radius: 10px; }
                main::-webkit-scrollbar { width: 5px; }
                main::-webkit-scrollbar-thumb { background: #080602; border-radius: 10px; }

                .animate-gradient-bg {
                    background-size: 300% 300%;
                    animation: gradientMovement 8s ease-in-out infinite;
                }
                @keyframes gradientMovement {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                /* 🆕 Efectos del tema por plan (mini personalización) */
                @keyframes miniVelitaPlanParpadea {
                    0%, 100% { opacity: 0.55; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.25); }
                }
                .mini-velita-plan { animation: miniVelitaPlanParpadea 2.2s ease-in-out infinite; }
                @keyframes miniLedPlanParpadea {
                    0%, 100% { opacity: 0.25; }
                    50% { opacity: 1; }
                }
                .mini-led-plan { animation: miniLedPlanParpadea 1.6s ease-in-out infinite; }
                /* 🆕 Rayo largo de colores para Última Rumba — se desliza
                   suave de un lado a otro, con opacidad SIEMPRE fija (sin
                   parpadeo, tal como pediste). */
                .mini-rayo-disco-plan {
                    position: absolute;
                    top: 38%;
                    left: -30%;
                    width: 160%;
                    height: 46px;
                    background: linear-gradient(90deg, transparent 0%, #FFC600 20%, #C9A876 40%, #A68966 60%, #8C6A4F 80%, transparent 100%);
                    opacity: 0.3;
                    filter: blur(10px);
                    transform: rotate(-14deg) translateX(-6%);
                    animation: miniRayoDiscoPlanDesliza 7s ease-in-out infinite alternate;
                }
                @keyframes miniRayoDiscoPlanDesliza {
                    0% { transform: rotate(-14deg) translateX(-6%); }
                    100% { transform: rotate(-14deg) translateX(6%); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .mini-velita-plan, .mini-led-plan, .mini-rayo-disco-plan { animation: none !important; }
                }
            `}</style>
        </div>
    );
}

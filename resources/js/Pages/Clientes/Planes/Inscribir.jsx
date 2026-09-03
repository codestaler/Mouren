import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Sidebar from '@/Pages/Clientes/Sidebar';
import { BotonTutorial } from './TutorialAnimacionModal';
import {
    Trash2, Plus, Play, Pause, Sparkles, ShieldCheck, Gem, Search, X, Music
} from 'lucide-react';

// --- Hook: anima un número hacia su nuevo valor (efecto "conteo") ---
function useCountUp(target, duration = 600) {
    const [display, setDisplay] = useState(target);
    const prevRef = useRef(target);

    useEffect(() => {
        const start = prevRef.current;
        const diff = target - start;
        if (diff === 0) {
            setDisplay(target);
            return;
        }
        let startTime = null;
        let raf;
        const step = (ts) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(start + diff * eased));
            if (progress < 1) {
                raf = requestAnimationFrame(step);
            } else {
                prevRef.current = target;
            }
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);

    return display;
}

// --- Mouri: un cuervo que acompaña, con una pose distinta por cada paso, mismo estilo/colores ---
// Vive flotando (no ocupa espacio del layout). "active" hace que baile/bata alas
// más rápido y le salgan notas musicales (cuando hay música sonando).
// "variant" (1-4) decide qué personaje se dibuja para ese paso del formulario.
function PajaroMouri({ active, size = 'normal', variant = 1 }) {
    const dims = size === 'small' ? 'w-11 h-11' : 'w-16 h-16 sm:w-20 sm:h-20';

    return (
        <div className={`relative ${dims} select-none shrink-0`}>
            <div className={`mouri-conductor w-full h-full ${active ? 'active' : ''}`}>
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">

                    {/* ===== PASO 1: cuervo con su polluelo — "tus protegidos" ===== */}
                    {variant === 1 && (
                        <>
                            <path d="M28 70 Q10 66 8 52 Q22 56 30 66 Z" fill="#1A1A1D" />
                            <ellipse cx="50" cy="62" rx="26" ry="24" fill="#2B2B2E" />
                            <ellipse cx="50" cy="68" rx="15" ry="14" fill="#4A4A4F" />
                            <path className="mouri-wing" d="M44 58 Q28 54 24 70 Q38 72 48 64 Z" fill="#1A1A1D" />
                            <circle cx="58" cy="36" r="18" fill="#2B2B2E" />
                            <path d="M54 20 Q58 8 64 19 Q60 16 56 22 Z" fill="#1A1A1D" />
                            <circle cx="63" cy="34" r="2.6" fill="#0D0D0F" />
                            <path d="M74 36 L86 32 L74 42 Z" fill="#5D4E3F" />
                            {/* polluelo pequeño, apoyado en el ala */}
                            <circle cx="26" cy="76" r="9" fill="#6B6B70" />
                            <circle cx="23" cy="74" r="1.6" fill="#0D0D0F" />
                            <path d="M31 76 L37 74 L31 79 Z" fill="#5D4E3F" />
                        </>
                    )}

                    {/* ===== PASO 2: cuervo director de orquesta — "música" ===== */}
                    {variant === 2 && (
                        <>
                            <path d="M28 66 Q10 62 8 48 Q22 52 30 62 Z" fill="#1A1A1D" />
                            <ellipse cx="52" cy="60" rx="26" ry="24" fill="#2B2B2E" />
                            <ellipse cx="52" cy="66" rx="15" ry="14" fill="#4A4A4F" />
                            <path className="mouri-wing" d="M46 56 Q30 52 26 68 Q40 70 50 62 Z" fill="#1A1A1D" />
                            <circle cx="60" cy="34" r="18" fill="#2B2B2E" />
                            <path d="M56 18 Q60 6 66 17 Q62 14 58 20 Z" fill="#1A1A1D" />
                            <circle cx="65" cy="32" r="2.6" fill="#0D0D0F" />
                            <path d="M76 34 L88 30 L76 40 Z" fill="#5D4E3F" />
                            <g className="mouri-baton">
                                <line x1="58" y1="80" x2="78" y2="60" stroke="#5D4E3F" strokeWidth="3" strokeLinecap="round" />
                                <circle cx="79" cy="58" r="2.5" fill="#5D4E3F" />
                            </g>
                        </>
                    )}

                    {/* ===== PASO 3: cuervo con un recuerdo — "objetos de memoria" ===== */}
                    {variant === 3 && (
                        <>
                            <path d="M28 68 Q10 64 8 50 Q22 54 30 64 Z" fill="#1A1A1D" />
                            <ellipse cx="50" cy="60" rx="27" ry="25" fill="#2B2B2E" />
                            <ellipse cx="50" cy="66" rx="16" ry="14" fill="#4A4A4F" />
                            <path className="mouri-wing" d="M44 56 Q28 52 24 68 Q38 70 48 62 Z" fill="#1A1A1D" />
                            <circle cx="58" cy="34" r="18" fill="#2B2B2E" />
                            {/* penachito de plumas en la cabeza, típico del cuervo */}
                            <path d="M52 18 Q56 10 60 18 Z" fill="#1A1A1D" />
                            <circle cx="63" cy="32" r="2.6" fill="#0D0D0F" />
                            <path d="M74 34 L88 30 L74 40 Z" fill="#5D4E3F" />
                            {/* sostiene con el pico un pequeño corazón-recuerdo */}
                            <path d="M84 33 Q80 28 76 32 Q78 30 78 30 Q78 30 80 30 Q84 28 84 33 Z" fill="#E3A857" />
                        </>
                    )}

                    {/* ===== PASO 4: cuervo protector con escarapela — "confirmar" ===== */}
                    {variant === 4 && (
                        <>
                            <path d="M28 70 Q10 66 8 52 Q22 56 30 66 Z" fill="#1A1A1D" />
                            <ellipse cx="50" cy="62" rx="26" ry="24" fill="#2B2B2E" />
                            <ellipse cx="50" cy="68" rx="15" ry="14" fill="#4A4A4F" />
                            <path className="mouri-wing" d="M44 58 Q28 54 24 70 Q38 72 48 64 Z" fill="#1A1A1D" />
                            <circle cx="58" cy="36" r="18" fill="#2B2B2E" />
                            <path d="M54 20 Q58 8 64 19 Q60 16 56 22 Z" fill="#1A1A1D" />
                            <circle cx="63" cy="34" r="2.6" fill="#0D0D0F" />
                            <path d="M74 36 L86 32 L74 42 Z" fill="#5D4E3F" />
                            {/* escarapela / escudito de protección en el pecho */}
                            <circle cx="50" cy="68" r="7" fill="#2B2B2E" />
                            <path d="M46 66 L49 70 L55 63" stroke="#4A4A4F" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </>
                    )}
                </svg>
            </div>

            {active && (
                <>
                    <span className="mouri-note" style={{ left: '-2px', top: '8px', animationDelay: '0s' }}>♪</span>
                    <span className="mouri-note" style={{ left: '48px', top: '-4px', animationDelay: '0.5s' }}>♫</span>
                    <span className="mouri-note" style={{ left: '20px', top: '-10px', animationDelay: '1s' }}>♪</span>
                </>
            )}
        </div>
    );
}

export default function Inscribir({ plan = {}, servicios = [], recuerdos = [], canciones = [], generos = [], tiposDocumento = [] }) {
    const { auth } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [paso, setPaso] = useState(1);
    const [aceptoTerminos, setAceptoTerminos] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [afiliadoAbierto, setAfiliadoAbierto] = useState(0); // índice del que está expandido
    const [erroresAfiliados, setErroresAfiliados] = useState({}); // { indice: { campo: 'mensaje' } }
    const [playingId, setPlayingId] = useState(null);
    const audioRef = useRef(null);

    // --- Ventana emergente del pájaro Mouri (reemplaza la burbuja fija que ocupaba espacio) ---
    const [showTipModal, setShowTipModal] = useState(false);
    const [hayTipNuevo, setHayTipNuevo] = useState(true); // punto pulsante para avisar que hay un consejo nuevo

    const pasos = ['Protegidos', 'Música', 'Recuerdos', 'Confirmar'];

    const tipsPorPaso = {
        1: 'Argg, estás incluido automáticamente como titular de la protección. Agrega a tus seres queridos.',
        2: 'Oh, you can\u2019t read my poker face! La música y los servicios extra hacen que el homenaje sea único.',
        3: 'Cada protegido elige su propio objeto de memoria, Argg.',
        4: 'Lee con atención el compromiso. Estamos aquí para cuidarte, Argg.',
    };

    // Cada vez que cambia el paso, avisamos con el puntito (sin abrir la ventana sola, para no ser invasivos)
    useEffect(() => {
        setHayTipNuevo(true);
    }, [paso]);

    // --- DETERMINAR EL NOMBRE REAL DEL TITULAR ---
    // Respaldo dinámico por si cambias el nombre en la base de datos (name, nombre o nombre1)
    const nombreTitular = auth?.user?.nombre1 || auth?.user?.nombre || auth?.user?.name || '';

    // --- LÓGICA DE AFILIADO TITULAR AUTOMÁTICO ---
    const FRAMES_TUTORIAL_INSCRIPCION = [
        {
            imagen: "/images/elementos_dashboard/inscripcion_planes/tutorial/1.gif",
            tiempo: "Paso 1",
            etiqueta: "Titular",
            nota: "Ya apareces registrado automáticamente como titular del plan.",
            destacado: false,
        },
        {
            imagen: "/images/elementos_dashboard/inscripcion_planes/tutorial/2.gif",
            tiempo: "Paso 2",
            etiqueta: "Agregar familiar",
            nota: "Puedes añadir hasta cinco personas protegidas cada persona, cada uno aumenta el costo en base al valor del plan.",
            destacado: true,
        },
        {
            imagen: "/images/elementos_dashboard/inscripcion_planes/tutorial/3.gif",
            tiempo: "Paso 3",
            etiqueta: "Completar datos",
            nota: "Todos los campos son obligatorios para validar la afiliación asegurate de escribir correctamente la cedula de tus afiliados y so nombre.",
            destacado: false,
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        usuario_id: auth?.user?.id,
        plan_id: plan?.id || null,
        cancion_id: '',
        afiliados: [
            {
                nombre: nombreTitular,
                parentesco: 'Titular',
                cancion_id: '',
                recuerdo_id: '', // <-- cada afiliado ahora trae su propio recuerdo
                genero_id: auth?.user?.genero_id || '',
                tipo_documento_id: auth?.user?.tipo_documento_id || '',
                cedula: auth?.user?.cedula || '',
                fecha_nacimiento: auth?.user?.fecha_nacimiento || ''
            }
        ],
        servicios_adicionales: [],
    });

    const aplicarCancionATodos = (id) => {
        setData('afiliados', data.afiliados.map(a => ({ ...a, cancion_id: id })));
    };

    // --- LÓGICA DE CÁLCULO ---
    const MAX_PERSONAS = 5;
    // 🆕 Detecta si este plan es de mascota o humano (misma regla que usa el backend: plan_id === 4)
    const tipoPlanActual = plan?.id === 4 ? 'mascota' : 'humano';
    const numPersonasActuales = data.afiliados.length;

    // Cambia esto en tu código:
    const totalCalculado = useMemo(() => {
        if (!plan || !plan.cuota_base) return 0;

        const base = parseFloat(plan.cuota_base);
        const numPersonas = data.afiliados.length;

        const extraServicios = data.servicios_adicionales.reduce((acc, id) => {
            const s = servicios.find(srv => srv.id === id);
            return acc + (s ? parseFloat(s.precio) : 0);
        }, 0);

        // Cada afiliado suma el precio de SU PROPIO recuerdo
        const extraRecuerdos = data.afiliados.reduce((acc, a) => {
            const r = recuerdos.find(rec => rec.id === a.recuerdo_id);
            return acc + (r ? parseFloat(r.precio_adicional) : 0);
        }, 0);

        return (base * numPersonas) + extraServicios + extraRecuerdos;
    }, [
        data.afiliados.length, // <- IMPORTANTE: usa .length
        JSON.stringify(data.servicios_adicionales), // <- FORZAMOS RE-CALCULO
        JSON.stringify(data.afiliados.map(a => a.recuerdo_id)), // <- recalcula si cambia el recuerdo de cualquiera
        plan?.id // <- Dependencia del ID del plan
    ]);

    const totalAnimado = useCountUp(totalCalculado);

    // 🆕 Servicios disponibles para agregar en el paso 2: excluye los que ya vienen
    // incluidos en el plan base, filtra por tipo de plan (humano/mascota/ambos) y
    // por el texto de búsqueda que escriba el usuario.
    const [busquedaServicio, setBusquedaServicio] = useState('');
    const [servicioInfo, setServicioInfo] = useState(null); // servicio seleccionado para ver su ficha en ventana emergente

    const serviciosDisponiblesPaso2 = useMemo(() => {
        let lista = servicios || [];

        lista = lista.filter(s => !plan.servicios?.some(ps => Number(ps.id) === Number(s.id)));
        lista = lista.filter(s => !s.aplica_a || s.aplica_a === 'ambos' || s.aplica_a === tipoPlanActual);

        if (busquedaServicio.trim()) {
            const q = busquedaServicio.trim().toLowerCase();
            lista = lista.filter(s => s.nombre.toLowerCase().includes(q));
        }

        return lista;
    }, [servicios, plan.servicios, tipoPlanActual, busquedaServicio]);


    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return null;
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    // --- VALIDACIONES ---
    const validarPaso = () => {
        if (paso === 1) {
            if (data.afiliados.some(a => !a.nombre || !a.parentesco)) {
                return alert("Mouri dice: No dejes campos vacíos. Cada protegido necesita su nombre y vínculo.");
            }

            const nuevosErrores = {};
            let primerErrorIndex = null;

            data.afiliados.forEach((a, i) => {
                if (i === 0) return; // el Titular no se valida aquí, sus datos son de solo lectura

                const camposFaltantes = {};
                if (!a.genero_id) camposFaltantes.genero_id = 'Selecciona un género';
                if (!a.tipo_documento_id) camposFaltantes.tipo_documento_id = 'Selecciona el tipo de documento';
                if (!a.cedula || a.cedula.trim() === '') camposFaltantes.cedula = 'La cédula es obligatoria';
                if (!a.fecha_nacimiento) {
                    camposFaltantes.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
                } else {
                    const edad = calcularEdad(a.fecha_nacimiento);
                    if (edad < 6 || edad > 75) {
                        camposFaltantes.fecha_nacimiento = `Mouren solo cubre entre 6 y 75 años (esta persona tiene ${edad})`;
                    }
                }

                if (Object.keys(camposFaltantes).length > 0) {
                    nuevosErrores[i] = camposFaltantes;
                    if (primerErrorIndex === null) primerErrorIndex = i;
                }
            });

            // Validar cédulas duplicadas entre afiliados
            data.afiliados.forEach((a, i) => {
                if (i === 0) return;
                const cedula = a.cedula?.trim();
                if (!cedula) return;
                const hayDuplicado = data.afiliados.some((b, j) => j !== i && b.cedula?.trim() === cedula);
                if (hayDuplicado) {
                    nuevosErrores[i] = { ...(nuevosErrores[i] || {}), cedula: 'Esta cédula ya la usó otro protegido' };
                    if (primerErrorIndex === null) primerErrorIndex = i;
                }
            });

            setErroresAfiliados(nuevosErrores);

            if (Object.keys(nuevosErrores).length > 0) {
                setAfiliadoAbierto(primerErrorIndex); // abre automáticamente la tarjeta con el error
                return;
            }
        }
        if (paso === 2 && !data.cancion_id) {
            return alert("Mouri dice: La música es el lenguaje del alma. Elige una canción para continuar.");
        }
        if (paso === 3) {
            const faltaRecuerdo = data.afiliados.some(a => !a.recuerdo_id);
            if (faltaRecuerdo) {
                return alert("Mouri dice: Los objetos de memoria son tesoros. Elige uno para cada uno de tus protegidos.");
            }
        }
        setPaso(paso + 1);
    };

    const actualizarCampoAfiliado = (i, campo, valor) => {
        const n = [...data.afiliados];
        n[i][campo] = valor;
        setData('afiliados', n);

        // Si había un error en este campo, lo quitamos apenas el usuario lo cambia
        if (erroresAfiliados[i]?.[campo]) {
            const copia = { ...erroresAfiliados };
            const erroresDeEste = { ...copia[i] };
            delete erroresDeEste[campo];

            if (Object.keys(erroresDeEste).length === 0) {
                delete copia[i];
            } else {
                copia[i] = erroresDeEste;
            }
            setErroresAfiliados(copia);
        }
    };

    const toggleMúsica = (cancion) => {
        if (playingId === cancion.id) {
            audioRef.current.pause();
            setPlayingId(null);
        } else {
            setPlayingId(cancion.id);
            const nombreArchivo = cancion.archivo_audio;
            audioRef.current.src = `/images/planes/album/${nombreArchivo}`;
            audioRef.current.play();
        }
    };

    const toggleSeleccionMultiple = (id, campo) => {
        const lista = data[campo].includes(id)
            ? data[campo].filter(i => i !== id)
            : [...data[campo], id];
        setData(campo, lista);
    };

    const seleccionarRecuerdoAfiliado = (i, recuerdoId) => {
        const n = [...data.afiliados];
        n[i].recuerdo_id = recuerdoId;
        setData('afiliados', n);
    };

    const [errorModal, setErrorModal] = useState({
        show: false,
        message: ''
    });

    useEffect(() => {
        setData('cuota_mensual', totalCalculado);
    }, [totalCalculado]);

    const enviarInscripcion = () => {

        post(route('cliente.suscripciones.store'), {

            data: {
                ...data,
                cuota_mensual: totalCalculado
            },

            preserveScroll: true,

            onSuccess: () => {
                // Ya no hace falta nada aquí:
                // Laravel redirige solo a "Mi Plan" y el GIF se mostrará allá.
            },

            onError: (errors) => {

                setErrorModal({
                    show: true,
                    message: JSON.stringify(errors)
                });

            }

        });

    };

    const cancionElegida = canciones.find(c => c.id === data.cancion_id);

    return (
        <div className="flex min-h-screen bg-[#FDFBF9] font-['Hepta_Slab'] text-[#5D4E3F]">
            <Head title={`Inscribir ${plan.nombre}`} />
            <Sidebar onToggle={setIsSidebarOpen} />
            <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

            {/* Animaciones: mascota Mouri, notas musicales y transición de pasos */}
            <style>{`
                @keyframes mouriBob {
                    0%, 100% { transform: translateY(0) rotate(-2deg); }
                    50% { transform: translateY(-6px) rotate(2deg); }
                }
                @keyframes batonWave {
                    0%, 100% { transform: rotate(-16deg); }
                    50% { transform: rotate(16deg); }
                }
                @keyframes wingFlap {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(-18deg); }
                }
                @keyframes noteFloat {
                    0% { transform: translateY(0) scale(0.8); opacity: 0; }
                    15% { opacity: 1; }
                    100% { transform: translateY(-42px) scale(1.15); opacity: 0; }
                }
                @keyframes stepFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.9) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes pulseDot {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 0.6; }
                }
                .mouri-conductor { animation: mouriBob 3.2s ease-in-out infinite; transform-origin: center bottom; }
                .mouri-conductor.active { animation: mouriBob 1.1s ease-in-out infinite; }
                .mouri-baton { transform-origin: 58% 80%; animation: batonWave 2.4s ease-in-out infinite; }
                .mouri-conductor.active .mouri-baton { animation: batonWave 0.5s ease-in-out infinite; }
                .mouri-wing { transform-origin: 46% 58%; animation: wingFlap 2.6s ease-in-out infinite; }
                .mouri-conductor.active .mouri-wing { animation: wingFlap 0.35s ease-in-out infinite; }
                .mouri-note {
                    position: absolute;
                    font-size: 15px;
                    font-weight: 900;
                    color: #A68966;
                    animation: noteFloat 1.8s ease-out infinite;
                    pointer-events: none;
                }
                .step-fade { animation: stepFadeIn 0.4s ease both; }
                .pop-in { animation: popIn 0.25s ease both; }
                .pulse-dot { animation: pulseDot 1.4s ease-in-out infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .mouri-conductor, .mouri-baton, .mouri-wing, .mouri-note, .step-fade, .pop-in, .pulse-dot { animation: none !important; }
                }
            `}</style>

            <main className={`flex-1 w-full min-w-0 transition-all p-4 sm:p-6 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
                <div className="max-w-6xl mx-auto">
                    <br />

                    {/* CABECERA: título a la izquierda, fases (stepper) a la derecha en el lugar donde antes iba la burbuja de comentarios */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-10 gap-5">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter ">
                                inscribir <span className="text-[#A68966]">plan {plan.nombre}</span>
                            </h1>
                            <p className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-30 mt-2">Paso {paso} de 4</p>
                        </div>

                        {/* STEPPER: ahora vive en la esquina superior derecha */}
                        <div className="flex items-center max-w-xl w-full md:w-auto">
                            {pasos.map((label, idx) => {
                                const numero = idx + 1;
                                const completado = numero < paso;
                                const actual = numero === paso;
                                return (
                                    <React.Fragment key={label}>
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div
                                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                                                    completado
                                                        ? 'bg-[#A68966] text-white'
                                                        : actual
                                                            ? 'bg-[#5D4E3F] text-white scale-110 shadow-lg'
                                                            : 'bg-[#F4F1ED] text-[#5D4E3F]/40'
                                                }`}
                                            >
                                                {completado ? '✓' : numero}
                                            </div>
                                            <span className={`text-[8px] font-bold uppercase tracking-wider hidden sm:block ${actual ? 'text-[#5D4E3F]' : 'text-[#5D4E3F]/30'}`}>
                                                {label}
                                            </span>
                                        </div>
                                        {numero < pasos.length && (
                                            <div className="flex-1 h-[2px] mx-1.5 sm:mx-2 bg-[#5D4E3F]/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#A68966] rounded-full transition-all duration-500 ease-out"
                                                    style={{ width: numero < paso ? '100%' : '0%' }}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
                        <div className="lg:col-span-7 bg-white p-5 sm:p-6 md:p-10 rounded-[28px] sm:rounded-[36px] md:rounded-[50px] shadow-sm border border-[#5D4E3F]/5 min-h-0 sm:min-h-[550px] flex flex-col">

                            {paso === 1 && (
                                <div className="flex-1 step-fade">
                                    <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                                        <h2 className="text-xl sm:text-2xl font-black lowercase italic">tus protegidos</h2>
                                        <BotonTutorial
                                            titulo="Cómo inscribir a tus protegidos"
                                            numero="01"
                                            subtitulo="Guía rápida"
                                            frames={FRAMES_TUTORIAL_INSCRIPCION}
                                            notaFinal="Toca cada tarjeta para continuar"
                                            autor="Mouren"
                                        />
                                        <button
                                            disabled={numPersonasActuales >= MAX_PERSONAS}
                                            onClick={() => setData('afiliados', [...data.afiliados, {
                                                nombre: '', parentesco: '', cancion_id: '', recuerdo_id: '',
                                                genero_id: '', tipo_documento_id: '', cedula: '', fecha_nacimiento: ''
                                            }])}
                                            className={`text-[10px] font-bold uppercase flex items-center gap-2 ${numPersonasActuales >= MAX_PERSONAS ? 'opacity-20' : 'text-[#A68966]'}`}
                                        >
                                            <Plus size={14} /> agregar ({numPersonasActuales}/{MAX_PERSONAS})
                                        </button>
                                    </div>

                                    <div className="space-y-4 mt-6">
                                        {data.afiliados.map((afi, i) => {
                                            const abierto = afiliadoAbierto === i;
                                            const erroresDeEste = erroresAfiliados[i] || {};

                                            return (
                                                <div key={i} className={`rounded-3xl border transition-all ${i === 0 ? 'bg-[#F4F1ED] border-[#A68966]/30 shadow-inner' : 'bg-white border-[#5D4E3F]/10 shadow-sm'}`}>

                                                    {/* CABECERA: siempre visible, clic para expandir/colapsar */}
                                                    <div
                                                        className="flex flex-wrap items-center gap-2 p-3 sm:p-4 cursor-pointer"
                                                        onClick={() => setAfiliadoAbierto(abierto ? -1 : i)}
                                                    >
                                                        <input
                                                            className={`flex-1 min-w-[120px] border-none rounded-xl text-xs p-3 shadow-sm focus:ring-1 focus:ring-[#A68966] ${i === 0 ? 'bg-white/70 text-[#5D4E3F]/60 font-medium cursor-not-allowed' : 'bg-[#FDFBF9]'}`}
                                                            placeholder="Nombre completo"
                                                            value={afi.nombre}
                                                            readOnly={i === 0}
                                                            onClick={e => e.stopPropagation()}
                                                            onChange={e => {
                                                                if (i === 0) return;
                                                                const n = [...data.afiliados];
                                                                n[i].nombre = e.target.value;
                                                                setData('afiliados', n);
                                                            }}
                                                        />

                                                        {i === 0 ? (
                                                            <input
                                                                className="bg-white/70 border-none rounded-xl text-xs p-3 shadow-sm text-center font-black text-[#A68966] w-28 sm:w-36 cursor-not-allowed"
                                                                value="Titular"
                                                                readOnly
                                                                onClick={e => e.stopPropagation()}
                                                            />
                                                        ) : (
                                                            <select
                                                                className="bg-[#FDFBF9] border-none rounded-xl text-xs p-3 shadow-sm focus:ring-1 focus:ring-[#A68966] w-28 sm:w-36"
                                                                value={afi.parentesco}
                                                                onClick={e => e.stopPropagation()}
                                                                onChange={e => { const n = [...data.afiliados]; n[i].parentesco = e.target.value; setData('afiliados', n); }}
                                                            >
                                                                <option value="">Vínculo</option>
                                                                <option value="Hijo/a">Hijo/a</option>
                                                                <option value="Cónyuge">Cónyuge</option>
                                                                <option value="Padre/Madre">Padre/Madre</option>
                                                                <option value="Tio/Tia">Tio/Tia</option>
                                                                <option value="Primo/Prima">Primo/Prima</option>
                                                                <option value="Amigo sin ningún grado de consanguinidad">Amigo sin ningún grado de consanguinidad</option>
                                                            </select>
                                                        )}

                                                        {i === 0 ? (
                                                            <div className="w-10 h-10 flex items-center justify-center opacity-30 shrink-0">
                                                                <ShieldCheck size={18} className="text-[#A68966]" />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={e => { e.stopPropagation(); setData('afiliados', data.afiliados.filter((_, idx) => idx !== i)); }}
                                                                className="p-2 text-red-300 hover:text-red-500 shrink-0"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}

                                                        <div className="w-6 h-10 flex items-center justify-center text-[#A68966] shrink-0 text-xs">
                                                            {abierto ? '▲' : '▼'}
                                                        </div>
                                                    </div>

                                                    {/* CUERPO: datos personales, colapsable */}
                                                    <div className={`overflow-hidden transition-all duration-300 ${abierto ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                        <div className={`px-3 sm:px-4 pb-4 pt-3 border-t ${i === 0 ? 'border-[#A68966]/20' : 'border-[#5D4E3F]/10'}`}>
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-[#A68966]/70 mb-2">
                                                                Datos personales {i === 0 && '(de tu perfil)'}
                                                            </p>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {i === 0 ? (
                                                                    <>
                                                                        <div className="bg-[#C3B698] rounded-xl text-xs p-3 shadow-sm text-white font-medium truncate">
                                                                            {generos.find(g => g.id === afi.genero_id)?.nombre || 'Género no registrado'}
                                                                        </div>
                                                                        <div className="bg-[#D4CAB5] rounded-xl text-xs p-3 shadow-sm text-[#5D4E3F]/80 font-medium truncate">
                                                                            {tiposDocumento.find(td => td.id === afi.tipo_documento_id)?.nombre || 'Doc. no registrado'}
                                                                        </div>
                                                                        <div className="bg-[#D4CAB5] rounded-xl text-xs p-3 shadow-sm text-[#5D4E3F]/80 font-medium truncate">
                                                                            {afi.cedula || 'Cédula no registrada'}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[7px] font-black uppercase tracking-widest text-[#A68966]/70 mb-1">Fecha de nacimiento</p>
                                                                            <div className="bg-white/70 rounded-xl text-xs p-3 shadow-sm text-[#5D4E3F]/60 font-medium truncate">
                                                                                {afi.fecha_nacimiento || 'Fecha no registrada'}
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div>
                                                                            <select
                                                                                className={`bg-[#4A412B] text-[#FFFFFF] border-none rounded-xl text-xs p-3 shadow-sm focus:ring-1 focus:ring-[#A68966] w-full ${erroresDeEste.genero_id ? 'ring-2 ring-red-400' : ''}`}
                                                                                value={afi.genero_id}
                                                                                onChange={e => actualizarCampoAfiliado(i, 'genero_id', e.target.value)}
                                                                            >
                                                                                <option value="">Género</option>
                                                                                {generos.map(g => (
                                                                                    <option key={g.id} value={g.id}>{g.nombre}</option>
                                                                                ))}
                                                                            </select>
                                                                            {erroresDeEste.genero_id && <p className="text-[9px] text-red-500 font-bold mt-1">{erroresDeEste.genero_id}</p>}
                                                                        </div>

                                                                        <div>
                                                                            <select
                                                                                className={`bg-[#675A3C] text-[#FFFFFF] border-none rounded-xl text-xs p-3 shadow-sm focus:ring-1 focus:ring-[#A68966] w-full ${erroresDeEste.tipo_documento_id ? 'ring-2 ring-red-400' : ''}`}
                                                                                value={afi.tipo_documento_id}
                                                                                onChange={e => actualizarCampoAfiliado(i, 'tipo_documento_id', e.target.value)}
                                                                            >
                                                                                <option value="">Tipo doc.</option>
                                                                                {tiposDocumento.map(td => (
                                                                                    <option key={td.id} value={td.id}>{td.nombre}</option>
                                                                                ))}
                                                                            </select>
                                                                            {erroresDeEste.tipo_documento_id && <p className="text-[9px] text-red-500 font-bold mt-1">{erroresDeEste.tipo_documento_id}</p>}
                                                                        </div>

                                                                        <div>
                                                                            <p className="text-[7px] font-black uppercase tracking-widest text-[#A68966]/70 mb-1">Cedula del Afiliado</p>
                                                                            <input
                                                                                className={`bg-[#675A3C] text-[#FFFFFF] border-none rounded-xl text-xs p-3 shadow-sm focus:ring-1 focus:ring-[#A68966] w-full placeholder:text-[#5D4E3F]/50 ${erroresDeEste.cedula ? 'ring-2 ring-red-400' : ''}`}
                                                                                placeholder="Cédula"
                                                                                value={afi.cedula}
                                                                                onChange={e => actualizarCampoAfiliado(i, 'cedula', e.target.value)}
                                                                            />
                                                                            {erroresDeEste.cedula && <p className="text-[9px] text-red-500 font-bold mt-1">{erroresDeEste.cedula}</p>}
                                                                        </div>

                                                                        <div>
                                                                            <p className="text-[7px] font-black uppercase tracking-widest text-[#A68966]/70 mb-1">Fecha de nacimiento</p>
                                                                            <input
                                                                                type="date"
                                                                                className={`bg-[#FDFBF9] border-none rounded-xl text-xs p-3 shadow-sm focus:ring-1 focus:ring-[#A68966] w-full ${erroresDeEste.fecha_nacimiento ? 'ring-2 ring-red-400' : ''}`}
                                                                                value={afi.fecha_nacimiento}
                                                                                onChange={e => actualizarCampoAfiliado(i, 'fecha_nacimiento', e.target.value)}
                                                                            />
                                                                            {erroresDeEste.fecha_nacimiento && <p className="text-[9px] text-red-500 font-bold mt-1">{erroresDeEste.fecha_nacimiento}</p>}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {paso === 2 && (
                                <div className="flex-1 step-fade">
                                    <h2 className="text-xl sm:text-2xl font-black lowercase italic mb-6 sm:mb-8">complementos y música</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        {/* Servicios Extra */}
                                        <div className="space-y-3 flex flex-col min-h-0">
                                            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest text-gray-400">Servicios Extra</p>

                                            {/* 🆕 Buscador de servicios */}
                                            <div className="relative">
                                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A68966]/50" />
                                                <input
                                                    type="text"
                                                    value={busquedaServicio}
                                                    onChange={(e) => setBusquedaServicio(e.target.value)}
                                                    placeholder="Buscar servicio..."
                                                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E3D9BC] rounded-xl text-[10px] font-bold text-[#5D4E3F] placeholder:opacity-40 focus:ring-2 focus:ring-[#A68966]/40 outline-none"
                                                />
                                            </div>

                                            <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2.5">
                                                {serviciosDisponiblesPaso2.length === 0 && (
                                                    <p className="text-center text-[10px] text-gray-400 italic py-8">
                                                        No hay servicios adicionales disponibles{busquedaServicio && ' para tu búsqueda'}.
                                                    </p>
                                                )}

                                                {serviciosDisponiblesPaso2.map(s => {
                                                    const seleccionado = data.servicios_adicionales.includes(s.id);
                                                    return (
                                                        <div
                                                            key={s.id}
                                                            onClick={() => toggleSeleccionMultiple(s.id, 'servicios_adicionales')}
                                                            className={`
            relative
            p-3.5
            rounded-2xl
            border-2
            cursor-pointer
            transition-all
            hover:scale-[1.01]

            ${seleccionado
                                                                    ? 'bg-[#A68966] text-white border-[#A68966] shadow-md'
                                                                    : s.personalizable
                                                                        ? 'bg-amber-50 border-amber-300 hover:shadow-md'
                                                                        : 'bg-[#FDFBF9] border-transparent hover:border-[#A68966]/30'
                                                                }
        `}
                                                        >
                                                            {Boolean(Number(s.personalizable)) && (
                                                                <span className={`absolute top-2 right-2 text-[8px] font-black px-2 py-0.5 rounded-full ${seleccionado ? 'bg-white/20 text-white' : 'bg-amber-400 text-white'}`}>
                                                                    ✨ Personalizable
                                                                </span>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); setServicioInfo(s); }}
                                                                className={`absolute bottom-2 right-2 text-[8px] font-black underline underline-offset-2 ${seleccionado ? 'text-white/80' : 'text-[#A68966]/70'}`}
                                                            >
                                                                ver detalle
                                                            </button>

                                                            <p className="text-[11px] font-bold pr-16">
                                                                {s.nombre}
                                                            </p>

                                                            {s.descripcion && (
                                                                <p className={`text-[9px] mt-1 line-clamp-2 ${seleccionado ? 'text-white/80' : 'text-[#8C7A67]'}`}>
                                                                    {s.descripcion}
                                                                </p>
                                                            )}

                                                            <p className={`text-[10px] font-black mt-2 ${seleccionado ? 'text-white' : 'text-[#A68966]'}`}>
                                                                +${Number(s.precio).toLocaleString('es-CO')}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Canción Especial */}
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest text-gray-400">Canción Especial</p>
                                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                                                {canciones.map(c => (
                                                    <div
                                                        key={c.id}
                                                        className={`p-3 rounded-xl flex items-center justify-between gap-2 border cursor-pointer transition-all ${data.cancion_id === c.id ? 'bg-[#5D4E3F] text-white border-[#5D4E3F]' : 'bg-white hover:border-[#A68966]/30'}`}
                                                        onClick={() => {
                                                            setData('cancion_id', c.id);
                                                            aplicarCancionATodos(c.id);
                                                        }}
                                                    >
                                                        <p className="text-[10px] font-bold truncate flex-1 min-w-0">
                                                            {c.titulo}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); toggleMúsica(c); }}
                                                            className="ml-2 shrink-0"
                                                        >
                                                            {playingId === c.id ? <Pause size={14} className={data.cancion_id === c.id ? "text-white" : "text-red-400"} /> : <Play size={14} className="text-[#A68966]" />}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            {data.cancion_id && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTipModal(true)}
                                                    className="w-full flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#A68966] border border-dashed border-[#A68966]/40 rounded-xl py-2.5 hover:bg-[#A68966]/5 transition-all"
                                                >
                                                    <Music size={12} /> pedirle a mouri que la presente
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paso === 3 && (
                                <div className="flex-1 step-fade">
                                    <div className="mb-6 sm:mb-8">
                                        <h2 className="text-xl sm:text-2xl font-black lowercase italic">objetos de memoria</h2>
                                        <p className="text-[10px] text-[#A68966] font-bold uppercase mt-1">Cada protegido elige el suyo</p>
                                    </div>

                                    <div className="space-y-6 max-h-[420px] overflow-y-auto pr-1">
                                        {data.afiliados.map((afi, i) => (
                                            <div key={i} className="border border-[#5D4E3F]/10 rounded-3xl p-4">
                                                <p className="text-[11px] font-black uppercase text-[#5D4E3F] mb-3">
                                                    {afi.nombre || `Protegido ${i + 1}`}
                                                    <span className="text-[#A68966] font-bold"> · {afi.parentesco}</span>
                                                </p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {recuerdos.map(r => (
                                                        <div
                                                            key={r.id}
                                                            onClick={() => seleccionarRecuerdoAfiliado(i, r.id)}
                                                            className={`p-3 rounded-[24px] border-2 cursor-pointer text-center transition-all ${afi.recuerdo_id === r.id ? 'bg-[#5D4E3F] text-white border-[#5D4E3F]' : 'bg-[#FDFBF9] border-transparent hover:border-[#A68966]/30'}`}
                                                        >
                                                            <div className="bg-white rounded-2xl p-2 mb-2 shadow-sm">
                                                                <img src={`/images/planes/recuerdos/${r.imagen || 'peluche_mouri.png'}`} className="w-12 h-12 mx-auto object-contain" alt={r.nombre} />
                                                            </div>
                                                            <p className="text-[10px] font-bold lowercase">{r.nombre}</p>
                                                            <p className="text-[9px] opacity-60">$ {Number(r.precio_adicional).toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            )}

                            {paso === 4 && (
                                <div className="flex-1 flex flex-col justify-center step-fade">
                                    <div className="bg-[#FDFBF9] p-5 sm:p-6 md:p-10 rounded-[32px] sm:rounded-[45px] md:rounded-[60px] border border-[#A68966]/10 shadow-inner overflow-hidden">
                                        <ShieldCheck className="mx-auto text-[#A68966] mb-6" size={40} />
                                        <h2 className="text-xl sm:text-2xl font-black lowercase italic mb-6 text-center">compromiso de protección mouren</h2>

                                        <div className="max-h-40 overflow-y-auto pr-4 text-[11px] leading-relaxed text-[#5D4E3F]/70 text-justify space-y-3 mb-8 font-sans">
                                            <p>Yo, <strong>{nombreTitular || 'Usuario'}</strong>, acepto los términos de cobertura del Plan {plan.nombre}. Entiendo que la protección para mis {numPersonasActuales} protegidos iniciará tras la validación de mi primer pago.</p>
                                            <p>Me comprometo a mantener la veracidad de los datos suministrados. Mouren se reserva el derecho de solicitar documentación para validar los servicios funerarios y tributos especiales seleccionados.</p>
                                            <p>La cuota mensual de <strong>${totalCalculado.toLocaleString()}</strong> será facturada según el ciclo elegido.</p>
                                        </div>

                                        <label className="flex items-start gap-3 sm:gap-4 cursor-pointer p-4 bg-white rounded-3xl border border-[#A68966]/20">
                                            <input type="checkbox" className="w-5 h-5 mt-1 shrink-0 rounded-lg text-[#A68966] focus:ring-0" checked={aceptoTerminos} onChange={e => setAceptoTerminos(e.target.checked)} />
                                            <span className="text-[10px] font-bold leading-tight uppercase tracking-tight">He leído y acepto los términos del contrato de protección y la política de datos de Mouren.</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-6 sm:pt-8 flex justify-between items-center gap-3 border-t border-[#5D4E3F]/5">
                                {paso > 1 && (
                                    <button onClick={() => setPaso(paso - 1)} className="text-[10px] font-black uppercase opacity-20 hover:opacity-100 transition-all tracking-widest shrink-0">← atrás</button>
                                )}
                                <button
                                    onClick={() => paso === 4 ? enviarInscripcion() : validarPaso()}
                                    disabled={processing}
                                    className="bg-[#5D4E3F] text-white px-6 sm:px-12 py-3.5 sm:py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] ml-auto shadow-lg hover:bg-[#4A3E32] hover:scale-[1.03] active:scale-[0.98] transition-all whitespace-nowrap"
                                >
                                    {paso === 4 ? (processing ? 'procesando...' : 'activar protección') : 'siguiente'}
                                </button>
                            </div>
                        </div>

                        {/* PANEL DE RESUMEN */}
                        <div className="lg:col-span-5 lg:sticky lg:top-10">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[#A68966] rounded-[28px] sm:rounded-[32px] md:rounded-[40px] transform -rotate-3 transition-transform group-hover:rotate-0 duration-500 shadow-xl opacity-20"></div>
                                <div className="relative bg-[#F4F1ED] border-2 border-[#5D4E3F]/10 rounded-[28px] sm:rounded-[32px] md:rounded-[40px] p-5 sm:p-6 md:p-8 shadow-2xl backdrop-blur-sm overflow-hidden">
                                    <div className="bg-[#5D4E3F] inline-block px-6 sm:px-8 py-2 transform -skew-x-12 mb-6 sm:mb-8 ml-[-20px]">
                                        <h2 className="text-lg sm:text-xl font-black text-[#FDFBF9] lowercase italic transform skew-x-12">tu resumen mouri</h2>
                                    </div>

                                    <div className="space-y-5 sm:space-y-6">
                                        <div className="flex justify-between items-center gap-2 border-b-2 border-dashed border-[#5D4E3F]/20 pb-4">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A68966]">Plan Elegido</p>
                                                <p className="text-base sm:text-lg font-black text-[#5D4E3F] italic truncate">{plan.nombre}</p>
                                            </div>
                                            <Gem className="text-[#A68966] opacity-40 shrink-0" size={28} />
                                        </div>

                                        <div className="bg-white/60 p-4 sm:p-5 rounded-2xl border-l-8 border-[#A68966] transform hover:translate-x-2 transition-all">
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-sm font-black uppercase text-[#5D4E3F]">Beneficiarios</span>
                                                <span className="text-2xl sm:text-3xl font-black italic text-[#A68966]">x{numPersonasActuales}</span>
                                            </div>
                                            <p className="text-[10px] font-bold opacity-50 mt-1">({MAX_PERSONAS - numPersonasActuales} cupos disponibles)</p>
                                        </div>

                                        {data.servicios_adicionales.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black uppercase text-[#A68966]">Servicios Extra:</p>
                                                {data.servicios_adicionales.map(id => {
                                                    const s = servicios.find(srv => srv.id === id);
                                                    return s ? (
                                                        <div key={id} className="flex justify-between gap-2 text-[10px] font-bold lowercase italic">
                                                            <span className="truncate">+ {s.nombre}</span>
                                                            <span className="shrink-0">${Number(s.precio).toLocaleString()}</span>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}

                                        {data.afiliados.some(a => a.recuerdo_id) && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black uppercase text-[#A68966]">Recuerdos por protegido:</p>
                                                {data.afiliados.map((a, i) => {
                                                    const r = recuerdos.find(rec => rec.id === a.recuerdo_id);
                                                    return r ? (
                                                        <div key={i} className="flex justify-between gap-2 text-[10px] font-bold lowercase italic">
                                                            <span className="truncate">{a.nombre || `Protegido ${i + 1}`}: {r.nombre}</span>
                                                            <span className="shrink-0">${Number(r.precio_adicional).toLocaleString()}</span>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}

                                        <div className="mt-8 sm:mt-10 relative group cursor-pointer">
                                            {/* Fondo decorativo */}
                                            <div className="absolute inset-0 bg-[#5D4E3F] rounded-3xl transform skew-y-3 transition-all duration-500 group-hover:skew-y-2 group-hover:scale-[1.02]"></div>

                                            {/* Glow */}
                                            <div className="absolute inset-0 rounded-3xl bg-[#A68966]/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                                            {/* Card */}
                                            <div className="relative overflow-hidden bg-[#FDFBF9] p-6 sm:p-8 rounded-3xl transform -translate-y-2 -translate-x-2 transition-all duration-500 group-hover:-translate-y-4 group-hover:-translate-x-4 group-hover:shadow-2xl">

                                                {/* Shine Effect */}
                                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

                                                <p className="text-[10px] uppercase font-black text-[#A68966] mb-2 tracking-[0.2em] text-center">
                                                    Inversión Mensual
                                                </p>

                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-2xl sm:text-3xl font-black text-[#5D4E3F] transition-transform duration-300 group-hover:scale-110">
                                                        $
                                                    </span>

                                                    <span className="text-4xl sm:text-5xl font-black text-[#5D4E3F] tracking-tighter transition-all duration-300 group-hover:scale-105">
                                                        {totalAnimado.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* PÁJARO FLOTANTE: no ocupa espacio del layout, vive fijo en la esquina */}
            <button
                onClick={() => { setShowTipModal(true); setHayTipNuevo(false); }}
                className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40 group"
                aria-label="Abrir mensaje de Mouri"
            >
                <div className="absolute inset-0 bg-[#A68966]/30 rounded-full blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative bg-white rounded-full p-2 shadow-2xl border-2 border-[#A68966]/20 hover:scale-105 active:scale-95 transition-all">
                    <PajaroMouri active={playingId !== null} variant={paso} />
                </div>
                {hayTipNuevo && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#A68966] rounded-full border-2 border-white pulse-dot"></span>
                )}
            </button>

            {/* VENTANA EMERGENTE DEL PÁJARO: reemplaza la burbuja fija de comentarios */}
            {showTipModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-[#5D4E3F]/30 backdrop-blur-[2px] p-4 sm:p-8"
                    onClick={() => setShowTipModal(false)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="pop-in bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 max-w-sm w-full shadow-2xl border-2 border-[#A68966]/15 relative sm:mb-24"
                    >
                        <button onClick={() => setShowTipModal(false)} className="absolute top-4 right-4 text-[#5D4E3F]/30 hover:text-[#5D4E3F]">
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-3 mb-4 pr-6">
                            <div className="bg-[#F4F1ED] rounded-full p-1">
                                <PajaroMouri active={playingId !== null} size="small" variant={paso} />
                            </div>
                            <div>
                                <p className="text-[8px] uppercase tracking-widest text-[#A68966] font-black">Mouri te cuenta</p>
                                <p className="text-xs font-black text-[#5D4E3F]">Paso {paso} · {pasos[paso - 1]}</p>
                            </div>
                        </div>

                        <p className="text-xs italic text-[#5D4E3F]/80 leading-relaxed">
                            {tipsPorPaso[paso]}
                        </p>

                        {paso === 2 && cancionElegida && (
                            <div className="mt-4 bg-[#FDFBF9] border border-dashed border-[#A68966]/30 rounded-2xl p-3.5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-[#A68966]/70 mb-1">Presentación de orquesta</p>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[10px] font-bold truncate">{cancionElegida.titulo}</p>
                                    <button
                                        onClick={() => toggleMúsica(cancionElegida)}
                                        className="flex items-center gap-1.5 bg-[#5D4E3F] text-white text-[9px] font-black uppercase px-3 py-2 rounded-xl shrink-0"
                                    >
                                        {playingId === cancionElegida.id ? <><Pause size={11} /> pausar</> : <><Play size={11} /> presentar</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowTipModal(false)}
                            className="mt-5 w-full bg-[#A68966] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-[#8f7452] transition-all"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {/* FICHA DE SERVICIO: ventana que explica un servicio adicional al hacer click en "ver detalle" */}
            {servicioInfo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#5D4E3F]/40 backdrop-blur-sm p-4"
                    onClick={() => setServicioInfo(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="pop-in bg-white rounded-[28px] sm:rounded-[32px] p-6 max-w-sm w-full shadow-2xl border-2 border-[#A68966]/15 relative"
                    >
                        <button onClick={() => setServicioInfo(null)} className="absolute top-4 right-4 text-[#5D4E3F]/30 hover:text-[#5D4E3F]">
                            <X size={16} />
                        </button>
                        {Boolean(Number(servicioInfo.personalizable)) && (
                            <span className="inline-block mb-3 text-[8px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-white">✨ Personalizable</span>
                        )}
                        <h3 className="text-lg font-black lowercase italic text-[#5D4E3F] pr-6">{servicioInfo.nombre}</h3>
                        {servicioInfo.descripcion && (
                            <p className="text-xs text-[#5D4E3F]/70 leading-relaxed mt-3">{servicioInfo.descripcion}</p>
                        )}
                        <p className="text-sm font-black text-[#A68966] mt-4">+${Number(servicioInfo.precio).toLocaleString('es-CO')}</p>
                        <button
                            onClick={() => {
                                toggleSeleccionMultiple(servicioInfo.id, 'servicios_adicionales');
                                setServicioInfo(null);
                            }}
                            className="mt-5 w-full bg-[#5D4E3F] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-[#4A3E32] transition-all"
                        >
                            {data.servicios_adicionales.includes(servicioInfo.id) ? 'quitar de mi plan' : 'agregar a mi plan'}
                        </button>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#5D4E3F]/90 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 sm:p-8 md:p-12 rounded-[36px] sm:rounded-[48px] md:rounded-[60px] text-center max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                        <img src="/images/login/mouri_registro_exitoso.png" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6" alt="Éxito" />
                        <h2 className="text-2xl sm:text-3xl font-black text-[#5D4E3F] lowercase mb-2 italic">¡protección activada!</h2>
                        <button onClick={() => window.location.href = '/cliente/mi-plan'} className="mt-8 bg-[#A68966] text-white w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">ir a mi panel</button>
                    </div>
                </div>
            )}

            {errorModal.show && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full text-center">
                        <h2 className="text-lg sm:text-xl font-black text-red-500 mb-4">
                            Mouri te informa
                        </h2>

                        <p className="text-sm text-gray-700 break-words">
                            {errorModal.message}
                        </p>

                        <button
                            onClick={() =>
                                setErrorModal({
                                    show: false,
                                    message: ''
                                })
                            }
                            className="mt-6 bg-[#A68966] text-white px-6 py-3 rounded-xl"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

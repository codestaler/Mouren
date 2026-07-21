import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Sidebar from '@/Pages/Clientes/Sidebar';
import { BotonTutorial } from './TutorialAnimacionModal';
import {
    Trash2, Plus, Play, Pause, Sparkles, ShieldCheck, Gem
} from 'lucide-react';

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
                genero_id: auth?.user?.genero_id || '',
                tipo_documento_id: auth?.user?.tipo_documento_id || '',
                cedula: auth?.user?.cedula || '',
                fecha_nacimiento: auth?.user?.fecha_nacimiento || ''
            }
        ],
        servicios_adicionales: [],
        recuerdos_seleccionados: [],
    });

    const aplicarCancionATodos = (id) => {
        setData('afiliados', data.afiliados.map(a => ({ ...a, cancion_id: id })));
    };

    // --- LÓGICA DE CÁLCULO ---
    const MAX_PERSONAS = 5;
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

        const extraRecuerdos = data.recuerdos_seleccionados.reduce((acc, id) => {
            const r = recuerdos.find(rec => rec.id === id);
            return acc + (r ? parseFloat(r.precio_adicional) : 0);
        }, 0);

        return (base * numPersonas) + extraServicios + extraRecuerdos;
    }, [
        data.afiliados.length, // <- IMPORTANTE: usa .length
        JSON.stringify(data.servicios_adicionales), // <- FORZAMOS RE-CALCULO
        JSON.stringify(data.recuerdos_seleccionados), // <- FORZAMOS RE-CALCULO
        plan?.id // <- Dependencia del ID del plan
    ]);


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
        if (paso === 3 && data.recuerdos_seleccionados.length === 0) {
            return alert("Mouri dice: Los objetos de memoria son tesoros. Selecciona al menos uno.");
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

    const toggleSeleccionRecuerdo = (id) => {
        const nuevaLista = data.recuerdos_seleccionados.includes(id) ? [] : [id];
        setData('recuerdos_seleccionados', nuevaLista);
    };

    const [errorModal, setErrorModal] = useState({
        show: false,
        message: ''
    });

    console.log("Datos exactos enviados:", {
        plan_id: data.plan_id,
        afiliados: data.afiliados,
        cuota: totalCalculado
    });

    useEffect(() => {
        setData('cuota_mensual', totalCalculado);
    }, [totalCalculado]);

    const enviarInscripcion = () => {

        post(route('suscripciones.store'), {

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

                console.log(errors);

                setErrorModal({
                    show: true,
                    message: JSON.stringify(errors)
                });

            }

        });

    };

    console.log("DEBUG PLAN:", plan);
    console.log("DEBUG TOTAL:", totalCalculado);
    return (
        <div className="flex min-h-screen bg-[#FDFBF9] font-['Hepta_Slab'] text-[#5D4E3F]">
            <Head title={`Inscribir ${plan.nombre}`} />
            <Sidebar onToggle={setIsSidebarOpen} />
            <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

            <main className={`flex-1 transition-all p-6 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
                <div className="max-w-6xl mx-auto">
                    <br />

                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter ">
                                inscribir <span className="text-[#A68966]">plan {plan.nombre}</span>
                            </h1>
                            <p className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-30 mt-2">Paso {paso} de 4</p>
                        </div>

                        <div className="bg-[#5D4E3F] text-white p-4 rounded-2xl flex items-center gap-4 max-w-md shadow-xl border-l-4 border-[#A68966]">
                            <Sparkles className="text-[#A68966] shrink-0" size={30} />
                            <p className="text-[10px] font-bold italic leading-tight">
                                {paso === 1 && " Argg Estás incluido automáticamente como titular de la protección. Agrega a tus seres queridos."}
                                {paso === 2 && " Oh you can´t read my poker face!! argg verdad que aun sigues hay, la música y los servicios extra hacen que el homenaje sea único."}
                                {paso === 3 && " Solo puedes elegir un objeto de memoria como tributo principal Argg."}
                                {paso === 4 && " Lee con atención el compromiso. Estamos aquí para cuidarte Argg."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-7 bg-white p-10 rounded-[50px] shadow-sm border border-[#5D4E3F]/5 min-h-[550px] flex flex-col">

                            {paso === 1 && (
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-black lowercase italic">tus protegidos</h2>
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
                                                nombre: '', parentesco: '', cancion_id: '',
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
                                                        className="flex flex-wrap items-center gap-2 p-4 cursor-pointer"
                                                        onClick={() => setAfiliadoAbierto(abierto ? -1 : i)}
                                                    >
                                                        <input
                                                            className={`flex-1 min-w-[140px] border-none rounded-xl text-xs p-3 shadow-sm focus:ring-1 focus:ring-[#A68966] ${i === 0 ? 'bg-white/70 text-[#5D4E3F]/60 font-medium cursor-not-allowed' : 'bg-[#FDFBF9]'}`}
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
                                                                className="bg-white/70 border-none rounded-xl text-xs p-3 shadow-sm text-center font-black text-[#A68966] w-36 cursor-not-allowed"
                                                                value="Titular"
                                                                readOnly
                                                                onClick={e => e.stopPropagation()}
                                                            />
                                                        ) : (
                                                            <select
                                                                className="bg-[#FDFBF9] border-none rounded-xl text-xs p-3 shadow-sm focus:ring-1 focus:ring-[#A68966] w-36"
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
                                                        <div className={`px-4 pb-4 pt-3 border-t ${i === 0 ? 'border-[#A68966]/20' : 'border-[#5D4E3F]/10'}`}>
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
                                <div className="flex-1">
                                    <h2 className="text-2xl font-black lowercase italic mb-8">complementos y música</h2>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Servicios Extra */}
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest text-gray-400">Servicios Extra</p>
                                            {servicios.filter(s => !plan.servicios?.some(ps => ps.id === s.id)).map(s => (
                                                <div
                                                    key={s.id}
                                                    onClick={() => toggleSeleccionMultiple(s.id, 'servicios_adicionales')}
                                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${data.servicios_adicionales.includes(s.id) ? 'bg-[#A68966] text-white border-[#A68966]' : 'bg-[#FDFBF9] border-transparent hover:border-[#A68966]/30'}`}
                                                >
                                                    <p className="text-[11px] font-bold">{s.nombre}</p>
                                                    <p className={`text-[9px] ${data.servicios_adicionales.includes(s.id) ? 'text-white/80' : 'opacity-60'}`}>
                                                        +${Number(s.precio).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Canción Especial */}
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest text-gray-400">Canción Especial</p>
                                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                                                {canciones.map(c => (
                                                    <div
                                                        key={c.id}
                                                        className={`p-3 rounded-xl flex items-center justify-between border cursor-pointer transition-all ${data.cancion_id === c.id ? 'bg-[#5D4E3F] text-white border-[#5D4E3F]' : 'bg-white hover:border-[#A68966]/30'}`}
                                                        onClick={() => {
                                                            setData('cancion_id', c.id);
                                                            aplicarCancionATodos(c.id);
                                                        }}
                                                    >
                                                        <p className="text-[10px] font-bold truncate flex-1">
                                                            {c.titulo}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); toggleMúsica(c); }}
                                                            className="ml-2"
                                                        >
                                                            {playingId === c.id ? <Pause size={14} className={data.cancion_id === c.id ? "text-white" : "text-red-400"} /> : <Play size={14} className="text-[#A68966]" />}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paso === 3 && (
                                <div className="flex-1">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-black lowercase italic">objetos de memoria</h2>
                                        <p className="text-[10px] text-[#A68966] font-bold uppercase mt-1">Selección única</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        {recuerdos.map(r => (
                                            <div key={r.id} onClick={() => toggleSeleccionRecuerdo(r.id)} className={`p-6 rounded-[45px] border-2 cursor-pointer text-center transition-all ${data.recuerdos_seleccionados.includes(r.id) ? 'bg-[#5D4E3F] text-white border-[#5D4E3F]' : 'bg-[#FDFBF9] border-transparent'}`}>
                                                <div className="bg-white rounded-3xl p-3 mb-3 shadow-sm">
                                                    <img src={`/images/planes/recuerdos/${r.imagen || 'peluche_mouri.png'}`} className="w-20 h-20 mx-auto object-contain" alt={r.nombre} />
                                                    {/*<img src={`/images/planes/recuerdos/${r.imagen_url || 'peluche_mouri.png'}`} className="w-16 h-16 mx-auto object-contain" alt={r.nombre} />*/}
                                                </div>
                                                <p className="text-xs font-bold lowercase">{r.nombre}</p>
                                                <p className="text-[10px] opacity-40">$ {Number(r.precio_adicional).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            )}

                            {paso === 4 && (
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="bg-[#FDFBF9] p-10 rounded-[60px] border border-[#A68966]/10 shadow-inner overflow-hidden">
                                        <ShieldCheck className="mx-auto text-[#A68966] mb-6" size={48} />
                                        <h2 className="text-2xl font-black lowercase italic mb-6 text-center">compromiso de protección mouren</h2>

                                        <div className="max-h-40 overflow-y-auto pr-4 text-[11px] leading-relaxed text-[#5D4E3F]/70 text-justify space-y-3 mb-8 font-sans">
                                            <p>Yo, <strong>{nombreTitular || 'Usuario'}</strong>, acepto los términos de cobertura del Plan {plan.nombre}. Entiendo que la protección para mis {numPersonasActuales} protegidos iniciará tras la validación de mi primer pago.</p>
                                            <p>Me comprometo a mantener la veracidad de los datos suministrados. Mouren se reserva el derecho de solicitar documentación para validar los servicios funerarios y tributos especiales seleccionados.</p>
                                            <p>La cuota mensual de <strong>${totalCalculado.toLocaleString()}</strong> será facturada según el ciclo elegido.</p>
                                        </div>

                                        <label className="flex items-start gap-4 cursor-pointer p-4 bg-white rounded-3xl border border-[#A68966]/20">
                                            <input type="checkbox" className="w-5 h-5 mt-1 rounded-lg text-[#A68966] focus:ring-0" checked={aceptoTerminos} onChange={e => setAceptoTerminos(e.target.checked)} />
                                            <span className="text-[10px] font-bold leading-tight uppercase tracking-tight">He leído y acepto los términos del contrato de protección y la política de datos de Mouren.</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-8 flex justify-between items-center border-t border-[#5D4E3F]/5">
                                {paso > 1 && (
                                    <button onClick={() => setPaso(paso - 1)} className="text-[10px] font-black uppercase opacity-20 hover:opacity-100 transition-all tracking-widest">← atrás</button>
                                )}
                                <button
                                    onClick={() => paso === 4 ? enviarInscripcion() : validarPaso()}
                                    disabled={processing}
                                    className="bg-[#5D4E3F] text-white px-12 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] ml-auto shadow-lg hover:bg-[#4A3E32] transition-colors"
                                >
                                    {paso === 4 ? (processing ? 'procesando...' : 'activar protección') : 'siguiente'}
                                </button>
                            </div>
                        </div>

                        {/* PANEL DE RESUMEN */}
                        <div className="lg:col-span-5 sticky top-10">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[#A68966] rounded-[40px] transform -rotate-3 transition-transform group-hover:rotate-0 duration-500 shadow-xl opacity-20"></div>
                                <div className="relative bg-[#F4F1ED] border-2 border-[#5D4E3F]/10 rounded-[40px] p-8 shadow-2xl backdrop-blur-sm overflow-hidden">
                                    <div className="bg-[#5D4E3F] inline-block px-8 py-2 transform -skew-x-12 mb-8 ml-[-20px]">
                                        <h2 className="text-xl font-black text-[#FDFBF9] lowercase italic transform skew-x-12">tu resumen mouri</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center border-b-2 border-dashed border-[#5D4E3F]/20 pb-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A68966]">Plan Elegido</p>
                                                <p className="text-lg font-black text-[#5D4E3F] italic">{plan.nombre}</p>
                                            </div>
                                            <Gem className="text-[#A68966] opacity-40" size={32} />
                                        </div>

                                        <div className="bg-white/60 p-5 rounded-2xl border-l-8 border-[#A68966] transform hover:translate-x-2 transition-all">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-black uppercase text-[#5D4E3F]">Beneficiarios</span>
                                                <span className="text-3xl font-black italic text-[#A68966]">x{numPersonasActuales}</span>
                                            </div>
                                            <p className="text-[10px] font-bold opacity-50 mt-1">({MAX_PERSONAS - numPersonasActuales} cupos disponibles)</p>
                                        </div>

                                        {data.servicios_adicionales.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black uppercase text-[#A68966]">Servicios Extra:</p>
                                                {data.servicios_adicionales.map(id => {
                                                    const s = servicios.find(srv => srv.id === id);
                                                    return s ? (
                                                        <div key={id} className="flex justify-between text-[10px] font-bold lowercase italic">
                                                            <span>+ {s.nombre}</span>
                                                            <span>${Number(s.precio).toLocaleString()}</span>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}

                                        <div className="mt-10 relative group cursor-pointer">
                                            {/* Fondo decorativo */}
                                            <div className="absolute inset-0 bg-[#5D4E3F] rounded-3xl transform skew-y-3 transition-all duration-500 group-hover:skew-y-2 group-hover:scale-[1.02]"></div>

                                            {/* Glow */}
                                            <div className="absolute inset-0 rounded-3xl bg-[#A68966]/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                                            {/* Card */}
                                            <div className="relative overflow-hidden bg-[#FDFBF9] p-8 rounded-3xl transform -translate-y-2 -translate-x-2 transition-all duration-500 group-hover:-translate-y-4 group-hover:-translate-x-4 group-hover:shadow-2xl">

                                                {/* Shine Effect */}
                                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

                                                <p className="text-[10px] uppercase font-black text-[#A68966] mb-2 tracking-[0.2em] text-center">
                                                    Inversión Mensual
                                                </p>

                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-3xl font-black text-[#5D4E3F] transition-transform duration-300 group-hover:scale-110">
                                                        $
                                                    </span>

                                                    <span className="text-5xl font-black text-[#5D4E3F] tracking-tighter transition-all duration-300 group-hover:scale-105">
                                                        {totalCalculado.toLocaleString()}
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

            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#5D4E3F]/90 backdrop-blur-sm p-4">
                    <div className="bg-white p-12 rounded-[60px] text-center max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                        <img src="/images/login/mouri_registro_exitoso.png" className="w-32 h-32 mx-auto mb-6" alt="Éxito" />
                        <h2 className="text-3xl font-black text-[#5D4E3F] lowercase mb-2 italic">¡protección activada!</h2>
                        <button onClick={() => window.location.href = '/cliente/mi-plan'} className="mt-8 bg-[#A68966] text-white w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">ir a mi panel</button>
                    </div>
                </div>
            )}

            {errorModal.show && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
                    <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center">
                        <h2 className="text-xl font-black text-red-500 mb-4">
                            Mouri te informa
                        </h2>

                        <p className="text-sm text-gray-700">
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

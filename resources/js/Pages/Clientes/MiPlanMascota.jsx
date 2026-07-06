import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import MiPlanMascotaView from './Components/MiPlanMascotaView'; // <-- Importamos la vista aquí

export default function MiPlanMascota({ plan = {}, recuerdos = [], canciones = [], especies = [] }) {    const { auth } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [paso, setPaso] = useState(1);
    const [aceptoTerminos, setAceptoTerminos] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });

    const [playingId, setPlayingId] = useState(null);
    const audioRef = useRef(null);

    const nombreTitular = auth?.user?.nombre1 || auth?.user?.nombre || auth?.user?.name || '';

    // --- LÓGICA DE FORMULARIO PARA MASCOTAS ---
    const { data, setData, post, processing, errors } = useForm({
        usuario_id: auth?.user?.id,
        plan_id: plan?.id || null,
        cancion_id: '',
        mascotas: [
            {
                nombre: '',
                especie_id: '',
                especie_otra: '',
                raza: '',
                cancion_id: ''
            }
        ],
        recuerdos_seleccionados: [],
        cuota_mensual: 0
    });

    const aplicarCancionATodos = (id) => {
        setData(prevData => ({
            ...prevData,
            cancion_id: id,
            mascotas: prevData.mascotas.map(m => ({ ...m, cancion_id: id }))
        }));
    };

    // --- LÓGICA DE CÁLCULO ---
    const MAX_MASCOTAS = 3;
    const numMascotasActuales = data.mascotas.length;
    const valorCuotaBase = plan && plan.cuota_base ? parseFloat(plan.cuota_base) : 0;

    const totalCalculado = useMemo(() => {
        // 1. Calcular base por el número de mascotas en el formulario
        const base = valorCuotaBase * data.mascotas.length;

        // 2. Sumar los precios adicionales de los recuerdos seleccionados
        const extraRecuerdos = data.recuerdos_seleccionados.reduce((acc, id) => {
            const r = recuerdos.find(rec => rec.id === id);
            return acc + (r && r.precio_adicional ? parseFloat(r.precio_adicional) : 0);
        }, 0);

        return base + extraRecuerdos;
        // Dependencias limpias:
    }, [data.mascotas, data.recuerdos_seleccionados, valorCuotaBase, recuerdos]);

    useEffect(() => {
        setData('cuota_mensual', totalCalculado);
    }, [totalCalculado]);

    // --- VALIDACIONES DE PASOS ---
    const validarPaso = () => {
        if (paso === 1) {
            const incompletas = data.mascotas.some(m => {
                if (!m.nombre || !m.especie_id) return true;
                if (m.especie === 'Otro' && !m.especie_otra.trim()) return true;
                return false;
            });

            if (incompletas) {
                return alert("Mouri dice: ¡Guau! No dejes los datos de tu peludito vacíos. Recuerda llenar su nombre, especie o especificar cuál si elegiste 'Otro'.");
            }
        }
        if (paso === 2 && !data.cancion_id) {
            return alert("Mouri dice: Un tierno ronroneo necesita música de fondo. Elige una canción.");
        }
        if (paso === 3 && data.recuerdos_seleccionados.length === 0) {
            return alert("Mouri dice: Una huella eterna merece un hermoso recuerdo físico. Elige uno.");
        }
        setPaso(paso + 1);
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

    const toggleSeleccionRecuerdo = (id) => {
        const nuevaLista = data.recuerdos_seleccionados.includes(id) ? [] : [id];
        setData('recuerdos_seleccionados', nuevaLista);
    };

    const enviarInscripcion = () => {
        post(route('suscripciones_mascota.store'), {
            preserveScroll: true,
            onSuccess: () => setShowSuccessModal(true),
            onError: (errs) => {
                console.error("DEBUG ERRORES MASCOTA:", errs);
                setErrorModal({ show: true, message: "Error al guardar plan mascota: " + JSON.stringify(errs) });
            }
        });
    };

    // Inyectamos todo el estado y funciones hacia el archivo de la vista
    return (
        <MiPlanMascotaView
            plan={plan}
            recuerdos={recuerdos}
            canciones={canciones}
            especies={especies}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            paso={paso}
            setPaso={setPaso}
            aceptoTerminos={aceptoTerminos}
            setAceptoTerminos={setAceptoTerminos}
            showSuccessModal={showSuccessModal}
            setShowSuccessModal={setShowSuccessModal}
            errorModal={errorModal}
            setErrorModal={setErrorModal}
            playingId={playingId}
            audioRef={audioRef}
            nombreTitular={nombreTitular}
            data={data}
            setData={setData}
            processing={processing}
            aplicarCancionATodos={aplicarCancionATodos}
            numMascotasActuales={numMascotasActuales}
            MAX_MASCOTAS={MAX_MASCOTAS}
            valorCuotaBase={valorCuotaBase}
            totalCalculado={totalCalculado}
            validarPaso={validarPaso}
            toggleMúsica={toggleMúsica}
            toggleSeleccionRecuerdo={toggleSeleccionRecuerdo}
            enviarInscripcion={enviarInscripcion}
        />
    );
}
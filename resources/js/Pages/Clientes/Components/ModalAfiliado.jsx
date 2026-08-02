import { useState } from 'react';

export default function ModalAfiliado({
    visible,
    formAfiliado,
    setFormAfiliado,
    canciones,
    todosLosRecuerdos = [],
    generos = [],
    tiposDocumento = [],
    afiliados = [],
    guardarAfiliadoGabinete,
    cerrarModal
}) {

    const [erroresModal, setErroresModal] = useState({});

    if (!visible) return null;

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

    const esTitular = formAfiliado.parentesco?.toLowerCase() === 'titular';

    const validarYGuardar = (e) => {
        e.preventDefault();

        if (esTitular) {
            if (!formAfiliado.recuerdo_id) {
                setErroresModal({ recuerdo_id: 'Selecciona un recuerdo para el titular' });
                return;
            }
            setErroresModal({});
            guardarAfiliadoGabinete(e);
            return;
        }

        const nuevosErrores = {};

        if (!formAfiliado.genero_id) nuevosErrores.genero_id = 'Selecciona un género';
        if (!formAfiliado.tipo_documento_id) nuevosErrores.tipo_documento_id = 'Selecciona el tipo de documento';
        if (!formAfiliado.cedula || formAfiliado.cedula.trim() === '') {
            nuevosErrores.cedula = 'La cédula es obligatoria';
        } else {
            const cedulaRepetida = afiliados.some(a =>
                a.id !== formAfiliado.id && a.cedula?.trim() === formAfiliado.cedula.trim()
            );
            if (cedulaRepetida) nuevosErrores.cedula = 'Esta cédula ya está registrada en otro protegido';
        }

        if (!formAfiliado.fecha_nacimiento) {
            nuevosErrores.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
        } else {
            const edad = calcularEdad(formAfiliado.fecha_nacimiento);
            if (edad < 6 || edad > 75) {
                nuevosErrores.fecha_nacimiento = `Mouren solo cubre entre 6 y 75 años (esta persona tiene ${edad})`;
            }
        }

        if (!formAfiliado.recuerdo_id) {
            nuevosErrores.recuerdo_id = 'Selecciona un recuerdo para este protegido';
        }

        setErroresModal(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            return;
        }

        guardarAfiliadoGabinete(e);
    };

    const inputClase = (campo) =>
        `p-2.5 bg-white border rounded-xl text-[#60533E] font-bold w-full text-xs ${
            erroresModal[campo] ? 'border-red-400 ring-2 ring-red-300' : 'border-[#D9CEB6]'
        }`;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <form
                onSubmit={validarYGuardar}
                className="relative bg-[#FDFBF7] rounded-[28px] max-w-2xl w-full border-2 border-[#60533E] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Flor decorativa esquina superior derecha */}
                <div className="absolute -top-6 -right-2 w-42 pointer-events-none select-none opacity-90 z-0">
                    <img
                        src="/images/elementos_dashboard/detalles_plan/flores_colgantes.png"
                        alt=""
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* CABECERA fija */}
                <div className="px-6 pt-6 pb-3 border-b border-[#E3D9BC] relative z-10 bg-[#FDFBF7]">
                    <h3 className="font-black text-sm uppercase text-[#60533E] tracking-wide">
                        {formAfiliado.id ? 'Modificar' : 'Inscribir'} Protegido
                    </h3>
                    <p className="text-[10px] text-[#A68966] font-bold mt-0.5">
                        {esTitular ? 'Datos del titular de la protección' : 'Completa los datos del ser querido'}
                    </p>
                </div>

                {/* CUERPO con scroll si hace falta */}
                <div className="px-6 py-4 overflow-y-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">

                        {/* COLUMNA IZQUIERDA: datos básicos */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#A68966]">Datos básicos</p>

                            <div className="flex flex-col gap-1">
                                <label className="font-black uppercase text-gray-500 text-[10px]">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={formAfiliado.nombre}
                                    onChange={(e) => setFormAfiliado({ ...formAfiliado, nombre: e.target.value })}
                                    className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-[#60533E] font-bold text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                                    required
                                    disabled={esTitular}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                        <label className="font-black uppercase text-gray-500 text-[10px]">Parentesco / Vínculo</label>
                        {esTitular ? (
                            <input
                                type="text"
                                value={formAfiliado.parentesco}
                                className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-[#60533E] font-bold text-xs opacity-60 cursor-not-allowed"
                                disabled
                            />
                        ) : (
                            <select
                                value={formAfiliado.parentesco}
                                onChange={(e) => setFormAfiliado({ ...formAfiliado, parentesco: e.target.value })}
                                className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-[#60533E] font-bold text-xs"
                                required
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
                    </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-black uppercase text-amber-800 text-[10px]">Observaciones</label>
                                <textarea
                                    value={formAfiliado.observacion_funeraria}
                                    onChange={(e) => setFormAfiliado({ ...formAfiliado, observacion_funeraria: e.target.value })}
                                    className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl h-16 resize-none text-xs"
                                    placeholder="Ej: Especificaciones del memorial o capillas..."
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-black uppercase text-gray-500 text-[10px]">Canción</label>
                                <select
                                    value={formAfiliado.cancion_id || ''}
                                    onChange={(e) => setFormAfiliado({ ...formAfiliado, cancion_id: e.target.value })}
                                    className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-[#60533E] font-bold w-full text-xs"
                                    required
                                >
                                    <option value="">Seleccione una canción...</option>
                                    {canciones?.map((cancion) => (
                                        <option key={cancion.id} value={cancion.id}>
                                            {cancion.titulo} - {cancion.artista}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-black uppercase text-gray-500 text-[10px]">Recuerdo</label>
                                <select
                                    value={formAfiliado.recuerdo_id || ''}
                                    onChange={(e) => {
                                        setFormAfiliado({ ...formAfiliado, recuerdo_id: e.target.value });
                                        setErroresModal(prev => ({ ...prev, recuerdo_id: undefined }));
                                    }}
                                    className={inputClase('recuerdo_id')}
                                >
                                    <option value="">Seleccione un recuerdo...</option>
                                    {todosLosRecuerdos?.map((rec) => (
                                        <option key={rec.id} value={rec.id}>
                                            {rec.nombre} — ${Number(rec.precio_adicional || 0).toLocaleString('es-CO')}
                                        </option>
                                    ))}
                                </select>
                                {erroresModal.recuerdo_id && <p className="text-[9px] text-red-500 font-bold">{erroresModal.recuerdo_id}</p>}
                                <p className="text-[9px] text-[#A68966] italic">
                                    Este recuerdo es exclusivo para {formAfiliado.nombre || 'este protegido'}, no se comparte con los demás.
                                </p>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: datos personales */}
                        <div className="space-y-3">
                            {!esTitular ? (
                                <>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#A68966]">Datos personales</p>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-1">
                                            <label className="font-black uppercase text-gray-500 text-[10px]">Género</label>
                                            <select
                                                value={formAfiliado.genero_id || ''}
                                                onChange={(e) => {
                                                    setFormAfiliado({ ...formAfiliado, genero_id: e.target.value });
                                                    setErroresModal(prev => ({ ...prev, genero_id: undefined }));
                                                }}
                                                className={inputClase('genero_id')}
                                            >
                                                <option value="">Selecciona...</option>
                                                {generos.map(g => (
                                                    <option key={g.id} value={g.id}>{g.nombre}</option>
                                                ))}
                                            </select>
                                            {erroresModal.genero_id && <p className="text-[9px] text-red-500 font-bold">{erroresModal.genero_id}</p>}
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="font-black uppercase text-gray-500 text-[10px]">Tipo doc.</label>
                                            <select
                                                value={formAfiliado.tipo_documento_id || ''}
                                                onChange={(e) => {
                                                    setFormAfiliado({ ...formAfiliado, tipo_documento_id: e.target.value });
                                                    setErroresModal(prev => ({ ...prev, tipo_documento_id: undefined }));
                                                }}
                                                className={inputClase('tipo_documento_id')}
                                            >
                                                <option value="">Selecciona...</option>
                                                {tiposDocumento.map(td => (
                                                    <option key={td.id} value={td.id}>{td.nombre}</option>
                                                ))}
                                            </select>
                                            {erroresModal.tipo_documento_id && <p className="text-[9px] text-red-500 font-bold">{erroresModal.tipo_documento_id}</p>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="font-black uppercase text-gray-500 text-[10px]">Cédula</label>
                                        <input
                                            type="text"
                                            value={formAfiliado.cedula || ''}
                                            onChange={(e) => {
                                                setFormAfiliado({ ...formAfiliado, cedula: e.target.value });
                                                setErroresModal(prev => ({ ...prev, cedula: undefined }));
                                            }}
                                            className={inputClase('cedula')}
                                        />
                                        {erroresModal.cedula && <p className="text-[9px] text-red-500 font-bold">{erroresModal.cedula}</p>}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="font-black uppercase text-gray-500 text-[10px]">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            value={formAfiliado.fecha_nacimiento || ''}
                                            onChange={(e) => {
                                                setFormAfiliado({ ...formAfiliado, fecha_nacimiento: e.target.value });
                                                setErroresModal(prev => ({ ...prev, fecha_nacimiento: undefined }));
                                            }}
                                            className={inputClase('fecha_nacimiento')}
                                        />
                                        {erroresModal.fecha_nacimiento && <p className="text-[9px] text-red-500 font-bold">{erroresModal.fecha_nacimiento}</p>}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-[10px] text-[#A68966] italic text-center px-4">
                                        Los datos personales del titular se gestionan desde su perfil.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PIE fijo con botones */}
                <div className="px-6 py-4 border-t border-[#E3D9BC] flex gap-2 text-[10px] font-black uppercase tracking-wider bg-[#FDFBF7] relative z-10">
                    <button type="submit" className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl">
                        Confirmar
                    </button>
                    <button type="button" onClick={cerrarModal} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function GestionTiposDocumento({ tiposDocumento = [] }) {
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [editandoId, setEditandoId] = useState(null);
    const [nombreEditado, setNombreEditado] = useState('');
    const [procesando, setProcesando] = useState(false);

    const crear = (e) => {
        e.preventDefault();
        if (!nuevoNombre.trim()) return;
        setProcesando(true);
        router.post('/admin/tipos-documento', { nombre: nuevoNombre }, {
            preserveScroll: true,
            onFinish: () => { setProcesando(false); setNuevoNombre(''); }
        });
    };

    const iniciarEdicion = (tipo) => {
        setEditandoId(tipo.id);
        setNombreEditado(tipo.nombre);
    };

    const guardarEdicion = (id) => {
        if (!nombreEditado.trim()) return;
        setProcesando(true);
        router.put(`/admin/tipos-documento/${id}`, { nombre: nombreEditado }, {
            preserveScroll: true,
            onFinish: () => { setProcesando(false); setEditandoId(null); }
        });
    };

    const eliminar = (tipo) => {
        if (!window.confirm(`¿Eliminar el tipo de documento "${tipo.nombre}"? Esto solo funcionará si ningún usuario o afiliado lo está usando.`)) return;
        router.delete(`/admin/tipos-documento/${tipo.id}`, { preserveScroll: true });
    };

    return (
        <div className="bg-white border border-[#A68966]/20 rounded-[30px] p-6 shadow-sm">
            <div className="mb-5">
                <h3 className="text-md font-black text-[#8F7E54]">Tipos de documento</h3>
                <p className="text-[11px] text-[#5D4E3F]/60 font-bold">Crea, edita o elimina los tipos de documento disponibles</p>
            </div>

            {/* FORMULARIO: NUEVO TIPO */}
            <form onSubmit={crear} className="flex gap-2 mb-5">
                <input
                    type="text"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    placeholder="Ej: Cédula de extranjería"
                    className="flex-1 p-2.5 bg-[#F4EDE6] border border-[#D9CEB6] rounded-xl text-xs font-bold text-[#60533E] focus:ring-2 focus:ring-[#A68966]/40 outline-none"
                />
                <button
                    type="submit"
                    disabled={procesando || !nuevoNombre.trim()}
                    className="bg-[#56473A] text-white text-[11px] font-black px-4 py-2.5 rounded-xl hover:brightness-110 transition disabled:opacity-40 whitespace-nowrap"
                >
                    + Agregar
                </button>
            </form>

            {/* LISTA DE TIPOS EXISTENTES */}
            <div className="space-y-2">
                {tiposDocumento.length === 0 && (
                    <p className="text-center text-xs text-[#A68966] font-bold py-6">Aún no hay tipos de documento creados.</p>
                )}
                {tiposDocumento.map((tipo) => (
                    <div key={tipo.id} className="flex items-center justify-between gap-3 p-3 bg-[#F4EDE6]/60 rounded-xl border border-[#A68966]/10">
                        {editandoId === tipo.id ? (
                            <input
                                type="text"
                                value={nombreEditado}
                                onChange={(e) => setNombreEditado(e.target.value)}
                                autoFocus
                                className="flex-1 p-2 bg-white border border-[#D9CEB6] rounded-lg text-xs font-bold text-[#60533E]"
                            />
                        ) : (
                            <span className="text-xs font-bold text-[#5D4E3F]">{tipo.nombre}</span>
                        )}

                        <div className="flex items-center gap-3 flex-shrink-0">
                            {editandoId === tipo.id ? (
                                <>
                                    <button
                                        onClick={() => guardarEdicion(tipo.id)}
                                        disabled={procesando}
                                        className="text-[10px] font-black text-green-600 hover:underline"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => setEditandoId(null)}
                                        className="text-[10px] font-black text-gray-500 hover:underline"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => iniciarEdicion(tipo)}
                                        className="text-[10px] font-black text-[#4D78A3] hover:underline"
                                    >
                                        ✎ Editar
                                    </button>
                                    <button
                                        onClick={() => eliminar(tipo)}
                                        className="text-[10px] font-black text-red-500 hover:underline"
                                    >
                                        Eliminar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

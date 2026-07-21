import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function ModalEditarUsuario({ usuario, generos, tiposDocumento, procesando, setProcesando, onClose }) {
    // Partimos el campo 'nombre' completo en sus 4 partes, igual que hace Datos.jsx
    const partirNombre = (nombreCompleto) => {
        let n1 = '', n2 = '', a1 = '', a2 = '';
        if (nombreCompleto) {
            const partes = nombreCompleto.trim().split(/\s+/);
            if (partes.length === 2) {
                n1 = partes[0]; a1 = partes[1];
            } else if (partes.length === 3) {
                n1 = partes[0]; n2 = partes[1]; a1 = partes[2];
            } else if (partes.length >= 4) {
                n1 = partes[0]; n2 = partes[1]; a1 = partes[2]; a2 = partes.slice(3).join(' ');
            } else {
                n1 = nombreCompleto;
            }
        }
        return { n1, n2, a1, a2 };
    };

    const { n1, n2, a1, a2 } = partirNombre(usuario.nombre);

    const [form, setForm] = useState({
        nombre1: n1,
        nombre2: n2,
        apellido1: a1,
        apellido2: a2,
        cedula: usuario.cedula || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        genero_id: usuario.genero_id || '',
        tipo_documento_id: usuario.tipo_documento_id || '',
    });

    // 👇 ESTA función faltaba por completo. Sin ella, el formulario no tenía
    // a dónde mandar los datos y el onSubmit={enviar} lanzaba un error
    // porque "enviar" no existía en ningún lado.
    const enviar = (e) => {
        e.preventDefault();
        setProcesando(true);
        router.put(`/admin/usuarios/${usuario.id}/actualizar`, form, {
            preserveScroll: true,
            onFinish: () => {
                setProcesando(false);
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <form onSubmit={enviar} className="bg-[#FDFBF7] p-6 rounded-[28px] max-w-lg w-full border-2 border-[#60533E] shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto">
                <h3 className="font-black text-sm uppercase text-[#60533E]">Editar Usuario</h3>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-[#A68966]">Cédula</label>
                    <input required value={form.cedula} onChange={e => setForm({ ...form, cedula: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs font-bold text-[#60533E]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="Primer nombre" value={form.nombre1} onChange={e => setForm({ ...form, nombre1: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                    <input placeholder="Segundo nombre" value={form.nombre2} onChange={e => setForm({ ...form, nombre2: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                    <input required placeholder="Primer apellido" value={form.apellido1} onChange={e => setForm({ ...form, apellido1: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                    <input placeholder="Segundo apellido" value={form.apellido2} onChange={e => setForm({ ...form, apellido2: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                </div>

                <select value={form.tipo_documento_id} onChange={e => setForm({ ...form, tipo_documento_id: e.target.value })} className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs">
                    <option value="">Tipo de documento...</option>
                    {tiposDocumento.map(td => <option key={td.id} value={td.id}>{td.nombre}</option>)}
                </select>

                <select value={form.genero_id} onChange={e => setForm({ ...form, genero_id: e.target.value })} className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs">
                    <option value="">Género...</option>
                    {generos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>

                <input required type="email" placeholder="Correo" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                <input required placeholder="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />

                <div className="flex gap-2 text-[10px] font-black uppercase pt-2">
                    <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50">{procesando ? 'Guardando...' : 'Confirmar'}</button>
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl">Cancelar</button>
                </div>
            </form>
        </div>
    );
}

import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function ModalCrearCliente({ generos, tiposDocumento, procesando, setProcesando, onClose }) {
    const [form, setForm] = useState({
        tipo_usuario_id: '2',
        nombre1: '', nombre2: '', apellido1: '', apellido2: '',
        cedula: '', email: '', telefono: '', fecha_nacimiento: '',
        genero_id: '', tipo_documento_id: '', password: '',
    });

    const esAdmin = form.tipo_usuario_id === '1';

    const enviar = (e) => {
        e.preventDefault();
        setProcesando(true);
        // 🔒 Si es Cliente, nos aseguramos de no enviar ninguna contraseña,
        // aunque haya quedado algo escrito antes de cambiar el toggle.
        const datosAEnviar = esAdmin ? form : { ...form, password: '' };
        router.post('/admin/usuarios/crear', datosAEnviar, {
            preserveScroll: true,
            onFinish: () => { setProcesando(false); onClose(); }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <form onSubmit={enviar} className="bg-[#FDFBF7] p-6 rounded-[28px] max-w-lg w-full border-2 border-[#60533E] shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto">
                <h3 className="font-black text-sm uppercase text-[#60533E]">Nuevo Usuario</h3>

                <div className="flex gap-2">
                    <button type="button" onClick={() => setForm({ ...form, tipo_usuario_id: '2', password: '' })}
                        className={`flex-1 py-2 rounded-xl text-[11px] font-bold ${!esAdmin ? 'bg-[#60533E] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        👤 Cliente
                    </button>
                    <button type="button" onClick={() => setForm({ ...form, tipo_usuario_id: '1' })}
                        className={`flex-1 py-2 rounded-xl text-[11px] font-bold ${esAdmin ? 'bg-[#60533E] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        🛡️ Administrador
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="Primer nombre" value={form.nombre1} onChange={e => setForm({ ...form, nombre1: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                    <input placeholder="Segundo nombre" value={form.nombre2} onChange={e => setForm({ ...form, nombre2: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                    <input required placeholder="Primer apellido" value={form.apellido1} onChange={e => setForm({ ...form, apellido1: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                    <input placeholder="Segundo apellido" value={form.apellido2} onChange={e => setForm({ ...form, apellido2: e.target.value })} className="p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                </div>

                <select required value={form.tipo_documento_id} onChange={e => setForm({ ...form, tipo_documento_id: e.target.value })} className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs">
                    <option value="">Tipo de documento...</option>
                    {tiposDocumento.map(td => <option key={td.id} value={td.id}>{td.nombre}</option>)}
                </select>

                <input required placeholder="Cédula" value={form.cedula} onChange={e => setForm({ ...form, cedula: e.target.value })} className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />

                <select required value={form.genero_id} onChange={e => setForm({ ...form, genero_id: e.target.value })} className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs">
                    <option value="">Género...</option>
                    {generos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>

                <input required type="date" value={form.fecha_nacimiento} onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })} className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                <input required type="email" placeholder="Correo" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                <input required placeholder="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />

                {/* 🔒 El campo de contraseña ahora SOLO aparece para Administradores.
                    Los Clientes siempre reciben una contraseña generada por el sistema
                    y deben activarla vía "Recuperar contraseña" — así ningún admin
                    conoce ni define la clave de un cliente. */}
                {esAdmin ? (
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-[#A68966]">Contraseña inicial (opcional)</label>
                        <input type="text" placeholder="Déjalo vacío para generar una automática" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full p-2.5 bg-white border border-[#D9CEB6] rounded-xl text-xs" />
                        <p className="text-[9px] text-gray-500 italic">Si la defines aquí, díctasela al administrador para su primer ingreso. Podrá cambiarla luego en "Recuperar contraseña".</p>
                    </div>
                ) : (
                    <div className="bg-[#F4EDE6] border border-[#D9CEB6] rounded-xl p-3">
                        <p className="text-[10px] font-bold text-[#5D4E3F]">
                            🔒 Por seguridad, el cliente definirá su propia contraseña usando "Recuperar contraseña" en su primer ingreso.
                        </p>
                    </div>
                )}

                <div className="flex gap-2 text-[10px] font-black uppercase pt-2">
                    <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50">{procesando ? 'Creando...' : 'Confirmar'}</button>
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl">Cancelar</button>
                </div>
            </form>
        </div>
    );
}

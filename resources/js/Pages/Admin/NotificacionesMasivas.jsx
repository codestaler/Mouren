import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminSidebar from './AdminSidebar';

export default function NotificacionesMasivas() {
    const { flash } = usePage().props;

    const [titulo, setTitulo] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [publico, setPublico] = useState('todos');
    const [enlace, setEnlace] = useState('');
    const [imagen, setImagen] = useState(null);
    const [previewImagen, setPreviewImagen] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const manejarImagen = (e) => {
        const archivo = e.target.files[0];
        if (!archivo) {
            setImagen(null);
            setPreviewImagen(null);
            return;
        }
        setImagen(archivo);
        setPreviewImagen(URL.createObjectURL(archivo));
    };

    const enviar = (e) => {
        e.preventDefault();
        if (!titulo.trim() || !mensaje.trim()) return;

        setEnviando(true);

        // 🆕 Usamos FormData porque estamos mandando un archivo (imagen)
        const datos = new FormData();
        datos.append('titulo', titulo);
        datos.append('mensaje', mensaje);
        datos.append('publico', publico);
        if (enlace.trim()) datos.append('enlace', enlace.trim());
        if (imagen) datos.append('imagen', imagen);

        router.post('/admin/notificaciones/enviar', datos, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setTitulo('');
                setMensaje('');
                setEnlace('');
                setImagen(null);
                setPreviewImagen(null);
            },
            onFinish: () => setEnviando(false),
        });
    };

    return (
        <div className="min-h-screen bg-[#F4EDE6] dark:bg-[#221D17] font-['Hepta_Slab'] flex relative text-[#5D4E3F] dark:text-[#EDE4D3] transition-colors duration-500">
            <Head title="Anuncios - Mouren" />
            <AdminSidebar />

            <main className="flex-1 p-4 sm:p-10 content-shift transition-all duration-700">

                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                        📢 Enviar Anuncio
                    </h1>
                    <p className="text-[#7C6B58] dark:text-[#C2B49A] mt-1 text-[13px]">
                        Manda un mensaje (con imagen si quieres) a todos tus usuarios, o solo a un grupo.
                    </p>
                </header>

                {flash?.message && (
                    <div className="mb-6 bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800 text-green-800 dark:text-green-400 px-5 py-4 rounded-xl text-sm font-bold">
                        ✅ {flash.message}
                    </div>
                )}

                <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">

                    {/* ---------- FORMULARIO ---------- */}
                    <form onSubmit={enviar} className="bg-white dark:bg-[#2E2720] border border-transparent dark:border-[#4A4033] rounded-2xl shadow p-6 space-y-5">

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wide text-[#7C6B58] dark:text-[#C2B49A]">
                                Título
                            </label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ej: ¡Feliz Navidad de parte de Mouren! 🎄"
                                maxLength={150}
                                className="w-full mt-2 bg-[#FDFBF9] dark:bg-[#221D17] border border-[#E3D9BC] dark:border-[#4A4033] rounded-xl p-3 text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wide text-[#7C6B58] dark:text-[#C2B49A]">
                                Mensaje
                            </label>
                            <textarea
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                placeholder="Escribe aquí el mensaje completo..."
                                maxLength={1000}
                                className="w-full mt-2 bg-[#FDFBF9] dark:bg-[#221D17] border border-[#E3D9BC] dark:border-[#4A4033] rounded-xl p-3 text-sm h-28 resize-none"
                                required
                            />
                            <p className="text-[10px] text-right opacity-50 mt-1">{mensaje.length}/1000</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wide text-[#7C6B58] dark:text-[#C2B49A]">
                                Imagen (opcional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={manejarImagen}
                                className="w-full mt-2 text-sm"
                            />
                            <p className="text-[10px] opacity-50 mt-1">JPG o PNG, máximo 4MB.</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wide text-[#7C6B58] dark:text-[#C2B49A]">
                                Enlace al hacer clic (opcional)
                            </label>
                            <input
                                type="text"
                                value={enlace}
                                onChange={(e) => setEnlace(e.target.value)}
                                placeholder="Ej: /planes-disponibles"
                                className="w-full mt-2 bg-[#FDFBF9] dark:bg-[#221D17] border border-[#E3D9BC] dark:border-[#4A4033] rounded-xl p-3 text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wide text-[#7C6B58] dark:text-[#C2B49A]">
                                ¿A quién le llega?
                            </label>
                            <div className="flex gap-2 mt-2">
                                {[
                                    { valor: 'todos', etiqueta: 'Todos' },
                                    { valor: 'clientes', etiqueta: 'Solo clientes' },
                                    { valor: 'admins', etiqueta: 'Solo admins' },
                                ].map((op) => (
                                    <button
                                        key={op.valor}
                                        type="button"
                                        onClick={() => setPublico(op.valor)}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                                            publico === op.valor
                                                ? 'bg-[#8B5E3C] text-white'
                                                : 'bg-[#F2ECE5] dark:bg-[#221D17] text-[#5D4E3F] dark:text-[#EDE4D3]'
                                        }`}
                                    >
                                        {op.etiqueta}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={enviando}
                            className="w-full bg-[#8B5E3C] hover:bg-[#6F482D] text-white py-3.5 rounded-xl font-bold text-sm transition disabled:opacity-50"
                        >
                            {enviando ? 'Enviando...' : '📤 Enviar Anuncio'}
                        </button>
                    </form>

                    {/* ---------- VISTA PREVIA ---------- */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#7C6B58] dark:text-[#C2B49A] mb-3">
                            Vista previa
                        </p>
                        <div className="bg-[#FDF6E9] dark:bg-[#3A322A] border border-[#E8DFC8] dark:border-[#4A4033] rounded-2xl p-4 shadow-sm">
                            {previewImagen && (
                                <img src={previewImagen} alt="" className="w-full h-32 object-cover rounded-xl mb-3" />
                            )}
                            <p className="text-[11px] font-black text-[#5D4E3F] dark:text-[#EDE4D3]">
                                {titulo || 'Título del anuncio'}
                            </p>
                            <p className="text-[11px] text-[#6A5A48] dark:text-[#C2B49A] mt-1">
                                {mensaje || 'Aquí aparecerá el mensaje que escribas...'}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-2">Ahora mismo</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

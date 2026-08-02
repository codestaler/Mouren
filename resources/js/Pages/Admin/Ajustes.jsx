import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';

// Diccionario simple SOLO para esta pagina. Traducir toda la app requeriria
// una libreria como react-i18next repartida en cada pagina.
const TEXTOS = {
    es: {
        titulo: 'Ajustes',
        bienvenida: 'Bienvenido a',
        editarDatos: 'Editar datos personales básicos.',
        cambiarFoto: 'Cambiar foto o avatar.',
        cerrarSesiones: 'Cerrar sesión en todos los dispositivos.',
        seguridad: 'Seguridad',
        cambiarPassword: 'Cambiar contraseña',
        desactivar2FA: 'Desactivar verificación en dos pasos',
        activar2FA: 'Activar verificación en dos pasos',
        idioma: 'Idioma',
        soporte: 'Soporte',
        personalizacion: 'Personalización',
        modoClaro: 'Modo Claro',
        modoOscuro: 'Modo Oscuro',
        notificaciones: 'Notificaciones',
        activadas: 'Activadas',
        desactivadas: 'Desactivadas',
        bienvenidaCuervo: 'Bienvenido a los Ajustes de Mouren.',
        cuervoTexto: 'Aquí podrás personalizar tu experiencia y configurar las opciones que necesites.',
        cuervoVideo: 'Para comprender mejor el funcionamiento del dashboard, mira este video explicativo por favor da click aquí.',
        cuervoRecomendacion: 'Recomendación: súbele un poco al volumen y déjate llevar por la vibra clásica... como en los viejos tiempos del VHS.',
        banner: 'Ajustar es volver a rebobinar... y empezar mejor.',
    },
    en: {
        titulo: 'Settings',
        bienvenida: 'Welcome to',
        editarDatos: 'Edit basic personal info.',
        cambiarFoto: 'Change photo or avatar.',
        cerrarSesiones: 'Log out on all devices.',
        seguridad: 'Security',
        cambiarPassword: 'Change password',
        desactivar2FA: 'Disable two-factor verification',
        activar2FA: 'Enable two-factor verification',
        idioma: 'Language',
        soporte: 'Support',
        personalizacion: 'Personalization',
        modoClaro: 'Light Mode',
        modoOscuro: 'Dark Mode',
        notificaciones: 'Notifications',
        activadas: 'Enabled',
        desactivadas: 'Disabled',
        bienvenidaCuervo: 'Welcome to Mouren Settings.',
        cuervoTexto: 'Here you can personalize your experience and configure the options you need.',
        cuervoVideo: 'To better understand how the dashboard works, please watch this explainer video by clicking here.',
        cuervoRecomendacion: 'Recommendation: turn the volume up a bit and go with the classic vibe... like the old VHS days.',
        banner: 'Adjusting means rewinding... and starting better.',
    },
};

export default function Ajustes({ usuario, generos = [], tiposDocumento = [] }) {
    const { flash } = usePage().props;
    const t = TEXTOS[usuario.idioma] || TEXTOS.es;

    const [procesando, setProcesando] = useState(false);

    const [modalDatos, setModalDatos] = useState(false);
    const [nombre1, setNombre1] = useState('');
    const [nombre2, setNombre2] = useState('');
    const [apellido1, setApellido1] = useState('');
    const [apellido2, setApellido2] = useState('');
    const [telefono, setTelefono] = useState(usuario.telefono || '');
    const [email, setEmail] = useState(usuario.email || '');
    const [generoId, setGeneroId] = useState(usuario.genero_id || '');
    const [tipoDocumentoId, setTipoDocumentoId] = useState(usuario.tipo_documento_id || '');

    const enviarDatos = (e) => {
        e.preventDefault();
        setProcesando(true);
        router.put('/admin/ajustes/datos', {
            nombre1, nombre2, apellido1, apellido2, telefono, email,
            genero_id: generoId, tipo_documento_id: tipoDocumentoId,
        }, {
            preserveScroll: true,
            onFinish: () => { setProcesando(false); setModalDatos(false); },
        });
    };

    const [subiendoAvatar, setSubiendoAvatar] = useState(false);
    const inputAvatarRef = React.useRef(null);

    const enviarAvatar = (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;
        const form = new FormData();
        form.append('avatar', archivo);
        setSubiendoAvatar(true);
        router.post('/admin/ajustes/avatar', form, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => setSubiendoAvatar(false),
        });
    };

    const [modalCerrarSesiones, setModalCerrarSesiones] = useState(false);
    const [passwordCerrarSesiones, setPasswordCerrarSesiones] = useState('');

    const enviarCerrarSesiones = (e) => {
        e.preventDefault();
        if (!window.confirm('¿Seguro que quieres cerrar la sesión en todos los demás dispositivos?')) return;
        setProcesando(true);
        router.post('/admin/ajustes/cerrar-otras-sesiones', { password: passwordCerrarSesiones }, {
            preserveScroll: true,
            onFinish: () => { setProcesando(false); setModalCerrarSesiones(false); setPasswordCerrarSesiones(''); },
        });
    };

    const [modalPassword, setModalPassword] = useState(false);
    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNueva, setPasswordNueva] = useState('');
    const [passwordConfirmacion, setPasswordConfirmacion] = useState('');

    const enviarPassword = (e) => {
        e.preventDefault();
        setProcesando(true);
        router.put('/admin/ajustes/password', {
            password_actual: passwordActual,
            password: passwordNueva,
            password_confirmation: passwordConfirmacion,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setProcesando(false);
                setModalPassword(false);
                setPasswordActual(''); setPasswordNueva(''); setPasswordConfirmacion('');
            },
        });
    };

    const [modal2FA, setModal2FA] = useState(false);
    const [qr2FA, setQr2FA] = useState(null);
    const [codigo2FA, setCodigo2FA] = useState('');
    const [cargando2FA, setCargando2FA] = useState(false);

    const abrirModal2FA = () => {
        setModal2FA(true);
        setCargando2FA(true);
        axios.get('/admin/ajustes/2fa/iniciar')
            .then(res => setQr2FA(res.data.qr))
            .finally(() => setCargando2FA(false));
    };

    const confirmar2FA = (e) => {
        e.preventDefault();
        setProcesando(true);
        router.post('/admin/ajustes/2fa/confirmar', { codigo: codigo2FA }, {
            preserveScroll: true,
            onFinish: () => { setProcesando(false); setModal2FA(false); setQr2FA(null); setCodigo2FA(''); },
        });
    };

    const desactivar2FA = () => {
        const password = window.prompt('Ingresa tu contraseña para desactivar la verificación en dos pasos:');
        if (!password) return;
        router.post('/admin/ajustes/2fa/desactivar', { password }, { preserveScroll: true });
    };

    const cambiarIdioma = (idioma) => router.put('/admin/ajustes/idioma', { idioma }, { preserveScroll: true });
    const cambiarTema = (tema) => router.put('/admin/ajustes/tema', { tema }, { preserveScroll: true });
    const toggleNotificaciones = () => router.put('/admin/ajustes/notificaciones', { activadas: !usuario.notificaciones_activadas }, { preserveScroll: true });

    return (
        <div className="min-h-screen bg-[#F4EDE6] dark:bg-[#221D17] font-['Hepta_Slab'] flex relative text-[#5D4E3F] dark:text-[#EDE4D3] transition-colors duration-500">
            <Head title="Ajustes - Mouren" />
            <AdminSidebar />

            <main className="flex-1 p-8 content-shift transition-all duration-700">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-[#5D4E3F] dark:text-[#EDE4D3]">
                        {t.bienvenida} <span className="font-black text-[#8F7E54] dark:text-[#D9B44A]">{t.titulo}</span>
                    </h1>
                </header>

                {flash?.message && <div className="mb-6 p-4 bg-[#56473A] text-white rounded-2xl text-xs font-bold shadow-sm">✨ {flash.message}</div>}
                {flash?.error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border-l-4 border-red-500 shadow-sm">⚠️ {flash.error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-2 bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-6 shadow-sm flex gap-6">
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-full bg-[#EDE4D3] dark:bg-[#4A4033] overflow-hidden flex items-center justify-center">
                                {usuario.avatar ? (
                                    <img src={usuario.avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl">👤</span>
                                )}
                            </div>
                            <button
                                onClick={() => inputAvatarRef.current.click()}
                                disabled={subiendoAvatar}
                                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#56473A] text-white text-xs flex items-center justify-center shadow-md hover:brightness-110"
                                title="Cambiar foto"
                            >
                                {subiendoAvatar ? '…' : '📷'}
                            </button>
                            <input ref={inputAvatarRef} type="file" accept="image/*" className="hidden" onChange={enviarAvatar} />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-black text-[#5D4E3F] dark:text-[#EDE4D3] text-sm">{usuario.nombre}</h3>
                            <p className="text-xs text-[#A68966] dark:text-[#C2B49A]">C.C. {usuario.cedula}</p>
                            <p className="text-xs text-[#A68966] dark:text-[#C2B49A] mb-3">{usuario.email}</p>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold">
                                <button onClick={() => setModalDatos(true)} className="text-[#4D78A3] dark:text-[#7FAEDD] hover:underline">{t.editarDatos}</button>
                                <button onClick={() => inputAvatarRef.current.click()} className="text-[#4D78A3] dark:text-[#7FAEDD] hover:underline">{t.cambiarFoto}</button>
                                <button onClick={() => setModalCerrarSesiones(true)} className="text-red-500 hover:underline">{t.cerrarSesiones}</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-6 shadow-sm">
                        <h3 className="text-sm font-black text-[#8F7E54] dark:text-[#D9B44A] mb-4">{t.seguridad}</h3>
                        <div className="space-y-2">
                            <button onClick={() => setModalPassword(true)}
                                className="w-full py-2.5 rounded-xl bg-[#56473A] text-white text-[11px] font-black hover:brightness-110 transition">
                                {t.cambiarPassword}
                            </button>
                            {usuario.dos_pasos_activo ? (
                                <button onClick={desactivar2FA}
                                    className="w-full py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 text-[11px] font-black hover:bg-red-100 transition">
                                    {t.desactivar2FA}
                                </button>
                            ) : (
                                <button onClick={abrirModal2FA}
                                    className="w-full py-2.5 rounded-xl bg-[#56473A] text-white text-[11px] font-black hover:brightness-110 transition">
                                    {t.activar2FA}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-5 shadow-sm">
                        <h4 className="text-[11px] font-black text-[#8F7E54] dark:text-[#D9B44A] uppercase mb-2">{t.idioma}</h4>
                        <select
                            value={usuario.idioma}
                            onChange={(e) => cambiarIdioma(e.target.value)}
                            className="w-full bg-transparent text-sm font-bold text-[#5D4E3F] dark:text-[#EDE4D3] outline-none"
                        >
                            <option value="es" className="text-black">Español</option>
                            <option value="en" className="text-black">English</option>
                        </select>
                    </div>

                    <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-5 shadow-sm">
                        <h4 className="text-[11px] font-black text-[#8F7E54] dark:text-[#D9B44A] uppercase mb-2">{t.soporte}</h4>
                        <a href="https://wa.me/573001112233" target="_blank" rel="noreferrer" className="text-sm font-bold text-[#4D78A3] dark:text-[#7FAEDD] hover:underline">
                            WhatsApp
                        </a>
                    </div>

                    <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-5 shadow-sm">
                        <h4 className="text-[11px] font-black text-[#8F7E54] dark:text-[#D9B44A] uppercase mb-2">{t.personalizacion}</h4>
                        <div className="flex gap-2 text-xs font-bold">
                            <button onClick={() => cambiarTema('claro')} className={usuario.tema === 'claro' ? 'text-[#5D4E3F] dark:text-[#EDE4D3] underline' : 'text-gray-400'}>{t.modoClaro}</button>
                            <span className="text-gray-300">/</span>
                            <button onClick={() => cambiarTema('oscuro')} className={usuario.tema === 'oscuro' ? 'text-[#5D4E3F] dark:text-[#EDE4D3] underline' : 'text-gray-400'}>{t.modoOscuro}</button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-5 shadow-sm">
                        <h4 className="text-[11px] font-black text-[#8F7E54] dark:text-[#D9B44A] uppercase mb-2">{t.notificaciones}</h4>
                        <button onClick={toggleNotificaciones} className={`text-sm font-bold ${usuario.notificaciones_activadas ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                            {usuario.notificaciones_activadas ? t.activadas : t.desactivadas}
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#2E2720] border border-[#A68966]/20 dark:border-[#4A4033] rounded-[24px] p-6 shadow-sm mb-6 flex gap-6 items-center">
                    <div className="shrink-0 w-24 h-24 rounded-full bg-[#EDE4D3] dark:bg-[#4A4033] flex items-center justify-center text-5xl">
                        🐦‍⬛
                    </div>
                    <div className="flex-1">
                        <p className="font-black text-[#5D4E3F] dark:text-[#EDE4D3] text-sm mb-1">{t.bienvenidaCuervo}</p>
                        <p className="text-xs text-[#6A5A48] dark:text-[#C2B49A] mb-2">{t.cuervoTexto}</p>
                        <a href="https://youtu.be/f4mGl-kc11M?si=s4AslyISPp0O6a9D" className="text-xs font-bold text-[#4D78A3] dark:text-[#7FAEDD] hover:underline block mb-2">
                            {t.cuervoVideo}
                        </a>
                        <p className="text-[10px] italic text-[#A68966] dark:text-[#8F8368]">{t.cuervoRecomendacion}</p>
                    </div>
                </div>

                <div className="bg-[#56473A] dark:bg-[#3A322A] rounded-[24px] p-6 text-center shadow-sm">
                    <p className="text-white text-lg font-black">{t.banner}</p>
                </div>
            </main>

            {modalDatos && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <form onSubmit={enviarDatos} className="bg-[#FDFBF7] dark:bg-[#2E2720] p-6 rounded-[28px] max-w-sm w-full border-2 border-[#60533E] dark:border-[#4A4033] shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto">
                        <h3 className="font-black text-sm uppercase text-[#60533E] dark:text-[#D9B44A]">Editar Datos Personales</h3>
                        <input value={nombre1} onChange={e => setNombre1(e.target.value)} placeholder="Primer nombre" className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold" required />
                        <input value={nombre2} onChange={e => setNombre2(e.target.value)} placeholder="Segundo nombre (opcional)" className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold" />
                        <input value={apellido1} onChange={e => setApellido1(e.target.value)} placeholder="Primer apellido" className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold" required />
                        <input value={apellido2} onChange={e => setApellido2(e.target.value)} placeholder="Segundo apellido (opcional)" className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold" />
                        <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Teléfono" className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold" required />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold" required />

                        <select value={generoId} onChange={e => setGeneroId(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold">
                            <option value="">Selecciona un género...</option>
                            {generos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                        </select>

                        <select value={tipoDocumentoId} onChange={e => setTipoDocumentoId(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold">
                            <option value="">Selecciona tipo de documento...</option>
                            {tiposDocumento.map(td => <option key={td.id} value={td.id}>{td.nombre}</option>)}
                        </select>

                        <div className="flex gap-2 text-[10px] font-black uppercase pt-2">
                            <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50">{procesando ? 'Guardando...' : 'Confirmar'}</button>
                            <button type="button" onClick={() => setModalDatos(false)} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {modalCerrarSesiones && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <form onSubmit={enviarCerrarSesiones} className="bg-[#FDFBF7] dark:bg-[#2E2720] p-6 rounded-[28px] max-w-sm w-full border-2 border-[#60533E] dark:border-[#4A4033] shadow-2xl space-y-3">
                        <h3 className="font-black text-sm uppercase text-[#60533E] dark:text-[#D9B44A]">Cerrar Sesión en Todos los Dispositivos</h3>
                        <p className="text-[10px] text-[#A68966] dark:text-[#C2B49A]">Ingresa tu contraseña para confirmar.</p>
                        <input type="password" value={passwordCerrarSesiones} onChange={e => setPasswordCerrarSesiones(e.target.value)} placeholder="Contraseña" className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold" required />
                        <div className="flex gap-2 text-[10px] font-black uppercase pt-2">
                            <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl disabled:opacity-50">{procesando ? 'Procesando...' : 'Confirmar'}</button>
                            <button type="button" onClick={() => setModalCerrarSesiones(false)} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {modalPassword && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <form onSubmit={enviarPassword} className="bg-[#FDFBF7] dark:bg-[#2E2720] p-6 rounded-[28px] max-w-sm w-full border-2 border-[#60533E] dark:border-[#4A4033] shadow-2xl space-y-3">
                        <h3 className="font-black text-sm uppercase text-[#60533E] dark:text-[#D9B44A]">Cambiar Contraseña</h3>
                        <input type="password" value={passwordActual} onChange={e => setPasswordActual(e.target.value)} placeholder="Contraseña actual" className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold" required />
                        <input type="password" value={passwordNueva} onChange={e => setPasswordNueva(e.target.value)} placeholder="Nueva contraseña" className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold" required />
                        <input type="password" value={passwordConfirmacion} onChange={e => setPasswordConfirmacion(e.target.value)} placeholder="Confirmar nueva contraseña" className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold" required />
                        <div className="flex gap-2 text-[10px] font-black uppercase pt-2">
                            <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50">{procesando ? 'Guardando...' : 'Confirmar'}</button>
                            <button type="button" onClick={() => setModalPassword(false)} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {modal2FA && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <form onSubmit={confirmar2FA} className="bg-[#FDFBF7] dark:bg-[#2E2720] p-6 rounded-[28px] max-w-sm w-full border-2 border-[#60533E] dark:border-[#4A4033] shadow-2xl space-y-3">
                        <h3 className="font-black text-sm uppercase text-[#60533E] dark:text-[#D9B44A]">Activar Verificación en Dos Pasos</h3>
                        <p className="text-[10px] text-[#A68966] dark:text-[#C2B49A]">Escanea el código con Google Authenticator (o similar) y luego ingresa el código de 6 dígitos.</p>

                        {cargando2FA && <p className="text-xs italic text-center py-6">Generando código QR...</p>}
                        {qr2FA && (
                            <div className="flex justify-center bg-white p-3 rounded-xl border border-[#D9CEB6]" dangerouslySetInnerHTML={{ __html: qr2FA }} />
                        )}

                        <input
                            value={codigo2FA}
                            onChange={e => setCodigo2FA(e.target.value)}
                            placeholder="Código de 6 dígitos"
                            maxLength={6}
                            className="w-full p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-center tracking-widest"
                            required
                        />
                        <div className="flex gap-2 text-[10px] font-black uppercase pt-2">
                            <button type="submit" disabled={procesando} className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50">{procesando ? 'Verificando...' : 'Confirmar'}</button>
                            <button type="button" onClick={() => { setModal2FA(false); setQr2FA(null); }} className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

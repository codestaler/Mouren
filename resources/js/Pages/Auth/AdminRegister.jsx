import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';

// Mismo patrón de diccionario que ya usas en Dashboard.jsx
const TEXTOS = {
    es: {
        panelPrincipal: 'Panel Principal',
        gestionUsuarios: 'Gestión de Usuarios',
        serviciosFunerarios: 'Servicios Funerarios',
        informesVentas: 'Informes de Ventas',
        ajustes: 'Ajustes',
        anuncios: '📢 Anuncios',
        cerrarSesion: 'CERRAR SESIÓN',
        notificaciones: 'Notificaciones',
        marcarTodasLeidas: 'Marcar todas como leídas',
        sinNotificaciones: 'No tienes notificaciones.',
        ahoraMismo: 'Ahora mismo',
        hace: 'Hace',
        min: 'min',
        h: 'h',
        d: 'd',
        menu: 'Menú',
        enviarATodos: '📢 Enviar a todos',
        nuevaNotificacionTitulo: 'Enviar notificación a todos los usuarios',
        tituloCampo: 'Título',
        mensajeCampo: 'Mensaje',
        imagenCampo: 'Imagen (opcional)',
        enlaceCampo: 'Enlace al hacer clic (opcional)',
        enviar: 'Enviar a todos',
        enviando: 'Enviando...',
        cancelar: 'Cancelar',
        placeholderTitulo: 'Ej: ¡Feliz Navidad! 🎄',
        placeholderMensaje: 'Escribe aquí el mensaje para todos los usuarios...',
    },
    en: {
        panelPrincipal: 'Main Panel',
        gestionUsuarios: 'User Management',
        serviciosFunerarios: 'Funeral Services',
        informesVentas: 'Sales Reports',
        ajustes: 'Settings',
        anuncios: '📢 Announcements',
        cerrarSesion: 'LOG OUT',
        notificaciones: 'Notifications',
        marcarTodasLeidas: 'Mark all as read',
        sinNotificaciones: "You don't have any notifications.",
        ahoraMismo: 'Just now',
        hace: '',
        min: 'min ago',
        h: 'h ago',
        d: 'd ago',
        menu: 'Menu',
        enviarATodos: '📢 Send to everyone',
        nuevaNotificacionTitulo: 'Send notification to all users',
        tituloCampo: 'Title',
        mensajeCampo: 'Message',
        imagenCampo: 'Image (optional)',
        enlaceCampo: 'Link on click (optional)',
        enviar: 'Send to everyone',
        enviando: 'Sending...',
        cancelar: 'Cancel',
        placeholderTitulo: 'E.g: Merry Christmas! 🎄',
        placeholderMensaje: 'Write the message for all users here...',
    },
};

export default function AdminSidebar() {
    const { url, props } = usePage();
    const [isOpen, setIsOpen] = useState(true);

    // 🆕 Idioma del usuario logueado — mismo campo que ya usa Dashboard.jsx
    const idioma = props?.auth?.user?.idioma || 'es';
    const t = TEXTOS[idioma] || TEXTOS.es;

    // 🌗 SINCRONIZACIÓN GLOBAL DE MODO OSCURO
    useEffect(() => {
        const tema = props?.auth?.user?.tema || 'claro';
        if (tema === 'oscuro') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [props?.auth?.user?.tema]);

    // 🔔 NOTIFICACIONES
    const [notifAbierta, setNotifAbierta] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const notifRef = useRef(null);

    // 🆕 MODAL: Enviar notificación a todos los usuarios
    const [mostrarModalBroadcast, setMostrarModalBroadcast] = useState(false);
    const [tituloBroadcast, setTituloBroadcast] = useState('');
    const [mensajeBroadcast, setMensajeBroadcast] = useState('');
    const [enlaceBroadcast, setEnlaceBroadcast] = useState('');
    const [imagenBroadcast, setImagenBroadcast] = useState(null);
    const [previewImagenBroadcast, setPreviewImagenBroadcast] = useState(null);
    const [enviandoBroadcast, setEnviandoBroadcast] = useState(false);

    const cargarNotificaciones = () => {
        axios.get('/admin/notificaciones')
            .then(res => {
                setNotificaciones(res.data.notificaciones);
                setNoLeidas(res.data.no_leidas);
            })
            .catch(() => {});
    };

    useEffect(() => {
        cargarNotificaciones();
        const intervalo = setInterval(cargarNotificaciones, 30000); // refresca cada 30s
        return () => clearInterval(intervalo);
    }, []);

    // Cierra el desplegable si haces click afuera
    useEffect(() => {
        const manejarClickAfuera = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifAbierta(false);
            }
        };
        document.addEventListener('mousedown', manejarClickAfuera);
        return () => document.removeEventListener('mousedown', manejarClickAfuera);
    }, []);

    const clickNotificacion = (notif) => {
        if (!notif.leido) {
            axios.post(`/admin/notificaciones/${notif.id}/marcar-leida`).then(() => {
                setNotificaciones(prev => prev.map(n => n.id === notif.id ? { ...n, leido: true } : n));
                setNoLeidas(prev => Math.max(0, prev - 1));
            });
        }
        setNotifAbierta(false);
        if (notif.enlace) {
            router.visit(notif.enlace);
        }
    };

    const marcarTodasLeidas = () => {
        axios.post('/admin/notificaciones/marcar-todas-leidas').then(() => {
            setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
            setNoLeidas(0);
        });
    };

    // 🆕 Al elegir una imagen, generamos una vista previa local (no sube nada todavía)
    const manejarSeleccionImagen = (e) => {
        const archivo = e.target.files?.[0] || null;
        setImagenBroadcast(archivo);
        setPreviewImagenBroadcast(archivo ? URL.createObjectURL(archivo) : null);
    };

    const resetearFormularioBroadcast = () => {
        setTituloBroadcast('');
        setMensajeBroadcast('');
        setEnlaceBroadcast('');
        setImagenBroadcast(null);
        setPreviewImagenBroadcast(null);
    };

    // 🆕 Envía la notificación a TODOS los usuarios. Usa FormData porque puede llevar imagen.
    const enviarNotificacionMasiva = (e) => {
        e.preventDefault();
        if (!tituloBroadcast.trim() || !mensajeBroadcast.trim()) return;

        const formData = new FormData();
        formData.append('titulo', tituloBroadcast);
        formData.append('mensaje', mensajeBroadcast);
        if (enlaceBroadcast.trim()) formData.append('enlace', enlaceBroadcast.trim());
        if (imagenBroadcast) formData.append('imagen', imagenBroadcast);

        setEnviandoBroadcast(true);

        router.post('/admin/notificaciones/enviar-masiva', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setEnviandoBroadcast(false);
                setMostrarModalBroadcast(false);
                resetearFormularioBroadcast();
            },
            onError: () => setEnviandoBroadcast(false),
        });
    };

    // 🆕 Traducido: respeta el idioma activo para "Ahora mismo / Just now", "Hace X min / X min ago", etc.
    const tiempoRelativo = (fecha) => {
        const diffMs = Date.now() - new Date(fecha).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return t.ahoraMismo;
        if (mins < 60) return idioma === 'en' ? `${mins} ${t.min}` : `${t.hace} ${mins} ${t.min}`;
        const horas = Math.floor(mins / 60);
        if (horas < 24) return idioma === 'en' ? `${horas} ${t.h}` : `${t.hace} ${horas} ${t.h}`;
        const dias = Math.floor(horas / 24);
        return idioma === 'en' ? `${dias} ${t.d}` : `${t.hace} ${dias} ${t.d}`;
    };

    const active = (path) =>
        url.startsWith(path)
            ? "border-b-2 border-[#FFC600] text-[#FFC600] font-bold drop-shadow-[0_0_6px_rgba(255,245,204,0.4)]"
            : "text-white opacity-85 hover:opacity-100 transition-all hover:translate-x-1 hover:text-[#FFF5CC] hover:drop-shadow-[0_0_8px_rgba(255,245,204,0.6)]";

    return (
        <>
            {/* 🔔 CAMPANITA DE NOTIFICACIONES - fija arriba a la derecha, visible en toda la app admin */}
            <div ref={notifRef} className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60]">
                <button
                    onClick={() => setNotifAbierta(!notifAbierta)}
                    className="relative w-11 h-11 rounded-full bg-white dark:bg-[#2E2720] shadow-md border border-[#A68966]/20 dark:border-[#4A4033] flex items-center justify-center text-lg hover:scale-105 transition-all"
                >
                    🔔
                    {noLeidas > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#221D17]">
                            {noLeidas > 9 ? '9+' : noLeidas}
                        </span>
                    )}
                </button>

                {notifAbierta && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-[#2E2720] rounded-2xl shadow-2xl border border-[#A68966]/20 dark:border-[#4A4033] overflow-hidden">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-[#E8DFC8] dark:border-[#4A4033]">
                            <h4 className="text-xs font-black text-[#5D4E3F] dark:text-[#EDE4D3] uppercase tracking-wide">{t.notificaciones}</h4>
                            {noLeidas > 0 && (
                                <button onClick={marcarTodasLeidas} className="text-[10px] font-bold text-[#4D78A3] dark:text-[#7FAEDD] hover:underline">
                                    {t.marcarTodasLeidas}
                                </button>
                            )}
                        </div>

                        {/* 🆕 Botón para abrir el modal de envío masivo */}
                        <button
                            onClick={() => { setNotifAbierta(false); setMostrarModalBroadcast(true); }}
                            className="w-full text-left px-4 py-2.5 text-[11px] font-black text-[#8B5E3C] dark:text-[#D9B44A] hover:bg-[#F4EDE6] dark:hover:bg-[#221D17] transition border-b border-[#E8DFC8] dark:border-[#4A4033]"
                        >
                            {t.enviarATodos}
                        </button>

                        <div className="max-h-80 overflow-y-auto">
                            {notificaciones.length === 0 ? (
                                <p className="text-xs text-center text-gray-400 italic py-8">{t.sinNotificaciones}</p>
                            ) : (
                                notificaciones.map((notif) => (
                                    <button
                                        key={notif.id}
                                        onClick={() => clickNotificacion(notif)}
                                        className={`w-full text-left px-4 py-3 border-b border-[#F4EDE6] dark:border-[#221D17] last:border-0 transition ${
                                            notif.leido ? 'bg-white dark:bg-[#2E2720] hover:bg-[#F9F6F0] dark:hover:bg-[#221D17]' : 'bg-[#FDF6E9] dark:bg-[#3A322A] hover:bg-[#FBEFD8] dark:hover:bg-[#4A4033]'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {!notif.leido && <span className="w-2 h-2 rounded-full bg-[#D9B44A] mt-1 shrink-0" />}
                                            {notif.imagen && (
                                                <img src={notif.imagen} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                {notif.titulo && (
                                                    <p className="text-[11px] font-black text-[#5D4E3F] dark:text-[#EDE4D3] truncate">{notif.titulo}</p>
                                                )}
                                                <p className="text-[11px] text-[#6A5A48] dark:text-[#C2B49A] line-clamp-2">{notif.mensaje}</p>
                                                <p className="text-[9px] text-gray-400 mt-1">{tiempoRelativo(notif.fecha)}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* TIRADOR DE CUERDA */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-0 left-0 z-50 cursor-pointer transition-transform duration-500 hover:scale-105"
                style={{ width: '120px' }}
            >
                <img
                    src="/images/esquina-decorativa.png"
                    className="w-[130px]"
                    alt={t.menu}
                />
            </div>

            {/* ASIDE REFINADO Y DELGADO */}
            <aside className={`fixed top-0 left-0 h-screen bg-[#5D4E3F] shadow-2xl transition-all duration-700 ease-in-out z-40 flex flex-col overflow-hidden ${isOpen ? 'w-60' : 'w-0'}`}>

                <div className="absolute inset-0 pointer-events-none z-0">
                    <img
                        src="/images/Admin/Panel_principal/vitral.png.jpg"
                        alt=""
                        className="absolute bottom-0 left-0 w-full h-[60%] object-cover opacity-20 object-bottom"
                        style={{
                            WebkitMaskImage: "linear-gradient(to top, black 5%, transparent 90%)",
                            maskImage: "linear-gradient(to top, black 20%, transparent 70%)",
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#5D4E3F] via-[#5D4E3F]/80 to-transparent"></div>
                </div>

                <div className="relative h-32 flex items-center justify-center flex-shrink-0 mt-4 z-10">
                    <img
                        src="/images/esquina-decorativa.png"
                        className="absolute top-[-10] left-0 w-[400px] opacity-10 pointer-events-none scale-110 origin-top-left mt-[-10px]"
                    />
                    <img
                        src="/images/logo.png"
                        className="relative z-10 w-32"
                        style={{ filter: 'brightness(0) invert(1)' }}
                        alt="Mouren"
                    />
                </div>

                <nav className="flex-1 px-6 mt-2 min-w-[240px] z-10">
                    <div className="flex flex-col gap-6 font-['Hepta_Slab'] tracking-wide">
                        <Link href="/admin/dashboard" className={`text-sm md:text-sm w-fit flex items-center gap-2 ${active('/admin/dashboard')}`}>
                            {t.panelPrincipal}
                        </Link>
                        <Link href="/admin/gestion-usuarios" className={`text-sm md:text-sm w-fit ${active('/admin/gestion-usuarios')}`}>
                            {t.gestionUsuarios}
                        </Link>
                        <Link href="/admin/servicios-funerarios" className={`text-sm md:text-sm w-fit ${active('/admin/servicios-funerarios')}`}>
                            {t.serviciosFunerarios}
                        </Link>
                        <Link href="/admin/ventas" className={`text-sm md:text-sm w-fit ${active('/admin/ventas')}`}>
                            {t.informesVentas}
                        </Link>
                        <Link href="/admin/notificaciones/enviar" className={`text-sm md:text-sm w-fit ${active('/admin/notificaciones/enviar')}`}>
                            {t.anuncios}
                        </Link>
                        <Link href="/admin/ajustes" className={`text-sm md:text-sm w-fit ${active('/admin/ajustes')}`}>
                            {t.ajustes}
                        </Link>
                    </div>
                </nav>

                <div className="p-5 mt-auto min-w-[240px] z-10">
                    <Link
                        href="/force-logout"
                        className="group flex items-center justify-center gap-2 bg-[#A68966] text-[#F4EDE6] py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-[0.15em] transition-all hover:bg-[#FFC600] hover:text-[#5D4E3F] hover:shadow-lg active:scale-95"
                    >
                        <span>{t.cerrarSesion}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </aside>

            {/* 🆕 MODAL: Enviar notificación a todos los usuarios */}
            {mostrarModalBroadcast && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                    <form
                        onSubmit={enviarNotificacionMasiva}
                        className="bg-[#FDFBF7] dark:bg-[#2E2720] p-6 rounded-[28px] max-w-md w-full border-2 border-[#60533E] dark:border-[#4A4033] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-sm uppercase text-[#60533E] dark:text-[#D9B44A]">
                                {t.nuevaNotificacionTitulo}
                            </h3>
                            <button
                                type="button"
                                onClick={() => { setMostrarModalBroadcast(false); resetearFormularioBroadcast(); }}
                                className="text-xl text-[#60533E] dark:text-[#D9B44A] hover:text-red-500 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-[#A68966]">{t.tituloCampo}</label>
                            <input
                                type="text"
                                value={tituloBroadcast}
                                onChange={(e) => setTituloBroadcast(e.target.value)}
                                placeholder={t.placeholderTitulo}
                                maxLength={150}
                                required
                                className="w-full mt-1 p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E]"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-[#A68966]">{t.mensajeCampo}</label>
                            <textarea
                                value={mensajeBroadcast}
                                onChange={(e) => setMensajeBroadcast(e.target.value)}
                                placeholder={t.placeholderMensaje}
                                maxLength={1000}
                                required
                                className="w-full mt-1 p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs h-24 resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-[#A68966]">{t.imagenCampo}</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={manejarSeleccionImagen}
                                className="w-full mt-1 text-[11px] font-bold text-[#60533E] dark:text-[#EDE4D3]"
                            />
                            {previewImagenBroadcast && (
                                <img src={previewImagenBroadcast} alt="Vista previa" className="mt-2 w-full max-h-40 object-cover rounded-xl border border-[#D9CEB6] dark:border-[#4A4033]" />
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-[#A68966]">{t.enlaceCampo}</label>
                            <input
                                type="text"
                                value={enlaceBroadcast}
                                onChange={(e) => setEnlaceBroadcast(e.target.value)}
                                placeholder="/mi-plan"
                                className="w-full mt-1 p-2.5 bg-white dark:bg-[#221D17] dark:text-[#EDE4D3] border border-[#D9CEB6] dark:border-[#4A4033] rounded-xl text-xs font-bold text-[#60533E]"
                            />
                        </div>

                        <div className="flex gap-2 text-[10px] font-black uppercase pt-2">
                            <button
                                type="submit"
                                disabled={enviandoBroadcast}
                                className="flex-1 py-2.5 bg-[#60533E] text-white rounded-xl disabled:opacity-50"
                            >
                                {enviandoBroadcast ? t.enviando : t.enviar}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMostrarModalBroadcast(false); resetearFormularioBroadcast(); }}
                                className="flex-1 py-2.5 bg-gray-200 dark:bg-[#4A4033] text-gray-700 dark:text-[#EDE4D3] rounded-xl"
                            >
                                {t.cancelar}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <style>{`
                .content-shift { 
                    transition: margin-left 0.7s ease-in-out; 
                    margin-left: ${isOpen ? '240px' : '0px'}; 
                }
                @media (max-width: 1024px) { 
                    .content-shift { margin-left: 0 !important; } 
                }
            `}</style>
        </>
    );
}

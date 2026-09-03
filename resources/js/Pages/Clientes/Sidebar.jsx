import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';

export default function Sidebar() {
    const { url, props } = usePage();

    // 🆕 En pantallas de escritorio (>=1024px) arranca abierto, en móvil/tablet arranca cerrado
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.innerWidth >= 1024;
    });

    useEffect(() => {
        const tema = props?.auth?.user?.tema || 'claro';
        document.documentElement.classList.toggle('dark', tema === 'oscuro');
    }, [props?.auth?.user?.tema]);

    useEffect(() => {
        const cerrar = () => setIsOpen(false);
        const abrir = () => setIsOpen(true);
        window.addEventListener('sidebar:cerrar', cerrar);
        window.addEventListener('sidebar:abrir', abrir);
        return () => {
            window.removeEventListener('sidebar:cerrar', cerrar);
            window.removeEventListener('sidebar:abrir', abrir);
        };
    }, []);

    // 🆕 Si el usuario redimensiona la ventana (ej. gira el celular o pasa a tablet/desktop),
    // ajustamos el estado para que no quede un drawer móvil abierto tapando todo en desktop, ni viceversa
    useEffect(() => {
        const manejarResize = () => {
            setIsOpen(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', manejarResize);
        return () => window.removeEventListener('resize', manejarResize);
    }, []);

    // 🆕 Cierra el sidebar automáticamente al navegar en móvil/tablet, para no tener que cerrarlo a mano
    const irYCerrarEnMovil = () => {
        if (window.innerWidth < 1024) setIsOpen(false);
    };

    const active = (path) =>
        url === path
            ? "border-b-2 border-[#5D4E3F] dark:border-[#D9B44A] font-bold"
            : "opacity-70 hover:opacity-100 transition-all hover:translate-x-1";

    // ============================================================
    // 🆕 NOTIFICACIONES DEL CLIENTE (mismo patrón que AdminSidebar,
    // pero usando la ruta /notificaciones — accesible para cualquier
    // usuario logueado, no solo admins)
    // ============================================================
    const [notifAbierta, setNotifAbierta] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const notifRef = useRef(null);

    const cargarNotificaciones = () => {
        axios.get('/notificaciones')
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
            axios.post(`/notificaciones/${notif.id}/marcar-leida`).then(() => {
                setNotificaciones(prev => prev.map(n => n.id === notif.id ? { ...n, leido: true } : n));
                setNoLeidas(prev => Math.max(0, prev - 1));
            });
        }
        if (notif.enlace) {
            setNotifAbierta(false);
            router.visit(notif.enlace);
        }
    };

    const marcarTodasLeidas = () => {
        axios.post('/notificaciones/marcar-todas-leidas').then(() => {
            setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
            setNoLeidas(0);
        });
    };

    const tiempoRelativo = (fecha) => {
        const diffMs = Date.now() - new Date(fecha).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Ahora mismo';
        if (mins < 60) return `Hace ${mins} min`;
        const horas = Math.floor(mins / 60);
        if (horas < 24) return `Hace ${horas} h`;
        const dias = Math.floor(horas / 24);
        return `Hace ${dias} d`;
    };

    return (
        <>
            {/* 🔔 CAMPANITA DE NOTIFICACIONES — fija arriba a la derecha, visible en toda la app cliente */}
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
                            <h4 className="text-xs font-black text-[#5D4E3F] dark:text-[#EDE4D3] uppercase tracking-wide">Notificaciones</h4>
                            {noLeidas > 0 && (
                                <button onClick={marcarTodasLeidas} className="text-[10px] font-bold text-[#4D78A3] dark:text-[#7FAEDD] hover:underline">
                                    Marcar todas como leídas
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notificaciones.length === 0 ? (
                                <p className="text-xs text-center text-gray-400 italic py-8">No tienes notificaciones.</p>
                            ) : (
                                notificaciones.map((notif) => (
                                    <button
                                        key={notif.id}
                                        onClick={() => clickNotificacion(notif)}
                                        className={`w-full text-left px-4 py-3 border-b border-[#F4EDE6] dark:border-[#221D17] last:border-0 transition ${
                                            notif.leido ? 'bg-white dark:bg-[#2E2720] hover:bg-[#F9F6F0] dark:hover:bg-[#221D17]' : 'bg-[#FDF6E9] dark:bg-[#3A322A] hover:bg-[#FBEFD8] dark:hover:bg-[#4A4033]'
                                        }`}
                                    >
                                        {/* 🆕 Si la notificación trae imagen (ej. un anuncio de Navidad), la mostramos arriba del texto */}
                                        {notif.imagen && (
                                            <img
                                                src={notif.imagen}
                                                alt=""
                                                className="w-full h-28 object-cover rounded-xl mb-2"
                                            />
                                        )}
                                        <div className="flex items-start gap-2">
                                            {!notif.leido && <span className="w-2 h-2 rounded-full bg-[#D9B44A] mt-1 shrink-0" />}
                                            <div className="min-w-0">
                                                {notif.titulo && (
                                                    <p className="text-[11px] font-black text-[#5D4E3F] dark:text-[#EDE4D3] truncate">{notif.titulo}</p>
                                                )}
                                                <p className="text-[11px] text-[#6A5A48] dark:text-[#C2B49A] line-clamp-3">{notif.mensaje}</p>
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

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-0 left-0 z-50 cursor-pointer transition-transform duration-500 hover:scale-105 w-24 sm:w-28 md:w-[130px]"
            >
                <img src="/images/esquina-decorativa.png" className="w-full drop-shadow-sm" alt="Menú" />
            </div>

            {/* 🆕 FONDO OSCURO DETRÁS DEL SIDEBAR: solo visible en móvil/tablet cuando está abierto,
                para dar sensación de "menú flotante" y permitir cerrarlo tocando afuera */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
                />
            )}

            <aside className={`fixed top-0 left-0 h-screen bg-[#453C2A] dark:bg-[#453C2A] shadow-2xl transition-all duration-500 ease-in-out z-40 flex flex-col overflow-hidden ${
                isOpen ? 'w-[78vw] max-w-[280px] lg:w-64' : 'w-0'
            }`}>

                <div className="relative h-40 flex items-center justify-center flex-shrink-0">
                    <img
                        src="/images/esquina-decorativa.png"
                        className="absolute top-0 left-0 w-full opacity-20 pointer-events-none scale-125 origin-top-left"
                    />
                    <img
                        src="/images/logo.png"
                        className="relative z-10 w-28 sm:w-32 lg:w-36 mt-6"
                        alt="Mouren"
                    />
                </div>

                <nav className="flex-1 px-6 lg:px-8 mt-2 min-w-[256px] text-[#FFFFFF] dark:text-[#EDE4D3]">
                    <p className="text-[10px] uppercase tracking-[4px] font-bold opacity-40 mb-6">Gestión</p>

                    <div className="flex flex-col gap-5">
                        <Link href="/cliente/mi-plan" onClick={irYCerrarEnMovil} className={`text-base lg:text-lg w-fit ${active('/cliente/mi-plan')}`}>
                            Mi plan Funerario
                        </Link>
                        <Link href="/detalles" onClick={irYCerrarEnMovil} className={`text-base lg:text-lg w-fit ${active('/detalles')}`}>
                            Detalles del plan
                        </Link>
                        <Link href="/pagos" onClick={irYCerrarEnMovil} className={`text-base lg:text-lg w-fit ${active('/pagos')}`}>
                            Pagar mi cuota
                        </Link>
                        <Link href="/datos" onClick={irYCerrarEnMovil} className={`text-base lg:text-lg w-fit ${active('/datos')}`}>
                            Tus datos
                        </Link>
                        <Link href="/mouriia" onClick={irYCerrarEnMovil} className={`text-base lg:text-lg w-fit ${active('/mouriia')}`}>
                            Habla con Mouri
                        </Link>
                    </div>
                </nav>

                <div className="p-6 mt-auto min-w-[256px]">
                    <Link
                        href="/force-logout"
                        className="group flex items-center justify-center gap-3 bg-[#5D4E3F] dark:bg-[#3A322A] text-[#F4EDE6] py-3 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] transition-all hover:bg-[#4A3E32] hover:shadow-lg active:scale-95"
                    >
                        <span>CERRAR SESIÓN</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </aside>

            <style>{`
                .content-shift { 
                    transition: margin-left 0.7s ease-in-out; 
                }
                @media (min-width: 1024px) {
                    .content-shift { margin-left: ${isOpen ? '256px' : '0px'}; }
                }
                @media (max-width: 1023px) { .content-shift { margin-left: 0; } }
            `}</style>
        </>
    );
}

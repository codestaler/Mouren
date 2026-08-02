import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';

export default function AdminSidebar() {
    const { url, props } = usePage();
    const [isOpen, setIsOpen] = useState(true);

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
                            <h4 className="text-xs font-black text-[#5D4E3F] dark:text-[#EDE4D3] uppercase tracking-wide">Notificaciones</h4>
                            {noLeidas > 0 && (
                                <button onClick={marcarTodasLeidas} className="text-[10px] font-bold text-[#4D78A3] dark:text-[#7FAEDD] hover:underline">
                                    Marcar todas como leídas
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
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
                                        <div className="flex items-start gap-2">
                                            {!notif.leido && <span className="w-2 h-2 rounded-full bg-[#D9B44A] mt-1 shrink-0" />}
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
                    alt="Menú"
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
                            Panel Principal
                        </Link>
                        <Link href="/admin/gestion-usuarios" className={`text-sm md:text-sm w-fit ${active('/admin/gestion-usuarios')}`}>
                            Gestión de Usuarios
                        </Link>
                        <Link href="/admin/servicios-funerarios" className={`text-sm md:text-sm w-fit ${active('/admin/servicios-funerarios')}`}>
                            Servicios Funerarios
                        </Link>
                        <Link href="/admin/ventas" className={`text-sm md:text-sm w-fit ${active('/admin/ventas')}`}>
                            Informes de Ventas
                        </Link>
                        <Link href="/admin/ajustes" className={`text-sm md:text-sm w-fit ${active('/admin/ajustes')}`}>
                            Ajustes
                        </Link>
                    </div>
                </nav>

                <div className="p-5 mt-auto min-w-[240px] z-10">
                    <Link
                        href="/force-logout"
                        className="group flex items-center justify-center gap-2 bg-[#A68966] text-[#F4EDE6] py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-[0.15em] transition-all hover:bg-[#FFC600] hover:text-[#5D4E3F] hover:shadow-lg active:scale-95"
                    >
                        <span>CERRAR SESIÓN</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </aside>

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

import React from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import Sidebar from './Sidebar';

export default function MiPlan({ suscripcion = null }) {
    console.log("Datos recibidos en suscripcion:", suscripcion);
    const { auth } = usePage().props;
    const usuario = auth?.user || {};

    // Lógica para determinar el nombre a mostrar
    const nombreParaMostrar = 
        usuario.nombre1 || 
        (usuario.nombre ? usuario.nombre.split(' ')[0] : null) || 
        usuario.name || 
        "Usuario";

    // Función para editar el nombre del beneficiario
    const editarNombre = (afiliadoId, nombreActual) => {
        const nuevoNombre = prompt("Editar nombre del beneficiario:", nombreActual);
        if (nuevoNombre && nuevoNombre.trim() !== "" && nuevoNombre !== nombreActual) {
            router.patch(`/afiliados/${afiliadoId}`, { 
                nombre: nuevoNombre 
            }, {
                preserveScroll: true,
                onSuccess: () => console.log("Nombre actualizado"),
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-['Hepta_Slab'] text-[#5D4E3F] flex overflow-x-hidden">
            <Head title="Mi Plan - Mouren" />
            
            <Sidebar />

            <main className="flex-1 p-6 md:p-10 content-shift transition-all duration-700 ease-in-out">
                
                <header className="flex justify-between items-start mb-10 animate-fade-in">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight">
                            Bienvenido, 
                            <span className="text-[#A68966]"> {nombreParaMostrar}</span>
                        </h1>
                        <p className="text-[11px] italic opacity-60 mt-1">"Para que descanses mejor que en vida"</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/30 p-2 rounded-full border border-white/50 shadow-sm">
                        <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-110 transition shadow-sm text-sm">🔔</button>
                        <div className="w-9 h-9 bg-[#5D4E3F] rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md uppercase">
                            {nombreParaMostrar[0]}
                        </div>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl font-bold mb-6 italic border-b border-[#5D4E3F]/10 pb-2">Mi plan Funerario:</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* TARJETA 1: INFO DEL PLAN */}
                        <div className={`${suscripcion ? 'bg-[#5D4E3F] text-white' : 'bg-[#CDC2AD] text-[#5D4E3F]'} p-8 rounded-[45px] shadow-lg border border-white/20 relative group overflow-hidden flex flex-col h-full transition-all`}>
                            <div className="relative z-10">
                                <h3 className={`text-[10px] uppercase tracking-[3px] font-bold ${suscripcion ? 'text-[#A68966]' : 'opacity-60'} mb-4 italic`}>
                                    {suscripcion ? 'Estado: Activo' : 'Primeros Pasos'}
                                </h3>
                                <h2 className="text-xl font-black mb-4 uppercase">
                                    {suscripcion ? (suscripcion.plan?.nombre || 'Plan Contratado') : 'Inscríbete a un plan'}
                                </h2>
                                
                                {suscripcion ? (
                                    <div className="space-y-3 mt-6">
                                        <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                                            <p className="text-[9px] uppercase opacity-60 font-bold">Cuota Mensual</p>
                                            <p className="text-xl font-black text-[#A68966]">${Number(suscripcion.cuota_mensual || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                                            <p className="text-[9px] uppercase opacity-60 font-bold">Inicio de Cobertura</p>
                                            <p className="text-sm font-bold">{suscripcion.fecha_inicio || 'Pendiente'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 mb-8">
                                        <div className="bg-white/20 p-3 rounded-2xl flex gap-3 items-center border border-white/10">
                                            <span className="bg-[#5D4E3F] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold italic">1</span>
                                            <p className="text-[10px] font-bold uppercase tracking-wider italic">Elige tu Plan</p>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-2xl flex gap-3 items-center border border-white/10">
                                            <span className="bg-[#5D4E3F] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold italic">2</span>
                                            <p className="text-[10px] font-bold uppercase tracking-wider italic">Registra Familiares</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link href={suscripcion ? "/detalles-plan" : "/planes-disponibles"} className="relative z-10 bg-[#5D4E3F] text-white py-4 rounded-2xl font-bold text-xs text-center hover:bg-[#4A3E32] transition-all shadow-md active:scale-95 uppercase tracking-widest mt-10">
                                {suscripcion ? 'Ver Detalles Completos' : 'Ver Planes Disponibles'}
                            </Link>

                            <img src="/images/login/mouri_registro_exitoso.png" className="absolute bottom-2 right-2 w-32 opacity-10 group-hover:opacity-25 transition-opacity" alt="" />
                        </div>

                        {/* TARJETA 2: BENEFICIARIOS Y CANCIÓN */}
                        <div className={`${suscripcion ? 'bg-[#F4F1ED]' : 'bg-[#5D4E3F]'} p-8 rounded-[45px] shadow-2xl flex flex-col items-center justify-center text-center h-full transition-all`}>
                            {suscripcion ? (
                                <div className="w-full text-left">
                                    <h3 className="text-sm font-black uppercase mb-4 text-[#5D4E3F] italic border-b border-[#5D4E3F]/10 pb-2">Beneficiarios:</h3>
                                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                        {suscripcion.afiliados?.length > 0 ? (
                                            suscripcion.afiliados.map((afi, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg text-[10px] font-bold uppercase tracking-tighter group hover:shadow-sm transition-all">
                                                    <div className="flex flex-col">
                                                        <span>{afi.nombre}</span>
                                                        <span className="text-[#A68966] text-[8px] italic">{afi.parentesco}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => editarNombre(afi.id, afi.nombre)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded text-[#A68966] transition-all"
                                                        title="Editar nombre"
                                                    >
                                                        ✏️
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[10px] opacity-60 italic text-center py-4">Aún no has vinculado familiares.</p>
                                        )}
                                    </div>
                                    
                                    <div className="mt-6 p-3 bg-[#5D4E3F] rounded-2xl text-white shadow-inner">
                                        <p className="text-[8px] uppercase opacity-60 font-bold tracking-wider">Tributo Musical:</p>
                                        <p className="text-[10px] font-bold italic truncate">
                                            {suscripcion.cancion_principal?.titulo || 'Melodía por definir'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-5 text-3xl">🛡️</div>
                                    <h3 className="text-lg font-bold mb-2 uppercase tracking-[0.2em] italic text-[#F4EDE6]">Sin Protección</h3>
                                    <p className="text-[10px] opacity-60 leading-relaxed px-6 text-[#F4EDE6]">
                                        Tu panel de pagos y beneficiarios se activará una vez elijas un plan de previsión.
                                    </p>
                                    <div className="mt-10 pt-6 border-t border-white/10 w-full italic opacity-30 text-[9px] uppercase tracking-widest text-[#F4EDE6]">
                                        Mouren Previsión Exequial
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </main>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.8s ease-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #A68966; border-radius: 10px; }
                main::-webkit-scrollbar { width: 5px; }
                main::-webkit-scrollbar-thumb { background: #A68966; border-radius: 10px; }
            `}</style>
        </div>
    );
}
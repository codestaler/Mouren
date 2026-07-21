import React from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '@/Pages/Clientes/Sidebar';
import {
    Trash2, Plus, Play, Pause, Sparkles, ShieldCheck, Gem, PawPrint, Flower
} from 'lucide-react';

export default function MiPlanMascotaView({
    plan,
    recuerdos,
    canciones,
    especies = [], // <-- NUEVO: Recibe el catálogo de especies y razas de la BD
    isSidebarOpen,
    setIsSidebarOpen,
    paso,
    setPaso,
    aceptoTerminos,
    setAceptoTerminos,
    showSuccessModal,
    setShowSuccessModal,
    errorModal,
    setErrorModal,
    playingId,
    audioRef,
    nombreTitular,
    data,
    setData,
    processing,
    aplicarCancionATodos,
    numMascotasActuales,
    MAX_MASCOTAS,
    valorCuotaBase,
    totalCalculado,
    validarPaso,
    toggleMúsica,
    toggleSeleccionRecuerdo,
    enviarInscripcion
}) {
    console.log("Especies recibidas desde la BD:", especies);
    return (
        <div className="flex min-h-screen bg-[#FDFBF9] font-['Hepta_Slab'] text-[#5D4E3F] relative overflow-hidden">
            {/* Flores Decorativas de Fondo */}
            <Flower className="absolute -top-10 -right-10 text-[#A68966]/5 w-40 h-40 pointer-events-none rotate-12" />
            <Flower className="absolute bottom-20 -left-10 text-[#A68966]/5 w-48 h-48 pointer-events-none -rotate-12" />
            <PawPrint className="absolute bottom-5 right-5 text-[#5D4E3F]/5 w-32 h-32 pointer-events-none" />

            <Head title={`Inscribir Plan Mascota ${plan.nombre || ''}`} />
            <Sidebar onToggle={setIsSidebarOpen} />
            <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

            <main className={`flex-1 transition-all p-6 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-20'}`}>
                <div className="max-w-6xl mx-auto">
                    <br />

                    {/* ENCABEZADO */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter italic lowercase flex items-center gap-2">
                                inscribir <span className="text-[#A68966]">{plan.nombre}</span>
                                <Flower className="text-[#A68966] animate-pulse hidden sm:inline" size={24} />
                            </h1>
                            <p className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-30 mt-2">Paso {paso} de 4</p>
                        </div>

                        <div className="bg-[#5D4E3F] text-white p-4 rounded-2xl flex items-center gap-4 max-w-md shadow-xl border-l-4 border-[#A68966] relative">
                            <Sparkles className="text-[#A68966] shrink-0" size={20} />
                            <p className="text-[10px] font-bold italic leading-tight">
                                {paso === 1 && "Mouri dice: Registra las huellas que alegran tu vida para darles una protección eterna."}
                                {paso === 2 && "Mouri dice: La música relajante y las tiernas melodías hacen más dulce el recuerdo."}
                                {paso === 3 && "Mouri dice: Elige el cofre o recuerdo de huella ideal para rendirles tributo."}
                                {paso === 4 && "Mouri dice: Revisa el compromiso de amor por tus compañeros. Su lealtad merece lo mejor."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* CONTENEDOR PRINCIPAL DEL PASO */}
                        <div className="lg:col-span-7 bg-white p-10 rounded-[50px] shadow-sm border border-[#5D4E3F]/5 min-h-[550px] flex flex-col relative">
                            
                            {/* PASO 1: SECCIÓN MASCOTAS */}
                            {paso === 1 && (
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-black lowercase italic flex items-center gap-2">
                                            tus consentidos <PawPrint size={20} className="text-[#A68966]" />
                                        </h2>
                                        <button
                                            type="button"
                                            disabled={numMascotasActuales >= MAX_MASCOTAS}
                                            onClick={() => setData('mascotas', [...data.mascotas, { nombre: '', especie_id: '', raza_id: '', cancion_id: data.cancion_id }])}
                                            className={`text-[10px] font-bold uppercase flex items-center gap-2 border border-dashed p-2 rounded-xl transition-all ${numMascotasActuales >= MAX_MASCOTAS ? 'opacity-20 border-gray-200' : 'text-[#A68966] border-[#A68966]/40 hover:bg-[#A68966]/5'}`}
                                        >
                                            <Plus size={14} /> agregar ({numMascotasActuales}/{MAX_MASCOTAS})
                                        </button>
                                    </div>

                                    <div className="space-y-5 mt-6">
    {data.mascotas.map((masc, i) => {
        const especieSeleccionada = especies.find(e => String(e.id) === String(masc.especie_id));
        const razasDisponibles = especieSeleccionada ? especieSeleccionada.razas : [];

        return (
            <div
                key={i}
                className="relative p-5 rounded-[35px] border bg-[#FDFBF9] border-[#5D4E3F]/10 shadow-sm hover:shadow-md transition-all"
            >
                {/* Botón eliminar flotante */}
                {numMascotasActuales > 1 && (
                    <button
                        type="button"
                        onClick={() => setData('mascotas', data.mascotas.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 bg-white text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 shadow-md border border-red-100 transition-colors z-10"
                    >
                        <Trash2 size={14} />
                    </button>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* AVATAR / FOTO DE LA MASCOTA (placeholder, luego pones la imagen real) */}
                    <div className="shrink-0 flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2">
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-dashed border-[#A68966]/40 flex items-center justify-center overflow-hidden shadow-inner">
                            {/* Cuando tengas la foto real, reemplaza este ícono por:
                                <img src={masc.foto_url} className="w-full h-full object-cover" /> */}
                            <PawPrint className="text-[#A68966]/50" size={26} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#A68966]/60 sm:text-center">
                            #{i + 1}
                        </span>
                    </div>

                    {/* CAMPOS */}
                    <div className="flex-1 space-y-3">
                        {/* Nombre */}
                        <input
                            className="w-full border-none bg-white rounded-2xl text-xs font-bold p-3.5 shadow-sm focus:ring-2 focus:ring-[#A68966]/40 placeholder:font-normal placeholder:opacity-40"
                            placeholder="Nombre de tu consentido 🐾"
                            value={masc.nombre}
                            onChange={e => {
                                const m = [...data.mascotas];
                                m[i].nombre = e.target.value;
                                setData('mascotas', m);
                            }}
                        />

                        {/* Especie + Raza en grid, ya no se desbordan */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-[#A68966]/70 ml-1">
                                    Especie
                                </label>
                                <select
                                    className="w-full bg-white border-none rounded-2xl text-xs p-3 shadow-sm focus:ring-2 focus:ring-[#A68966]/40"
                                    value={masc.especie_id}
                                    onChange={e => {
                                        const m = [...data.mascotas];
                                        m[i].especie_id = e.target.value;
                                        m[i].raza_id = '';
                                        setData('mascotas', m);
                                    }}
                                >
                                    <option value="">Elegir</option>
                                    {especies.map(esp => (
                                        <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-[#A68966]/70 ml-1">
                                    Raza / Variedad
                                </label>
                                <select
                                    className="w-full bg-white border-none rounded-2xl text-xs p-3 shadow-sm focus:ring-2 focus:ring-[#A68966]/40 disabled:opacity-40"
                                    value={masc.raza_id}
                                    disabled={!masc.especie_id}
                                    onChange={e => {
                                        const m = [...data.mascotas];
                                        m[i].raza_id = e.target.value;
                                        setData('mascotas', m);
                                    }}
                                >
                                    <option value="">
                                        {masc.especie_id ? 'Elegir' : 'Selecciona especie primero'}
                                    </option>
                                    {razasDisponibles.map(rz => (
                                        <option key={rz.id} value={rz.id}>{rz.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    })}
</div>
                                </div>
                            )}

                            {/* PASO 2: MELODÍAS */}
                            {paso === 2 && (
                                <div className="flex-1">
                                    <h2 className="text-2xl font-black lowercase italic mb-6 flex items-center gap-2">
                                        melodías del alma <Flower size={20} className="text-[#A68966]" />
                                    </h2>
                                    <div className="space-y-3 max-w-xl">
                                        <p className="text-[9px] font-black opacity-30 uppercase tracking-widest text-gray-400">Canción Conmemorativa sugerida</p>
                                        <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                            {canciones.map(c => (
                                                <div
                                                    key={c.id}
                                                    className={`p-4 rounded-2xl flex items-center justify-between border cursor-pointer transition-all ${data.cancion_id === c.id ? 'bg-[#5D4E3F] text-white border-[#5D4E3F]' : 'bg-[#FDFBF9] border-transparent hover:border-[#A68966]/30'}`}
                                                    onClick={() => aplicarCancionATodos(c.id)}
                                                >
                                                    <p className="text-xs font-bold lowercase flex items-center gap-2">
                                                        <PawPrint size={12} className={data.cancion_id === c.id ? 'text-[#A68966]' : 'opacity-40'} />
                                                        {c.titulo}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); toggleMúsica(c); }}
                                                        className="ml-2 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                                                    >
                                                        {playingId === c.id ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-[#A68966]" />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PASO 3: OBJETOS DE MEMORIA */}
                            {paso === 3 && (
                                <div className="flex-1">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-black lowercase italic">tributos de memoria</h2>
                                        <p className="text-[10px] text-[#A68966] font-bold uppercase mt-1">Selección única para el recuerdo físico</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        {recuerdos.map(r => (
                                            <div key={r.id} onClick={() => toggleSeleccionRecuerdo(r.id)} className={`p-6 rounded-[45px] border-2 cursor-pointer text-center transition-all ${data.recuerdos_seleccionados.includes(r.id) ? 'bg-[#5D4E3F] text-white border-[#5D4E3F] shadow-lg' : 'bg-[#FDFBF9] border-transparent hover:bg-[#F4F1ED]'}`}>
                                                <div className="bg-white rounded-3xl p-3 mb-3 shadow-sm max-w-[120px] mx-auto">
                                                    <img src={`/images/planes/recuerdos/${r.imagen || 'peluche_mouri.png'}`} className="w-20 h-20 mx-auto object-contain" alt={r.nombre} />
                                                </div>
                                                <p className="text-xs font-bold lowercase">{r.nombre}</p>
                                                <p className="text-[10px] opacity-60 mt-1">$ {Number(r.precio_adicional).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PASO 4: COMPROMISO */}
                            {paso === 4 && (
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="bg-[#FDFBF9] p-8 rounded-[60px] border border-[#A68966]/10 shadow-inner overflow-hidden relative">
                                        <ShieldCheck className="mx-auto text-[#A68966] mb-4" size={44} />
                                        <h2 className="text-xl font-black lowercase italic mb-4 text-center">compromiso huella eterna mouren</h2>

                                        <div className="max-h-36 overflow-y-auto pr-4 text-[11px] leading-relaxed text-[#5D4E3F]/70 text-justify space-y-3 mb-6 font-sans">
                                            <p>Yo, <strong>{nombreTitular || 'Usuario'}</strong>, acepto la cobertura del Plan Mascota {plan.nombre}. Entiendo que la protección integral para mis {numMascotasActuales} compañero(s) de vida iniciará tras validar el pago de las respectivas cuotas.</p>
                                            <p>Declaro que los datos de las mascotas son verídicos. Mouren cuidará con amor, dignidad, rodeado de detalles florales y el máximo respeto el ritual de despedida.</p>
                                            <p>La cuota de inversión mensual calculada es de <strong>${totalCalculado.toLocaleString()}</strong>.</p>
                                        </div>

                                        <label className="flex items-start gap-4 cursor-pointer p-4 bg-white rounded-3xl border border-[#A68966]/20 transition-all hover:bg-emerald-50/20">
                                            <input type="checkbox" className="w-5 h-5 mt-1 rounded-lg text-[#A68966] focus:ring-0 checked:bg-[#A68966]" checked={aceptoTerminos} onChange={e => setAceptoTerminos(e.target.checked)} />
                                            <span className="text-[10px] font-bold leading-tight uppercase tracking-tight">Prometo cuidar la memoria de mi mascota y acepto los términos de Mouren Funeraria.</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* BOTONES NAVEGACIÓN */}
                            <div className="mt-auto pt-8 flex justify-between items-center border-t border-[#5D4E3F]/5">
                                {paso > 1 && (
                                    <button type="button" onClick={() => setPaso(paso - 1)} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-all tracking-widest">← atrás</button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => paso === 4 ? enviarInscripcion() : validarPaso()}
                                    disabled={processing || (paso === 4 && !aceptoTerminos)}
                                    className="bg-[#5D4E3F] text-white px-12 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] ml-auto shadow-lg hover:bg-[#4A3E32] transition-colors disabled:opacity-40"
                                >
                                    {paso === 4 ? (processing ? 'procesando...' : 'activar huella eterna') : 'siguiente'}
                                </button>
                            </div>
                        </div>

                        {/* PANEL DE RESUMEN LATERAL */}
                        <div className="lg:col-span-5 sticky top-10">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[#A68966] rounded-[40px] transform -rotate-2 transition-transform group-hover:rotate-0 duration-500 shadow-xl opacity-10"></div>
                                <div className="relative bg-[#F4F1ED] border border-[#5D4E3F]/10 rounded-[40px] p-8 shadow-2xl overflow-hidden">
                                    
                                    <div className="bg-[#5D4E3F] inline-block px-8 py-2 transform -skew-x-12 mb-6 ml-[-20px]">
                                        <h2 className="text-xl font-black text-[#FDFBF9] lowercase italic transform skew-x-12">resumen patitas mouri</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-dashed border-[#5D4E3F]/20 pb-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A68966]">Plan Base Elegido</p>
                                                <p className="text-lg font-black text-[#5D4E3F] italic">{plan.nombre || 'Huella Eterna'}</p>
                                            </div>
                                            <Gem className="text-[#A68966] opacity-40" size={28} />
                                        </div>

                                        <div className="bg-white/80 p-4 rounded-2xl border-l-4 border-[#A68966] space-y-1">
                                            <p className="text-[9px] font-black uppercase text-[#A68966]">Cálculo de Cuota:</p>
                                            <div className="flex justify-between text-xs font-bold text-[#5D4E3F]">
                                                <span>Cuota base por mascota:</span>
                                                <span>${valorCuotaBase.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold text-[#5D4E3F] border-t border-gray-100 pt-1 mt-1">
                                                <span>Total Protegidos (x{numMascotasActuales}):</span>
                                                <span>${(valorCuotaBase * numMascotasActuales).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {data.recuerdos_seleccionados.map(id => {
                                            const r = recuerdos.find(rec => rec.id === id);
                                            return r ? (
                                                <div key={id} className="bg-white/40 p-3 rounded-xl border border-dashed border-[#5D4E3F]/20 flex justify-between items-center text-xs">
                                                    <span className="font-bold text-[#5D4E3F] lowercase italic">Incluye: {r.nombre}</span>
                                                    <span className="font-bold text-[#A68966]">${Number(r.precio_adicional).toLocaleString()}</span>
                                                </div>
                                            ) : null;
                                        })}

                                        <div className="mt-6 relative">
                                            <div className="absolute inset-0 bg-[#5D4E3F] rounded-3xl transform skew-y-2"></div>
                                            <div className="relative overflow-hidden bg-[#FDFBF9] p-6 rounded-3xl transform -translate-y-1 -translate-x-1 border border-[#5D4E3F]/10">
                                                <p className="text-[10px] uppercase font-black text-[#A68966] mb-1 tracking-[0.2em] text-center">Inversión Mensual Total</p>
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-2xl font-black text-[#5D4E3F]">$</span>
                                                    <span className="text-4xl font-black text-[#5D4E3F] tracking-tighter">
                                                        {totalCalculado.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* MODAL ÉXITO */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#5D4E3F]/90 backdrop-blur-sm p-4">
                    <div className="bg-white p-12 rounded-[60px] text-center max-w-sm w-full shadow-2xl border-t-8 border-[#A68966]">
                        <img src="/images/login/mouri_registro_exitoso.png" className="w-32 h-32 mx-auto mb-6 object-contain" alt="Éxito" />
                        <h2 className="text-3xl font-black text-[#5D4E3F] lowercase mb-2 italic">¡huella protegida!</h2>
                        <p className="text-xs opacity-70">El plan floral y conmemorativo ha sido configurado con éxito.</p>
                        <button onClick={() => window.location.href = '/cliente/mi-plan'} className="mt-8 bg-[#A68966] text-white w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-md hover:bg-[#937756] transition-colors">ir a mi panel</button>
                    </div>
                </div>
            )}

            {/* MODAL ERROR */}
            {errorModal.show && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-xl">
                        <h2 className="text-xl font-black text-red-500 mb-4">Mouri te informa</h2>
                        <p className="text-sm text-gray-700">{errorModal.message}</p>
                        <button onClick={() => setErrorModal({ show: false, message: '' })} className="mt-6 bg-[#A68966] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase">Entendido</button>
                    </div>
                </div>
            )}
        </div>
    );
}
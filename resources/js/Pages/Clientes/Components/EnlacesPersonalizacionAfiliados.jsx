import React, { useState } from 'react';
import axios from 'axios';

// 🆕 Tarjeta separada para generar y copiar el enlace privado de cada
// afiliado. La puse aparte (no dentro de AfiliadosPanel.jsx) para no
// arriesgarme a tocar ese archivo sin conocer su código real.
export default function EnlacesPersonalizacionAfiliados({ afiliados = [] }) {
    const [cargandoId, setCargandoId] = useState(null);
    const [copiadoId, setCopiadoId] = useState(null);
    const [errorId, setErrorId] = useState(null);

    // El titular ya tiene su propia cuenta — este enlace es solo para
    // quienes no inician sesión (sus protegidos).
    const soloAfiliados = afiliados.filter(
        (a) => (a.parentesco || '').toLowerCase().trim() !== 'titular'
    );

    const generarYCopiar = async (afiliado) => {
        setCargandoId(afiliado.id);
        setErrorId(null);
        try {
            const { data } = await axios.post(`/afiliados/${afiliado.id}/generar-enlace`);
            await navigator.clipboard.writeText(data.url);
            setCopiadoId(afiliado.id);
            setTimeout(() => setCopiadoId(null), 2500);
        } catch (error) {
            console.error('No se pudo generar el enlace:', error);
            setErrorId(afiliado.id);
            setTimeout(() => setErrorId(null), 3000);
        } finally {
            setCargandoId(null);
        }
    };

    if (soloAfiliados.length === 0) return null;

    return (
        <div className="bg-white dark:bg-[#2E2720] rounded-[24px] p-4 sm:p-5 border border-[#A68966]/15 dark:border-white/10 shadow-md">
            <h3 className="font-black text-[11px] uppercase tracking-widest text-[#5D4E3F] dark:text-[#EDE4D3] mb-1">
                💌 Comparte con tu familia
            </h3>
            <p className="text-[10px] opacity-60 mb-4 leading-relaxed">
                Genera un enlace privado para que cada protegido pueda personalizar lo suyo, sin necesitar una cuenta.
            </p>
            <div className="space-y-2">
                {soloAfiliados.map((a) => (
                    <div
                        key={a.id}
                        className="flex items-center justify-between gap-2 bg-[#F4EDE6] dark:bg-black/20 rounded-2xl px-3 py-2.5"
                    >
                        <div className="min-w-0">
                            <p className="text-[11px] font-black truncate">{a.nombre}</p>
                            <p className="text-[9px] opacity-60">{a.parentesco}</p>
                        </div>
                        <button
                            onClick={() => generarYCopiar(a)}
                            disabled={cargandoId === a.id}
                            className="shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm transition active:scale-95 disabled:opacity-50 text-white"
                            style={{
                                backgroundColor: errorId === a.id ? '#dc2626' : copiadoId === a.id ? '#10b981' : '#5D4E3F',
                            }}
                        >
                            {cargandoId === a.id
                                ? 'Generando...'
                                : errorId === a.id
                                    ? '✕ Error, reintenta'
                                    : copiadoId === a.id
                                        ? '✓ Copiado'
                                        : '🔗 Copiar enlace'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

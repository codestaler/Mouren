import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function VerificarAfiliado({ token, nombre }) {
    const [cedula, setCedula] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    const confirmar = (e) => {
        e.preventDefault();
        setEnviando(true);
        setError('');
        router.post(`/afiliado/${token}/verificar`, { cedula }, {
            preserveScroll: true,
            onError: (errors) => {
                setError(errors.cedula || 'No se pudo verificar. Intenta de nuevo.');
                setEnviando(false);
            },
            onFinish: () => setEnviando(false),
        });
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#221D17] flex items-center justify-center p-6 font-['Hepta_Slab'] text-[#5D4E3F] dark:text-[#EDE4D3]">
            <Head title="Confirma tu identidad - Mouren" />
            <div className="max-w-sm w-full bg-white dark:bg-[#2E2720] rounded-[32px] shadow-xl p-8 text-center">
                <div className="text-4xl mb-4">🕊️</div>
                <h1 className="text-lg font-black mb-2">Hola, {nombre}</h1>
                <p className="text-xs opacity-70 mb-6 leading-relaxed">
                    Alguien de tu familia te compartió este enlace privado en Mouren. Para continuar, confirma tu número de cédula.
                </p>
                <form onSubmit={confirmar} className="space-y-3">
                    <input
                        type="text"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        placeholder="Tu número de cédula"
                        className="w-full px-4 py-3 rounded-2xl border border-[#5D4E3F]/20 dark:border-white/10 bg-[#F4EDE6] dark:bg-black/20 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#A68966]"
                        required
                        autoFocus
                    />
                    {error && <p className="text-[11px] text-red-500 font-bold">{error}</p>}
                    <button
                        type="submit"
                        disabled={enviando}
                        className="w-full py-3 bg-[#5D4E3F] dark:bg-[#A68966] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-[#4A3E32] dark:hover:bg-[#8e7253] transition disabled:opacity-50"
                    >
                        {enviando ? 'Verificando...' : 'Continuar'}
                    </button>
                </form>
                <p className="text-[9px] opacity-40 mt-6">
                    Si crees que este enlace llegó por error, ciérralo sin problema.
                </p>
            </div>
        </div>
    );
}

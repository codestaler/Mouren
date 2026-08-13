import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

const musicTracks = [
    { id: 1, title: 'Descanso Sereno', file: '/images/planes/album/Descanso_Sereno.mp4' },
    { id: 2, title: 'Eterna Luz', file: '/images/planes/album/Eterna_luz.mp4' },
    { id: 3, title: 'S.E.N.A', file: '/images/planes/album/S.E.N.A.mp3' },
    { id: 4, title: 'siste fest', file: '/images/planes/album/siste fest.mp3' },
    { id: 5, title: 'Susurro del Alma', file: '/images/planes/album/susurro.mp3' },
    { id: 6, title: 'Renacer Eterno', file: '/images/planes/album/renacer_eterno.mp3' },
];

export default function MusicAlbum() {
    const [playingId, setPlayingId] = useState(null);
    const audioRef = useRef(new Audio());
    const albumCover = "/images/planes/album/portada_album.png"; // Tu nueva ruta

    // 🆕 Control único de volumen para todo el álbum (0 a 1)
    const [volumen, setVolumen] = useState(0.3);
    const [silenciado, setSilenciado] = useState(false);

    // Mantiene el <audio> siempre sincronizado con el estado del control,
    // sin importar si cambias el volumen mientras suena una canción o no.
    useEffect(() => {
        audioRef.current.volume = silenciado ? 0 : volumen;
    }, [volumen, silenciado]);

    const togglePlay = (track) => {
        if (playingId === track.id) {
            audioRef.current.pause();
            setPlayingId(null);
        } else {
            audioRef.current.src = track.file;
            audioRef.current.volume = silenciado ? 0 : volumen;
            audioRef.current.play();
            setPlayingId(track.id);
        }
    };

    const cambiarVolumen = (e) => {
        setSilenciado(false);
        setVolumen(Number(e.target.value));
    };

    const nivelMostrado = silenciado ? 0 : volumen;
    const IconoVolumen = nivelMostrado === 0 ? VolumeX : nivelMostrado < 0.5 ? Volume1 : Volume2;

    return (
        <section className="pt-16 pb-24 sm:pt-20 sm:pb-32 lg:py-40 lg:pb-64 bg-white relative overflow-hidden flex flex-col lg:flex-row lg:items-center min-h-0 lg:min-h-[600px]">
            {/* LADO IZQUIERDO: MOURI Y TEXTO EXPLICATIVO */}
            <div className="relative lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 z-10 flex items-center justify-center px-4 sm:px-8 lg:px-0 mb-12 lg:mb-0">
                <div className="bg-[#5D4E3F] w-full max-w-[400px] py-8 px-6 sm:py-10 sm:px-8 lg:py-12 lg:pl-8 lg:pr-16 rounded-[30px] lg:rounded-none lg:rounded-tr-[120px] lg:rounded-br-[120px] shadow-2xl border-4 border-[#A68966] lg:border-0 lg:border-r-8 flex flex-col items-center">
                    
                    {/* --- CORRECCIÓN: CUERVO MÁS GRANDE Y SALIDO POR ARRIBA --- */}
                    <img 
                        src="/images/planes/album/mouri_con_notas_violin.gif" 
                        alt="Mouri" 
                        className="w-48 sm:w-64 lg:w-80 h-auto drop-shadow-2xl mb-6 lg:mb-8 -mt-16 sm:-mt-20 lg:-mt-36 z-40 relative" 
                    />

                    <div className="text-center text-white relative z-10 w-full">
                        <h3 className="text-[#FFC600] font-black tracking-tighter text-lg sm:text-xl mb-2">Sinfonía del Recuerdo</h3>
                        <p className="text-[11px] italic opacity-90 leading-relaxed font-medium mb-4">
                            "La música expresa aquello que no puede decirse con palabras y sobre lo que es imposible permanecer en silencio." 
                            <br/><br/>
                            <span className="font-bold">Seis melodías compuestas para abrazar el alma y honrar el legado de quienes amamos.</span>
                        </p>
                        
                        {/* --- CORRECCIÓN: NUEVO TEXTO INCLUIDO EN UN PLAN --- */}
                        <p className="text-[10px] text-[#A68966] font-black uppercase tracking-widest leading-tight border-t border-[#A68966]/30 pt-4 mt-4">
                            Estas son algunas de las melodías que podemos interpretar y que vienen incluidas en nuestro plan Excelencia y Tributo.
                        </p>

                        {/* 🆕 MEDIDOR DE VOLUMEN ÚNICO */}
                        <div className="mt-6 pt-5 border-t border-[#A68966]/30 flex items-center gap-3 w-full max-w-[240px] mx-auto">
                            <button
                                type="button"
                                onClick={() => setSilenciado(!silenciado)}
                                aria-label={silenciado ? 'Activar sonido' : 'Silenciar'}
                                className="shrink-0 w-9 h-9 rounded-full bg-[#A68966]/20 hover:bg-[#A68966]/40 flex items-center justify-center text-[#FFC600] transition-all active:scale-90"
                            >
                                <IconoVolumen size={16} />
                            </button>

                            <div className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#A68966] to-[#FFC600] transition-[width] duration-100"
                                    style={{ width: `${nivelMostrado * 100}%` }}
                                />
                                {/* Marcador circular que se mueve con el nivel */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#FFC600] shadow-md border-2 border-[#5D4E3F] pointer-events-none transition-[left] duration-100"
                                    style={{ left: `${nivelMostrado * 100}%` }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={nivelMostrado}
                                    onChange={cambiarVolumen}
                                    aria-label="Volumen del álbum"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            <span className="text-[9px] font-black text-[#A68966] w-8 text-right shrink-0">
                                {Math.round(nivelMostrado * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LADO DERECHO: DISCOS */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 lg:pl-[420px] lg:pr-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 sm:gap-x-12 gap-y-16 sm:gap-y-20">
                    {musicTracks.map((track) => (
                        <div key={track.id} className="group relative flex items-center justify-center">
                            
                            {/* VINILO */}
                            <div className={`absolute left-4 w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 bg-[#1a1a1a] rounded-full border-[6px] border-[#222] shadow-2xl transition-all duration-1000 
                                ${playingId === track.id ? 'translate-x-20 sm:translate-x-24 rotate-[720deg]' : 'group-hover:translate-x-14 sm:group-hover:translate-x-16'}`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#A68966] rounded-full border-4 border-white/10"></div>
                                </div>
                            </div>
                            
                            {/* PORTADA UNIFICADA */}
                            <div 
                                onClick={() => togglePlay(track)}
                                className="relative z-20 w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-[#F4EDE6] shadow-2xl rounded-sm overflow-hidden border-2 border-white cursor-pointer"
                            >
                                <img src={albumCover} alt="Portada Album" className="w-full h-full object-cover" />
                                
                                <div className="absolute inset-0 bg-[#5D4E3F]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-14 h-14 rounded-full bg-[#FFC600] flex items-center justify-center shadow-lg text-[#5D4E3F] text-xl">
                                        {playingId === track.id ? '⏸' : '▶'}
                                    </div>
                                </div>
                            </div>

                            {/* TÍTULO CANCIÓN */}
                            <div className="absolute -bottom-10 left-0 w-36 sm:w-40 lg:w-44 text-center">
                                <p className="text-[10px] font-black text-[#5D4E3F] tracking-widest italic leading-tight">
                                    {track.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

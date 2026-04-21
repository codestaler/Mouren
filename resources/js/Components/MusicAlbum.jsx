import React, { useState, useRef } from 'react';

const musicTracks = [
    { id: 1, title: 'Descanso Sereno', file: '/images/planes/album/Descanso_Sereno.mp4' },
    { id: 2, title: 'Eterna Luz', file: '/images/planes/album/Eterna_luz.mp4' },
    { id: 3, title: 'S.E.N.A', file: '/images/planes/album/S.E.N.A.mp3' },
    { id: 4, title: 'siste fest', file: '/images/planes/album/siste fest.mp3' },
    { id: 5, title: 'Susurro del Alma', file: '/audio/track5.mp3' },
    { id: 6, title: 'Renacer Eterno', file: '/audio/track6.mp3' },
];

export default function MusicAlbum() {
    const [playingId, setPlayingId] = useState(null);
    const audioRef = useRef(new Audio());
    const albumCover = "/images/planes/album/portada_album.png"; // Tu nueva ruta

    const togglePlay = (track) => {
        if (playingId === track.id) {
            audioRef.current.pause();
            setPlayingId(null);
        } else {
            audioRef.current.src = track.file;
            audioRef.current.volume = 0.3;
            audioRef.current.play();
            setPlayingId(track.id);
        }
    };

    return (
        <section className="py-40 pb-64 bg-white relative overflow-hidden flex items-center min-h-[600px]">
            {/* LADO IZQUIERDO: MOURI Y TEXTO EXPLICATIVO */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center">
                <div className="bg-[#5D4E3F] py-12 pl-8 pr-16 rounded-tr-[120px] rounded-br-[120px] shadow-2xl border-r-8 border-[#A68966] flex flex-col items-center max-w-[400px]">
                    
                    {/* --- CORRECCIÓN: CUERVO MÁS GRANDE Y SALIDO POR ARRIBA --- */}
                    <img 
                        src="/images/planes/album/mouri_con_notas_violin.gif" 
                        alt="Mouri" 
                        className="w-80 h-auto drop-shadow-2xl mb-8 -mt-36 z-40 relative" 
                    />

                    <div className="text-center text-white relative z-10">
                        <h3 className="text-[#FFC600] font-black tracking-tighter text-xl mb-2">Sinfonía del Recuerdo</h3>
                        <p className="text-[11px] italic opacity-90 leading-relaxed font-medium mb-4">
                            "La música expresa aquello que no puede decirse con palabras y sobre lo que es imposible permanecer en silencio." 
                            <br/><br/>
                            <span className="font-bold">Seis melodías compuestas para abrazar el alma y honrar el legado de quienes amamos.</span>
                        </p>
                        
                        {/* --- CORRECCIÓN: NUEVO TEXTO INCLUIDO EN UN PLAN --- */}
                        <p className="text-[10px] text-[#A68966] font-black uppercase tracking-widest leading-tight border-t border-[#A68966]/30 pt-4 mt-4">
                            Estas son algunas de las melodías que podemos interpretar y que vienen incluidas en nuestro plan Excelencia y Tributo.
                        </p>
                    </div>
                </div>
            </div>

            {/* LADO DERECHO: DISCOS */}
            <div className="max-w-7xl mx-auto w-full pl-[420px] pr-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                    {musicTracks.map((track) => (
                        <div key={track.id} className="group relative flex items-center justify-center">
                            
                            {/* VINILO */}
                            <div className={`absolute left-4 w-40 h-40 bg-[#1a1a1a] rounded-full border-[6px] border-[#222] shadow-2xl transition-all duration-1000 
                                ${playingId === track.id ? 'translate-x-24 rotate-[720deg]' : 'group-hover:translate-x-16'}`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-[#A68966] rounded-full border-4 border-white/10"></div>
                                </div>
                            </div>
                            
                            {/* PORTADA UNIFICADA */}
                            <div 
                                onClick={() => togglePlay(track)}
                                className="relative z-20 w-44 h-44 bg-[#F4EDE6] shadow-2xl rounded-sm overflow-hidden border-2 border-white cursor-pointer"
                            >
                                <img src={albumCover} alt="Portada Album" className="w-full h-full object-cover" />
                                
                                <div className="absolute inset-0 bg-[#5D4E3F]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-14 h-14 rounded-full bg-[#FFC600] flex items-center justify-center shadow-lg text-[#5D4E3F] text-xl">
                                        {playingId === track.id ? '⏸' : '▶'}
                                    </div>
                                </div>
                            </div>

                            {/* TÍTULO CANCIÓN */}
                            <div className="absolute -bottom-10 left-0 w-44 text-center">
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
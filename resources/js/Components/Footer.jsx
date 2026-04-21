import React from 'react';

const Footer = () => {
    return (
        <footer className="relative w-full bg-[#8C7864] text-[#F4EDE6]">

            {/* --- CAPA DE PERSONAJES: Ajustamos bottom para que "suban" --- */}
            {/* --- CAPA DE PERSONAJES (Ajustada para estar sobre el césped) --- */}
            <div className="absolute top-0 left-0 w-full z-10 pointer-events-none">
                <div className="container mx-auto relative">
                    {/* Mouri: Usamos -translate-y para subirlo justo al borde */}
                    <img
                        src="/images/Footer/mouri_footer.gif"
                        alt="Mouri"
                        className="absolute left-32 w-48 h-auto -translate-y-[95%]"
                    />
                    {/* Tumba: Misma lógica para que queden nivelados */}
                    <img
                        src="/images/Footer/tumba_raven.png"
                        alt="Tumba"
                        className="absolute right-32 w-40 h-auto -translate-y-[100%]"
                    />
                </div>
            </div>

            {/* --- IMAGEN DE CÉSPED --- */}
            <div className="absolute top-0 left-0 w-full z-20 -translate-y-[95%]">
                <img
                    src="/images/Footer/cesped.png"
                    alt="Césped"
                    className="w-full h-16 object-cover"
                />
            </div>

            {/* --- IMAGEN DE CÉSPED --- */}
            <div className="absolute top-0 left-0 w-full z-20 -translate-y-[95%]">
                <img
                    src="/images/Footer/cesped.png"
                    alt="Césped"
                    className="w-full h-16 object-cover"
                />
            </div>

            {/* --- CONTENIDO DEL FOOTER: Reducimos py-16 a pt-10 para cerrar el espacio --- */}
            <div className="container mx-auto px-12 pt-10 pb-16 relative z-30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[#F4EDE6]/30 pt-8">

                    {/* Sobre Nosotros */}
                    <div>
                        <h4 className="text-xl font-bold mb-4">Sobre Nosotros</h4>
                        <ul className="space-y-2 opacity-90">
                            <li><a href="#" className="hover:text-[#FFC600] transition">Nuestra Historia</a></li>
                            <li><a href="#" className="hover:text-[#FFC600] transition">Misión</a></li>
                            <li><a href="#" className="hover:text-[#FFC600] transition">Visión</a></li>
                            <li><a href="#" className="hover:text-[#FFC600] transition">Equipo de trabajo</a></li>
                            <li><a href="#" className="hover:text-[#FFC600] transition">Valores</a></li>
                        </ul>
                    </div>

                    {/* Redes Sociales */}
                    <div>
                        <h4 className="text-xl font-bold mb-4">Redes sociales</h4>
                        <ul className="space-y-2 opacity-90">
                            <li><a href="#" className="hover:text-[#FFC600] transition">Instagram</a></li>
                            <li><a href="#" className="hover:text-[#FFC600] transition">Facebook</a></li>
                            <li><a href="#" className="hover:text-[#FFC600] transition">Gmail</a></li>
                            <li><a href="#" className="hover:text-[#FFC600] transition">Youtube</a></li>
                        </ul>
                    </div>

                    {/* Contactos y Ubicación */}
                    <div>
                        <h4 className="text-xl font-bold mb-4">Contactos y ubicación</h4>
                        <div className="space-y-2 opacity-90">
                            <p>Cl. 63 #58B-03, Terranova, Itagüí</p>
                            <p>314-6517-554</p>
                            <div className="pt-4">
                                <p className="text-sm font-semibold mb-2">Regulados por</p>
                                <div className="w-24 h-10 bg-white/10 rounded flex items-center justify-center italic text-[10px]">Logo Entidad</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-[#F4EDE6]/10 pt-6 text-sm opacity-70">
                    <p>© 2025 Mouren. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
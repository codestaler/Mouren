import React from 'react';

const Footer = () => {
    return (
        <footer className="relative w-full bg-[#8C7864] text-[#F4EDE6]">

            {/* --- CAPA DE PERSONAJES: Ajustamos bottom para que "suban" --- */}
            {/* --- CAPA DE PERSONAJES (Ajustada para estar sobre el césped) --- */}
            {/* 🆕 RESPONSIVO: en pantallas chicas ocultamos a Mouri y la tumba (con posiciones fijas left-32/right-32
                se salían del contenedor o se superponían con el texto en móvil); vuelven a aparecer desde md: */}
            <div className="hidden md:block absolute top-0 left-0 w-full z-10 pointer-events-none">
                <div className="container mx-auto relative">
                    {/* Mouri: Usamos -translate-y para subirlo justo al borde */}
                    <img
                        src="/images/Footer/mouri_footer.gif"
                        alt="Mouri"
                        className="absolute left-8 lg:left-32 w-32 lg:w-48 h-auto -translate-y-[95%]"
                    />
                    {/* Tumba: Misma lógica para que queden nivelados */}
                    <img
                        src="/images/Footer/tumba_raven.png"
                        alt="Tumba"
                        className="absolute right-8 lg:right-32 w-28 lg:w-40 h-auto -translate-y-[100%]"
                    />
                </div>
            </div>

            {/* --- IMAGEN DE CÉSPED --- */}
            <div className="absolute top-0 left-0 w-full z-20 -translate-y-[95%]">
                <img
                    src="/images/Footer/cesped.png"
                    alt="Césped"
                    className="w-full h-10 sm:h-16 object-cover"
                />
            </div>

            {/* --- IMAGEN DE CÉSPED --- */}
            <div className="absolute top-0 left-0 w-full z-20 -translate-y-[95%]">
                <img
                    src="/images/Footer/cesped.png"
                    alt="Césped"
                    className="w-full h-10 sm:h-16 object-cover"
                />
            </div>

            {/* --- CONTENIDO DEL FOOTER: Reducimos py-16 a pt-10 para cerrar el espacio --- */}
            {/* 🆕 RESPONSIVO: padding horizontal escalonado (px-6 en móvil en vez de px-12 fijo) */}
            <div className="container mx-auto px-6 sm:px-8 md:px-12 pt-8 sm:pt-10 pb-10 sm:pb-16 relative z-30">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 border-t border-[#F4EDE6]/30 pt-8">

                    {/* Sobre Nosotros */}
                    <div>
                        <h4 className="text-lg sm:text-xl font-bold mb-4">Sobre Nosotros</h4>
                        <ul className="space-y-2 opacity-90 text-sm sm:text-base">
                            <li><a href="#" className="hover:text-[#FFC600] transition">Nuestra Historia</a></li>
                            <li><a href="#" className="hover:text-[#FFC600] transition">Misión</a></li>
                            <li><a href="#" className="hover:text-[#FFC600] transition">Visión</a></li>
                            <li><a href="#" className="hover:text-[#FFC600] transition">Equipo de trabajo</a></li>
                            <li><a href="#" className="hover:text-[#FFC600] transition">Valores</a></li>
                        </ul>
                    </div>

                    {/* Redes Sociales */}
                    <div>
                        <h4 className="text-lg sm:text-xl font-bold mb-4">Redes sociales</h4>
                        <ul className="space-y-2 opacity-90 text-sm sm:text-base">
                            <li><a href="https://www.instagram.com/funeraria_mouren/⁠�" className="hover:text-[#FFC600] transition">Instagram</a></li>
                            <li><a href="https://www.facebook.com/profile.php?id=61577696892769⁠�" className="hover:text-[#FFC600] transition">Facebook</a></li>
                            <li><a href="mouren.funeraria@gmail.com" className="hover:text-[#FFC600] transition">Gmail</a></li>
                            <li><a href="https://m.youtube.com/@Mouri-k8t2m⁠�" className="hover:text-[#FFC600] transition">Youtube</a></li>
                        </ul>
                    </div>

                    {/* Contactos y Ubicación */}
                    <div className="sm:col-span-2 md:col-span-1">
                        <h4 className="text-lg sm:text-xl font-bold mb-4">Contactos y ubicación</h4>
                        <div className="space-y-2 opacity-90 text-sm sm:text-base">
                            <p>Cl. 63 #58B-03, Terranova, Itagüí</p>
                            <p>314-6517-554</p>
                            <div className="pt-4">
                                <p className="text-sm font-semibold mb-2">Regulados por</p>
                                {/* 🆕 CORREGIDO: antes era un placeholder de texto, ahora la imagen real.
                                    Ruta convertida de C:\mouren\public\... a la ruta web /images/... 
                                    (todo lo que está dentro de /public se sirve desde la raíz del sitio) */}
                                <div className="w-32 h-14 rounded flex items-center justify-center p-1">
                                    <img
                                        src="/images/imagenes_inicio/logo_superintendencia_industria_comercio.png"
                                        alt="Superintendencia de Industria y Comercio"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 sm:mt-12 border-t border-[#F4EDE6]/10 pt-6 text-xs sm:text-sm opacity-70">
                    <p>© 2025 Mouren. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

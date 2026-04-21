import React, { useState } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

export default function Home() {
    const planesData = [
        {
            titulo: "Plan Descanso Sereno",
            descripcion: "Una despedida sobria, espiritual y elegante. Pensado para quienes valoran la calma, el respeto y la armonía en su último adiós.",
            imagen: "/images/imagenes_inicio/carrusel/descanso_sereno.gif"
        },
        {
            titulo: "Legado Eterno",
            descripcion: "Celebramos la alegría de haber compartido la vida. Un servicio colorido y lleno de luz para recordar los mejores momentos.",
            imagen: "/images/imagenes_inicio/carrusel/descanso_sereno.gif"
        },
        {
            titulo: "Tributo a la Vida",
            descripcion: "Celebramos la alegría de haber compartido la vida. Un servicio colorido y lleno de luz para recordar los mejores momentos.",
            imagen: "/images/imagenes_inicio/carrusel/descanso_sereno.gif"
        },
        {
            titulo: "Huella Eterna ",
            descripcion: "Celebramos la alegría de haber compartido la vida. Un servicio colorido y lleno de luz para recordar los mejores momentos.",
            imagen: "/images/imagenes_inicio/carrusel/huella_eterna.gif"
        }
    ];

    const [indicePlan, setIndicePlan] = useState(0);
    const siguientePlan = () => setIndicePlan((prev) => (prev + 1) % planesData.length);
    const anteriorPlan = () => setIndicePlan((prev) => (prev - 1 + planesData.length) % planesData.length);

    return (
        <div className="min-h-screen bg-[#F4EDE6] font-['Hepta_Slab'] relative overflow-x-hidden">
            <Navbar />

            {/* 1. EL GIF DE FONDO UNIVERSAL */}
            <div className="absolute top-0 left-0 w-full h-screen z-0 pointer-events-none overflow-hidden">
                <img src="/images/fondo-animado.gif" className="w-full h-full object-cover" alt="Fondo" />
            </div>

            {/* 2. BANNER PRINCIPAL */}
            <main className="relative pt-32 px-12 z-10 flex flex-col justify-center min-h-screen">
                <div className="w-1/2 relative z-20 mb-20 ml-32">
                    <h2 className="text-[30px] text-[#5D4E3F] mb-6 font-bold">Bienvenidos a Mouren</h2>
                    <p className="text-[18px] text-gray-700 mb-8 leading-relaxed max-w-[400px]">
                        En Mouren entendemos que despedir a un ser querido es uno de los momentos más difíciles de la vida. Por eso estamos aquí para acompañarte con respeto, tranquilidad y apoyo, brindando soluciones que honran la memoria.
                    </p>
                    <button className="bg-[#5D4E3F] text-white px-8 py-3 rounded-full shadow-lg hover:bg-[#FFC600] transition">
                        Hablar con un asesor
                    </button>
                </div>
            </main>

            {/* 3. SECCIÓN NUESTROS SERVICIOS */}
            <section className="relative z-30 py-24 px-12 bg-[#F4EDE6] flex items-center justify-between">
                <div className="w-1/2 max-w-xl ml-32">
                    <h2 className="text-3xl text-[#5D4E3F] font-bold mb-8 italic">Nuestros servicios</h2>
                    <p className="text-[17px] text-gray-700 leading-relaxed mb-6">
                        En Mouren ofrecemos un acompañamiento integral a las familias en los momentos más difíciles, brindando atención y orientación las 24 horas. Nuestro servicio incluye preparación del cuerpo, traslado desde el lugar del fallecimiento, sala de velación, acompañamiento durante el cortejo fúnebre y apoyo en los trámites legales y religiosos necesarios.
                        <br /><br />
                        Además, contamos con cobertura a nivel nacional y opciones de inhumación o cremación, garantizando un servicio digno, respetuoso y profesional que honra la memoria de quienes siempre vivirán en nuestros recuerdos.
                    </p>
                    <button className="bg-[#5D4E3F] text-white px-8 py-3 rounded-full hover:bg-[#A68966] transition shadow-md">
                        ¿Quieres conocer mas sobre nosotros?
                    </button>
                </div>
                <div className="w-1/3 flex flex-col items-center mr-18 gap-3">
                    <img src="/images/imagenes_inicio/pedazo_papel_mensaje.png" className="w-60 rotate-6  z-30" alt="Papel" />
                    <img src="/images/imagenes_inicio/pedazo_de_papel_mouri.gif" className="w-56 -rotate-3  -mt-20 z-20" alt="Papel" />
                    <img src="/images/imagenes_inicio/pedazo_papel_servicio.gif" className="w-56 rotate-6 -mt-20 z-10" alt="Papel" />
                </div>
            </section>

            {/* 4. SECCIÓN VIDEO Y "ABOUT US" */}
            <section className="relative w-full min-h-screen py-24 bg-cover bg-center" style={{ backgroundImage: "url('/images/imagenes_inicio/papel_espacio_video_inicio.jpg')" }}>
                <img src="/images/imagenes_inicio/borde_papel.png" className="absolute top-0 left-0 w-full z-30 -translate-y-12" alt="Borde" />
                <div className="container mx-auto px-12 relative z-20 flex items-center justify-between gap-16">
                    <div className="w-1/2 flex justify-center">
                        <div className="relative aspect-[4/3] w-full max-w-lg bg-[#D4C3A3] p-4 shadow-xl border-4 border-[#A65966]/20 rounded-md">
                            <video controls className="w-full h-full object-cover rounded shadow-inner">
                                <source src="/videos/mouri_el_cuervo_video.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                    <div className="w-1/2 text-white space-y-3 ml-14">
                        <h4 className="text-2xl font-medium tracking-tight">About Us</h4>
                        <h2 className="text-2xl font-extrabold leading-tight">Acompañándote en cada despedida</h2>
                        <h3 className="text-2xl font-bold text-[#F5AD27]">Un homenaje digno para quienes amas</h3>
                        <p className="text-1xl leading-relaxed max-w-md">Te brindamos acompañamiento humano, servicios integrales y apoyo constante para honrar la vida de tus seres queridos con respeto, amor y tranquilidad.</p>
                        <div className="flex items-center gap-10 bg-[#D6C2A0] p-4 rounded-2xl shadow-lg border border-[#A68966]/30 text-[#382A10]">
                            <div className="text-center"> <p className="text-2xl font-extrabold">4+</p> <p className="text-sm font-semibold">Planes</p> </div>
                            <div className="h-16 w-px bg-[#5D4E3F]/30"></div>
                            <div className="text-center"> <p className="text-2xl font-extrabold">100+</p> <p className="text-sm font-semibold max-w-[100px]">Familias Acompañadas</p> </div>
                            <div className="h-16 w-px bg-[#5D4E3F]/30"></div>
                            <div className="text-center"> <p className="text-2xl font-extrabold">100%</p> <p className="text-sm font-semibold">Confianza</p> </div>
                        </div>
                        <p className="text-xl font-bold pt-4">Frase de Mouri “el cuervo”</p>
                    </div>
                </div>
                <img src="/images/imagenes_inicio/cuervo_cine.png" className="absolute bottom-10 left-10 w-72 z-30 pointer-events-none" alt="Mouri Cine" />
            </section>

            {/* 5. SECCIÓN PLANES (GIF CORREGIDO) */}
            <section className="relative w-full bg-[#5D4E3F] text-[#F4EDE6] overflow-visible flex min-h-[500px]">
                {/* Borde Superior */}
                <img src="/images/imagenes_inicio/borde_papel.png" className="absolute top-0 left-0 w-full z-30 -translate-y-12" alt="Borde" />

                {/* Lado Izquierdo: Texto */}
                <div className="w-3/5 flex flex-col justify-center pl-32 pr-12 py-24 relative z-20">
                    <h2 className="text-2xl font-bold leading-tight mb-8">En Mouren, cada despedida es única</h2>
                    <p className="text-lg leading-relaxed opacity-90 mb-6">
                        Aquí en Mouren, creemos que cada persona merece un homenaje a su medida. Por eso, junto a Mouri, nuestra simpática mascota, te presentamos una variedad de planes que se adaptan a ti, tus valores, tu estilo de vida y el legado que quieres dejar.
                    </p>
                    <p className="text-lg leading-relaxed opacity-90 mb-10">
                        Desde ceremonias tradicionales hasta despedidas llenas de personalidad, en Mouren encontrarás la opción perfecta para ti y tus seres queridos.
                    </p>
                    <button className="w-fit bg-[#A68966]/60 text-[#F4EDE6] px-10 py-3 rounded-full hover:bg-[#FFC600] hover:text-[#5D4E3F] transition shadow-md font-semibold">
                        Ver todos los planes →
                    </button>
                </div>

                {/* Lado Derecho: GIF Delgado y Pegado al Borde */}
                <div className="w-2/5 flex items-stretch justify-end">
                    <img
                        src="/images/imagenes_inicio/gif_4_planes.gif"
                        className="h-full w-full object-cover object-right"
                        alt="Planes GIF"
                    />
                </div>

                {/* Borde Inferior */}
                <img src="/images/imagenes_inicio/borde_papel.png" className="absolute bottom-0 left-0 w-full z-30 rotate-180 translate-y-12" alt="Borde" />
            </section>

            {/* 6. CARRUSEL ARTÍSTICO (MÁS PEQUEÑO Y ESTILIZADO) */}
            <section className="relative w-full min-h-[110vh] bg-[#FFFFFf] flex flex-col items-center justify-center py-20 z-10">
                <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-80">
                    <img src="/images/imagenes_inicio/fondo_flores_planes.gif" className="w-full h-full object-cover" alt="Flores" />
                </div>
                <div className="relative z-10 flex items-center gap-6">
                    <button onClick={anteriorPlan} className="bg-[#5D4E3F] text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition">←</button>
                    {/* Cuadro un poco más pequeño (580px) */}
                    <div className="relative w-[580px] h-[400px] border-[12px] border-[#D4C3A3] rounded-sm shadow-xl overflow-hidden bg-white/95">
                        <img src={planesData[indicePlan].imagen} className="absolute inset-0 w-full h-full object-cover opacity-100" alt="Fondo" />
                        <div className="relative z-20 p-12 flex flex-col justify-center h-full text-[#FFFFFF] space-y-4">
                            <h3 className="text-3xl font-bold italic">🕊️ {planesData[indicePlan].titulo}</h3>
                            <p className="text-lg leading-relaxed max-w-sm font-medium">{planesData[indicePlan].descripcion}</p>
                            <button className="w-fit border-2 border-[#FFC200] px-8 py-2 rounded-full hover:bg-[#FFFFF] hover:text-black transition font-bold">Ver el plan →</button>
                        </div>
                    </div>
                    <button onClick={siguientePlan} className="bg-[#5D4E3F] text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition">→</button>
                </div>
                <div className="absolute bottom-4 right-20 z-20">
                    <img src="/images/imagenes_inicio/mouri_pintor.png" className="w-64 h-auto" alt="Mouri Pintor" />
                </div>
            </section>
            {/* SECCIÓN RECUERDOS Y DETALLES */}
            <section className="relative w-full bg-[#5D4E3F] text-[#F4EDE6] overflow-visible py-24">

                {/* Borde Superior Rasgado */}
                <img
                    src="/images/imagenes_inicio/borde_papel.png"
                    alt="Borde superior"
                    className="absolute top-0 left-0 w-full z-30 -translate-y-12"
                />

                <div className="container mx-auto px-12 flex items-center justify-between gap-16">

                    {/* LADO IZQUIERDO: Texto Informativo */}
                    <div className="w-1/2 max-w-lg ml-32 z-20">
                        <h2 className="text-3xl font-bold leading-tight mb-8">
                            Recuerdos que acompañan, detalles que perduran
                        </h2>

                        <p className="text-lg leading-relaxed opacity-90 mb-6 text[#FFA900]">
                            En Mouren, cada despedida deja una huella. Por eso, según el plan elegido, ofrecemos recuerdos únicos que celebran la vida de quienes amamos.
                        </p>

                        <p className="text-lg leading-relaxed opacity-90">
                            Desde un tierno peluche de Mouri, hasta tarjetas con mensajes, flores prensadas, joyas conmemorativas y más.
                        </p>
                    </div>

                    {/* LADO DERECHO: Collage de Imágenes Superpuestas */}
                    <div className="w-1/2 relative h-[500px] flex items-center justify-center mr-20">

                        {/* 1. Tarjeta/Separador al fondo (Rotado) */}
                        <img
                            src="/images/imagenes_inicio/separador.png"
                            alt="Separador"
                            className="absolute w-40 h-auto rotate-[-15deg] -translate-x-20 -translate-y-10 shadow-2xl z-10"
                        />

                        {/* 2. Tarjeta con texto (Centrada un poco a la derecha) */}
                        <img
                            src="/images/imagenes_inicio/recordatorio_con_perlas.png"
                            alt="Tarjeta"
                            className="absolute w-60 h-auto rotate-[5deg] translate-x-16 translate-x-40 z-20"
                        />

                        {/* 3. El Peluche de Mouri (En el centro y arriba de todo) */}
                        <img
                            src="/images/imagenes_inicio/peluche_mouri.png"
                            alt="Peluche Mouri"
                            className="absolute w-80 h-auto z-40 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] transform hover:scale-105 transition duration-300"
                        />

                        {/* 4. Etiqueta Circular */}
                        <img
                            src="/images/imagenes_inicio/recordatorio_circular.png"
                            alt="Etiqueta"
                            className="absolute w-40 h-auto bottom-20 left-10 rotate-[-10deg] z-30"
                        />
                    </div>
                </div>

                {/* Borde Inferior Rasgado */}
                <img
                    src="/images/imagenes_inicio/borde_papel.png"
                    alt="Borde inferior"
                    className="absolute bottom-0 left-0 w-full z-30 rotate-180 translate-y-12"
                />
            </section>
            {/* SECCIÓN FINAL: GRACIAS (CLOSE) */}
            {/* Fondo beige claro, padding vertical generoso, z-10 para asegurar que esté sobre el fondo */}
            <section className="relative w-full bg-[#F4EDE6] pt-32 pb-80 px-40 z-10 overflow-hidden">

                <div className="container mx-auto max-w-7xl flex flex-col items-center">

                    {/* 1. EL LISTÓN DE "GRACIAS" */}
                    <div className="relative mb-20 z-20">
                        {/* Imagen del listón beige */}
                        <img
                            src="/images/imagenes_inicio/liston.png" // Reemplaza con tu ruta real
                            alt="Listón Gracias"
                            className="w-[600px] h-auto drop-shadow-lg"
                        />
                        {/* Texto centrado sobre el listón */}
                        <h2 className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-[#5D4E3F] tracking-tight italic">
                            Gracias por llegar hasta aquí...
                        </h2>
                    </div>

                    {/* 2. CONTENIDO PRINCIPAL: Flex para separar texto del GIF */}
                    <div className="w-full flex items-center justify-between gap-16">

                        {/* LADO IZQUIERDO: Bloque de Texto Detallado */}
                        <div className="w-1/2 max-w-xl text-[#5D4E3F] space-y-6 z-20">
                            <p className="text-xl font-bold leading-snug">
                                En Mouren, creemos que el amor no termina con la vida.
                            </p>

                            <p className="text-lg leading-relaxed opacity-95">
                                Cada historia, cada abrazo y cada mirada queda guardada en quienes amamos. Sabemos que hablar de la muerte no es fácil, pero también sabemos que despedirse con calma, con belleza y con sentido... es una forma profunda de honrar la vida.
                            </p>

                            <p className="text-lg leading-relaxed opacity-95">
                                Por eso estamos aquí: para ayudarte a planear sin miedo, a recordar con cariño y a construir homenajes que se transforman en legado.
                            </p>

                            <p className="text-xl font-bold leading-snug pt-4">
                                Gracias por confiar en nosotros. <br />
                                Cuando llegue el momento, estaremos contigo.
                            </p>
                        </div>

                        {/* LADO DERECHO: El GIF del Collage y Cuervo */}
                        <div className="w-1/2 flex items-center justify-center relative">
                            {/* Este GIF debe contener la animación de los cuadros superpuestos, 
                                el cuervo parado arriba y la paloma blanca abajo. */}
                            <img
                                src="/images/imagenes_inicio/mouri_sentando.gif" // Reemplaza con tu GIF real
                                alt="Collage Recuerdos Mouren"
                                className="w-full max-w-lg h-auto drop-shadow-[0_15px_15px_rgba(93,78,63,0.3)] z-10"
                            />
                        </div>
                    </div>
                </div>

            </section>
            <Footer />

        </div>
    );

}


import {
    FaUsers,
    FaMusic,
    FaLeaf,
    FaMoneyBillWave
} from "react-icons/fa";

import DashboardCard from "./DashboardCard";

export default function EstadisticasDashboard({

    beneficiarios = 0,

    servicios = 0,

    cuota = 0,

    tieneCancion = false,

    reproduciendo = false

}) {

    return (

        <section className="mt-10">

            {/* Encabezado */}

            <div className="flex items-center justify-between mb-6">

                <div>

                    <p
                        className={`uppercase tracking-[4px] text-[10px] font-bold ${reproduciendo
                            ? "text-[#FFD97D]"
                            : "text-[#A68966]"
                            }`}
                    >
                        Centro de Protección
                    </p>

                    <h2
                        className={`text-2xl font-black ${reproduciendo
                            ? "text-white"
                            : "text-[#5D4E3F]"
                            }`}
                    >
                        Resumen Mouren
                    </h2>

                </div>

            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* BENEFICIARIOS */}

                <div className="col-span-12 lg:col-span-7">

                    <DashboardCard
                        icon={<FaUsers size={22} color="#5D4E3F" />}
                        title="Beneficiarios"
                        subtitle="Familia protegida"
                        value={beneficiarios}
                        description="Personas registradas dentro de tu protección exequial."
                        buttonText="Administrar"

                        background="#5D4E3F"
                        textColor="#FFFFFF"
                        borderColor="#74614F"
                        color="#FFFFFF"

                        reproduciendo={reproduciendo}
                    />

                </div>

                {/* TRIBUTO */}

                <div className="col-span-12 lg:col-span-5">

                    <DashboardCard
                        icon={<FaMusic size={22} color="#5D4E3F"/>}
                        title="Tributo Musical"
                        subtitle="Canción"
                        value={tieneCancion ? "Lista" : "Pendiente"}
                        description={
                            tieneCancion
                                ? "Tu homenaje musical ya está configurado."
                                : "Escoge una melodía especial."
                        }
                        buttonText="Explorar"

                        background="#8B6B52"
                        textColor="#FFFFFF"
                        borderColor="#A88969"
                        color="#FFFFFF"

                        reproduciendo={reproduciendo}
                    />

                </div>

                {/* SERVICIOS */}

                <div className="col-span-12 md:col-span-5">

                    <DashboardCard
                        icon={<FaLeaf size={22} />}
                        title="Cobertura"
                        subtitle="Servicios"
                        value={servicios}
                        description="Servicios incluidos dentro de tu plan Mouren."
                        buttonText="Ver cobertura"

                        background="#E4DCD3"
                        textColor="#5D4E3F"
                        borderColor="#D8C4AE"
                        color="#5D4E3F"

                        reproduciendo={reproduciendo}
                    />

                </div>

                {/* CUOTA */}

                <div className="col-span-12 md:col-span-7">

                    <DashboardCard
                        icon={<FaMoneyBillWave size={22} />}
                        title="Cuota Mensual"
                        subtitle="Estado"
                        value={`$${Number(cuota).toLocaleString()}`}
                        description="Tu plan continúa protegido y activo."
                        buttonText="Ver pagos"

                        background="#AE9A7E"
                        textColor="#ffffff"
                        borderColor="#B99773"
                        color="#4D392A"

                        reproduciendo={reproduciendo}
                    />

                </div>

            </div>

        </section>

    );

}
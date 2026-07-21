import AdminSidebar from "./AdminSidebar";
import { usePage } from "@inertiajs/react";

export default function VerFactura() {

    const { factura } = usePage().props;

    const dinero = (valor) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(valor);

    return (

        <div className="min-h-screen bg-[#F8F5F0] flex">

            <AdminSidebar />

            <main className="content-shift flex-1 p-10">

                <h1 className="text-4xl font-bold text-[#5D4E3F]">
                    Factura #{factura.id}
                </h1>

                <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">

                    <div className="grid grid-cols-2 gap-8">

                        <div>

                            <p className="text-gray-500">
                                Cliente
                            </p>

                            <h2 className="text-xl font-bold">
                                {factura.suscripcion.usuario.nombre}
                            </h2>

                        </div>

                        <div>

                            <p className="text-gray-500">
                                Plan
                            </p>

                            <h2 className="text-xl font-bold">
                                {factura.suscripcion.plan.nombre}
                            </h2>

                        </div>

                        <div>

                            <p className="text-gray-500">
                                Fecha emisión
                            </p>

                            <h2>
                                {factura.fecha_emision}
                            </h2>

                        </div>

                        <div>

                            <p className="text-gray-500">
                                Fecha vencimiento
                            </p>

                            <h2>
                                {factura.fecha_vencimiento}
                            </h2>

                        </div>

                        <div>

                            <p className="text-gray-500">
                                Total
                            </p>

                            <h2 className="text-2xl font-bold text-[#8B5E3C]">
                                {dinero(factura.total)}
                            </h2>

                        </div>

                        <div>

                            <p className="text-gray-500">
                                Estado
                            </p>

                            <h2>
                                {factura.estado.nombre}
                            </h2>

                        </div>

                    </div>

                </div>

            </main>

        </div>

    );

}
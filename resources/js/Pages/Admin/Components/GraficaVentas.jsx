import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

export default function GraficaVentas({
    pagadas,
    pendientes,
}) {
    const total = pagadas + pendientes;
    const porcentajePagadas = total > 0 ? ((pagadas / total) * 100).toFixed(1) : 0;
    const porcentajePendientes = total > 0 ? ((pendientes / total) * 100).toFixed(1) : 0;

    const data = {
        labels: [
            `Pagadas (${porcentajePagadas}%)`,
            `Pendientes (${porcentajePendientes}%)`,
        ],
        datasets: [
            {
                data: [
                    pagadas,
                    pendientes,
                ],
                backgroundColor: [
                    "#6FAF68",
                    "#D9A441",
                ],
                borderColor: [
                    "#ffffff",
                    "#ffffff",
                ],
                borderWidth: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    font: {
                        family: "'Hepta Slab', serif",
                        size: 12,
                        weight: 'bold',
                    },
                    color: '#5D4E3F',
                    padding: 20,
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: '#56473A',
                titleFont: {
                    family: "'Hepta Slab', serif",
                    size: 12,
                    weight: 'bold',
                },
                bodyFont: {
                    family: "'Hepta Slab', serif",
                    size: 11,
                },
                padding: 12,
                borderRadius: 8,
            },
        },
        cutout: "70%",
    };

    return (
        <div>
            <h2 className="text-lg font-white text-[#8F7E54] mb-6">
                Estado de Facturación
            </h2>
            <div className="flex justify-center">
                <div className="w-full max-w-xs">
                    <Doughnut
                        data={data}
                        options={options}
                    />
                </div>
            </div>
        </div>
    );
}

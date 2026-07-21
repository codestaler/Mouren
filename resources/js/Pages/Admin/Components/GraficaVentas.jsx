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

    const data = {

        labels: [

            "Pagadas",

            "Pendientes",

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

        plugins: {

            legend: {

                position: "bottom",

            },

        },

        cutout: "70%",

    };

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold text-[#5D4E3F] mb-6">

                Estado de Facturación

            </h2>

            <div className="w-80 mx-auto">

                <Doughnut

                    data={data}

                    options={options}

                />

            </div>

        </div>

    );

}
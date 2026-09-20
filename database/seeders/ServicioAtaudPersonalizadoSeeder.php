<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Servicio;
use Illuminate\Database\Seeder;

class ServicioAtaudPersonalizadoSeeder extends Seeder
{
    /**
     * Crea el servicio "Ataúd Personalizado" (si no existe) y lo conecta
     * como servicio BASE a los 3 planes humanos (todo lo que no sea el
     * plan de mascotas, id 4) — no como un extra que haya que agregar
     * manualmente. Seguro de correr varias veces: no duplica el servicio
     * ni la conexión con cada plan.
     */
    public function run(): void
    {
        $servicio = Servicio::firstOrCreate(
            ['nombre' => 'Ataúd Personalizado'],
            [
                'descripcion'    => 'Elige el color y el arreglo floral de tu cofre exequial.',
                'precio'         => 0,
                'personalizable' => 1,
                'aplica_a'       => 'humano',
            ]
        );

        $planesHumanos = Plan::where('id', '!=', 4)->get();

        foreach ($planesHumanos as $plan) {
            $yaConectado = $plan->servicios()->where('servicios.id', $servicio->id)->exists();
            if (!$yaConectado) {
                $plan->servicios()->attach($servicio->id);
            }
        }
    }
}

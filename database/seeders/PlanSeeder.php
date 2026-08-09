<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $planes = [
            [
                'id'            => 1,
                'nombre'        => 'Descanso Sereno',
                'descripcion'   => 'Plan de previsión exequial con cobertura esencial para ti y tu familia.',
                'cuota_base'    => 4500.00,
                'max_afiliados' => 5,
                'activo'        => true,
            ],
            [
                'id'            => 2,
                'nombre'        => 'Legado Eterno',
                'descripcion'   => 'Plan de previsión exequial con cobertura ampliada y beneficios adicionales.',
                'cuota_base'    => 7900.00,
                'max_afiliados' => 5,
                'activo'        => true,
            ],
            [
                'id'            => 3,
                'nombre'        => 'Tributo a la Vida',
                'descripcion'   => 'Plan de previsión exequial premium, con la cobertura más completa de Mouren.',
                'cuota_base'    => 10200.00,
                'max_afiliados' => 5,
                'activo'        => true,
            ],
            [
                'id'            => 4,
                'nombre'        => 'Huella Eterna',
                'descripcion'   => 'Plan de previsión exequial para mascotas, con protección y homenaje digno.',
                'cuota_base'    => 7000.00,
                'max_afiliados' => 5,
                'activo'        => true,
            ],
        ];

        foreach ($planes as $plan) {
            // ⚠️ Usamos ID fijo a propósito: tu código compara "plan_id == 4"
            // en varios lugares para identificar el plan de mascotas.
            Plan::updateOrCreate(['id' => $plan['id']], $plan);
        }
    }
}

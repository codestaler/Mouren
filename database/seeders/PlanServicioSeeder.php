<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Plan;
use App\Models\Servicio;

class PlanServicioSeeder extends Seeder
{
    /**
     * ⚠️ PROPUESTA INICIAL — ajusta estos nombres según lo que realmente
     * incluya cada plan en tu negocio. Están escritos por nombre de servicio
     * (no por ID) para que sea fácil de editar sin tener que buscar números.
     */
    public function run(): void
    {
        $incluidosPorPlan = [
            'Descanso Sereno' => [
                'Velatorio Básico',
                'Traslado Funerario',
                'Servicio Religioso',
                'Cenizario',
                'Publicación Obituario',
            ],
            'Legado Eterno' => [
                'Velatorio Básico',
                'Traslado Funerario',
                'Servicio Religioso',
                'Cenizario',
                'Publicación Obituario',
                'Ataúd Estándar',
                'Preparación Estética',
                'Floristería Funeraria',
                'Asistencia Legal',
            ],
            'Tributo a la Vida' => [
                'Velatorio Básico',
                'Traslado Funerario',
                'Servicio Religioso',
                'Cenizario',
                'Publicación Obituario',
                'Ataúd Estándar',
                'Preparación Estética',
                'Floristería Funeraria',
                'Asistencia Legal',
                'Cremación Humana',
                'Decoración Floral',
                'Sala de Velación Personalizada',
                'Ceremonia Especial',
                'Ambientación Emocional',
                'Transporte Decorado',
                'Urna Personalizada',
                'Libro de Mensajes',
                'Proyección Multimedia',
                'Flores Especiales',
                'Velas Conmemorativas',
                'Retrato Conmemorativo',
                'Streaming de Ceremonia',
                'Álbum Memorial',
            ],
            'Huella Eterna' => [
                'Memorial para Mascotas',
                'Traslado Funerario',
                'Servicio Religioso',
                'Cenizario',
                'Floristería Funeraria',
                'Urna Personalizada',
                'Velas Conmemorativas',
            ],
        ];

        foreach ($incluidosPorPlan as $nombrePlan => $nombresServicios) {
            $plan = Plan::where('nombre', $nombrePlan)->first();

            if (!$plan) {
                $this->command->warn("⚠️ No se encontró el plan '{$nombrePlan}'. ¿Ya corriste PlanSeeder?");
                continue;
            }

            foreach ($nombresServicios as $nombreServicio) {
                $servicio = Servicio::where('nombre', $nombreServicio)->first();

                if (!$servicio) {
                    $this->command->warn("⚠️ No se encontró el servicio '{$nombreServicio}'. ¿Ya corriste ServiciosSeeder?");
                    continue;
                }

                DB::table('plan_servicio')->updateOrInsert(
                    ['plan_id' => $plan->id, 'servicio_id' => $servicio->id],
                    ['cantidad' => 1, 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }
}

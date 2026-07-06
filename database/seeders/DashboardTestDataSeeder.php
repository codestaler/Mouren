<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SalaVelacion;
use App\Models\ServicioFunerario;
use App\Models\Ceremonia;
use App\Models\Afiliado;
use App\Models\Mascota;
use Carbon\Carbon;

class DashboardTestDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear las 5 salas de velación con diferentes estados
        $sala1 = SalaVelacion::create(['nombre' => 'Sala Celestial', 'estado' => 'Ocupada']);
        $sala2 = SalaVelacion::create(['nombre' => 'Sala Aurora', 'estado' => 'Ocupada']);
        $sala3 = SalaVelacion::create(['nombre' => 'Sala Mouri', 'estado' => 'Disponible']);
        SalaVelacion::create(['nombre' => 'Sala Paz Eterna', 'estado' => 'Disponible']);
        SalaVelacion::create(['nombre' => 'Sala Olivos', 'estado' => 'Mantenimiento']);

        // 2. Buscar un afiliado y una mascota existentes para amarrar el servicio funerario
        $afiliado = Afiliado::first();
        $mascota = Mascota::first();

        // 3. Crear Servicio Funerario de prueba para el Afiliado (Persona) si existe
        if ($afiliado) {
            $servicioPersona = ServicioFunerario::create([
                'afiliado_id' => $afiliado->id,
                'mascota_id' => null,
                'fecha_inicio' => Carbon::now()->toDateTimeString(),
                'cancion_id' => null, // O pon un ID de canción real si tienes
                'observaciones' => 'Servicio coordinado con la familia.'
            ]);

            // Agendamos la ceremonia de esta persona para el DÍA 15 de este mes en la Sala 1
            Ceremonia::create([
                'servicio_funerario_id' => $servicioPersona->id,
                'sala_velacion_id' => $sala1->id,
                'fecha_hora' => Carbon::now()->day(15)->hour(14)->minute(0)->toDateTimeString(),
                'observaciones' => 'Homenaje presencial y transmisión virtual.'
            ]);
        }

        // 4. Crear Servicio Funerario de prueba para la Mascota si existe
        if ($mascota) {
            $servicioMascota = ServicioFunerario::create([
                'afiliado_id' => null,
                'mascota_id' => $mascota->id,
                'fecha_inicio' => Carbon::now()->subDays(2)->toDateTimeString(),
                'cancion_id' => null,
                'observaciones' => 'Servicio de cremación e inhumación de cenizas.'
            ]);

            // Agendamos la ceremonia de la mascota para el DÍA 20 de este mes en la Sala 2
            Ceremonia::create([
                'servicio_funerario_id' => $servicioMascota->id,
                'sala_velacion_id' => $sala2->id,
                'fecha_hora' => Carbon::now()->day(20)->hour(10)->minute(30)->toDateTimeString(),
                'observaciones' => 'Despedida en la sala de mascotas con apoyo de Mouri IA.'
            ]);
        }
    }
}
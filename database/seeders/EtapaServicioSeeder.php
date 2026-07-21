<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Procesos\EtapaServicio;

class EtapaServicioSeeder extends Seeder
{
    public function run(): void
    {
        $etapas = [
            'Fallecimiento Registrado',
            'Ceremonia Programada',
            'En Sala de Velación',
            'Cremación / Inhumación',
            'Servicio Finalizado',
        ];

        foreach ($etapas as $nombre) {
            EtapaServicio::firstOrCreate(['nombre' => $nombre]);
        }
    }
}
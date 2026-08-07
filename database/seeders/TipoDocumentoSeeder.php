<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoDocumentoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tipos_documento')->insertOrIgnore([
            ['id' => 1, 'nombre' => 'Cédula de Ciudadanía', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nombre' => 'Tarjeta de Identidad', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'nombre' => 'Cédula de Extranjería', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'nombre' => 'Pasaporte', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'nombre' => 'Registro Civil', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}

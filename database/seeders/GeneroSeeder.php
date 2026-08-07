<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GeneroSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('generos')->insertOrIgnore([
            ['id' => 1, 'nombre' => 'Masculino', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nombre' => 'Femenino', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'nombre' => 'No Binario', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'nombre' => 'Prefiero no decirlo', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RazaSeeder extends Seeder
{
    public function run(): void
    {
        $razas = [
            // Razas de Perros (especie_id: 1)
            ['nombre' => 'Pastor Alemán', 'especie_id' => 1, 'created_at' => now()],
            ['nombre' => 'Pug', 'especie_id' => 1, 'created_at' => now()],
            ['nombre' => 'Golden Retriever', 'especie_id' => 1, 'created_at' => now()],
            ['nombre' => 'Criollo / Mestizo (Perro)', 'especie_id' => 1, 'created_at' => now()],
            
            // Razas de Gatos (especie_id: 2)
            ['nombre' => 'Siamés', 'especie_id' => 2, 'created_at' => now()],
            ['nombre' => 'Persa', 'especie_id' => 2, 'created_at' => now()],
            ['nombre' => 'Angora', 'especie_id' => 2, 'created_at' => now()],
            ['nombre' => 'Criollo / Mestizo (Gato)', 'especie_id' => 2, 'created_at' => now()],
        ];

        DB::table('razas')->insert($razas);
    }
}
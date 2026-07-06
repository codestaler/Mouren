<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EspecieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $especies = [
            ['nombre' => 'Perro', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Gato', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Ave', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Roedor (Hámster, Cuy, Conejo)', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Reptil', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Otro', 'created_at' => now(), 'updated_at' => now()],
        ];

        // Insertamos las especies de forma masiva
        DB::table('especies')->insert($especies);
    }
}
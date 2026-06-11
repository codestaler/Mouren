<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoFacturaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('estados_factura')->insert([
            ['id' => 1, 'nombre' => 'Pendiente', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nombre' => 'Pagado', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
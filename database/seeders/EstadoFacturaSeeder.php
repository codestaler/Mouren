<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoFacturaSeeder extends Seeder
{
    public function run(): void
    {
        $estados = [
            ['id' => 1, 'nombre' => 'Pendiente', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nombre' => 'Pagado', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'nombre' => 'Abonado', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'nombre' => 'Anulado', 'created_at' => now(), 'updated_at' => now()],
        ];

        // Recorremos cada estado y usamos updateOrInsert para evitar el error de duplicados
        foreach ($estados as $estado) {
            DB::table('estados_factura')->updateOrInsert(
                ['id' => $estado['id']], // Condición para buscar si ya existe
                $estado                  // Los datos que va a insertar o actualizar
            );
        }
    }
}
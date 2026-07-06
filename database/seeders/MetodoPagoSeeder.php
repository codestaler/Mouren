<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MetodoPagoSeeder extends Seeder
{
    public function run(): void
    {
        $metodos = [
            [
                'id' => 1,
                'nombre' => 'Mercado Pago / PSE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'nombre' => 'Transferencia Bancaria Directa',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'nombre' => 'Efectivo / Caja',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        foreach ($metodos as $metodo) {
            DB::table('metodos_pago')->updateOrInsert(['id' => $metodo['id']], $metodo);
        }
    }
}
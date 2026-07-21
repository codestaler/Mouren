<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EstadoUsuario;

class EstadoUsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $estados = [
            ['id' => 1, 'nombre' => 'Activo'],
            ['id' => 2, 'nombre' => 'Inactivo'],
            ['id' => 3, 'nombre' => 'Suspendido'],
            ['id' => 4, 'nombre' => 'Pendiente'],
            ['id' => 5, 'nombre' => 'Bloqueado'],
        ];

        foreach ($estados as $estado) {
            EstadoUsuario::updateOrCreate(
                ['id' => $estado['id']],
                ['nombre' => $estado['nombre']]
            );
        }
    }
}
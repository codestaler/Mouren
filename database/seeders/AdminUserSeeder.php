<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // 🔒 Cambia estos datos por los que quieras usar de verdad
        $email = 'admin@mouren.com';
        $password = 'CambiaEstaClave123!';

        // firstOrCreate: si ya existe un usuario con este correo, no hace nada
        // (así puedes correr este seeder varias veces sin riesgo de duplicar)
        User::firstOrCreate(
            ['email' => $email],
            [
                'nombre'            => 'Administrador Mouren',
                'nombre1'           => 'Administrador',
                'apellido1'         => 'Mouren',
                'cedula'            => 'ADMIN-' . time(),
                'password'          => Hash::make($password),
                'tipo_documento_id' => 1, // Cédula de Ciudadanía
                'genero_id'         => 1, // Masculino (ajusta si prefieres otro)
                'estado_id'         => 1, // Activo
                'tipo_usuario_id'   => 1, // Administrador
                'fecha_nacimiento'  => now()->subYears(30)->format('Y-m-d'),
                'telefono'          => '0000000000',
            ]
        );
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admins = [
            [
                'email'    => 'admin@mouren.com',
                'password' => 'CambiaEstaClave123!',
                'nombre'   => 'Administrador Mouren',
            ],
            [
                'email'    => 'aud.profesores@mouren.com',
                'password' => 'Addmin155#',
                'nombre'   => 'Admin Dos',
            ],
        ];

        foreach ($admins as $admin) {
            // firstOrCreate: si ya existe un usuario con este correo, no hace nada
            // (así puedes correr este seeder varias veces sin riesgo de duplicar)
            User::firstOrCreate(
                ['email' => $admin['email']],
                [
                    'nombre'            => $admin['nombre'],
                    'cedula'            => 'ADMIN-' . time() . '-' . rand(100, 999), // 👈 rand() evita choque si se crean en el mismo segundo
                    'password'          => Hash::make($admin['password']),
                    'tipo_documento_id' => 1, // Cédula de Ciudadanía
                    'genero_id'         => 1, // Masculino (ajusta si prefieres otro)
                    'estado_id'         => 1, // Activo
                    'tipo_usuario_id'   => 1, // Administrador
                    'fecha_nacimiento'  => now()->subYears(30)->format('Y-m-d'),
                    'telefono'          => '0000000000',
                    'idioma'                    => 'es',
                    'tema'                      => 'claro',
                    'notificaciones_activadas'  => 1,
                ]
            );
        }
    }
}

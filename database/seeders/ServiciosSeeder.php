<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiciosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         $servicios = [
            [
                'nombre' => 'Cremación Humana',
                'descripcion' => 'Servicio de cremación con urna incluida',
                'precio' => 1800.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Velatorio Básico',
                'descripcion' => 'Uso de sala velatoria por 24 horas',
                'precio' => 1200.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Ataúd Estándar',
                'descripcion' => 'Ataúd de madera estándar para servicio funerario',
                'precio' => 2500.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Traslado Funerario',
                'descripcion' => 'Traslado del fallecido dentro de la ciudad',
                'precio' => 800.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Servicio Religioso',
                'descripcion' => 'Ceremonia religiosa personalizada',
                'precio' => 600.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Preparación Estética',
                'descripcion' => 'Arreglo y preparación estética del cuerpo',
                'precio' => 950.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Publicación Obituario',
                'descripcion' => 'Publicación de obituario en medios locales',
                'precio' => 300.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Floristería Funeraria',
                'descripcion' => 'Arreglos florales para ceremonia funeraria',
                'precio' => 700.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Cenizario',
                'descripcion' => 'Espacio para conservación de cenizas',
                'precio' => 1500.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Asistencia Legal',
                'descripcion' => 'Gestión de documentación y trámites legales',
                'precio' => 500.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Decoración Floral',
                'descripcion' => 'Servicio de decoración floral personalizada para ceremonias y salas de velación.',
                'precio' => 1200.00,
                'personalizable' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Sala de Velación Personalizada',
                'descripcion' => 'Ambientación personalizada de la sala con iluminación, colores y temática emocional.',
                'precio' => 1800.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Ceremonia Especial',
                'descripcion' => 'Personalización completa de la ceremonia según preferencias familiares.',
                'precio' => 1500.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Ambientación Emocional',
                'descripcion' => 'Configuración de iluminación y ambiente para crear un espacio especial.',
                'precio' => 1000.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Transporte Decorado',
                'descripcion' => 'Decoración personalizada del vehículo funerario con detalles especiales.',
                'precio' => 2500.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Urna Personalizada',
                'descripcion' => 'Selección y personalización de urnas con grabados y acabados especiales.',
                'precio' => 2400.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Memorial para Mascotas',
                'descripcion' => 'Servicio especial para mascotas incluyendo homenaje y decoración personalizada.',
                'precio' => 1050.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Libro de Mensajes',
                'descripcion' => 'Libro físico o digital donde familiares y amigos pueden dejar mensajes y recuerdos.',
                'precio' => 2000.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Proyección Multimedia',
                'descripcion' => 'Pantallas y proyecciones de fotografías y videos durante la ceremonia.',
                'precio' => 1200.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Flores Especiales',
                'descripcion' => 'Arreglos florales con selección personalizada de flores y colores.',
                'precio' => 1300.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Velas Conmemorativas',
                'descripcion' => 'Velas decorativas y conmemorativas personalizadas para la ceremonia.',
                'precio' => 900.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Retrato Conmemorativo',
                'descripcion' => 'Creación de retrato artístico o digital para homenaje del ser querido.',
                'precio' => 1200.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Streaming de Ceremonia',
                'descripcion' => 'Transmisión en vivo privada para familiares que no puedan asistir presencialmente.',
                'precio' => 1400.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Álbum Memorial',
                'descripcion' => 'Álbum físico o digital con fotografías y recuerdos del homenaje.',
                'precio' => 1200.00,
                'personalizable' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($servicios as $servicio) {
    DB::table('servicios')->updateOrInsert(
        [
            'nombre' => $servicio['nombre']
        ],
        [
            'descripcion' => $servicio['descripcion'],
            'precio' => $servicio['precio'],
            'personalizable' => $servicio['personalizable'],
            'created_at' => now(),
            'updated_at' => now(),
        ]
    );
}
    }
}
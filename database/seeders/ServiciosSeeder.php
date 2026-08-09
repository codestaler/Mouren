<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Servicio;

class ServiciosSeeder extends Seeder
{
    public function run(): void
    {
        $servicios = [
            ['nombre' => 'Cremación Humana',              'descripcion' => 'Servicio de cremación con urna incluida',                                                  'precio' => 1800.00, 'aplica_a' => 'humano', 'personalizable' => 0],
            ['nombre' => 'Velatorio Básico',               'descripcion' => 'Uso de sala velatoria por 24 horas',                                                        'precio' => 1200.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Ataúd Estándar',                 'descripcion' => 'Ataúd de madera estándar para servicio funerario',                                          'precio' => 2500.00, 'aplica_a' => 'humano', 'personalizable' => 0],
            ['nombre' => 'Traslado Funerario',             'descripcion' => 'Traslado del fallecido dentro de la ciudad',                                               'precio' => 800.00,  'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Servicio Religioso',             'descripcion' => 'Ceremonia religiosa personalizada',                                                        'precio' => 600.00,  'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Preparación Estética',           'descripcion' => 'Arreglo y preparación estética del cuerpo',                                                'precio' => 950.00,  'aplica_a' => 'humano', 'personalizable' => 0],
            ['nombre' => 'Publicación Obituario',          'descripcion' => 'Publicación de obituario en medios locales',                                               'precio' => 300.00,  'aplica_a' => 'humano', 'personalizable' => 0],
            ['nombre' => 'Floristería Funeraria',          'descripcion' => 'Arreglos florales para ceremonia funeraria',                                               'precio' => 700.00,  'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Cenizario',                      'descripcion' => 'Espacio para conservación de cenizas',                                                     'precio' => 1500.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Asistencia Legal',               'descripcion' => 'Gestión de documentación y trámites legales',                                              'precio' => 500.00,  'aplica_a' => 'humano', 'personalizable' => 0],
            ['nombre' => 'Decoración Floral',              'descripcion' => 'Servicio de decoración floral personalizada para ceremonias y salas de velación.',          'precio' => 1200.00, 'aplica_a' => 'ambos',  'personalizable' => 1],
            ['nombre' => 'Sala de Velación Personalizada', 'descripcion' => 'Ambientación personalizada de la sala con iluminación, colores y temática emocional.',       'precio' => 1800.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Ceremonia Especial',             'descripcion' => 'Personalización completa de la ceremonia según preferencias familiares.',                   'precio' => 1500.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Ambientación Emocional',         'descripcion' => 'Configuración de iluminación y ambiente para crear un espacio especial.',                   'precio' => 1000.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Transporte Decorado',            'descripcion' => 'Decoración personalizada del vehículo funerario con detalles especiales.',                  'precio' => 2500.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Urna Personalizada',             'descripcion' => 'Selección y personalización de urnas con grabados y acabados especiales.',                  'precio' => 2400.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Memorial para Mascotas',         'descripcion' => 'Servicio especial para mascotas incluyendo homenaje y decoración personalizada.',            'precio' => 1050.00, 'aplica_a' => 'mascota','personalizable' => 0],
            ['nombre' => 'Libro de Mensajes',              'descripcion' => 'Libro físico o digital donde familiares y amigos pueden dejar mensajes y recuerdos.',        'precio' => 2000.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Proyección Multimedia',          'descripcion' => 'Pantallas y proyecciones de fotografías y videos durante la ceremonia.',                    'precio' => 1200.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Flores Especiales',              'descripcion' => 'Arreglos florales con selección personalizada de flores y colores.',                       'precio' => 1300.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Velas Conmemorativas',           'descripcion' => 'Velas decorativas y conmemorativas personalizadas para la ceremonia.',                     'precio' => 900.00,  'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Retrato Conmemorativo',          'descripcion' => 'Creación de retrato artístico o digital para homenaje del ser querido.',                    'precio' => 1200.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Streaming de Ceremonia',         'descripcion' => 'Transmisión en vivo privada para familiares que no puedan asistir presencialmente.',        'precio' => 1400.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
            ['nombre' => 'Álbum Memorial',                 'descripcion' => 'Álbum físico o digital con fotografías y recuerdos del homenaje.',                         'precio' => 1200.00, 'aplica_a' => 'ambos',  'personalizable' => 0],
        ];

        foreach ($servicios as $servicio) {
            // 🔑 Clave por NOMBRE, no por id: así nunca se duplica sin importar
            // cuántas veces corras el seeder, y no dependemos de IDs fijos.
            Servicio::updateOrCreate(
                ['nombre' => $servicio['nombre']],
                $servicio
            );
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Recuerdo;

class RecuerdoSeeder extends Seeder
{
    public function run(): void
    {
        $recuerdos = [
            ['id' => 1, 'nombre' => 'Peluche de Mouri',    'descripcion' => 'Tarjeta con diseño floral personalizado para ceremonia', 'precio_adicional' => 200.00,  'imagen' => 'peluche_mouri.png'],
            ['id' => 2, 'nombre' => 'Separador de libro',  'descripcion' => 'Set de velas para homenaje y ceremonia',                 'precio_adicional' => 350.00,  'imagen' => 'separador.png'],
            ['id' => 3, 'nombre' => 'Recuerdo con perlas', 'descripcion' => 'Urna con grabado personalizado',                        'precio_adicional' => 1200.00, 'imagen' => 'recordatorio_con_perlas.png'],
            ['id' => 4, 'nombre' => 'Taza del Alma',       'descripcion' => 'Foto enmarcada del ser querido',                        'precio_adicional' => 500.00,  'imagen' => 'taza_mouri.png'],
            ['id' => 5, 'nombre' => 'Arbol de la Vida',    'descripcion' => 'Libro para mensajes de familiares y amigos',            'precio_adicional' => 300.00,  'imagen' => 'planta_lazo.png'],
            ['id' => 6, 'nombre' => 'Cofre de recuerdos',  'descripcion' => 'Arreglo floral grande para ceremonia principal',        'precio_adicional' => 900.00,  'imagen' => 'recordatorio_circular.png'],
        ];

        foreach ($recuerdos as $recuerdo) {
            // ID fijo: el frontend guarda recuerdo_id por número, así que mantenemos
            // los mismos IDs que ya tenías para no romper nada existente.
            Recuerdo::updateOrCreate(['id' => $recuerdo['id']], $recuerdo);
        }
    }
}

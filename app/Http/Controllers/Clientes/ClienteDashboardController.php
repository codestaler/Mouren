<?php

namespace App\Http\Controllers\Clientes;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Suscripcion;
use Illuminate\Support\Facades\DB;

class ClienteDashboardController extends Controller
{
    public function index()
    {
        // Traemos la suscripción, su plan y los recuerdos
        $suscripcion = Suscripcion::with([
            'plan', 
            'afiliados',
            'recuerdos'
        ])
        ->where('usuario_id', auth()->id())
        ->where('estado', 'activo')
        ->first();

        // ⚡ SOLUCIÓN DE RESPALDO DIRECTA A LA BASE DE DATOS ⚡
        // Como las relaciones en el modelo Afiliado fallan, buscamos la canción directo en la tabla pivote
        if ($suscripcion && $suscripcion->afiliados->isNotEmpty()) {
            // Tomamos el ID del primer afiliado
            $primerAfiliadoId = $suscripcion->afiliados->first()->id;

            // Hacemos una consulta limpia a la tabla de servicios_funerarios para traer su canción
            $servicioFunerario = DB::table('servicios_funerarios')
                ->where('afiliado_id', $primerAfiliadoId)
                ->first();

            if ($servicioFunerario && $servicioFunerario->cancion_id) {
                // Buscamos los datos de esa canción (Título y Archivo)
                $cancion = DB::table('canciones')->where('id', $servicioFunerario->cancion_id)->first();
                
                if ($cancion) {
                    // Se la inyectamos a la suscripción para que React la lea sin problemas
                    $suscripcion->cancion_tributo = [
                        'id' => $cancion->id,
                        'titulo' => $cancion->titulo,
                        'archivo_audio' => $cancion->archivo_audio
                    ];
                }
            }
        }

        return Inertia::render('Clientes/MiPlan', [
            'suscripcion' => $suscripcion
        ]);
    }
}
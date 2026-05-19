<?php

namespace App\Http\Controllers\Clientes;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ClienteDashboardController extends Controller
{
public function index()
{
    $suscripcion = \App\Models\Suscripcion::with([
        'plan', 
        'afiliados.servicioFunerario.cancion', // Cargamos toda la cadena
        'recuerdos'
    ])
    ->where('usuario_id', auth()->id())
    ->where('estado', 'activo')
    ->first();

    // Extraemos la canción del primer afiliado para mostrarla en la tarjeta
    if ($suscripcion && $suscripcion->afiliados->isNotEmpty()) {
        $primerServicio = $suscripcion->afiliados->first()->servicioFunerario;
        $suscripcion->cancion_principal = $primerServicio->cancion ?? null;
    }

    return \Inertia\Inertia::render('Clientes/MiPlan', [
        'suscripcion' => $suscripcion
    ]);
}
    
}
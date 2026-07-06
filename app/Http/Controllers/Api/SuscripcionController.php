<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Suscripcion;
use App\Models\Afiliado;
use App\Models\Plan;
use App\Models\Servicio;
use App\Models\Cancion;
use App\Models\Recuerdo;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SuscripcionController extends Controller
{
public function miPlan()
{
    $user = auth()->user();

    // QUITALE el ->with('servicios') si te sigue dando error de tabla no encontrada
    $suscripciones = Suscripcion::where('usuario_id', $user->id)
        ->where('estado', 'activo')
        ->get();

        $suscripciones = Suscripcion::with([
    'plan',
    'afiliados',
    'mascotas.especie',
    'mascotas.raza'
])
->where('usuario_id', $user->id)
->where('estado', 'activo')
->get();
    
    $planHumano = $suscripciones->first(fn($s) => $s->plan_id != 4);
    $planMascota = $suscripciones->first(fn($s) => $s->plan_id == 4);

    if ($planHumano && $planHumano->afiliados->count() > 0) {

    $primerAfiliado = $planHumano->afiliados->first();

    $servicio = DB::table('servicios_funerarios')
        ->where('afiliado_id', $primerAfiliado->id)
        ->latest()
        ->first();

    if ($servicio && $servicio->cancion_id) {

        $cancion = DB::table('canciones')
            ->where('id', $servicio->cancion_id)
            ->first();

        $planHumano->cancion_tributo = $cancion;
    }
}

if ($planMascota && $planMascota->mascotas->count() > 0) {

    $primeraMascota = $planMascota->mascotas->first();

    $servicio = DB::table('servicios_funerarios')
        ->where('mascota_id', $primeraMascota->id)
        ->latest()
        ->first();

    if ($servicio && $servicio->cancion_id) {

        $cancion = DB::table('canciones')
            ->where('id', $servicio->cancion_id)
            ->first();

        $planMascota->cancion_tributo = $cancion;
    }
}
    return Inertia::render('Clientes/MiPlan', [
        'planHumano' => $planHumano,
        'planMascota' => $planMascota, // O tu lógica de mascota
    ]);
}

    public function store(Request $request)
    {
        \Log::info('VALOR RECIBIDO: ' . $request->input('cuota_mensual'));
        $userId = $request->usuario_id ?? Auth::id();

        if (!$userId) {
            return back()->withErrors(['error' => 'No se pudo identificar el usuario.']);
        }

        try {
            DB::beginTransaction();

            // 1. Crear suscripción
            $suscripcion = Suscripcion::create([
                'usuario_id'    => $userId,
                'plan_id'       => $request->plan_id,
                'cuota_mensual' => $request->input('cuota_mensual') ?? 0,
                'estado'        => 'activo',
                'fecha_inicio'  => now(),
            ]);

            // 2. Procesar afiliados y servicios funerarios
            if ($request->has('afiliados')) {
                foreach ($request->afiliados as $afi) {
                    $afiliado = Afiliado::create([
                        'suscripcion_id' => $suscripcion->id,
                        'user_id'        => $userId,
                        'nombre'         => $afi['nombre'],
                        'parentesco'     => $afi['parentesco'] ?? 'Titular',
                        'estado'         => 'activo'
                    ]);

                    DB::table('servicios_funerarios')->insert([
                        'afiliado_id'  => $afiliado->id,
                        'cancion_id'   => $afi['cancion_id'] ?? 1,
                        'fecha_inicio' => now(),
                        'created_at'   => now(),
                        'updated_at'   => now()
                    ]);
                }
            }

            // 3. Guardar Servicios Extra
if ($request->has('servicios_adicionales')) {
    foreach ($request->servicios_adicionales as $servicioId) {
        // Buscamos el precio real de este servicio en la tabla servicios
        $servicio = \App\Models\Servicio::find($servicioId);
        $suscripcion->serviciosExtras()->attach($servicioId, [
            'precio_pagado' => $servicio ? $servicio->precio : 0, 
            'created_at'    => now(),
            'updated_at'    => now()
        ]);
    }
}

// 4. Guardar Recuerdos
if ($request->has('recuerdos_seleccionados')) {
    foreach ($request->recuerdos_seleccionados as $recuerdoId) {
        // Buscamos el precio real del recuerdo
        $recuerdo = \App\Models\Recuerdo::find($recuerdoId);
        $suscripcion->recuerdos()->attach($recuerdoId, [
            'costo_unitario' => $recuerdo ? $recuerdo->precio_adicional : 0,
            'created_at'     => now(),
            'updated_at'     => now()
        ]);
    }
}

DB::commit();
return redirect()->route('mi.plan')->with('activado', true);

} catch (\Exception $e) {
    DB::rollBack();
    return back()->withErrors(['error' => $e->getMessage()]);
}
    }
    
    // ... mantén el resto de tus métodos abajo (detallesPlan, eliminarAfiliado) ..

    public function detallesPlan()
    {
        $suscripcion = Suscripcion::with([
        'plan.servicios', 
        'afiliados.servicioFunerario', // <--- AGREGA ESTO
        'recuerdos', 
        'serviciosExtras.personalizacion'
    ])
    ->where('usuario_id', auth()->id())
    ->where('estado', 'activo')
    ->first();


       if ($suscripcion) {
    \Log::info(
        json_encode(
            $suscripcion->serviciosExtras->toArray(),
            JSON_PRETTY_PRINT
        )
    );
}


        // ... (Tu lógica de cálculo de precios se mantiene igual)
        return Inertia::render('Clientes/DetallesPlan', [
            'suscripcion' => $suscripcion,
            'todosLosServicios' => Servicio::all(),
            'todosLosRecuerdos' => Recuerdo::all(),
            'canciones' => Cancion::all()
        ]);
    }

    public function eliminarAfiliado($id)
    {
        try {
            $afiliado = Afiliado::findOrFail($id);
            if (trim(strtolower($afiliado->parentesco)) === 'titular') {
                return back()->with('error', 'No puedes eliminar al titular.');
            }
            $afiliado->delete();
            return back()->with('message', 'Afiliado removido.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al eliminar.');
        }
    }
}
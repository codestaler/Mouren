<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Suscripcion;
use App\Models\Mascota;
use App\Models\Servicio;
use App\Models\Recuerdo;
use App\Models\ServicioFunerario;
use App\Models\Especie;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SuscripcionMascotaController extends Controller
{
    /**
     * Ver el plan de la mascota activa y planes normales
     */
    public function miPlanMascota()
    {
        // Obtenemos TODAS las suscripciones activas del usuario
        $suscripciones = Suscripcion::with([
    'plan',
    'mascotas.especie',
    'mascotas.raza',
    'recuerdos',
    'serviciosExtras',
    'afiliados'
])
->where('usuario_id', auth()->id())
->where('estado', 'activo')
->get();

 $suscripcionExistente = Suscripcion::where('usuario_id', auth()->id())
        ->where('plan_id', 4)
        ->where('estado', 'activo')
        ->first();

    // Ya tiene Huella Eterna
    if ($suscripcionExistente) {
        return redirect()->route('mi.plan');
    }

    $planBase = \App\Models\Plan::find(4);


        // Buscamos los planes base para información general
        $planBase = \App\Models\Plan::where('nombre', 'like', '%Huella Eterna%')->first();

        // Cargamos catálogos necesarios
        $recuerdos = Recuerdo::all();
        $canciones = DB::table('canciones')->get(); 
        $especies = Especie::with('razas')->get(); 

        // Enviamos la colección completa para que el frontend maneje la lógica de visualización
        return Inertia::render('Clientes/MiPlanMascota', [
    'plan'       => $planBase,
    'recuerdos'  => $recuerdos,
    'canciones'  => $canciones,
    'especies'   => $especies
]);
    }

    /**
     * Guardar nueva suscripción de Huella Eterna
     */
    public function store(Request $request)
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['error' => 'No se pudo identificar el usuario.'], 401);
        }

        try {
            DB::beginTransaction();

            // 1. Crear suscripción base
            $suscripcion = Suscripcion::create([
                'usuario_id'    => $userId,
                'plan_id'       => $request->plan_id,
                'cuota_mensual' => $request->input('cuota_mensual') ?? 0,
                'estado'        => 'activo',
                'fecha_inicio'  => now(),
            ]);

            // 2. Asociar o crear la mascota al plan
            if ($request->has('mascotas')) {
                foreach ($request->mascotas as $mascotaData) {
                    $mascota = Mascota::create([
    'suscripcion_id'   => $suscripcion->id,
    'user_id'          => $userId,
    'nombre'           => $mascotaData['nombre'],
    'especie_id'       => $mascotaData['especie_id'],
    'raza_id'          => $mascotaData['raza_id'] ?? null,
    'fecha_nacimiento' => $mascotaData['fecha_nacimiento'] ?? null,
    'estado'           => 'activo',
]);

                    ServicioFunerario::create([
                        'mascota_id'   => $mascota->id,
                        'cancion_id'   => $mascotaData['cancion_id'] ?? 1,
                        'fecha_inicio' => now(),
                    ]);
                }
            }

            // 3. Guardar Servicios Extra
            if ($request->has('servicios_adicionales')) {
                foreach ($request->servicios_adicionales as $servicioId) {
                    $servicio = Servicio::find($servicioId);
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
                    $recuerdo = Recuerdo::find($recuerdoId);
                    $suscripcion->recuerdos()->attach($recuerdoId, [
                        'costo_unitario' => $recuerdo ? $recuerdo->precio_adicional : 0,
                        'created_at'     => now(),
                        'updated_at'     => now()
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('mi.plan.mascota')->with('message', '¡Suscripción exitosa!');

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
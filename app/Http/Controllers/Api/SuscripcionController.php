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
        $suscripcion = Suscripcion::with(['plan', 'afiliados', 'recuerdos', 'serviciosExtras'])
            ->where('usuario_id', auth()->id())
            ->where('estado', 'activo')
            ->first();

        // Lógica de canción para el front
        if ($suscripcion && $suscripcion->afiliados->count() > 0) {
            $primerAfiliadoId = $suscripcion->afiliados->first()->id;
            $servicioFunerario = DB::table('servicios_funerarios')
                ->where('afiliado_id', $primerAfiliadoId)
                ->orderBy('id', 'desc')
                ->first();

            if ($servicioFunerario && $servicioFunerario->cancion_id) {
                $cancion = DB::table('canciones')->where('id', $servicioFunerario->cancion_id)->first();
                if ($cancion) {
                    $suscripcion->cancion_tributo = $cancion;
                }
            }
        }

        return Inertia::render('Clientes/MiPlan', ['suscripcion' => $suscripcion]);
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
            return redirect()->route('mi.plan')->with('message', 'Suscripción exitosa');

        } catch (\Exception $e) {
    DB::rollBack();
    // Esto enviará el error real a tu modal en el frontend
    return response()->json(['error' => $e->getMessage()], 500);
}
    }
    
    // ... mantén el resto de tus métodos abajo (detallesPlan, eliminarAfiliado) ..

    public function detallesPlan()
    {
        $suscripcion = Suscripcion::with([
        'plan.servicios', 
        'afiliados.servicioFunerario', // <--- AGREGA ESTO
        'recuerdos', 
        'serviciosExtras'
    ])
    ->where('usuario_id', auth()->id())
    ->where('estado', 'activo')
    ->first();

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
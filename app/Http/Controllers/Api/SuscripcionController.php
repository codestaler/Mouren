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

class SuscripcionController extends Controller
{
    /**
     * NUEVO: Muestra la vista "Mi Plan" con todos los datos vinculados.
     */
    public function miPlan()
    {
        // Buscamos la suscripción activa del usuario logueado
        $suscripcion = Suscripcion::with([
            'plan', 
            'afiliados', 
            'recuerdos',
            'afiliados.servicioFunerario.cancion' // Traemos la canción desde el servicio del afiliado
        ])
        ->where('usuario_id', auth()->id())
        ->where('estado', 'activo')
        ->first();

        return Inertia::render('Clientes/MiPlan', [
            'suscripcion' => $suscripcion
        ]);
    }

    /**
     * Muestra el formulario de inscripción (Mantengo lo que ya tenías).
     */
    public function create(Request $request, Plan $plan)
    {
        $plan->load('servicios'); 

        return Inertia::render('Clientes/Planes/Inscribir', [
            'plan' => $plan,
            'servicios' => Servicio::all(),
            'recuerdos' => Recuerdo::all(),
        ]);
    }

    /**
     * Guarda la suscripción y sus relaciones (Mantengo lo que ya tenías).
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $userId = auth()->id() ?? $request->usuario_id;

            // 1. Crear la Suscripción
            $suscripcion = new Suscripcion();
            $suscripcion->usuario_id = $userId;
            $suscripcion->plan_id = $request->plan_id;
            $suscripcion->cuota_mensual = $request->cuota_mensual;
            $suscripcion->estado = 'activo';
            $suscripcion->fecha_inicio = now();
            $suscripcion->save();

            // 2. Guardar Recuerdos en la tabla pivote
            if (!empty($request->recuerdos_seleccionados)) {
                foreach ($request->recuerdos_seleccionados as $recuerdoId) {
                    $recuerdo = Recuerdo::find($recuerdoId);
                    
                    DB::table('suscripcion_recuerdos')->insert([
                        'suscripcion_id' => $suscripcion->id,
                        'recuerdo_id'    => $recuerdoId,
                        'costo_unitario' => $recuerdo->precio ?? 0,
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ]);
                }
            }

            // 3. Guardar Afiliados
            if (!empty($request->afiliados)) {
                foreach ($request->afiliados as $afi) {
                    $nuevoAfiliado = Afiliado::create([
                        'suscripcion_id' => $suscripcion->id,
                        'user_id'        => $userId,
                        'nombre'         => $afi['nombre'],
                        'parentesco'     => $afi['parentesco'],
                        'estado'         => 'activo',
                    ]);

                    // 4. Guardar Servicio Funerario (vinculando la canción)
                    DB::table('servicios_funerarios')->insert([
                        'afiliado_id'   => $nuevoAfiliado->id,
                        'cancion_id'    => $request->cancion_id,
                        'observaciones' => $request->observaciones ?? 'Sin observaciones',
                        'fecha_inicio'  => now(),
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('mi.plan')->with('message', 'Suscripción creada con éxito');

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
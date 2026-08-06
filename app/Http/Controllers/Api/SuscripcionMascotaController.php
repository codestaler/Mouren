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
                    \Log::info('MASCOTA payload:', $mascotaData);
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

    /**
     * 🆕 Ver el DETALLE de la suscripción de mascota activa (para personalizarla).
     *
     * CAMBIO: el recuerdo ahora se carga por mascota, vía su servicio_funerario
     * (igual que la canción), en vez de por la suscripción completa.
     * CAMBIO: el catálogo de servicios ahora se filtra con la columna "aplica_a"
     * para no mezclar servicios pensados para humanos.
     *
     * AJUSTA el nombre de la ruta/vista Inertia si en tu web.php usas otro.
     */
    public function detalles()
    {
        $suscripcion = Suscripcion::with([
                'plan.servicios',
                'mascotas.especie',
                'mascotas.raza',
                // 🆕 cargamos también el recuerdo embebido en el servicio_funerario de cada mascota
                'mascotas.servicioFunerario.recuerdo', // ajusta "servicioFunerario" y "recuerdo" si en tus modelos se llaman distinto
                'serviciosExtras',
            ])
            ->where('usuario_id', auth()->id())
            ->where('plan_id', 4) // mismo criterio que usas en miPlanMascota para identificar "Huella Eterna"
            ->where('estado', 'activo')
            ->first();

        // 🆕 Solo servicios marcados para 'mascota' o 'ambos' (columna nueva aplica_a)
        $todosLosServicios = Servicio::whereIn('aplica_a', ['mascota', 'ambos'])->get();

        $todosLosRecuerdos = Recuerdo::all();
        $canciones = DB::table('canciones')->get();
        $especies = Especie::with('razas')->get();

        return Inertia::render('Clientes/DetallesPlanMascota', [
            'suscripcion'        => $suscripcion,
            'canciones'          => $canciones,
            'todosLosServicios'  => $todosLosServicios,
            'todosLosRecuerdos'  => $todosLosRecuerdos,
            'especies'           => $especies,
        ]);
    }

    /**
     * 🆕 Guardar los cambios de personalización de la suscripción de mascota
     * (agregar/editar/eliminar mascotas —con su canción y recuerdo—, servicios extra).
     *
     * AJUSTA la ruta en web.php y el nombre de la ruta de redirección si aplica.
     */
    public function actualizar(Request $request)
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['error' => 'No se pudo identificar el usuario.'], 401);
        }

        try {
            DB::beginTransaction();

            $suscripcion = Suscripcion::where('id', $request->suscripcion_id)
                ->where('usuario_id', $userId)
                ->firstOrFail();

            $suscripcion->update([
                'cuota_mensual' => $request->input('cuota_mensual') ?? $suscripcion->cuota_mensual,
            ]);

            // --- MASCOTAS: actualiza las existentes, crea las nuevas ---
            if ($request->has('mascotas')) {
                $idsRecibidos = [];

                foreach ($request->mascotas as $mascotaData) {
                    $esNueva = empty($mascotaData['id']) || !is_numeric($mascotaData['id']);

                    if ($esNueva) {
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
                            // 🆕 recuerdo propio de esta mascota
                            'recuerdo_id'  => $mascotaData['recuerdo_id'] ?? null,
                            'fecha_inicio' => now(),
                        ]);
                    } else {
                        $mascota = Mascota::where('id', $mascotaData['id'])
                            ->where('suscripcion_id', $suscripcion->id)
                            ->first();

                        if ($mascota) {
                            $mascota->update([
                                'nombre'           => $mascotaData['nombre'],
                                'especie_id'       => $mascotaData['especie_id'],
                                'raza_id'          => $mascotaData['raza_id'] ?? null,
                                'fecha_nacimiento' => $mascotaData['fecha_nacimiento'] ?? null,
                            ]);

                            // ajusta el nombre de la relación si en tu modelo se llama distinto
                            if ($mascota->servicioFunerario) {
                                $mascota->servicioFunerario->update([
                                    'cancion_id'  => $mascotaData['cancion_id'] ?? $mascota->servicioFunerario->cancion_id,
                                    // 🆕 recuerdo propio de esta mascota
                                    'recuerdo_id' => $mascotaData['recuerdo_id'] ?? $mascota->servicioFunerario->recuerdo_id,
                                ]);
                            } else {
                                // por si una mascota antigua no tenía servicio_funerario todavía
                                ServicioFunerario::create([
                                    'mascota_id'   => $mascota->id,
                                    'cancion_id'   => $mascotaData['cancion_id'] ?? 1,
                                    'recuerdo_id'  => $mascotaData['recuerdo_id'] ?? null,
                                    'fecha_inicio' => now(),
                                ]);
                            }
                        }
                    }

                    if ($mascota) {
                        $idsRecibidos[] = $mascota->id;
                    }
                }

                // Elimina las mascotas que ya no vinieron en el payload
                Mascota::where('suscripcion_id', $suscripcion->id)
                    ->whereNotIn('id', $idsRecibidos)
                    ->delete();
            }

            // --- SERVICIOS EXTRA: reemplaza el set completo ---
            if ($request->has('servicios_adicionales')) {
                $sincronizar = [];
                foreach ($request->servicios_adicionales as $item) {
                    $servicioId = is_array($item) ? $item['id'] : $item;
                    $servicio = Servicio::find($servicioId);
                    $sincronizar[$servicioId] = [
                        'precio_pagado' => $servicio ? $servicio->precio : 0,
                        'updated_at'    => now(),
                    ];
                }
                $suscripcion->serviciosExtras()->sync($sincronizar);
            }

            DB::commit();
            return redirect()->back()->with('message', '¡Personalización guardada!');

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

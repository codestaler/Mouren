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
use App\Services\NotificacionService;
use Illuminate\Support\Facades\Mail;
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

            // 🆕 Notificamos a los administradores de la nueva inscripción de mascota
            $plan = \App\Models\Plan::find($request->plan_id);
            $nombreMascota = $request->mascotas[0]['nombre'] ?? 'Una mascota';

            NotificacionService::avisarAdmins(
                'Nueva inscripción de mascota',
                "{$nombreMascota} fue inscrita al plan " . ($plan->nombre ?? 'Huella Eterna') . ".",
                'suscripcion',
                '/admin/ventas'
            );

            // 🆕 Correo de bienvenida a la suscripción de mascota, con firma institucional
            $usuarioSuscrito = \App\Models\User::find($userId);
            if ($usuarioSuscrito && $usuarioSuscrito->email) {
                $logoUrl = asset('images/logo.png');
                $urlPanel = route('mi.plan.mascota');
                $cuotaFormateada = '$' . number_format($suscripcion->cuota_mensual, 0, ',', '.');
                $nombrePlanCorreo = $plan->nombre ?? 'Huella Eterna';

                $cuerpoCorreo = "
                <div style='font-family: Georgia, \"Times New Roman\", serif; background:#F4EDE6; padding:32px 16px; margin:0;'>
                  <div style='max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08);'>
                    <div style='background:#5D4E3F;padding:28px 24px;text-align:center;'>
                      <img src='{$logoUrl}' alt='Mouren' style='height:48px;margin-bottom:12px;filter:brightness(0) invert(1);' />
                      <p style='color:#F4EDE6;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0;opacity:0.8;'>🐾 Huella Eterna — Previsión para tus mascotas</p>
                    </div>
                    <div style='padding:32px 28px;color:#5D4E3F;'>
                      <h1 style='font-size:20px;margin:0 0 8px;'>¡Bienvenido(a) a Mouren!</h1>
                      <p style='font-size:14px;line-height:1.6;color:#6A5A48;margin:0 0 20px;'>
                        La inscripción de <strong>{$nombreMascota}</strong> se realizó con éxito. A partir de hoy, tu compañero de cuatro patas también cuenta con nuestro acompañamiento.
                      </p>
                      <div style='background:#F4EDE6;border-left:4px solid #A68966;border-radius:12px;padding:18px 20px;margin-bottom:24px;'>
                        <p style='margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#A68966;font-weight:bold;'>Resumen de tu plan</p>
                        <p style='margin:0;font-size:15px;font-weight:bold;'>{$nombrePlanCorreo}</p>
                        <p style='margin:4px 0 0;font-size:13px;color:#6A5A48;'>Cuota mensual: {$cuotaFormateada}</p>
                      </div>
                      <p style='font-size:14px;line-height:1.6;color:#6A5A48;margin:0 0 24px;'>
                        Puedes ingresar a tu panel en cualquier momento para agregar más mascotas, elegir su música de tributo y su objeto de memoria.
                      </p>
                      <div style='text-align:center;margin-bottom:8px;'>
                        <a href='{$urlPanel}' style='background:#5D4E3F;color:#F4EDE6;text-decoration:none;padding:12px 28px;border-radius:24px;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;display:inline-block;'>Ir a mi panel</a>
                      </div>
                    </div>
                    <div style='background:#F4EDE6;padding:24px 28px;border-top:1px solid #E3D9BC;'>
                      <p style='margin:0 0 4px;font-size:13px;font-weight:bold;color:#5D4E3F;'>Equipo Mouren</p>
                      <p style='margin:0 0 2px;font-size:11px;color:#8A7A65;'>Cl. 63 #58B-03, Terranova, Itagüí</p>
                      <p style='margin:0 0 10px;font-size:11px;color:#8A7A65;'>314-6517-554 · mouren.funeraria@gmail.com</p>
                      <p style='margin:0;font-size:10px;color:#A68966;'>
                        <a href='https://www.instagram.com/funeraria_mouren/' style='color:#A68966;text-decoration:none;'>Instagram</a> ·
                        <a href='https://www.facebook.com/profile.php?id=61577696892769' style='color:#A68966;text-decoration:none;'>Facebook</a> ·
                        <a href='https://m.youtube.com/@Mouri-k8t2m' style='color:#A68966;text-decoration:none;'>Youtube</a>
                      </p>
                    </div>
                  </div>
                </div>
                ";

                Mail::html($cuerpoCorreo, function ($message) use ($usuarioSuscrito, $nombrePlanCorreo) {
                    $message->to($usuarioSuscrito->email)
                            ->subject("¡Bienvenido a tu plan {$nombrePlanCorreo}! - Mouren");
                });
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

        // 🆕 ¿Este usuario TAMBIÉN tiene un plan humano (distinto de Huella Eterna) activo?
        // Mismo patrón que ya usas en PlanController::index() para tieneHumano/tieneMascota.
        $tienePlanHumano = Suscripcion::where('usuario_id', auth()->id())
            ->where('estado', 'activo')
            ->where('plan_id', '!=', 4)
            ->exists();

        return Inertia::render('Clientes/DetallesPlanMascota', [
            'suscripcion'        => $suscripcion,
            'canciones'          => $canciones,
            'todosLosServicios'  => $todosLosServicios,
            'todosLosRecuerdos'  => $todosLosRecuerdos,
            'especies'           => $especies,
            'tienePlanHumano'    => $tienePlanHumano, // 🆕
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
                    // 🆕 Antes esto solo miraba si el id venía vacío o no era
                    // numérico — pero una mascota NUEVA que el navegador
                    // todavía no mandó a guardar trae un id temporal enorme
                    // (Date.now(), por ejemplo 1758586523000), que SÍ es
                    // numérico. Por eso se trataba como "ya existente", se
                    // buscaba en la base de datos, no se encontraba, y
                    // simplemente no se hacía nada: la mascota nunca se
                    // creaba, aunque el mensaje de "guardado" apareciera
                    // igual. Ahora, igual que ya se hace con los afiliados,
                    // también se considera nueva si el id es un número
                    // gigante como ese.
                    $esNueva = empty($mascotaData['id']) || !is_numeric($mascotaData['id']) || $mascotaData['id'] > 1000000000;

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
                // 🆕 Solo borramos si de verdad llegaron mascotas en el payload
                // (evita borrar todo por accidente si $idsRecibidos llegara vacío).
                if (!empty($idsRecibidos)) {
                    $idsABorrar = Mascota::where('suscripcion_id', $suscripcion->id)
                        ->whereNotIn('id', $idsRecibidos)
                        ->pluck('id');

                    if ($idsABorrar->isNotEmpty()) {
                        // 🆕 Antes de borrar la mascota, limpiamos todo lo que dependa
                        // de ella para no violar ninguna restricción de llave foránea:
                        // su servicio_funerario, y por si acaso cualquier ceremonia o
                        // trazabilidad que dependiera de ese servicio.
                        $serviciosFunerariosABorrar = ServicioFunerario::whereIn('mascota_id', $idsABorrar)->get();

                        foreach ($serviciosFunerariosABorrar as $servicioFunerario) {
                            $servicioFunerario->ceremonias()->delete();
                            $servicioFunerario->trazabilidades()->delete();
                        }

                        ServicioFunerario::whereIn('mascota_id', $idsABorrar)->delete();
                        Mascota::whereIn('id', $idsABorrar)->delete();
                    }
                }
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

    /**
 * 🆕 Descarga el certificado de afiliación del plan Huella Eterna (mascotas).
 * Reutiliza la misma vista 'reportes.certificado-mascota' que ya creamos
 * para el flujo público de /pagos-consultas.
 */
public function certificadoMascota()
{
    $suscripcion = Suscripcion::with(['plan', 'mascotas.especie', 'mascotas.raza'])
        ->where('usuario_id', auth()->id())
        ->where('estado', 'activo')
        ->where('plan_id', 4)
        ->first();

    if (!$suscripcion) {
        return back()->with('error', 'No tienes una suscripción activa del plan Huella Eterna para generar un certificado.');
    }

    $usuario = auth()->user();

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reportes.certificado-mascota', [
        'usuario'     => $usuario,
        'suscripcion' => $suscripcion,
        'plan'        => $suscripcion->plan,
        'mascotas'    => $suscripcion->mascotas,
        'fecha'       => \Carbon\Carbon::now()->format('d/m/Y'),
    ]);

    return $pdf->download('certificado-huella-eterna-mouren-' . $usuario->cedula . '.pdf');
}
}

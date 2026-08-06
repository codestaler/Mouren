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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;

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
    'afiliados.servicioFunerario.cancion',
    'afiliados.servicioFunerario.recuerdo',   // <-- recuerdo propio del afiliado
    'mascotas.especie',
    'mascotas.raza',
    'mascotas.servicioFunerario.cancion',
    'mascotas.servicioFunerario.recuerdo'    // <-- recuerdo propio de la mascota
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

    if ($servicio && $servicio->recuerdo_id) {

        $recuerdo = DB::table('recuerdos')
            ->where('id', $servicio->recuerdo_id)
            ->first();

        $planHumano->recuerdo_tributo = $recuerdo;
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

    if ($servicio && $servicio->recuerdo_id) {

        $recuerdo = DB::table('recuerdos')
            ->where('id', $servicio->recuerdo_id)
            ->first();

        $planMascota->recuerdo_tributo = $recuerdo;
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

            // 2. Procesar afiliados y servicios funerarios (canción + recuerdo propio de cada uno)
            if ($request->has('afiliados')) {
                foreach ($request->afiliados as $afi) {
                    \Log::info('AFILIADO payload:', $afi);
                    $afiliado = Afiliado::create([
    'suscripcion_id'     => $suscripcion->id,
    'user_id'            => $userId,
    'nombre'             => $afi['nombre'],
    'parentesco'         => $afi['parentesco'] ?? 'Titular',
    'estado'             => 'activo',
    'genero_id'          => $afi['genero_id'] ?? null,
    'tipo_documento_id'  => $afi['tipo_documento_id'] ?? null,
    'cedula'             => $afi['cedula'] ?? null,
    'fecha_nacimiento'   => $afi['fecha_nacimiento'] ?? null,
]);

                    // Calculamos el precio real del recuerdo elegido para ESTE afiliado
                    $recuerdoId = $afi['recuerdo_id'] ?? null;
                    $costoRecuerdo = 0;
                    if ($recuerdoId) {
                        $recuerdoModel = Recuerdo::find($recuerdoId);
                        $costoRecuerdo = $recuerdoModel ? $recuerdoModel->precio_adicional : 0;
                    }

                    DB::table('servicios_funerarios')->insert([
                        'afiliado_id'    => $afiliado->id,
                        'cancion_id'     => $afi['cancion_id'] ?? 1,
                        'recuerdo_id'    => $recuerdoId,
                        'costo_recuerdo' => $costoRecuerdo,
                        'fecha_inicio'   => now(),
                        'created_at'     => now(),
                        'updated_at'     => now()
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

// Nota: los recuerdos ya NO se guardan a nivel de suscripción.
// Cada recuerdo queda registrado en servicios_funerarios (arriba), uno por afiliado/mascota.

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
        'afiliados.servicioFunerario.cancion',
        'afiliados.servicioFunerario.recuerdo', // <--- recuerdo propio de cada afiliado
        'recuerdos', 
        'serviciosExtras'
    ])
    ->where('usuario_id', auth()->id())
    ->where('estado', 'activo')
    ->first();


       if ($suscripcion) {
        // Traemos SOLO las personalizaciones de ESTA suscripción
        $personalizaciones = \App\Models\Personalizacion::where('suscripcion_id', $suscripcion->id)
            ->get()
            ->keyBy('servicio_id'); // para buscarlas rápido por servicio_id

        // Pegamos la personalización correcta a cada servicio extra
        $suscripcion->serviciosExtras->each(function ($servicio) use ($personalizaciones) {
            $personalizacion = $personalizaciones->get($servicio->id);
            $servicio->personalizacion = $personalizacion
                ? ['configuracion' => $personalizacion->configuracion]
                : null;
        });
    }


        // ... (Tu lógica de cálculo de precios se mantiene igual)
        return Inertia::render('Clientes/DetallesPlan', [
        'suscripcion' => $suscripcion,
        'todosLosServicios' => Servicio::all(),
        'todosLosRecuerdos' => Recuerdo::all(),
        'canciones' => Cancion::all(),
        'generos' => \App\Models\Genero::all(),
        'tiposDocumento' => \App\Models\TipoDocumento::all(),
    ]);
    }

    public function eliminarAfiliado($id)
    {
        try {
            $afiliado = Afiliado::findOrFail($id);
            if (trim(strtolower($afiliado->parentesco)) === 'titular') {
                return back()->with('error', 'No puedes eliminar al titular.');
            }
            if (strtolower($afiliado->estado) === 'fallecido') {
                return back()->with('error', 'No se puede eliminar un afiliado marcado como fallecido.');
            }
            $afiliado->delete();
            return back()->with('message', 'Afiliado removido.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al eliminar.');
        }
    }

    public function certificadoAfiliacion()
    {
        $suscripcion = Suscripcion::with(['plan', 'afiliados.genero', 'afiliados.tipoDocumento'])
            ->where('usuario_id', auth()->id())
            ->where('estado', 'activo')
            ->first();

        if (!$suscripcion) {
            return back()->with('error', 'No tienes una suscripción activa para generar un certificado.');
        }

        $usuario = auth()->user();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reportes.certificado-afiliacion', [
            'usuario'     => $usuario,
            'suscripcion' => $suscripcion,
            'plan'        => $suscripcion->plan,
            'afiliados'   => $suscripcion->afiliados,
            'fecha'       => \Carbon\Carbon::now()->format('d/m/Y'),
        ]);

        return $pdf->download('certificado-afiliacion-mouren-' . $usuario->cedula . '.pdf');
    }
    public function cambiarTitular(Request $request)
{
    $request->validate([
        'suscripcion_id' => 'required|exists:suscripciones,id',
        'nuevo_titular_afiliado_id' => 'required|exists:afiliados,id',
        'motivo' => 'required|in:fallecimiento,acuerdo',
        'email_nuevo_titular' => 'nullable|email',
        'fecha_fallecimiento' => 'required_if:motivo,fallecimiento|nullable|date',
    ]);

    $suscripcion = Suscripcion::findOrFail($request->suscripcion_id);

    $afiliadoSucesor = Afiliado::where('id', $request->nuevo_titular_afiliado_id)
        ->where('suscripcion_id', $suscripcion->id)
        ->firstOrFail();

    if (strtolower(trim($afiliadoSucesor->parentesco)) === 'titular') {
        return back()->with('error', 'Esta persona ya es el titular actual.');
    }

    if (strtolower($afiliadoSucesor->estado) === 'fallecido') {
        return back()->with('error', 'No puedes asignar como titular a un beneficiario marcado como fallecido.');
    }

    try {
        DB::beginTransaction();

        $antiguoTitularUserId = $suscripcion->usuario_id;

        $afiliadoTitularAnterior = Afiliado::where('suscripcion_id', $suscripcion->id)
            ->where('user_id', $antiguoTitularUserId)
            ->whereRaw('LOWER(TRIM(parentesco)) = ?', ['titular'])
            ->first();

        $nuevoUsuario = $afiliadoSucesor->cedula
            ? \App\Models\User::where('cedula', $afiliadoSucesor->cedula)->first()
            : null;

        $cuentaNueva = false;

        if (!$nuevoUsuario) {
            if (!$request->email_nuevo_titular) {
                DB::rollBack();
                return back()->with('error', 'Este beneficiario no tiene una cuenta propia todavía. Debes indicar un correo electrónico para crearle una.');
            }

            $nuevoUsuario = \App\Models\User::create([
                'nombre'            => $afiliadoSucesor->nombre,
                'cedula'            => $afiliadoSucesor->cedula ?? ('PENDIENTE-' . $afiliadoSucesor->id),
                'email'             => $request->email_nuevo_titular,
                'password'          => Hash::make(Str::random(16)),
                'tipo_documento_id' => $afiliadoSucesor->tipo_documento_id ?? 1,
                'genero_id'         => $afiliadoSucesor->genero_id ?? 1,
                'estado_id'         => 1,
                'tipo_usuario_id'   => 2,
                'fecha_nacimiento'  => $afiliadoSucesor->fecha_nacimiento ?? now()->subYears(18),
                'telefono'          => '0000000000',
            ]);
            $cuentaNueva = true;
        }

        $suscripcion->update(['usuario_id' => $nuevoUsuario->id]);
        Afiliado::where('suscripcion_id', $suscripcion->id)->update(['user_id' => $nuevoUsuario->id]);
        // 🆕 Transferimos TAMBIÉN cualquier otra suscripción activa que tuviera el titular anterior
// (por ejemplo, el plan de mascota "Huella Eterna"), para que el cambio quede completo
// sin tener que repetir el proceso manualmente para cada plan.
$otrasSuscripciones = Suscripcion::where('usuario_id', $antiguoTitularUserId)
    ->where('id', '!=', $suscripcion->id)
    ->get();

foreach ($otrasSuscripciones as $otra) {
    $otra->update(['usuario_id' => $nuevoUsuario->id]);
    Afiliado::where('suscripcion_id', $otra->id)->update(['user_id' => $nuevoUsuario->id]);
    \App\Models\Mascota::where('suscripcion_id', $otra->id)->update(['user_id' => $nuevoUsuario->id]);
}
        $afiliadoSucesor->update(['parentesco' => 'Titular']);

        if ($request->motivo === 'fallecimiento' && $afiliadoTitularAnterior) {
            $afiliadoTitularAnterior->update([
                'estado' => 'Fallecido',
                'fecha_fallecimiento' => $request->fecha_fallecimiento,
            ]);

            \App\Models\User::where('id', $antiguoTitularUserId)->update(['estado_id' => 2]);

            // 🆕 Generamos la trazabilidad, igual que hace marcarFallecido()
            $servicioFunerario = \App\Models\ServicioFunerario::where('afiliado_id', $afiliadoTitularAnterior->id)->latest()->first();

            if ($servicioFunerario) {
                $etapaInicial = \App\Models\Procesos\EtapaServicio::where('nombre', 'Fallecimiento Registrado')->first();

                if ($etapaInicial) {
                    \App\Models\Procesos\TrazabilidadServicio::create([
                        'servicio_funerario_id' => $servicioFunerario->id,
                        'etapa_id'              => $etapaInicial->id,
                        'descripcion'           => 'Fallecimiento registrado por cambio de titular. Nuevo titular: ' . $nuevoUsuario->nombre,
                        'fecha'                 => $request->fecha_fallecimiento,
                        'usuario_responsable'   => auth()->id(),
                    ]);
                }
            }
        }

        if ($cuentaNueva) {
    // 🆕 Generamos un token de recuperación REAL de Laravel, para que el botón funcione de verdad
    $token = Password::createToken($nuevoUsuario);
    $urlRecuperacion = route('password.reset', ['token' => $token]) . '?email=' . urlencode($nuevoUsuario->email);

    Mail::html(
        "<div style='font-family:sans-serif;color:#5D4E3F;max-width:480px;margin:0 auto;'>
            <p>Hola {$nuevoUsuario->nombre},</p>
            <p>A partir de ahora eres el <strong>titular</strong> del plan de previsión exequial familiar en Mouren. Hemos creado tu cuenta.</p>
            <p>Para ingresar por primera vez, crea tu contraseña haciendo clic en el siguiente botón:</p>
            <p style='text-align:center;margin:30px 0;'>
                <a href='{$urlRecuperacion}' style='background:#5D4E3F;color:#ffffff;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:bold;display:inline-block;'>Crear mi contraseña</a>
            </p>
            <p style='font-size:12px;opacity:0.7;'>Si el botón no funciona, copia y pega este enlace en tu navegador:<br>{$urlRecuperacion}</p>
            <p>— El equipo de Mouren</p>
        </div>",
        function ($message) use ($nuevoUsuario) {
            $message->to($nuevoUsuario->email)->subject('Ahora eres el titular de tu plan Mouren');
        }
    );
} else {
    Mail::raw(
        "Hola {$nuevoUsuario->nombre},\n\nTu cuenta existente en Mouren ha sido vinculada como titular del plan de previsión exequial familiar.\n\n— El equipo de Mouren",
        function ($message) use ($nuevoUsuario) {
            $message->to($nuevoUsuario->email)->subject('Ahora eres el titular de tu plan Mouren');
        }
    );
}

        DB::commit();

        return back()->with('message', "Cambio de titular realizado correctamente. {$nuevoUsuario->nombre} ahora es el titular del plan.");

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Error en cambio de titular: ' . $e->getMessage());
        return back()->with('error', 'Ocurrió un error al procesar el cambio de titular: ' . $e->getMessage());
    }
}

}
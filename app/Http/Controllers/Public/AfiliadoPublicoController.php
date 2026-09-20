<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Afiliado;
use App\Models\Personalizacion;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AfiliadoPublicoController extends Controller
{
    /**
     * Clave de sesión usada para recordar que ESTE navegador ya confirmó
     * la cédula de ESTE afiliado — así no le pedimos la cédula en cada
     * clic mientras siga en la misma sesión del navegador.
     */
    private function claveSesion(int $afiliadoId): string
    {
        return 'afiliado_verificado_' . $afiliadoId;
    }

    /**
     * GET /afiliado/{token}
     * Si el token no existe: página de "enlace no válido".
     * Si existe pero no se ha verificado la cédula todavía: pide la cédula.
     * Si ya se verificó en esta sesión: muestra la presentación temática,
     * incluyendo su personalización guardada si ya eligió una antes.
     */
    public function mostrar(string $token)
    {
        $afiliado = Afiliado::with('suscripcion.plan')
            ->where('token', $token)
            ->first();

        if (!$afiliado) {
            return Inertia::render('Public/AfiliadoNoEncontrado');
        }

        $verificado = session()->get($this->claveSesion($afiliado->id), false);

        if (!$verificado) {
            return Inertia::render('Public/VerificarAfiliado', [
                'token'  => $token,
                'nombre' => $afiliado->nombre,
            ]);
        }

        // 🆕 ¿Este afiliado ya había guardado una personalización antes?
        // (para dejarla pre-seleccionada en vez de empezar de cero)
        $personalizacionActual = Personalizacion::where('afiliado_id', $afiliado->id)->first();

        return Inertia::render('Public/PresentacionAfiliado', [
            'token'      => $token,
            'nombre'     => $afiliado->nombre,
            'parentesco' => $afiliado->parentesco,
            'plan'       => $afiliado->suscripcion && $afiliado->suscripcion->plan ? [
                'id'     => $afiliado->suscripcion->plan->id,
                'nombre' => $afiliado->suscripcion->plan->nombre,
            ] : null,
            'personalizacionActual' => $personalizacionActual?->configuracion,
        ]);
    }

    /**
     * POST /afiliado/{token}/verificar
     * Compara la cédula enviada contra la registrada para ese afiliado.
     * Si coincide, marca la sesión como verificada y vuelve a /afiliado/{token},
     * que esta vez sí mostrará la presentación completa.
     */
    public function verificar(Request $request, string $token)
    {
        $request->validate([
            'cedula' => 'required|string|max:30',
        ]);

        $afiliado = Afiliado::where('token', $token)->first();

        if (!$afiliado) {
            return back()->withErrors(['cedula' => 'Este enlace ya no es válido.']);
        }

        $cedulaEnviada = trim($request->cedula);
        $cedulaReal = trim((string) $afiliado->cedula);

        if ($cedulaReal === '' || $cedulaEnviada !== $cedulaReal) {
            return back()->withErrors(['cedula' => 'La cédula no coincide con nuestros registros.']);
        }

        session()->put($this->claveSesion($afiliado->id), true);

        return redirect("/afiliado/{$token}");
    }

    /**
     * 🆕 POST /afiliado/{token}/personalizar
     * Guarda (o actualiza) la personalización propia de ESTE afiliado —
     * separada de la del titular, gracias a la columna afiliado_id.
     * Solo funciona si esta sesión ya confirmó la cédula de ese afiliado.
     */
    public function guardarPersonalizacion(Request $request, string $token)
    {
        $request->validate([
            'colorId'     => 'required',
            'colorNombre' => 'required|string',
            'florId'      => 'required',
            'florNombre'  => 'required|string',
        ]);

        $afiliado = Afiliado::where('token', $token)->first();

        if (!$afiliado) {
            abort(404);
        }

        // 🔒 Solo si esta sesión ya confirmó la cédula de este afiliado
        if (!session()->get($this->claveSesion($afiliado->id), false)) {
            abort(403, 'Debes confirmar tu identidad primero.');
        }

        // Por ahora usamos el primer servicio marcado como personalizable
        // (el "Ataúd Personalizado"). Si en el futuro hay más de uno
        // personalizable, esto habría que ampliarlo para elegir cuál.
        $servicio = Servicio::where('personalizable', 1)->first();

        if (!$servicio) {
            return back()->withErrors(['error' => 'Todavía no hay un servicio personalizable configurado. Avísale al titular.']);
        }

        Personalizacion::updateOrCreate(
            [
                'suscripcion_id' => $afiliado->suscripcion_id,
                'servicio_id'    => $servicio->id,
                'afiliado_id'    => $afiliado->id,
            ],
            [
                'servicio_funerario_id' => null,
                'configuracion' => [
                    'colorId'     => $request->colorId,
                    'colorNombre' => $request->colorNombre,
                    'florId'      => $request->florId,
                    'florNombre'  => $request->florNombre,
                ],
            ]
        );

        return back()->with('success', 'Tu personalización quedó guardada.');
    }
}

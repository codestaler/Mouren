<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Afiliado;
use App\Models\Mascota;
use App\Models\Pagos\Factura;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Preference\PreferenceClient;

class ConsultaPublicaController extends Controller
{
    /**
     * CONSULTA DE AFILIACIÓN
     * 🆕 Ahora devuelve TODAS las suscripciones del titular (antes solo traía
     * la más reciente con ->latest('id')->first(), por eso si tenías plan de
     * personas Y de mascotas, solo veías una de las dos).
     */
    public function consultarAfiliacion(Request $request)
    {
        $request->validate(['cedula' => 'required|string']);
        $cedula = trim($request->cedula);

        // 1. ¿Es un Titular?
        $usuario = User::where('cedula', $cedula)->first();

        if ($usuario) {
            $suscripciones = \App\Models\Suscripcion::where('usuario_id', $usuario->id)
                ->with('plan')
                ->orderBy('id')
                ->get();

            if ($suscripciones->isEmpty()) {
                return response()->json(['encontrado' => false]);
            }

            $afiliaciones = $suscripciones->map(function ($suscripcion) use ($usuario) {
                $esMascota = Mascota::where('suscripcion_id', $suscripcion->id)->exists();

                return [
                    'tipo'           => 'Titular',
                    'id'             => $usuario->id,
                    'suscripcion_id' => $suscripcion->id,
                    'nombre'         => $usuario->nombre ?? $usuario->name,
                    'plan'           => optional($suscripcion->plan)->nombre ?? 'Sin plan asignado',
                    'estado'         => $this->formatearEstado($suscripcion->estado),
                    'es_mascota'     => $esMascota,
                ];
            });

            return response()->json(['encontrado' => true, 'afiliaciones' => $afiliaciones]);
        }

        // 2. ¿Es un Beneficiario/Afiliado?
        $afiliado = Afiliado::where('cedula', $cedula)->first();

        if ($afiliado) {
            $suscripcion = $afiliado->suscripcion;
            $esMascota = $suscripcion ? Mascota::where('suscripcion_id', $suscripcion->id)->exists() : false;

            return response()->json([
                'encontrado' => true,
                'afiliaciones' => [[
                    'tipo'           => 'Beneficiario',
                    'id'             => $afiliado->id,
                    'suscripcion_id' => $suscripcion?->id,
                    'nombre'         => $afiliado->nombre,
                    'plan'           => optional($suscripcion?->plan)->nombre ?? 'Sin plan asignado',
                    'estado'         => $this->formatearEstado($suscripcion?->estado ?? $afiliado->estado),
                    'es_mascota'     => $esMascota,
                ]],
            ]);
        }

        return response()->json(['encontrado' => false]);
    }

    private function formatearEstado($estado)
    {
        if (is_null($estado)) return 'No disponible';
        $texto = strtolower((string) $estado);
        if (in_array($texto, ['activo', 'activa', '1', 'true'])) return 'Activo';
        return ucfirst($texto);
    }

    /**
     * DESCARGA DE CERTIFICADO
     * 🆕 Ahora exige suscripcion_id explícito (ya no busca "la última" suscripción
     * del usuario, que era la causa de que se mezclaran los planes). Además decide
     * sola qué plantilla usar: certificado-afiliacion (personas) o certificado-mascota.
     */
    public function descargarCertificado(Request $request)
    {
        $request->validate([
            'cedula'         => 'required|string',
            'tipo'           => 'required|in:Titular,Beneficiario',
            'id'             => 'required|integer',
            'suscripcion_id' => 'required|integer',
        ]);

        $cedula = trim($request->cedula);

        if ($request->tipo === 'Titular') {
            $usuario = User::where('id', $request->id)->where('cedula', $cedula)->first();
            if (!$usuario) abort(404);

            $suscripcion = \App\Models\Suscripcion::where('id', $request->suscripcion_id)
                ->where('usuario_id', $usuario->id) // seguridad: que sea de ese titular
                ->first();
        } else {
            $afiliado = Afiliado::where('id', $request->id)->where('cedula', $cedula)->first();
            if (!$afiliado) abort(404);

            $suscripcion = \App\Models\Suscripcion::where('id', $request->suscripcion_id)->first();
            $usuario = $suscripcion?->usuario;
        }

        if (!$suscripcion || !$usuario) {
            abort(404);
        }

        $plan = $suscripcion->plan;
        $mascotas = Mascota::where('suscripcion_id', $suscripcion->id)->with(['especie', 'raza'])->get();

        if ($mascotas->isNotEmpty()) {
            // 🐾 Plan de mascotas (Huella Eterna)
            $pdf = Pdf::loadView('reportes.certificado-mascota', [
                'usuario'     => $usuario,
                'plan'        => $plan,
                'suscripcion' => $suscripcion,
                'mascotas'    => $mascotas,
                'fecha'       => now()->format('d/m/Y'),
            ]);

            return $pdf->download("certificado-mascotas-{$cedula}.pdf");
        }

        // 👤 Plan de personas (igual que antes)
        $afiliados = $suscripcion->afiliados()->with(['genero', 'tipoDocumento'])->get();

        $pdf = Pdf::loadView('reportes.certificado-afiliacion', [
            'usuario'     => $usuario,
            'plan'        => $plan,
            'suscripcion' => $suscripcion,
            'afiliados'   => $afiliados,
            'fecha'       => now()->format('d/m/Y'),
        ]);

        return $pdf->download("certificado-afiliacion-{$cedula}.pdf");
    }

    /**
     * ENVÍA EL CÓDIGO DE VERIFICACIÓN (OTP) AL CORREO DEL TITULAR
     */
    public function enviarCodigo(Request $request)
    {
        $request->validate(['cedula' => 'required|string']);
        $cedula = trim($request->cedula);

        $usuario = User::where('cedula', $cedula)->first();

        if (!$usuario || !$usuario->email) {
            return response()->json(['error' => 'No encontramos ningún registro con ese número de documento.'], 404);
        }

        $codigo = rand(100000, 999999);

        Cache::put("otp_pago_{$cedula}", $codigo, now()->addMinutes(10));

        Mail::raw(
            "Tu código de verificación para consultar y pagar tus facturas en Mouren es: {$codigo}\n\n" .
            "Este código expira en 10 minutos. Si no solicitaste este código, ignora este mensaje.",
            function ($message) use ($usuario) {
                $message->to($usuario->email)
                    ->subject('Código de Verificación - Mouren');
            }
        );

        return response()->json(['enviado' => true, 'canal' => 'correo']);
    }

    /**
     * VERIFICA EL CÓDIGO Y ENTREGA UN TOKEN TEMPORAL DE SESIÓN
     */
    public function verificarCodigo(Request $request)
    {
        $request->validate([
            'cedula' => 'required|string',
            'codigo' => 'required|string',
        ]);

        $cedula = trim($request->cedula);
        $codigoGuardado = Cache::get("otp_pago_{$cedula}");

        if (!$codigoGuardado || (string) $codigoGuardado !== trim($request->codigo)) {
            return response()->json(['error' => 'El código ingresado no es válido o expiró.'], 422);
        }

        Cache::forget("otp_pago_{$cedula}");

        $token = bin2hex(random_bytes(24));
        Cache::put("token_pago_{$token}", $cedula, now()->addMinutes(30));

        return response()->json(['valido' => true, 'token' => $token]);
    }

    private function validarToken(string $cedula, ?string $token)
    {
        if (!$token) return null;

        $cedulaDelToken = Cache::get("token_pago_{$token}");

        if (!$cedulaDelToken || $cedulaDelToken !== trim($cedula)) {
            return null;
        }

        return User::where('cedula', trim($cedula))->first();
    }

    /**
     * LISTA LAS FACTURAS DEL TITULAR, SOLO SI EL TOKEN ES VÁLIDO
     */
    public function facturas(Request $request)
    {
        $request->validate([
            'cedula' => 'required|string',
            'token'  => 'required|string',
        ]);

        $usuario = $this->validarToken($request->cedula, $request->token);

        if (!$usuario) {
            return response()->json(['error' => 'Tu sesión de verificación expiró. Vuelve a solicitar el código.'], 401);
        }

        $facturas = Factura::where(function ($query) use ($usuario) {
            $query->whereHas('suscripcion', function ($q) use ($usuario) {
                $q->where('usuario_id', $usuario->id);
            })->orWhere('usuario_id', $usuario->id);
        })
        ->where('estado_factura_id', '!=', 4)
        ->orderBy('fecha_emision', 'desc')
        ->get();

        return response()->json(['facturas' => $facturas]);
    }

    /**
     * PROCESA EL PAGO
     */
    public function procesarLote(Request $request)
    {
        $request->validate([
            'cedula' => 'required|string',
            'token'  => 'required|string',
            'ids' => 'required|array',
            'ids.*' => 'exists:facturas,id',
            'montos_personalizados' => 'required|array',
            'montos_personalizados.*.id' => 'required|integer',
            'montos_personalizados.*.monto' => 'required|numeric|min:1',
        ]);

        $usuario = $this->validarToken($request->cedula, $request->token);

        if (!$usuario) {
            return response()->json(['error' => 'Tu sesión de verificación expiró. Vuelve a solicitar el código.'], 401);
        }

        $facturaIds = $request->ids;

        $facturas = Factura::whereIn('id', $facturaIds)
            ->whereIn('estado_factura_id', [1, 3])
            ->where(function ($query) use ($usuario) {
                $query->whereHas('suscripcion', function ($q) use ($usuario) {
                    $q->where('usuario_id', $usuario->id);
                })->orWhere('usuario_id', $usuario->id);
            })
            ->get()
            ->keyBy('id');

        if ($facturas->isEmpty()) {
            return response()->json(['error' => 'No se encontraron facturas con saldos pendientes válidos para pagar.'], 422);
        }

        $montosSolicitados = collect($request->montos_personalizados)->keyBy('id');

        $montosValidados = [];
        foreach ($facturas as $facturaId => $factura) {
            $montoPedido = (float) ($montosSolicitados[$facturaId]['monto'] ?? 0);
            $saldoReal = (float) $factura->saldo_pendiente;

            if ($montoPedido <= 0) continue;

            $montosValidados[$facturaId] = min($montoPedido, $saldoReal);
        }

        if (empty($montosValidados)) {
            return response()->json(['error' => 'Debes indicar un monto de abono válido para al menos una factura.'], 422);
        }

        $montoTotal = array_sum($montosValidados);

        if ($montoTotal <= 0) {
            return response()->json(['error' => 'Las facturas seleccionadas ya se encuentran totalmente pagadas.'], 422);
        }

        try {
            $token = env('MERCADOPAGO_ACCESS_TOKEN');
            MercadoPagoConfig::setAccessToken($token);

            $client = new PreferenceClient();

            $preferenceData = [
                "items" => [
                    [
                        "id" => "LOTE-" . implode('-', array_keys($montosValidados)),
                        "title" => "Pago de Cuotas de Previsión Exequial - Mouren",
                        "quantity" => 1,
                        "unit_price" => (float) $montoTotal,
                        "currency_id" => "COP"
                    ]
                ],
                "payer" => [
                    "name"  => $usuario->nombre ?? $usuario->name,
                    "email" => $usuario->email,
                ],
                "back_urls" => [
                    "success" => url('/pagos-consultas'),
                    "failure" => url('/pagos-consultas'),
                    "pending" => url('/pagos-consultas'),
                ],
                "auto_return" => "approved",
                "notification_url" => url('/webhooks/mercadopago'),
                "external_reference" => json_encode($montosValidados),
            ];

            $preference = $client->create($preferenceData);

            \Log::info('INIT POINT (público): ' . $preference->init_point);

            return response()->json(['init_point' => $preference->init_point]);

        } catch (\Exception $e) {
            \Log::error("EXCEPCIÓN CONSULTA PÚBLICA: " . $e->getMessage());

            return response()->json([
                'error' => 'No se pudo conectar con la pasarela de pagos. Por favor, vuelve a intentarlo.'
            ], 500);
        }
    }
}
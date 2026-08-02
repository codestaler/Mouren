<?php

namespace App\Http\Controllers\Api\Pagos;

use App\Http\Controllers\Controller;
use App\Models\Pagos\Pago;
use App\Models\Pagos\Factura;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Preference\PreferenceClient;

class PagoController extends Controller
{
    public function index() {
        return response()->json(Pago::with(['factura', 'metodoPago'])->get(), 200);
    }

    /**
     * PROCESAR PAGOS EN LOTE DESDE LA CARTERA EN REACT (CON INERTIA)
     * 🆕 CORREGIDO: ahora sí respeta los montos parciales que el usuario digitó
     */
    public function store(Request $request) {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:facturas,id',
            'montos_personalizados' => 'required|array',
            'montos_personalizados.*.id' => 'required|integer',
            'montos_personalizados.*.monto' => 'required|numeric|min:1',
        ]);

        $usuario = auth()->user();
        $facturaIds = $request->ids;

        $facturas = Factura::whereIn('id', $facturaIds)
            ->whereIn('estado_factura_id', [1, 3])
            ->get()
            ->keyBy('id');

        if ($facturas->isEmpty()) {
            return back()->withErrors(['error' => 'No se encontraron facturas con saldos pendientes válidos para pagar.']);
        }

        // 🆕 Mapeamos lo que el usuario pidió abonar, por factura
        $montosSolicitados = collect($request->montos_personalizados)->keyBy('id');

        // 🆕 Validamos en el SERVIDOR (nunca confiar solo en lo que manda el navegador)
        // que nadie pueda mandar un monto mayor al saldo real de cada factura
        $montosValidados = [];
        foreach ($facturas as $facturaId => $factura) {
            $montoPedido = (float) ($montosSolicitados[$facturaId]['monto'] ?? 0);
            $saldoReal = (float) $factura->saldo_pendiente;

            if ($montoPedido <= 0) {
                continue;
            }

            $montosValidados[$facturaId] = min($montoPedido, $saldoReal);
        }

        if (empty($montosValidados)) {
            return back()->withErrors(['error' => 'Debes indicar un monto de abono válido para al menos una factura.']);
        }

        $montoTotal = array_sum($montosValidados);

        if ($montoTotal <= 0) {
            return back()->withErrors(['error' => 'Las facturas seleccionadas ya se encuentran totalmente pagadas.']);
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
                    "name" => $usuario->nombre ?? $usuario->name,
                    "email" => $usuario->email,
                ],
                "back_urls" => [
                    "success" => url('/pagos'),
                    "failure" => url('/pagos'),
                    "pending" => url('/pagos'),
                ],
                "auto_return" => "approved",
                "notification_url" => url('/webhooks/mercadopago'),
                // 🆕 CAMBIO CLAVE: ya no mandamos solo la lista de IDs.
                // Mandamos el mapa exacto {factura_id: monto}, así el webhook
                // sabe EXACTAMENTE cuánto abonar a cada una, no el saldo completo.
                "external_reference" => json_encode($montosValidados),
            ];

            $preference = $client->create($preferenceData);

            \Log::info('INIT POINT: ' . $preference->init_point);
            \Log::info('PREFERENCE ID: ' . $preference->id);

            return \Inertia\Inertia::location($preference->init_point);

        } catch (\Exception $e) {
            \Log::error("EXCEPCIÓN COMPLETA: " . $e->getMessage());
            \Log::error("STACK TRACE: " . $e->getTraceAsString());

            if (method_exists($e, 'getApiResponse')) {
                $apiResponse = $e->getApiResponse();
                if ($apiResponse) {
                    \Log::error("API RESPONSE CONTENT: " . json_encode($apiResponse->getContent(), JSON_PRETTY_PRINT));
                }
                $detalleError = $apiResponse ? json_encode($apiResponse->getContent(), JSON_PRETTY_PRINT) : $e->getMessage();
            } else {
                $detalleError = $e->getMessage();
            }

            \Log::error("Detalle real de Mercado Pago: " . $detalleError);

            return back()->withErrors([
                'error' => 'No se pudo conectar con la pasarela de pagos. Por favor, vuelve a intentarlo.'
            ]);
        }
    }

    /**
     * WEBHOOK: ESCUCHA LAS NOTIFICACIONES AUTOMÁTICAS DE MERCADO PAGO
     * 🆕 CORREGIDO: respeta abonos parciales + evita duplicados + envía comprobante por correo
     */
    public function recibirNotificacion(Request $request)
    {
        \Log::info('🔥 WEBHOOK RECIBIDO');
        MercadoPagoConfig::setAccessToken(env('MERCADOPAGO_ACCESS_TOKEN'));

        $paymentId = $request->data['id'] ?? $request->id;

        if (($request->type === 'payment' || $request->action === 'payment.created' || $request->action === 'payment.updated') && $paymentId) {

            try {
                $client = new \MercadoPago\Client\Payment\PaymentClient();
                $payment = $client->get($paymentId);

                if ($payment->status === 'approved') {

                    // 🆕 Ahora esto es un MAPA {factura_id: monto_a_abonar}, no una lista simple
                    $montosPorFactura = json_decode($payment->external_reference, true);

                    if (is_array($montosPorFactura)) {

                        // 🆕 Evita procesar el mismo pago dos veces si Mercado Pago reenvía la notificación
                        $yaProcesado = Pago::where('referencia_mercadopago', $payment->id)->exists();

                        if ($yaProcesado) {
                            \Log::info("Pago {$payment->id} ya había sido procesado, se ignora.");
                            return response()->json(['status' => 'OK'], 200);
                        }

                        $pagosCreados = [];

                        DB::transaction(function () use ($montosPorFactura, $payment, &$pagosCreados) {

                            foreach ($montosPorFactura as $facturaId => $montoAAbonar) {
                                $factura = Factura::find($facturaId);

                                if ($factura && in_array($factura->estado_factura_id, [1, 3])) {

                                    $saldoReal = (float) $factura->saldo_pendiente;
                                    // Protección: nunca abonar más de lo que realmente se debe
                                    $montoFinal = min((float) $montoAAbonar, $saldoReal);

                                    if ($montoFinal > 0) {
                                        $pago = Pago::create([
                                            'factura_id'             => $factura->id,
                                            'metodo_pago_id'         => 1,
                                            'fecha_pago'             => now(),
                                            'monto'                  => $montoFinal,
                                            'estado'                 => 'aprobado',
                                            'referencia_mercadopago' => $payment->id,
                                        ]);

                                        $factura->refresh();

                                        // 🆕 Ahora sí distingue: PAGADA (2) si el saldo quedó en $0,
                                        // ABONADA (3) si todavía queda algo pendiente
                                        $factura->update([
                                            'estado_factura_id' => $factura->saldo_pendiente <= 0 ? 2 : 3
                                        ]);

                                        $pagosCreados[] = ['pago' => $pago, 'factura' => $factura->fresh()];
                                    }
                                }
                            }
                        });

                        if (!empty($pagosCreados)) {
                            $this->enviarComprobantePorCorreo($pagosCreados, $payment);
                        }
                    }
                }
            } catch (\Exception $e) {
                \Log::error("Error procesando Webhook de Mercado Pago: " . $e->getMessage());
            }
        }

        return response()->json(['status' => 'OK'], 200);
    }

    /**
     * 🆕 NUEVO: envía el comprobante en PDF al correo del usuario tras un pago exitoso
     */
    private function enviarComprobantePorCorreo(array $pagosCreados, $payment)
    {
        $primeraFactura = $pagosCreados[0]['factura'];
        $suscripcion = $primeraFactura->suscripcion;
        $usuario = User::find($suscripcion->usuario_id);

        if (!$usuario || !$usuario->email) {
            \Log::warning("No se pudo enviar el comprobante: usuario no encontrado para la factura {$primeraFactura->id}");
            return;
        }

        $totalPagado = collect($pagosCreados)->sum(fn($item) => $item['pago']->monto);

        $pdf = Pdf::loadView('pdf.comprobante_pago', [
            'usuario'      => $usuario,
            'pagosCreados' => $pagosCreados,
            'totalPagado'  => $totalPagado,
            'paymentId'    => $payment->id,
            'fecha'        => now()->format('d/m/Y h:i A'),
        ]);

        try {
            Mail::send('emails.pago_confirmado', [
                'usuario'     => $usuario,
                'totalPagado' => $totalPagado,
                'paymentId'   => $payment->id,
            ], function ($message) use ($usuario, $pdf, $payment) {
                $message->to($usuario->email)
                    ->subject('¡Tu pago fue exitoso! - Mouren')
                    ->attachData($pdf->output(), "comprobante-pago-{$payment->id}.pdf", [
                        'mime' => 'application/pdf',
                    ]);
            });
        } catch (\Exception $e) {
            \Log::error("No se pudo enviar el correo de comprobante: " . $e->getMessage());
        }
    }

    /**
     * 🆕 NUEVO: permite al usuario descargar el comprobante de un pago en cualquier momento
     */
    public function descargarComprobante($pagoId)
{
    $pago = Pago::with('factura.suscripcion')->findOrFail($pagoId);

    // Seguridad: solo el dueño de la factura puede descargar su propio comprobante
    if ($pago->factura->suscripcion->usuario_id !== auth()->id()) {
        abort(403);
    }

    $factura = $pago->factura;

    // 🆕 CAMBIO: en vez de traer solo este pago, traemos TODOS los abonos aprobados de esta factura
    $todosLosPagos = Pago::where('factura_id', $factura->id)
        ->where('estado', 'aprobado')
        ->orderBy('fecha_pago', 'asc')
        ->get();

    // 🆕 Armamos el mismo formato que usa la vista del PDF, pero con cada abono histórico
    $pagosCreados = $todosLosPagos->map(function ($p) use ($factura) {
        return ['pago' => $p, 'factura' => $factura];
    })->toArray();

    $totalPagado = $todosLosPagos->sum('monto');

    // 🆕 Usamos la referencia del último pago como identificador principal del comprobante
    $ultimoPago = $todosLosPagos->last();

    $pdf = Pdf::loadView('pdf.comprobante_pago', [
        'usuario'      => auth()->user(),
        'pagosCreados' => $pagosCreados,
        'totalPagado'  => $totalPagado,
        'paymentId'    => $ultimoPago->referencia_mercadopago ?? $ultimoPago->id,
        'fecha'        => \Carbon\Carbon::parse($ultimoPago->fecha_pago)->format('d/m/Y h:i A'),
    ]);

    return $pdf->download("comprobante-factura-{$factura->id}.pdf");
}

    public function show($id) {
        $pago = Pago::with(['factura', 'metodoPago'])->find($id);
        if (!$pago) return response()->json(['msg' => 'Pago no encontrado'], 404);
        return response()->json($pago, 200);
    }

    public function update(Request $request, $id) {
        $pago = Pago::find($id);
        if (!$pago) return response()->json(['msg' => 'Pago no encontrado'], 404);
        $pago->update($request->all());
        return response()->json($pago, 200);
    }

    public function destroy($id) {
        $pago = Pago::find($id);
        if (!$pago) return response()->json(['msg' => 'Pago no encontrado'], 404);
        $pago->delete();
        return response()->json(['msg' => 'Pago eliminado'], 200);
    }

    public function registrarManual(Request $request)
    {
        $request->validate([
            'factura_id' => 'required|exists:facturas,id',
            'metodo_pago_id' => 'required|exists:metodos_pago,id',
            'monto' => 'required|numeric|min:1',
        ]);

        $factura = Factura::findOrFail($request->factura_id);

        if ($request->monto > $factura->saldo_pendiente) {
            return back()->withErrors([
                'error' => 'El monto supera el saldo pendiente.'
            ]);
        }

        Pago::create([
            'factura_id'     => $factura->id,
            'metodo_pago_id' => $request->metodo_pago_id,
            'fecha_pago'     => now(),
            'monto'          => $request->monto,
            'estado'         => 'aprobado'
        ]);

        $factura->refresh();

        if ($factura->saldo_pendiente <= 0) {
            $factura->update(['estado_factura_id' => 2]);
        } else {
            $factura->update(['estado_factura_id' => 3]);
        }

        return back()->with('success','Pago registrado correctamente.');
    }
}
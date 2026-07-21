<?php

namespace App\Http\Controllers\Api\Pagos;

use App\Http\Controllers\Controller;
use App\Models\Pagos\Pago;
use App\Models\Pagos\Factura; // Modelo de facturas actualizado
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Preference\PreferenceClient;

class PagoController extends Controller
{
    public function index() {
        return response()->json(Pago::with(['factura', 'metodoPago'])->get(), 200);
    }

    /**
     * PROCESAR PAGOS EN LOTE DESDE LA CARTERA EN REACT (CON INERTIA)
     * ACTUALIZADO PARA SOPORTAR SALDOS Y ABONOS
     */
    public function store(Request $request) {
        // 1. Validamos que nos llegue el arreglo de IDs de las facturas seleccionadas
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:facturas,id'
        ]);

        $usuario = auth()->user();
        $facturaIds = $request->ids;

        // 2. 🆕 CAMBIO: Buscar las facturas que estén Pendientes (1) O Abonadas (3)
        $facturas = Factura::whereIn('id', $facturaIds)
            ->whereIn('estado_factura_id', [1, 3]) 
            ->get();

        if ($facturas->isEmpty()) {
            return back()->withErrors(['error' => 'No se encontraron facturas con saldos pendientes válidos para pagar.']);
        }

        // 3. 🆕 CAMBIO: Calcular la suma de los SALDOS PENDIENTES reales, NO del total original
        $montoTotal = $facturas->sum(function($factura) {
            return $factura->saldo_pendiente;
        });

        // Por seguridad, si por algún motivo el saldo total ya es 0, no abrimos Mercado Pago
        if ($montoTotal <= 0) {
            return back()->withErrors(['error' => 'Las facturas seleccionadas ya se encuentran totalmente pagadas.']);
        }

        try {
            // 4. Configurar el SDK de Mercado Pago
            $token = env('MERCADOPAGO_ACCESS_TOKEN');
\Log::info('TOKEN SIENDO USADO: ' . $token);
MercadoPagoConfig::setAccessToken($token);

            // 5. Crear el cliente de Preferencias
            $client = new PreferenceClient();

            // 6. Construir la orden de pago oficial con el saldo real
            $preferenceData = [
    "items" => [
        [
            "id" => "LOTE-" . implode('-', $facturaIds),
            "title" => "Pago de Cuotas de Previsión Exequial - Mouren",
            "quantity" => 1,
            "unit_price" => (float) $montoTotal,
            "currency_id" => "COP"
        ]
    ],
    "country_id" => "CO",  // 👈 AGREGA ESTA LÍNEA
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

"notification_url" => "https://alfred-dame-assurance-debate.trycloudflare.com/webhooks/mercadopago",

"external_reference" => json_encode($facturaIds),
            ];

            \Log::info('NOTIFICATION URL: ' . url('/webhooks/mercadopago'));
            \Log::info('NOTIFICATION URL: ' . url('/webhooks/mercadopago'));

            // 7. Enviar la solicitud a los servidores de Mercado Pago
            $preference = $client->create($preferenceData);

            \Log::info('INIT POINT: ' . $preference->init_point);
\Log::info('PREFERENCE ID: ' . $preference->id);

            // 8. Redirigir usando Inertia
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
     * ACTUALIZADO PARA LIQUIDAR SALDOS
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
                    
                    $facturaIds = json_decode($payment->external_reference, true);

                    if (is_array($facturaIds)) {
                        DB::transaction(function () use ($facturaIds, $payment) {
                            
                            foreach ($facturaIds as $id) {
                                $factura = Factura::find($id);
                                
                                // 🆕 CAMBIO: Procesamos si está Pendiente (1) o Abonada (3)
                                if ($factura && in_array($factura->estado_factura_id, [1, 3])) {
                                    
                                    // Guardamos el saldo que le faltaba ANTES de este pago
                                    $montoAAbonar = $factura->saldo_pendiente;

                                    if ($montoAAbonar > 0) {
                                        // 1. Registramos el pago cubriendo lo que restaba de la factura
                                        Pago::create([
                                            'factura_id'     => $factura->id,
                                            'metodo_pago_id' => 1, // Mercado Pago / PSE
                                            'fecha_pago'     => now(),
                                            'monto'          => $montoAAbonar,
                                            'estado'         => 'aprobado'
                                        ]);

                                        // 2. Cambiamos el estado a PAGADO (2) porque el cliente pagó la totalidad de su saldo pendiente en línea
                                        $factura->update([
                                            'estado_factura_id' => 2
                                        ]);
                                    }
                                }
                            }
                        });
                    }
                }
            } catch (\Exception $e) {
                \Log::error("Error procesando Webhook de Mercado Pago: " . $e->getMessage());
            }
        }

        return response()->json(['status' => 'OK'], 200);
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

        $factura->update([
            'estado_factura_id' => 2 // Pagada
        ]);

    } else {

        $factura->update([
            'estado_factura_id' => 3 // Abonada
        ]);

    }

    return back()->with('success','Pago registrado correctamente.');
}
}
<?php

namespace App\Http\Controllers\Api\Pagos;

use App\Http\Controllers\Controller;
use App\Models\Pagos\Pago;
use App\Models\Pagos\Factura; // Nos aseguramos de importar el modelo Factura
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Preference\PreferenceClient;

class PagoController extends Controller
{
    // El método index se mantiene igual si lo usas para cargar datos por API externa
    public function index() {
        return response()->json(Pago::with(['factura', 'metodoPago'])->get(), 200);
    }

    /**
     * PROCESAR PAGOS EN LOTE DESDE LA CARTERA EN REACT (CON INERTIA)
     */
    /**
     * PROCESAR PAGOS EN LOTE GENERANDO LINK REAL DE MERCADO PAGO (PSE)
     */
    public function store(Request $request) {
        // 1. Validamos que nos llegue el arreglo de IDs de las facturas seleccionadas
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:facturas,id'
        ]);

        $usuario = auth()->user();
        $facturaIds = $request->ids;

        // 2. Buscar las facturas pendientes en la base de datos
        $facturas = Factura::whereIn('id', $facturaIds)
            ->where('estado_factura_id', 1) // 1 = Pendiente
            ->get();

        if ($facturas->isEmpty()) {
            return back()->withErrors(['error' => 'No se encontraron facturas pendientes válidas para pagar.']);
        }

        // 3. Calcular el total exacto de las cuotas seleccionadas en el servidor
        $montoTotal = $facturas->sum('total');

        try {
            // 4. Configurar el SDK de Mercado Pago con tu Access Token del archivo .env
            MercadoPagoConfig::setAccessToken(env('MERCADOPAGO_ACCESS_TOKEN'));

            // 5. Crear el cliente de Preferencias
            $client = new PreferenceClient();

            // 6. Construir la orden de pago oficial
            // 6. Construir la orden de pago oficial
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
                "payer" => [
                    "name" => $usuario->nombre ?? $usuario->name,
                    "email" => $usuario->email,
                ],
                "back_urls" => [
                    // Forzamos la URL como string para evitar fallos de configuración en local
                    "success" => url('/cliente/pagos'), 
                    "failure" => url('/cliente/pagos'),
                    "pending" => url('/cliente/pagos'),
                ],
                // COMENTAMOS ESTA LÍNEA temporalmente en localhost para que la API no falle:
                // "auto_return" => "approved", 
                
                "external_reference" => json_encode($facturaIds),
            ];

            // 7. Enviar la solicitud a los servidores de Mercado Pago
            $preference = $client->create($preferenceData);

            // 8. Redirigir al usuario al Checkout oficial de Mercado Pago de forma limpia usando Inertia
            return \Inertia\Inertia::location($preference->init_point);

        } catch (\Exception $e) {
    // 1. Extraemos el detalle real del error de Mercado Pago
    if (method_exists($e, 'getApiResponse')) {
        $apiResponse = $e->getApiResponse();
        $detalleError = $apiResponse ? json_encode($apiResponse->getContent(), JSON_PRETTY_PRINT) : $e->getMessage();
    } else {
        $detalleError = $e->getMessage();
    }

    // 2. Lo guardamos en el log de Laravel de forma segura
    \Log::error("Detalle real de Mercado Pago: " . $detalleError);

    // 3. Regresamos con error compatible con Inertia para que React lo pinte en tu modal estético
    return back()->withErrors([
        'error' => 'No se pudo conectar con la pasarela de pagos. Por favor, vuelve a intentarlo.'
    ]);
}
    }

    /**
     * WEBHOOK: ESCUCHA LAS NOTIFICACIONES AUTOMÁTICAS DE MERCADO PAGO
     */
    public function recibirNotificacion(Request $request)
    {
        MercadoPagoConfig::setAccessToken(env('MERCADOPAGO_ACCESS_TOKEN'));

        // Revisamos si la notificación trae un ID de pago válido
        $paymentId = $request->data['id'] ?? $request->id;

        if (($request->type === 'payment' || $request->action === 'payment.created' || $request->action === 'payment.updated') && $paymentId) {
            
            try {
                $client = new \MercadoPago\Client\Payment\PaymentClient();
                $payment = $client->get($paymentId);

                if ($payment->status === 'approved') {
                    
                    // ¡AQUÍ ESTÁ EL CAMBIO CORREGIDO!: Usamos json_decode para transformar el string en un Array de PHP
                    $facturaIds = json_decode($payment->external_reference, true);

                    if (is_array($facturaIds)) {
                        DB::transaction(function () use ($facturaIds, $payment) {
                            foreach ($facturaIds as $id) {
                                $factura = Factura::find($id);
                                if ($factura && $factura->estado_factura_id == 1) {
                                    
                                    // 1. Registramos el pago real en tu tabla 'pagos'
                                    Pago::create([
                                        'factura_id'     => $factura->id,
                                        'metodo_pago_id' => 1, 
                                        'fecha_pago'     => now(),
                                        'monto'          => $factura->total,
                                        'estado'         => 'aprobado'
                                    ]);

                                    // 2. Cambiamos el estado de la factura a PAGADA (2)
                                    $factura->update([
                                        'estado_factura_id' => 2
                                    ]);
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

    // Los demás métodos (show, update, destroy) los puedes dejar igual si son para consumo de API interna de administración
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

}
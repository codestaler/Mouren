<?php

namespace App\Http\Controllers\Api\Pagos;

use App\Http\Controllers\Controller;
use App\Models\Pagos\Pago;
use Illuminate\Http\Request;

class PagoController extends Controller
{
    public function index() {
        return response()->json(Pago::with(['factura', 'metodoPago'])->get(), 200);
    }

   public function store(Request $request) {
    // 1. Validaciones básicas de formato
    $request->validate([
        'factura_id' => 'required|exists:facturas,id',
        'metodo_pago_id' => 'required|exists:metodos_pago,id',
        'fecha_pago' => 'required|date',
        'monto' => 'required|numeric|min:1',
        'estado' => 'required|string'
    ]);

    // 2. Buscamos la factura para conocer su valor real
    $factura = \App\Models\Pagos\Factura::find($request->factura_id);

    // 3. Validación de Negocio: ¿El monto coincide con el total de la factura? 💸
    if ($request->monto != $factura->total) {
        return response()->json([
            'error' => 'Monto inválido',
            'mensaje' => "El monto enviado ({$request->monto}) no coincide con el total de la factura ({$factura->total})."
        ], 422); // Código 422: Error de validación
    }

    // 4. Si todo está bien, creamos el pago
    $pago = Pago::create($request->all());
    
    return response()->json($pago, 201);
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
}
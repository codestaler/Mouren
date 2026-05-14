<?php

namespace App\Http\Controllers\Api\Pagos;

use App\Http\Controllers\Controller;
use App\Models\Pagos\Factura;
use Illuminate\Http\Request;

class FacturaController extends Controller
{
    public function index() {
        return response()->json(Factura::with(['suscripcion', 'estado'])->get(), 200);
    }

    public function store(Request $request) {
        $request->validate([
            'suscripcion_id' => 'required|exists:suscripciones,id',
            'fecha_emision' => 'required|date',
            'fecha_vencimiento' => 'required|date',
            'total' => 'required|numeric',
            'estado_factura_id' => 'required|exists:estados_factura,id'
        ]);
        $factura = Factura::create($request->all());
        return response()->json($factura, 201);
    }

    public function show($id) {
        $factura = Factura::with(['suscripcion', 'estado'])->find($id);
        if (!$factura) return response()->json(['msg' => 'Factura no encontrada'], 404);
        return response()->json($factura, 200);
    }

    public function update(Request $request, $id) {
        $factura = Factura::find($id);
        if (!$factura) return response()->json(['msg' => 'Factura no encontrada'], 404);
        $factura->update($request->all());
        return response()->json($factura, 200);
    }

    public function destroy($id) {
        $factura = Factura::find($id);
        if (!$factura) return response()->json(['msg' => 'Factura no encontrada'], 404);
        $factura->delete();
        return response()->json(['msg' => 'Factura eliminada'], 200);
    }
}
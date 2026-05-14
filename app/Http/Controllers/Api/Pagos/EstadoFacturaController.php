<?php

namespace App\Http\Controllers\Api\Pagos;

use App\Http\Controllers\Controller;
use App\Models\Pagos\EstadoFactura;
use Illuminate\Http\Request;

class EstadoFacturaController extends Controller
{
    public function index() {
        return response()->json(EstadoFactura::all(), 200);
    }

    public function store(Request $request) {
        $request->validate(['nombre' => 'required|string|max:50']);
        $estado = EstadoFactura::create($request->all());
        return response()->json($estado, 201);
    }

    public function show($id) {
        $estado = EstadoFactura::find($id);
        if (!$estado) return response()->json(['msg' => 'No encontrado'], 404);
        return response()->json($estado, 200);
    }

    public function update(Request $request, $id) {
        $estado = EstadoFactura::find($id);
        if (!$estado) return response()->json(['msg' => 'No encontrado'], 404);
        $estado->update($request->all());
        return response()->json($estado, 200);
    }

    public function destroy($id) {
        $estado = EstadoFactura::find($id);
        if (!$estado) return response()->json(['msg' => 'No encontrado'], 404);
        $estado->delete();
        return response()->json(['msg' => 'Eliminado'], 200);
    }
}
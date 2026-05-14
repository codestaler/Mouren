<?php

namespace App\Http\Controllers\Api\Pagos;

use App\Http\Controllers\Controller;
use App\Models\Pagos\MetodoPago;
use Illuminate\Http\Request;

class MetodoPagoController extends Controller
{
    public function index() {
        return response()->json(MetodoPago::all(), 200);
    }

    public function store(Request $request) {
        $request->validate(['nombre' => 'required|string|max:50']);
        $metodo = MetodoPago::create($request->all());
        return response()->json($metodo, 201);
    }

    public function show($id) {
        $metodo = MetodoPago::find($id);
        if (!$metodo) return response()->json(['msg' => 'No encontrado'], 404);
        return response()->json($metodo, 200);
    }

    public function update(Request $request, $id) {
        $metodo = MetodoPago::find($id);
        if (!$metodo) return response()->json(['msg' => 'No encontrado'], 404);
        $metodo->update($request->all());
        return response()->json($metodo, 200);
    }

    public function destroy($id) {
        $metodo = MetodoPago::find($id);
        if (!$metodo) return response()->json(['msg' => 'No encontrado'], 404);
        $metodo->delete();
        return response()->json(['msg' => 'Eliminado'], 200);
    }
}
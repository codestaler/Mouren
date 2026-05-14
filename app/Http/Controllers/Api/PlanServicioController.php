<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Planservicio;
use Illuminate\Http\Request;

class PlanServicioController extends Controller
{
    public function index() { return response()->json(Planservicio::all(), 200); }

public function store(Request $request) {
    $item = Planservicio::create($request->all());
    return response()->json($item, 201);
}

public function update(Request $request, $id) {
    $item = Planservicio::findOrFail($id);
    $item->update($request->all());
    return response()->json($item, 200);
}

public function destroy($id) {
    Planservicio::destroy($id);
    return response()->json(['mensaje' => 'Eliminado correctamente'], 200);
}
}

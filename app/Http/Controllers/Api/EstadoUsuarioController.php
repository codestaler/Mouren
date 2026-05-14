<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EstadoUsuario;
use Illuminate\Http\Request;

class EstadoUsuarioController extends Controller {
    
    public function index() {
        return response()->json(EstadoUsuario::all(), 200);
    }

    public function store(Request $request) {
        $estado = EstadoUsuario::create($request->all());
        return response()->json($estado, 201);
    }

    public function update(Request $request, $id) {
        $estado = EstadoUsuario::findOrFail($id);
        $estado->update($request->all());
        return response()->json(['mensaje' => 'Estado actualizado', 'datos' => $estado], 200);
    }

    public function destroy($id) {
        EstadoUsuario::destroy($id);
        return response()->json(['mensaje' => 'Estado eliminado'], 200);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoUsuario;
use Illuminate\Http\Request;

class TipoUsuarioController extends Controller {
    
    public function index() {
        return response()->json(TipoUsuario::all(), 200);
    }

    public function store(Request $request) {
        $tipo = TipoUsuario::create($request->all());
        return response()->json($tipo, 201);
    }

    public function update(Request $request, $id) {
        $tipo = TipoUsuario::findOrFail($id);
        $tipo->update($request->all());
        return response()->json(['mensaje' => 'Tipo de usuario actualizado', 'datos' => $tipo], 200);
    }

    public function destroy($id) {
        TipoUsuario::destroy($id);
        return response()->json(['mensaje' => 'Tipo de usuario eliminado'], 200);
    }
}
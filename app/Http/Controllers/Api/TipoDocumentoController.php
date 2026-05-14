<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoDocumento;
use Illuminate\Http\Request;

class TipoDocumentoController extends Controller {
    public function store(Request $request) {
        $request->validate(['nombre' => 'required|string|unique:tipos_documento']);
        $tipo = TipoDocumento::create($request->all());
        return response()->json($tipo, 201);
    }

    public function index() {
        return response()->json(TipoDocumento::all(), 200);
    }
    // NUEVO: EDITAR
    public function update(Request $request, $id) {
        $tipo = TipoDocumento::findOrFail($id);
        $tipo->update($request->all());
        return response()->json(['mensaje' => 'Tipo de documento actualizado', 'datos' => $tipo], 200);
    }

    // NUEVO: ELIMINAR
    public function destroy($id) {
        TipoDocumento::destroy($id);
        return response()->json(['mensaje' => 'Tipo de documento eliminado'], 200);
    }
}
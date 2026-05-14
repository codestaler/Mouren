<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recuerdo; // <-- Esto es importar el modelo
use Illuminate\Http\Request;

class RecuerdoController extends Controller
{
    public function index() {
        return response()->json(Recuerdo::all(), 200);
    }

    public function store(Request $request) {
        // Aquí capturamos los datos, incluyendo la ruta de la imagen
        $recuerdo = Recuerdo::create($request->all());
        return response()->json($recuerdo, 201);
    }

    public function update(Request $request, $id) {
        $recuerdo = Recuerdo::findOrFail($id);
        $recuerdo->update($request->all());
        return response()->json([
            'mensaje' => 'Recuerdo actualizado',
            'datos' => $recuerdo
        ], 200);
    }

    public function destroy($id) {
        Recuerdo::destroy($id);
        return response()->json(['mensaje' => 'Recuerdo eliminado'], 200);
    }
}
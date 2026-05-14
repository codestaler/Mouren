<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Servicio;
use Illuminate\Http\Request;

class ServicioController extends Controller
{
    // LISTAR TODOS
    public function index() {
        return response()->json(Servicio::all(), 200);
    }

    // CREAR
    public function store(Request $request) {
        $servicio = Servicio::create($request->all());
        return response()->json($servicio, 201);
    }

    // VER UNO SOLO
    public function show($id) {
        return response()->json(Servicio::findOrFail($id), 200);
    }

    // EDITAR (PUT)
    public function update(Request $request, $id) {
        $servicio = Servicio::findOrFail($id);
        $servicio->update($request->all());
        return response()->json([
            'mensaje' => 'Servicio actualizado',
            'datos' => $servicio
        ], 200);
    }

    // ELIMINAR (DELETE)
    public function destroy($id) {
        Servicio::destroy($id);
        return response()->json(['mensaje' => 'Servicio eliminado de la base de datos'], 200);
    }
}
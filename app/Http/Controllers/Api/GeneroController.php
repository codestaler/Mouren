<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Genero;
use Illuminate\Http\Request;

class GeneroController extends Controller {
    public function store(Request $request) {
        $request->validate(['nombre' => 'required|string|unique:generos']);
        $genero = Genero::create($request->all());
        return response()->json($genero, 201);
    }

    public function index() {
        return response()->json(Genero::all(), 200);
    }
    
    public function update(Request $request, $id) {
        $genero = Genero::findOrFail($id);
        $genero->update($request->all());
        return response()->json(['mensaje' => 'Género actualizado', 'datos' => $genero], 200);
    }

    public function destroy($id) {
        Genero::destroy($id);
        return response()->json(['mensaje' => 'Género eliminado'], 200);
    }
}
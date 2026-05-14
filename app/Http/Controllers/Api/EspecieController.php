<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Especie;
use Illuminate\Http\Request;

class EspecieController extends Controller
{
    public function index() {
        return response()->json(Especie::all(), 200);
    }

    public function store(Request $request) {
        $request->validate(['nombre' => 'required|string|max:50']);
        $especie = Especie::create($request->all());
        return response()->json($especie, 201);
    }

    public function show($id) {
        $especie = Especie::find($id);
        if (!$especie) return response()->json(['message' => 'No encontrado'], 404);
        return response()->json($especie, 200);
    }

    public function update(Request $request, $id) {
        $especie = Especie::find($id);
        if (!$especie) return response()->json(['message' => 'No encontrado'], 404);
        $especie->update($request->all());
        return response()->json($especie, 200);
    }

    public function destroy($id) {
        $especie = Especie::find($id);
        if (!$especie) return response()->json(['message' => 'No encontrado'], 404);
        $especie->delete();
        return response()->json(['message' => 'Eliminado correctamente'], 200);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cancion; // <-- Importante
use Illuminate\Http\Request;

class CancionController extends Controller
{
    public function index() {
        return response()->json(Cancion::all(), 200);
    }

    public function store(Request $request) {
        $cancion = Cancion::create($request->all());
        return response()->json($cancion, 201);
    }

    public function update(Request $request, $id) {
        $cancion = Cancion::findOrFail($id);
        $cancion->update($request->all());
        return response()->json(['mensaje' => 'Canción actualizada', 'datos' => $cancion], 200);
    }

    public function destroy($id) {
        Cancion::destroy($id);
        return response()->json(['mensaje' => 'Canción eliminada'], 200);
    }
}
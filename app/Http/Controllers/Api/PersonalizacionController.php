<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personalizacion;
use Illuminate\Http\Request;

class PersonalizacionController extends Controller
{
    public function index() {
        return response()->json(Personalizacion::all(), 200);
    }

    public function store(Request $request) {
        $request->validate([
            'servicio_funerario_id' => 'required|exists:servicios_funerarios,id',
            'servicio_id' => 'required|exists:servicios,id',
            'configuracion' => 'required|array' // Crucial para el campo JSON
        ]);

        $personalizacion = Personalizacion::create($request->all());
        return response()->json($personalizacion, 201);
    }

    public function show($id) {
        $personalizacion = Personalizacion::find($id);
        if (!$personalizacion) return response()->json(['msg' => 'Personalización no encontrada'], 404);
        return response()->json($personalizacion, 200);
    }

    public function update(Request $request, $id) {
        $personalizacion = Personalizacion::find($id);
        if (!$personalizacion) return response()->json(['msg' => 'Personalización no encontrada'], 404);

        // Si actualizas el JSON, asegúrate de enviar el array completo en Postman
        $personalizacion->update($request->all());
        return response()->json($personalizacion, 200);
    }

    public function destroy($id) {
        $personalizacion = Personalizacion::find($id);
        if (!$personalizacion) return response()->json(['msg' => 'Personalización no encontrada'], 404);
        
        $personalizacion->delete();
        return response()->json(['msg' => 'Personalización eliminada'], 200);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Suscripcion;
use Illuminate\Http\Request;

class SuscripcionController extends Controller
{
    public function index() {
        // Cambiamos 'persona' por 'usuario' que es como está en tu Modelo
        return response()->json(Suscripcion::with(['usuario', 'plan'])->get(), 200);
    }

    public function store(Request $request) {
        $request->validate([
            'usuario_id'    => 'required|exists:users,id', // Según tu script
            'plan_id'       => 'required|exists:planes,id',
            'fecha_inicio'  => 'required|date',
            'estado'        => 'required|string',
            'cuota_mensual' => 'required|numeric' // Campo nuevo de tu script
        ]);

        $suscripcion = Suscripcion::create($request->all());
        return response()->json($suscripcion, 201);
    }

    public function show($id) {
        $suscripcion = Suscripcion::with(['usuario', 'plan'])->find($id);
        if (!$suscripcion) return response()->json(['msg' => 'No encontrada'], 404);
        return response()->json($suscripcion, 200);
    }

    public function update(Request $request, $id) {
        $suscripcion = Suscripcion::find($id);
        if (!$suscripcion) return response()->json(['msg' => 'No encontrada'], 404);
        
        $suscripcion->update($request->all());
        return response()->json($suscripcion, 200);
    }

    public function destroy($id) {
        $suscripcion = Suscripcion::find($id);
        if (!$suscripcion) return response()->json(['msg' => 'No encontrada'], 404);
        
        $suscripcion->delete();
        return response()->json(['msg' => 'Eliminada'], 200);
    }
}
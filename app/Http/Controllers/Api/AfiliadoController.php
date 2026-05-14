<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Afiliado; // Importamos el modelo correctamente
use Illuminate\Http\Request;

class AfiliadoController extends Controller
{
    public function index()
    {
        // Cargamos las relaciones para ver los datos del Usuario y la Suscripción
        $afiliados = Afiliado::with(['usuario', 'suscripcion'])->get();
        return response()->json($afiliados, 200);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'suscripcion_id' => 'required|exists:suscripciones,id',
                'user_id'        => 'required|exists:users,id',
                'parentesco'     => 'required|string|max:50',
                'estado'         => 'required|string|max:50',
                'fecha_fallecimiento' => 'nullable|date'
            ]);

            $afiliado = Afiliado::create($request->all());

            return response()->json([
                'mensaje' => 'Afiliado creado con éxito',
                'data'    => $afiliado
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Error al crear el afiliado',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $afiliado = Afiliado::with(['usuario', 'suscripcion'])->find($id);
        
        if (!$afiliado) {
            return response()->json(['mensaje' => 'Afiliado no encontrado'], 404);
        }

        return response()->json($afiliado, 200);
    }

    public function update(Request $request, $id)
    {
        $afiliado = Afiliado::find($id);

        if (!$afiliado) {
            return response()->json(['mensaje' => 'Afiliado no encontrado'], 404);
        }

        $afiliado->update($request->all());

        return response()->json([
            'mensaje' => 'Afiliado actualizado',
            'data'    => $afiliado
        ], 200);
    }

    public function destroy($id)
    {
        $afiliado = Afiliado::find($id);

        if (!$afiliado) {
            return response()->json(['mensaje' => 'Afiliado no encontrado'], 404);
        }

        $afiliado->delete();
        return response()->json(['mensaje' => 'Afiliado eliminado'], 200);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mascota;
use Illuminate\Http\Request;

class MascotaController extends Controller
{
    // Listar mascotas con su dueño (Usuario) y especie
    public function index() {
        // Cargamos las relaciones 'dueño' (que ahora es User) y 'especie'
        return response()->json(Mascota::with(['dueño', 'especie'])->get(), 200);
    }

    public function store(Request $request) {
        try {
            $request->validate([
                'nombre' => 'required|string|max:100',
                'especie_id' => 'required|exists:especies,id',
                'user_id' => 'required|exists:users,id', // Validamos contra la tabla users
                'raza' => 'nullable|string|max:100',
                'fecha_nacimiento' => 'nullable|date'
            ]);
            
            $mascota = Mascota::create($request->all());
            
            return response()->json([
                'mensaje' => 'Mascota registrada exitosamente en Mouren',
                'datos' => $mascota
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al registrar la mascota',
                'detalle' => $e->getMessage()
            ], 422);
        }
    }

    public function show($id) {
        $mascota = Mascota::with(['dueño', 'especie'])->find($id);
        
        if (!$mascota) {
            return response()->json(['mensaje' => 'Mascota no encontrada'], 404);
        }
        
        return response()->json($mascota, 200);
    }

    public function update(Request $request, $id) {
        $mascota = Mascota::find($id);
        
        if (!$mascota) {
            return response()->json(['mensaje' => 'Mascota no encontrada'], 404);
        }

        $request->validate([
            'user_id' => 'exists:users,id',
            'especie_id' => 'exists:especies,id'
        ]);

        $mascota->update($request->all());
        
        return response()->json([
            'mensaje' => 'Datos de la mascota actualizados',
            'datos' => $mascota
        ], 200);
    }

    public function destroy($id) {
        $mascota = Mascota::find($id);
        
        if (!$mascota) {
            return response()->json(['mensaje' => 'Mascota no encontrada'], 404);
        }
        
        $mascota->delete();
        
        return response()->json(['mensaje' => 'Registro de mascota eliminado'], 200);
    }
}
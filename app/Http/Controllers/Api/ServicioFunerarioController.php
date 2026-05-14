<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServicioFunerario;
use Illuminate\Http\Request;

class ServicioFunerarioController extends Controller
{
    public function index() {
        // Trae los servicios con la info de la suscripción relacionada
        return response()->json(ServicioFunerario::with('suscripcion')->get(), 200);
    }

    public function store(Request $request) {
    $request->validate([
        'fecha_inicio' => 'required|date',
        'cancion_id' => 'required|exists:canciones,id',
        // Validamos que al menos uno de los dos esté presente
        'afiliado_id' => 'required_without:mascota_id',
        'mascota_id' => 'required_without:afiliado_id',
    ]);

    $servicio = ServicioFunerario::create($request->all());
    return response()->json($servicio, 201);
}

    public function show($id) {
        $servicio = ServicioFunerario::with('suscripcion')->find($id);
        if (!$servicio) return response()->json(['msg' => 'Servicio no encontrado'], 404);
        return response()->json($servicio, 200);
    }

    public function update(Request $request, $id) {
        $servicio = ServicioFunerario::find($id);
        if (!$servicio) return response()->json(['msg' => 'Servicio no encontrado'], 404);
        
        $servicio->update($request->all());
        return response()->json($servicio, 200);
    }

    public function destroy($id)
{
    $servicio = ServicioFunerario::find($id);

    if (!$servicio) {
        return response()->json(['msg' => 'Servicio no encontrado'], 404);
    }

    try {
        $servicio->delete();
        return response()->json(['msg' => 'Servicio eliminado con éxito'], 200);
    } catch (\Illuminate\Database\QueryException $e) {
        // El código 23000 es el estándar de SQL para errores de integridad referencial 🔗
        if ($e->getCode() === "23000" || str_contains($e->getMessage(), 'Foreign key constraint fails')) {
            return response()->json([
                'error' => 'No se puede eliminar el registro',
                'detalle' => 'Este servicio tiene historial de trazabilidad o pagos asociados. Debes eliminar esos registros primero.'
            ], 422);
        }

        return response()->json(['error' => 'Ocurrió un error inesperado'], 500);
    }
}
    
}
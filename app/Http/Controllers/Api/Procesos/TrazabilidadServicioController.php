<?php

namespace App\Http\Controllers\Api\Procesos;

use App\Http\Controllers\Controller;
use App\Models\Procesos\TrazabilidadServicio;
use Illuminate\Http\Request;

class TrazabilidadServicioController extends Controller
{
    public function index()
    {
        // Cargamos las relaciones para ver nombres en lugar de solo IDs 🔗
        return response()->json(TrazabilidadServicio::with(['etapa', 'responsable'])->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'servicio_funerario_id' => 'required|exists:servicios_funerarios,id',
            'etapa_id' => 'required|exists:etapas_servicio,id',
            'descripcion' => 'required|string',
            'fecha' => 'required|date',
            'usuario_responsable' => 'required|exists:users,id' 
        ]);

        $trazabilidad = TrazabilidadServicio::create($request->all());
        return response()->json($trazabilidad, 201);
    }

    public function show($id)
    {
        $trazabilidad = TrazabilidadServicio::with(['etapa', 'responsable'])->find($id);
        if (!$trazabilidad) return response()->json(['msg' => 'Registro no encontrado'], 404);
        return response()->json($trazabilidad, 200);
    }
    
    // Los métodos update y destroy seguirían la misma lógica que el controlador anterior.
    
}
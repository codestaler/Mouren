<?php

namespace App\Http\Controllers\Api\Procesos;

use App\Http\Controllers\Controller;
use App\Models\Procesos\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    public function index()
    {
        // Traemos las notificaciones junto con los datos del usuario 🔗
        return response()->json(Notificacion::with('usuario')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'usuario_id' => 'required|exists:users,id',
            'mensaje'    => 'required|string',
            'fecha'      => 'required|date',
        ]);

        // Por defecto 'leido' será false gracias a la base de datos
        $notificacion = Notificacion::create($request->all());
        return response()->json($notificacion, 201);
    }

    public function show($id)
    {
        $notificacion = Notificacion::find($id);
        if (!$notificacion) return response()->json(['msg' => 'No encontrada'], 404);
        return response()->json($notificacion, 200);
    }

    // Método útil para marcar como leída ✅
    public function update(Request $request, $id)
    {
        $notificacion = Notificacion::find($id);
        if (!$notificacion) return response()->json(['msg' => 'No encontrada'], 404);
        
        $notificacion->update($request->only('leido'));
        return response()->json($notificacion, 200);
    }
}
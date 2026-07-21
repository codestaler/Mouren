<?php

namespace App\Http\Controllers\Api\Procesos;

use App\Http\Controllers\Controller;
use App\Models\Procesos\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    /**
     * Devuelve las últimas notificaciones del usuario logueado + el conteo de no leídas.
     */
    public function index()
    {
        $usuarioId = Auth::id();

        $notificaciones = Notificacion::where('usuario_id', $usuarioId)
            ->orderByDesc('fecha')
            ->limit(20)
            ->get();

        $noLeidas = Notificacion::where('usuario_id', $usuarioId)
            ->where('leido', false)
            ->count();

        return response()->json([
            'notificaciones' => $notificaciones,
            'no_leidas'      => $noLeidas,
        ]);
    }

    /**
     * Marca una notificación puntual como leída.
     */
    public function marcarLeida($id)
    {
        $notificacion = Notificacion::where('usuario_id', Auth::id())->findOrFail($id);
        $notificacion->update(['leido' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Marca todas las notificaciones del usuario logueado como leídas.
     */
    public function marcarTodasLeidas()
    {
        Notificacion::where('usuario_id', Auth::id())
            ->where('leido', false)
            ->update(['leido' => true]);

        return response()->json(['success' => true]);
    }
}
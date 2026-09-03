<?php

namespace App\Http\Controllers;

use App\Models\Procesos\Notificacion;
use App\Services\NotificacionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class NotificacionController extends Controller
{
    /**
     * Devuelve las últimas notificaciones del usuario logueado + el conteo de no leídas.
     * Funciona igual para admin o cliente — siempre filtra por Auth::id().
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

    /**
     * 🆕 Muestra el panel de administrador para redactar y enviar un anuncio masivo.
     */
    public function panelMasivo()
    {
        return Inertia::render('Admin/NotificacionesMasivas');
    }

    /**
     * 🆕 Procesa el envío del anuncio masivo: título, mensaje, imagen opcional
     * y a quién va dirigido (todos / solo clientes / solo admins).
     */
    public function enviarMasiva(Request $request)
    {
        $request->validate([
            'titulo'  => 'required|string|max:150',
            'mensaje' => 'required|string|max:1000',
            'imagen'  => 'nullable|image|max:4096', // hasta 4MB
            'publico' => 'required|in:todos,clientes,admins',
            'enlace'  => 'nullable|string|max:255',
        ]);

        $urlImagen = null;

        if ($request->hasFile('imagen')) {
            // Se guarda en storage/app/public/notificaciones y queda accesible
            // vía /storage/notificaciones/... (requiere `php artisan storage:link`)
            $ruta = $request->file('imagen')->store('notificaciones', 'public');
            $urlImagen = Storage::url($ruta);
        }

        $totalEnviados = NotificacionService::avisarTodos(
            $request->titulo,
            $request->mensaje,
            'anuncio',
            $request->enlace,
            $urlImagen,
            $request->publico
        );

        return back()->with('message', "Anuncio enviado a {$totalEnviados} usuario(s).");
    }
}

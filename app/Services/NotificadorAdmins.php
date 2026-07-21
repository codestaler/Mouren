<?php

namespace App\Services;

use App\Models\Procesos\Notificacion;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificadorAdmins
{
    /**
     * Notifica (en-app + correo) a todos los administradores que tengan
     * notificaciones_activadas = true.
     *
     * @param string $titulo    Titulo corto, ej: "Nuevo fallecimiento registrado"
     * @param string $mensaje   Cuerpo del mensaje/correo
     * @param string $tipo      Categoria libre, ej: 'fallecimiento', 'ceremonia'
     * @param string|null $enlace  Ruta a la que lleva la notificacion al hacer click
     */
    public static function notificar(string $titulo, string $mensaje, string $tipo = 'general', ?string $enlace = null): void
    {
        $admins = User::where('tipo_usuario_id', 1)
            ->where('notificaciones_activadas', true)
            ->get();

        foreach ($admins as $admin) {
            // 1. Notificación dentro de la app (campanita)
            Notificacion::create([
                'usuario_id' => $admin->id,
                'titulo'     => $titulo,
                'mensaje'    => $mensaje,
                'tipo'       => $tipo,
                'enlace'     => $enlace,
                'fecha'      => now(),
                'leido'      => false,
            ]);

            // 2. Correo
            try {
                Mail::raw($mensaje, function ($message) use ($admin, $titulo) {
                    $message->to($admin->email)->subject($titulo);
                });
            } catch (\Exception $e) {
                // Si falla el correo (ej: SMTP caido), no rompemos el flujo principal.
                // La notificación en-app ya quedó guardada de todas formas.
            }
        }
    }
}

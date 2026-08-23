<?php

namespace App\Services;

use App\Models\Procesos\Notificacion;
use App\Models\User;
use Carbon\Carbon;

class NotificacionService
{
    /**
     * Crea una notificación para CADA administrador del sistema
     * (tipo_usuario_id = 1, el mismo valor que ya usas en AdminUserSeeder).
     *
     * Uso:
     * NotificacionService::avisarAdmins(
     *     'Nueva inscripción',
     *     'Laura Pérez se inscribió al plan Descanso Sereno.',
     *     'suscripcion',
     *     '/admin/ventas'
     * );
     */
    public static function avisarAdmins(string $titulo, string $mensaje, string $tipo = 'info', ?string $enlace = null): void
    {
        $adminsIds = User::where('tipo_usuario_id', 1)->pluck('id');

        foreach ($adminsIds as $adminId) {
            Notificacion::create([
                'usuario_id' => $adminId,
                'titulo'     => $titulo,
                'mensaje'    => $mensaje,
                'tipo'       => $tipo,
                'enlace'     => $enlace,
                'fecha'      => Carbon::now(),
                'leido'      => false,
            ]);
        }
    }
}

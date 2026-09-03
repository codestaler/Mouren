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
     */
    public static function avisarAdmins(string $titulo, string $mensaje, string $tipo = 'info', ?string $enlace = null, ?string $imagen = null): void
    {
        $adminsIds = User::where('tipo_usuario_id', 1)->pluck('id');

        foreach ($adminsIds as $adminId) {
            Notificacion::create([
                'usuario_id' => $adminId,
                'titulo'     => $titulo,
                'mensaje'    => $mensaje,
                'tipo'       => $tipo,
                'enlace'     => $enlace,
                'imagen'     => $imagen,
                'fecha'      => Carbon::now(),
                'leido'      => false,
            ]);
        }
    }

    /**
     * 🆕 Crea una notificación para UN solo usuario específico
     * (ej: el cliente dueño de una factura recién generada).
     */
    public static function avisarUsuario(int $usuarioId, string $titulo, string $mensaje, string $tipo = 'info', ?string $enlace = null, ?string $imagen = null): void
    {
        Notificacion::create([
            'usuario_id' => $usuarioId,
            'titulo'     => $titulo,
            'mensaje'    => $mensaje,
            'tipo'       => $tipo,
            'enlace'     => $enlace,
            'imagen'     => $imagen,
            'fecha'      => Carbon::now(),
            'leido'      => false,
        ]);
    }

    /**
     * 🆕 Envía un anuncio masivo a TODOS los usuarios, o solo a un grupo
     * ('todos' | 'clientes' | 'admins'). Devuelve cuántos usuarios lo recibieron.
     */
    public static function avisarTodos(string $titulo, string $mensaje, string $tipo = 'anuncio', ?string $enlace = null, ?string $imagen = null, string $publico = 'todos'): int
    {
        $query = User::query();

        if ($publico === 'clientes') {
            $query->where('tipo_usuario_id', 2);
        } elseif ($publico === 'admins') {
            $query->where('tipo_usuario_id', 1);
        }
        // 'todos' no filtra nada — le llega a cualquier usuario del sistema

        $usuariosIds = $query->pluck('id');

        foreach ($usuariosIds as $usuarioId) {
            Notificacion::create([
                'usuario_id' => $usuarioId,
                'titulo'     => $titulo,
                'mensaje'    => $mensaje,
                'tipo'       => $tipo,
                'enlace'     => $enlace,
                'imagen'     => $imagen,
                'fecha'      => Carbon::now(),
                'leido'      => false,
            ]);
        }

        return $usuariosIds->count();
    }
}

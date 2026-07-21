<?php

namespace App\Models\Procesos;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificaciones';

    protected $fillable = [
        'usuario_id',
        'titulo',
        'mensaje',
        'tipo',
        'enlace',
        'fecha',
        'leido',
    ];

    protected $casts = [
        'leido' => 'boolean',
        'fecha' => 'datetime',
    ];

    // Relación: Una notificación le pertenece a un usuario 👤
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}

<?php

namespace App\Models\Procesos;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificaciones';
    protected $fillable = [
        'usuario_id', 
        'mensaje', 
        'fecha', 
        'leido'
    ];

    // Relación: Una notificación le pertenece a un usuario 👤
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
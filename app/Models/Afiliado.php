<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Afiliado extends Model
{
    use HasFactory;

    protected $table = 'afiliados';

    protected $fillable = [
        'suscripcion_id',
        'user_id',
        'parentesco',
        'estado',
        'fecha_fallecimiento'
    ];

    // Relación con el Usuario (quien es el afiliado)
    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relación con la Suscripción
    public function suscripcion()
    {
        return $this->belongsTo(Suscripcion::class, 'suscripcion_id');
    }
}
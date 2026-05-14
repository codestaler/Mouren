<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Suscripcion extends Model
{
    use HasFactory;

    protected $table = 'suscripciones';

    protected $fillable = [
        'usuario_id',
        'plan_id',
        'fecha_inicio',
        'estado',
        'cuota_mensual'
    ];

    // Relación con el usuario (quien paga)
    public function usuario() {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    // Relación con el plan elegido
    public function plan() {
        return $this->belongsTo(Plan::class, 'plan_id');
    }
}
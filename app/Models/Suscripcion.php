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

    // --- RELACIONES EXISTENTES ---

    public function usuario() {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function plan() {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    // --- NUEVAS RELACIONES NECESARIAS ---

    /**
     * Relación con los servicios adicionales de la suscripción.
     * Esta es la que permite usar ->servicios()->attach() en el controlador.
     */
    public function servicios()
    {
        // 'suscripcion_servicio' es el nombre de tu tabla intermedia
        return $this->belongsToMany(Servicio::class, 'suscripcion_servicio', 'suscripcion_id', 'servicio_id')
                    ->withTimestamps();
    }

    /**
     * Relación con los afiliados (protegidos) de esta suscripción.
     */
    public function afiliados()
    {
        return $this->hasMany(Afiliado::class, 'suscripcion_id');
    }

    /**
     * Relación con los recuerdos seleccionados.
     */
    public function recuerdos()
    {
        return $this->belongsToMany(Recuerdo::class, 'suscripcion_recuerdos')
                    ->withPivot('costo_unitario')
                    ->withTimestamps();
    }
}
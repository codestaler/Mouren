<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServicioFunerario extends Model
{
    use HasFactory;

    protected $table = 'servicios_funerarios';

    protected $fillable = [
        'afiliado_id',
        'mascota_id',
        'fecha_inicio',
        'cancion_id',
        'observaciones'
    ];

    // Relación con la canción elegida
    public function cancion() {
        return $this->belongsTo(Cancion::class, 'cancion_id');
    }

    // Relación si el servicio es para una persona
    public function afiliado() {
        return $this->belongsTo(Afiliado::class, 'afiliado_id');
    }

    // Relación si el servicio es para una mascota
    public function mascota() {
        return $this->belongsTo(Mascota::class, 'mascota_id');
    }

    // Historial de trazabilidad del servicio (etapas por las que ha pasado)
    public function trazabilidades() {
        return $this->hasMany(\App\Models\Procesos\TrazabilidadServicio::class, 'servicio_funerario_id');
    }

    // Ceremonias programadas para este servicio
    public function ceremonias() {
        return $this->hasMany(Ceremonia::class, 'servicio_funerario_id');
    }
}
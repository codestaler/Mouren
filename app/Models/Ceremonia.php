<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ceremonia extends Model
{
    use HasFactory;

    protected $table = 'ceremonias';

    protected $fillable = [
        'servicio_funerario_id',
        'sala_velacion_id',
        'fecha_hora',
        'observaciones'
    ];

    // Relación con el servicio funerario
    public function servicioFunerario()
    {
        return $this->belongsTo(ServicioFunerario::class, 'servicio_funerario_id');
    }

    // Relación con la sala asignada
    public function salaVelacion()
    {
        return $this->belongsTo(SalaVelacion::class, 'sala_velacion_id');
    }
}
<?php

namespace App\Models\Procesos;

use Illuminate\Database\Eloquent\Model;

class EtapaServicio extends Model
{
    protected $table = 'etapas_servicio';
    protected $fillable = ['nombre'];

    // Relación: Una etapa puede aparecer en muchos registros de trazabilidad
    public function trazabilidades()
    {
        return $this->hasMany(TrazabilidadServicio::class, 'etapa_id');
    }
}
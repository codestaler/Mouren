<?php

namespace App\Models\Procesos;

use Illuminate\Database\Eloquent\Model;
use App\Models\User; // Asegúrate de que este sea el camino a tu modelo de usuarios

class TrazabilidadServicio extends Model
{
    protected $table = 'trazabilidad_servicio';
    protected $fillable = [
        'servicio_funerario_id', 
        'etapa_id', 
        'descripcion', 
        'fecha', 
        'usuario_responsable'
    ];

    // Relaciones para "armar" la historia del servicio 🔗
    public function etapa() { return $this->belongsTo(EtapaServicio::class, 'etapa_id'); }
    public function responsable() { return $this->belongsTo(User::class, 'usuario_responsable'); }
}
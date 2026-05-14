<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Personalizacion extends Model
{
    protected $table = 'personalizaciones';
    protected $fillable = ['servicio_funerario_id', 'servicio_id', 'configuracion'];

    // Esto convierte el JSON de la base de datos en un array de PHP automáticamente
    protected $casts = [
        'configuracion' => 'array',
    ];

    public function servicioFunerario() {
        return $this->belongsTo(ServicioFunerario::class);
    }
}
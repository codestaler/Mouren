<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Personalizacion extends Model
{
    protected $table = 'personalizaciones';
    protected $fillable = [
    'suscripcion_id',
    'servicio_funerario_id',
    'servicio_id',
    'afiliado_id', // 🆕 para que cada afiliado pueda tener la suya propia
    'configuracion'
];

    // Esto convierte el JSON de la base de datos en un array de PHP automáticamente
    protected $casts = [
        'configuracion' => 'array',
    ];

    public function servicioFunerario() {
        return $this->belongsTo(ServicioFunerario::class);
    }

    public function suscripcion()
    {
        return $this->belongsTo(Suscripcion::class);
    }

    // 🆕
    public function afiliado()
    {
        return $this->belongsTo(Afiliado::class);
    }
}

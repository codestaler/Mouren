<?php

namespace App\Models\Pagos;

use Illuminate\Database\Eloquent\Model;
use App\Models\Suscripcion; // Referencia a tu modelo de Suscripciones

class Factura extends Model
{
    protected $table = 'facturas';
    protected $fillable = ['suscripcion_id', 'fecha_emision', 'fecha_vencimiento', 'total', 'estado_factura_id'];

    // Relación: Una factura pertenece a una suscripción
    public function suscripcion()
    {
        return $this->belongsTo(Suscripcion::class);
    }

    // Relación: Una factura tiene un estado
    public function estado()
    {
        return $this->belongsTo(EstadoFactura::class, 'estado_factura_id');
    }
}
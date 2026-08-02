<?php

namespace App\Models\Pagos;

use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    protected $table = 'pagos';
    protected $fillable = [
        'factura_id', 
        'metodo_pago_id', 
        'fecha_pago', 
        'monto', 
        'estado',
        'referencia_mercadopago',
    ];

    // Relación: El pago pertenece a una factura específica
    public function factura()
    {
        return $this->belongsTo(Factura::class);
    }

    // Relación: El pago se realizó con un método específico
    public function metodoPago()
    {
        return $this->belongsTo(MetodoPago::class, 'metodo_pago_id');
    }

    protected $casts = [
    'fecha_pago' => 'datetime',
];
}
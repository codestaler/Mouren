<?php

namespace App\Models\Pagos;

use Illuminate\Database\Eloquent\Model;
use App\Models\Suscripcion; // Referencia a tu modelo de Suscripciones

class Factura extends Model
{
    protected $table = 'facturas';
    protected $fillable = ['suscripcion_id', 'fecha_emision', 'fecha_vencimiento', 'total', 'estado_factura_id'];

    // 💡 IMPORTANTE: Esto hace que cada vez que envíes la factura a React (Inertia),
    // se incluyan automáticamente los campos de saldo y monto_pagado sin tener que hacer cargas manuales.
    protected $appends = ['monto_pagado', 'saldo_pendiente'];

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

    // 🆕 NUEVA RELACIÓN: Una factura puede registrar muchos pagos (abonos parciales)
    public function pagos()
    {
        return $this->hasMany(Pago::class, 'factura_id');
    }

    // 🆕 ATRIBUTO DINÁMICO: Suma todos los abonos exitosos que ha tenido esta factura
    public function getMontoPagadoAttribute()
    {
        return $this->pagos()->where('estado', 'aprobado')->sum('monto');
    }

    // 🆕 ATRIBUTO DINÁMICO: Resta el total original menos lo que ya se abonó
    public function getSaldoPendienteAttribute()
    {
        $saldo = $this->total - $this->monto_pagado;
        return $saldo < 0 ? 0 : $saldo; // Evita números negativos por si acaso
    }
}
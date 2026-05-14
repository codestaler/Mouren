<?php

namespace App\Models\Pagos;

use Illuminate\Database\Eloquent\Model;

class MetodoPago extends Model
{
    protected $table = 'metodos_pago';
    protected $fillable = ['nombre'];

    // Relación: Un método de pago puede estar en muchos registros de pagos
    public function pagos()
    {
        return $this->hasMany(Pago::class, 'metodo_pago_id');
    }
}
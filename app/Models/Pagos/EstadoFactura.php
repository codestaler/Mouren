<?php

namespace App\Models\Pagos;

use Illuminate\Database\Eloquent\Model;

class EstadoFactura extends Model
{
    protected $table = 'estados_factura';
    protected $fillable = ['nombre'];

    // Relación: Un estado puede pertenecer a muchas facturas
    public function facturas()
    {
        return $this->hasMany(Factura::class, 'estado_factura_id');
    }
}
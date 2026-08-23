<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetaIngreso extends Model
{
    protected $table = 'metas_ingresos';

    protected $fillable = [
        'mes',
        'anio',
        'monto',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model {
    protected $table = 'planes';
    protected $fillable = ['nombre', 'descripcion', 'cuota_base', 'max_afiliados', 'activo'];
}

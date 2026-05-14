<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoDocumento extends Model
{
    // Aquí le decimos qué columnas puede llenar el usuario
    protected $table = 'tipos_documento';
    protected $fillable = ['nombre'];
}
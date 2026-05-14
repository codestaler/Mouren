<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoUsuario extends Model
{
    // Aquí le decimos qué columnas puede llenar el usuario
    protected $table = 'tipos_usuario';
    protected $fillable = ['nombre'];
}

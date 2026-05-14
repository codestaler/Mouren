<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recuerdo extends Model
{
    protected $fillable = [
    'nombre', 
    'descripcion', 
    'precio_adicional', 
    'imagen' // Aquí guardarás algo como "recuerdos/llavero.jpg"
];
}

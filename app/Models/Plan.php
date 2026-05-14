<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // Falta esta importación
use Illuminate\Database\Eloquent\Model;

class Plan extends Model {

    use HasFactory;
    
    protected $table = 'planes';

    // Ajusté los campos para que coincidan con tu lógica de negocio
    protected $fillable = [
        'nombre', 
        'descripcion', 
        'cuota_base', 
        'max_afiliados', 
        'activo'
    ];
}
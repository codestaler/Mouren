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

    public function servicios()
    {
        // 'plan_servicio' es el nombre de tu tabla intermedia
        return $this->belongsToMany(Servicio::class, 'plan_servicio', 'plan_id', 'servicio_id')
                    ->withPivot('cantidad') // Por si quieres usar la columna cantidad
                    ->withTimestamps();
    }

    
}
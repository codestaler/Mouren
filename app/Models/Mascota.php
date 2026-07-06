<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mascota extends Model
{
    protected $table = 'mascotas';
    
    // Actualizamos 'persona_id' por 'user_id' en el fillable
    protected $fillable = [
    'nombre',
    'especie_id',
    'raza_id',
    'fecha_nacimiento',
    'user_id',
    'suscripcion_id',
    'estado'
];

    public function dueño() {
        // Ahora la mascota pertenece a un Usuario (User)
        return $this->belongsTo(User::class, 'user_id');
    }

    public function especie() {
        return $this->belongsTo(Especie::class, 'especie_id');
    }
    public function raza() {
    return $this->belongsTo(Raza::class, 'raza_id');
}
}
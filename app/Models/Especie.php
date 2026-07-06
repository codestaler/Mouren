<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Especie extends Model
{
    protected $table = 'especies';
    protected $fillable = ['nombre'];

    public function razas()
    {
        return $this->hasMany(Raza::class, 'especie_id'); 
        // 💡 Nota: Cambia 'especie_id' si el campo de la clave foránea 
        // en tu tabla 'razas' se llama de otra manera.
    }
}

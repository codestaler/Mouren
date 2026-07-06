<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Raza extends Model
{
    protected $fillable = ['nombre', 'especie_id'];

public function especie() {
    return $this->belongsTo(Especie::class);
}
}

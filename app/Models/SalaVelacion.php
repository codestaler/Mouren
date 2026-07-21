<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaVelacion extends Model
{
    use HasFactory;

    protected $table = 'salas_velacion';

    protected $fillable = ['nombre', 'estado'];

    public function ceremonias()
    {
        return $this->hasMany(Ceremonia::class, 'sala_velacion_id');
    }
}
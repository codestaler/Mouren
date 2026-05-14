<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cancion extends Model
{
    use HasFactory;

    protected $table = 'canciones'; // Confirmamos el nombre de la tabla

    protected $fillable = [
        'titulo',
        'artista',
        'genero_musical',
        'archivo_audio'
    ];
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Planservicio extends Model
{
    use HasFactory;

    protected $table = 'plan_servicio'; // Asegúrate que coincida con tu migración

    protected $fillable = [
        'plan_id',
        'servicio_id',
        'cantidad'
    ];
}
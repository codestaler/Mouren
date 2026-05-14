<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Token extends Model
{
    use HasFactory;

    protected $fillable = [
        'usuario_id',
        'token',
        'tipo',
        'fecha_expiracion',
        'usado'
    ];

    public function usuario() {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
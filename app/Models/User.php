<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // Campos que permitimos llenar masivamente
    protected $fillable = [
        'nombre',
        'cedula',
        'tipo_documento_id',
        'fecha_nacimiento',
        'genero_id',
        'telefono',
        'email',
        'password',
        'estado_id',
        'tipo_usuario_id',
    ];

    // Ocultamos la contraseña en las respuestas JSON por seguridad 🔒
    protected $hidden = [
        'password',
        'remember_token',
    ];
}
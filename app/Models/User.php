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
        'avatar', 'idioma', 'tema', 'notificaciones_activadas',
'two_factor_secret', 'two_factor_confirmed_at',
    ];

    // 👇 NUEVA relación
    public function genero()
    {
        return $this->belongsTo(Genero::class);
    }

    public function suscripciones()
    {
        return $this->hasMany(Suscripcion::class, 'usuario_id');
    }


    public function afiliados()
{
    return $this->hasMany(Afiliado::class, 'user_id');
}
    // Ocultamos la contraseña en las respuestas JSON por seguridad 🔒
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function estado()
    {
        return $this->belongsTo(EstadoUsuario::class, 'estado_id');
    }

    public function tipoDocumento()
    {
        return $this->belongsTo(TipoDocumento::class, 'tipo_documento_id');
    }

    public function tieneDosPasosActivo(): bool
{
    return !is_null($this->two_factor_confirmed_at);
}
}
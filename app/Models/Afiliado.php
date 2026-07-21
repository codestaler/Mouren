<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Afiliado extends Model
{
    use HasFactory;

    protected $table = 'afiliados';

    protected $fillable = [
        'suscripcion_id',
        'user_id',
        'nombre', // Este campo es vital para guardar lo que escribes en el formulario
        'parentesco',
        'estado',
        'fecha_fallecimiento',
        'genero_id',
        'tipo_documento_id',
        'cedula',
        'fecha_nacimiento',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'fecha_fallecimiento' => 'date',
    ];

    /**
     * Relación con el Usuario (Titular de la cuenta)
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relación con la Suscripción a la que pertenece este afiliado
     */
    public function suscripcion()
    {
        return $this->belongsTo(Suscripcion::class, 'suscripcion_id');
    }

    /**
     * Relación con el Género del afiliado
     */
    public function genero()
    {
        return $this->belongsTo(Genero::class, 'genero_id');
    }

    /**
     * Relación con el Tipo de Documento del afiliado
     */
    public function tipoDocumento()
    {
        return $this->belongsTo(TipoDocumento::class, 'tipo_documento_id');
    }

    public function servicioFunerario()
    {
        // Un afiliado tiene un servicio funerario vinculado
        return $this->hasOne(ServicioFunerario::class, 'afiliado_id');
    }

    
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuscripcionRecuerdo extends Model
{
    use HasFactory;

    protected $table = 'suscripcion_recuerdos';

    protected $fillable = [
        'suscripcion_id',
        'recuerdo_id',
        'costo_unitario'
    ];

    public function suscripcion()
    {
        return $this->belongsTo(Suscripcion::class);
    }

    public function recuerdo()
    {
        return $this->belongsTo(Recuerdo::class);
    }
}
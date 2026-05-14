<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanRecuerdo extends Model
{
    protected $table = 'plan_recuerdos';
    protected $fillable = ['plan_id', 'recuerdo_id'];

    public function plan() { return $this->belongsTo(Plan::class); }
    public function recuerdo() { return $this->belongsTo(Recuerdo::class); }
}
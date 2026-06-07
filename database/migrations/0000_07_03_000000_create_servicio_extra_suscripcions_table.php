<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('servicios_extras_suscripcion', function (Blueprint $table) {
        $table->id();
        $table->foreignId('suscripcion_id')->constrained('suscripciones')->onDelete('cascade');
        $table->foreignId('servicio_id')->constrained('servicios')->onDelete('cascade');
        $table->decimal('precio_pagado', 10, 2); // Lo que costó el extra al contratar
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servicio_extra_suscripcions');
    }
};

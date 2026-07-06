<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salas_velacion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100); // Ejemplo: "Sala Celestial", "Sala Mouri"
            $table->string('estado', 50)->default('Disponible'); // Disponible, Ocupada, Mantenimiento
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salas_velacion');
    }
};
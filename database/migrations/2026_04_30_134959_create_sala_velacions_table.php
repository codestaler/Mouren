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
        Schema::create('salas_velacion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100); // 👈 Agregamos el nombre de la sala
            $table->string('estado', 50)->default('Disponible'); // 👈 Agregamos el estado
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salas_velacion');
    }
};
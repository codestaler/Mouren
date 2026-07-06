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
    Schema::create('razas', function (Blueprint $table) {
        $table->id();
        $table->string('nombre');
        // Conectamos cada raza a su especie (ej: Pastor Alemán pertenece a Perro)
        $table->foreignId('especie_id')->constrained('especies')->onDelete('cascade');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('razas');
    }
};

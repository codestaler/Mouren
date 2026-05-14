<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
    Schema::create('canciones', function (Blueprint $table) {
        $table->id();
        $table->string('titulo');
        $table->string('artista')->nullable();
        $table->string('genero_musical')->nullable(); // Ej: Sacra, Instrumental, Piano
        $table->string('archivo_audio')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cancions');
    }
};

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
    Schema::create('recuerdos', function (Blueprint $table) {
        $table->id();
        $table->string('nombre'); // Ej: Recordatorio impreso, Llavero, Semilla
        $table->text('descripcion')->nullable();
        $table->decimal('precio_adicional', 10, 2)->default(0);
        $table->string('imagen')->nullable(); // nullable por si no todos tienen foto
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recuerdos');
    }
};

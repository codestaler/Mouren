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
    Schema::create('afiliados', function (Blueprint $table) {
    $table->id();
    $table->foreignId('suscripcion_id')->constrained('suscripciones');
    // Ahora debe apuntar a 'users'
        $table->foreignId('user_id')->constrained('users');
    $table->string('parentesco', 50);
    $table->string('estado', 50);
    $table->date('fecha_fallecimiento')->nullable();
    $table->timestamps();
});
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('afiliados');
    }
};

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
    Schema::create('mascotas', function (Blueprint $table) {
        $table->id();
        $table->string('nombre', 100);
        $table->foreignId('especie_id')->constrained('especies');
        $table->string('raza', 100)->nullable();
        $table->date('fecha_nacimiento')->nullable();
        // Ahora debe apuntar a 'users'
        $table->foreignId('user_id')->constrained('users');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mascotas');
    }
};

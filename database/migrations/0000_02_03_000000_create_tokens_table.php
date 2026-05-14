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
    Schema::create('tokens', function (Blueprint $table) {
        $table->id();
        $table->foreignId('usuario_id')->constrained('users'); // Usando la tabla default de Laravel
        $table->string('token', 255);
        $table->string('tipo', 50);
        $table->datetime('fecha_expiracion');
        $table->boolean('usado')->default(false);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tokens');
    }
};

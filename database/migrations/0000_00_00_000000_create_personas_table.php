<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up() {
    Schema::create('personas', function (Blueprint $table) {
        $table->id();
        $table->string('nombre', 100);
        $table->string('cedula', 20)->unique();
        $table->date('fecha_nacimiento');
        $table->string('telefono', 20);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personas');
    }
};

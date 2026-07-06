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
        Schema::table('mascotas', function (Blueprint $table) {
            // Añade la columna para conectar la mascota con su plan de Huella Eterna
            $table->foreignId('suscripcion_id')->nullable()->constrained('suscripciones')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mascotas', function (Blueprint $table) {
            // Por si necesitas hacer un rollback, eliminamos la relación y la columna
            $table->dropForeign(['suscripcion_id']);
            $table->dropColumn('suscripcion_id');
        });
    }
};
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
        Schema::create('facturas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('suscripcion_id')->constrained('suscripciones');
    $table->date('fecha_emision');
    $table->date('fecha_vencimiento');
    $table->decimal('total', 10, 2);
    $table->foreignId('estado_factura_id')->constrained('estados_factura');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facturas');
    }
};

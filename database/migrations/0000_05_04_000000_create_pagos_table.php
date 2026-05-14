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
       Schema::create('pagos', function (Blueprint $table) {
    $table->id();
    $table->foreignId('factura_id')->constrained('facturas');
    $table->foreignId('metodo_pago_id')->constrained('metodos_pago');
    $table->datetime('fecha_pago');
    $table->decimal('monto', 10, 2);
    $table->string('estado', 50); // Ej: "Completado", "Rechazado"
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};

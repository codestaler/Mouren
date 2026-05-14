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
    Schema::create('servicios_funerarios', function (Blueprint $table) {
    $table->id();
    $table->foreignId('afiliado_id')->nullable()->constrained('afiliados');
    $table->foreignId('mascota_id')->nullable()->constrained('mascotas');
    $table->datetime('fecha_inicio');
    $table->foreignId('cancion_id')->constrained('canciones');
    $table->text('observaciones')->nullable();
    $table->timestamps();
});
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servicio_funerarios');
    }
};

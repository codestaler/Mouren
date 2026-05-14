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
        Schema::create('trazabilidad_servicio', function (Blueprint $table) {
    $table->id();
    $table->foreignId('servicio_funerario_id')->constrained('servicios_funerarios');
    $table->foreignId('etapa_id')->constrained('etapas_servicio');
    $table->text('descripcion');
    $table->datetime('fecha');
    $table->foreignId('usuario_responsable')->constrained('users'); // Ajusta a 'users' si ese es el nombre
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trazabilidad_servicios');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ceremonias', function (Blueprint $table) {
            $table->id();
            // Se conecta con tu modelo existente 'servicios_funerarios'
            $table->foreignId('servicio_funerario_id')->constrained('servicios_funerarios')->onDelete('cascade');

            // Se conecta con la sala que creamos en el Paso 1 (puede ser null si es externa)
            $table->foreignId('sala_velacion_id')->nullable()->constrained('salas_velacion')->onDelete('set null');

            $table->dateTime('fecha_hora'); // Fecha y hora del evento
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ceremonias');
    }
};
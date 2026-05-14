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
    Schema::create('personalizaciones', function (Blueprint $table) {
        $table->id();
        $table->foreignId('servicio_funerario_id')->constrained('servicios_funerarios');
        $table->foreignId('servicio_id')->constrained('servicios');
        $table->json('configuracion'); 
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personalizacions');
    }
};

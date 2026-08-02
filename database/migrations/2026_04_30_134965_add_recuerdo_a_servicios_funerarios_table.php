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
        Schema::table('servicios_funerarios', function (Blueprint $table) {
            // Cada servicio funerario (de un afiliado O de una mascota) tiene su propio recuerdo
            $table->foreignId('recuerdo_id')->nullable()->after('cancion_id')->constrained('recuerdos')->nullOnDelete();
            // Guardamos el precio pagado en el momento de la selección, igual que haces con precio_pagado
            $table->decimal('costo_recuerdo', 10, 2)->nullable()->after('recuerdo_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('servicios_funerarios', function (Blueprint $table) {
            $table->dropConstrainedForeignId('recuerdo_id');
            $table->dropColumn('costo_recuerdo');
        });
    }
};
